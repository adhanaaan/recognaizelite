import React from "react";
import { BAND_LABELS, BAND_TAG_VISUALS, computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import { readStashedQuizResult } from "src/utils/liteOne";
import { RISK_RECOMMENDATIONS } from "src/data/liteOneContent";
import type { DrivingFactor, ScoreResult } from "src/types/quiz";

function useQuizScore(): ScoreResult | null {
  const answers = useQuestionnaireStore((s) => s.answers);
  return React.useMemo(() => {
    if (Object.keys(answers).length > 0) return computeScore(answers);
    return readStashedQuizResult();
  }, [answers]);
}

/**
 * Factors nobody can act on, so they never appear in the "most movable levers"
 * sentence — they can still show up as a pill, they just aren't advice.
 */
const NON_MODIFIABLE = new Set(["age", "familyHistory"]);

/**
 * Renders the visitor's modifiable factors as a phrase that can start a
 * sentence, for the `{factors}` slot in the moderate recommendation. Ported
 * from b2cfunnel's `formatLevers` (src/components/screens/ResultScreen.tsx).
 */
export function formatRiskLevers(factors: readonly DrivingFactor[]): string {
  const labels = factors
    .filter((f) => !NON_MODIFIABLE.has(f.id))
    .map((f) => f.label.toLowerCase());

  if (labels.length === 0) return "A few lifestyle and biomedical factors";

  const joined =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

/**
 * The quiz's contribution to the report: a band recommendation, and the factors
 * behind it. Deliberately just those two things — the score and gauge that sit
 * alongside them in brainhealthcheck would compete with the game result above.
 */
export function RiskFactorDropdown() {
  const score = useQuizScore();

  if (!score) return null;

  const factors = score.drivingFactors;
  const count = factors.length;
  const recommendation = RISK_RECOMMENDATIONS[score.band].replace(
    "{factors}",
    formatRiskLevers(factors)
  );

  const tag = BAND_TAG_VISUALS[score.band];
  const tagLabel = `${BAND_LABELS[score.band]} risk`;

  return (
    <div className="rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-5 shadow-card sm:p-6">
      <h2 className="font-display text-[24px] font-extrabold leading-tight text-charcoal">
        Your risk factor
      </h2>

      {/*
       * Band tag + one-line context. The tag ink and plate follow the band's
       * own colour so a green "Low risk" reads as positive, a red "High risk"
       * as an alert. The trailing text stays outside the pill on mobile via
       * flex-wrap rather than being nested inside it, so a long band label
       * plus a long clarifier can never overflow their container.
       */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span
          className="rounded-full px-3 py-1 text-[12.5px] font-extrabold uppercase tracking-wider"
          style={{ color: tag.color, backgroundColor: tag.softBg }}
        >
          {tagLabel}
        </span>
        <span className="text-[12.5px] text-quizOutline">
          from your modifiable brain-health factors
        </span>
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-quizSecondary">{recommendation}</p>

      {/* A profile with nothing movable still gets its recommendation above. */}
      {count > 0 && (
        <>
          <p className="mt-4 text-[13.5px] text-quizSecondary">What&apos;s driving this</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {factors.map((f) => (
              <span
                key={f.id}
                className="rounded-full border border-quizOutline-variant bg-white px-4 py-1.5 text-[13px] font-medium text-charcoal shadow-sm"
              >
                {f.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
