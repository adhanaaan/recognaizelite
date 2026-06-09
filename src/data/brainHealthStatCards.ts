/**
 * Cited "stat cards" shown between question blocks to punctuate the flow
 * with credibility. Ported verbatim from sibling repo b2cfunnel
 * (`src/config/statCards.ts`). The IMH WiSE card is the Singapore-specific
 * anchor that lands hardest with IHH / Gleneagles audiences.
 */

import type { CitationTag } from "src/types/quiz";

export interface StatCard {
  id: string;
  stat: string;
  body: string;
  source: string;
  citation: CitationTag;
}

export const STAT_CARDS: StatCard[] = [
  {
    id: "lancet2024",
    stat: "About 45%",
    body: "of dementia cases worldwide could be prevented or delayed by addressing the modifiable risk factors across a person's life.",
    source: "2024 Lancet Commission on Dementia Prevention",
    citation: "lancet2024",
  },
  {
    id: "imhWise",
    stat: "1 in 11",
    body: "Singaporeans aged 60 and over live with dementia, with numbers projected to reach 152,000 by 2030.",
    source: "IMH WiSE Study, 2024",
    citation: "imhWise",
  },
  {
    id: "salthouse",
    stat: "From age 45",
    body: "Processing speed, which is how quickly the brain handles information, can begin to gradually slow down from around age 45.",
    source: "Salthouse, Frontiers in Aging Neuroscience, 2017",
    citation: "salthouse",
  },
];

export const STAT_CARDS_BY_ID: Record<string, StatCard> = Object.fromEntries(
  STAT_CARDS.map((c) => [c.id, c])
);
