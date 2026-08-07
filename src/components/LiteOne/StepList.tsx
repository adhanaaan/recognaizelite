import React from "react";

export type LiteStep = {
  label: string;
  /** Inline glyph rendered at the end of the row. */
  icon: React.ReactNode;
};

/**
 * The numbered rows on the "In the next 3 mins" screen.
 *
 * Each step is a circle, joined by a hairline that draws downward as the
 * rows stagger in — so the list reads as a route through the flow rather
 * than three unrelated bullets.
 */
export function StepList({ steps }: { steps: LiteStep[] }) {
  return (
    <ol className="mx-auto w-full max-w-[360px] text-left">
      {steps.map((step, idx) => {
        const last = idx === steps.length - 1;
        const delay = 220 + idx * 110;
        return (
          <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
            {/* connector */}
            {!last && (
              <span
                aria-hidden
                className="lite-line-draw absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-px bg-quizOutline-variant"
                style={{ animationDelay: `${delay + 90}ms` }}
              />
            )}

            <span
              className="lite-rise relative z-10 flex size-[34px] shrink-0 items-center justify-center rounded-full border-2 border-quizPrimary/35 bg-quizSurface-lowest text-[14px] font-bold text-quizPrimary shadow-card"
              style={{ animationDelay: `${delay}ms` }}
            >
              {idx + 1}
            </span>

            <span
              className="lite-rise flex min-h-[34px] flex-1 items-center justify-between gap-3"
              style={{ animationDelay: `${delay + 50}ms` }}
            >
              <span className="text-[15.5px] font-medium leading-snug text-charcoal">
                {step.label}
              </span>
              <span className="shrink-0 text-quizPrimary/70">{step.icon}</span>
            </span>
          </li>
        );
      })}
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
