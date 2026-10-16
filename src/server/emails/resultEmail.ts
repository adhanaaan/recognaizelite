/**
 * The result email every mailing lite funnel sends.
 *
 * Built from Figma "Result Email — ReCOGnAIze Lite" (file LITE-ReCOGnAIze,
 * node 1126:654). It replaces the three templates the funnels used to choose
 * between — the consumer, clinician and golf-event ones — so every funnel now
 * mails the same thing and a copy change is made once.
 *
 * Email HTML, not web HTML: tables for layout and inline styles throughout,
 * because that is what survives Gmail, Outlook and Apple Mail alike. The one
 * <style> block carries only what cannot be inline — the phone layout. Clients
 * that drop it (some webmail) still get the 600px layout, which is fluid
 * (width 100%, max-width 600px), so it narrows rather than scrolling sideways.
 *
 * Below 480px the media query:
 *   - tightens the outer and inner padding,
 *   - stacks each "What happens next" step, text above its photo,
 *   - stacks each video card, thumbnail above its text, as the Figma
 *     component's own note asks ("Stack thumbnail above text below 480px").
 *     The thumbnail keeps its 184px width there rather than filling the
 *     column: the exports are 1x, and stretched they go soft.
 *
 * Images are hosted PNGs under public/images/email, addressed absolutely
 * (EMAIL_ASSET_BASE_URL, falling back to the production host), because a mail
 * client has no base URL to resolve a relative path against. SVG is avoided —
 * Gmail does not render it — and the video play button is baked into each
 * thumbnail, since overlaying one image on another is not reliable in email.
 *
 * The baseline radar is a fixed illustration exported from the design, not the
 * reader's own chart: there is no image rendering on the server to draw one
 * per result. The numbers that are the reader's own — percentile, band, risk
 * score — are live text.
 *
 * Every link opens in a new tab (`target="_blank"`), as asked of the button and
 * the videos; most clients do this for every link anyway.
 *
 * Server-only: imported from the save-lead API route.
 */

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

/** Where the email's images are served from. No trailing slash. */
const ASSET_BASE = (
  safeHttpUrl(process.env.EMAIL_ASSET_BASE_URL) ?? "https://recognaizelite.vercel.app"
).replace(/\/+$/, "");
const asset = (file: string) => `${ASSET_BASE}/images/email/${file}`;

const CTA_URL = "https://graymattercognition.com";
const CONTACT_EMAIL = "tech@graymattercognition.com";

const VIDEOS = [
  {
    href: "https://www.youtube.com/watch?v=rjKh8dx8OAE&t=1s",
    thumb: "video-mci.png",
    title: "What is Mild Cognitive Impairment (MCI)?",
    body: "What MCI is, how it differs from normal ageing and dementia, and why catching it early matters.",
  },
  {
    href: "https://www.youtube.com/watch?v=7vOrCA7IHoo",
    thumb: "video-perimenopause.png",
    title: "Brain fog in perimenopause",
    body: "Our co-founder Adnan with Dr Laurena Law on spotting brain changes early, including perimenopause brain fog.",
  },
] as const;

const STEPS = [
  { label: "STEP 1", title: "Book your full screening from our booth", body: null, image: null },
  {
    label: "STEP 2",
    title: "Play a 10 minute brain health game",
    body: "Test your memory, attention, and decision making.",
    image: { file: "step-2-games.png", alt: "The ReCOGnAIze games on a tablet" },
  },
  {
    label: "STEP 3",
    title: "Get the full report",
    body: "Review your brain performance with actionable ways to improve.",
    image: { file: "step-3-report.png", alt: "A page of the full ReCOGnAIze report" },
  },
] as const;

const QUOTE =
  "Each of these games measures a specific brain function the same way I would assess it in clinic. We are not testing whether you can play, we are testing how well each part of your brain is doing the work it does for you every day.";

const DISCLAIMER =
  "This report is for wellness screening and education only. It does not diagnose any medical condition or replace a medical evaluation. Please read your results together with a clinical consultation, a lifestyle assessment and, where appropriate, a biomedical evaluation.";

// --- The design's tokens, as raw values: email has no CSS variables. ---
const FONT = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";
const PRIMARY = "#f77528"; // primary/core
const DEEP = "#b8480f"; // keypad/deep — the stat, the button, links
const INK = "#2d2d2d"; // ink/charcoal
const MUTED = "#7d5747"; // secondary/core
const PILL_BG = "#faece7"; // pill/bg
const PILL_TEXT = "#993c1d"; // pill/text
const SURFACE_LOW = "#fff1eb"; // surface/low
const OUTLINE = "#d8c2b9"; // outline/variant
const QUOTE_INK = "#1c110a";
const QUOTE_MARK = "#ffce9b";
const CAPTION = "#8a6a58";
const RADAR_EYEBROW = "#b4653c";
const RADAR_MUTED = "#b79c8e";
const TRACK = "#f6e4d8";

