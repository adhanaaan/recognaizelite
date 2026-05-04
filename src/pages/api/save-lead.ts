import type { NextApiRequest, NextApiResponse } from "next";
import { AGE_RANGES, GENDERS, getSupabaseAdmin } from "src/utils/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Each clinic has its own table. The dispatcher routes by `clinic` value.
//   sjmc        → public.leads             (existing, with (clinic, email_lower) unique constraint)
//   hookikigai  → public.hookikigai_leads  (new, no dedup)
//   healthtechx → public.demo_leads        (new, B2B columns, no dedup)
const ALLOWED_CLINICS = new Set(["sjmc", "hookikigai", "healthtechx"]);

const HEALTH_GOALS = ["stay_sharp", "improve_focus", "prevent_decline", "longevity"] as const;
const SUPPLEMENT_OPTIONS = ["yes_regularly", "occasionally", "no_but_interested", "no"] as const;
const ROLE_OPTIONS = [
  "clinician", "executive", "investor", "pharma",
  "vendor", "researcher", "press", "other",
] as const;
const ORG_TYPE_OPTIONS = [
  "hospital", "clinic", "payer", "pharma",
  "startup", "academic", "government", "other",
] as const;

const ORGANIZATION_MAX_LEN = 200;
const COGNITIVE_INTEREST_MAX_LEN = 1000;

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

  // --- Required: email + clinic ---
  const emailRaw = str(body.email);
  if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const clinic = str(body.clinic);
  if (!clinic || !ALLOWED_CLINICS.has(clinic)) {
    return res.status(400).json({ error: "Unsupported clinic" });
  }

  // --- Shared scoring/attribution fields ---
  const score = num(body.score);
  const percentile = num(body.percentile);
  const severity = str(body.severity);

  const utm =
    typeof body.utm === "object" && body.utm !== null ? (body.utm as Record<string, unknown>) : {};
  const utm_source = str(utm.source);
  const utm_medium = str(utm.medium);
  const utm_campaign = str(utm.campaign);

  const referrer = str(body.referrer);
  const user_agent = str(req.headers["user-agent"]);
  const ip_region =
    str(req.headers["x-vercel-ip-country"]) || str(req.headers["x-vercel-ip-country-region"]);

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error("Supabase not configured:", err);
    return res.status(500).json({ error: "Lead storage is not configured" });
  }

  const sharedRow = {
    email: emailRaw,
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

  if (clinic === "healthtechx") {
    // B2B funnel — role + organization required-shape (validated client-side too).
    const role = str(body.role);
    if (role && !(ROLE_OPTIONS as readonly string[]).includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const organization = str(body.organization);
    if (organization && organization.length > ORGANIZATION_MAX_LEN) {
      return res.status(400).json({ error: "Organization too long" });
    }

    const organizationType = str(body.organizationType);
    if (organizationType && !(ORG_TYPE_OPTIONS as readonly string[]).includes(organizationType)) {
      return res.status(400).json({ error: "Invalid organization type" });
    }

    const cognitiveInterest = str(body.cognitiveInterest);
    if (cognitiveInterest && cognitiveInterest.length > COGNITIVE_INTEREST_MAX_LEN) {
      return res.status(400).json({ error: "Cognitive interest note too long" });
    }

    const { error } = await supabase.from("demo_leads").insert({
      ...sharedRow,
      role,
      organization,
      organization_type: organizationType,
      cognitive_interest: cognitiveInterest,
    });

    if (error) {
      console.error("Supabase insert (demo_leads) failed:", error);
      return res.status(500).json({ error: "Failed to save lead", detail: error.message });
    }

    return res.status(200).json({ success: true });
  }

  // sjmc + hookikigai both capture consumer demographics.
  const ageRangeRaw = str(body.ageRange);
  if (ageRangeRaw && !(AGE_RANGES as readonly string[]).includes(ageRangeRaw)) {
    return res.status(400).json({ error: "Invalid age range" });
  }

  const genderRaw = str(body.gender);
  if (genderRaw && !(GENDERS as readonly string[]).includes(genderRaw)) {
    return res.status(400).json({ error: "Invalid gender" });
  }

  const healthGoalRaw = str(body.healthGoal);
  if (healthGoalRaw && !(HEALTH_GOALS as readonly string[]).includes(healthGoalRaw)) {
    return res.status(400).json({ error: "Invalid health goal" });
  }

  if (clinic === "hookikigai") {
    const { error } = await supabase.from("hookikigai_leads").insert({
      ...sharedRow,
      age_range: ageRangeRaw,
      gender: genderRaw,
      health_goal: healthGoalRaw,
    });

    if (error) {
      console.error("Supabase insert (hookikigai_leads) failed:", error);
      return res.status(500).json({ error: "Failed to save lead", detail: error.message });
    }

    return res.status(200).json({ success: true });
  }

  // sjmc — legacy `leads` table still has the (clinic, email_lower) unique constraint
  // and the takes_supplements column.
  const takesSupplementsRaw = str(body.takesSupplements);
  if (takesSupplementsRaw && !(SUPPLEMENT_OPTIONS as readonly string[]).includes(takesSupplementsRaw)) {
    return res.status(400).json({ error: "Invalid supplements option" });
  }

  const sjmcBaseRow = {
    ...sharedRow,
    clinic,
    age_range: ageRangeRaw,
    gender: genderRaw,
  };

  let { error } = await supabase.from("leads").insert({
    ...sjmcBaseRow,
    health_goal: healthGoalRaw,
    takes_supplements: takesSupplementsRaw,
  });

  // Schema-cache fallback for older deploys that pre-date health_goal/takes_supplements.
  if (error && error.message?.includes("schema cache")) {
    const retry = await supabase.from("leads").insert(sjmcBaseRow);
    error = retry.error;
  }

  if (error) {
    if (error.code === "23505") {
      return res.status(200).json({ success: true, duplicate: true });
    }
    console.error("Supabase insert (leads) failed:", error);
    return res.status(500).json({ error: "Failed to save lead", detail: error.message });
  }

  return res.status(200).json({ success: true });
}
