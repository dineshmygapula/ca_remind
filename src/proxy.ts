

import { NextRequest, NextResponse } from "next/server";


const SESSION_COOKIE = "__session";

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


export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = isAuthenticated(req);

  if (authed && (pathname === "/" || isPublicPath(pathname))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname === "/") {
    return NextResponse.next();
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
   
    "/((?!_next/static|_next/image|favicon.ico|favicon/|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
