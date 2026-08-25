/**
 * Malay stat cards — the "Tahukah anda" interstitials in the quiz. Mirrors
 * `brainHealthStatCards.zh.ts`; the ids and citation tags match the English
 * bank so a flow can swap language without changing which card it shows.
 */

import type { StatCard } from "src/data/brainHealthStatCards";

export const STAT_CARDS_MS: StatCard[] = [
  {
    id: "lancet2024",
    stat: "Kira-kira 45%",
    body: "kes demensia di seluruh dunia boleh dicegah atau dilambatkan dengan menangani faktor risiko yang boleh diubah sepanjang hayat seseorang.",
    source: "Suruhanjaya Lancet 2024 mengenai Pencegahan Demensia",
    citation: "lancet2024",
  },
  {
    id: "imhWise",
    stat: "1 daripada 11",
    body: "rakyat Singapura berumur 60 tahun ke atas hidup dengan demensia, dengan jumlahnya dijangka mencecah 152,000 pada 2030.",
    source: "Kajian IMH WiSE, 2024",
    citation: "imhWise",
  },
  {
    id: "nhmsMalaysia",
    stat: "1 daripada 10",
    body: "rakyat Malaysia berumur 60 tahun ke atas hidup dengan demensia.",
    source: "Survei Kebangsaan Kesihatan dan Morbiditi (NHMS) 2025",
    citation: null,
  },
  {
    id: "salthouse",
    stat: "Dari umur 45",
    body: "Kelajuan pemprosesan, iaitu sepantas mana otak mengendalikan maklumat, boleh mula perlahan secara beransur-ansur dari sekitar umur 45.",
    source: "Salthouse, Frontiers in Aging Neuroscience, 2017",
    citation: "salthouse",
  },
];

export const STAT_CARDS_MS_BY_ID: Record<string, StatCard> = Object.fromEntries(
  STAT_CARDS_MS.map((c) => [c.id, c])
);
