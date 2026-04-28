import type { NextApiRequest, NextApiResponse } from "next";
import { AGE_RANGES, GENDERS, getSupabaseAdmin } from "src/utils/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// SJMC is the primary funnel. `hookikigai` stays on the allowlist so the
// existing Ikigai capture keeps working against the unified Supabase table.
const ALLOWED_CLINICS = new Set(["sjmc", "hookikigai"]);

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

  // --- Required fields ---
  const emailRaw = str(body.email);
  if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const clinic = str(body.clinic);
  if (!clinic || !ALLOWED_CLINICS.has(clinic)) {
    return res.status(400).json({ error: "Unsupported clinic" });
  }

  // --- Optional but validated ---
  const ageRangeRaw = str(body.ageRange);
  if (ageRangeRaw && !(AGE_RANGES as readonly string[]).includes(ageRangeRaw)) {
    return res.status(400).json({ error: "Invalid age range" });
  }

  const genderRaw = str(body.gender);
  if (genderRaw && !(GENDERS as readonly string[]).includes(genderRaw)) {
    return res.status(400).json({ error: "Invalid gender" });
  }

  const score = num(body.score);
  const percentile = num(body.percentile);
  const severity = str(body.severity);

  const utm =
    typeof body.utm === "object" && body.utm !== null ? (body.utm as Record<string, unknown>) : {};
  const utm_source = str(utm.source);
  const utm_medium = str(utm.medium);
  const utm_campaign = str(utm.campaign);

  const HEALTH_GOALS = ["stay_sharp", "improve_focus", "prevent_decline", "longevity"] as const;
  const SUPPLEMENT_OPTIONS = ["yes_regularly", "occasionally", "no_but_interested", "no"] as const;

  const healthGoalRaw = str(body.healthGoal);
  if (healthGoalRaw && !(HEALTH_GOALS as readonly string[]).includes(healthGoalRaw)) {
    return res.status(400).json({ error: "Invalid health goal" });
  }

  const takesSupplementsRaw = str(body.takesSupplements);
  if (takesSupplementsRaw && !(SUPPLEMENT_OPTIONS as readonly string[]).includes(takesSupplementsRaw)) {
    return res.status(400).json({ error: "Invalid supplements option" });
  }

  const referrer = str(body.referrer);
  const user_agent = str(req.headers["user-agent"]);
  const ip_region =
    str(req.headers["x-vercel-ip-country"]) || str(req.headers["x-vercel-ip-country-region"]);

  // --- Insert ---
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error("Supabase not configured:", err);
    return res.status(500).json({ error: "Lead storage is not configured" });
  }

  const baseRow = {
    email: emailRaw,
    clinic,
    age_range: ageRangeRaw,
    gender: genderRaw,
    score,
    percentile,
    severity,
    utm_source,
    utm_medium,
    utm_campaign,
    referrer,
    user_agent,
    ip_region,
  };

  let { error } = await supabase.from("leads").insert({
    ...baseRow,
    health_goal: healthGoalRaw,
    takes_supplements: takesSupplementsRaw,
  });

  // If the new columns don't exist yet, retry without them
  if (error && error.message?.includes("schema cache")) {
    const retry = await supabase.from("leads").insert(baseRow);
    error = retry.error;
  }

  if (error) {
    // Unique violation (clinic + email_lower) → treat as duplicate, not an error.
    if (error.code === "23505") {
      return res.status(200).json({ success: true, duplicate: true });
    }
    console.error("Supabase insert failed:", error);
    return res.status(500).json({ error: "Failed to save lead", detail: error.message });
  }

  return res.status(200).json({ success: true });
}
