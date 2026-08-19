/**
 * Pieces shared by every lite-funnel email template.
 *
 * The escaping and the name handling live here rather than in each template
 * on purpose: they are the security-relevant part, and two copies is how one
 * of them quietly stops matching the other.
 *
 * Server-only — these modules are imported from /api/save-lead.
 */

export type RenderedEmail = { subject: string; html: string; text: string };

/** Brain speed severity as stored in the leads tables. */
export type SpeedKey = "low" | "moderate" | "high";
/** Brain Health Quiz band as stored in the leads tables. */
export type BandKey = "low" | "moderate" | "elevated" | "high";

export type LiteEmailInput = {
  /**
   * The funnel's public name, e.g. "Recog-Lite". Passed in rather than fixed
   * in a template: the funnels are not necessarily branded alike, and a shared
   * constant would silently mail one of them under another's name.
   */
  brand: string;
  name: string | null;
  percentile: number | null;
  /**
   * NOTE the polarity trap: for speed, "high" is the good end (STRONG) and
   * "low" is the weak end. For `band` it is the reverse — "high" means high
   * risk. Different scales that happen to share key names.
   */
  severity: SpeedKey | string | null;
  brainHealthScore: number | null;
  band: BandKey | string | null;
  /** Where "see a demo" points. Omitted from the mail when null. */
  demoUrl?: string | null;
};

/** Every template renders from the same input, so funnels can swap templates. */
export type LiteEmailRenderer = (input: LiteEmailInput) => RenderedEmail;

/** Matches liteSeverityVisuals in src/components/Report/BellCurve.tsx. */
export const SPEED_PRESENTATION: Record<SpeedKey, { label: string; color: string }> = {
  low: { label: "weak", color: "#ba1a1a" },
  moderate: { label: "adequate", color: "#2f6fd0" },
  high: { label: "strong", color: "#97c459" },
};

/** Matches BANDS in src/lib/brainHealthScoring.ts. */
export const BAND_PRESENTATION: Record<BandKey, { label: string; color: string }> = {
  low: { label: "Low risk", color: "#97c459" },
  moderate: { label: "Moderate risk", color: "#fac775" },
  elevated: { label: "Elevated risk", color: "#ef9f27" },
  high: { label: "High risk", color: "#f09595" },
};

export const ORANGE = "#f77528";
export const INK = "#2d2d2d";
export const MUTED = "#7d5747";
export const SURFACE = "#fff8f6";

/**
 * The recipient's name reaches these templates straight from a public form, so
 * it is escaped before it touches the markup. `&` runs first or it would
 * double-escape the entities the later replacements introduce.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Name-shaped tokens only: letters (any script, so 美玲 and Zoë pass), combining
 * marks, and the apostrophes/hyphens/periods real names carry.
 *
 * escapeHtml already makes the body safe, but the subject line is not HTML and
 * is not escaped — anything odd in it renders verbatim in the inbox list. A
 * name with markup in it would read as a phishing attempt even though it is
 * inert, so an implausible name is dropped entirely and the mail falls back to
 * a plain greeting. Nothing of value is lost: we simply don't greet by name.
 */
const NAME_TOKEN = /^[\p{L}\p{M}'’.-]+$/u;

export function firstName(name: string | null): string | null {
  if (!name) return null;
  const first = name.replace(/[\r\n]+/g, " ").trim().split(/\s+/)[0];
  if (!first || first.length > 40) return null;
  return NAME_TOKEN.test(first) ? first : null;
}

/**
 * Titles people actually type into a name field. Lower-cased for comparison;
 * NAME_TOKEN already permits the trailing period on "Dr.", but "A/Prof" needs
 * naming explicitly because of the slash.
 */
const HONORIFICS = new Set([
  "dr", "dr.", "doctor", "prof", "prof.", "professor", "a/prof", "assoc", "adj",
  "mr", "mr.", "mrs", "mrs.", "ms", "ms.", "mx", "mx.", "miss", "sir", "dame",
]);

/**
 * Greeting name for an audience that writes its title into the name field.
 *
 * `firstName` takes the first whitespace token, which turns "Dr Tan Wei Ming"
 * into "Hi Dr," — wrong, and worse than no name at all in front of a clinician.
 * When a title is present the whole name is used instead ("Hi Dr Tan Wei Ming,"),
 * because picking the personal part of a titled name is not something we can do
 * reliably: family name comes first in many of the names this funnel will see,
 * so neither the second token nor the last is dependable.
 *
 * Same safety rule as `firstName`: every token must look like a name, or the
 * whole thing is dropped and the mail falls back to a plain greeting.
 */
export function professionalName(name: string | null): string | null {
  if (!name) return null;
  const cleaned = name.replace(/[\r\n]+/g, " ").trim().replace(/\s+/g, " ");
  if (!cleaned || cleaned.length > 60) return null;

  const tokens = cleaned.split(" ");
  const allNameShaped = tokens.every(
    (t) => NAME_TOKEN.test(t) || HONORIFICS.has(t.toLowerCase())
  );
  if (!allNameShaped) return null;

  if (HONORIFICS.has(tokens[0].toLowerCase())) return cleaned;
  return firstName(cleaned);
}

export function speedKeyOf(severity: string | null | undefined): SpeedKey {
  return severity === "low" || severity === "moderate" || severity === "high"
    ? severity
    : "moderate";
}

export function bandKeyOf(band: string | null | undefined): BandKey | null {
  return band === "low" || band === "moderate" || band === "elevated" || band === "high"
    ? band
    : null;
}

/**
 * Only http(s) URLs reach the markup. The demo link comes from an env var
 * rather than user input, so this is a guard against a misconfiguration
 * (a `javascript:` value, a stray quote breaking out of the href), not against
 * an attacker.
 */
export function safeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
