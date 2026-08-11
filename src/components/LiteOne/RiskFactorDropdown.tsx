import React from "react";
import { computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import { readStashedQuizResult } from "src/utils/liteOne";
import type { ScoreResult } from "src/types/quiz";

function useQuizScore(): ScoreResult | null {
  const answers = useQuestionnaireStore((s) => s.answers);
  return React.useMemo(() => {
    if (Object.keys(answers).length > 0) return computeScore(answers);
    return readStashedQuizResult();
  }, [answers]);
}

export function RiskFactorDropdown() {
  const score = useQuizScore();

  if (!score || score.drivingFactors.length === 0) return null;

  const count = score.drivingFactors.length;

  return (
    <div className="rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-5 shadow-card sm:p-6">
      <h2 className="font-display text-[24px] font-extrabold leading-tight text-charcoal">
        Your risk factors
      </h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-quizSecondary">
        Based on habits and health details from your answers that can shape brain health.
      </p>
      <p className="mt-3 text-[13.5px] text-quizSecondary">
        {count} aspect{count !== 1 ? "s" : ""} to improve:
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {score.drivingFactors.map((f) => (
          <span
            key={f.id}
            className="rounded-full border border-quizOutline-variant bg-white px-4 py-1.5 text-[13px] font-medium text-charcoal shadow-sm"
          >
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}
