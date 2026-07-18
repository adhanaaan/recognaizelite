import type { CitationTag } from "src/types/quiz";

export interface StatCard {
  id: string;
  stat: string;
  body: string;
  source: string;
  citation: CitationTag;
}

export const STAT_CARDS_ZH: StatCard[] = [
  {
    id: "lancet2024",
    stat: "约 45%",
    body: "的全球痴呆症病例可以通过在一生中管理可改变的风险因素来预防或延缓。",
    source: "2024 年《柳叶刀》痴呆症预防委员会报告",
    citation: "lancet2024",
  },
  {
    id: "imhWise",
    stat: "每 11 人中有 1 人",
    body: "60 岁及以上的新加坡人患有痴呆症，预计到 2030 年人数将达到 152,000 人。",
    source: "IMH WiSE 研究，2024",
    citation: "imhWise",
  },
  {
    id: "salthouse",
    stat: "从 45 岁起",
    body: "处理速度——即大脑处理信息的速度——可能从 45 岁左右开始逐渐减慢。",
    source: "Salthouse，《衰老神经科学前沿》，2017",
    citation: "salthouse",
  },
];

export const STAT_CARDS_ZH_BY_ID: Record<string, StatCard> = Object.fromEntries(
  STAT_CARDS_ZH.map((c) => [c.id, c])
);
