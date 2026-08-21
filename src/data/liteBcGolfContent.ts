/**
 * Copy for the /lite-bcgolf funnel — the Business China Fundraising Golf
 * Tournament, Friday 21 August 2026, Singapore Island Country Club.
 *
 * The first version of this page named the event, the venue and the research
 * centre, and never once named ReCOGnAIze or Gray Matter Solutions. That was
 * backwards: the reason for being at the tournament is that guests leave
 * knowing who we are and what we make. Restraint about someone else's brand is
 * not a reason to be silent about our own.
 *
 * So the page now leads with the product — what ReCOGnAIze is, what it
 * measures, what this three-minute version is an extract of — and treats the
 * event as context rather than the headline.
 *
 * What we still do not do: use Business China's mark, describe them as a
 * partner, or imply they endorse the assessment. Naming an event you appear at
 * is not that claim.
 *
 * The Guest of Honour is also deliberately absent. The invitation names a
 * sitting Minister for Health; his name on a commercial brain-screening page
 * would read as government endorsement, and his own event is the worst place
 * to be wrong about that.
 */

export const PRODUCT = {
  /** The validated assessment. Capitalisation is the product's own. */
  name: "ReCOGnAIze",
  company: "Gray Matter Solutions",
  /** This three-minute extract of it. */
  liteName: "ReCOGnAIze Lite",
  logoSrc: "/images/lite-one/logo-gray-matter.svg",
  logoAlt: "Gray Matter Solutions",
  /** Dementia Research Centre / LKCMedicine lock-up. */
  researchLogoSrc: "/images/lite-one/logo-lkc-drc.png",
  researchLogoAlt: "Dementia Research Centre, Lee Kong Chian School of Medicine",
} as const;

export const EVENT = {
  name: "Business China Fundraising Golf Tournament",
  shortName: "Business China Golf 2026",
  date: "Friday 21 August 2026",
  venue: "Singapore Island Country Club · The Island Course",
} as const;

/**
 * The two windows in the day where a three-minute assessment actually fits.
 * Used as the suggested utm_campaign values so the two can be told apart.
 */
export const EVENT_WINDOWS = [
  { campaign: "lunch", label: "Registration & lunch, 11.00am" },
  { campaign: "gala", label: "Gala dinner, 7.00pm" },
] as const;

export const HERO = {
  /** Who we are comes first; the event is the context line beneath it. */
  eyebrow: "ReCOGnAIze · Gray Matter Solutions",
  eventLine: "At the Business China Fundraising Golf Tournament",
  heading: "Check how fast your brain is working today.",
  standfirst:
    "ReCOGnAIze is a clinically validated cognitive assessment, built at the Dementia Research Centre, Lee Kong Chian School of Medicine, NTU Singapore. This is a three-minute extract of it — one game and a short questionnaire.",
  cta: "Begin",
  timeNote: "Three minutes. No app, no sign-up to start.",
} as const;

/**
 * What ReCOGnAIze actually is, for a guest who has never heard of us. The
 * previous version of this page assumed they had.
 */
export const ABOUT = {
  heading: "What ReCOGnAIze is",
  body:
    "A tablet-based cognitive assessment that measures brain performance through four games rather than a questionnaire. It was developed and validated in a Singapore community cohort of 2,500 adults, and validated against the screening tools clinics use today.",
  domains: ["Processing speed", "Memory", "Attention", "Executive function"],
  /** The same list as a sentence: "a, b, c and d". */
  get domainsProse() {
    const lower = this.domains.map((d) => d.toLowerCase());
    return `${lower.slice(0, -1).join(", ")} and ${lower[lower.length - 1]}`;
  },
  /** The published evidence, in one line for a non-clinical reader. */
  evidence:
    "Published in Alzheimer's & Dementia (2026). Registered with Singapore's HSA.",
  paperUrl: "https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.70992",
} as const;

/**
 * Why any of this matters, for a guest who came to play golf.
 *
 * The three cards are pulled from src/data/brainHealthStatCards.ts rather than
 * rewritten here — they are already cited, already used inside the quiz, and a
 * second copy would be a second thing to keep true.
 *
 * The order is the argument: what the local risk actually is, why it applies to
 * this room specifically, and then what can be done about it. Ending on the
 * Lancet figure matters — a page that only states the stakes is frightening
 * rather than useful, and 45% preventable is the reason to measure at all.
 */
export const EDUCATION = {
  heading: "Why measure this at all",
  cardIds: ["imhWise", "salthouse", "lancet2024"] as const,
  closer:
    "Cognitive change is gradual and easy to miss, and the risk factors that drive it respond best to being caught early. A baseline is how you notice a change later.",
} as const;

/** What today's three minutes actually consists of. */
export const TODAY = [
  {
    label: "A 60-second game",
    detail: "Match symbols to digits as fast as you can. This measures processing speed.",
  },
  {
    label: "A short questionnaire",
    detail: "Modifiable risk factors, based on the 2024 Lancet Commission on dementia.",
  },
  {
    label: "Your result on screen",
    detail: "How you compare with people your age, and what moves the number.",
  },
] as const;

/** Reassurance a guest at someone else's fundraiser is entitled to. */
export const PRIVACY_NOTE =
  "We ask for your name and email only at the end, and only to send your result. Nothing is shared with the event organisers.";

export const SCOPE_NOTE =
  "Today measures processing speed — one of the four domains — and is a screen, not a diagnosis.";
