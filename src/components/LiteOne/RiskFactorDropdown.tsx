import React from "react";
import {
  BANDS,
  BAND_LABELS,
  computeScore,
  getDrivingFactors,
} from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import { readStashedQuizResult } from "src/utils/liteOne";
import type { ScoreResult } from "src/types/quiz";

function softBg(colour: string, alpha = 0.14) {
  const c = colour.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function useQuizScore(): ScoreResult | null {
  const answers = useQuestionnaireStore((s) => s.answers);
  return React.useMemo(() => {
    if (Object.keys(answers).length > 0) return computeScore(answers);
    return readStashedQuizResult();
  }, [answers]);
}

export function RiskFactorDropdown() {
  const score = useQuizScore();
  const [open, setOpen] = React.useState(false);

  if (!score) return null;

  const band = BANDS[score.band];
  const bandLabel = BAND_LABELS[score.band];
  const riskPct = Math.min(100, Math.round((score.riskScore / 68) * 100));
  const symptomPct = Math.min(100, Math.round((score.symptomScore / 32) * 100));

  return (
    <div className="rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-5 sm:p-6 text-left transition-colors hover:bg-quizSurface-low/40"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-quizOutline">
            Brain Health Quiz
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3.5 py-1 text-[12px] font-bold uppercase tracking-[0.12em]"
              style={{ backgroundColor: softBg(band.colour), color: band.colour }}
            >
              {bandLabel}
            </span>
            <span className="text-[14px] font-bold text-charcoal">
              {score.total} / {score.maxTotal}
            </span>
          </div>
          {score.drivingFactors.length > 0 && (
            <p className="mt-1.5 text-[12px] text-quizSecondary">
              {score.drivingFactors.length} risk factor{score.drivingFactors.length !== 1 ? "s" : ""} identified
            </p>
          )}
        </div>

        <svg
          viewBox="0 0 24 24"
          className="size-5 shrink-0 text-quizOutline transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-quizOutline-variant/60 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            {/* Score circle */}
            <div className="flex flex-col items-center">
              <div
                className="flex size-[120px] flex-col items-center justify-center rounded-full"
                style={{
                  backgroundColor: softBg(band.colour),
                  border: `3.5px solid ${band.colour}`,
                }}
              >
                <span
                  className="font-display text-[44px] font-extrabold leading-none"
                  style={{ color: band.colour }}
                >
                  {score.total}
                </span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-quizOutline">
                  / {score.maxTotal}
                </span>
              </div>
            </div>

            {/* Axis bars */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-quizSurface-low p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-quizOutline">
                  Risk factors
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-charcoal">{score.riskScore}</span>
                  <span className="text-[11px] text-quizOutline">/ 68</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-quizPrimary/10">
                  <div
                    className="h-full rounded-full bg-quizPrimary transition-all duration-500"
                    style={{ width: `${riskPct}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-quizSurface-low p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-quizOutline">
                  Symptom signal
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-charcoal">{score.symptomScore}</span>
                  <span className="text-[11px] text-quizOutline">/ 32</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-quizPrimary/10">
                  <div
                    className="h-full rounded-full bg-quizPrimary transition-all duration-500"
                    style={{ width: `${symptomPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Driving factors */}
            {score.drivingFactors.length > 0 && (
              <div className="mt-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-quizOutline">
                  What&apos;s driving this
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {score.drivingFactors.map((f) => (
                    <span
                      key={f.id}
                      className="rounded-full bg-quizPill-bg px-3 py-1 text-[12px] font-medium text-quizPill-text"
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-4 text-[10px] leading-relaxed text-quizOutline text-center">
              Based on 14 modifiable risk factors · Lancet Commission 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
