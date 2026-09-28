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
 *               The Chinese and Malay of them live in this file — see below.
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
 * Chinese below is IHH's too — their own translation, supplied by email and
 * reproduced verbatim, punctuation included; do not edit it to match the
 * English or the house style. The Malay is still ours, translated from the
 * English clause for clause, not supplied by IHH — so it is written to say no
 * more and no less than the English: "reasonably related purposes" and the
 * Do-Not-Call carve-out keep their scope, the notice keeps IHH's name, and
 * the registry keeps its English name in brackets so there is no doubt which
 * one is meant. Should IHH supply a Malay translation, PARTNER_TRANSLATED
 * below is where it drops in, replacing ours outright.
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
     * The withdrawal note under them, up to the DPO's address, which the page
     * appends as a mailto link from IHH.dpoEmail rather than repeating.
     */
    withdrawal: string;
    /**
     * Whatever follows the address. Empty in English and Malay, where the
     * sentence ends on it; IHH's Chinese puts the address in brackets
     * mid-sentence, so the verb comes after.
     */
    withdrawalTail: string;
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

type PartnerTranslation = Pick<
  ParkwayShentonConsentCopy["partner"],
  "clauses" | "withdrawal" | "withdrawalTail"
>;

/**
 * IHH's clauses and withdrawal note in the two other languages, for the
 * reason at the top of this file. English is absent on purpose: it is IHH's
 * verbatim wording and comes from parkwayConsentCopy.ts, so it is never
 * restated here.
 *
 * The notice's name is split the way the English is, around the link. IHH's
 * Chinese names the notice once in prose and then says to visit it by its
 * page title, followed by "(url: …)"; the title is what is linked, to the
 * same URL (IHH.dataProtectionNoticeUrl), so the bracketed address is dropped
 * rather than printed beside a link that already goes there.
 */
const PARTNER_TRANSLATED: Record<Exclude<LiteEventLang, "en">, PartnerTranslation> = {
  zh: {
    clauses: {
      treatmentLead:
        "通过提供本表列出的信息，我同意新加坡 IHH Healthcare 及其代表、代理和/或业务合作伙伴收集、使用和披露我的个人数据，以便为我提供治疗和用于其他合理的相关用途。在新加坡 IHH Healthcare 数据保护通知中列出了此类用途，具体请可访问 ",
      noticeName: "IHH SG Data Protection Notice - IHH Healthcare",
      treatmentTail: "。",
      marketing:
        "我也同意IHH Healthcare Singapore，其代表，代理和/或业务合作伙伴出于营销和促销目的的收集，使用和披露我的个人数据。",
      dnc:
        "我同意接收通过短信、电话和其他基于新加坡电话号码的方式发送的营销信息，不管我是否登记了“谢绝来电(Do Not Call)”。",
    },
    withdrawal:
      "我知晓，我可以随时通过取消订阅功能、使用可要求员工提供的表格或发送电子邮件给新加坡 IHH Healthcare (",
    withdrawalTail: ") 撤回此同意。",
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
    withdrawalTail: "",
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
      withdrawalTail: translated?.withdrawalTail ?? "",
      errConsent: ERR_PARTNER[lang] ?? ERR_PARTNER.en,
    },
  };
};
