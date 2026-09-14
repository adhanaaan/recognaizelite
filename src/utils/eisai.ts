/**
 * Eisai, the partner on /clinic-signup, in one place.
 *
 * That funnel is /lite-event-template's flow with one screen in front of it:
 * /clinic-signup/consent, where the visitor subscribes to Eisai's electronic
 * direct mailers (EDMs) and invitations to continuing medical education (CME)
 * talks. Everything that names the partner or reproduces their wording lives
 * here rather than being spread through that page — the same shape
 * src/utils/parkway.ts gives IHH.
 */

export const EISAI = {
  /** The legal entity, as their own sign-up form names it. */
  name: "Eisai (Singapore) Pte Ltd",
  /** How the partner is named in running copy, where the entity would be heavy. */
  shortName: "Eisai",
  /**
   * !! PLACEHOLDER — the mark itself is Eisai's to supply.
   *
   * `PartnerMark` on the consent screen swaps a file that 404s for their name
   * set as type, the same guard /parkway/consent gives IHH's logo, so the
   * screen reads correctly before this lands. Drop the real export in at this
   * exact path — see public/images/clinic-signup/README.md.
   */
  logo: {
    src: "/images/clinic-signup/logo-eisai.svg",
    alt: "Eisai",
  },
  /**
   * From Eisai's own sign-up form, which ends its data-protection clause on
   * "refer to our Privacy Policy at www.eisai.com.sg". The clause names it, so
   * the screen links it.
   */
  privacyPolicyUrl: "https://www.eisai.com.sg",
} as const;

/** Whether a URL is set, i.e. whether to render its words as a link at all. */
export const consentLinkHref = (url: string): string | null =>
  url.trim().length > 0 ? url : null;

/**
 * Whether the sign-up is compulsory — i.e. whether the run can start at all
 * without the visitor consenting.
 *
 * True is what this funnel is for. It is why the screen is written as a
 * declaration ("By registering, you consent…") with a single button, rather
 * than as a tickbox the visitor could leave empty: a consent that gates
 * everything behind it is stated as a condition of registering, not offered as
 * a choice and then refused. The run is the free item the consent is the price
 * of; a paid service would have to let the visitor opt out instead.
 *
 * Flip this to false and two things change together — /clinic-signup/consent
 * would need an opt-out control to be honest, and the guard on
 * /clinic-signup/ready (which is what makes the screen unskippable by URL)
 * would have to come out. It is a constant rather than an assumption spread
 * across two pages so that neither can be changed without the other.
 */
export const EISAI_CONSENT_REQUIRED = true;

/**
 * Eisai's corporate red, for the consent screen's accents.
 *
 * Every other screen in the funnel sits on the warm-cream gradient in the
 * Clinical Empathy palette; this one is the partner's, and is marked as
 * theirs — the same way /parkway/consent carries IHH's navy and yellow.
 */
export const EISAI_RED = "#E60027";
