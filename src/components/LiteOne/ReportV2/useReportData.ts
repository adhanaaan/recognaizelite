import React from "react";
import { BAND_LABELS, computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import type { ScoreResult } from "src/types/quiz";
import type { DomainReport } from "src/types/report";
import {
  AGE_LABELS,
  LITE_ONE,
  QUIZ_AGE_LABELS,
  QUIZ_AGE_TO_LITE,
  isSeniorQuizAge,
  readLiteProfile,
  readStashedQuizResult,
  readStashedReport,
  type LiteVariant,
} from "src/utils/liteOne";

/**
 * Data wiring for the v2 report pages — same sources and fallbacks as the
 * live report and report-lab: the stashed short report, the lead profile and
 * the quiz result, all device-local. With nothing on the device it serves a
 * sample so the page can be reviewed on its own (the page shows a preview
 * banner when `isSample` is true).
 *
 * Defaults to /lite-one's storage so /lite-one/report-v2 keeps rendering its
 * own runs; /lite-two/report passes its variant to read that funnel's stash.
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
const SAMPLE_QUIZ_AGE = "30-39";
const SAMPLE_NAME = "Michelle";
const SAMPLE_SCORE = 98;

const SAMPLE_RISK = {
  band: "Moderate",
  fill: 0.58,
  factors: ["Sleep", "Physical activity", "Stress"],
};

/** liteone_leads bucket → the quiz band that produced it (QUIZ_AGE_TO_LITE
    is injective, so profiles stashed before `quizAge` existed still map). */
const LITE_AGE_TO_QUIZ: Record<string, string> = Object.fromEntries(
  Object.entries(QUIZ_AGE_TO_LITE).map(([quiz, lite]) => [lite, quiz])
);

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
  /** Raw quiz age answer ("18-29" … "60+"), null when unknown. */
  quizAge: string | null;
  /** Display label for it — "60 and over" — null when unknown. */
  quizAgeLabel: string | null;
  /** The optimizer/senior split: quiz age 40-49, 50-59 or 60+. */
  senior: boolean;
  /** Mean seconds per correct symbol, formatted ("0.61"); null without a score. */
  avgSeconds: string | null;
};

export function useReportData(variant: LiteVariant = LITE_ONE): ReportV2Data {
  const [report, setReport] = React.useState<DomainReport>(SAMPLE);
  const [ageRange, setAgeRange] = React.useState<string | null>(SAMPLE_AGE);
  const [quizAge, setQuizAge] = React.useState<string | null>(SAMPLE_QUIZ_AGE);
  const [score, setScore] = React.useState<number | null>(SAMPLE_SCORE);
  const [isSample, setIsSample] = React.useState(true);
  const [quiz, setQuiz] = React.useState<ScoreResult | null>(null);
  const [name, setName] = React.useState<string | null>(SAMPLE_NAME);

  React.useEffect(() => {
    const stashed = readStashedReport(variant);
    if (stashed) {
      setReport(stashed);
      setIsSample(false);
    }

    const profile = readLiteProfile(variant);
    if (profile?.ageRange) {
      setAgeRange(AGE_LABELS[profile.ageRange] ?? profile.ageRange);
    } else if (stashed) {
      setAgeRange(null);
    }
    if (stashed) {
      // Real result: only use a name the visitor actually gave us.
      setName(profile?.name ? profile.name.trim().split(/\s+/)[0] : null);
      setScore(typeof profile?.score === "number" ? profile.score : null);
    }

    // Live answers if the quiz is still in memory, otherwise the stash.
    const answers = useQuestionnaireStore.getState().answers;
    const scored =
      Object.keys(answers).length > 0 ? computeScore(answers) : readStashedQuizResult(variant);
    if (scored) setQuiz(scored);

    // The raw quiz band, for the optimizer/senior split and the age copy.
    // Preference order: the stashed profile, the still-in-memory quiz answer,
    // then inverting the leads-table bucket of an older profile.
    const liveAge = typeof answers.age === "string" ? answers.age : null;
    const rawAge =
      profile?.quizAge ??
      liveAge ??
      (profile?.ageRange ? LITE_AGE_TO_QUIZ[profile.ageRange] ?? null : null);
    if (stashed || rawAge) setQuizAge(rawAge);
  }, [variant]);

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

  const quizAgeLabel = quizAge ? QUIZ_AGE_LABELS[quizAge] ?? null : null;
  const senior = isSeniorQuizAge(quizAge);
  // The game runs 60 seconds; score is correct symbols in that window.
  const avgSeconds = score && score > 0 ? (60 / score).toFixed(2) : null;

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
    quizAge,
    quizAgeLabel,
    senior,
    avgSeconds,
  };
}
