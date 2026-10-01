import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSafeReturnUrl } from "@/lib/auth-redirect";

const protectedPrefixes = ["/user", "/admin"];
const guestOnlyRoutes = ["/login", "/register"];
const matchesRoutePrefix = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export function proxy(request: NextRequest) {
  const isProtectedRoute = protectedPrefixes.some((prefix) => matchesRoutePrefix(request.nextUrl.pathname, prefix));
  const isGuestOnlyRoute = guestOnlyRoutes.includes(request.nextUrl.pathname.replace(/\/$/, ""));
  const token = request.cookies.get("auth_token")?.value;

  if (isGuestOnlyRoute && token) {
    return NextResponse.redirect(new URL(getSafeReturnUrl(request.nextUrl.search), request.url));
  }

  if (!isProtectedRoute) return NextResponse.next();
  if (token) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "returnUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/login", "/register"],
};
