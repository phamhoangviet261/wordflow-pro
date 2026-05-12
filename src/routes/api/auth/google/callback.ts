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
    }),
  );
}

export const Route = createFileRoute("/api/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        const baseUrl = getBaseUrl();

        // --- Error from Google ---
        if (error) {
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/login?error=oauth_denied` },
          });
        }

        if (!code || !state) {
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/login?error=missing_params` },
          });
        }

        // --- CSRF state check ---
        const cookieHeader = request.headers.get("cookie") ?? "";
        const cookies = parseCookies(cookieHeader);
        const savedState = cookies["oauth_state"];

        if (!savedState || savedState !== state) {
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/login?error=state_mismatch` },
          });
        }

        try {
          // --- Exchange code for tokens ---
          const tokens = await exchangeCodeForTokens(code);

          // --- Fetch Google user info ---
          const googleUser = await fetchGoogleUserInfo(tokens.access_token);

          if (!googleUser.email_verified) {
            return new Response(null, {
              status: 302,
              headers: {
                Location: `${baseUrl}/login?error=email_not_verified`,
              },
            });
          }

          // --- Upsert user in DB ---
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

          // --- Upsert OAuth account record ---
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

          // --- Initialize Gamification & Quests ---
          // 1. Ensure Gamification record exists
          await db.gamification.upsert({
            where: { userId: user.id },
            update: {},
            create: {
              userId: user.id,
              streak: 0,
              bestStreak: 0,
            },
          });

          // 2. Assign initial quests (if any templates exist)
          const templates = await db.questTemplate.findMany({
            where: { isActive: true },
          });

          if (templates.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const template of templates) {
              await db.userQuest.upsert({
                where: {
                  userId_templateId_assignedDate: {
                    userId: user.id,
                    templateId: template.id,
                    assignedDate: today,
                  },
                },
                update: {},
                create: {
                  userId: user.id,
                  templateId: template.id,
                  assignedDate: today,
                  progress: 0,
                  completed: false,
                  claimed: false,
                },
              });
            }
          }

          // 3. Record Login
          await db.userLogin.create({
            data: {
              userId: user.id,
              ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || null,
              userAgent: request.headers.get("user-agent") || null,
            },
          });

          // 4. Initialize 'Vocabulary Set Starter'
          const starterSet = await db.vocabSet.findFirst({
            where: {
              createdBy: user.id,
              title: "Vocabulary Set Starter",
            },
          });

          if (!starterSet) {
            const newStarter = await db.vocabSet.create({
              data: {
                title: "Vocabulary Set Starter",
                description: "Bộ từ vựng mặc định để lưu trữ tất cả các từ bạn đã thêm.",
                color: "from-blue-400 to-indigo-500",
                createdBy: user.id,
                isSystem: false,
                isPublic: false,
                status: "published",
              },
            });

            // Automatically unlock for the user
            await db.userVocabSet.create({
              data: {
                userId: user.id,
                vocabSetId: newStarter.id,
                progressPercent: 0,
              },
            });
          }

          // --- Create sealed session ---
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

          // Clear state cookie and redirect home
          return new Response(null, {
            status: 302,
            headers: {
              Location: `${baseUrl}/`,
              "Set-Cookie": "oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
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
