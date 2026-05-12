import { useSession } from "@tanstack/react-start/server";

export interface SessionUser {
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
}

/**
 * Build the session config at call-time so Vite has already injected
 * import.meta.env.VITE_AUTH_SECRET before we read it.
 */
export function getSessionConfig() {
  const secret =
    (import.meta.env as Record<string, string | undefined>).VITE_AUTH_SECRET ??
    process.env.VITE_AUTH_SECRET ??
    process.env.AUTH_SECRET ??
    "fallback-secret-change-in-production-32chars";

  return {
    password: secret,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    name: "vocalab_session",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export function getAuthSession() {
  return useSession<{ user?: SessionUser }>(getSessionConfig());
}
