/**
 * Server functions for authentication.
 * Use these from React components via useServerFn or direct call in loaders.
 */
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { getSessionConfig, type SessionUser } from "@/lib/auth/session";

export type { SessionUser };

/**
 * Server function: returns the current session user, or null if not logged in.
 * Safe to call from any loader or component via useServerFn.
 */
export const getSessionUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => {
    const session = await useSession<{ user?: SessionUser }>(getSessionConfig());
    return session.data.user ?? null;
  }
);