/** How the pill under the percentile reads, per speed band. */
const RANGE_WORDING: Record<string, string> = {
  high: "Above the expected range for your age",
  moderate: "Within the expected range for your age",
  low: "Below the expected range for your age",
};

const eyebrow = (text: string, extra = "") =>
  `<p style="margin:0;font-family:${FONT};font-size:11px;font-weight:700;line-height:1.3;letter-spacing:2.2px;color:${PILL_TEXT};${extra}">${text}</p>`;

const h3 = (html: string) =>
  `<p style="margin:8px 0 0 0;font-family:${FONT};font-size:24px;font-weight:800;line-height:1.17;color:${INK};">${html}</p>`;

const body = (html: string, top = 12) =>
  `<p style="margin:${top}px 0 0 0;font-family:${FONT};font-size:15px;line-height:1.625;color:${INK};">${html}</p>`;

const pill = (text: string) =>
  `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${PILL_BG};font-family:${FONT};font-size:13px;font-weight:600;line-height:1.375;color:${PILL_TEXT};">${text}</span>`;

const divider = (top: number, bottom: number) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${top}px 0 ${bottom}px 0;"><tr><td style="height:1px;line-height:1px;font-size:0;background:${OUTLINE};">&nbsp;</td></tr></table>`;

const link = (href: string, inner: string, style: string) =>
  `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="${style}">${inner}</a>`;

export function renderResultEmail(input: LiteEmailInput): RenderedEmail {
  const named = professionalName(input.name);
  const greeting = named ? `Hi ${named},` : "Hi there,";

  const percentile = input.percentile;
  const speedKey = speedKeyOf(typeof input.severity === "string" ? input.severity : null);
  const rangeText = RANGE_WORDING[speedKey] ?? RANGE_WORDING.moderate;

  const bandKey = bandKeyOf(input.band);
  const bandPresentation = bandKey ? BAND_PRESENTATION[bandKey] : null;
  const hasQuiz = input.brainHealthScore !== null && bandPresentation !== null;

  // The occasion, for funnels tied to one (/lite-bcgolf). The others are links
  // reused across many settings and name none.
  const event = input.event ?? null;
  const thanks = event
    ? `Thanks for taking the ReCOGnAIze Lite at the ${event.name}. Here are your results:`
    : "Thanks for taking the ReCOGnAIze Lite. Here are your results:";

  const subject = named ? `${named}, your ReCOGnAIze result` : "Your ReCOGnAIze result";

  const percentileLabel = percentile === null ? null : `${percentile}${ordinalSuffix(percentile)}`;
  // "Faster than about 0 in 100" reads as an insult rather than a result, so
  // the comparison is only spelled out from 1 upwards.
  const comparison =
    percentile !== null && percentile >= 1
      ? `You were faster than about ${percentile} in 100 people your age. We compared your score with a sample of people the same age as you.`
      : "We compared your score with a sample of people the same age as you.";

  const preheader =
    percentileLabel === null
      ? "Your ReCOGnAIze Lite result is inside."
      : `${percentileLabel} percentile for processing speed. ${rangeText}.`;

  // --- Plain text. Some clients show only this, so it carries the same facts. ---
  const text = [
    greeting,
    "",
    thanks,
    "",
    ...(percentileLabel === null
      ? ["PROCESSING SPEED: recorded, but not scored against the reference sample."]
      : [`PROCESSING SPEED: ${percentileLabel} percentile`, `${rangeText}.`, comparison]),
    ...(hasQuiz
      ? [
          "",
          `RISK FACTOR QUESTIONNAIRE: ${input.brainHealthScore} / 100 (${bandPresentation!.label})`,
          "Lower is better here. This score adds up risk factors. It does not measure how well you performed.",
        ]
      : []),
    "",
    "YOUR BASELINE SO FAR: You've only covered 2 out of 5",
    "The speed game and your quiz answers gave us two axes: speed and risk.",
    "But your brain doesn't work on two dimensions. Memory, attention, and executive function each tell a different story, and you can score well on one while struggling with another.",
    "The full test fills in the rest, so your recommendations actually match your brain.",
    "",
    "TAKE THE TEST: What do you do now? Take the full ReCOGnAIze assessment",
    "Built on 5 years of research from Nanyang Technological University and validated against MRI brain scans.",
    "",
    "WHAT HAPPENS NEXT: From screening to answers",
    ...STEPS.map((s) => `${s.label}: ${s.title}${s.body ? ` ${s.body}` : ""}`),
    "",
    `"${QUOTE}"`,
    "A/Prof Nagaendran Kandiah, Co-founder, Gray Matter Solutions",
    "",
    `Learn more about ReCOGnAIze: ${CTA_URL}`,
    "",
    "A LITTLE MORE ON BRAIN HEALTH",
    ...VIDEOS.map((v) => `${v.title}: ${v.href}`),
    "",
    `Questions? Write to ${CONTACT_EMAIL}.`,
    "",
    "Warm regards,",
    "The Gray Matter Solutions team",
    "",
    DISCLAIMER,
    "ReCOGnAIze Lite · Gray Matter Solutions. You're getting this email because you asked us to send your result.",
  ].join("\n");

  // --- HTML ---
  const speedCard = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SURFACE_LOW};border-radius:16px;">
  <tr>
    <td class="card-pad" align="center" style="padding:24px;text-align:center;">
      ${eyebrow("PROCESSING SPEED", "text-align:center;")}
      ${
        percentileLabel === null
          ? `<p style="margin:8px 0 0 0;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">Recorded, but not scored against the reference sample.</p>`
          : `<p class="stat" style="margin:8px 0 0 0;font-family:${FONT};font-size:60px;font-weight:800;line-height:1.1;color:${DEEP};">${percentileLabel}</p>
      <p style="margin:8px 0 0 0;font-family:${FONT};font-size:15px;font-weight:600;line-height:1.375;color:${MUTED};">percentile</p>
      <p style="margin:8px 0 0 0;">${pill(rangeText)}</p>
      <p style="margin:8px 0 0 0;font-family:${FONT};font-size:14.5px;line-height:1.6;color:${INK};">${comparison}</p>`
      }
    </td>
  </tr>
