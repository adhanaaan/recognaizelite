import type { QuestionOption } from "src/types/quiz";

/**
 * Choose how many columns of compact option buttons to render, based on the
 * longest label. Mirrors b2cfunnel's `colsClass` in QuestionGroupScreen so
 * "Yes / No / Not sure" packs three across, mid-length labels pack two, and
 * long-prose answers stay full width. ONLY used inside QuestionGroupScreen
 * — the standalone QuestionStep stacks full-width tiles vertically instead.
 */
export function optionColsClass(options: QuestionOption[] | undefined): string {
  if (!options || options.length === 0) return "grid-cols-1";
  const maxLen = Math.max(...options.map((o) => o.label.length));
  if (maxLen <= 12) return "grid-cols-3";
  if (maxLen <= 22) return "grid-cols-2";
  return "grid-cols-1";
}

interface OptionTileProps {
  label: string;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}

/**
 * Full-width option tile shown on standalone question screens. Matches the
 * b2cfunnel OptionButton verbatim: left-aligned label, indicator on the
 * left (rounded checkbox for multi, rounded-full radio for single), peach
 * container background when selected, shadow that lifts on hover.
 */
export function OptionTile({ label, selected, multi, onClick }: OptionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "flex w-full items-center gap-3 rounded-lg border-2 px-5 py-4 text-left text-[15px] sm:text-base font-medium transition font-jakarta",
        "shadow-card hover:-translate-y-0.5 hover:shadow-float",
        selected
          ? "border-quizPrimary bg-quizPrimary-container text-quizPrimary-onContainer"
          : "border-quizOutline-variant bg-quizSurface-lowest text-charcoal hover:border-quizPrimary",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 transition",
          multi ? "rounded" : "rounded-full",
          selected ? "border-quizPrimary bg-quizPrimary" : "border-quizOutline",
        ].join(" ")}
      >
        {selected && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-quizPrimary-on">
            <path
              d="M2 6l3 3 5-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </button>
  );
}

interface CompactOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * Compact centered-text button used inside QuestionGroupScreen. Smaller
 * than OptionTile (no indicator, no shadow, no lift) so several short
 * answers can sit in a row without dominating.
 */
export function CompactOption({ label, selected, onClick }: CompactOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "rounded-lg border-2 px-3 py-3 text-center text-[13.5px] sm:text-sm font-medium transition font-jakarta",
        selected
          ? "border-quizPrimary bg-quizPrimary-container text-quizPrimary-onContainer"
          : "border-quizOutline-variant bg-quizSurface-lowest text-charcoal hover:border-quizPrimary",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
