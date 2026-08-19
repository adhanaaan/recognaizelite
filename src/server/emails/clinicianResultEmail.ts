/**
 * The clinician result email for /lite-clinician.
 *
 * Different job from the consumer template. A clinician who has just played a
 * 60-second game does not need to be told what processing speed is — they need
 * to know whether the thing that scored them is defensible. So the result is
 * stated briefly and the weight of the mail sits on the published validation,
 * with a single demo ask at the end.
 *
 * Structure follows two patterns: evidence stated as plain figures with the
 * institution named (Headspace's research section), and one unambiguous demo
 * CTA under it rather than a menu of links (Amigo's demo section).
 *
 * As with the consumer template the numbers are inline, not behind a link —
 * the report page reads sessionStorage, so a link opened on another device
 * shows the empty state rather than their result.
 *
 * Server-only: imported from the save-lead API route.
 */

import { CLINICAL_DISCLAIMER } from "src/utils/disclaimers";
import {
  BAND_PRESENTATION,
  INK,
  MUTED,
  ORANGE,
  SPEED_PRESENTATION,
  SURFACE,
  bandKeyOf,
  escapeHtml,
  professionalName,
  safeHttpUrl,
  speedKeyOf,
  type LiteEmailInput,
  type RenderedEmail,
} from "src/server/emails/shared";

/**
 * The published validation, in one place so the claims can be reviewed as a
 * block and corrected without reading through markup.
 *
 * Source: Mohammed et al., "ReCOGnAIze app to detect vascular cognitive
 * impairment and mild cognitive impairment", Alzheimer's & Dementia, 2026.
 * Every figure below is a claim made to clinicians in writing — check it
 * against the paper before changing it.
 */
export const STUDY = {
  title:
    "ReCOGnAIze app to detect vascular cognitive impairment and mild cognitive impairment",
  journal: "Alzheimer's & Dementia",
  year: "2026",
  /** Version of record. The PubMed record for the same paper is 41685533. */
  url: "https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.70992",
  doi: "10.1002/alz.70992",
  institution:
    "Dementia Research Centre, Lee Kong Chian School of Medicine, Nanyang Technological University, Singapore",
  cohort: "BIOCIS (Biomarker and Cognitive Study, Singapore)",
  figures: [
    { value: "0.85", caption: "AUC, detecting vascular cognitive impairment" },
    { value: "0.90", caption: "AUC, detecting mild cognitive impairment" },
  ],
  comparator:
    "Differentiated vascular from non-vascular cognitive impairment, outperforming the MoCA on the same cohort.",
} as const;

function resultLine(percentile: number | null, severity: string | null) {
  const key = speedKeyOf(severity);
  const presentation = SPEED_PRESENTATION[key];
  if (percentile === null) {
    return { presentation, line: "Your reaction time was recorded." };
  }
  return {
    presentation,
    line: `You scored at the ${percentile}th percentile for processing speed against an age-matched reference sample.`,
  };
}

