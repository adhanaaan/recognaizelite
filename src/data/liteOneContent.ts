/**
 * Copy and content for the /lite-one report page.
 *
 * Kept out of the page component so the wording can be reviewed on its own.
 * Clinical claims are worded the same way the other funnels word them.
 */

import type { BandName } from "src/types/quiz";

/**
 * /lite-one's own copy for a cognitive domain's "What is this?" definition,
 * overriding what `src/server/data/report_data.json` returns from the API. The
 * server copy is shared across every clinic, so overriding on the client keeps
 * the rewrite scoped to this funnel instead of quietly restyling every other
 * report page that renders the same data.
 */
export const LITE_DOMAIN_DEFINITIONS: Record<string, string> = {
  "Processing Speed":
    "It's how quickly your brain takes in information and responds, the engine behind quick thinking. It's also one of the first things to shift as the brain ages.",
};

export const LOCKED_DOMAINS = [
  {
    name: "Memory",
    blurb: "How well you hold and recall new information",
  },
  {
    name: "Attention",
    blurb: "How long you stay focused without drifting",
  },
  {
    name: "Executive Function",
    blurb: "How you plan, switch tasks and decide",
  },
] as const;

/**
 * The one-paragraph recommendation shown with the risk factors, keyed by the
 * quiz's Brain Health band (`ScoreResult.band`). Ported verbatim from
 * b2cfunnel's `COPY.resultBlurbs` (`src/config/copy.ts`) so this funnel gives
 * the same advice as brainhealthcheck at the same band.
 *
 * `moderate` carries a `{factors}` placeholder, filled by `formatRiskLevers`
 * in src/components/LiteOne/RiskFactorDropdown.tsx.
 */
export const RISK_RECOMMENDATIONS: Record<BandName, string> = {
  low: "Your brain health is in a strong shape with few risk factors and no major flags. The smartest move at this stage is to baseline now, while everything looks good. Measuring early gives you something to track against in years to come.",
  moderate:
    "A handful of modifiable factors are affecting your brain health performance. {factors} are the most movable levers, and that's where most of your risk is coming from. A clinically grounded check in now keeps every option open and tells you exactly what's worth focusing on first.",
  elevated:
    "Several factors in your profile are adding up, and they deserve attention. The good news is that most of them are modifiable, and many cognitive changes are reversible when caught at this stage. A proper brain health assessment now is the best next move, both to set a baseline and to flag anything that needs medical follow up.",
  high: "Your profile carries enough risk factors that we'd encourage you to act now, not later. The earlier cognitive change is identified, the more can be done about it, and many of the underlying factors in your score respond well to treatment when caught early. Book a cognitive assessment with a certified medical professional as your next step.",
};

export const RESEARCH_LINE =
  "Built on clinical research by Nanyang Technological University and the Dementia Research Centre Singapore.";

export const PROOF_POINTS = [
  {
    title: "Measured, not self-reported",
    body: "Your score comes from how you actually performed, not from a questionnaire about how you feel.",
  },
  {
    title: "Compared to your own age band",
    body: "Processing speed drops with age for everyone. The only useful comparison is against people born around the same time as you.",
  },
  {
    title: "Ten minutes, on the device you already have",
    body: "The full test covers four domains and runs in a browser. No appointment to book first.",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Priya S.",
    age: "48",
    quote:
      "Ten minutes, on my phone, and the games were genuinely fun. I've never finished a health check that fast.",
  },
  {
    name: "Marcus L.",
    age: "61",
    quote:
      "The tips were practical. I finally know what to actually do about my brain health instead of just worrying.",
  },
  {
    name: "Wei Ling T.",
    age: "39",
    quote:
      "It picked up a change in my mum before her dementia reached mid-stage. We got her assessed months earlier than we would have.",
  },
] as const;

export const RAIL_TESTIMONIALS = [
  {
    name: "Daniel O.",
    detail: "Took the full test",
    stars: 5,
    quote: "Straightforward, and the report explained what each score meant in plain English.",
  },
  {
    name: "Farah A.",
    detail: "Took the full test",
    stars: 5,
    quote: "I retook it three months later and could see the difference. That's what kept me going.",
  },
  {
    name: "Ken H.",
    detail: "Took the Lite test",
    stars: 4,
    quote: "The speed test alone told me more than my last annual check-up did.",
  },
  {
    name: "Sofia R.",
    detail: "Took the full test",
    stars: 5,
    quote: "Booked a proper screening after seeing my memory score. Glad I did.",
  },
] as const;

/* ---------------------------------------------------------------------------
 * Report page two (/lite-one/report-full)
 *
 * Ported from b2cfunnel's PaywallScreen copy (`src/config/copy.ts`, `paywall`).
 * b2cfunnel bundles a Prologue teleconsult into the purchase and closes with a
 * WhatsApp booking; this funnel sells the assessment on its own against the
 * World Alzheimer's Month voucher instead, so the clinician lines are dropped
 * rather than left promising a consultation nobody would deliver.
 * ------------------------------------------------------------------------- */

export const UPSELL = {
  eyebrow: "The full picture",
  heading: "Take the complete brain health assessment",
  paperNote: "Validated in peer-reviewed research",
  paperUrl: "https://pubmed.ncbi.nlm.nih.gov/41685533/",
  offerName: "ReCOGnAIze brain health assessment",
  offerNote:
    "Developed at NTU's Dementia Research Centre · Registered with Singapore's HSA",
  includes: [
    "Clinically-validated neuroscientific games to detect specific brain functions",
    "All four cognitive domains: processing speed, memory, attention and executive function",
    "Review & recommendations with a full in-depth report",
  ],
  faqs: [
    {
      q: "What is ReCOGnAIze?",
      a: "A digital brain health assessment developed at NTU's Dementia Research Centre and registered with Singapore's HSA.",
    },
    {
      q: "How is this 3-minute quiz different from ReCOGnAIze?",
      a: "This quiz is a free, educational estimate based on your modifiable risk factors. ReCOGnAIze is the full assessment, validated in peer-reviewed research, that shows how your brain is actually performing.",
    },
    {
      q: "Is this assessment legit?",
      a: "Yes. ReCOGnAIze was developed and validated at NTU's Lee Kong Chian School of Medicine, Dementia Research Centre, and is registered with Singapore's HSA.",
    },
    {
      q: "Who is it for?",
      a: "Anyone staying ahead of their brain health: whether you want to maintain peak cognitive performance, you're navigating hormonal changes, or you're supporting a loved one living with dementia.",
    },
    {
      q: "What should I expect next?",
      a: "Download your offer proof and show it at the front desk to claim the discounted assessment. The test itself runs in a browser and takes about ten minutes.",
    },
  ],
} as const;

export const OFFER = {
  eyebrow: "Special offer",
  title: "World Alzheimer's Month",
  window: "1 – 30 September 2026",
  productName: "ReCOGnAIze Cognitive Test",
  productSub: "4 cognitive domains",
  domains: ["Processing Speed", "Executive Function", "Memory", "Attention"],
  normalPrice: 29.0,
  discount: 10.5,
  get total() {
    return this.normalPrice - this.discount;
  },
  currency: "$",
  redeemNote: "Show this at the front desk to claim it.",
  ribbon: "Claim 35% off the full cognitive test",
} as const;