</table>`;

  const riskCard = hasQuiz
    ? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;background:#ffffff;border:1px solid ${OUTLINE};border-radius:16px;">
  <tr>
    <td class="card-pad" style="padding:24px;">
      ${eyebrow("RISK FACTOR QUESTIONNAIRE")}
      <p style="margin:8px 0 0 0;font-family:${FONT};line-height:1.6;color:${MUTED};">
        <span style="font-size:30px;font-weight:800;line-height:1;color:${INK};">${input.brainHealthScore}</span>
        <span style="font-size:14.5px;">&nbsp;/ 100&nbsp;&nbsp;</span>
        ${pill(escapeHtml(bandPresentation!.label))}
      </p>
      <p style="margin:8px 0 0 0;font-family:${FONT};font-size:13.5px;line-height:1.625;color:${MUTED};">Lower is better here. This score adds up risk factors. It does not measure how well you performed.</p>
    </td>
  </tr>
</table>`
    : "";

  const baseline = `
${eyebrow("YOUR BASELINE SO FAR")}
${h3(`You've only covered <span style="color:${DEEP};">2 out of 5</span>`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;background:#ffffff;border:1px solid ${OUTLINE};border-radius:16px;">
  <tr>
    <td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family:${FONT};font-size:11px;font-weight:800;line-height:1.4;letter-spacing:1.98px;color:${RADAR_EYEBROW};">YOUR BASELINE</td>
          <td align="right" style="font-family:${FONT};font-size:11px;font-weight:800;line-height:1.4;letter-spacing:1.98px;color:${RADAR_MUTED};">2 OF 5 DONE</td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;background:${TRACK};border-radius:999px;">
        <tr>
          <td width="40%" style="height:6px;line-height:6px;font-size:0;border-radius:999px;background:#f9550f;background-image:linear-gradient(90deg,#ff8a1f,#f9550f 52%,#d62f16);">&nbsp;</td>
          <td width="60%" style="height:6px;line-height:6px;font-size:0;">&nbsp;</td>
        </tr>
      </table>
      <p style="margin:16px 0 0 0;text-align:center;">
        <img src="${asset("baseline-radar.png")}" width="302" height="236" alt="Your baseline: speed and risk safety filled in; memory, attention and decision making still to measure" style="display:inline-block;width:302px;max-width:100%;height:auto;border:0;" />
      </p>
    </td>
  </tr>
