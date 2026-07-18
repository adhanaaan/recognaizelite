import type { Question, AnswerValue } from "src/types/quiz";
import { OptionTile } from "./OptionButton";
import { CitationPill } from "./CitationPill";

interface QuestionStepProps {
  question: Question;
  value: AnswerValue | undefined;
  canGoBack: boolean;
  onAnswer: (value: AnswerValue) => void;
  onNext: () => void;
  onBack: () => void;
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

      {question.citation && (
        <div className="mt-6 flex justify-center">
          <CitationPill tag={question.citation} />
        </div>
      )}
    </div>
  );
}
