/**
 * Parkway Shenton partner branding, in one place.
 *
 * The /parkway funnel is co-branded: the report closes on a consultation at
 * one of the clinic's sites rather than on the online-assessment upsell, so
 * everything that names or pictures the partner lives here instead of being
 * spread through the report page.
 */

/**
 * The wordmark shown on the report's offer card. Already in the repo — it is
 * the same lock-up the design places at the top of that card.
 */
export const PARKWAY_LOGO = {
  src: "/images/lite-one/logo-parkway-shenton.svg",
  alt: "Parkway Shenton",
};

/**
 * !! PLACEHOLDER — needs the real Parkway Shenton line before this funnel goes
 * out.
 *
 * The design's booking button is the A4H WhatsApp component reused as-is, so
 * the number printed under it (+60 18-254 2580) is Act4Health's Malaysian
 * line, not Parkway's. It is carried through here rather than invented so the
 * page matches the comp exactly and there is one obvious place to correct,
 * but a Singapore clinic answering a Malaysian number is not something to
 * ship: replace both constants together.
 */
const PARKWAY_WHATSAPP_NUMBER = "60182542580";

/** The same number, formatted the way the design prints it under the button. */
export const PARKWAY_WHATSAPP_DISPLAY = "+60 18-254 2580";

/** Prefilled so a visitor can just hit send rather than typing an opener. */
const WHATSAPP_DRAFT =
  "Hello! I would like to book a cognitive screening and consultation at Parkway Shenton.";

export const PARKWAY_WHATSAPP_URL = `https://wa.me/${PARKWAY_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_DRAFT
)}`;

/**
 * The booking link for one site. The design gives each row a chevron, so each
 * row has to go somewhere; it opens the same WhatsApp line with the site the
 * visitor tapped already named in the draft, which is the only destination
 * this funnel actually has.
 */
export function parkwaySiteWhatsAppUrl(site: string): string {
  const draft = `Hello! I would like to book a cognitive screening and consultation at Parkway Shenton (${site}).`;
  return `https://wa.me/${PARKWAY_WHATSAPP_NUMBER}?text=${encodeURIComponent(draft)}`;
}

export type ParkwaySite = {
  /**
   * The site's name, split the way the design breaks it across two lines —
   * the practice on the first line, the location on the second.
   */
  practice: string;
  location: string;
  /**
   * Photograph of the site. Missing files are handled rather than assumed:
   * both the carousel card and the list row fall back to a plain tile if the
   * image 404s, so the section reads correctly before the photos land. See
   * public/images/parkway/sites/README.md.
   */
  image: string;
};

/** The four sites the report offers, in the design's order. */
export const PARKWAY_SITES: ParkwaySite[] = [
  {
    practice: "Medical Clinic,",
    location: "Republic Plaza",
    image: "/images/parkway/sites/republic-plaza.jpg",
  },
  {
    practice: "Family Medicine Clinic,",
    location: "Ang Mo Kio",
    image: "/images/parkway/sites/ang-mo-kio.jpg",
  },
  {
    practice: "Executive Health Screeners,",
    location: "Mount Elizabeth Hospital",
    image: "/images/parkway/sites/mount-elizabeth.jpg",
  },
  {
    practice: "Parkway MediCentre @",
    location: "The Woodleigh Mall",
    image: "/images/parkway/sites/woodleigh-mall.jpg",
  },
];

/** The site's full name on one line, for alt text and prefilled messages. */
export const parkwaySiteName = (site: ParkwaySite) => `${site.practice} ${site.location}`;

/* ------------------------------------------------------------- consent -- */

/**
 * IHH Healthcare Singapore, the partner on this event.
 *
 * Parkway Shenton is part of IHH, and the consent the visitor gives before
 * their result is sent is IHH's to hold, not the clinic's — so the partner is
 * named separately here rather than folded into PARKWAY_LOGO above.
 */
export const IHH = {
  /** How the partner is named in running copy. Wording supplied by IHH. */
  name: "IHH Healthcare Singapore",
  /**
   * !! PLACEHOLDER — the mark itself is IHH's to supply.
   *
   * `PartnerMark` on the consent screen swaps a file that 404s for a plain
   * typographic wordmark, the same guard SiteThumb gives the site photos, so
   * the screen reads correctly before this lands. Drop the real export in at
   * this exact path — see public/images/parkway/README.md.
   */
  logo: {
    src: "/images/parkway/logo-ihh-healthcare.svg",
    alt: "IHH Healthcare",
  },
  /** From the design. The one address in this block that is not a guess. */
  dpoEmail: "pdpo@ihhhealthcare.com",
  /**
   * !! PLACEHOLDER — needs IHH's published notice URL before this funnel goes
   * out. The clause names the notice and the design links it, so the link has
   * to point somewhere; it is left obviously unset rather than guessed at, and
   * `consentLinkHref` below is what keeps an unset one off the screen.
   */
  dataProtectionNoticeUrl: "",
} as const;

/**
 * !! PLACEHOLDER — needs Gray Matter Solutions' published policy URL.
 *
 * Same treatment as IHH's notice above: the lead form's required consent
 * names the policy, so it is a link in the design, and an empty string here
 * renders the words without one rather than a link to nowhere.
 */
export const GMS_PRIVACY_POLICY_URL = "";

/** Whether a URL is set, i.e. whether to render its words as a link at all. */
export const consentLinkHref = (url: string): string | null =>
  url.trim().length > 0 ? url : null;

/**
 * Whether the partner's consent gates the report.
 *
 * True is the design: the screen is headed "We need your consent on" and the
 * only way past it is the one checkbox. Flip this to false and the screen
 * becomes a notice a visitor can pass without ticking — the tick is still
 * recorded either way, so the leads table keeps saying who agreed and who
 * only read it.
 */
export const PARTNER_CONSENT_REQUIRED = true;

/**
 * IHH's two brand colours, for the corner decoration on the consent screen.
 *
 * The screen is the one place in this funnel that is the partner's rather than
 * ours, and the design marks that with their navy and yellow instead of the
 * warm-cream blur circles every other screen carries.
 */
export const IHH_NAVY = "#272463";
export const IHH_YELLOW = "#FFD66B";