</table>
${body("The speed game and your quiz answers gave us two axes: speed and risk.", 16)}
${body("But your brain doesn't work on two dimensions. Memory, attention, and executive function each tell a different story, and you can score well on one while struggling with another.")}
${body("The full test fills in the rest, so your recommendations actually match your brain.")}`;

  const credibility = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;background:#ffffff;border:1px solid ${OUTLINE};border-radius:12px;">
  <tr>
    <td align="center" style="padding:16px 12px;">
      <!-- One row of three cells rather than inline images, so the logos never
           wrap onto a second line on a narrow phone. -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td valign="middle"><img src="${asset("logo-gms-ntu.png")}" width="139" height="24" alt="Gray Matter Solutions, a spin-off from Nanyang Technological University" style="display:block;width:139px;height:auto;border:0;" /></td>
          <td class="logo-gap" width="18" style="width:18px;font-size:0;">&nbsp;</td>
          <td valign="middle"><img src="${asset("logo-lkc-drc.png")}" width="64" height="24" alt="Lee Kong Chian School of Medicine, Dementia Research Centre" style="display:block;width:64px;height:auto;border:0;" /></td>
          <td class="logo-gap" width="18" style="width:18px;font-size:0;">&nbsp;</td>
          <td valign="middle"><img src="${asset("logo-pubmed.png")}" width="47" height="16" alt="PubMed" style="display:block;width:47px;height:auto;border:0;" /></td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  const stepRows = STEPS.map((step, i) => {
    const text = `
${eyebrow(step.label)}
<p style="margin:4px 0 0 0;font-family:${FONT};font-size:15px;font-weight:600;line-height:1.375;color:${INK};">${step.title}</p>
${step.body ? `<p style="margin:4px 0 0 0;font-family:${FONT};font-size:13.5px;line-height:1.625;color:${MUTED};">${step.body}</p>` : ""}`;
    const row = step.image
      ? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="stack" valign="middle" style="vertical-align:middle;padding-right:16px;">${text}</td>
    <td class="stack stack-gap" width="200" valign="middle" style="width:200px;vertical-align:middle;">
      <img class="fluid" src="${asset(step.image.file)}" width="200" height="134" alt="${step.image.alt}" style="display:block;width:200px;max-width:100%;height:auto;border:1px solid ${OUTLINE};border-radius:12px;" />
    </td>
  </tr>
</table>`
      : text;
    return i === 0 ? row : `${divider(16, 16)}${row}`;
  }).join("");

  const quoteCard = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;background:${SURFACE_LOW};border:1px solid ${OUTLINE};border-radius:16px;">
  <tr>
    <td class="card-pad" style="padding:24px;">
      <p style="margin:0;font-family:${FONT};font-size:40px;font-weight:800;line-height:1;color:${QUOTE_MARK};">&ldquo;&rdquo;</p>
      <p style="margin:6px 0 0 0;font-family:${FONT};font-size:15px;line-height:1.6;color:${QUOTE_INK};">${QUOTE}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
        <tr>
          <td valign="middle" style="padding-right:12px;">
            <img src="${asset("prof-nagaendran.png")}" width="48" height="48" alt="" style="display:block;width:48px;height:48px;border-radius:999px;border:0;" />
          </td>
          <td valign="middle">
            <p style="margin:0;font-family:${FONT};font-size:14px;font-weight:800;line-height:1.3;color:${QUOTE_INK};">A/Prof Nagaendran Kandiah</p>
            <p style="margin:3px 0 0 0;font-family:${FONT};font-size:11.5px;line-height:1.6;color:${CAPTION};">Co-founder, Gray Matter Solutions<br />MBBS, FAMS (Neurology), FRCP (Edin)</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  const cta = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
  <tr>
    <td align="center" bgcolor="${DEEP}" style="border-radius:12px;background:${DEEP};">
      ${link(
        CTA_URL,
        "Learn more about ReCOGnAIze",
        `display:inline-block;padding:16px 32px;font-family:${FONT};font-size:16px;font-weight:700;line-height:1;letter-spacing:0.4px;color:#ffffff;text-decoration:none;border-radius:12px;`
      )}
    </td>
  </tr>
