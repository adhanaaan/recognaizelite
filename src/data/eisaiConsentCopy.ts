/**
 * Copy for /clinic-signup/consent — the Eisai newsletter sign-up that stands
 * between the landing page and the run.
 *
 * ---------------------------------------------------------------------------
 * WHY THE CLAUSES ARE ENGLISH IN ALL THREE LANGUAGES
 * ---------------------------------------------------------------------------
 * The same reasoning src/data/parkwayConsentCopy.ts sets out for IHH: what the
 * visitor is asked to *agree to* is the partner's wording, reproduced verbatim
 * from Eisai's own sign-up form, and it stays in English whichever language the
 * picker is set to. "Related corporations", "third-party service providers" and
 * the purpose limitation are terms of art, and a paraphrase of any of them is a
 * different promise. They go out in English until Eisai supplies their own
 * translations, at which point `clauses` below is where those drop in.
 *
 * What *is* translated is the screen around them — the headline, the line
 * naming the partnership, the label over the block and the button — because
 * none of that is the agreement, and a visitor who chose 中文 on the landing
 * page should not hit an entirely English wall on the next screen.
 *
 * ---------------------------------------------------------------------------
 * WHY IT READS AS A DECLARATION AND NOT A TICKBOX
 * ---------------------------------------------------------------------------
 * The sign-up is compulsory here: it is the condition of taking the assessment,
 * not an option offered alongside it. A consent that gates everything behind it
 * is stated as a condition of registering ("By registering, you consent…"),
 * which is why `declaration` is a sentence the button acts on rather than a
 * label beside an empty box. See EISAI_CONSENT_REQUIRED in src/utils/eisai.ts.
 */

import type { LiteEventLang } from "src/i18n/liteEvent";

export type EisaiConsentCopy = {
  headTitle: string;
  /** The h1. Short on purpose — the design gives it one line. */
  h1: string;
  /**
   * "Gray Matter Solutions is partnering with {partner} on this assessment."
   * Split so the partner's name can be emphasised the way the design sets it.
   */
  partnerLead: string;
  partnerTail: string;
  /** What the visitor is signing up to receive, above the clauses. */
  intro: string;
  /**
   * The small label over the consent block. It names the block rather than
   * paraphrasing it — `declaration` directly under it already opens on "By
   * registering, you consent…", and an eyebrow saying the same words twice
   * reads as a stutter.
   */
  eyebrow: string;
  /**
   * The compulsory line, in the phrasing a consent that cannot be declined
   * takes. Verbatim from Eisai's form, with "registering" in place of
   * "subscribing" because registering is what the button here does.
   */
  declaration: string;
  /** The clauses, verbatim from Eisai. See the note at the top of this file. */
  clauses: {
    /** The authorisation confirmation their form makes a required question. */
    ownBehalf: string;
    /** The data-protection paragraph, split around the policy link. */
    dataProtectionLead: string;
    policyName: string;
    dataProtectionTail: string;
  };
  /** The Mailchimp processing notice their form carries under the clauses. */
  processingNote: string;
  cta: string;
  /**
   * Shown under the email field on /clinic-signup/results. Not part of the
   * agreement — it is the reminder that the address typed there is the one the
   * mailers consented to several screens ago will go to.
   */
  mailerNote: string;
};

/**
 * The clause block, shared by all three languages for the reason at the top of
 * this file. Every field here is Eisai's wording — do not edit to fit a layout.
 */
const CLAUSES: EisaiConsentCopy["clauses"] = {
  ownBehalf:
    "I hereby confirm that I am submitting this form on my own behalf; or on behalf of another person, and I confirm that I am authorized to provide the answers in this form.",
  dataProtectionLead:
    "By submitting this form, you agree for Eisai (Singapore) Pte Ltd and its related corporations and/or third-party service providers to collect, store, process and/or disclose your personal data for the purpose of sending electronic direct mailers (EDMs) and invitations to continuing medical education (CME) talks that are organized by us. You can unsubscribe at any time by clicking the link in the footer of our emails. For more information about our privacy practices, refer to our ",
  policyName: "Privacy Policy",
  dataProtectionTail: " at www.eisai.com.sg.",
};

const DECLARATION =
  "By registering, you consent for Eisai to contact you in the future.";

const PROCESSING_NOTE =
  "We use Mailchimp as our marketing platform. By registering you acknowledge " +
  "that your information will be transferred to Mailchimp for processing.";

const EN: EisaiConsentCopy = {
  headTitle: "Sign up | ReCOGnAIze",
  h1: "Before you begin",
  partnerLead: "Gray Matter Solutions is partnering with ",
  partnerTail: " on this assessment.",
  intro:
    "Registering signs you up to receive electronic direct mailers (EDMs) and invitations to continuing medical education (CME) talks.",
  eyebrow: "Eisai sign-up",
  declaration: DECLARATION,
  clauses: CLAUSES,
  processingNote: PROCESSING_NOTE,
  cta: "Register & continue",
  mailerNote: "Eisai's EDMs and CME invitations will be sent to this address.",
};

const ZH: EisaiConsentCopy = {
  headTitle: "注册 | ReCOGnAIze",
  h1: "开始之前",
  partnerLead: "本次评估由 Gray Matter Solutions 与 ",
  partnerTail: " 联合提供。",
  intro:
    "注册即表示订阅电子邮件通讯（EDM）以及持续医学教育（CME）讲座邀请。",
  eyebrow: "Eisai 订阅",
  declaration: DECLARATION,
  clauses: CLAUSES,
  processingNote: PROCESSING_NOTE,
  cta: "注册并继续",
  mailerNote: "Eisai 的电子邮件通讯（EDM）与 CME 讲座邀请将发送至此邮箱。",
};

const MS: EisaiConsentCopy = {
  headTitle: "Daftar | ReCOGnAIze",
  h1: "Sebelum anda mula",
  partnerLead: "Gray Matter Solutions bekerjasama dengan ",
  partnerTail: " dalam penilaian ini.",
  intro:
    "Pendaftaran melanggankan anda kepada mel terus elektronik (EDM) dan jemputan ke ceramah pendidikan perubatan berterusan (CME).",
  eyebrow: "Pendaftaran Eisai",
  declaration: DECLARATION,
  clauses: CLAUSES,
  processingNote: PROCESSING_NOTE,
  cta: "Daftar & teruskan",
  mailerNote: "EDM dan jemputan CME daripada Eisai akan dihantar ke alamat ini.",
};

const BY_LANG: Record<LiteEventLang, EisaiConsentCopy> = { en: EN, zh: ZH, ms: MS };

export const eisaiConsentCopy = (lang: LiteEventLang): EisaiConsentCopy =>
  BY_LANG[lang] ?? EN;
