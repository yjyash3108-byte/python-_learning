import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/api/config";

/** Redirect through this route to clear the session cookie (allowed in Route Handlers). */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/login?expired=1";
  const target = next.startsWith("/") ? next : "/login?expired=1";
  const response = NextResponse.redirect(new URL(target, request.url));
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}