export function renderClinicianResultEmail(input: LiteEmailInput): RenderedEmail {
  const BRAND = input.brand;
  // Titled: "Dr Tan Wei Ming". Untitled: "Wei Ming" -> "Wei".
  const named = professionalName(input.name);
  const greeting = named ? `Hi ${named},` : "Hi,";
  const subject = named
    ? `${named}, your result — and the data behind it`
    : "Your result — and the data behind it";

  const speed = resultLine(
    input.percentile,
    typeof input.severity === "string" ? input.severity : null
  );

  const bandKey = bandKeyOf(input.band);
  const bandPresentation = bandKey ? BAND_PRESENTATION[bandKey] : null;
  const hasQuiz = input.brainHealthScore !== null && bandPresentation !== null;

  const demoUrl = safeHttpUrl(input.demoUrl);

  // --- Plain text. Some clients show only this, so it carries the same facts. ---
  const textLines = [
    greeting,
    "",
    "Thanks for trying the 60-second screen. Your result, and the validation",
    "behind the tool that produced it, are below.",
    "",
    `YOUR RESULT — processing speed: ${speed.presentation.label.toUpperCase()}`,
    speed.line,
  ];

  if (hasQuiz) {
    textLines.push(
      `Risk questionnaire: ${input.brainHealthScore}/100 (${bandPresentation!.label}).`
    );
  }

  textLines.push(
    "",
    "THE VALIDATION",
    `${STUDY.title}`,
    `${STUDY.journal}, ${STUDY.year}. doi:${STUDY.doi}`,
    "",
    ...STUDY.figures.map((f) => `  ${f.value} — ${f.caption}`),
    "",
    STUDY.comparator,
    `Cohort: ${STUDY.cohort}.`,
    STUDY.institution,
    "",
    `Read the paper: ${STUDY.url}`,
    "",
    "What you just completed is the symbol-matching task — one component of the",
    "full assessment, which covers processing speed, memory, attention and",
    "executive function across four games.",
    ...(demoUrl ? ["", `See the full assessment: ${demoUrl}`] : []),
    "",
    CLINICAL_DISCLAIMER,
    "",
    `— ${BRAND}`,
    "You're receiving this because you requested your result."
  );

  const text = textLines.join("\n");

  // --- HTML. Tables and inline styles: the common denominator across clients. ---
  const quizRow = hasQuiz
    ? `<p style="margin:8px 0 0 0;font-size:14px;line-height:1.5;color:${MUTED};">
         Risk questionnaire:
         <strong style="color:${INK};">${input.brainHealthScore}/100</strong>
         <span style="color:${bandPresentation!.color};font-weight:bold;">· ${bandPresentation!.label}</span>
       </p>`
    : "";

  const figureCells = STUDY.figures
    .map(
      (f) => `
              <td width="50%" valign="top" style="padding:0 8px;">
                <p style="margin:0;font-size:34px;font-weight:bold;line-height:1;color:${ORANGE};">${f.value}</p>
                <p style="margin:6px 0 0 0;font-size:12.5px;line-height:1.45;color:${MUTED};">${f.caption}</p>
              </td>`
    )
    .join("");

  const demoBlock = demoUrl
    ? `
        <tr>
          <td style="padding:0 28px 28px 28px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="border-radius:999px;background:${ORANGE};">
                  <a href="${escapeHtml(demoUrl)}"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">
                    See the full assessment
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    : "";

  const html = `<!-- preheader --><div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
    `${STUDY.journal}, ${STUDY.year}: AUC ${STUDY.figures[0].value} for vascular cognitive impairment.`
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
              Thanks for trying the 60-second screen. Your result is below, along with the
              published validation behind the tool that produced it.
            </p>
          </td>
        </tr>

        <!-- Their result. Brief: the evidence is what this mail is for. -->
        <tr>
          <td style="padding:20px 28px 24px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="border:1px solid #e8d9d2;border-radius:12px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${MUTED};">
                    Your result
                  </p>
                  <p style="margin:8px 0 0 0;font-size:20px;font-weight:bold;line-height:1.25;color:${INK};">
                    Processing speed:
                    <span style="color:${speed.presentation.color};">${speed.presentation.label}</span>
                  </p>
                  <p style="margin:10px 0 0 0;font-size:14px;line-height:1.55;color:${MUTED};">
                    ${escapeHtml(speed.line)}
                  </p>
                  ${quizRow}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- The validation. The reason this email exists. -->
        <tr>
          <td style="padding:0 28px 24px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="background:${SURFACE};border-radius:12px;">
              <tr>
                <td style="padding:20px;">
                  <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${MUTED};">
                    Peer-reviewed validation
                  </p>
                  <p style="margin:10px 0 0 0;font-size:15.5px;font-weight:bold;line-height:1.4;color:${INK};">
                    ${escapeHtml(STUDY.title)}
                  </p>
                  <p style="margin:5px 0 0 0;font-size:13px;line-height:1.5;color:${MUTED};">
                    <em>${escapeHtml(STUDY.journal)}</em>, ${STUDY.year} · doi:${escapeHtml(STUDY.doi)}
                  </p>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                         style="margin:18px 0 0 0;">
                    <tr>${figureCells}</tr>
                  </table>

                  <p style="margin:16px 0 0 0;font-size:13.5px;line-height:1.6;color:${INK};">
                    ${escapeHtml(STUDY.comparator)}
                  </p>
                  <p style="margin:8px 0 0 0;font-size:12.5px;line-height:1.55;color:${MUTED};">
                    Cohort: ${escapeHtml(STUDY.cohort)}.<br />
                    ${escapeHtml(STUDY.institution)}
                  </p>

                  <p style="margin:16px 0 0 0;font-size:13.5px;">
                    <a href="${escapeHtml(STUDY.url)}" style="color:#b8480f;font-weight:bold;text-decoration:underline;">
                      Read the paper →
                    </a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 28px 24px 28px;">
            <p style="margin:0;font-size:13.5px;line-height:1.6;color:${MUTED};">
              What you completed is the symbol-matching task — one component of the full
              assessment, which covers processing speed, memory, attention and executive
              function across four games.
            </p>
          </td>
        </tr>
${demoBlock}
        <tr>
          <td style="padding:0 28px 28px 28px;border-top:1px solid #f0e6e1;">
            <p style="margin:18px 0 0 0;font-size:11px;line-height:1.6;color:#a08b81;">
              ${escapeHtml(CLINICAL_DISCLAIMER)}
            </p>
            <p style="margin:14px 0 0 0;font-size:11px;line-height:1.6;color:#a08b81;">
              You're receiving this because you requested your result at ${escapeHtml(BRAND)}.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  return { subject, html, text };
}
