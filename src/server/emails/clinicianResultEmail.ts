/**
 * The clinician result email for /lite-clinician.
 *
 * Different job from the consumer template. A clinician who has just completed
 * a 60-second task does not need processing speed explained — they need to know
 * whether the instrument that scored them is defensible, and where their number
 * sits. So the mail reads as a short report: value against a reference range,
 * then the publications, then one thing to do.
 *
 * Three references shape the layout:
 *
 *   Function Health's lab panel — a measured value plotted against BELOW / IN /
 *   ABOVE RANGE rather than stated bare. That idiom is the whole reason the
 *   percentile strip below exists; a clinician reads a position faster than a
 *   sentence, and it removes the "is 42 good?" beat entirely.
 *
 *   QuickBooks' invoice mail — the one figure that matters set large inside a
 *   tinted panel, everything around it quiet.
 *
 *   Skiff's transactional mail — restraint. No coloured masthead band, one
 *   primary button, a hairline rule before a small footer. The previous version
 *   opened on a solid orange bar and set the AUCs at 34px in orange; that reads
 *   as a campaign. Here the brand is a line of text and the figures are ink.
 *
 * The numbers are inline rather than behind a link: the report page reads
 * sessionStorage, so a link opened on another device shows the empty state.
 *
 * Server-only: imported from the save-lead API route.
 */

import { CLINICAL_DISCLAIMER } from "src/utils/disclaimers";
import {
  BAND_PRESENTATION,
  INK,
  MUTED,
  ORANGE,
  bandKeyOf,
  escapeHtml,
  professionalName,
  safeHttpUrl,
  speedKeyOf,
  type LiteEmailInput,
  type RenderedEmail,
} from "src/server/emails/shared";

/**
 * Everything this mail asserts, in one block so the claims can be reviewed
 * together and corrected without reading through markup. Each figure is a
 * statement made to a clinician in writing — check it against the paper.
 *
 * Kept in step with src/data/liteClinicianContent.ts, which carries the same
 * citations for the web pages.
 */
export const STUDY = {
  validation: {
    title:
      "ReCOGnAIze app to detect vascular cognitive impairment and mild cognitive impairment",
    authors: "Mohammed AA, et al.",
    journal: "Alzheimer's & Dementia",
    year: "2026",
    doi: "10.1002/alz.70992",
    /** Version of record. PubMed record for the same paper is 41685533. */
    url: "https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.70992",
  },
  cohort: {
    title:
      "Biomarkers and Cognition Study, Singapore (BIOCIS): Protocol, Study Design, and Preliminary Findings",
    authors: "Chong JR, et al.",
    journal: "The Journal of Prevention of Alzheimer's Disease",
    year: "2024",
    doi: "10.14283/jpad.2024.89",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11266377/",
  },
  institution:
    "Dementia Research Centre · Lee Kong Chian School of Medicine, NTU Singapore",
  figures: [
    { value: "0.85", caption: "AUC — vascular cognitive impairment" },
    { value: "0.90", caption: "AUC — mild cognitive impairment" },
  ],
  comparator:
    "Differentiated vascular from non-vascular cognitive impairment, outperforming the MoCA on the same cohort.",
} as const;

/**
 * Band edges as percentiles. calculateSeverity in src/server/report.ts splits
 * at ±1 SD, which on a normal distribution is the 15.87th and 84.13th
 * percentiles — rounded here because the strip is a graphic, not a readout.
 */
const LOWER_EDGE = 16;
const UPPER_EDGE = 84;

const BAND_WORDING: Record<string, string> = {
  low: "below",
  moderate: "within",
  high: "above",
};

/**
 * The reference-range strip: three tinted segments with a marker above the
 * measured position.
 *
 * Built from nested tables and percentage widths because that is what survives
 * Outlook. No SVG (stripped by several clients), no background images (blocked
 * by default in others) — the tint is a bgcolor on a table cell, which renders
 * everywhere.
 */
