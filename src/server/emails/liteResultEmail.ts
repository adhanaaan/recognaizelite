/**
 * The result email for the lite funnels — the copy the form promises when it
 * says "Tell us your name and email, and we'll send you a copy".
 *
 * The numbers are rendered inline rather than behind a "view your result" link
 * on purpose. The report page reads its data from sessionStorage, so a link
 * opened on a different device (which is the normal case for an email) would
 * render the empty-state, not their result. Whatever this email doesn't say,
 * the recipient never sees.
 *
 * Server-only: imported from the save-lead API route.
 */

import { CLINICAL_DISCLAIMER } from "src/utils/disclaimers";

/** Brain speed severity as stored in the leads tables. */
type SpeedKey = "low" | "moderate" | "high";
/** Brain Health Quiz band as stored in the leads tables. */
type BandKey = "low" | "moderate" | "elevated" | "high";

export type LiteResultEmailInput = {
  name: string | null;
  percentile: number | null;
  /**
   * NOTE the polarity trap: for speed, "high" is the good end (STRONG) and
   * "low" is the weak end. For `band` below it is the reverse — "high" means
   * high risk. They are different scales that happen to share key names.
   */
  severity: SpeedKey | string | null;
  brainHealthScore: number | null;
  band: BandKey | string | null;
};

const BRAND = "BrainScan Testing";
const ORANGE = "#f77528";
const INK = "#2d2d2d";
const MUTED = "#7d5747";
const SURFACE = "#fff8f6";

/** Matches liteSeverityVisuals in src/components/Report/BellCurve.tsx. */
const SPEED_PRESENTATION: Record<SpeedKey, { label: string; color: string }> = {
  low: { label: "weak", color: "#ba1a1a" },
  moderate: { label: "adequate", color: "#2f6fd0" },
  high: { label: "strong", color: "#97c459" },
};

/** Matches BANDS in src/lib/brainHealthScoring.ts. */
const BAND_PRESENTATION: Record<BandKey, { label: string; color: string }> = {
  low: { label: "Low risk", color: "#97c459" },
  moderate: { label: "Moderate risk", color: "#fac775" },
  elevated: { label: "Elevated risk", color: "#ef9f27" },
  high: { label: "High risk", color: "#f09595" },
};

/**
 * The recipient's name reaches this template straight from a public form, so
 * it is escaped before it touches the markup. `&` runs first or it would
 * double-escape the entities the later replacements introduce.
 */
