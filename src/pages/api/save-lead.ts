import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { liteTableFor } from "src/server/liteFunnels";
import { deliverLiteResultEmail, emailEnabledForClinic } from "src/server/liteLeadEmail";
import { AGE_RANGES, GENDERS, getSupabaseAdmin } from "src/utils/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Each clinic has its own table. The dispatcher routes by `clinic` value.
//   sjmc        → public.leads             (existing, with (clinic, email_lower) unique constraint)
//   hookikigai  → public.hookikigai_leads  (new, no dedup)
//   healthtechx → public.demo_leads        (new, B2B columns, no dedup)
//   tcmbrain    → public.tcmbrain_leads    (new, B2C + TCM indices, no dedup)
//   sjmcmandarin→ public.leads             (Mandarin SJMC variant; segmented by clinic column)
//   liteone     → public.liteone_leads     (ReCOGnAIze Lite; own table so retakes aren't
//                                           swallowed by the (clinic, email_lower) dedup
//                                           that only `leads` still carries. Rows are
//                                           created by /api/lite-attempt at game end and
//                                           updated here when contact details arrive.)
//   liteworldalz→ public.liteworldalz_leads(World Alzheimer's Month email campaign; a copy
//                                           of the liteone funnel with an identical row
//                                           shape, kept apart so campaign traffic never
//                                           blends into the /lite-one baseline.)
//   liteclinician→ public.liteclinician_leads (clinician-facing copy of the same
//                                           funnel; own table so a clinician
//                                           audience never dilutes the consumer
//                                           funnels' conversion numbers.)
//   litetwo     → public.litetwo_leads      (the /lite-two funnel: /lite-one's flow with
//                                           the personalised v2 report; own table so its
//                                           numbers never blend into the /lite-one
//                                           baseline.)
//   act4health  → public.act4health_leads   (the ACT4Health partner funnel: /lite-two's
//                                           flow co-branded for the clinic; own table so
//                                           partner traffic reads clean.)
const ALLOWED_CLINICS = new Set(["sjmc", "hookikigai", "healthtechx", "tcmbrain", "sjmcmandarin", "novi", "liteone", "liteworldalz", "liteclinician", "litetwo", "act4health"]);

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

  // --- Clinic + contact channel ---
  // SJMC's Banting Community Day audience skews senior; many can't recall an
  // email on the spot. For the SJMC funnels we accept "email OR WhatsApp"; all
  // other clinics still require email.
  const SJMC_CLINICS = new Set(["sjmc", "sjmcmandarin"]);

  const clinic = str(body.clinic);
  if (!clinic || !ALLOWED_CLINICS.has(clinic)) {
    return res.status(400).json({ error: "Unsupported clinic" });
  }

  const emailRaw = str(body.email);
  if (emailRaw && !EMAIL_RE.test(emailRaw)) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  if (!emailRaw && !SJMC_CLINICS.has(clinic)) {
    return res.status(400).json({ error: "Invalid email address" });
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

  // Optional WhatsApp / LINE follow-up channel. Novi stores a LINE ID
  // (free-text, no phone-number validation); all other clinics normalise
  // to "+digits" and validate 8-16 digit length.
  const whatsappRaw = str(body.whatsapp);
  let whatsapp: string | null = null;
  if (whatsappRaw) {
    if (clinic === "novi") {
      whatsapp = whatsappRaw;
    } else {
      const cleaned = whatsappRaw
        .replace(/[^\d+]/g, "")
        .replace(/(?!^)\+/g, "");
      const digits = cleaned.replace(/^\+/, "");
      if (digits.length < 8 || digits.length > 16) {
        return res.status(400).json({ error: "Invalid WhatsApp number" });
      }
      whatsapp = cleaned;
    }
  }

  // SJMC funnels: require at least one contact channel.
  if (SJMC_CLINICS.has(clinic) && !emailRaw && !whatsapp) {
    return res.status(400).json({ error: "Please provide an email or WhatsApp number" });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error("Supabase not configured:", err);
    return res.status(500).json({ error: "Lead storage is not configured" });
  }

  const sharedRow = {
    email: emailRaw, // nullable for SJMC clinics when WhatsApp is supplied instead
    whatsapp,
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

    // Brain Health Quiz fields (added with /demo-questions). All optional —
    // legacy direct hits to /demo-report still post without these and the
    // row inserts cleanly. Shape: brain_health_score 0-100, risk 0-68,
    // symptom 0-32, band one of {low,moderate,elevated,high}, persona one
    // of {neutral,highPerformer,perimenopausal,caregiver}. quiz_answers is
    // a JSONB answers map keyed by questionId.
    const ALLOWED_BANDS = new Set(["low", "moderate", "elevated", "high"]);
    const ALLOWED_PERSONAS = new Set([
      "neutral",
      "highPerformer",
      "perimenopausal",
      "caregiver",
    ]);

    const brainHealthScore = num(body.brainHealthScore);
    if (
      brainHealthScore !== null &&
      (brainHealthScore < 0 || brainHealthScore > 100 || !Number.isFinite(brainHealthScore))
    ) {
      return res.status(400).json({ error: "Invalid brainHealthScore" });
    }

    const riskScoreRaw = num(body.riskScore);
    if (riskScoreRaw !== null && (riskScoreRaw < 0 || riskScoreRaw > 68)) {
      return res.status(400).json({ error: "Invalid riskScore" });
    }

    const symptomScoreRaw = num(body.symptomScore);
    if (symptomScoreRaw !== null && (symptomScoreRaw < 0 || symptomScoreRaw > 32)) {
      return res.status(400).json({ error: "Invalid symptomScore" });
    }

    const band = str(body.band);
    if (band && !ALLOWED_BANDS.has(band)) {
      return res.status(400).json({ error: "Invalid band" });
    }

    const persona = str(body.persona);
    if (persona && !ALLOWED_PERSONAS.has(persona)) {
      return res.status(400).json({ error: "Invalid persona" });
    }

    const quizAnswers =
      body.quizAnswers && typeof body.quizAnswers === "object" && !Array.isArray(body.quizAnswers)
        ? (body.quizAnswers as Record<string, unknown>)
        : null;

    const demoRow = {
      ...sharedRow,
      role,
      organization,
      organization_type: organizationType,
      cognitive_interest: cognitiveInterest,
      quiz_answers: quizAnswers,
      brain_health_score: brainHealthScore,
      risk_score: riskScoreRaw,
      symptom_score: symptomScoreRaw,
      band,
      persona,
    };

    let { error } = await supabase.from("demo_leads").insert(demoRow);

    // Schema-cache fallback for older deploys that pre-date migration 009.
    // Strip the Brain Health Quiz columns and retry so legacy environments
    // still accept the lead.
    if (error && error.message?.includes("schema cache")) {
      const {
        quiz_answers: _qa,
        brain_health_score: _bhs,
        risk_score: _rs,
        symptom_score: _ss,
        band: _b,
        persona: _p,
        ...legacyRow
      } = demoRow;
      void _qa; void _bhs; void _rs; void _ss; void _b; void _p;
      const retry = await supabase.from("demo_leads").insert(legacyRow);
      error = retry.error;
    }

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

  const liteTable = liteTableFor(clinic);
  if (liteTable) {
    // The row usually already exists: /api/lite-attempt wrote it when the game
    // finished. Attaching contact details to that row is what turns an attempt
    // into a lead, and it keeps the game's own `created_at` rather than
    // restamping it with the moment they got round to typing an email.
    const attemptId = str(body.attemptId);

    const nameVal = str(body.name);
    if (nameVal && nameVal.length > 200) {
      return res.status(400).json({ error: "Name too long" });
    }

    const ALLOWED_BANDS = new Set(["low", "moderate", "elevated", "high"]);
    const ALLOWED_PERSONAS = new Set(["neutral", "highPerformer", "perimenopausal", "caregiver"]);

    const brainHealthScore = num(body.brainHealthScore);
    if (brainHealthScore !== null && (brainHealthScore < 0 || brainHealthScore > 100)) {
      return res.status(400).json({ error: "Invalid brainHealthScore" });
    }
    const riskScoreRaw = num(body.riskScore);
    if (riskScoreRaw !== null && (riskScoreRaw < 0 || riskScoreRaw > 68)) {
      return res.status(400).json({ error: "Invalid riskScore" });
    }
    const symptomScoreRaw = num(body.symptomScore);
    if (symptomScoreRaw !== null && (symptomScoreRaw < 0 || symptomScoreRaw > 32)) {
      return res.status(400).json({ error: "Invalid symptomScore" });
    }
    const band = str(body.band);
    if (band && !ALLOWED_BANDS.has(band)) {
      return res.status(400).json({ error: "Invalid band" });
    }
    const persona = str(body.persona);
    if (persona && !ALLOWED_PERSONAS.has(persona)) {
      return res.status(400).json({ error: "Invalid persona" });
    }
    const quizAnswers =
      body.quizAnswers && typeof body.quizAnswers === "object" && !Array.isArray(body.quizAnswers)
        ? (body.quizAnswers as Record<string, unknown>)
        : null;

    const contactRow = {
      name: nameVal,
      email: emailRaw,
      whatsapp,
      age_range: ageRangeRaw,
      gender: genderRaw,
      quiz_answers: quizAnswers,
      brain_health_score: brainHealthScore,
      risk_score: riskScoreRaw,
      symptom_score: symptomScoreRaw,
      band,
      persona,
      completed_at: new Date().toISOString(),
    };

    /**
     * Mails the visitor their result and adds them to the campaign Audience.
     *
     * Called only on a path that already wrote the row — the lead is the
     * deliverable, the email is the follow-up. It is awaited rather than
     * fired-and-forgotten because a serverless function may be frozen the
     * moment the response is sent; deliverLiteResultEmail bounds its own
     * network calls so the visitor never waits long on it, and it swallows its
     * own failures so nothing here can turn a saved lead into a 500.
     */
    const deliverResultEmail = async (rowAttemptId: string) => {
      if (!emailRaw || !emailEnabledForClinic(clinic)) return;
      try {
        await deliverLiteResultEmail({
          supabase,
          clinic,
          table: liteTable,
          attemptId: rowAttemptId,
          email: emailRaw,
          name: nameVal,
          percentile,
          severity,
          brainHealthScore,
          band,
          campaign: utm_campaign,
        });
      } catch (err) {
        console.error("Resend delivery threw unexpectedly:", err);
      }
    };

    if (attemptId && UUID_RE.test(attemptId)) {
      let { data, error } = await supabase
        .from(liteTable)
        .update(contactRow)
        .eq("attempt_id", attemptId)
        .select("id");

      if (error && error.message?.includes("schema cache")) {
        const { name: _n, quiz_answers: _qa, brain_health_score: _bhs, risk_score: _rs, symptom_score: _ss, band: _b, persona: _p, ...legacyRow } = contactRow;
        void _n; void _qa; void _bhs; void _rs; void _ss; void _b; void _p;
        const retry = await supabase.from(liteTable).update(legacyRow).eq("attempt_id", attemptId).select("id");
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error(`Supabase update (${liteTable}) failed:`, error);
        return res.status(500).json({ error: "Failed to save lead", detail: error.message });
      }
      if (data && data.length > 0) {
        await deliverResultEmail(attemptId);
        return res.status(200).json({ success: true });
      }
    }

    // The update either didn't apply or there was no usable attempt id, so the
    // lead becomes its own row. Resolved once, because the email step needs the
    // same key the row was written under.
    const resolvedAttemptId = attemptId && UUID_RE.test(attemptId) ? attemptId : randomUUID();

    const fullRow = {
      ...sharedRow,
      ...contactRow,
      attempt_id: resolvedAttemptId,
    };

    let { error } = await supabase.from(liteTable).insert(fullRow);

    if (error && error.message?.includes("schema cache")) {
      const { name: _n, quiz_answers: _qa, brain_health_score: _bhs, risk_score: _rs, symptom_score: _ss, band: _b, persona: _p, ...legacyRow } = fullRow;
      void _n; void _qa; void _bhs; void _rs; void _ss; void _b; void _p;
      const retry = await supabase.from(liteTable).insert(legacyRow);
      error = retry.error;
    }

    if (error) {
      console.error(`Supabase insert (${liteTable}) failed:`, error);
      return res.status(500).json({ error: "Failed to save lead", detail: error.message });
    }

    await deliverResultEmail(resolvedAttemptId);
    return res.status(200).json({ success: true });
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

  if (clinic === "tcmbrain") {
    // TCM-specific indices, both 1-10 inclusive integers.
    const dampnessIndex = num(body.dampnessIndex);
    if (dampnessIndex !== null && (!Number.isInteger(dampnessIndex) || dampnessIndex < 1 || dampnessIndex > 10)) {
      return res.status(400).json({ error: "Invalid dampness index (must be 1-10)" });
    }

    const bloodStasisIndex = num(body.bloodStasisIndex);
    if (bloodStasisIndex !== null && (!Number.isInteger(bloodStasisIndex) || bloodStasisIndex < 1 || bloodStasisIndex > 10)) {
      return res.status(400).json({ error: "Invalid blood stasis index (must be 1-10)" });
    }

    const { error } = await supabase.from("tcmbrain_leads").insert({
      ...sharedRow,
      age_range: ageRangeRaw,
      gender: genderRaw,
      dampness_index: dampnessIndex,
      blood_stasis_index: bloodStasisIndex,
    });

    if (error) {
      console.error("Supabase insert (tcmbrain_leads) failed:", error);
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

  // Schema-cache fallback for older deploys that pre-date health_goal /
  // takes_supplements / whatsapp. Each retry sheds the most-recently-added
  // columns until the insert succeeds against whatever schema is live.
  if (error && error.message?.includes("schema cache")) {
    const retry = await supabase.from("leads").insert(sjmcBaseRow);
    error = retry.error;
  }
  if (error && error.message?.includes("schema cache")) {
    const { whatsapp: _drop, ...withoutWhatsapp } = sjmcBaseRow;
    void _drop;
    const retry = await supabase.from("leads").insert(withoutWhatsapp);
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
