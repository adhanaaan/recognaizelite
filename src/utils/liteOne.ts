import type { DomainReport } from "src/types/report";

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

export type LiteProfile = {
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

export function clearLiteSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REPORT_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
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
