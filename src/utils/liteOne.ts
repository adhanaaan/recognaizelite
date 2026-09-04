import type { DomainReport } from "src/types/report";
import type { ScoreResult } from "src/types/quiz";

/**
 * Small session bridge between /lite-one/results (the lead form) and
 * /lite-one/report.
 *
 * The form fetches the domain report on mount so the lead payload can carry
 * score / percentile / severity, and so the report page paints immediately
 * instead of showing a second spinner. The report page re-fetches if the
 * stash is missing (direct hit, refresh in a new tab, etc).
 */

export const LITE_CLINIC = "liteone";
export const WORLDALZ_CLINIC = "liteworldalz";
export const CLINICIAN_CLINIC = "liteclinician";
export const LITE_TWO_CLINIC = "litetwo";
export const ACT4HEALTH_CLINIC = "act4health";
export const BCGOLF_CLINIC = "litebcgolf";
export const LITE_EVENT_CLINIC = "liteevent";

/**
 * One entry per funnel built on the lite flow. /lite-worldalzmonth is a copy of
 * /lite-one aimed at an email audience: same game, same quiz, same report, its
 * own routes and its own leads table so campaign numbers never blend into the
 * /lite-one baseline.
 *
 * Everything that differs between the two lives here, so the pages stay pure
 * copy and the util layer isn't forked.
 */
export type LiteVariant = {
  /** `clinic` sent to /api/*, and the key that picks the Supabase table. */
  clinic: string;
  /** hookClinic value written to localStorage; drives shared game theming. */
  hookClinic: string;
  /** Route prefix, no trailing slash. */
  basePath: string;
  /** utm_campaign fallback when the inbound link carries none. */
  defaultCampaign: string;
  /** sessionStorage namespace, so the two funnels can't clobber each other. */
  storagePrefix: string;
};

export const LITE_ONE: LiteVariant = {
  clinic: LITE_CLINIC,
  hookClinic: "LiteOne",
  basePath: "/lite-one",
  defaultCampaign: "lite-one",
  // Unchanged from before the variant split — /lite-one's keys must stay put.
  storagePrefix: "recognaize-lite",
};

export const LITE_WORLDALZ: LiteVariant = {
  clinic: WORLDALZ_CLINIC,
  hookClinic: "LiteWorldAlz",
  basePath: "/lite-worldalzmonth",
  defaultCampaign: "worldalzmonth",
  storagePrefix: "recognaize-walz",
};

export const LITE_CLINICIAN: LiteVariant = {
  clinic: CLINICIAN_CLINIC,
  hookClinic: "LiteClinician",
  basePath: "/lite-clinician",
  defaultCampaign: "clinician",
  storagePrefix: "recognaize-lclin",
};

export const LITE_TWO: LiteVariant = {
  clinic: LITE_TWO_CLINIC,
  hookClinic: "LiteTwo",
  basePath: "/lite-two",
  defaultCampaign: "lite-two",
  storagePrefix: "recognaize-ltwo",
};

/**
 * The Act4Health partner funnel — /lite-two's flow co-branded for ACT4Health,
 * the University of Malaya geriatric clinic in Petaling Jaya. Same game, quiz
 * and personalised report; the report's conversion path books a consultation
 * over the clinic's WhatsApp instead of selling the online assessment.
 */
export const ACT4HEALTH: LiteVariant = {
  clinic: ACT4HEALTH_CLINIC,
  hookClinic: "Act4Health",
  basePath: "/act4health",
  defaultCampaign: "act4health",
  storagePrefix: "recognaize-a4h",
};

/** Business China Fundraising Golf Tournament, 21 August 2026. */
export const LITE_BCGOLF: LiteVariant = {
  clinic: BCGOLF_CLINIC,
  hookClinic: "LiteBcGolf",
  basePath: "/lite-bcgolf",
  defaultCampaign: "bcgolf",
  storagePrefix: "recognaize-bcg",
};

/**
 * The corporate-event funnel — /lite-two's flow and report, reused across
 * booths, conferences and client days rather than tied to one date.
 *
 * defaultCampaign is the generic "event"; the point of this funnel is that
 * each occasion overrides it with its own ?utm_campaign=, so one link and one
 * table serve every event and the results still separate cleanly afterwards.
 * Unlike /lite-two it mails the result — see EMAIL_CLINICS.
 */
