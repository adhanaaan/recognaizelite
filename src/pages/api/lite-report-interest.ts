import type { NextApiRequest, NextApiResponse } from "next";
import { liteInterestTableFor } from "src/server/liteFunnels";
import { getSupabaseAdmin } from "src/utils/supabase";

/**
 * Records what a visitor did with the CTA at the foot of a lite report.
 *
 * Two controls post here, both from /lite-event-template/report: the
 * "I'm interested" button under the three steps, and the "Send me brain health
 * tips" tickbox in the "What happens next" card. Each call carries whichever
 * of the two changed — the button sends `interested: true` once, the tickbox
 * sends `tipsOptIn` every time it flips — and is upserted onto one row per run,
 * keyed by the same `attempt_id` the lead row carries. Only the columns in the
 * payload are written on conflict, so a tickbox change never resets the button
 * and vice versa. See db/migrations/020_liteevent_report_interest.sql for the
 * shape and the three states each flag can be read as.
 *
 * No PII crosses this route: the row joins back to the lead on attempt_id.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A route prefix as LiteVariant.basePath has it: "/lite-event-template". */
const FUNNEL_RE = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/i;
const FUNNEL_MAX_LEN = 64;

const LANGS = new Set(["en", "zh", "ms"]);

function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Absent means "not this call", not false — only a real boolean is written. */
function bool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
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

  const table = liteInterestTableFor(str(body.clinic));
  if (!table) {
    return res.status(400).json({ error: "Unsupported clinic" });
  }

  // The upsert key, and a uuid column — reject anything that isn't one rather
  // than letting Postgres throw a type error.
  const attemptId = str(body.attemptId);
  if (!attemptId || !UUID_RE.test(attemptId)) {
    return res.status(400).json({ error: "Invalid attempt id" });
  }

  const interested = bool(body.interested);
  const tipsOptIn = bool(body.tipsOptIn);
  if (interested === null && tipsOptIn === null) {
    return res.status(400).json({ error: "Nothing to record" });
  }

  const funnel = str(body.funnel);
  if (funnel && (funnel.length > FUNNEL_MAX_LEN || !FUNNEL_RE.test(funnel))) {
    return res.status(400).json({ error: "Invalid funnel" });
  }

  const lang = str(body.lang);
  if (lang && !LANGS.has(lang)) {
    return res.status(400).json({ error: "Invalid language" });
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

  const now = new Date().toISOString();

  // Only what this call is about goes in the payload: on conflict the upsert
  // overwrites exactly these columns, so leaving the other flag out is what
  // keeps it as it was. `created_at` is never sent, so it keeps the first
  // interaction's time.
  const row: Record<string, unknown> = {
    attempt_id: attemptId,
    clinic: str(body.clinic),
    funnel,
    utm_campaign: str(utm.campaign),
    lang,
    user_agent: str(req.headers["user-agent"]),
    ip_region:
      str(req.headers["x-vercel-ip-country"]) || str(req.headers["x-vercel-ip-country-region"]),
    updated_at: now,
  };
  if (interested !== null) {
    row.interested = interested;
    row.interested_at = interested ? now : null;
  }
  if (tipsOptIn !== null) {
    row.tips_opt_in = tipsOptIn;
    row.tips_opt_in_at = now;
  }

  const { error } = await supabase.from(table).upsert(row, { onConflict: "attempt_id" });

  if (error) {
    console.error(`Supabase upsert (${table}) failed:`, error);
    return res.status(500).json({ error: "Failed to record interest", detail: error.message });
  }

  return res.status(200).json({ success: true });
}
