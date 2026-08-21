/**
 * The result email for the Business China Fundraising Golf Tournament
 * (/lite-bcgolf).
 *
 * A third register, because the audience is a third audience. The consumer
 * template explains the result; the clinician template argues for the
 * instrument. This one is a courtesy note to a guest at a black-tie fundraiser
 * who gave us three minutes between lunch and a shotgun start — so it reads
 * like a card from the event, not a lead-nurture email.
 *
 * What "premium" means here concretely, since the word invites gold gradients
 * and does not need them:
 *
 *   Restraint over decoration. One accent hairline, no filled panels competing
 *   for attention, no coloured masthead. The most expensive-looking thing in
 *   print is white space.
 *
 *   Serif at generous leading, and wide letterspacing on the small caps. The
 *   register of an invitation rather than a dashboard.
 *
 *   The result stated once, large, and left alone. The consumer template
 *   surrounds its number with explanation; here the number and a single line
 *   are the whole middle of the email.
 *
 * Numbers are inline rather than behind a link, as in the other templates: the
 * report page reads sessionStorage, so a link opened later on another device
 * would show the empty state.
 *
 * Server-only: imported from the save-lead API route.
 */

import { EVENT } from "src/data/liteBcGolfContent";
import { CLINICAL_DISCLAIMER } from "src/utils/disclaimers";
import {
  BAND_PRESENTATION,
  bandKeyOf,
  escapeHtml,
  ordinalSuffix,
  professionalName,
  safeHttpUrl,
  speedKeyOf,
  type LiteEmailInput,
  type RenderedEmail,
} from "src/server/emails/shared";

/** Georgia is on effectively every mail client; it carries the register. */
const SERIF = "Georgia, 'Times New Roman', Times, serif";

/**
 * A club palette rather than the funnel's orange: deep green ink, a single
 * muted gold hairline, warm paper. Two colours and a rule — anything more
 * starts to look like a promotion.
 */
const PAPER = "#faf7f1";
const CARD = "#ffffff";
const GREEN = "#1d3b2f";
const GOLD = "#a8873f";
const BODY = "#4a4a45";
const FAINT = "#8c8c85";

/** Provenance, in one line. A gala guest does not want a bibliography. */
const PAPER_URL = "https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.70992";
const PROVENANCE =
  "Developed and validated at the Dementia Research Centre, Lee Kong Chian School of Medicine, NTU Singapore, and published in Alzheimer's & Dementia (2026).";

const BAND_WORDING: Record<string, string> = {
  low: "below",
  moderate: "within",
  high: "above",
};