function escapeHtml(value: string): string {
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
 * a plain "Hi,". Nothing of value is lost: we simply don't greet by name.
 */
const NAME_TOKEN = /^[\p{L}\p{M}'’.-]+$/u;

function firstName(name: string | null): string | null {
  if (!name) return null;
  const first = name.replace(/[\r\n]+/g, " ").trim().split(/\s+/)[0];
  if (!first || first.length > 40) return null;
  return NAME_TOKEN.test(first) ? first : null;
}

function speedCopy(percentile: number | null, severity: string | null) {
  const key: SpeedKey =
    severity === "low" || severity === "moderate" || severity === "high" ? severity : "moderate";
  const presentation = SPEED_PRESENTATION[key];

  if (percentile === null) {
    return { presentation, headline: "We recorded your reaction time.", detail: null as string | null };
  }

  // Mirrors the wording on the report page so the email and the screen agree.
  if (key === "high") {
    return {
      presentation,
      headline: `You reacted faster than ${percentile}% of people in your age band.`,
      detail: `That puts you in the top ${Math.max(1, 100 - percentile)}% for your age.`,
    };
  }
  if (key === "moderate") {
    return {
      presentation,
      headline: `You reacted faster than ${percentile}% of people in your age band.`,
      detail: "That's within the typical range for your age.",
    };
  }
  return {
    presentation,
    headline: "Most people in your age band reacted faster than you today.",
    detail:
      "Processing speed dips with poor sleep and slows with age. It's a snapshot of today, not a diagnosis.",
  };
}

export type RenderedEmail = { subject: string; html: string; text: string };

export function renderLiteResultEmail(input: LiteResultEmailInput): RenderedEmail {
  const first = firstName(input.name);
  const greeting = first ? `Hi ${first},` : "Hi,";
  const subject = first ? `${first}, your brain speed result` : "Your brain speed result";

  const speed = speedCopy(input.percentile, typeof input.severity === "string" ? input.severity : null);

  const bandKey =
    input.band === "low" || input.band === "moderate" || input.band === "elevated" || input.band === "high"
      ? (input.band as BandKey)
      : null;
  const bandPresentation = bandKey ? BAND_PRESENTATION[bandKey] : null;
  const hasQuiz = input.brainHealthScore !== null && bandPresentation !== null;

  // --- Plain text. Some clients show only this, so it carries the same facts. ---
  const textLines = [
    greeting,
    "",
    "Here's the result from your brain check.",
    "",
    `PROCESSING SPEED: ${speed.presentation.label.toUpperCase()}`,
    speed.headline,
    ...(speed.detail ? [speed.detail] : []),
  ];

  if (hasQuiz) {
    textLines.push(
      "",
      `BRAIN HEALTH SCORE: ${input.brainHealthScore}/100 (${bandPresentation!.label})`,
      "Based on the risk factors and symptoms you told us about.",
      "Lower is better on this one — it counts risk, not performance."
    );
  }

  textLines.push(
    "",
    "Speed is one of four cognitive domains. This check measured one of them;",
    "memory, attention and executive function need the full assessment.",
    "",
    CLINICAL_DISCLAIMER,
    "",
    `— ${BRAND}`,
    "You're getting this because you asked us to send your result."
  );

  const text = textLines.join("\n");

  // --- HTML. Tables and inline styles: the common denominator across clients. ---
  const scoreBlock = hasQuiz
    ? `
      <tr>
        <td style="padding:0 28px 24px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                 style="background:${SURFACE};border-radius:12px;">
            <tr>
              <td style="padding:18px 20px;">
                <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${MUTED};">
                  Brain health score
                </p>
                <p style="margin:8px 0 0 0;font-size:28px;font-weight:bold;color:${INK};line-height:1.1;">
                  ${input.brainHealthScore}<span style="font-size:16px;color:${MUTED};">/100</span>
                  <span style="font-size:14px;font-weight:bold;color:${bandPresentation!.color};">&nbsp;· ${bandPresentation!.label}</span>
                </p>
                <p style="margin:10px 0 0 0;font-size:13px;line-height:1.5;color:${MUTED};">
                  Based on the risk factors and symptoms you told us about. Lower is better here — it counts risk, not performance.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const html = `<!-- preheader --><div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
    speed.headline
  )}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4efec;margin:0;padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
             style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr>
          <td style="background:${ORANGE};padding:18px 28px;">
            <p style="margin:0;font-size:14px;font-weight:bold;color:#ffffff;letter-spacing:0.3px;">${BRAND}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 28px 8px 28px;">
            <p style="margin:0;font-size:16px;color:${INK};">${escapeHtml(greeting)}</p>
            <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:${MUTED};">
              Here's the result from your brain check.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 28px 24px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="border:1px solid #e8d9d2;border-radius:12px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${MUTED};">
                    Processing speed
                  </p>
                  <p style="margin:8px 0 0 0;font-size:24px;font-weight:bold;line-height:1.2;color:${INK};">
                    Your speed is in the
                    <span style="color:${speed.presentation.color};">${speed.presentation.label}</span> range
                  </p>
                  <p style="margin:12px 0 0 0;font-size:15px;font-weight:600;line-height:1.5;color:${INK};">
                    ${escapeHtml(speed.headline)}
                  </p>
                  ${
                    speed.detail
                      ? `<p style="margin:6px 0 0 0;font-size:13.5px;line-height:1.6;color:${MUTED};">${escapeHtml(
                          speed.detail
                        )}</p>`
                      : ""
                  }
                </td>
              </tr>
            </table>
          </td>
        </tr>
${scoreBlock}
        <tr>
          <td style="padding:0 28px 24px 28px;">
            <p style="margin:0;font-size:13.5px;line-height:1.6;color:${MUTED};">
              Speed is one of four cognitive domains. This check measured one of them — memory,
              attention and executive function need the full assessment.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:0 28px 28px 28px;border-top:1px solid #f0e6e1;">
            <p style="margin:18px 0 0 0;font-size:11px;line-height:1.6;color:#a08b81;">
              ${escapeHtml(CLINICAL_DISCLAIMER)}
            </p>
            <p style="margin:14px 0 0 0;font-size:11px;line-height:1.6;color:#a08b81;">
              You're receiving this because you asked us to send your result at ${BRAND}.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  return { subject, html, text };
}
