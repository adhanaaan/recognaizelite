/**
 * Indonesian (Bahasa Indonesia) stat cards — the "Tahukah Anda" interstitials
 * in the quiz. Mirrors `brainHealthStatCards.ms.ts`; the ids and citation tags
 * match the English bank so a flow can swap language without changing which
 * card it shows.
 *
 * "ID" is the language here, the ISO 639-1 code for Indonesian, which is why
 * the exported map reads `STAT_CARDS_ID_BY_ID`: the Indonesian cards, keyed by
 * card id.
 *
 * The `imhWise` card is the one /clinic-signup-id actually shows, and it is
 * still Singapore's prevalence figure, translated rather than localised. The
 * English bank carries `nhmsMalaysia` as Malaysia's counterpart for
 * /act4health, so an Indonesian counterpart clearly belongs here too — but it
 * needs a prevalence figure and a citation the clinical team stands behind, and
 * inventing one for a card that sits next to IMH WiSE and the Lancet Commission
 * is not a translation decision. Add the card to the English bank with its
 * source, translate it here, and point the quiz's `statCard` step at it.
 */

import type { StatCard } from "src/data/brainHealthStatCards";

export const STAT_CARDS_ID: StatCard[] = [
  {
    id: "lancet2024",
    stat: "Sekitar 45%",
    body: "kasus demensia di seluruh dunia dapat dicegah atau ditunda dengan menangani faktor risiko yang dapat diubah sepanjang hidup seseorang.",
    source: "Lancet Commission 2024 tentang Pencegahan Demensia",
    citation: "lancet2024",
  },
  {
    id: "imhWise",
    stat: "1 dari 11",
    body: "warga Singapura berusia 60 tahun ke atas hidup dengan demensia, dan jumlahnya diperkirakan mencapai 152.000 pada 2030.",
    source: "Studi IMH WiSE, 2024",
    citation: "imhWise",
  },
  {
    id: "nhmsMalaysia",
    stat: "1 dari 10",
    body: "warga Malaysia berusia 60 tahun ke atas hidup dengan demensia.",
    source: "National Health and Morbidity Survey (NHMS) 2025",
    citation: null,
  },
  {
    id: "salthouse",
    stat: "Sejak usia 45",
    body: "Kecepatan pemrosesan, yaitu seberapa cepat otak menangani informasi, dapat mulai melambat secara bertahap sejak sekitar usia 45 tahun.",
    source: "Salthouse, Frontiers in Aging Neuroscience, 2017",
    citation: "salthouse",
  },
];

export const STAT_CARDS_ID_BY_ID: Record<string, StatCard> = Object.fromEntries(
  STAT_CARDS_ID.map((c) => [c.id, c])
);
