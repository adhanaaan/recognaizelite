/**
 * Brain Health Quiz scoring engine — pure TypeScript, no React deps.
 * Ported from sibling repo b2cfunnel (`src/engine/{bands,scoring,
 * drivingFactors,persona}.ts`) and consolidated into a single module so
 * the consumer surface in recognaize stays tiny.
 *
 * Scores natively sum to 100: Risk Factor Score (max 68) + Symptom
 * Signal (max 32). The final band is the worst implied by total / risk /
 * symptom — a strong lifestyle profile can never mask a loud symptom
 * signal. The `safetyOverrideApplied` flag surfaces the
 * persistence + someone-else-noticed pairing for downstream analytics.
 */

import type {
  Answers,
  Axis,
  Band,
  BandName,
  DrivingFactor,
  Persona,
  ScoreResult,
} from "src/types/quiz";
import { QUESTIONS, QUESTIONS_BY_ID } from "src/data/brainHealthQuestions";

// --- Axis maxima (build brief §5 weights scaled x4 onto a native 0-100). ---
const RISK_MAX = 68;
const SYMPTOM_MAX = 32;
export const MAX_TOTAL = RISK_MAX + SYMPTOM_MAX; // 100

// --- Bands ---

export const BANDS: Record<BandName, Band> = {
  low: { name: "low", totalMin: 0, totalMax: 25, colour: "#97c459", order: 0 },
  moderate: { name: "moderate", totalMin: 26, totalMax: 50, colour: "#fac775", order: 1 },
  elevated: { name: "elevated", totalMin: 51, totalMax: 75, colour: "#ef9f27", order: 2 },
  high: { name: "high", totalMin: 76, totalMax: Infinity, colour: "#f09595", order: 3 },
};

export const BAND_ORDER: BandName[] = ["low", "moderate", "elevated", "high"];

export function bandForTotal(total: number): BandName {
  if (total <= 25) return "low";
  if (total <= 50) return "moderate";
  if (total <= 75) return "elevated";
  return "high";
}

export function bandForRiskAxis(risk: number): BandName {
  if (risk <= 16) return "low";
  if (risk <= 36) return "moderate";
  if (risk <= 52) return "elevated";
  return "high";
}

export function bandForSymptomAxis(symptom: number): BandName {
  if (symptom <= 0) return "low";
  if (symptom <= 12) return "moderate";
  if (symptom <= 20) return "elevated";
  return "high";
}

export function worseBand(...bands: BandName[]): BandName {
  return bands.reduce((worst, b) => (BANDS[b].order > BANDS[worst].order ? b : worst));
}

// --- Driving factor labels (inlined; sibling repo keeps these in copy.ts). ---

const FACTOR_LABELS: Record<string, string> = {
  age: "Age",
  hotFlushes: "Hormonal changes",
  familyHistory: "Family history",
  highBp: "Blood pressure",
  highCholesterol: "Cholesterol",
  diabetes: "Diabetes / pre-diabetes",
  hearingLoss: "Untreated hearing loss",
  visionLoss: "Untreated vision loss",
  smoking: "Smoking",
  sleep: "Sleep",
  exercise: "Exercise",
  diet: "Diet",
  alcohol: "Alcohol",
};

// --- Axis aggregation ---

function scoreAxis(answers: Answers, axis: Axis): number {
  let total = 0;
  for (const [questionId, answer] of Object.entries(answers)) {
    const question = QUESTIONS_BY_ID[questionId];
    if (!question || question.axis !== axis || !question.options) continue;
    // hotFlushes only scores for women — pruned from the flow but guard here
    // too so the engine stays correct against any answers map.
    if (questionId === "hotFlushes" && answers.sex !== "female") continue;
    const selected = Array.isArray(answer) ? answer : [answer];
    for (const value of selected) {
      const option = question.options.find((o) => o.id === value);
      if (option) total += option.score;
    }
  }
  return total;
}

export function scoreRiskAxis(answers: Answers): number {
  return Math.min(scoreAxis(answers, "risk"), RISK_MAX);
}

export function scoreSymptomAxis(answers: Answers): number {
  return Math.min(scoreAxis(answers, "symptom"), SYMPTOM_MAX);
}

// --- Driving factors ("what's driving this") — lifestyle/biomedical only. ---

export function getDrivingFactors(answers: Answers): DrivingFactor[] {
  const scored: Array<{ factor: DrivingFactor; score: number }> = [];
  for (const q of QUESTIONS) {
    if (q.axis !== "risk" || !q.options) continue;
    const answer = answers[q.id];
    if (typeof answer !== "string") continue;
    const option = q.options.find((o) => o.id === answer);
    if (!option || option.score <= 0) continue;
    scored.push({
      factor: { id: q.id, label: FACTOR_LABELS[q.id] ?? q.id, axis: "risk" },
      score: option.score,
    });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.factor);
}

// --- Persona detection ---

const PERIMENOPAUSAL_AGE_BANDS = ["40-49", "50-59", "60+"];
const HIGH_PERFORMER_AGE_BANDS = ["18-29", "30-39", "40-49"];

function asArray(value: Answers[string] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

export function detectPersona(answers: Answers): Persona {
  const sex = answers.sex;
  const age = typeof answers.age === "string" ? answers.age : undefined;
  const tracks = asArray(answers.tracks);
  const hotFlushes = answers.hotFlushes;

  if (
    sex === "female" &&
    age !== undefined &&
    PERIMENOPAUSAL_AGE_BANDS.includes(age) &&
    (hotFlushes === "yes" || tracks.includes("hormones"))
  ) {
    return "perimenopausal";
  }
  if (tracks.includes("family") || answers.someoneElseNoticed === "yes") {
    return "caregiver";
  }
  if (
    age !== undefined &&
    HIGH_PERFORMER_AGE_BANDS.includes(age) &&
    (tracks.includes("performance") || tracks.includes("biometrics"))
  ) {
    return "highPerformer";
  }
  return "neutral";
}

// --- Top-level orchestrator ---

export function computeScore(answers: Answers): ScoreResult {
  const riskScore = scoreRiskAxis(answers);
  const symptomScore = scoreSymptomAxis(answers);
  const total = riskScore + symptomScore;

  const bandFromTotal = bandForTotal(total);
  const riskBand = bandForRiskAxis(riskScore);
  const symptomBand = bandForSymptomAxis(symptomScore);

  // The band always follows the total score (matches the headline number).
  // Persistent decline is captured through its score weight, not by shifting
  // the band. We still surface the safety flag for analytics.
  const band = bandFromTotal;
  const safetyOverrideApplied =
    answers.persistence === "yes" && answers.someoneElseNoticed === "yes";

  return {
    riskScore,
    symptomScore,
    total,
    maxTotal: MAX_TOTAL,
    band,
    bandFromTotal,
    riskBand,
    symptomBand,
    drivingFactors: getDrivingFactors(answers),
    persona: detectPersona(answers),
    safetyOverrideApplied,
  };
}

// --- Display helpers ---

export const BAND_LABELS: Record<BandName, string> = {
  low: "Low",
  moderate: "Moderate",
  elevated: "Elevated",
  high: "High",
};

export const PERSONA_LABELS: Record<Persona, string> = {
  neutral: "General",
  highPerformer: "High performer",
  perimenopausal: "Perimenopausal",
  caregiver: "Caregiver",
};