</table>`;

  const videoRows = VIDEOS.map((v, i) => {
    const row = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="stack" width="184" valign="middle" style="width:184px;vertical-align:middle;">
      ${link(
        v.href,
        `<img src="${asset(v.thumb)}" width="184" height="104" alt="Play video: ${escapeHtml(v.title)}" style="display:block;width:184px;max-width:100%;height:auto;border:0;border-radius:12px;" />`,
        "text-decoration:none;"
      )}
    </td>
    <td class="stack stack-gap" valign="middle" style="vertical-align:middle;padding-left:16px;">
      ${link(
        v.href,
        escapeHtml(v.title),
        `display:block;font-family:${FONT};font-size:15px;font-weight:600;line-height:1.375;color:${INK};text-decoration:none;`
      )}
      <p style="margin:4px 0 0 0;font-family:${FONT};font-size:13.5px;line-height:1.625;color:${MUTED};">${escapeHtml(v.body)}</p>
      <p style="margin:4px 0 0 0;">${link(
        v.href,
        "Watch the video",
        `font-family:${FONT};font-size:13px;font-weight:600;line-height:1.375;color:${DEEP};text-decoration:underline;`
      )}</p>
    </td>
  </tr>
</table>`;
    return i === 0 ? row : `${divider(16, 16)}${row}`;
  }).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  img { -ms-interpolation-mode:bicubic; }
  a { color:${DEEP}; }
  @media only screen and (max-width:480px) {
    .outer-pad { padding:16px 8px !important; }
    .body-pad { padding:32px 20px 24px 20px !important; }
    .card-pad { padding:20px !important; }
    .stat { font-size:52px !important; }
    .stack { display:block !important; width:100% !important; padding-left:0 !important; padding-right:0 !important; }
    .stack-gap { padding-top:12px !important; }
    .fluid { width:100% !important; height:auto !important; }
    .logo-gap { width:10px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#fff4ee;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fff4ee" style="background:#fff4ee;background-image:linear-gradient(180deg,#fff4ee 0%,#fff8f6 50%,#fbe7de 100%);">
  <tr>
    <td class="outer-pad" align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:24px;">
        <tr>
          <td class="body-pad" style="padding:40px 40px 32px 40px;">

            <!-- Header -->
            <p style="margin:0;text-align:center;font-family:${FONT};font-size:27px;font-weight:800;line-height:1.12;color:${PRIMARY};">ReCOGnAIze</p>
            <p style="margin:4px 0 0 0;text-align:center;font-family:${FONT};font-size:12.5px;line-height:1.375;color:${MUTED};">by Gray Matter Solutions</p>

            <!-- Intro -->
            ${body(escapeHtml(greeting), 32)}
            ${body(escapeHtml(thanks))}

            <!-- Results -->
            <div style="margin-top:32px;">${speedCard}${riskCard}</div>

            <!-- Your baseline -->
            <div style="margin-top:32px;">${baseline}</div>

            <!-- Take the full test -->
            <div style="margin-top:32px;">
              ${eyebrow("TAKE THE TEST")}
              ${h3("What do you do now? Take the full ReCOGnAIze assessment")}
              ${body("Built on 5 years of research from Nanyang Technological University and validated against MRI brain scans.", 16)}
              ${credibility}
              <div style="padding-top:32px;">
                ${eyebrow("WHAT HAPPENS NEXT")}
                ${h3("From screening to answers")}
              </div>
              <div style="margin-top:16px;">${stepRows}</div>
              ${quoteCard}
            </div>

            <!-- CTA -->
            <div style="margin-top:32px;">${cta}</div>

            <!-- Videos -->
            <div style="margin-top:32px;">
              <p style="margin:0;font-family:${FONT};font-size:24px;font-weight:800;line-height:1.17;color:${INK};">A little more on brain health</p>
              <p style="margin:16px 0 16px 0;font-family:${FONT};font-size:13.5px;line-height:1.625;color:${MUTED};">Short videos from our team on looking after your brain.</p>
              ${videoRows}
            </div>

            <!-- Closing -->
            <p style="margin:32px 0 0 0;font-family:${FONT};font-size:14.5px;line-height:1.6;color:${INK};">Questions? Write to ${link(
              `mailto:${CONTACT_EMAIL}`,
              CONTACT_EMAIL,
              `color:${DEEP};text-decoration:underline;`
            )}.</p>
            <p style="margin:16px 0 0 0;font-family:${FONT};font-size:14.5px;line-height:1.6;color:${INK};">Warm regards,</p>
            <p style="margin:4px 0 0 0;font-family:${FONT};font-size:15px;font-weight:600;line-height:1.375;color:${INK};">The Gray Matter Solutions team</p>

            <!-- Footer -->
            ${divider(32, 16)}
            <img src="${asset("logo-gms-ntu.png")}" width="250" height="43" alt="Gray Matter Solutions, a spin-off from Nanyang Technological University, Singapore" style="display:block;width:250px;max-width:100%;height:auto;border:0;" />
            <p style="margin:16px 0 0 0;font-family:${FONT};font-size:11.5px;line-height:1.375;color:${MUTED};">${DISCLAIMER}</p>
            <p style="margin:16px 0 0 0;font-family:${FONT};font-size:11.5px;line-height:1.375;color:${MUTED};">ReCOGnAIze Lite · Gray Matter Solutions. You're getting this email because you asked us to send your result.</p>

          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
