import type { Answers, AnswerValue, Question, CitationTag } from "src/types/quiz";
import { CompactOption, optionColsClass } from "./OptionButton";
import { CitationPill } from "./CitationPill";
import { OptionSlider } from "./OptionSlider";

interface QuestionGroupScreenProps {
  title: string;
  /** Optional clarifying line under the title — e.g. disambiguating "your
      own health" from a question block that immediately preceded it. */
  description?: string;
  questions: Question[];
  answers: Answers;
  canGoBack: boolean;
  onAnswer: (questionId: string, value: AnswerValue) => void;
  onNext: () => void;
  onBack: () => void;
  labels?: { back?: string; continue?: string };
  /**
   * Renders every question as option buttons, including the ones marked
   * `control: "slider"`.
   *
   * At booths, visitors coming off two screens of button questions did not
   * read the sliders as controls at all and stalled on them, so
   * /lite-event-template asks the shared-scale symptom questions the same way
   * it asks everything else. The options are reversed to match the slider's
   * least-severe-first reading order, which is also the order every other
   * button question in the bank uses.
   *
   * It also changes what "answered" means: an untouched slider silently
   * counts as the lowest-severity option, while a button has to be pressed,
   * so Continue now waits for these three the way it waits for the rest.
   */
  buttonsOnly?: boolean;
}

/**
 * Stacks several short-form questions (e.g. yes/no/not-sure) on a single
 * screen — the b2cfunnel pattern that collapses the health-history block
 * (BP / cholesterol / diabetes / hearing / vision) and the lifestyle block
 * (smoking / sleep / exercise / diet / alcohol) from ten taps into two
 * screens.
 */
export function QuestionGroupScreen({
  title,
  description,
  questions,
  answers,
  canGoBack,
  onAnswer,
  onNext,
  onBack,
  labels,
  buttonsOnly = false,
}: QuestionGroupScreenProps) {
  // A slider always sits on a valid option, so it never gates Continue; button
  // questions — including sliders rendered as buttons — have to be answered
  // explicitly.
  const allAnswered = questions.every(
    (q) => (q.control === "slider" && !buttonsOnly) || typeof answers[q.id] === "string"
  );

  const groupCitation = (() => {
    const citations: CitationTag[] = questions.map((q) => q.citation ?? null);
    const first = citations[0];
    if (!first) return null;
    return citations.every((c) => c === first) ? first : null;
  })();

  return (
    <div key={title} className="animate-fade-up">
      <h1 className="font-display text-[24px] sm:text-[28px] font-bold leading-snug text-charcoal">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-[13.5px] leading-snug text-quizSecondary font-jakarta">
          {description}
        </p>
      )}

      <div className="mt-6 divide-y divide-quizOutline-variant">
        {questions.map((q) => {
          const selected = answers[q.id];
          const asSlider = q.control === "slider" && !buttonsOnly;
          // Slider options are stored worst-first and flipped by OptionSlider;
          // buttons rendered in their place flip them the same way so the scale
          // still reads least severe → most severe.
          const options = q.control === "slider" ? [...(q.options ?? [])].reverse() : q.options;
          const cols = optionColsClass(options);
          return (
            <div key={q.id} className="py-5 first:pt-0">
              <p className="font-jakarta font-semibold text-charcoal text-[15px] leading-snug">
                {q.prompt}
              </p>
              {q.helpText && (
                <p className="mt-1 text-[12.5px] text-quizSecondary font-jakarta">{q.helpText}</p>
              )}
              {asSlider ? (
                <OptionSlider
                  question={q}
                  value={selected}
                  onChange={(optionId) => onAnswer(q.id, optionId)}
                />
              ) : (
                <div className={`mt-3 grid gap-2 ${cols}`}>
                  {options?.map((opt) => (
                    <CompactOption
                      key={opt.id}
                      label={opt.label}
                      selected={selected === opt.id}
                      onClick={() => onAnswer(q.id, opt.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="rounded-lg px-4 py-2.5 text-[14px] font-semibold text-quizSecondary transition-colors hover:text-charcoal disabled:invisible font-jakarta"
        >
          {labels?.back ?? "← Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allAnswered}
          className="rounded-lg bg-quizPrimary px-6 py-3 text-[15px] font-bold text-quizPrimary-on shadow-card transition hover:brightness-105 disabled:opacity-40 font-jakarta"
        >
          {labels?.continue ?? "Continue"}
        </button>
      </div>

      {groupCitation && (
        <div className="mt-6 flex justify-center">
          <CitationPill tag={groupCitation} />
        </div>
      )}
    </div>
  );
}
