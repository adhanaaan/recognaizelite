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

export function clearHookClinic() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HOOK_CLINIC_KEY);
}
