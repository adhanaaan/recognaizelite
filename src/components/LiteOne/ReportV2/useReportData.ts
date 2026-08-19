import React from "react";
import { BAND_LABELS, computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import type { ScoreResult } from "src/types/quiz";
import type { DomainReport } from "src/types/report";
import {
  AGE_LABELS,
  readLiteProfile,
  readStashedQuizResult,
  readStashedReport,
} from "src/utils/liteOne";

/**
 * Data wiring for /lite-one/report-v2 — same sources and fallbacks as the
 * live report and report-lab: the stashed short report, the lead profile and
 * the quiz result, all device-local. With nothing on the device it serves a
 * sample so the page can be reviewed on its own (the page shows a preview
 * banner when `isSample` is true).
 */

const SAMPLE: DomainReport = {
  title: "Processing Speed",
  percentile: 90,
  severity: "High",
  definition:
    "How quickly your brain takes in information and responds. It is the engine behind quick thinking.",
  affects: [],
  improve: [],
  maintain: [],
};

const SAMPLE_AGE = "26-35";
const SAMPLE_NAME = "Michelle";

const SAMPLE_RISK = {
  band: "Moderate",
  fill: 0.58,
  factors: ["Sleep", "Physical activity", "Stress"],
};

export type ReportV2Data = {
  report: DomainReport;
  percentile: number;
  ageRange: string | null;
  isSample: boolean;
  quiz: ScoreResult | null;
  /** First name for the personalised lines; null when unknown. */
  name: string | null;
  riskBand: string;
  /** Radar axis fill for risk: a clean profile fills it, a loaded one pulls it in. */
  riskFill: number;
  riskFactors: string[];
  peers: string;
  topBand: number;
  strong: boolean;
};

export function useReportData(): ReportV2Data {
  const [report, setReport] = React.useState<DomainReport>(SAMPLE);
  const [ageRange, setAgeRange] = React.useState<string | null>(SAMPLE_AGE);
  const [isSample, setIsSample] = React.useState(true);
  const [quiz, setQuiz] = React.useState<ScoreResult | null>(null);
  const [name, setName] = React.useState<string | null>(SAMPLE_NAME);

  React.useEffect(() => {
    const stashed = readStashedReport();
    if (stashed) {
      setReport(stashed);
      setIsSample(false);
    }

    const profile = readLiteProfile();
    if (profile?.ageRange) {
      setAgeRange(AGE_LABELS[profile.ageRange] ?? profile.ageRange);
    } else if (stashed) {
      setAgeRange(null);
    }
    if (stashed) {
      // Real result: only use a name the visitor actually gave us.
      setName(profile?.name ? profile.name.trim().split(/\s+/)[0] : null);
    }

    // Live answers if the quiz is still in memory, otherwise the stash.
    const answers = useQuestionnaireStore.getState().answers;
    const scored =
      Object.keys(answers).length > 0 ? computeScore(answers) : readStashedQuizResult();
    if (scored) setQuiz(scored);
  }, []);

  const percentile = Math.round(report.percentile);
  const peers = ageRange ? `people aged ${ageRange}` : "people your age";
  const topBand = Math.max(1, 100 - percentile);
  const strong = report.severity === "High";

  const riskBand = quiz ? BAND_LABELS[quiz.band] : SAMPLE_RISK.band;
  const riskFill = quiz
    ? Math.min(1, Math.max(0.22, 1 - quiz.total / Math.max(1, quiz.maxTotal)))
    : SAMPLE_RISK.fill;
  const riskFactors = quiz
    ? quiz.drivingFactors.map((factor) => factor.label)
    : SAMPLE_RISK.factors;

  return {
    report,
    percentile,
    ageRange,
    isSample,
    quiz,
    name,
    riskBand,
    riskFill,
    riskFactors,
    peers,
    topBand,
    strong,
  };
}
