/**
 * Act4Health partner branding, in one place.
 *
 * The /act4health funnel is co-branded: every screen shows the clinic's
 * wordmark beside the Gray Matter logo, and the report's conversion path is a
 * WhatsApp chat with the clinic rather than the online-assessment upsell.
 */

/** Transparent-background wordmark, shown beside the Gray Matter logo. */
export const ACT4HEALTH_LOGO = {
  src: "/images/act4health/logo-act4health.png",
  alt: "Act4Health",
};

/** The clinic's WhatsApp booking line. */
const ACT4HEALTH_WHATSAPP_NUMBER = "60182542580";

/** Prefilled so a visitor can just hit send rather than typing an opener. */
const ACT4HEALTH_WHATSAPP_DRAFT =
  "Hello! I would like to know more about the comprehensive cognitive assessment with Recognaize.";

export const ACT4HEALTH_WHATSAPP_URL = `https://wa.me/${ACT4HEALTH_WHATSAPP_NUMBER}?text=${encodeURIComponent(ACT4HEALTH_WHATSAPP_DRAFT)}`;
