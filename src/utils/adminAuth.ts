import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage, ServerResponse } from "http";

// Server-side admin auth using an HMAC-signed cookie.
// Two env vars are required:
//   ADMIN_PASSWORD       — the shared password for the admin UI
//   ADMIN_COOKIE_SECRET  — a random 32+ byte secret used to sign the session cookie

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecrets() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!password || !secret) {
    throw new Error(
      "Admin env vars missing. Set ADMIN_PASSWORD and ADMIN_COOKIE_SECRET."
    );
  }
  return { password, secret };
}

/** Compute the HMAC token that represents a valid admin session. */
export function signToken(): string {
  const { password, secret } = getSecrets();
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

/** Constant-time comparison to defeat timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Check a submitted password against ADMIN_PASSWORD. */
export function verifyPassword(submitted: string): boolean {
  const { password } = getSecrets();
  if (typeof submitted !== "string" || submitted.length === 0) return false;
  return timingSafeEqual(submitted, password);
}

/** Parse the admin session cookie from a request. */
function readSessionCookie(req: IncomingMessage): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const parts = raw.split(";");
  for (const part of parts) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE_NAME) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

/** True iff the request carries a valid admin session cookie. */
export function verifyAdminCookie(req: IncomingMessage): boolean {
  try {
    const cookie = readSessionCookie(req);
    if (!cookie) return false;
    return timingSafeEqual(cookie, signToken());
  } catch {
    return false;
  }
}

function buildCookie(value: string, maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAge}`,
    secure,
  ]
    .filter(Boolean)
    .join("; ");
}

/** Set the admin session cookie on a response. */
export function setAdminCookie(res: NextApiResponse | ServerResponse): void {
  const token = signToken();
  res.setHeader("Set-Cookie", buildCookie(token, COOKIE_MAX_AGE));
}

/** Clear the admin session cookie on a response. */
export function clearAdminCookie(res: NextApiResponse | ServerResponse): void {
  res.setHeader("Set-Cookie", buildCookie("", 0));
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
