import type { Question, AnswerValue, CitationTag } from "src/types/quiz";
import { OptionButton, optionColsClass } from "./OptionButton";

interface QuestionStepProps {
  question: Question;
  value: AnswerValue | undefined;
  canGoBack: boolean;
  onAnswer: (value: AnswerValue) => void;
  onNext: () => void;
  onBack: () => void;
}

const CITATION_LABELS: Record<NonNullable<CitationTag>, string> = {
  lancet2024: "Lancet Commission on Dementia Prevention, 2024",
  caide: "CAIDE Dementia Risk Score",
  scd: "Subjective Cognitive Decline (SCD) literature",
  straw10: "STRAW+10, 2012",
  salthouse: "Salthouse, Frontiers in Aging Neuroscience, 2017",
  imhWise: "IMH WiSE Study, 2024",
  whitehall: "Whitehall II Study",
};

function citationLabel(tag: CitationTag): string | null {
  if (!tag) return null;
  return CITATION_LABELS[tag] ?? null;
}

/**
 * Single-question screen. Single-select auto-advances after a short beat
 * so the chosen option is visible (mirrors b2cfunnel/event). Multi-select
 * waits for an explicit Continue.
 *
 * "Nothing in particular" on the `tracks` multi-select is exclusive of
 * the other options, matching b2cfunnel's behaviour.
 */
export function QuestionStep({
  question,
  value,
  canGoBack,
  onAnswer,
  onNext,
  onBack,
}: QuestionStepProps) {
  const isMulti = question.multiSelect === true || question.type === "multi-select";
  const selected: string[] = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : [];

  const handleSingle = (optionId: string) => {
    onAnswer(optionId);
    // Brief beat so the visual selection registers before we navigate.
    setTimeout(onNext, 220);
  };

  const handleMulti = (optionId: string) => {
    if (optionId === "nothing") {
      onAnswer(["nothing"]);
      return;
    }
    const base = selected.filter((s) => s !== "nothing");
    const next = base.includes(optionId)
      ? base.filter((s) => s !== optionId)
      : [...base, optionId];
    onAnswer(next);
  };

  const citation = citationLabel(question.citation ?? null);
  const cols = optionColsClass(question.options);

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <h1
        className="text-[#1F2937] text-[24px] sm:text-[28px] leading-[1.25] font-bold"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {question.prompt}
      </h1>
      {question.helpText && (
        <p className="mt-2 text-[14px] text-[#6B7280] leading-relaxed">{question.helpText}</p>
      )}

      <div className={`mt-6 grid gap-2.5 ${cols}`}>
        {question.options?.map((opt) => (
          <OptionButton
            key={opt.id}
            label={opt.label}
            multi={isMulti}
            selected={selected.includes(opt.id)}
            onClick={() => (isMulti ? handleMulti(opt.id) : handleSingle(opt.id))}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="rounded-lg px-4 py-2.5 text-[14px] font-semibold text-[#9CA3AF] transition-colors hover:text-[#1F2937] disabled:invisible"
        >
          ← Back
        </button>
        {isMulti && (
          <button
            type="button"
            onClick={onNext}
            disabled={selected.length === 0}
            className="rounded-full px-6 py-3 text-[15px] font-bold text-white tracking-wide transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ backgroundColor: "#E8793B", boxShadow: "0 4px 20px rgba(232,121,59,0.25)" }}
          >
            Continue
          </button>
        )}
      </div>

      {citation && (
        <p className="mt-6 text-center text-[10.5px] text-[#9CA3AF]">
          Based on {citation}
        </p>
      )}
    </div>
  );
}