export function renderEventResultEmail(input: LiteEmailInput): RenderedEmail {
  const named = professionalName(input.name);
  const greeting = named ? `Dear ${named},` : "Dear guest,";

  const speedKey = speedKeyOf(typeof input.severity === "string" ? input.severity : null);
  const bandWord = BAND_WORDING[speedKey] ?? "within";
  const percentile = input.percentile;

  const subject = named
    ? `${named} — your brain health result from ${EVENT.shortName}`
    : `Your brain health result from ${EVENT.shortName}`;

  const bandKey = bandKeyOf(input.band);
  const bandPresentation = bandKey ? BAND_PRESENTATION[bandKey] : null;
  const hasQuiz = input.brainHealthScore !== null && bandPresentation !== null;

  // Same precedence as the clinician template: a booking link outranks a demo
  // link, and the loser becomes a text link rather than a second button.
  const bookingUrl = safeHttpUrl(input.bookingUrl);
  const demoUrl = safeHttpUrl(input.demoUrl);
  const primary = bookingUrl
    ? { href: bookingUrl, label: "Arrange a conversation" }
    : demoUrl
      ? { href: demoUrl, label: "See the full assessment" }
      : null;
  const secondary = bookingUrl && demoUrl ? { href: demoUrl, label: "Or see the full assessment" } : null;

  const headline =
    percentile === null
      ? "Your result was recorded."
      : `${percentile}${ordinalSuffix(percentile)} percentile for processing speed, ${bandWord} the range expected for your age.`;

  // --- Plain text. Some clients show only this, so it carries the same facts. ---
  const textLines = [
    greeting,
    "",
    `Thank you for taking part at the ${EVENT.name}.`,
    "",
    ...(percentile === null
      ? ["Your result was recorded but could not be scored against the reference sample."]
      : [
          `PROCESSING SPEED — ${percentile}${ordinalSuffix(percentile).toUpperCase()} PERCENTILE`,
          `${bandWord.charAt(0).toUpperCase()}${bandWord.slice(1)} the range expected for your age, measured against an age-matched sample.`,
        ]),
    ...(hasQuiz
      ? [
          "",
          `Risk factor questionnaire: ${input.brainHealthScore}/100 (${bandPresentation!.label}).`,
          "Lower is better here — the score counts risk, not performance.",
        ]
      : []),
    "",
    "This measured processing speed, one of four cognitive domains, and is a",
    "screen rather than a diagnosis.",
    "",
    PROVENANCE,
    PAPER_URL,
    ...(primary ? ["", `${primary.label}: ${primary.href}`] : []),
    ...(secondary ? [`${secondary.label.replace("Or see", "See")}: ${secondary.href}`] : []),
    "",
    CLINICAL_DISCLAIMER,
    "",
    "— Recog-Lite, Gray Matter Solutions",
    "You are receiving this because you asked us to send your result.",
  ];

  const text = textLines.join("\n");

  // --- HTML. Tables and inline styles: the common denominator across clients. ---
  const quizBlock = hasQuiz
    ? `<tr>
         <td style="padding:28px 44px 0 44px;">
           <p style="margin:0;font-family:${SERIF};font-size:10.5px;letter-spacing:2.2px;text-transform:uppercase;color:${FAINT};">
             Risk factor questionnaire
           </p>
           <p style="margin:9px 0 0 0;font-family:${SERIF};font-size:19px;line-height:1.3;color:${GREEN};">
             ${input.brainHealthScore}<span style="font-size:13px;color:${FAINT};"> / 100</span>
             <span style="font-size:13px;color:${BODY};">&nbsp;·&nbsp;${bandPresentation!.label}</span>
           </p>
           <p style="margin:7px 0 0 0;font-family:${SERIF};font-size:12.5px;line-height:1.6;color:${FAINT};">
             Lower is better here — the score counts risk, not performance.
           </p>
         </td>
       </tr>`
    : "";

  const ctaBlock = primary
    ? `<tr>
         <td style="padding:34px 44px 0 44px;">
           <table role="presentation" cellpadding="0" cellspacing="0" border="0">
             <tr>
               <td align="center" bgcolor="${GREEN}">
                 <a href="${escapeHtml(primary.href)}"
                    style="display:inline-block;padding:14px 32px;font-family:${SERIF};font-size:13.5px;letter-spacing:1.2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                   ${primary.label}
                 </a>
               </td>
             </tr>
           </table>
           ${
             secondary
               ? `<p style="margin:14px 0 0 0;font-family:${SERIF};font-size:12.5px;">
                    <a href="${escapeHtml(secondary.href)}" style="color:${BODY};text-decoration:underline;">${
                   secondary.label
                 }</a>
                  </p>`
               : ""
           }
         </td>
       </tr>`
    : "";

  const html = `<!-- preheader --><div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
    headline
  )}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAPER};margin:0;padding:40px 0;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
             style="max-width:580px;background:${CARD};">
        <!-- A single gold rule across the top. The whole decorative budget. -->
        <tr><td style="height:3px;background:${GOLD};font-size:0;line-height:3px;">&nbsp;</td></tr>

        <tr>
          <td style="padding:40px 44px 0 44px;" align="center">
            <p style="margin:0;font-family:${SERIF};font-size:10.5px;letter-spacing:2.4px;text-transform:uppercase;color:${GOLD};">
              ${escapeHtml(EVENT.shortName)}
            </p>
            <p style="margin:10px 0 0 0;font-family:${SERIF};font-size:12px;line-height:1.6;color:${FAINT};">
              ${escapeHtml(EVENT.date)}<br />${escapeHtml(EVENT.venue)}
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:34px 44px 0 44px;">
            <p style="margin:0;font-family:${SERIF};font-size:16px;line-height:1.6;color:${GREEN};">
              ${escapeHtml(greeting)}
            </p>
            <p style="margin:14px 0 0 0;font-family:${SERIF};font-size:15px;line-height:1.75;color:${BODY};">
              Thank you for taking part at the ${escapeHtml(EVENT.name)}. Your result is below.
            </p>
          </td>
        </tr>

        <!-- The result: stated once, large, and left alone. -->
        <tr>
          <td style="padding:36px 44px 0 44px;" align="center">
            <p style="margin:0;font-family:${SERIF};font-size:10.5px;letter-spacing:2.2px;text-transform:uppercase;color:${FAINT};">
              Processing speed
            </p>
            <p style="margin:14px 0 0 0;font-family:${SERIF};font-size:52px;line-height:1;color:${GREEN};">
              ${percentile === null ? "&mdash;" : percentile}
            </p>
            ${
              percentile === null
                ? `<p style="margin:14px 0 0 0;font-family:${SERIF};font-size:14px;line-height:1.6;color:${BODY};">
                     Recorded, but not scored against the reference sample.
                   </p>`
                : `<p style="margin:8px 0 0 0;font-family:${SERIF};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${FAINT};">
                     ${ordinalSuffix(percentile)} percentile
                   </p>
                   <p style="margin:18px auto 0 auto;max-width:360px;font-family:${SERIF};font-size:14.5px;line-height:1.7;color:${BODY};">
                     ${escapeHtml(
                       `${bandWord.charAt(0).toUpperCase()}${bandWord.slice(1)} the range expected for your age, measured against an age-matched sample.`
                     )}
                   </p>`
            }
          </td>
        </tr>

        <tr>
          <td style="padding:32px 44px 0 44px;">
            <div style="border-top:1px solid #ece7dd;">&nbsp;</div>
          </td>
        </tr>
${quizBlock}
        <tr>
          <td style="padding:28px 44px 0 44px;">
            <p style="margin:0;font-family:${SERIF};font-size:13.5px;line-height:1.75;color:${BODY};">
              This measured processing speed — one of four cognitive domains — and is a screen
              rather than a diagnosis.
            </p>
            <p style="margin:14px 0 0 0;font-family:${SERIF};font-size:12.5px;line-height:1.7;color:${FAINT};">
              ${escapeHtml(PROVENANCE)}
              <a href="${PAPER_URL}" style="color:${BODY};text-decoration:underline;">Read the paper</a>.
            </p>
          </td>
        </tr>
${ctaBlock}
        <tr>
          <td style="padding:36px 44px 40px 44px;">
            <div style="border-top:1px solid #ece7dd;padding-top:18px;">
              <p style="margin:0;font-family:${SERIF};font-size:10.5px;line-height:1.7;color:#a9a9a1;">
                ${escapeHtml(CLINICAL_DISCLAIMER)}
              </p>
              <p style="margin:14px 0 0 0;font-family:${SERIF};font-size:10.5px;line-height:1.7;color:#a9a9a1;">
                Recog-Lite · Gray Matter Solutions. You are receiving this because you asked us
                to send your result.
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