export const LITE_EVENT: LiteVariant = {
  clinic: LITE_EVENT_CLINIC,
  hookClinic: "LiteEvent",
  basePath: "/lite-event",
  defaultCampaign: "event",
  storagePrefix: "recognaize-levt",
};

/**
 * /lite-event-template — a working copy of the corporate-event funnel, page for
 * page, where flow changes are trialled before they are folded back into
 * /lite-event. A booth link never points here; the route exists so a change can
 * be reviewed end to end without disturbing the funnel that is out in the field.
 *
 * `clinic` stays "liteevent" on purpose: the template writes to the same
 * liteevent_leads table and mails the same event template, so a run through it
 * is a real run and nothing new has to be provisioned server-side. What it does
 * not share is `storagePrefix` — the two funnels keep separate sessionStorage
 * namespaces, so a run through the template can never overwrite the report,
 * profile or attempt id of a live run in the same browser.
 *
 * `hookClinic` stays "LiteEvent" as well, because that is what puts the shared
 * Symbol Matching screens in the Clinical Empathy palette (see
 * isLiteOneMode()). The funnels are kept apart after the game by
 * hookReportPath, which the entry page points at this basePath.
 */
export const LITE_EVENT_TEMPLATE: LiteVariant = {
  clinic: LITE_EVENT_CLINIC,
  hookClinic: "LiteEvent",
  basePath: "/lite-event-template",
  defaultCampaign: "event-template",
  storagePrefix: "recognaize-levt-tpl",
};

/**
 * /lite-event/ntuhomecoming — the event link for NTU Homecoming.
 *
 * /lite-event-template taken page for page, the report's CTA trial included,
 * so a guest sees exactly what the template shows. Nothing in its pages
 * diverges; what is this event's alone is the identifier its rows carry.
 *
 * `clinic` stays "liteevent": the link writes to liteevent_leads and
 * liteevent_report_interest and mails the event template, so nothing has to
 * be provisioned server-side. `defaultCampaign` is the database identifier —
 * every row this link writes lands with utm_campaign "ntuhomecoming" (and, in
 * the interest table, funnel "/lite-event/ntuhomecoming"), which is how the
 * evening is pulled out of the shared tables afterwards:
 *
 *   select * from liteevent_leads where utm_campaign = 'ntuhomecoming';
 *
 * `storagePrefix` keeps its sessionStorage namespace to itself, so a run here
 * can never overwrite the report, profile or attempt id of a run through
 * another funnel in the same browser. `hookClinic` stays "LiteEvent" for the
 * reason the template's does: it puts the shared Symbol Matching screens in
 * the Clinical Empathy palette (see isLiteOneMode()), and hookReportPath, which
 * the entry page points at this basePath, is what keeps the funnels apart
 * after the game.
 *
 * The route nests under /lite-event on purpose — it is one of that family's
 * occasions — and Next resolves /lite-event/ntuhomecoming to its own
 * directory without touching /lite-event's pages.
 */
export const NTU_HOMECOMING: LiteVariant = {
  clinic: LITE_EVENT_CLINIC,
  hookClinic: "LiteEvent",
  basePath: "/lite-event/ntuhomecoming",
  defaultCampaign: "ntuhomecoming",
  storagePrefix: "recognaize-levt-ntuhc",
};

/**
 * /parkway — the Parkway Shenton partner funnel.
 *
 * The flow is /lite-event-template's, taken page for page: same landing,
 * language picker, reaction-time game, quiz, lead form and personalised v2
 * report. What Parkway changes is where the report sends the reader. Instead
 * of the ReCOGnAIze upsell it closes on a consultation at one of the four
 * Parkway Shenton sites, booked over the clinic's WhatsApp line — the same
 * shape /act4health takes for its partner clinic.
 *
 * `clinic` stays "liteevent" for the reason the template's does: the funnel
 * writes to the existing liteevent_leads table and mails the existing event
 * template, so a run through it is a real run and nothing has to be
 * provisioned server-side first. `defaultCampaign` is what separates Parkway's
 * numbers from the rest of the event traffic afterwards, and `storagePrefix`
 * keeps its sessionStorage namespace to itself, so a run here can never
 * overwrite the report, profile or attempt id of a run through another funnel
 * in the same browser.
 *
 * `hookClinic` stays "LiteEvent" as well, because that is what puts the shared
 * Symbol Matching screens in the Clinical Empathy palette (see
 * isLiteOneMode()). The funnels are kept apart after the game by
 * hookReportPath, which the entry page points at this basePath.
 */
