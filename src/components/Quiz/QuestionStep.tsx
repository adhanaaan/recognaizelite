import type { Question, AnswerValue, CitationTag } from "src/types/quiz";
import { OptionTile } from "./OptionButton";

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
 * Single-question screen. Matches b2cfunnel's QuestionScreen layout:
 * Jakarta display heading, vertically-stacked full-width tile buttons,
 * single-select auto-advances after a 220ms beat, multi-select waits for
 * an explicit Continue. "Nothing in particular" on the tracks question
 * is exclusive of the others.
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

  return (
    <div key={question.id} className="animate-fade-up">
      <h1 className="font-display text-[24px] sm:text-[28px] font-bold leading-snug text-charcoal">
        {question.prompt}
      </h1>
      {question.helpText && (
        <p className="mt-2 text-[14px] text-quizSecondary font-jakarta">{question.helpText}</p>
      )}

      <div className="mt-6 space-y-3">
        {question.options?.map((opt) => (
          <OptionTile
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
          className="rounded-lg px-4 py-2.5 text-[14px] font-semibold text-quizSecondary transition-colors hover:text-charcoal disabled:invisible font-jakarta"
        >
          ← Back
        </button>
        {isMulti && (
          <button
            type="button"
            onClick={onNext}
            disabled={selected.length === 0}
            className="rounded-lg bg-quizPrimary px-6 py-3 text-[15px] font-bold text-quizPrimary-on shadow-card transition hover:brightness-105 disabled:opacity-40 font-jakarta"
          >
            Continue
          </button>
        )}
      </div>

      {citation && (
        <p className="mt-6 text-center text-[10.5px] text-quizOutline font-jakarta">
          Based on {citation}
        </p>
      )}
    </div>
  );
}
