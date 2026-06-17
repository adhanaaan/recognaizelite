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

/** Returns true for any clinic that uses dark-themed game UI (Ikigai only) */
export function isDarkHookMode(): boolean {
  return isIkigaiMode();
}

export function clearHookClinic() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HOOK_CLINIC_KEY);
  localStorage.removeItem(HOOK_REPORT_PATH_KEY);
}

// --- Demo lead tag (which event the visitor came in from) ---
// Used by /demo-report to tag the Supabase row with a specific event ID
// like "pantai-kl" instead of the default catch-all "healthtechx" — so we
// can pull a clean lead list per event without polluting other columns.

const DEMO_SOURCE_KEY = "recognaize-demo-source";
const DEFAULT_DEMO_SOURCE = "healthtechx";

export function setDemoSource(source: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_SOURCE_KEY, source);
}

export function getDemoSource(): string {
  if (typeof window === "undefined") return DEFAULT_DEMO_SOURCE;
  return localStorage.getItem(DEMO_SOURCE_KEY) || DEFAULT_DEMO_SOURCE;
}

export function clearDemoSource() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_SOURCE_KEY);
}

// --- Demo form prefill (per-event defaults for the B2B capture form) ---
// Event-day variants like /demo-pantai pre-set the visitor's role + org so
// nobody has to re-type "Pantai Hospital Kuala Lumpur" on a phone. Values
// are localStorage-only — the user can still edit them on the form.

const DEMO_PREFILL_KEY = "recognaize-demo-prefill";

export type DemoFormPrefill = {
  role?: string;
  organization?: string;
};

export function setDemoFormPrefill(value: DemoFormPrefill) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_PREFILL_KEY, JSON.stringify(value));
}

export function getDemoFormPrefill(): DemoFormPrefill | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DEMO_PREFILL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoFormPrefill;
  } catch {
    return null;
  }
}

export function clearDemoFormPrefill() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_PREFILL_KEY);
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
