/**
 * Copy for the two sections the /parkway report does differently.
 *
 * Everything else on that page still reads from the shared sets — this module
 * only covers what the Parkway design replaces: the three booking steps under
 * "What to do now?", and the "Your next step" consultation section that stands
 * where /lite-event-template sells the online assessment.
 *
 * All three of the funnel's languages are here for the same reason the flow
 * keeps its picker: a visitor who chose 中文 on the landing page should not
 * hit an English wall two thirds of the way down their report. Site names stay
 * as they are in every language — they are how the buildings are signposted.
 */

import type { LiteEventLang } from "src/i18n/liteEvent";

export type ParkwayStep = {
  /** "Step 1" — the small rust label above the title. */
  step: string;
  title: string;
  body: string;
};

export type ParkwayCopy = {
  /** The persistent bottom bar, shown across every section of the report. */
  stickyBar: {
    title: string;
    subtitle: string;
  };
  product: {
    eyebrow: string;
    /** The h2, broken where the design breaks it. */
    h2Lead: string;
    h2Tail: string;
    /** Step 1 carries the site carousel, so its steps are listed separately. */
    steps: [ParkwayStep, ParkwayStep, ParkwayStep];
    /** Alt text for the two illustrated steps. */
    stepGamesAlt: string;
    stepReportAlt: string;
    cta: string;
  };
  offer: {
    eyebrow: string;
    h2: string;
    body: string;
    cardTitle: string;
    /** The three ticked lines on the offer card. */
    included: [string, string, string];
    sitesLabel: string;
    cta: string;
    /** `{number}` is replaced with the WhatsApp line as it is displayed. */
    footnote: (number: string) => string;
  };
};

const EN: ParkwayCopy = {
  stickyBar: {
    title: "TAKE THE FULL ASSESSMENT",
    subtitle: "@ Parkway Shenton Clinics",
  },
  product: {
    eyebrow: "What to do now?",
    h2Lead: "Take the",
    h2Tail: "FULL ReCOGnAIze assessment",
    steps: [
      {
        step: "Step 1",
        title: "Book your full screening",
        body: "Visit either of these Parkway Shenton sites for more information.",
      },
      {
        step: "Step 2",
        title: "Play a 10 minute brain health game",
        body: "An online assessment with games that measure speed, attention, decision making, and memory.",
      },
      {
        step: "Step 3",
        title: "Get your full report",
        body: "Review your brain performance with actionable ways to improve.",
      },
    ],
    stepGamesAlt: "The brain health games running on a phone, a tablet and a laptop",
    stepReportAlt: "A cognitive performance report scoring four brain domains",
    cta: "Book the test",
  },
  offer: {
    eyebrow: "Your next step",
    h2: "Book a consultation at Parkway Shenton",
    body: "Your brain carries you through every part of life. Understand how it's doing today, and what you can do to protect it for the years ahead.",
    cardTitle: "Full cognitive screening & consultation",
    included: [
      "Comprehensive cognitive screening",
      "A walkthrough of this report and what it means for you",
      "Clear, personalised next steps for your brain health",
    ],
    sitesLabel: "Visit our sites",
    cta: "Book a consultation on WhatsApp",
    footnote: (number) => `Opens WhatsApp · ${number} · The team replies during clinic hours.`,
  },
};

const ZH: ParkwayCopy = {
  stickyBar: {
    title: "做完整评估",
    subtitle: "@ 百汇珊顿诊所",
  },
  product: {
    eyebrow: "接下来该怎么做？",
    h2Lead: "做完整的",
    h2Tail: "ReCOGnAIze 评估",
    steps: [
      {
        step: "第 1 步",
        title: "预约您的完整筛查",
        body: "欢迎前往以下任何一家百汇珊顿诊所了解详情。",
      },
      {
        step: "第 2 步",
        title: "玩 10 分钟的脑健康游戏",
        body: "线上评估，通过游戏测量您的速度、注意力、决策力和记忆力。",
      },
      {
        step: "第 3 步",
        title: "获取您的完整报告",
        body: "查看您的大脑表现，以及可以着手改善的具体做法。",
      },
    ],
    stepGamesAlt: "脑健康游戏在手机、平板和笔记本电脑上运行",
    stepReportAlt: "涵盖四大脑功能领域的认知表现报告",
    cta: "预约测试",
  },
  offer: {
    eyebrow: "您的下一步",
    h2: "预约百汇珊顿的咨询",
    body: "大脑陪您走过生活的每一段路。了解它今天的状态，以及您可以怎么保护它，为往后的岁月做好准备。",
    cardTitle: "完整认知筛查与咨询",
    included: [
      "全面的认知筛查",
      "由专人为您讲解这份报告，以及它对您的意义",
      "针对您脑健康的清晰、个性化建议",
    ],
    sitesLabel: "欢迎前往我们的诊所",
    cta: "通过 WhatsApp 预约咨询",
    footnote: (number) => `将打开 WhatsApp · ${number} · 团队在诊所营业时间内回复。`,
  },
};

const MS: ParkwayCopy = {
  stickyBar: {
    title: "AMBIL PENILAIAN PENUH",
    subtitle: "@ Klinik Parkway Shenton",
  },
  product: {
    eyebrow: "Apa langkah seterusnya?",
    h2Lead: "Ambil",
    h2Tail: "penilaian ReCOGnAIze PENUH",
    steps: [
      {
        step: "Langkah 1",
        title: "Tempah saringan penuh anda",
        body: "Kunjungi mana-mana lokasi Parkway Shenton ini untuk maklumat lanjut.",
      },
      {
        step: "Langkah 2",
        title: "Main permainan kesihatan otak 10 minit",
        body: "Penilaian dalam talian dengan permainan yang mengukur kelajuan, perhatian, pembuatan keputusan dan memori.",
      },
      {
        step: "Langkah 3",
        title: "Dapatkan laporan penuh anda",
        body: "Semak prestasi otak anda berserta cara yang boleh anda amalkan untuk memperbaikinya.",
      },
    ],
    stepGamesAlt: "Permainan kesihatan otak pada telefon, tablet dan komputer riba",
    stepReportAlt: "Laporan prestasi kognitif yang menilai empat domain otak",
    cta: "Tempah ujian",
  },
  offer: {
    eyebrow: "Langkah anda seterusnya",
    h2: "Tempah konsultasi di Parkway Shenton",
    body: "Otak anda membawa anda melalui setiap bahagian kehidupan. Fahami keadaannya hari ini, dan apa yang boleh anda lakukan untuk melindunginya bagi tahun-tahun mendatang.",
    cardTitle: "Saringan kognitif penuh & konsultasi",
    included: [
      "Saringan kognitif yang menyeluruh",
      "Penerangan lanjut tentang laporan ini dan maksudnya bagi anda",
      "Langkah seterusnya yang jelas dan diperibadikan untuk kesihatan otak anda",
    ],
    sitesLabel: "Kunjungi lokasi kami",
    cta: "Tempah konsultasi di WhatsApp",
    footnote: (number) =>
      `Membuka WhatsApp · ${number} · Pasukan kami membalas pada waktu klinik.`,
  },
};

const BY_LANG: Record<LiteEventLang, ParkwayCopy> = { en: EN, zh: ZH, ms: MS };

export const parkwayReportCopy = (lang: LiteEventLang): ParkwayCopy => BY_LANG[lang] ?? EN;
