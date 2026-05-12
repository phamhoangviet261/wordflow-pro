/**
 * Google OAuth 2.0 helper — no third-party auth library required.
 * All secrets are read from VITE_* env vars (set in .env / .dev.vars).
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function getGoogleClientId(): string {
  const id =
    (import.meta.env as Record<string, string | undefined>).VITE_GOOGLE_CLIENT_ID ??
    process.env.VITE_GOOGLE_CLIENT_ID ??
    process.env.GOOGLE_CLIENT_ID ??
    "";
  if (!id) throw new Error("VITE_GOOGLE_CLIENT_ID is not set");
  return id;
}

function getGoogleClientSecret(): string {
  const secret =
    (import.meta.env as Record<string, string | undefined>).VITE_GOOGLE_CLIENT_SECRET ??
    process.env.VITE_GOOGLE_CLIENT_SECRET ??
    process.env.GOOGLE_CLIENT_SECRET ??
    "";
  if (!secret) throw new Error("VITE_GOOGLE_CLIENT_SECRET is not set");
  return secret;
}

function getBaseUrl(): string {
  return (
    (import.meta.env as Record<string, string | undefined>).VITE_AUTH_URL ??
    process.env.VITE_AUTH_URL ??
    process.env.AUTH_URL ??
    "http://localhost:8080"
  );
}

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: `${getBaseUrl()}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface GoogleTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<GoogleTokens> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: `${getBaseUrl()}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }

  return res.json() as Promise<GoogleTokens>;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export async function fetchGoogleUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google userinfo fetch failed: ${text}`);
  }

  return res.json() as Promise<GoogleUserInfo>;
}
