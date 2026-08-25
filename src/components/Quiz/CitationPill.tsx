import { APP_LANG } from "src/constants";
import type { CitationTag } from "src/types/quiz";

/**
 * Citation pill — surfaces the evidence behind a question / question group.
 * Uses Clinical Empathy's Pill spec (`text-quizPill-text` on
 * `bg-quizPill-bg`) plus an open-book glyph so the source reads as a
 * credibility chip rather than a legal disclaimer.
 *
 * For the well-known citations we link directly to the paper; for the
 * literature-bundle citations (CAIDE, SCD) the chip stays non-interactive
 * since there's no single canonical URL.
 */

type CitationInfo = {
  source: string; // bolded — what they'll recognise at a glance
  detail: string; // the journal / context — light
  href?: string;  // optional link target
};

const CITATION_INFO: Record<NonNullable<CitationTag>, CitationInfo> = {
  lancet2024: {
    source: "Lancet Commission",
    detail: "Dementia Prevention · 2024",
    href: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(24)01296-0/fulltext",
  },
  caide: {
    source: "CAIDE",
    detail: "Dementia Risk Score",
  },
  scd: {
    source: "SCD literature",
    detail: "Subjective Cognitive Decline",
  },
  straw10: {
    source: "STRAW+10",
    detail: "Reproductive Aging · 2012",
    href: "https://academic.oup.com/jcem/article/97/4/1159/2823010",
  },
  salthouse: {
    source: "Salthouse · 2017",
    detail: "Frontiers in Aging Neuroscience",
    href: "https://www.frontiersin.org/articles/10.3389/fnagi.2017.00104/full",
  },
  imhWise: {
    source: "IMH WiSE Study · 2024",
    detail: "Singapore dementia prevalence",
  },
  whitehall: {
    source: "Whitehall II",
    detail: "UK longitudinal cohort",
  },
};

/**
 * The descriptive half of each pill, translated. Read off the app-wide
 * `APP_LANG` rather than a prop because the pill is rendered from inside
 * QuestionStep and QuestionGroupScreen, several levels below any page that
 * knows the language; /lite-event's picker keeps APP_LANG in step
 * (src/i18n/liteEvent.ts) and every other funnel leaves it at ENGLISH.
 *
 * `source` is left alone in every language: those are the names of papers,
 * cohorts and instruments, and translating them would make the citation harder
 * to look up, not easier to read.
 */
const DETAIL_I18N: Record<string, Record<NonNullable<CitationTag>, string>> = {
  MANDARIN: {
    lancet2024: "痴呆症预防 · 2024",
    caide: "痴呆症风险评分",
    scd: "主观认知衰退研究文献",
    straw10: "生殖衰老 · 2012",
    salthouse: "《衰老神经科学前沿》",
    imhWise: "新加坡痴呆症患病率",
    whitehall: "英国纵向队列研究",
  },
  MALAY: {
    lancet2024: "Pencegahan Demensia · 2024",
    caide: "Skor Risiko Demensia",
    scd: "Literatur Kemerosotan Kognitif Subjektif",
    straw10: "Penuaan Reproduktif · 2012",
    salthouse: "Frontiers in Aging Neuroscience",
    imhWise: "Prevalens demensia Singapura",
    whitehall: "Kohort longitud UK",
  },
};

interface CitationPillProps {
  tag: CitationTag;
}

function BookIcon() {
  return (
    <svg
      aria-hidden
      className="size-3.5 flex-shrink-0 text-quizPill-text"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden
      className="size-3 flex-shrink-0 text-quizPill-text/70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 3h7v7M10 14L21 3M21 14v7H3V3h7" />
    </svg>
  );
}

export function CitationPill({ tag }: CitationPillProps) {
  if (!tag) return null;
  const info = CITATION_INFO[tag];
  if (!info) return null;

  const detail = DETAIL_I18N[APP_LANG]?.[tag] ?? info.detail;

  const content = (
    <>
      <BookIcon />
      <span className="text-left text-[11px] font-jakarta leading-tight">
        <span className="font-bold text-quizPill-text">{info.source}</span>
        <span className="text-quizPill-text/70"> · {detail}</span>
      </span>
      {info.href && <ExternalLinkIcon />}
    </>
  );

  const base =
    "inline-flex items-center gap-2 rounded-full bg-quizPill-bg px-3.5 py-1.5 max-w-full";

  if (info.href) {
    return (
      <a
        href={info.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} transition-shadow hover:shadow-card`}
      >
        {content}
      </a>
    );
  }

  return <div className={base}>{content}</div>;
}
