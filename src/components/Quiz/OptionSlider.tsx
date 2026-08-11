import type { AnswerValue, Question } from "src/types/quiz";

/**
 * Discrete slider over an ordinal option set, ported from b2cfunnel's
 * `OptionSlider` (`src/components/screens/QuestionGroupScreen.tsx`) so the three
 * shared-scale symptom questions read as one calibrated instrument instead of
 * three identical button rows.
 *
 * Options run low → high severity, so the source arrays — which are
 * worst-first — are reversed here. An untouched slider parks at the
 * lowest-severity end and records nothing; that scores the same as the option
 * it is sitting on (0), so leaving it alone is equivalent to answering "not
 * that I notice". The conditional `persistence` follow-up keys off the same
 * absence, and so stays hidden until the slider is actually moved.
 */
export function OptionSlider({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (optionId: string) => void;
}) {
  const options = [...(question.options ?? [])].reverse(); // good (left) → bad (right)
  if (options.length === 0) return null;

  const max = options.length - 1;
  const found = options.findIndex((o) => o.id === value);
  const index = found >= 0 ? found : 0;
  const positionPct = max === 0 ? 0 : (index / max) * 100;

  return (
    <div className="mt-5">
      <p className="text-center text-[17px] font-extrabold text-quizPrimary font-jakarta">
        {options[index].label}
      </p>

      <div className="relative mt-3 flex h-6 items-center">
        <div
          className="h-3 w-full rounded-full"
          style={{
            background: "linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)",
          }}
        />
        {options.map((option, i) => (
          <span
            key={option.id}
            aria-hidden
            className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-white/70"
            style={{ left: `${max === 0 ? 0 : (i / max) * 100}%` }}
          />
        ))}
        <span
          aria-hidden
          className="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-quizPrimary bg-white shadow-card"
          style={{ left: `${positionPct}%` }}
        />
        {/* The real control, kept transparent over the painted track so it
            still carries native keyboard and screen-reader behaviour. */}
        <input
          type="range"
          min={0}
          max={max}
          step={1}
          value={index}
          onChange={(e) => onChange(options[Number(e.target.value)].id)}
          aria-label={question.prompt}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
      </div>

      <div className="mt-2 flex gap-1 text-center text-[10px] font-medium leading-tight text-quizOutline font-jakarta">
        {options.map((option, i) => (
          <span
            key={option.id}
            className={`flex-1 ${i === index ? "font-bold text-charcoal" : ""}`}
          >
            {option.label}
          </span>
        ))}
      </div>
    </div>
  );
}
