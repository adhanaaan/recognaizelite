/**
 * The result email every mailing lite funnel sends.
 *
 * Built from Figma "GMS Email — Mini Check-in v1.2" (file LITE-ReCOGnAIze,
 * node 1145:1237). Every funnel in EMAIL_CLINICS (src/server/liteLeadEmail.ts)
 * renders this one template, so a copy change is made once.
 *
 * Email HTML, not web HTML: tables for layout and inline styles throughout,
 * because that is what survives Gmail, Outlook and Apple Mail alike. The one
 * <style> block carries only what cannot be inline — the phone layout. Clients
 * that drop it still get the 600px layout, which is fluid (width 100%,
 * max-width 600px), so it narrows rather than scrolling sideways.
 *
 * Below 480px the media query tightens the padding, shrinks the serif
 * headline, and stacks what sits side by side on desktop: the percentile and
 * its pill, the two halves of the quiz-coverage panel, and each video row
 * (thumbnail first — the second row is laid out right-to-left on desktop so
 * that its thumbnail still comes first when stacked). Stacked thumbnails keep
 * their 240px width rather than filling the column: the exports are 1x, and
 * stretched they go soft.
 *
 * What is the reader's own and what is fixed:
 *   - Live: the greeting name, the percentile and its range pill, the risk
 *     score's place on the meter, its band and the band's wording, and the
 *     "What's driving this" factors (the scoring engine's labels, passed in
 *     from /api/save-lead). The risk card is left out when there is no quiz.
 *   - Fixed: everything else, including the report-page collage and the
 *     Instagram tiles, which are images exported from the design.
 *
 * Images are hosted PNGs under public/images/email, addressed absolutely
 * (EMAIL_ASSET_BASE_URL, falling back to the production host), because a mail
 * client has no base URL to resolve a relative path against. Icons are PNGs
 * too: Gmail does not render SVG.
 *
 * Every link opens in a new tab (`target="_blank"`).
 *
 * Server-only: imported from the save-lead API route.
 */

import {
  bandKeyOf,
  escapeHtml,
  ordinalSuffix,
  professionalName,
  safeHttpUrl,
  speedKeyOf,
  type BandKey,
  type LiteEmailInput,
  type RenderedEmail,
} from "src/server/emails/shared";

/** Where the email's images are served from. No trailing slash. */
const ASSET_BASE = (
  safeHttpUrl(process.env.EMAIL_ASSET_BASE_URL) ?? "https://recognaizelite.vercel.app"
).replace(/\/+$/, "");
const asset = (file: string) => `${ASSET_BASE}/images/email/${file}`;

const SITE_URL = "https://graymattercognition.com";
const CONTACT_EMAIL = "tech@graymattercognition.com";
const INSTAGRAM_URL = "https://www.instagram.com/graymatter.solutions";
/**
 * The footer's LinkedIn and YouTube buttons. Set to null to leave one out of
 * the mail — a social button that goes nowhere is worse than none.
 */
const LINKEDIN_URL: string | null = "https://www.linkedin.com/company/graymattercognition";
const YOUTUBE_URL: string | null = "https://www.youtube.com/@adnanazammd";

const VIDEOS = [
  {
    href: "https://www.youtube.com/watch?v=rjKh8dx8OAE&t=1s",
    thumb: "video-mci.png",
    title: "What is Mild Cognitive Impairment (MCI)?",
    body: "How it differs from normal ageing and dementia, and why catching it early matters.",
  },
  {
    href: "https://www.youtube.com/watch?v=7vOrCA7IHoo",
    thumb: "video-perimenopause.png",
    title: "Brain fog during perimenopause",
    body: "What does brain fog during perimenopause actually mean, and how do you work out what might be contributing to it?",
  },
] as const;

const INSTAGRAM_TILES = [
  { file: "ig-event.png", alt: "Instagram: Brain Health & Mahjong Day event" },
  { file: "ig-research.png", alt: "Instagram: Perimenopause. Losing your words?" },
  { file: "ig-community.png", alt: "Instagram: World Alzheimer's Month community event" },
] as const;

