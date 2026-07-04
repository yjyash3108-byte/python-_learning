import { type NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/api/config";

const ONBOARDING_ROUTE = "/onboarding";
const PUBLIC_PREFIXES = ["/u/", "/about", "/contact", "/faq", "/privacy", "/terms", "/verify-email", "/login", "/signup", "/forgot-password", "/reset-password"];
const PROTECTED_PREFIXES = [
  "/feed",
  "/profile",
  "/connections",
  "/messages",
  "/projects",
  "/clubs",
  "/schools",
  "/opportunities",
  "/achievements",
  "/leaderboard",
  "/resume",
  "/settings",
  "/upgrade",
  "/subscription",
  "/admin",
  "/notifications",
  "/search",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const atMatch = pathname.match(/^\/@([a-z0-9_]+)$/i);
  if (atMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/u/${atMatch[1].toLowerCase()}`;
    return NextResponse.rewrite(url);
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const isLoggedIn = Boolean(token);

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isOnboarding = pathname.startsWith(ONBOARDING_ROUTE);
  const isProtected =
    isOnboarding || PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth/clear-session|api/backend|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
