/**
 * GET /api/auth/google
 * Initiates the Google OAuth flow by redirecting to Google's auth URL.
 */
import { createFileRoute } from "@tanstack/react-router";
import { buildGoogleAuthUrl } from "@/lib/auth/google";

export const Route = createFileRoute("/api/auth/google")({
  server: {
    handlers: {
      GET: async () => {
        // Use a random state to prevent CSRF
        const state = crypto.randomUUID();

        const authUrl = buildGoogleAuthUrl(state);

        return new Response(null, {
          status: 302,
          headers: {
            Location: authUrl,
            // Store state in a short-lived cookie for verification in callback
            "Set-Cookie": `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`,
          },
        });
      },
    },
  },
});
