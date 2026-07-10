import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isLiveMode(): boolean {
  if (process.env.CDI_DATA_MODE) return process.env.CDI_DATA_MODE === "live";
  return process.env.NODE_ENV === "production";
}

export function middleware(request: NextRequest) {
  if (!isLiveMode()) return NextResponse.next();
  if (request.nextUrl.pathname === "/api/health") return NextResponse.next();

  const accessTokenCookie =
    process.env.CDI_ACCESS_TOKEN_COOKIE ?? "decionis_access_token";
  const orgIdCookie = process.env.CDI_ORG_ID_COOKIE ?? "decionis_org_id";
  const hasToken = Boolean(request.cookies.get(accessTokenCookie)?.value);
  const hasOrg = Boolean(request.cookies.get(orgIdCookie)?.value);
  if (hasToken && hasOrg) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "A Decionis session is required" },
      { status: 401 },
    );
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("returnTo", request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sign-in).*)"],
};
