/**
 * Copy for the closing of the /parkwayshenton report — the three lines that
 * funnel does differently from /clinic-signup.
 *
 * Everything else on that page still reads from the shared sets. This module
 * only covers where the report sends the reader, and the whole of that
 * difference is that the next step happens in the clinic: /clinic-signup hands
 * off to the team at a booth, /parkway opens a WhatsApp booking, and this one
 * points at the doctors and clinic assistants who are already in the room.
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

import type { LiteEventLang } from "src/i18n/liteEvent";

export type ParkwayShentonReportCopy = {
  /** The button under the three steps, in place of "I'm interested". */
  cta: string;
  /** What that button says once it has been tapped. */
  ctaDone: string;
  /** The closing card's callout, in place of "Speak to our team at the booth". */
  nextCallout: string;
};

const EN: ParkwayShentonReportCopy = {
  cta: "Talk to our doctors or clinic assistants to find out more",
  ctaDone: "Noted — our team will take it from here",
  nextCallout: "Talk to our doctors or clinic assistants",
};

const ZH: ParkwayShentonReportCopy = {
  cta: "想了解更多，请与我们的医生或诊所助理聊聊",
  ctaDone: "已记录 — 接下来交给我们的团队",
  nextCallout: "与我们的医生或诊所助理聊聊",
};

const MS: ParkwayShentonReportCopy = {
  cta: "Berbual dengan doktor atau pembantu klinik kami untuk maklumat lanjut",
  ctaDone: "Dicatat — pasukan kami akan meneruskan dari sini",
  nextCallout: "Berbual dengan doktor atau pembantu klinik kami",
};

const BY_LANG: Record<LiteEventLang, ParkwayShentonReportCopy> = { en: EN, zh: ZH, ms: MS };

export const parkwayShentonReportCopy = (lang: LiteEventLang): ParkwayShentonReportCopy =>
  BY_LANG[lang] ?? EN;
