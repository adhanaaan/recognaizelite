/**
 * Copy for the /lite-bcgolf funnel — the Business China Fundraising Golf
 * Tournament, Friday 21 August 2026, Singapore Island Country Club.
 *
 * Two constraints shaped this copy, both deliberate.
 *
 * We name the event because we are appearing at it, and a guest scanning a QR
 * code at the registration desk needs to know they are in the right place. We
 * do not use Business China's mark, describe them as a partner, or imply they
 * endorse the assessment — naming an event you attend is not the same claim,
 * and the difference matters for someone else's fundraiser.
 *
 * The Guest of Honour is deliberately absent. The invitation names a sitting
 * Minister for Health; his name on a commercial brain-screening page would read
 * as government endorsement whether or not that is intended, and his own event
 * is the worst possible place to be wrong about that.
 */

export const EVENT = {
  name: "Business China Fundraising Golf Tournament",
  /** Short form, for places where the full name will not fit. */
  shortName: "Business China Golf 2026",
  date: "Friday 21 August 2026",
  venue: "Singapore Island Country Club · The Island Course",
} as const;

/**
 * The two windows in the day where a three-minute assessment actually fits:
 * registration and lunch before the shotgun start, and the gala afterwards.
 * Used as the suggested utm_campaign values so the two can be told apart.
 */
export const EVENT_WINDOWS = [
  { campaign: "lunch", label: "Registration & lunch, 11.00am" },
  { campaign: "gala", label: "Gala dinner, 7.00pm" },
] as const;

export const HERO = {
  eyebrow: "At the Business China Fundraising Golf Tournament",
  heading: "Three minutes. One measure of how fast your brain is working today.",
  standfirst:
    "A short cognitive assessment developed and validated at the Dementia Research Centre, Lee Kong Chian School of Medicine, NTU Singapore. Published in Alzheimer's & Dementia.",
  cta: "Begin",
  /** Sits under the CTA. Sets expectations before a guest commits their time. */
  timeNote: "No app, no sign-up to start. Your result is shown on screen at the end.",
} as const;

/** Reassurance a guest at someone else's fundraiser is entitled to. */
export const PRIVACY_NOTE =
  "We ask for your name and email only at the end, and only to send your result. Nothing is shared with the organisers.";

export const SCOPE_NOTE =
  "This measures processing speed — one of four cognitive domains, and a screen rather than a diagnosis.";
