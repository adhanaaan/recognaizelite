import { useState } from "react";
import type { Question, AnswerValue, CitationTag } from "src/types/quiz";

interface QuestionStepProps {
  question: Question;
  initial: AnswerValue | undefined;
  onAnswer: (value: AnswerValue) => void;
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

export function QuestionStep({ question, initial, onAnswer }: QuestionStepProps) {
  const isMulti = question.multiSelect === true || question.type === "multi-select";
  const [multiSelection, setMultiSelection] = useState<string[]>(
    Array.isArray(initial) ? initial : []
  );

  const citation = citationLabel(question.citation ?? null);

  const handleSingle = (optionId: string) => onAnswer(optionId);

  const toggleMulti = (optionId: string) => {
    setMultiSelection((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const handleMultiContinue = () => onAnswer(multiSelection);

  return (
    <div className="w-full max-w-[440px] mx-auto">
      <h2
        className="text-[#1F2937] text-[22px] sm:text-[26px] leading-[1.25] font-normal text-center"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {question.prompt}
      </h2>
      {question.helpText && (
        <p className="mt-2 text-center text-[13px] text-[#6B7280]">{question.helpText}</p>
      )}

      <div className="mt-6 space-y-2.5">
        {question.options?.map((option) => {
          const selected = isMulti
            ? multiSelection.includes(option.id)
            : initial === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => (isMulti ? toggleMulti(option.id) : handleSingle(option.id))}
              className="w-full rounded-xl border px-4 py-3.5 text-left text-[15px] font-medium transition-all active:scale-[0.99]"
              style={{
                backgroundColor: selected ? "#E8793B" : "#ffffff",
                borderColor: selected ? "#E8793B" : "#E5D5CA",
                color: selected ? "#ffffff" : "#1F2937",
                boxShadow: selected ? "0 4px 16px rgba(232,121,59,0.25)" : "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <span className="flex items-center gap-3">
                {isMulti && (
                  <span
                    className="inline-flex items-center justify-center size-5 rounded-md border flex-shrink-0"
                    style={{
                      backgroundColor: selected ? "#ffffff" : "transparent",
                      borderColor: selected ? "#ffffff" : "#D1C4B8",
                    }}
                  >
                    {selected && (
                      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="#E8793B" strokeWidth={3}>
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </span>
                )}
                <span>{option.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {isMulti && (
        <button
          type="button"
          onClick={handleMultiContinue}
          disabled={multiSelection.length === 0}
          className="mt-5 w-full rounded-full px-6 py-3.5 text-[15px] font-bold text-white tracking-wide transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ backgroundColor: "#E8793B", boxShadow: "0 4px 24px rgba(232,121,59,0.30)" }}
        >
          Continue
        </button>
      )}

      {citation && (
        <p className="mt-5 text-center text-[10.5px] text-[#9CA3AF]">
          Based on {citation}
        </p>
      )}
    </div>
  );
}