export const PARKWAY: LiteVariant = {
  clinic: LITE_EVENT_CLINIC,
  hookClinic: "LiteEvent",
  basePath: "/parkway",
  defaultCampaign: "parkway",
  storagePrefix: "recognaize-pkw",
};

const reportKey = (v: LiteVariant) => `${v.storagePrefix}-report`;
const profileKey = (v: LiteVariant) => `${v.storagePrefix}-profile`;
const attemptKey = (v: LiteVariant) => `${v.storagePrefix}-attempt`;
const quizResultKey = (v: LiteVariant) => `${v.storagePrefix}-quiz`;
const pendingLeadKey = (v: LiteVariant) => `${v.storagePrefix}-pending-lead`;
const interestKey = (v: LiteVariant) => `${v.storagePrefix}-interest`;

/**
 * The body /api/save-lead is posted, as the lead form assembles it.
 *
 * Named rather than inlined because /parkway builds it one screen before it is
 * sent: the partner consent screen stands between the form and the report, and
 * nothing may be saved or mailed until that consent is given. See
 * `stashPendingLead`.
 */
export type LiteLeadPayload = {
  clinic: string;
  attemptId: string;
  name: string;
  email: string;
  ageRange: string | null;
  gender: string | null;
  score: number | null;
  percentile: number | null;
  severity: string | null;
  quizAnswers: Record<string, unknown> | null;
  brainHealthScore: number | null;
  riskScore: number | null;
  symptomScore: number | null;
  band: string | null;
  persona: string | null;
  utm: { source: string | null; medium: string | null; campaign: string | null };
  referrer: string | null;
  /** Required tickbox on the form: campaign analytics by Gray Matter. */
  consentAnalytics: boolean;
  /** Optional tickbox on the form: brain health tips and updates. */
  consentMarketing: boolean;
  /**
   * The partner's consent, given on the screen after the form. False until
   * that screen sets it, and false in the saved row if a funnel that has no
   * partner screen never asks.
   */
  consentPartner: boolean;
};

/**
 * A lead that has been typed but not yet sent, parked between two screens.
 *
 * /parkway's form no longer posts on submit. It stashes what it has — the
 * payload plus the profile the report screens read the visitor's name from —
 * and hands off to /parkway/consent, which is where the POST (and with it the
 * result email) actually happens. Two reasons it is a stash rather than props
 * or a store: a reload of the consent screen would empty the in-memory zustand
 * stores the payload is derived from, and a visitor who backs out of that
 * screen leaves no row behind.
 *
 * Cleared by `clearPendingLead` once the POST has succeeded, so a later run in
 * the same tab can never re-send the previous visitor's details.
 */
export type PendingLiteLead = {
  payload: LiteLeadPayload;
  profile: LiteProfile;
};

export type LiteProfile = {
  name: string;
  email: string;
  ageRange: string;
  gender: string;
  /** Stashed too, because the zustand result store is in-memory and a hard
      reload of the report page would otherwise lose the number. */
  score: number | null;
  /** Raw quiz age answer ("18-29" … "60+"). `ageRange` is the leads-table
      bucket, which QUIZ_AGE_TO_LITE shifts down a band, so pages that need
      the visitor's real age band read this instead. Optional because
      profiles stashed before it existed don't carry it. */
  quizAge?: string | null;
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private-mode quota failures are not worth breaking the flow over —
    // the report page falls back to re-fetching.
  }
}

export const readStashedReport = (v: LiteVariant = LITE_ONE) =>
  readJson<DomainReport>(reportKey(v));
export const stashReport = (report: DomainReport, v: LiteVariant = LITE_ONE) =>
  writeJson(reportKey(v), report);

export const readLiteProfile = (v: LiteVariant = LITE_ONE) => readJson<LiteProfile>(profileKey(v));
export const stashLiteProfile = (profile: LiteProfile, v: LiteVariant = LITE_ONE) =>
  writeJson(profileKey(v), profile);

export const readStashedQuizResult = (v: LiteVariant = LITE_ONE) =>
  readJson<ScoreResult>(quizResultKey(v));
