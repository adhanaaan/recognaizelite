import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname === "/" &&
    req.headers.get("host")?.includes("brainscantesting")
  ) {
    return NextResponse.redirect(new URL("/lite-one", req.url));
  }
}

export const config = { matcher: "/" };
