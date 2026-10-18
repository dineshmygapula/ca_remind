

import { NextRequest, NextResponse } from "next/server";

// ── Constants ────────────────────────────────────────────────────────────────

/** Cookie written by the client after every Firebase sign-in / token refresh. */
const SESSION_COOKIE = "__session";

/** Routes that unauthenticated users are allowed to visit. */
const PUBLIC_PATHS = ["/login", "/signup"] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isAuthenticated(req: NextRequest): boolean {
  return !!req.cookies.get(SESSION_COOKIE)?.value;
}

// ── Proxy (formerly Middleware) ──────────────────────────────────────────────

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = isAuthenticated(req);


  if (authed && isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!authed && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
