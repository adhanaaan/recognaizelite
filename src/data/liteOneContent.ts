/**
 * Copy and content for the /lite-one report page.
 *
 * Kept out of the page component so the wording can be reviewed on its own.
 * Clinical claims are worded the same way the other funnels word them.
 */

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