export const stashQuizResult = (result: ScoreResult, v: LiteVariant = LITE_ONE) =>
  writeJson(quizResultKey(v), result);

export const readPendingLead = (v: LiteVariant = LITE_ONE) =>
  readJson<PendingLiteLead>(pendingLeadKey(v));
export const stashPendingLead = (lead: PendingLiteLead, v: LiteVariant = LITE_ONE) =>
  writeJson(pendingLeadKey(v), lead);
export function clearPendingLead(v: LiteVariant = LITE_ONE) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(pendingLeadKey(v));
  } catch {
    /* nothing to clear if storage is unavailable */
  }
}

export function clearLiteSession(v: LiteVariant = LITE_ONE) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(reportKey(v));
  sessionStorage.removeItem(profileKey(v));
  sessionStorage.removeItem(quizResultKey(v));
  // A form filled in but abandoned on the consent screen must not be picked
  // up by the next run through the funnel.
  sessionStorage.removeItem(pendingLeadKey(v));
  // Cleared on retake, so the next run opens a fresh attempt rather than
  // overwriting the previous one's row.
  sessionStorage.removeItem(attemptKey(v));
  // And what the last reader did with the report's closing, for the same
  // reason: the next run's button must not open already confirmed.
  sessionStorage.removeItem(interestKey(v));
}

/**
 * `crypto.randomUUID` needs a secure context, so it's missing over plain http
 * on a LAN address and on Safari before 15.4. The API validates the UUID shape
 * and rejects anything else, so fall back to composing one from random bytes
 * rather than sending something it will refuse.
 */
function randomUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Stable id for one run through the funnel. `/api/lite-attempt` creates a row
 * under it when the game ends; the form submit later updates that same row.
 *
 * Held in sessionStorage so a refresh of the form reuses the id instead of
 * opening a second attempt, and so a retake (which clears the session) gets a
 * new one.
 */
export function readOrCreateAttemptId(v: LiteVariant = LITE_ONE): string {
  if (typeof window === "undefined") return "";
  const existing = sessionStorage.getItem(attemptKey(v));
  if (existing) return existing;

  const id = randomUuidV4();

  try {
    sessionStorage.setItem(attemptKey(v), id);
  } catch {
    // Private mode: the id still works for this page's two calls.
  }
  return id;
}

/**
 * Records that the game was finished, before any contact details exist.
 * Best-effort — a failure here must never block the visitor from submitting.
 */
export async function recordLiteAttempt(
  payload: {
    attemptId: string;
    score: number | null;
    percentile: number | null;
    severity: string | null;
  },
  v: LiteVariant = LITE_ONE
) {
  const { utm, referrer } = readAttribution(v);
  try {
    await fetch("/api/lite-attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, clinic: v.clinic, utm, referrer }),
    });
  } catch {
    // Offline or blocked. save-lead falls back to an insert if this row is
    // missing, so the lead itself is still captured.
  }
}

/**
 * The run's attempt id if one exists, without opening a new one.
 *
 * The report reads it this way: a tap there belongs to the run that just
 * finished, and with nothing stashed — a preview hit, a wiped session — there
 * is no run to attribute it to and nothing should be written.
 */
export function readAttemptId(v: LiteVariant = LITE_ONE): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(attemptKey(v)) || null;
  } catch {
    return null;
  }
}

/**
 * What the reader did with the report's closing CTA, mirrored on the device
 * so a refresh shows the button still confirmed and the box still ticked, in
 * step with the row /api/lite-report-interest holds for the run.
 */
export type LiteReportInterest = {
  /** Tapped "I'm interested". One-way: the button confirms and stays so. */
  interested: boolean;
  /** Current state of the "Send me brain health tips…" tickbox. */
  tipsOptIn: boolean;
};

export const readReportInterest = (v: LiteVariant = LITE_ONE) =>
  readJson<LiteReportInterest>(interestKey(v));

export function stashReportInterest(patch: Partial<LiteReportInterest>, v: LiteVariant = LITE_ONE) {
  const current = readReportInterest(v) ?? { interested: false, tipsOptIn: false };
  writeJson(interestKey(v), { ...current, ...patch });
}

