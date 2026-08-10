import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "src/utils/supabase";

/**
 * Records a finished /lite-one game before any contact details exist.
 *
 * The visitor lands on /lite-one/results the moment the 60-second clock runs
 * out, so a row here means "played the game and saw the form". `completed_at`
 * is filled in later by save-lead when they actually submit. The gap between
 * the two is the funnel's drop-off.
 *
 * No PII crosses this route — score and attribution only.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.includes("application/json")) {
    return res.status(400).json({ error: "Content-Type must be application/json" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  // attempt_id is the update key save-lead will target later, and it lands in
  // a uuid column — reject anything that isn't one rather than letting Postgres
  // throw a type error.
  const attemptId = str(body.attemptId);
  if (!attemptId || !UUID_RE.test(attemptId)) {
    return res.status(400).json({ error: "Invalid attempt id" });
  }

  const severity = str(body.severity);
  if (severity && !["low", "moderate", "high"].includes(severity)) {
    return res.status(400).json({ error: "Invalid severity" });
  }

  const percentile = num(body.percentile);
  if (percentile !== null && (percentile < 0 || percentile > 100)) {
    return res.status(400).json({ error: "Invalid percentile" });
  }

  const utm =
    typeof body.utm === "object" && body.utm !== null ? (body.utm as Record<string, unknown>) : {};

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error("Supabase not configured:", err);
    return res.status(500).json({ error: "Lead storage is not configured" });
  }

  const { error } = await supabase.from("liteone_leads").insert({
    attempt_id: attemptId,
    email: null,
    score: num(body.score),
    percentile,
    severity,
    utm_source: str(utm.source),
    utm_medium: str(utm.medium),
    utm_campaign: str(utm.campaign),
    referrer: str(body.referrer),
    user_agent: str(req.headers["user-agent"]),
    ip_region:
      str(req.headers["x-vercel-ip-country"]) || str(req.headers["x-vercel-ip-country-region"]),
  });

  if (error) {
    // A re-fire of the same attempt (refresh, double-mount in dev) is a no-op,
    // not a failure — the row already says what we wanted it to say.
    if (error.code === "23505") {
      return res.status(200).json({ success: true, duplicate: true });
    }
    console.error("Supabase insert (liteone_leads attempt) failed:", error);
    return res.status(500).json({ error: "Failed to record attempt", detail: error.message });
  }

  return res.status(200).json({ success: true });
}
