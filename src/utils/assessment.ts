export type Demographics = {
  gender: string;
  ageRange: string;
};

export type AssessmentMode = "short" | "full";

const DEMOGRAPHICS_KEY = "recognaize-demographics";
const ASSESSMENT_MODE_KEY = "recognaize-assessment-mode";

export function setDemographics(value: Demographics) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMOGRAPHICS_KEY, JSON.stringify(value));
}

export function getDemographics(): Demographics | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DEMOGRAPHICS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Demographics;
  } catch {
    return null;
  }
}

export function clearDemographics() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMOGRAPHICS_KEY);
}

export function setAssessmentMode(mode: AssessmentMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSESSMENT_MODE_KEY, mode);
}

export function getAssessmentMode(): AssessmentMode | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ASSESSMENT_MODE_KEY);
  if (raw === "short" || raw === "full") return raw;
  return null;
}

export function isShortAssessment() {
  return getAssessmentMode() === "short";
}

export function isAssessmentModeSet() {
  return getAssessmentMode() !== null;
}

export function clearAssessmentMode() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ASSESSMENT_MODE_KEY);
}

// --- Hook mode (QR funnel) ---

const HOOK_CLINIC_KEY = "recognaize-hook-clinic";

export function setHookClinic(clinic: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOOK_CLINIC_KEY, clinic);
}

export function getHookClinic(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(HOOK_CLINIC_KEY);
}

export function isHookMode(): boolean {
  return getHookClinic() !== null;
}

export function isIkigaiMode(): boolean {
  return getHookClinic() === "Ikigai Medical";
}

export function isPrologueMode(): boolean {
  return getHookClinic() === "Prologue Clinic";
}

export function isSjmcMode(): boolean {
  return getHookClinic() === "SJMC";
}

export function isNoviMode(): boolean {
  return getHookClinic() === "Novi";
}

/**
 * The /act4health partner funnel. A strict subset of isLiteOneMode() (which
 * every lite funnel, including this one, answers true for) — this one is for
 * the handful of spots that need to diverge from the rest of the lite family,
 * such as the larger touch targets its older audience needs on the game's
 * number pad.
 */
export function isAct4HealthMode(): boolean {
  return getHookClinic() === "Act4Health";
}

/**
 * ReCOGnAIze Lite (/lite-one) and its campaign copies (/lite-worldalzmonth).
 * They run the same Symbol Matching game as every other funnel but re-skinned
 * in the orange "Clinical Empathy" palette that /demo uses, so the whole flow
 * reads as one surface.
 *
 * Every lite funnel shares this palette, so they all answer true here — the
 * per-funnel split (routes, leads table, campaign) is carried by
 * hookReportPath and LiteVariant in src/utils/liteOne.ts, not by theming.
 */
const LITE_HOOK_CLINICS = new Set(["LiteOne", "LiteWorldAlz", "LiteClinician", "LiteTwo", "Act4Health"]);

export function isLiteOneMode(): boolean {
  const clinic = getHookClinic();
  return clinic !== null && LITE_HOOK_CLINICS.has(clinic);
}

/** Returns true for any clinic that uses dark-themed game UI */
export function isDarkHookMode(): boolean {
  return isIkigaiMode() || isNoviMode();
}

export function clearHookClinic() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HOOK_CLINIC_KEY);
  localStorage.removeItem(HOOK_REPORT_PATH_KEY);
  localStorage.removeItem(HOOK_ENTRY_PATH_KEY);
}

// --- Hook entry path (which landing page the user came from) ---

const HOOK_ENTRY_PATH_KEY = "recognaize-hook-entry-path";

export function setHookEntryPath(path: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOOK_ENTRY_PATH_KEY, path);
}

export function getHookEntryPath(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(HOOK_ENTRY_PATH_KEY);
}

// --- Hook report path (per-clinic custom report pages) ---

const HOOK_REPORT_PATH_KEY = "recognaize-hook-report-path";

export function setHookReportPath(path: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOOK_REPORT_PATH_KEY, path);
}

export function getHookReportPath(): string {
  if (typeof window === "undefined") return "/hook-report";
  return localStorage.getItem(HOOK_REPORT_PATH_KEY) || "/hook-report";
}