/**
 * Records a CTA interaction on the report — the "I'm interested" tap or a
 * change to the tips opt-in — against the run's row in the funnel's
 * report-interest table. Best-effort, like recordLiteAttempt: the reader sees
 * the confirmed state at once and a failed write must never surface.
 *
 * Skipped without an attempt id, so a preview render (or a session wiped
 * mid-read) writes nothing rather than a row no lead can be joined to.
 */
export async function recordReportInterest(
  patch: Partial<LiteReportInterest>,
  v: LiteVariant = LITE_ONE,
  extra: { lang?: string | null } = {}
) {
  const attemptId = readAttemptId(v);
  if (!attemptId) return;
  const { utm } = readAttribution(v);
  try {
    await fetch("/api/lite-report-interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clinic: v.clinic,
        attemptId,
        funnel: v.basePath,
        lang: extra.lang ?? null,
        utm,
        ...patch,
      }),
    });
  } catch {
    // Offline or blocked. The device copy still reflects what they chose.
  }
}

/**
 * The report's human-readable severity ("Low" | "Medium" | "High") as the
 * leads-table key ("low" | "moderate" | "high").
 *
 * Every funnel's lead form has carried its own copy of this map; /parkway
 * needs it in two places — the form and the consent screen that posts for it —
 * so it lives here. The other funnels' local copies are identical and are left
 * where they are.
 */
export const SEVERITY_TO_KEY: Record<string, string> = {
  Low: "low",
  Medium: "moderate",
  High: "high",
};

/** `severityKey(report.severity)`, tolerating a missing report. */
export const severityKey = (severity: string | null | undefined): string | null =>
  (severity ? SEVERITY_TO_KEY[severity] : null) ?? null;

/** Pulls the task2 score out of the result store's two historical shapes. */
export function readTask2Score(result: any): number | null {
  const raw = Array.isArray(result?.task2) ? result?.task2?.[0]?.score : result?.task2?.score;
  return typeof raw === "number" ? raw : null;
}

export async function fetchLiteReport(
  result: unknown,
  v: LiteVariant = LITE_ONE
): Promise<DomainReport> {
  const res = await fetch("/api/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result, clinic: v.clinic }),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.details || payload?.error || "Failed to generate report");
  }
  const data = await res.json();
  if (!data?.shortReport) throw new Error("Report was empty");
  return data.shortReport as DomainReport;
}

/** UTM + referrer attribution, shared by the lead payload. */
export function readAttribution(v: LiteVariant = LITE_ONE) {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  return {
    utm: {
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign") ?? v.defaultCampaign,
    },
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
  };
}

/**
 * The API normalises WhatsApp to "+digits" and rejects anything outside
 * 8-16 digits, so a half-typed number would 400 the whole submit. Validate
 * before sending and let the visitor fix it in place.
 */
export function validateOptionalPhone(raw: string): { ok: true; value: string | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  const cleaned = trimmed.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const digits = cleaned.replace(/^\+/, "");
  if (digits.length < 8 || digits.length > 16) {
    return { ok: false, error: "That number looks incomplete. Add the country code, or leave it blank." };
  }
  return { ok: true, value: cleaned };
}

/** 1 → "1st", 2 → "2nd", 11 → "11th", 21 → "21st". */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/**
 * Maps quiz age-band answers to the closest liteone_leads age_range value
 * so the database stays consistent even though the form no longer asks.
 */
export const QUIZ_AGE_TO_LITE: Record<string, string> = {
  "18-29": "18-25",
  "30-39": "26-35",
  "40-49": "36-45",
  "50-59": "46-55",
  "60+": "56-65",
};

/** Display label per raw quiz age answer, for copy like "ages 60 and over". */
export const QUIZ_AGE_LABELS: Record<string, string> = {
  "18-29": "18 to 29",
  "30-39": "30 to 39",
  "40-49": "40 to 49",
  "50-59": "50 to 59",
  "60+": "60 and over",
};

/** The optimizer/senior split used by /lite-two's personalised report. */
export function isSeniorQuizAge(quizAge: string | null | undefined): boolean {
  return quizAge === "40-49" || quizAge === "50-59" || quizAge === "60+";
}

export const AGE_LABELS: Record<string, string> = {
  "18-25": "18–25",
  "26-35": "26–35",
  "36-45": "36–45",
  "46-55": "46–55",
  "56-65": "56–65",
  "66+": "66+",
};

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;
