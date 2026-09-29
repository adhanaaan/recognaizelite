/**
 * Copy for the /parkwayshenton loading screen — Figma "09 · Loading", node
 * 711-6635: a progress ring, "{name}, we are generating your report", and
 * three lines that tick off as the ring fills.
 *
 * This funnel's own rather than the shared `loading` set in
 * src/i18n/liteEventCopy.ts, which six other funnels' loading screens still
 * read with its five rotating crumbs. Should they move to this design too,
 * these lines are the ones to promote into that set.
 *
 * All three of the funnel's languages are here for the same reason the flow
 * keeps its picker: a visitor who chose 中文 on the landing page should not
 * hit an English screen just before their report.
 */

import type { LiteEventLang } from "src/i18n/liteEvent";

export type ParkwayShentonLoadingCopy = {
  headTitle: string;
  /** What a screen reader hears for the ring. */
  progressLabel: string;
  /** The heading when the landing's name didn't reach this screen. */
  heading: string;
  headingNamed: (name: string) => string;
  /** The three lines under the heading, ticked off in order. */
  steps: [string, string, string];
};

const EN: ParkwayShentonLoadingCopy = {
  headTitle: "Generating your report | ReCOGnAIze",
  progressLabel: "Generating your report",
  heading: "We are generating your report",
  headingNamed: (name) => `${name}, we are generating your report`,
  steps: [
    "Calculating your processing speed score",
    "Reviewing your health and lifestyle answers",
    "Preparing your brain health recommendation",
  ],
};

const ZH: ParkwayShentonLoadingCopy = {
  headTitle: "正在生成您的报告 | ReCOGnAIze",
  progressLabel: "正在生成您的报告",
  heading: "正在生成您的报告",
  headingNamed: (name) => `${name}，正在生成您的报告`,
  steps: [
    "正在计算您的处理速度分数",
    "正在审阅您的健康与生活方式回答",
    "正在准备您的脑健康建议",
  ],
};

const MS: ParkwayShentonLoadingCopy = {
  headTitle: "Menjana laporan anda | ReCOGnAIze",
  progressLabel: "Menjana laporan anda",
  heading: "Kami sedang menjana laporan anda",
  headingNamed: (name) => `${name}, kami sedang menjana laporan anda`,
  steps: [
    "Mengira skor kelajuan pemprosesan anda",
    "Menyemak jawapan kesihatan dan gaya hidup anda",
    "Menyediakan cadangan kesihatan otak anda",
  ],
};

const BY_LANG: Record<LiteEventLang, ParkwayShentonLoadingCopy> = { en: EN, zh: ZH, ms: MS };

export const parkwayShentonLoadingCopy = (lang: LiteEventLang): ParkwayShentonLoadingCopy =>
  BY_LANG[lang] ?? EN;
