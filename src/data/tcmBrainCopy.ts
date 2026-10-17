import type { LiteEventLang } from "src/i18n/liteEvent";

/**
 * The /tcmbrain landing overrides.
 *
 * /tcmbrain is a /clinic-signup variant, so it inherits every line in
 * src/i18n/liteEventCopy.ts. What it cannot inherit is the framing: this funnel
 * reaches people through a TCM practice, and "You tracked everything — what
 * about your brain?" is a quantified-self line that would land oddly on someone
 * who came in for a consultation about qi and blood.
 *
 * So only the hero is restated, in the voice the original /tcmbrain page used
 * ("When the body is in harmony, the mind follows"). Everything below the
 * hero — the quiz, the stat cards, the report, the consent — is the shared
 * copy, unchanged.
 *
 * What is deliberately NOT here: any TCM diagnostic claim. The questionnaire is
 * the standard brain-health one, scored the same way for every funnel, and the
 * old tcmbrain_leads columns for a dampness index and a blood-stasis index were
 * provisioned years ago and never filled. Nothing on this page implies that we
 * measure a TCM constitution, because we do not. The framing is the reason the
 * visitor is in the room; the measurement is the same measurement.
 */
export type TcmBrainLandingCopy = {
  headTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  /** The headline is two lines, each with one italic emphasis. */
  heroLine1Lead: string;
  heroLine1Emph: string;
  heroLine2Lead: string;
  heroLine2Emph: string;
  heroLine2Tail: string;
  heroSub: string;
};

export const TCM_BRAIN_LANDING: Record<LiteEventLang, TcmBrainLandingCopy> = {
  en: {
    headTitle: "Holistic Brain Health Screening | ReCOGnAIze",
    metaDescription:
      "A cognitive check that complements your TCM consultation. Three minutes, no app, and a score you can act on.",
    ogTitle: "When the body is in harmony, the mind follows.",
    ogDescription:
      "A three-minute cognitive check that complements your TCM consultation.",
    heroLine1Lead: "When the body is in ",
    heroLine1Emph: "harmony,",
    heroLine2Lead: "the ",
    heroLine2Emph: "mind",
    heroLine2Tail: " follows.",
    heroSub:
      "Clear thinking rests on balanced qi and blood. Take three minutes to see where your cognition stands today.",
  },
  zh: {
    headTitle: "全面脑健康筛查 | ReCOGnAIze",
    metaDescription:
      "配合中医问诊的认知检测。三分钟，无需下载应用，并获得一个可据以行动的分数。",
    ogTitle: "身体调和，思维自然清明。",
    ogDescription: "配合中医问诊的三分钟认知检测。",
    heroLine1Lead: "身体",
    heroLine1Emph: "调和",
    heroLine2Lead: "思维自然",
    heroLine2Emph: "清明",
    heroLine2Tail: "。",
    heroSub: "气血调和，思维才得以清晰。用三分钟，看看您今天的认知表现。",
  },
  ms: {
    headTitle: "Saringan Kesihatan Otak Holistik | ReCOGnAIze",
    metaDescription:
      "Pemeriksaan kognitif yang melengkapi konsultasi TCM anda. Tiga minit, tanpa aplikasi, dengan skor yang boleh anda gunakan.",
    ogTitle: "Apabila tubuh seimbang, minda pun jernih.",
    ogDescription:
      "Pemeriksaan kognitif tiga minit yang melengkapi konsultasi TCM anda.",
    heroLine1Lead: "Apabila tubuh ",
    heroLine1Emph: "seimbang,",
    heroLine2Lead: "minda pun ",
    heroLine2Emph: "jernih",
    heroLine2Tail: ".",
    heroSub:
      "Pemikiran yang jernih berpaksikan qi dan darah yang seimbang. Luangkan tiga minit untuk melihat kedudukan kognitif anda hari ini.",
  },
};

/** The practice this funnel reaches people through. Shown beside the GMS mark. */
export const TCM_PARTNER_LOGO = {
  src: "/aiwellness-logo.jpeg",
  alt: "Asia Integrated Wellness",
} as const;
