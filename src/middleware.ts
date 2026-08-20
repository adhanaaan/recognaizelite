import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/") return;

  const host = req.headers.get("host") ?? "";
  if (host.includes("act4health")) {
    return NextResponse.redirect(new URL("/act4health", req.url));
  }
  if (host.includes("brainscantesting")) {
    return NextResponse.redirect(new URL("/lite-one", req.url));
  }
}

export const config = { matcher: "/" };
