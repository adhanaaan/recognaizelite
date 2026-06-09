import type { Answers, AnswerValue, Question, CitationTag } from "src/types/quiz";
import { OptionButton, optionColsClass } from "./OptionButton";

interface QuestionGroupScreenProps {
  title: string;
  questions: Question[];
  answers: Answers;
  canGoBack: boolean;
  onAnswer: (questionId: string, value: AnswerValue) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Stacks several short-form questions (e.g. yes/no/not-sure) on a single
 * screen, divided by hairline rules. This is the b2cfunnel pattern that
 * collapses the health-history block (BP / cholesterol / diabetes /
 * hearing / vision) and the lifestyle block (smoking / sleep / exercise /
 * diet / alcohol) from ten taps into two screens.
 */
export function QuestionGroupScreen({
  title,
  questions,
  answers,
  canGoBack,
  onAnswer,
  onNext,
  onBack,
}: QuestionGroupScreenProps) {
  const allAnswered = questions.every((q) => typeof answers[q.id] === "string");

  // Surface a single shared citation if every grouped question carries the
  // same one (the health-history block is all Lancet 2024, the lifestyle
  // block is mostly Lancet 2024). Mixed citations -> hide rather than mislead.
  const groupCitation = (() => {
    const citations: CitationTag[] = questions.map((q) => q.citation ?? null);
    const first = citations[0];
    if (!first) return null;
    return citations.every((c) => c === first) ? first : null;
  })();

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <h1
        className="text-[#1F2937] text-[24px] sm:text-[28px] leading-[1.25] font-bold"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {title}
      </h1>

      <div className="mt-5 divide-y divide-[#EBDFD3]">
        {questions.map((q) => {
          const selected = answers[q.id];
          const cols = optionColsClass(q.options);
          return (
            <div key={q.id} className="py-5 first:pt-0">
              <p className="text-[15px] font-semibold text-[#1F2937] leading-snug">
                {q.prompt}
              </p>
              {q.helpText && (
                <p className="mt-1 text-[12.5px] text-[#6B7280]">{q.helpText}</p>
              )}
              <div className={`mt-3 grid gap-2 ${cols}`}>
                {q.options?.map((opt) => (
                  <OptionButton
                    key={opt.id}
                    label={opt.label}
                    selected={selected === opt.id}
                    onClick={() => onAnswer(q.id, opt.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="rounded-lg px-4 py-2.5 text-[14px] font-semibold text-[#9CA3AF] transition-colors hover:text-[#1F2937] disabled:invisible"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allAnswered}
          className="rounded-full px-6 py-3 text-[15px] font-bold text-white tracking-wide transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ backgroundColor: "#E8793B", boxShadow: "0 4px 20px rgba(232,121,59,0.25)" }}
        >
          Continue
        </button>
      </div>

      {groupCitation === "lancet2024" && (
        <p className="mt-6 text-center text-[10.5px] text-[#9CA3AF]">
          Based on Lancet Commission on Dementia Prevention, 2024
        </p>
      )}
    </div>
  );
}
