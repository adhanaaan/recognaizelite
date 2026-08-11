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

const REPORT_KEY = "recognaize-lite-report";
const PROFILE_KEY = "recognaize-lite-profile";
const ATTEMPT_KEY = "recognaize-lite-attempt";
const QUIZ_RESULT_KEY = "recognaize-lite-quiz";

export type LiteProfile = {
  name: string;
  email: string;
  ageRange: string;
  gender: string;
  /** Stashed too, because the zustand result store is in-memory and a hard
      reload of the report page would otherwise lose the number. */
  score: number | null;
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

export const readStashedReport = () => readJson<DomainReport>(REPORT_KEY);
export const stashReport = (report: DomainReport) => writeJson(REPORT_KEY, report);

export const readLiteProfile = () => readJson<LiteProfile>(PROFILE_KEY);
export const stashLiteProfile = (profile: LiteProfile) => writeJson(PROFILE_KEY, profile);

export const readStashedQuizResult = () => readJson<ScoreResult>(QUIZ_RESULT_KEY);
export const stashQuizResult = (result: ScoreResult) => writeJson(QUIZ_RESULT_KEY, result);

export function clearLiteSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REPORT_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem(QUIZ_RESULT_KEY);
  // Cleared on retake, so the next run opens a fresh attempt rather than
  // overwriting the previous one's row.
  sessionStorage.removeItem(ATTEMPT_KEY);
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
export function readOrCreateAttemptId(): string {
  if (typeof window === "undefined") return "";
  const existing = sessionStorage.getItem(ATTEMPT_KEY);
  if (existing) return existing;

  const id = randomUuidV4();

  try {
    sessionStorage.setItem(ATTEMPT_KEY, id);
  } catch {
    // Private mode: the id still works for this page's two calls.
  }
  return id;
}

/**
 * Records that the game was finished, before any contact details exist.
 * Best-effort — a failure here must never block the visitor from submitting.
 */
export async function recordLiteAttempt(payload: {
  attemptId: string;
  score: number | null;
  percentile: number | null;
  severity: string | null;
}) {
  const { utm, referrer } = readAttribution();
  try {
    await fetch("/api/lite-attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, utm, referrer }),
    });
  } catch {
    // Offline or blocked. save-lead falls back to an insert if this row is
    // missing, so the lead itself is still captured.
  }
}

/** Pulls the task2 score out of the result store's two historical shapes. */
export function readTask2Score(result: any): number | null {
  const raw = Array.isArray(result?.task2) ? result?.task2?.[0]?.score : result?.task2?.score;
  return typeof raw === "number" ? raw : null;
}

export async function fetchLiteReport(result: unknown): Promise<DomainReport> {
  const res = await fetch("/api/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result, clinic: LITE_CLINIC }),
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
export function readAttribution() {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  return {
    utm: {
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign") ?? "lite-one",
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