function referenceStrip(percentile: number, accent: string): string {
  const pos = Math.max(0, Math.min(100, percentile));
  // The marker is a 2px rule; the spacer left of it carries the position. Cap
  // just short of 100 so the glyph is never pushed off the right edge.
  const left = Math.max(0, Math.min(97, pos));

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="padding:0 0 4px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="${left}%" style="font-size:0;line-height:0;">&nbsp;</td>
              <td style="font-size:11px;line-height:1;font-weight:bold;color:${accent};white-space:nowrap;">▼</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                 style="border-radius:4px;overflow:hidden;">
            <tr>
              <td width="${LOWER_EDGE}%" bgcolor="#f0dcd6" style="height:10px;font-size:0;line-height:10px;">&nbsp;</td>
              <td width="${UPPER_EDGE - LOWER_EDGE}%" bgcolor="#e3ded6" style="height:10px;font-size:0;line-height:10px;">&nbsp;</td>
              <td width="${100 - UPPER_EDGE}%" bgcolor="#d9e5d2" style="height:10px;font-size:0;line-height:10px;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="left" style="font-size:10.5px;letter-spacing:0.6px;text-transform:uppercase;color:${MUTED};">Below</td>
              <td align="center" style="font-size:10.5px;letter-spacing:0.6px;text-transform:uppercase;color:${MUTED};">Expected range</td>
              <td align="right" style="font-size:10.5px;letter-spacing:0.6px;text-transform:uppercase;color:${MUTED};">Above</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function citationHtml(c: {
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi: string;
  url: string;
}): string {
  return `
    <p style="margin:0 0 14px 0;font-size:12.5px;line-height:1.5;color:${MUTED};">
      <a href="${escapeHtml(c.url)}" style="color:${INK};font-weight:600;text-decoration:none;">${escapeHtml(
        c.title
      )}</a><br />
      ${escapeHtml(c.authors)} <em>${escapeHtml(c.journal)}</em>, ${c.year}. doi:${escapeHtml(c.doi)}
    </p>`;
}

export function renderClinicianResultEmail(input: LiteEmailInput): RenderedEmail {
  const BRAND = input.brand;
  // Titled: "Dr Tan Wei Ming". Untitled: "Wei Ming" -> "Wei".
  const named = professionalName(input.name);
  const greeting = named ? `Hi ${named},` : "Hi,";

  const speedKey = speedKeyOf(typeof input.severity === "string" ? input.severity : null);
  const bandWord = BAND_WORDING[speedKey] ?? "within";
  const percentile = input.percentile;

  const subject = named
    ? `${named}, your result and the validation data`
    : "Your result and the validation data";

  const bandKey = bandKeyOf(input.band);
  const bandPresentation = bandKey ? BAND_PRESENTATION[bandKey] : null;
  const hasQuiz = input.brainHealthScore !== null && bandPresentation !== null;

  const demoUrl = safeHttpUrl(input.demoUrl);
  const bookingUrl = safeHttpUrl(input.bookingUrl);

  const positionLine =
    percentile === null
      ? "Your task was recorded but could not be scored against the reference sample."
      : `${percentile}th percentile — ${bandWord} the expected range for your age.`;

  // --- Plain text. Some clients show only this, so it carries the same facts. ---
  const textLines = [
    greeting,
    "",
    "Your result from the symbol–digit substitution task, and the published",
    "validation behind it.",
    "",
    "RESULT — PROCESSING SPEED",
    positionLine,
    ...(percentile !== null
      ? [`Expected range is the ${LOWER_EDGE}th–${UPPER_EDGE}th percentile (±1 SD of the age-matched mean).`]
      : []),
    ...(hasQuiz
      ? [`Risk questionnaire: ${input.brainHealthScore}/100 (${bandPresentation!.label}).`]
      : []),
    "",
    "VALIDATION",
    ...STUDY.figures.map((f) => `  ${f.value}  ${f.caption}`),
    "",
    STUDY.comparator,
    STUDY.institution,
    "",
    "REFERENCES",
    `${STUDY.validation.title}`,
    `${STUDY.validation.authors} ${STUDY.validation.journal}, ${STUDY.validation.year}. doi:${STUDY.validation.doi}`,
    STUDY.validation.url,
    "",
    `${STUDY.cohort.title}`,
    `${STUDY.cohort.authors} ${STUDY.cohort.journal}, ${STUDY.cohort.year}. doi:${STUDY.cohort.doi}`,
    STUDY.cohort.url,
    "",
    "This task samples processing speed only. The full assessment covers memory,",
    "attention and executive function alongside it.",
    ...(bookingUrl ? ["", `Book a 20-minute call: ${bookingUrl}`] : []),
    ...(demoUrl ? [`See the full assessment: ${demoUrl}`] : []),
    "",
    CLINICAL_DISCLAIMER,
    "",
    `— ${BRAND}`,
    "You're receiving this because you requested your result.",
  ];

  const text = textLines.join("\n");

  // --- HTML. Tables and inline styles: the common denominator across clients. ---
  const quizRow = hasQuiz
    ? `<tr>
         <td style="padding:14px 0 0 0;border-top:1px solid #ece2dc;">
           <p style="margin:0;font-size:13px;line-height:1.5;color:${MUTED};">
             Risk questionnaire
             <strong style="color:${INK};">${input.brainHealthScore}/100</strong>
             <span style="color:${bandPresentation!.color};font-weight:bold;">· ${bandPresentation!.label}</span>
           </p>
         </td>
       </tr>`
    : "";

  const stripBlock =
    percentile === null
      ? ""
      : `<tr>
           <td style="padding:18px 0 0 0;">
             ${referenceStrip(percentile, ORANGE)}
           </td>
         </tr>
         <tr>
           <td style="padding:12px 0 0 0;">
             <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED};">
               Expected range is the ${LOWER_EDGE}th–${UPPER_EDGE}th percentile, one standard
               deviation either side of the age-matched mean.
             </p>
           </td>
         </tr>`;

  const figureCells = STUDY.figures
    .map(
      (f) => `
              <td width="50%" valign="top" style="padding:0 10px 0 0;">
                <p style="margin:0;font-size:26px;font-weight:bold;line-height:1;color:${INK};">${f.value}</p>
                <p style="margin:5px 0 0 0;font-size:12px;line-height:1.45;color:${MUTED};">${f.caption}</p>
              </td>`
    )
    .join("");

  // One primary action. A booking link outranks a demo link when both exist —
  // the demo drops to a text link rather than competing as a second button.
  const primary = bookingUrl
    ? { href: bookingUrl, label: "Book a 20-minute call" }
    : demoUrl
      ? { href: demoUrl, label: "See the full assessment" }
      : null;
  const secondary = bookingUrl && demoUrl ? { href: demoUrl, label: "Or see the full assessment" } : null;

  const ctaBlock = primary
    ? `<tr>
         <td style="padding:26px 0 0 0;">
           <table role="presentation" cellpadding="0" cellspacing="0" border="0">
             <tr>
               <td align="center" bgcolor="${INK}" style="border-radius:6px;">
                 <a href="${escapeHtml(primary.href)}"
                    style="display:inline-block;padding:13px 26px;font-size:14.5px;font-weight:bold;color:#ffffff;text-decoration:none;">
                   ${primary.label}
                 </a>
               </td>
             </tr>
           </table>
           ${
             secondary
               ? `<p style="margin:12px 0 0 0;font-size:13px;">
                    <a href="${escapeHtml(secondary.href)}" style="color:${MUTED};text-decoration:underline;">${
                   secondary.label
                 }</a>
                  </p>`
               : ""
           }
         </td>
       </tr>`
    : "";

  const html = `<!-- preheader --><div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
    positionLine
  )}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f3f1;margin:0;padding:32px 0;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
             style="max-width:560px;background:#ffffff;border:1px solid #ece2dc;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr>
          <td style="padding:30px 30px 0 30px;">
            <!-- Brand as a line of type, not a coloured band. -->
            <p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;color:${ORANGE};">
              ${escapeHtml(BRAND)}
            </p>

            <p style="margin:24px 0 0 0;font-size:15.5px;color:${INK};">${escapeHtml(greeting)}</p>
            <p style="margin:10px 0 0 0;font-size:14.5px;line-height:1.6;color:${MUTED};">
              Your result from the symbol–digit substitution task, and the published
              validation behind it.
            </p>
          </td>
        </tr>

        <!-- The measurement, read as a lab value against its reference range. -->
        <tr>
          <td style="padding:24px 30px 0 30px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="background:#faf7f5;border:1px solid #ece2dc;border-radius:8px;">
              <tr>
                <td style="padding:20px;">
                  <p style="margin:0;font-size:10.5px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${MUTED};">
                    Processing speed
                  </p>
                  <p style="margin:10px 0 0 0;font-size:30px;font-weight:bold;line-height:1.05;color:${INK};">
                    ${percentile === null ? "—" : `${percentile}<span style="font-size:16px;color:${MUTED};">th percentile</span>`}
                  </p>
                  <p style="margin:6px 0 0 0;font-size:14px;line-height:1.5;color:${INK};">
                    ${escapeHtml(bandWord)} the expected range for your age
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    ${stripBlock}
                    ${quizRow}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Validation. Ink, not orange: figures, not a campaign. -->
        <tr>
          <td style="padding:28px 30px 0 30px;">
            <p style="margin:0 0 14px 0;font-size:10.5px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${MUTED};">
              Validation
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>${figureCells}</tr>
            </table>
            <p style="margin:16px 0 0 0;font-size:13.5px;line-height:1.6;color:${INK};">
              ${escapeHtml(STUDY.comparator)}
            </p>
            <p style="margin:6px 0 0 0;font-size:12px;line-height:1.55;color:${MUTED};">
              ${escapeHtml(STUDY.institution)}
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:26px 30px 0 30px;">
            <p style="margin:0 0 12px 0;font-size:10.5px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${MUTED};">
              References
            </p>
            ${citationHtml(STUDY.validation)}
            ${citationHtml(STUDY.cohort)}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 30px 0 30px;">
            <p style="margin:0;font-size:13.5px;line-height:1.6;color:${MUTED};">
              This task samples processing speed only. The full assessment covers memory,
              attention and executive function alongside it.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${ctaBlock}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 30px 30px 30px;">
            <div style="border-top:1px solid #ece2dc;padding-top:16px;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#a89a92;">
                ${escapeHtml(CLINICAL_DISCLAIMER)}
              </p>
              <p style="margin:12px 0 0 0;font-size:11px;line-height:1.6;color:#a89a92;">
                You're receiving this because you requested your result at ${escapeHtml(BRAND)}.
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  return { subject, html, text };
}
