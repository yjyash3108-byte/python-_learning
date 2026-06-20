import { type NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/signup"];
const PROTECTED_PREFIXES = ["/feed", "/profile", "/connections", "/messages"];
const SESSION_COOKIE = "scholarnet_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionUserId = request.cookies.get(SESSION_COOKIE)?.value;
  const isLoggedIn = Boolean(sessionUserId);

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/feed";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
