/**
 * Copy for what the /parkwayshenton report does differently from
 * /clinic-signup: where it sends the reader, and the "What to do now?" steps.
 *
 * Everything else on that page still reads from the shared sets. The whole of
 * the difference is that the next step happens in the clinic: /clinic-signup
 * hands off to the team at a booth, /parkway opens a WhatsApp booking, and this
 * one points at the doctors and clinic assistants who are already in the room.
 *
 * `product` is /parkway's "What to do now?" section (Figma "R5 · Report — The
 * test", node 1091-2624), taken from src/data/parkwayReportCopy.ts rather than
 * restated: the eyebrow, the headline and steps 2 and 3 are the same words.
 * Only step 1 is this funnel's — /parkway's books a screening at a site; here
 * it is the person at the desk — so CONSULT_STEP below is all this file adds.
 *
 * `cta` is the button under the three steps — the slot the design fills with
 * its booking button (Figma "R5 · Report — The test", node 721-9748). It reads
 * as an instruction rather than an action because that is what it is: nothing
 * to book online, nothing to type, just the person at the desk. The tap is
 * still worth having, so the button records it the way /clinic-signup's
 * "I'm interested" does — against the run's row in liteevent_report_interest,
 * via /api/lite-report-interest — and `ctaDone` is what it says afterwards.
 *
 * `nextCallout` is the same sentence one section down, in the "What happens
 * next" card, where the shared set names a booth.
 *
 * All three of the funnel's languages are here for the same reason the flow
 * keeps its picker: a visitor who chose 中文 on the landing page should not hit
 * an English wall on the one line that tells them what to do next.
 */

import { parkwayReportCopy, type ParkwayCopy, type ParkwayStep } from "src/data/parkwayReportCopy";
import type { LiteEventLang } from "src/i18n/liteEvent";

export type ParkwayShentonReportCopy = {
  /** The button under the three steps, in place of "I'm interested". */
  cta: string;
  /** What that button says once it has been tapped. */
  ctaDone: string;
  /** The closing card's callout, in place of "Speak to our team at the booth". */
  nextCallout: string;
  /**
   * The baseline radar's fifth axis, in place of the shared "Risk". Read as
   * "risk safety" (the higher the fill, the safer), as /act4health words it,
   * so a full axis doesn't read as "high risk".
   */
  radarRiskAxis: string;
  /**
   * "What to do now?" — /parkway's, with this funnel's first step. /parkway's
   * own button label (`cta`) is left out: the button here is the one above.
   */
  product: Omit<ParkwayCopy["product"], "cta">;
};

type Base = Omit<ParkwayShentonReportCopy, "product">;

/** Step 1's title and body. Its "Step 1" label is /parkway's, per language. */
const CONSULT_STEP: Record<LiteEventLang, Pick<ParkwayStep, "title" | "body">> = {
  en: {
    title: "Consult with your doctor or clinic assistant",
    body: "Get more information on the full cognitive test.",
  },
  zh: {
    title: "咨询您的医生或诊所助理",
    body: "进一步了解完整的认知测试。",
  },
  ms: {
    title: "Berunding dengan doktor atau pembantu klinik anda",
    body: "Dapatkan maklumat lanjut tentang ujian kognitif penuh.",
  },
};

const EN: Base = {
  cta: "Talk to our doctors or clinic assistants to find out more",
  ctaDone: "Noted — our team will take it from here",
  nextCallout: "Talk to our doctors or clinic assistants",
  radarRiskAxis: "Risk Safety",
};

const ZH: Base = {
  cta: "想了解更多，请与我们的医生或诊所助理聊聊",
  ctaDone: "已记录 — 接下来交给我们的团队",
  nextCallout: "与我们的医生或诊所助理聊聊",
  radarRiskAxis: "风险安全",
};

const MS: Base = {
  cta: "Berbual dengan doktor atau pembantu klinik kami untuk maklumat lanjut",
  ctaDone: "Dicatat — pasukan kami akan meneruskan dari sini",
  nextCallout: "Berbual dengan doktor atau pembantu klinik kami",
  radarRiskAxis: "Keselamatan Risiko",
};

const BY_LANG: Record<LiteEventLang, Base> = { en: EN, zh: ZH, ms: MS };

export const parkwayShentonReportCopy = (lang: LiteEventLang): ParkwayShentonReportCopy => {
  const { eyebrow, h2Lead, h2Tail, steps, stepGamesAlt, stepReportAlt } =
    parkwayReportCopy(lang).product;
  const [site, games, report] = steps;
  return {
    ...(BY_LANG[lang] ?? EN),
    product: {
      eyebrow,
      h2Lead,
      h2Tail,
      steps: [{ ...site, ...(CONSULT_STEP[lang] ?? CONSULT_STEP.en) }, games, report],
      stepGamesAlt,
      stepReportAlt,
    },
  };
};
