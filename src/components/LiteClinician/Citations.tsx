import { CITATIONS, INSTITUTION, PERFORMANCE } from "src/data/liteClinicianContent";

/**
 * Provenance, rendered the way a clinician expects to read it: figures stated
 * flatly, then the references that back them, with DOIs.
 *
 * Deliberately not a "trust band". The consumer funnels prove credibility with
 * press logos (CNA, Straits Times, Zaobao) — for this audience the equivalent
 * is the citation, so the logos are gone and the papers take their place.
 */
export function PerformanceFigures() {
  return (
    <dl className="grid grid-cols-2 gap-4">
      {PERFORMANCE.map((f) => (
        <div key={f.caption}>
          <dt className="font-display text-[30px] font-extrabold leading-none text-charcoal">
            {f.value}
          </dt>
          <dd className="mt-1.5 text-[12px] leading-snug text-quizSecondary">{f.caption}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Citations({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-3">
      {CITATIONS.map((c) => (
        <a
          key={c.doi}
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-quizOutline-variant bg-quizSurface-lowest px-4 py-3 transition-colors hover:border-quizPrimary"
        >
          <p className="text-[13px] font-semibold leading-snug text-charcoal">{c.title}</p>
          <p className="mt-1 text-[11.5px] leading-snug text-quizSecondary">
            {c.authors} <em>{c.journal}</em>, {c.year}. doi:{c.doi}
          </p>
          {!compact && (
            <p className="mt-1.5 text-[11.5px] leading-snug text-quizOutline">{c.note}</p>
          )}
        </a>
      ))}
      <p className="pt-1 text-[11px] leading-snug text-quizOutline">{INSTITUTION}</p>
    </div>
  );
}
