/**
 * useAuth — React hook for accessing current user session data.
 *
 * Usage:
 *   const { user, isLoading } = useAuth();
 *
 * The hook reads from the route context that is populated by the _app loader.
 * This means auth data is available synchronously on every page inside /_app.
 */
import { useRouteContext } from "@tanstack/react-router";
import type { SessionUser } from "@/lib/auth/auth-fns";

export interface AuthContext {
  user: SessionUser | null;
}

export function useAuth(): AuthContext {
  // Auth data is injected via the _app route context
  const context = useRouteContext({ from: "/_app" }) as {
    user?: SessionUser | null;
  };
  return {
    user: context.user ?? null,
  };
}