// --- The design's tokens, as raw values: email has no CSS variables. ---
const SANS = "Inter, Arial, Helvetica, sans-serif";
const SERIF = "'Source Serif 4', Georgia, 'Times New Roman', serif";
const JAKARTA = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";

const PAGE = "#eceff2"; // color/bg/page
const TEXT_PRIMARY = "#1b2430"; // color/text/primary, color/bg/inverse
const TEXT_BODY = "#4a5462"; // color/text/body
const TEXT_MUTED = "#6b7685"; // color/text/muted
const TEXT_ACCENT = "#c2531f"; // color/text/accent
const EMBER = "#e8622a"; // color/brand/ember
const CTA_BG = "#b4532a"; // color/bg/cta
const BORDER_SUBTLE = "#e3e7ec"; // color/border/subtle
const BORDER_ACCENT = "#f0a47e"; // color/border/accent
const BG_SUBTLE = "#f7f8fa"; // color/bg/subtle

// The score cards keep the Lite report's palette, as the design does.
const OUTLINE = "#d8c2b9"; // outline/variant
const PILL_BG = "#faece7"; // pill/bg
const PILL_TEXT = "#993c1d"; // pill/text
const INK = "#2d2d2d"; // ink/charcoal
const SECONDARY = "#7d5747"; // secondary/core
const DEEP = "#b8480f"; // keypad/deep
const TRACK = "#fff1eb"; // surface/low

/** The meter's four segments, left (higher risk) to right (lower risk). */
const METER: { band: BandKey; color: string }[] = [
  { band: "high", color: "#f09595" },
  { band: "elevated", color: "#ef9f27" },
  { band: "moderate", color: "#fac775" },
  { band: "low", color: "#97c459" },
];

/** How the pill beside the percentile reads, per speed band. */
const RANGE_WORDING: Record<string, string> = {
  high: "Above the expected range for your age",
  moderate: "Within the expected range for your age",
  low: "Below the expected range for your age",
};

/**
 * Factors the quiz scores that a reader cannot change. They still count
 * towards the score, but this email talks about "movable levers", so they are
 * left out of that sentence and of the pills.
 */
const NOT_MODIFIABLE = new Set(["Age", "Family history", "Hormonal changes"]);
/** The engine's labels, as the design words them. */
const FACTOR_WORDING: Record<string, string> = { Exercise: "Physical activity" };
const MAX_FACTORS = 4;

