/**
 * Copy for the consents on the /parkwayshenton landing page — the two tickboxes
 * under the name and email fields in the hero.
 *
 * ---------------------------------------------------------------------------
 * WHY THERE ARE TWO, AND WHERE THEIR WORDING COMES FROM
 * ---------------------------------------------------------------------------
 * Two parties collect personal data on this funnel, so two parties ask. Gray
 * Matter Solutions asks for what it always asks for — to mail the assessment
 * result and its newsletters — and IHH Healthcare Singapore, of which Parkway
 * Shenton is part, asks for its own PDPA consent in its own words. They are
 * separate tickboxes because they are separate agreements with separate
 * holders, and they are recorded in separate columns for the same reason:
 * `consent_marketing` and `consent_partner` (migration 019).
 *
 * Neither English wording is authored in this file. Both already exist in the
 * repo and both are quoted rather than restated, so a change to either reaches
 * this funnel without anyone remembering that it also has to be changed here:
 *
 *   `gms`     — src/data/clinicSignupConsentCopy.ts, /clinic-signup's consent,
 *               unchanged. That module's note on whose consent it is applies
 *               here too: it is Gray Matter Solutions' own, and no partner —
 *               IHH included — may be added to it. IHH asks separately, below.
 *   `partner` — src/data/parkwayConsentCopy.ts, the clauses /parkway shows on
 *               its "Before we send" screen. This funnel has no such screen,
 *               so the same clauses are asked for on the landing page instead.
 *               The Chinese and Malay of them are this file's — see below.
 *
 * ---------------------------------------------------------------------------
 * WHY THE PARTNER'S CLAUSES TRANSLATE HERE, AND NOT ON /parkway
 * ---------------------------------------------------------------------------
 * /parkway keeps IHH's clauses in English whichever language is picked — the
 * reasoning is at the top of src/data/parkwayConsentCopy.ts, and it still
 * holds there. This funnel asks for the same consent on its landing page, in
 * the hero, where a visitor who chose 中文 or Bahasa Melayu would otherwise
 * be asked to agree to the one block on the screen they cannot read. So here
 * the clauses and the withdrawal note follow the language picker too.
 *
 * English is still IHH's own wording, quoted from parkwayConsentCopy.ts. The
 * Chinese and Malay below are ours, translated from it clause for clause, not
 * supplied by IHH — so they are written to say no more and no less than the
 * English: "reasonably related purposes" and the Do-Not-Call carve-out keep
 * their scope, the notice keeps IHH's name, and the registry keeps its
 * English name in brackets so there is no doubt which one is meant. Should
 * IHH supply their own translations, PARTNER_TRANSLATED below is where they
 * drop in, replacing these outright.
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

type PartnerTranslation = Pick<ParkwayShentonConsentCopy["partner"], "clauses" | "withdrawal">;

/**
 * IHH's clauses and withdrawal note in the two other languages, for the
 * reason at the top of this file. English is absent on purpose: it is IHH's
 * verbatim wording and comes from parkwayConsentCopy.ts, so it is never
 * restated here.
 *
 * The notice's name is split the way the English is, around the link. In
 * Chinese the title marks sit outside it, in the lead and the tail, so the
 * underline runs under the name alone.
 */
const PARTNER_TRANSLATED: Record<Exclude<LiteEventLang, "en">, PartnerTranslation> = {
  zh: {
    clauses: {
      treatmentLead:
        "提供本表格所列的信息，即表示本人同意 IHH Healthcare Singapore 及其代表和／或代理人收集、使用及披露本人的个人资料，用于为本人提供医疗治疗以及其他合理相关的用途。相关用途详载于《",
      noticeName: "IHH Healthcare Singapore 资料保护通知",
      treatmentTail: "》，亦可应要求索取。",
      marketing:
        "本人亦同意 IHH Healthcare Singapore 及其代表、代理人和／或业务伙伴收集、使用及披露本人的个人资料，用于营销及推广用途。",
      dnc:
        "本人同意通过短信（SMS）、电话及其他以新加坡电话号码为基础的通讯方式接收营销信息，无论本人是否已在谢绝来电登记处（Do-Not-Call Registry）登记。",
    },
    withdrawal:
      "本人明白，本人可随时通过取消订阅功能，或填写可向我们职员索取的表格，或发送电子邮件至 IHH Healthcare Singapore 资料保护官（DPO），撤回上述同意。电子邮件地址：",
  },
  ms: {
    clauses: {
      treatmentLead:
        "Dengan memberikan maklumat yang dinyatakan dalam borang ini, saya bersetuju untuk IHH Healthcare Singapore serta wakil dan/atau ejen mereka mengumpul, menggunakan dan mendedahkan data peribadi saya bagi memberikan rawatan perubatan kepada saya dan bagi tujuan lain yang berkaitan secara munasabah. Tujuan-tujuan tersebut dinyatakan dalam ",
      noticeName: "Notis Perlindungan Data IHH Healthcare Singapore",
      treatmentTail: ", atau boleh didapati atas permintaan.",
      marketing:
        "Saya juga bersetuju untuk IHH Healthcare Singapore, wakil, ejen dan/atau rakan niaga mereka mengumpul, menggunakan dan mendedahkan data peribadi saya bagi tujuan pemasaran dan promosi.",
      dnc:
        "Saya bersetuju untuk menerima mesej pemasaran melalui SMS, panggilan telefon dan perkhidmatan pesanan lain yang berasaskan nombor telefon Singapura, tanpa mengira sama ada saya berdaftar dengan Daftar Jangan Hubungi (Do-Not-Call Registry).",
    },
    withdrawal:
      "Saya faham bahawa saya boleh menarik balik kebenaran tersebut pada bila-bila masa melalui kemudahan berhenti melanggan ATAU borang yang boleh didapati daripada kakitangan kami atas permintaan ATAU melalui e-mel kepada Pegawai Perlindungan Data (DPO) IHH Healthcare Singapore di ",
  },
};

export const parkwayShentonConsentCopy = (lang: LiteEventLang): ParkwayShentonConsentCopy => {
  const partner = parkwayConsentCopy(lang);
  const translated = lang === "en" ? undefined : PARTNER_TRANSLATED[lang];
  return {
    gms: clinicSignupConsentCopy(lang),
    partner: {
      eyebrow: partner.eyebrow,
      clauses: translated?.clauses ?? partner.clauses,
      withdrawal: translated?.withdrawal ?? partner.withdrawal,
      errConsent: ERR_PARTNER[lang] ?? ERR_PARTNER.en,
    },
  };
};
