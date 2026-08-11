import React from "react";

export type LiteStep = {
  label: string;
  /** Artwork for the right-hand side of the row — a preview of that step. */
  illustration: React.ReactNode;
};

/**
 * The numbered rows on the "In the next 3 mins" screen.
 *
 * Each step is its own soft card carrying a preview of what that step looks
 * like, so the list shows the flow rather than just naming it.
 */
export function StepList({ steps }: { steps: LiteStep[] }) {
  return (
    <ol className="mx-auto w-full max-w-[380px] space-y-3.5 text-left">
      {steps.map((step, idx) => (
        <li
          key={step.label}
          className="lite-rise flex items-center gap-3 rounded-2xl border border-quizOutline-variant/40 bg-quizSurface-low/70 py-3 pl-3.5 pr-3"
          style={{ animationDelay: `${200 + idx * 120}ms` }}
        >
          <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-quizSurface-lowest text-[13px] font-bold text-quizSecondary shadow-sm">
            {idx + 1}
          </span>
          <span className="flex-1 text-[14.5px] font-semibold leading-snug text-charcoal">
            {step.label}
          </span>
          <span className="shrink-0">{step.illustration}</span>
        </li>
      ))}
    </ol>
  );
}

/* --- glyphs --------------------------------------------------------- */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const GamepadGlyph = (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden {...stroke}>
    <path d="M6.5 9h11a4 4 0 0 1 3.9 4.9l-.7 3.2A2.4 2.4 0 0 1 16.4 18l-1.6-2h-5.6L7.6 18a2.4 2.4 0 0 1-4.3-.9l-.7-3.2A4 4 0 0 1 6.5 9Z" />
    <path d="M8 12v2.2M6.9 13.1h2.2M15.5 12.6h.01M17.4 14.2h.01" />
  </svg>
);

export const CurveGlyph = (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden {...stroke}>
    {/* Shoulders kept low and the apex wide, so it still reads as a
        distribution rather than a warning triangle at 20px. */}
    <path d="M2 17.5C6 17.5 6.5 7.5 12 7.5S18 17.5 22 17.5" strokeWidth={1.9} />
    <path d="M2 20.5h20" strokeWidth={1.9} />
  </svg>
);

export const BulbGlyph = (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden {...stroke}>
    <path d="M12 3a6 6 0 0 1 6 6c0 2.4-1.4 3.9-2.6 5.1-.6.6-.9 1.2-.9 1.9v.5h-5v-.5c0-.7-.3-1.3-.9-1.9C7.4 12.9 6 11.4 6 9a6 6 0 0 1 6-6Z" />
    <path d="M10 20h4" />
  </svg>
);

export const QuizGlyph = (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden {...stroke}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M9 7h6M9 11h6M9 15h3" />
    <circle cx="16.5" cy="15" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
