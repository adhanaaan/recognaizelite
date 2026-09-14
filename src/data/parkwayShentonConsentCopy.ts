/**
 * Copy for the consents on the /parkwayshenton landing page — the two tickboxes
 * under the name and email fields in the hero.
 *
 * ---------------------------------------------------------------------------
 * WHY THERE ARE TWO, AND WHY NEITHER IS WRITTEN HERE
 * ---------------------------------------------------------------------------
 * Two parties collect personal data on this funnel, so two parties ask. Gray
 * Matter Solutions asks for what it always asks for — to mail the assessment
 * result and its newsletters — and IHH Healthcare Singapore, of which Parkway
 * Shenton is part, asks for its own PDPA consent in its own words. They are
 * separate tickboxes because they are separate agreements with separate
 * holders, and they are recorded in separate columns for the same reason:
 * `consent_marketing` and `consent_partner` (migration 019).
 *
 * Neither wording is authored in this file. Both already exist in the repo and
 * both are quoted rather than restated, so a change to either reaches this
 * funnel without anyone remembering that it also has to be changed here:
 *
 *   `gms`     — src/data/clinicSignupConsentCopy.ts, /clinic-signup's consent,
 *               unchanged. That module's note on whose consent it is applies
 *               here too: it is Gray Matter Solutions' own, and no partner —
 *               IHH included — may be added to it. IHH asks separately, below.
 *   `partner` — src/data/parkwayConsentCopy.ts, the clauses /parkway shows on
 *               its "Before we send" screen. This funnel has no such screen,
 *               so the same clauses are asked for on the landing page instead.
 *
 * ---------------------------------------------------------------------------
 * WHY THE PARTNER'S CLAUSES STAY ENGLISH
 * ---------------------------------------------------------------------------
 * Because they are IHH's wording, reproduced verbatim — the full reasoning is
 * at the top of src/data/parkwayConsentCopy.ts. The Gray Matter half is our own
 * copy and does translate. The screen around both is this funnel's and follows
 * the language picker.
 */

import {
  clinicSignupConsentCopy,
  type ClinicSignupConsentCopy,
} from "src/data/clinicSignupConsentCopy";
import { parkwayConsentCopy, type ParkwayConsentCopy } from "src/data/parkwayConsentCopy";
import type { LiteEventLang } from "src/i18n/liteEvent";
import { IHH } from "src/utils/parkway";

export type ParkwayShentonConsentCopy = {
  /** Gray Matter Solutions' consent, exactly as /clinic-signup asks it. */
  gms: ClinicSignupConsentCopy;
  /** IHH Healthcare Singapore's, exactly as /parkway's consent screen asks it. */
  partner: {
    /** The small label over the partner's block. */
    eyebrow: string;
    /** The three clauses, verbatim. The first names IHH's notice. */
    clauses: ParkwayConsentCopy["clauses"];
    /**
     * The withdrawal note under them. Ends on the DPO's address, which the
     * page appends as a mailto link from IHH.dpoEmail rather than repeating.
     */
    withdrawal: string;
    /**
     * Shown if the hero's button is pressed without this box ticked.
     *
     * This funnel's own, where the two above are quoted. /parkway's line —
     * "Please give your consent to continue." — is written for a screen where
     * there is one box and no doubt which one is meant; here it would land
     * under two tickboxes a line apart from the Gray Matter one's near-identical
     * message, leaving the visitor to guess which is still empty. So it names
     * the partner instead.
     */
    errConsent: string;
  };
};

/** The partner error, per language. The partner's name stays as it is. */
const ERR_PARTNER: Record<LiteEventLang, string> = {
  en: `Please also agree to ${IHH.name}'s consent to continue.`,
  zh: `请同时同意 ${IHH.name} 的条款以继续。`,
  ms: `Sila juga bersetuju dengan kebenaran ${IHH.name} untuk meneruskan.`,
};

export const parkwayShentonConsentCopy = (lang: LiteEventLang): ParkwayShentonConsentCopy => {
  const partner = parkwayConsentCopy(lang);
  return {
    gms: clinicSignupConsentCopy(lang),
    partner: {
      eyebrow: partner.eyebrow,
      clauses: partner.clauses,
      withdrawal: partner.withdrawal,
      errConsent: ERR_PARTNER[lang] ?? ERR_PARTNER.en,
    },
  };
};
