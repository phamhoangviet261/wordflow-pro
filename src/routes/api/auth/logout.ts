/**
 * POST /api/auth/logout
 * Clears the session cookie and redirects to /login.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { getSessionConfig } from "@/lib/auth/session";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async () => {
        const session = await useSession(getSessionConfig());
        await session.clear();

        const baseUrl =
          (import.meta.env as Record<string, string | undefined>).VITE_AUTH_URL ??
          process.env.VITE_AUTH_URL ??
          process.env.AUTH_URL ??
          "http://localhost:8080";

        return new Response(null, {
          status: 302,
          headers: { Location: `${baseUrl}/login` },
        });
      },
    },
  },
});
