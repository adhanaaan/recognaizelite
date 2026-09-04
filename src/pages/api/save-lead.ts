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
//   litebcgolf  → public.litebcgolf_leads   (the Business China golf tournament funnel:
//                                           a one-day event link, so its numbers are a
//                                           single afternoon rather than a campaign.)
const ALLOWED_CLINICS = new Set(["sjmc", "hookikigai", "healthtechx", "tcmbrain", "sjmcmandarin", "novi", "liteone", "liteworldalz", "liteclinician", "litetwo", "act4health", "litebcgolf", "liteevent"]);

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

/**
 * A consent tickbox. Absent means "never asked" rather than "declined", which
 * is why this returns null instead of false: a funnel that has no consent
 * screen must not write rows that read as a refusal.
 */
function bool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  return null;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/**
 * PostgREST's message for a column the deployed table doesn't have:
 * "Could not find the 'consent_analytics' column of 'liteevent_leads' in the
 * schema cache".
 */
const SCHEMA_CACHE_COLUMN_RE = /Could not find the '([^']+)' column/i;

type WriteResult<T> = {
  data: T | null;
  error: { message?: string; code?: string } | null;
};

/**
 * Runs a write and, when the deployed table pre-dates one of the row's
 * columns, drops that one column and tries again — repeating until the row
 * fits the schema that is actually live.
 *
 * The blanket fallback this replaces shed every column added after a table's
 * first migration in a single retry, so an environment missing (say) the
 * consent columns silently also lost the visitor's quiz answers, brain-health
 * score, band and persona. Dropping only the column the error names keeps
 * everything the table can hold, which is the difference between a lead row
 * with `quiz_answers` NULL and one that actually carries the quiz.
 *
 * Bounded by the row's own column count, so a message we can't parse — or a
 * column that reappears — ends the loop rather than spinning on it.
 */
async function writeSheddingUnknownColumns<T>(
  row: Record<string, unknown>,
  write: (r: Record<string, unknown>) => PromiseLike<WriteResult<T>>
): Promise<WriteResult<T>> {
  const current = { ...row };
  let result = await write(current);

  for (let attempt = 0; attempt < Object.keys(row).length; attempt++) {
    if (!result.error?.message?.includes("schema cache")) break;
    const missing = SCHEMA_CACHE_COLUMN_RE.exec(result.error.message)?.[1];
    if (!missing || !(missing in current)) break;
    console.warn(`Column "${missing}" is missing from the live schema; retrying without it.`);
    delete current[missing];
    result = await write(current);
  }

  return result;
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

    // Schema-cache fallback for older deploys that pre-date migration 009:
    // whichever Brain Health Quiz column the live table lacks is dropped, one
    // at a time, so a legacy environment still accepts the lead — and keeps
    // every column it does have.
    const { error } = await writeSheddingUnknownColumns(demoRow, (row) =>
      supabase.from("demo_leads").insert(row)
    );

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

    /**
     * Consents, all three optional. /parkway is the first funnel to ask: two
     * tickboxes on the lead form (campaign analytics, which is required there,
     * and the newsletter opt-in) and the partner's own consent on the screen
     * after it. The other lite funnels post none of these and their rows keep
     * NULL, which is the honest value for a question never put to the visitor.
     *
     * consent_at is stamped only when at least one of them arrives, so it
     * dates the consent rather than the row.
     */
    const consentAnalytics = bool(body.consentAnalytics);
    const consentMarketing = bool(body.consentMarketing);
    const consentPartner = bool(body.consentPartner);
    const askedForConsent =
      consentAnalytics !== null || consentMarketing !== null || consentPartner !== null;

    // Typed with every key optional so the columns can be left out entirely
    // rather than written as explicit NULLs — an update from a funnel that
    // never asks must not blank a consent another screen recorded.
    const consentRow: {
      consent_analytics?: boolean | null;
      consent_marketing?: boolean | null;
      consent_partner?: boolean | null;
      consent_at?: string | null;
    } = askedForConsent
      ? {
          consent_analytics: consentAnalytics,
          consent_marketing: consentMarketing,
          consent_partner: consentPartner,
          consent_at: new Date().toISOString(),
        }
      : {};

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
      ...consentRow,
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
      // Schema-cache fallback, as below: an environment that pre-dates
      // migration 011 (quiz columns) or 019 (consent) still takes the lead,
      // minus only the columns its table is actually missing.
      const { data, error } = await writeSheddingUnknownColumns(contactRow, (row) =>
        supabase.from(liteTable).update(row).eq("attempt_id", attemptId).select("id")
      );

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

    const { error } = await writeSheddingUnknownColumns(fullRow, (row) =>
      supabase.from(liteTable).insert(row)
    );

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

  // Schema-cache fallback for older deploys that pre-date health_goal /
  // takes_supplements / whatsapp. Each retry sheds the one column the live
  // table is missing, until the insert succeeds against whatever schema is
  // there.
  const { error } = await writeSheddingUnknownColumns(
    {
      ...sjmcBaseRow,
      health_goal: healthGoalRaw,
      takes_supplements: takesSupplementsRaw,
    },
    (row) => supabase.from("leads").insert(row)
  );

  if (error) {
    if (error.code === "23505") {
      return res.status(200).json({ success: true, duplicate: true });
    }
    console.error("Supabase insert (leads) failed:", error);
    return res.status(500).json({ error: "Failed to save lead", detail: error.message });
  }

  return res.status(200).json({ success: true });
}
