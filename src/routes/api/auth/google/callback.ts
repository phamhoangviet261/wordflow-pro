/**
 * GET /api/auth/google/callback
 * Handles the Google OAuth callback:
 * 1. Validates state param against CSRF cookie
 * 2. Exchanges code for tokens
 * 3. Fetches Google user info
 * 4. Upserts user + account in Prisma DB
 * 5. Creates a sealed session cookie
 * 6. Redirects to home
 */
import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { exchangeCodeForTokens, fetchGoogleUserInfo } from "@/lib/auth/google";
import { db } from "@/lib/db";
import { getSessionConfig } from "@/lib/auth/session";

function getBaseUrl(): string {
  return (
    (import.meta.env as Record<string, string | undefined>).VITE_AUTH_URL ??
    process.env.VITE_AUTH_URL ??
    process.env.AUTH_URL ??
    "http://localhost:8080"
  );
}

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const idx = c.indexOf("=");
      return [c.slice(0, idx).trim(), c.slice(idx + 1).trim()];
    })
  );
}

export const Route = createFileRoute("/api/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        console.log("[AUTH_CALLBACK] Started handler");
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        console.log("[AUTH_CALLBACK] Params:", { 
          hasCode: !!code, 
          hasState: !!state, 
          error 
        });

        const baseUrl = getBaseUrl();

        // --- Error from Google ---
        if (error) {
          console.error("[AUTH_CALLBACK] Google OAuth error:", error);
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/login?error=oauth_denied` },
          });
        }

        if (!code || !state) {
          console.error("[AUTH_CALLBACK] Missing code or state");
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/login?error=missing_params` },
          });
        }

        // --- CSRF state check ---
        console.log("[AUTH_CALLBACK] Checking CSRF state");
        const cookieHeader = request.headers.get("cookie") ?? "";
        const cookies = parseCookies(cookieHeader);
        const savedState = cookies["oauth_state"];

        console.log("[AUTH_CALLBACK] CSRF check:", {
          savedState: savedState ? "exists" : "missing",
          stateMatch: savedState === state
        });

        if (!savedState || savedState !== state) {
          console.error("[AUTH_CALLBACK] OAuth state mismatch — potential CSRF");
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/login?error=state_mismatch` },
          });
        }

        try {
          // --- Exchange code for tokens ---
          console.log("[AUTH_CALLBACK] Exchanging code for tokens");
          const tokens = await exchangeCodeForTokens(code);
          console.log("[AUTH_CALLBACK] Tokens received successfully");

          // --- Fetch Google user info ---
          console.log("[AUTH_CALLBACK] Fetching user info from Google");
          const googleUser = await fetchGoogleUserInfo(tokens.access_token);
          console.log("[AUTH_CALLBACK] Google user info fetched:", { 
            email: googleUser.email,
            verified: googleUser.email_verified 
          });

          if (!googleUser.email_verified) {
            console.warn("[AUTH_CALLBACK] Email not verified");
            return new Response(null, {
              status: 302,
              headers: {
                Location: `${baseUrl}/login?error=email_not_verified`,
              },
            });
          }

          // --- Upsert user in DB ---
          console.log("[AUTH_CALLBACK] Upserting user in DB:", googleUser.email);
          const user = await db.user.upsert({
            where: { email: googleUser.email },
            update: {
              name: googleUser.name,
              image: googleUser.picture,
            },
            create: {
              email: googleUser.email,
              name: googleUser.name,
              image: googleUser.picture,
              emailVerified: new Date(),
            },
          });
          console.log("[AUTH_CALLBACK] User upserted, ID:", user.id);

          // --- Upsert OAuth account record ---
          console.log("[AUTH_CALLBACK] Upserting OAuth account record");
          await db.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: googleUser.sub,
              },
            },
            update: {
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token ?? null,
              expires_at: tokens.expires_in
                ? Math.floor(Date.now() / 1000) + tokens.expires_in
                : null,
            },
            create: {
              userId: user.id,
              type: "oauth",
              provider: "google",
              providerAccountId: googleUser.sub,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token ?? null,
              expires_at: tokens.expires_in
                ? Math.floor(Date.now() / 1000) + tokens.expires_in
                : null,
              token_type: tokens.token_type,
              scope: "openid email profile",
              id_token: tokens.id_token,
            },
          });
          console.log("[AUTH_CALLBACK] Account record upserted");

          // --- Create sealed session ---
          console.log("[AUTH_CALLBACK] Creating/Updating session");
          const session = await useSession<{
            user?: { userId: string; email: string; name: string | null; image: string | null };
          }>(getSessionConfig());

          await session.update({
            user: {
              userId: user.id,
              email: user.email ?? "",
              name: user.name ?? null,
              image: user.image ?? null,
            },
          });
          console.log("[AUTH_CALLBACK] Session updated successfully");

          // Clear state cookie and redirect home
          console.log("[AUTH_CALLBACK] Redirecting to home");
          return new Response(null, {
            status: 302,
            headers: {
              Location: `${baseUrl}/`,
              "Set-Cookie":
                "oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
            },
          });
        } catch (err) {
          console.error("[AUTH_CALLBACK] Caught error:", err);
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/login?error=server_error` },
          });
        }
      },
    },
  },
});
