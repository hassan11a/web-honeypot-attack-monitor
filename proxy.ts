import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { config as appConfig } from "@/lib/config";

const PUBLIC_PATHS = new Set(["/login", "/setup", "/api/auth/login", "/api/setup", "/api/auth/session"]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next") || pathname.includes(".")) return true;
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const hasSession = Boolean(request.cookies.get(appConfig.sessionCookieName)?.value);
  if (!hasSession) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL(`${appConfig.basePath}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-hp-auth", "session");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