/** "Sleep", "Sleep and diet", "Sleep, physical activity, blood pressure and diet". */
function factorList(labels: string[]): string {
  const words = labels.map((l, i) => (i === 0 ? l : l.charAt(0).toLowerCase() + l.slice(1)));
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/**
 * The paragraph under the meter. Moderate is the design's wording; the other
 * three bands follow its shape. The factor sentence is dropped when the quiz
 * surfaced no modifiable factor.
 */
function bandParagraph(band: BandKey, factors: string[]): string {
  const list = factorList(factors);
  const plural = factors.length > 1;
  const levers = factors.length
    ? ` ${list} ${plural ? "are the most movable levers" : "is the most movable lever"}, and that's where most of your risk is coming from.`
    : "";
  switch (band) {
    case "low":
      return `Few of the modifiable factors we asked about are affecting your brain health right now.${
        factors.length ? ` ${list} ${plural ? "are the ones" : "is the one"} worth keeping an eye on.` : ""
      } A clinically grounded check in gives you a baseline to hold that position against.`;
    case "moderate":
      return `A handful of modifiable factors are affecting your brain health performance.${levers} A clinically grounded check in now keeps every option open and tells you exactly what's worth focusing on first.`;
    case "elevated":
      return `Several modifiable factors are affecting your brain health performance.${levers} A clinically grounded check in now tells you exactly what's worth focusing on first.`;
    case "high":
      return `Many of the modifiable factors we asked about are affecting your brain health performance.${levers} A clinically grounded check in soon is worth making a priority: it tells you exactly where to start.`;
  }
}

const BAND_NAME: Record<BandKey, string> = {
  low: "LOW RISK",
  moderate: "MODERATE RISK",
  elevated: "ELEVATED RISK",
  high: "HIGH RISK",
};

const link = (href: string, inner: string, style: string) =>
  `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="${style}">${inner}</a>`;

const divider = () =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;"><tr><td style="height:1px;line-height:1px;font-size:0;background:${BORDER_SUBTLE};">&nbsp;</td></tr></table>`;

const sectionEyebrow = (text: string, color = TEXT_ACCENT, weight = 700) =>
  `<p style="margin:0;font-family:${SANS};font-size:12px;font-weight:${weight};line-height:16px;letter-spacing:2px;color:${color};">${text}</p>`;

const serifHeading = (text: string, weight = 600) =>
  `<p style="margin:16px 0 0 0;font-family:${SERIF};font-size:26px;font-weight:${weight};line-height:32px;color:${TEXT_PRIMARY};">${text}</p>`;

const cardEyebrow = (text: string) =>
  `<p style="margin:0;font-family:${JAKARTA};font-size:11px;font-weight:700;line-height:1.3;letter-spacing:2.2px;color:${PILL_TEXT};">${text}</p>`;

const checkItem = (label: string, top: number) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:${top}px;">
  <tr>
    <td width="20" valign="top" style="width:20px;vertical-align:top;"><img src="${asset("icon-check.png")}" width="20" height="20" alt="" style="display:block;width:20px;height:20px;border:0;" /></td>
    <td valign="top" style="padding-left:12px;font-family:${SANS};font-size:15px;line-height:20px;color:${TEXT_BODY};">${label}</td>
  </tr>
</table>`;

const notCoveredItem = (label: string) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
  <tr>
    <td width="20" valign="middle" style="width:20px;vertical-align:middle;"><img src="${asset("icon-not-covered.png")}" width="20" height="20" alt="" style="display:block;width:20px;height:20px;border:0;" /></td>
    <td valign="middle" style="padding-left:12px;font-family:${SANS};font-size:15px;font-weight:500;line-height:20px;color:#ffffff;">${label}</td>
  </tr>
</table>`;

export function renderResultEmail(input: LiteEmailInput): RenderedEmail {
  const named = professionalName(input.name);
  const greeting = named ? `Hi ${named},` : "Hi there,";
  const subject = named ? `${named}, your ReCOGnAIze result` : "Your ReCOGnAIze result";

  const percentile = input.percentile;
  const percentileLabel = percentile === null ? null : `${percentile}${ordinalSuffix(percentile)}`;
  const speedKey = speedKeyOf(typeof input.severity === "string" ? input.severity : null);
  const rangeText = RANGE_WORDING[speedKey] ?? RANGE_WORDING.moderate;
  // "Faster than about 0 in 100" reads as an insult rather than a result, so
  // the comparison is only spelled out from 1 upwards.
  const comparison =
    percentile !== null && percentile >= 1
      ? `You were faster than about ${percentile} in 100 people your age. We compared your score with a sample of people the same age as you.`
      : "We compared your score with a sample of people the same age as you.";

  const bandKey = bandKeyOf(input.band);
  const score = input.brainHealthScore;
  const hasQuiz = score !== null && bandKey !== null;
  const factors = (input.drivingFactors ?? [])
    .filter((f) => !NOT_MODIFIABLE.has(f))
    .map((f) => FACTOR_WORDING[f] ?? f)
    .slice(0, MAX_FACTORS);
  const bandText = hasQuiz ? bandParagraph(bandKey!, factors) : null;

  const preheader =
    percentileLabel === null
      ? "You just did something most people postpone for years."
      : `${percentileLabel} percentile for processing speed. ${rangeText}.`;

  // --- Plain text. Some clients show only this, so it carries the same facts. ---
  const text = [
    greeting,
    "",
    "You just did something most people postpone for years.",
    "",
    "You took a quiz to see where your brain health stands. Here are your results:",
    "",
    ...(percentileLabel === null
      ? ["PROCESSING SPEED: recorded, but not scored against the reference sample."]
      : [`PROCESSING SPEED: ${percentileLabel} percentile. ${rangeText}.`, comparison]),
    ...(hasQuiz
      ? [
          "",
          `RISK FACTOR QUESTIONNAIRE: ${BAND_NAME[bandKey!]} of modifiable factors affecting your brain health (based on the 2024 L.C. report & CAIDE Risk Model)`,
          bandText!,
          ...(factors.length ? [`What's driving this: ${factors.join(", ")}`] : []),
        ]
      : []),
    "",
    "This score reflects your performance of processing speed and overall risk factors affecting your brain health.",
    "Self-report correlates only moderately with measured cognitive performance. A high score does not rule out change, and a low score does not confirm impairment.",
    "",
    "What this quiz shows: processing speed, modifiable risk factors.",
    "What this quiz does not cover: attention, executive function, memory.",
    "",
    "Knowing your brain health score is only the first step. What you need to do is to measure your baseline accurately so that you can take real action.",
    "",
    "THE FULL PICTURE: Take the complete brain health assessment",
    "ReCOGnAIze brain health assessment. Developed at NTU's Dementia Research Centre. Validated against MRI scans, registered with Singapore's HSA.",
    "- Clinically validated neuroscientific games that detect specific brain functions",
    "- A full in-depth report with review and recommendations",
    `Book now: ${SITE_URL}`,
    "",
    "WATCH AND LEARN: A little more on brain health",
    ...VIDEOS.map((v) => `${v.title}: ${v.href}`),
    "",
    "STAY IN THE LOOP: Join us at our next brain health event",
    `We run brain health events built on what the research shows, from exercise and sleep to stress, nutrition and more. Follow @graymatter.solutions on Instagram to see what's coming up and save your spot early: ${INSTAGRAM_URL}`,
    "",
    "Adnan Azam Mohammed",
    "Co-founder and CEO, Gray Matter Solutions",
    "PhD Candidate, Lee Kong Chian School of Medicine",
    `Learn more about Gray Matter Solutions: ${SITE_URL}`,
    "",
    "© 2026 Gray Matter Solutions. All rights reserved.",
  ].join("\n");

  // --- HTML ---

  const speedCard = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid ${OUTLINE};border-radius:16px;">
  <tr>
    <td class="card-pad" style="padding:24px;">
      ${cardEyebrow("PROCESSING SPEED")}
      ${
        percentileLabel === null
          ? `<p style="margin:8px 0 0 0;font-family:${JAKARTA};font-size:14.5px;line-height:1.6;color:${INK};">Recorded, but not scored against the reference sample.</p>`
          : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
        <tr>
          <td class="stack" valign="middle" style="vertical-align:middle;white-space:nowrap;">
            <span style="font-family:${JAKARTA};font-size:30px;font-weight:800;line-height:1;color:${INK};">${percentileLabel}</span>
            <span style="font-family:${JAKARTA};font-size:15px;font-weight:600;line-height:1.375;color:${SECONDARY};">&nbsp;percentile</span>
          </td>
          <td class="stack stack-gap stack-left" align="right" valign="middle" style="vertical-align:middle;text-align:right;">
            <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${PILL_BG};font-family:${JAKARTA};font-size:13px;font-weight:600;line-height:1.375;color:${PILL_TEXT};">${rangeText}</span>
          </td>
        </tr>
      </table>
      <p style="margin:8px 0 0 0;font-family:${JAKARTA};font-size:14.5px;line-height:1.6;color:${INK};">${comparison}</p>`
      }
    </td>
  </tr>
</table>`;

  // The meter: four equal segments, higher risk on the left. The marker sits
  // just above the bar at the score's place on it — overlapping the bar, as
  // the design draws it, needs positioning that email clients do not honour.
  let riskCard = "";
  if (hasQuiz) {
    const position = Math.min(97, Math.max(0, Math.round(100 - score!)));
    const segments = METER.map(
      (m, i) =>
        `<td width="25%" style="height:16px;line-height:16px;font-size:0;background:${m.color};${
          i === 0 ? "border-radius:999px 0 0 999px;" : i === METER.length - 1 ? "border-radius:0 999px 999px 0;" : ""
        }">&nbsp;</td>`
    ).join("");
    const pills = factors
      .map(
        (f) =>
          `<span style="display:inline-block;margin:0 8px 8px 0;padding:6px 14px;border-radius:999px;background:${PILL_BG};font-family:${JAKARTA};font-size:14px;font-weight:600;line-height:20px;color:${PILL_TEXT};">${escapeHtml(f)}</span>`
      )
      .join("");
    riskCard = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;background:#ffffff;border:1px solid ${OUTLINE};border-radius:16px;">
  <tr>
    <td class="card-pad" style="padding:24px;">
      ${cardEyebrow("RISK FACTOR QUESTIONNAIRE")}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
        <tr>
          <td valign="middle" style="padding:0 8px;vertical-align:middle;"><img src="${asset("icon-shield.png")}" width="20" height="20" alt="" style="display:block;width:20px;height:20px;border:0;" /></td>
          <td valign="middle" style="vertical-align:middle;font-family:${JAKARTA};font-size:13px;font-weight:600;line-height:1.375;color:${DEEP};">Based on the 2024 L.C. report &amp; CAIDE Risk Model</td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="meter-pad" style="padding:28px 24px 0 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="${position}%" style="font-size:0;line-height:0;">&nbsp;</td>
                <td width="16" style="width:16px;"><div style="width:16px;height:16px;border-radius:999px;background:${INK};font-size:0;line-height:0;">&nbsp;</div></td>
                <td style="font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:4px;background:${TRACK};border-radius:999px;">
              <tr>${segments}</tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
              <tr>
                <td style="font-family:${JAKARTA};font-size:12px;font-weight:600;line-height:16px;letter-spacing:0.6px;color:${INK};">HIGHER RISK</td>
                <td align="right" style="text-align:right;font-family:${JAKARTA};font-size:12px;font-weight:600;line-height:16px;letter-spacing:0.6px;color:${INK};">LOWER RISK</td>
              </tr>
            </table>
            <p style="margin:12px 0 0 0;text-align:center;font-family:${JAKARTA};font-size:18px;font-weight:700;line-height:28px;color:${INK};">${BAND_NAME[bandKey!]}</p>
            <p style="margin:8px 0 0 0;text-align:center;font-family:${JAKARTA};font-size:12px;line-height:16px;color:${INK};">of modifiable factors affecting your brain health</p>
          </td>
        </tr>
      </table>
      <p style="margin:8px 0 0 0;font-family:${JAKARTA};font-size:13.5px;line-height:1.625;color:${SECONDARY};">${escapeHtml(bandText!)}</p>
      ${
        factors.length
          ? `<p style="margin:8px 0 0 0;font-family:${JAKARTA};font-size:14px;font-weight:700;line-height:20px;letter-spacing:0.7px;color:${SECONDARY};">WHAT'S DRIVING THIS</p>
      <div style="margin-top:8px;font-size:0;line-height:0;">${pills}</div>`
          : ""
      }
    </td>
  </tr>
</table>`;
  }

  const coverage = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER_SUBTLE};border-radius:12px;border-collapse:separate;overflow:hidden;">
  <tr>
    <td class="stack" width="50%" valign="top" style="width:50%;vertical-align:top;padding:20px 16px;background:${BG_SUBTLE};border-radius:12px 0 0 12px;">
      <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;line-height:20px;color:${TEXT_PRIMARY};">What this quiz shows</p>
      ${checkItem("Processing speed", 12)}
      ${checkItem("Modifiable risk factors", 12)}
    </td>
    <td class="stack-rule" width="8" style="width:8px;background:${EMBER};font-size:0;line-height:0;">&nbsp;</td>
    <td class="stack" width="50%" valign="top" style="width:50%;vertical-align:top;padding:20px 16px;background:${TEXT_PRIMARY};border-radius:0 12px 12px 0;">
      <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;line-height:20px;color:#ffffff;">What this quiz does not cover</p>
      ${notCoveredItem("Attention")}
      ${notCoveredItem("Executive function")}
      ${notCoveredItem("Memory")}
    </td>
  </tr>
</table>`;

  const offer = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;background:#ffffff;border:1px solid ${BORDER_ACCENT};border-radius:12px;box-shadow:0 8px 12px rgba(232,97,41,0.12);">
  <tr>
    <td class="card-pad" style="padding:24px;">
      <p style="margin:0;font-family:${SERIF};font-size:18px;font-weight:600;line-height:24px;color:${TEXT_PRIMARY};">ReCOGnAIze brain health assessment</p>
      <p style="margin:4px 0 0 0;font-family:${SANS};font-size:13px;line-height:20px;color:${TEXT_MUTED};">Developed at NTU&rsquo;s Dementia Research Centre.<br />Validated against MRI scans, registered with Singapore&rsquo;s HSA.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr><td style="height:1px;line-height:1px;font-size:0;background:${BORDER_SUBTLE};">&nbsp;</td></tr></table>
      ${checkItem("Clinically validated neuroscientific games that detect specific brain functions", 0)}
      ${checkItem("A full in-depth report with review and recommendations", 12)}
      <img src="${asset("report-pages.png")}" width="472" height="292" alt="Pages from the full ReCOGnAIze report" style="display:block;margin-top:16px;width:100%;max-width:518px;height:auto;border:0;" />
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
        <tr>
          <td align="center" bgcolor="${CTA_BG}" style="border-radius:8px;background:${CTA_BG};">
            ${link(
              SITE_URL,
              "Book now&nbsp;&nbsp;&rarr;",
              `display:block;padding:16px 24px;font-family:${SANS};font-size:16px;font-weight:600;line-height:20px;color:#ffffff;text-decoration:none;text-align:center;border-radius:8px;`
            )}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  const videoRow = (v: (typeof VIDEOS)[number], imageRight: boolean, top: number) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${imageRight ? "rtl" : "ltr"}" style="margin-top:${top}px;">
  <tr>
    <td class="stack" dir="ltr" width="240" valign="top" style="width:240px;vertical-align:top;">
      ${link(
        v.href,
        `<img src="${asset(v.thumb)}" width="240" height="135" alt="Play video: ${escapeHtml(v.title)}" style="display:block;width:240px;max-width:100%;height:auto;border:0;border-radius:6px;" />`,
        "text-decoration:none;"
      )}
    </td>
    <td class="stack-gutter" width="24" style="width:24px;font-size:0;line-height:0;">&nbsp;</td>
    <td class="stack stack-gap" dir="ltr" valign="top" style="vertical-align:top;text-align:left;">
      ${link(
        v.href,
        escapeHtml(v.title),
        `display:block;font-family:${SERIF};font-size:22px;font-weight:600;line-height:28px;color:${TEXT_PRIMARY};text-decoration:none;`
      )}
      <p style="margin:8px 0 0 0;font-family:${SANS};font-size:14px;line-height:22px;color:${TEXT_BODY};">${escapeHtml(v.body)}</p>
      <p style="margin:8px 0 0 0;">${link(
        v.href,
        "Watch now &rarr;",
        `font-family:${SANS};font-size:14px;font-weight:500;line-height:20px;color:${EMBER};text-decoration:none;`
      )}</p>
    </td>
  </tr>
</table>`;

  const instagramTiles = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
  <tr>
    ${INSTAGRAM_TILES.map(
      (tile, i) =>
        `${i > 0 ? `<td width="4%" style="font-size:0;line-height:0;">&nbsp;</td>` : ""}<td width="30.66%" valign="top">${link(
          INSTAGRAM_URL,
          `<img src="${asset(tile.file)}" width="160" height="160" alt="${escapeHtml(tile.alt)}" style="display:block;width:100%;max-width:160px;height:auto;border:0;border-radius:12px;" />`,
          "text-decoration:none;"
        )}</td>`
    ).join("")}
  </tr>
</table>`;

  const socials = [
    { href: `mailto:${CONTACT_EMAIL}`, file: "social-email.png", alt: "Email us" },
    LINKEDIN_URL ? { href: LINKEDIN_URL, file: "social-linkedin.png", alt: "Gray Matter Solutions on LinkedIn" } : null,
    { href: INSTAGRAM_URL, file: "social-instagram.png", alt: "Gray Matter Solutions on Instagram" },
    YOUTUBE_URL ? { href: YOUTUBE_URL, file: "social-youtube.png", alt: "Adnan Azam Mohammed on YouTube" } : null,
  ].filter((s): s is { href: string; file: string; alt: string } => s !== null);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Source+Serif+4:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet" />
<style>
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  img { -ms-interpolation-mode:bicubic; }
  a { color:${TEXT_ACCENT}; }
  @media only screen and (max-width:480px) {
    .outer-pad { padding:16px 8px 24px 8px !important; }
    .body-pad { padding:28px 20px !important; }
    .card-pad { padding:20px !important; }
    .meter-pad { padding:24px 4px 0 4px !important; }
    .headline { font-size:32px !important; line-height:38px !important; }
    .stack { display:block !important; width:100% !important; }
    .stack-gap { padding-top:12px !important; }
    .stack-left { text-align:left !important; }
    .stack-rule { display:block !important; width:100% !important; height:8px !important; }
    .stack-gutter { display:none !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE}" style="background:${PAGE};">
  <tr>
    <td class="outer-pad" align="center" style="padding:24px 16px 32px 16px;">

      <!-- Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
        <tr>
          <td style="padding:2px 0 18px 0;">
            <img src="${asset("logo-gms-ntu.png")}" width="207" height="36" alt="Gray Matter Solutions, a spin-off from Nanyang Technological University, Singapore" style="display:block;width:207px;height:auto;border:0;" />
          </td>
        </tr>
      </table>

      <!-- Email body -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;border-collapse:separate;overflow:hidden;">
        <tr>
          <td class="body-pad" style="padding:40px;">

            <!-- Intro -->
            <p style="margin:0;font-family:${SANS};font-size:16px;line-height:24px;color:${TEXT_BODY};">${escapeHtml(greeting)}</p>
            <p class="headline" style="margin:12px 0 0 0;font-family:${SERIF};font-size:40px;font-weight:500;line-height:46px;color:${TEXT_PRIMARY};">You just did something most people postpone for <em style="font-style:italic;color:${EMBER};">years.</em></p>
            <p style="margin:12px 0 0 0;font-family:${SANS};font-size:16px;line-height:26px;color:${TEXT_BODY};">You took a quiz to see where your brain health stands.<br />Here are your results:</p>

            <!-- Score -->
            <div style="margin-top:32px;">${speedCard}${riskCard}</div>
            <p style="margin:12px 0 0 0;font-family:${SANS};font-size:15px;line-height:24px;color:${TEXT_BODY};">This score reflects your performance of processing speed and overall risk factors affecting your brain health.</p>
            <p style="margin:12px 0 0 0;font-family:${SANS};font-size:15px;line-height:24px;color:${TEXT_BODY};">Self-report correlates only moderately with measured cognitive performance. A high score does not rule out change, and a low score does not confirm impairment.</p>

            <!-- Quiz coverage -->
            <div style="margin-top:32px;">${coverage}</div>
            <p style="margin:16px 0 0 0;font-family:${SANS};font-size:15px;line-height:24px;color:${TEXT_PRIMARY};">Knowing your brain health score is only the first step. What you need to do is to measure your baseline accurately so that you can take real action.</p>

            <!-- Full assessment -->
            <div style="margin-top:32px;">
              ${sectionEyebrow("THE FULL PICTURE")}
              ${serifHeading("Take the complete brain health assessment")}
              ${offer}
            </div>

            ${divider()}

            <!-- Watch and learn -->
            ${sectionEyebrow("WATCH AND LEARN", TEXT_MUTED, 600)}
            <p style="margin:8px 0 0 0;font-family:${SERIF};font-size:26px;font-weight:500;line-height:32px;color:${TEXT_PRIMARY};">A little more on brain health</p>
            ${videoRow(VIDEOS[0], false, 24)}
            ${videoRow(VIDEOS[1], true, 24)}

            ${divider()}

            <!-- Instagram -->
            ${sectionEyebrow("STAY IN THE LOOP")}
            ${serifHeading("Join us at our next brain health event")}
            <p style="margin:16px 0 0 0;font-family:${SANS};font-size:15px;line-height:24px;color:${TEXT_BODY};">We run brain health events built on what the research shows, from exercise and sleep to stress, nutrition and more. Follow ${link(
              INSTAGRAM_URL,
              "@graymatter.solutions",
              `font-weight:600;color:${TEXT_PRIMARY};text-decoration:none;`
            )} on Instagram to see what&rsquo;s coming up and save your spot early.</p>
            ${instagramTiles}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
              <tr>
                <td align="center" style="border:1.5px solid ${TEXT_ACCENT};border-radius:8px;">
                  ${link(
                    INSTAGRAM_URL,
                    "Follow @graymatter.solutions&nbsp;&nbsp;&rarr;",
                    `display:block;padding:16px 24px;font-family:${SANS};font-size:15px;font-weight:600;line-height:20px;color:${TEXT_ACCENT};text-decoration:none;text-align:center;`
                  )}
                </td>
              </tr>
            </table>

            ${divider()}

            <!-- Signature -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="48" valign="top" style="width:48px;vertical-align:top;">
                  <img src="${asset("avatar-adnan.png")}" width="48" height="48" alt="" style="display:block;width:48px;height:48px;border:0;border-radius:999px;" />
                </td>
                <td valign="top" style="padding-left:16px;vertical-align:top;">
                  <p style="margin:0;font-family:${SANS};font-size:15px;font-weight:600;line-height:20px;color:${TEXT_PRIMARY};">Adnan Azam Mohammed</p>
                  <p style="margin:4px 0 0 0;font-family:${SANS};font-size:14px;line-height:20px;color:${TEXT_BODY};">Co-founder and CEO, Gray Matter Solutions</p>
                  <p style="margin:4px 0 0 0;font-family:${SANS};font-size:13px;line-height:18px;color:${TEXT_MUTED};">PhD Candidate, Lee Kong Chian School of Medicine</p>
                  <p style="margin:4px 0 0 0;">${link(
                    SITE_URL,
                    "Learn more about Gray Matter Solutions &rarr;",
                    `font-family:${SANS};font-size:14px;font-weight:600;line-height:28px;color:${TEXT_ACCENT};text-decoration:underline;`
                  )}</p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
        <!-- Footer banner -->
        <tr>
          <td style="padding:0;font-size:0;line-height:0;">
            <img src="${asset("footer-banner.png")}" width="600" height="190" alt="Gray Matter Solutions: advancing preventive brain health. Detection, diagnosis, management." style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
          </td>
        </tr>
      </table>

      <!-- Footer -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
        <tr>
          <td align="center" style="padding:24px 0 0 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                ${socials
                  .map(
                    (s, i) =>
                      `${i > 0 ? `<td width="24" style="width:24px;font-size:0;">&nbsp;</td>` : ""}<td>${link(
                        s.href,
                        `<img src="${asset(s.file)}" width="40" height="40" alt="${s.alt}" style="display:block;width:40px;height:40px;border:0;" />`,
                        "text-decoration:none;"
                      )}</td>`
                  )
                  .join("")}
              </tr>
            </table>
            <p style="margin:32px 0 0 0;font-family:${SANS};font-size:11px;line-height:16px;color:${TEXT_BODY};text-align:center;">&copy; 2026 Gray Matter Solutions. All rights reserved.</p>
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
