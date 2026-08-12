import React from "react";
import { LOCKED_DOMAINS } from "src/data/liteOneContent";
import type { SeverityVisual } from "src/components/Report/BellCurve";

const BoltGlyph = (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
    <path d="M13 2 4.5 13.2c-.4.5 0 1.3.7 1.3H10l-1.1 7.2c-.1.8.9 1.2 1.4.6L19.5 11c.4-.5 0-1.3-.7-1.3H14l1.1-7.1c.1-.8-.9-1.2-1.4-.6Z" />
  </svg>
);

const LockGlyph = (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
    <rect x="3.5" y="10.5" width="17" height="10.5" rx="2.2" />
    <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
  </svg>
);

/**
 * The four cognitive domains: the one the visitor earned, and the three the
 * 60-second test can't see. The locked cards are the argument for the full
 * test, so they carry real descriptions rather than a blurred placeholder.
 *
 * The cards are read-only, and the raw score has been removed — the sentence
 * above the grid already carries the "how did I do" message, so a numeric
 * tally per tile just competed with it.
 */
export function DomainGrid({ severity }: { severity: SeverityVisual }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* unlocked */}
      <div
        className="flex flex-col rounded-2xl border-2 p-4"
        style={{ borderColor: severity.color, backgroundColor: severity.softBg }}
      >
        <span style={{ color: severity.color }}>{BoltGlyph}</span>
        <h3 className="mt-2 text-[14px] font-bold leading-tight text-charcoal">Processing Speed</h3>
        <p className="mt-1 text-[11.5px] leading-snug text-quizSecondary">
          How quickly your brain reacts to information
        </p>
        <span
          className="mt-3 self-start rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ color: severity.color, backgroundColor: "rgba(255,255,255,0.6)" }}
        >
          {severity.label}
        </span>
      </div>

      {LOCKED_DOMAINS.map((domain) => (
        <div
          key={domain.name}
          className="flex flex-col rounded-2xl border border-quizOutline-variant bg-quizSurface-low p-4"
        >
          <span className="text-quizOutline">{LockGlyph}</span>
          <h3 className="mt-2 text-[14px] font-bold leading-tight text-quizSecondary">
            {domain.name}
          </h3>
          <p className="mt-1 text-[11.5px] leading-snug text-quizOutline">{domain.blurb}</p>
          <span className="mt-3 self-start rounded-full bg-white/60 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-quizOutline">
            Locked
          </span>
        </div>
      ))}
    </div>
  );
}
