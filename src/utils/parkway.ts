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
