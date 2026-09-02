/**
 * Copy for /parkway/consent — the partner consent screen that stands between
 * the lead form and the report.
 *
 * ---------------------------------------------------------------------------
 * WHY THE CLAUSES ARE ENGLISH IN ALL THREE LANGUAGES
 * ---------------------------------------------------------------------------
 * Everything the visitor is asked to *agree to* is IHH's wording, reproduced
 * verbatim, and it stays in English whichever language the picker is set to.
 * A consent clause is the one kind of copy on this funnel where a translation
 * changes what was agreed to: "reasonably related purposes" and the
 * Do-Not-Call carve-out are terms of art, and a paraphrase of either is a
 * different promise. IHH supplied them in English; they go out in English
 * until IHH supplies their own translations, at which point `clauses` and
 * `withdrawal` below are where those drop in.
 *
 * What *is* translated is the screen around them — the headline, the line
 * naming the partnership, the label over the block and the button — because
 * none of that is the agreement, and a visitor who chose 中文 on the landing
 * page should not hit an entirely English wall on the last screen before
 * their result.
 */

import type { LiteEventLang } from "src/i18n/liteEvent";

export type ParkwayConsentCopy = {
  headTitle: string;
  /** The h1. Short on purpose — the design gives it one line. */
  h1: string;
  /**
   * "Gray Matter Solutions is partnering with {partner} in this event." Split
   * so the partner's name can be emphasised the way the design sets it.
   */
  partnerLead: string;
  partnerTail: string;
  /** The small orange label over the consent block. */
  eyebrow: string;
  /**
   * The three clauses, verbatim from IHH. The first names their notice, so it
   * is split around the link the way the landing copy's lines are.
   */
  clauses: {
    treatmentLead: string;
    noticeName: string;
    treatmentTail: string;
    marketing: string;
    dnc: string;
  };
  /**
   * The withdrawal note under the block. The sentence ends on the DPO's
   * address, which the screen appends as a mailto link from IHH.dpoEmail
   * rather than repeating here.
   */
  withdrawal: string;
  cta: string;
  /** Shown if the visitor presses the button without ticking the box. */
  errConsent: string;
};

/**
 * The clause block, shared by all three languages for the reason at the top of
 * this file. Every field here is IHH's wording — do not edit to fit a layout.
 */
const CLAUSES: ParkwayConsentCopy["clauses"] = {
  treatmentLead:
    "By providing the information set out in this form, I consent to IHH Healthcare Singapore and their representatives and/or agents collecting, using and disclosing my personal data to provide me with medical treatment and other reasonably related purposes. Such purposes are set out in the ",
  noticeName: "IHH Healthcare Singapore Data Protection Notice",
  treatmentTail: ", or available on request.",
  marketing:
    "I also consent to IHH Healthcare Singapore, their representatives, agents and/or business partners collecting, using and disclosing my personal data for marketing and promotional purposes.",
  dnc:
    "I agree to receiving marketing messages via SMS, telephone call and other Singapore phone number-based messaging, regardless of my registration with the Do-Not-Call registry.",
};

const WITHDRAWAL =
  "I understand that I may withdraw such consent at any time via unsubscribe " +
  "facilities OR forms available on request from our staff OR by email to " +
  "IHH Healthcare Singapore DPO at ";

const EN: ParkwayConsentCopy = {
  headTitle: "Before we send | ReCOGnAIze",
  h1: "Before we send",
  partnerLead: "Gray Matter Solutions is partnering with ",
  partnerTail: " in this event.",
  eyebrow: "We need your consent on",
  clauses: CLAUSES,
  withdrawal: WITHDRAWAL,
  cta: "I'm ready!",
  errConsent: "Please give your consent to continue.",
};

const ZH: ParkwayConsentCopy = {
  headTitle: "发送之前 | ReCOGnAIze",
  h1: "发送之前",
  partnerLead: "本次活动由 Gray Matter Solutions 与 ",
  partnerTail: " 联合举办。",
  eyebrow: "我们需要您的同意",
  clauses: CLAUSES,
  withdrawal: WITHDRAWAL,
  cta: "我准备好了！",
  errConsent: "请给予同意以继续。",
};

const MS: ParkwayConsentCopy = {
  headTitle: "Sebelum kami hantar | ReCOGnAIze",
  h1: "Sebelum kami hantar",
  partnerLead: "Gray Matter Solutions bekerjasama dengan ",
  partnerTail: " dalam acara ini.",
  eyebrow: "Kami perlukan kebenaran anda",
  clauses: CLAUSES,
  withdrawal: WITHDRAWAL,
  cta: "Saya sedia!",
  errConsent: "Sila berikan kebenaran anda untuk meneruskan.",
};

const BY_LANG: Record<LiteEventLang, ParkwayConsentCopy> = { en: EN, zh: ZH, ms: MS };

export const parkwayConsentCopy = (lang: LiteEventLang): ParkwayConsentCopy =>
  BY_LANG[lang] ?? EN;
