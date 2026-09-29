import { LITE_EVENT_TEMPLATE_QUESTION_BANKS } from "src/data/liteEventTemplateQuestions";
import type { LiteEventLang } from "src/i18n/liteEvent";
import type { Question } from "src/types/quiz";

/**
 * The question banks /parkwayshenton asks from: /lite-event-template's, plus the
 * one question only this link asks — which clinic the visitor is coming from.
 *
 * It is the last question of the quiz and it is not scored. Every option is
 * worth 0, the axis is "meta", and `computeScore` walks the shared English bank
 * (which has no such id), so the answer can never move a visitor's band, persona
 * or driving factors. It is kept in two places: the `quiz_answers` blob, like any
 * other answer, and the `clinic_location` column of ps_pilot (migration 024),
 * where it can be grouped on without unpacking JSON.
 *
 * The option ids are what is stored, so they are the same in every language and
 * a Chinese or Malay run groups with an English one. The clinic names are proper
 * nouns and are printed as the clinics write them in all three languages; only
 * the prompt and the "not in a clinic" option are translated.
 */

export const PS_PILOT_CLINIC_QUESTION_ID = "clinic";

/** Option ids as stored in ps_pilot.clinic_location. Order is the screen's. */
export const PS_PILOT_CLINIC_IDS = [
  "republic_plaza",
  "ang_mo_kio",
  "mount_elizabeth",
  "woodleigh",
  "not_in_clinic",
] as const;

const CLINIC_NAMES: Record<Exclude<(typeof PS_PILOT_CLINIC_IDS)[number], "not_in_clinic">, string> = {
  republic_plaza: "Parkway Medical Clinic, Republic Plaza",
  ang_mo_kio: "Parkway Family Medicine Clinic, Ang Mo Kio",
  mount_elizabeth: "Parkway Executive Health Screeners, Mount Elizabeth Hospital",
  woodleigh: "Parkway MediCentre @ The Woodleigh Mall",
};

const COPY: Record<LiteEventLang, { prompt: string; notInClinic: string }> = {
  en: { prompt: "Which clinic are you from?", notInClinic: "I’m not in a clinic" },
  zh: { prompt: "您来自哪家诊所？", notInClinic: "我不在诊所" },
  ms: { prompt: "Anda datang dari klinik yang mana?", notInClinic: "Saya tidak berada di klinik" },
};

function clinicQuestion(lang: LiteEventLang): Question {
  const { prompt, notInClinic } = COPY[lang];
  return {
    id: PS_PILOT_CLINIC_QUESTION_ID,
    type: "single-select",
    axis: "meta",
    prompt,
    citation: null,
    options: PS_PILOT_CLINIC_IDS.map((id) => ({
      id,
      label: id === "not_in_clinic" ? notInClinic : CLINIC_NAMES[id],
      score: 0,
    })),
  };
}

export const PARKWAY_SHENTON_QUESTION_BANKS: Record<LiteEventLang, Record<string, Question>> = {
  en: { ...LITE_EVENT_TEMPLATE_QUESTION_BANKS.en, [PS_PILOT_CLINIC_QUESTION_ID]: clinicQuestion("en") },
  zh: { ...LITE_EVENT_TEMPLATE_QUESTION_BANKS.zh, [PS_PILOT_CLINIC_QUESTION_ID]: clinicQuestion("zh") },
  ms: { ...LITE_EVENT_TEMPLATE_QUESTION_BANKS.ms, [PS_PILOT_CLINIC_QUESTION_ID]: clinicQuestion("ms") },
};
