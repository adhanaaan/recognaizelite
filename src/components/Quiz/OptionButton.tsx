import type { QuestionOption } from "src/types/quiz";

/**
 * Pick how many columns of options to render, based on the longest label.
 * Mirrors b2cfunnel's `colsClass` in QuestionGroupScreen so dense "Yes / No /
 * Not sure" rows pack 3 wide while long-prose options stay full width.
 */
export function optionColsClass(options: QuestionOption[] | undefined): string {
  if (!options || options.length === 0) return "grid-cols-1";
  const maxLen = Math.max(...options.map((o) => o.label.length));
  if (maxLen <= 12) return "grid-cols-3";
  if (maxLen <= 22) return "grid-cols-2";
  return "grid-cols-1";
}

interface OptionButtonProps {
  label: string;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}

/**
 * Single option button shared by the single-question and grouped-question
 * screens. Selected state is a soft peach container with an orange border
 * and dark text — restrained, not full saturation.
 */
export function OptionButton({ label, selected, multi, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="rounded-xl border-2 px-3 py-3 text-center text-[14px] font-semibold transition-all active:scale-[0.985]"
      style={{
        backgroundColor: selected ? "rgba(232,121,59,0.10)" : "#ffffff",
        borderColor: selected ? "#E8793B" : "#E5D5CA",
        color: "#1F2937",
        boxShadow: selected ? "0 2px 10px rgba(232,121,59,0.12)" : "0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      <span className="flex items-center justify-center gap-2">
        {multi && (
          <span
            className="inline-flex items-center justify-center size-4 rounded-md border-2 flex-shrink-0"
            style={{
              backgroundColor: selected ? "#E8793B" : "transparent",
              borderColor: selected ? "#E8793B" : "#D1C4B8",
            }}
          >
            {selected && (
              <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="#ffffff" strokeWidth={3}>
                <path d="M5 12l5 5L20 7" />
              </svg>
            )}
          </span>
        )}
        <span className="leading-tight">{label}</span>
      </span>
    </button>
  );
}
