/**
 * lib/session.ts
 *
 * Thin helpers to write / clear the `__session` cookie that middleware.ts reads.
 *
 * The cookie holds a Firebase ID token (JWT). It is:
 *  - SameSite=Strict  → no CSRF risk
 *  - Secure in production
 *  - NOT HttpOnly → the client needs to write it (Firebase is client-only)
 *
 * We intentionally keep this cookie short-lived (1 hour, matching Firebase
 * token expiry). AuthContext will call `setSessionCookie` on every
 * `onIdTokenChanged` event, which Firebase fires on sign-in, sign-out, and
 * automatic token refresh, so the cookie stays in sync.
 */

const COOKIE_NAME = "__session";
const MAX_AGE_SECONDS = 60 * 60; // 1 hour – mirrors Firebase ID token lifetime

function isSecure(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.protocol === "https:"
  );
}

export function setSessionCookie(token: string): void {
  const secure = isSecure() ? "; Secure" : "";
  document.cookie = [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${MAX_AGE_SECONDS}`,
    "Path=/",
    "SameSite=Strict",
    secure,
  ].join("; ");
}

export function clearSessionCookie(): void {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Strict`;
}
