import reportData from "./data/report_data.json";
import type { ResultDataType } from "src/stores/useResultStore";
import type { Severity, DomainReport } from "src/types/report";

/**
 * Server-only report generation module.
 * This file contains sensitive scoring algorithms, statistical calculations,
 * and business logic that must NOT be exposed to the client.
 * 
 * This file is ONLY imported in API routes (pages/api/*) which are
 * server-side only by default in Next.js Pages Router.
 */

const SCORE_STATS = {
  task2: { mean: 17.722, stdDev: 4.74 },
  task3: { mean: 0.531, stdDev: 0.389 },
  task4: { mean: 11.493, stdDev: 15.131 },
  task5: { mean: 11.942, stdDev: 6.147 },
};

// Short assessment (30s) stats — scaled from 60s norms.
// Used by /hookikigai and /sjmc.
const SHORT_SCORE_STATS = {
  task2: { mean: 8.861, stdDev: 2.37 },
};

// 60s short assessment stats — used by /demo (HealthTechX) and /tcmbrain.
// Same dataset historically used by `buildFullReport` for task2:
// the symbol matching game runs the full 60 seconds and is scored
// against the time-matched population norms, not the 30s norms.
const LONG_SHORT_SCORE_STATS = {
  task2: { mean: 17.722, stdDev: 4.74 },
};

// Clinics whose Symbol Matching game runs for the full 60 seconds.
// They share the same scoring algorithm as the 30s funnels; only the
// norm dataset differs.
const LONG_SHORT_CLINICS = new Set(["healthtechx", "tcmbrain", "novi"]);

function erf(x: number) {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);
  return sign * y;
}

function normCdf(zScore: number) {
  return 0.5 * (1 + erf(zScore / Math.SQRT2));
}

function roundToEven(value: number, decimals: number) {
  const factor = 10 ** decimals;
  const scaled = value * factor;
  const sign = scaled < 0 ? -1 : 1;
  const abs = Math.abs(scaled);
  const floor = Math.floor(abs);
  const diff = abs - floor;
  const epsilon = Number.EPSILON * 10;

  let rounded = floor;
  if (diff > 0.5 + epsilon) {
    rounded = floor + 1;
  } else if (Math.abs(diff - 0.5) <= epsilon) {
    rounded = floor % 2 === 0 ? floor : floor + 1;
  }
  return (sign * rounded) / factor;
}

function calculatePercentile(score: number, mean: number, stdDev: number) {
  const zScore = (score - mean) / stdDev;
  const percentile = normCdf(zScore) * 100;
  const rounded = roundToEven(percentile, 2);
  if (rounded > 99) return 99;
  if (rounded < 1) return 1;
  return rounded;
}

function calculateSeverity(score: number, mean: number, stdDev: number): Severity {
  const low = mean - stdDev;
  const high = mean + stdDev;
  if (score < low) return "Low";
  if (score > high) return "High";
  return "Medium";
}

function getTask2Score(result: ResultDataType["task2"]) {
  if (!result) return null;
  if (Array.isArray(result) && result.length > 0) {
    const score = Number(result[0]?.score);
    return Number.isNaN(score) ? null : score;
  }
  if (typeof result === "object" && Object.keys(result).length > 0 && "score" in result) {
    const score = Number((result as { score?: number }).score);
    return Number.isNaN(score) ? null : score;
  }
  return null;
}

function getTask3Score(result: ResultDataType["task3"]) {
  if (!result || Object.keys(result).length === 0) return null;
  const correct = Number((result as { correct?: number }).correct);
  const errors = Number((result as { errors?: number }).errors);
  if (Number.isNaN(correct) || Number.isNaN(errors)) return null;
  const timeRaw = String((result as { time?: string }).time ?? "");
  if (!timeRaw) return null;
  const time = Number.parseFloat(timeRaw.slice(0, -1));
  if (!time || Number.isNaN(time)) return null;
  return (correct - errors) / time;
}

function getTask4Score(result: ResultDataType["task4"]) {
  if (!result || Object.keys(result).length === 0) return null;
  const correct = Number((result as { correct?: number }).correct);
  const errors = Number((result as { errors?: number }).errors);
  if (Number.isNaN(correct) || Number.isNaN(errors)) return null;
  return correct - 2 * errors;
}

function getTask5Score(result: ResultDataType["task5"]) {
  if (!result || Object.keys(result).length === 0) return null;
  const rounds = (result as { rounds?: Array<{ correct?: number; steps?: number }> }).rounds;
  if (!Array.isArray(rounds)) return null;
  let correct = 0;
  rounds.forEach((round) => {
    if (typeof round?.steps !== "undefined") {
      const value = Number(round.correct);
      if (!Number.isNaN(value)) {
        correct += value;
      }
    }
  });
  return correct;
}

function buildDomainReport(title: string, percentile: number, severity: Severity) {
  const domainKey = title.replace(/\s/g, "");
  const data = (reportData as Record<string, any>)[domainKey];
  return {
    title,
    percentile,
    severity,
    definition: data.Definition,
    affects: data.HowThisAffectsYou[severity],
    improve: data.HowToImprove,
    maintain: data.HowToMaintain,
  } as DomainReport;
}

export function buildShortReport(result: ResultDataType, clinic?: string) {
  const score = getTask2Score(result.task2);
  if (score === null) return null;
  const stats =
    clinic && LONG_SHORT_CLINICS.has(clinic)
      ? LONG_SHORT_SCORE_STATS.task2
      : SHORT_SCORE_STATS.task2;
  const percentile = calculatePercentile(score, stats.mean, stats.stdDev);
  const severity = calculateSeverity(score, stats.mean, stats.stdDev);
  return buildDomainReport("Processing Speed", percentile, severity);
}

export function buildFullReport(result: ResultDataType) {
  const task2Score = getTask2Score(result.task2);
  const task3Score = getTask3Score(result.task3);
  const task4Score = getTask4Score(result.task4);
  const task5Score = getTask5Score(result.task5);

  if (task2Score === null || task3Score === null || task4Score === null || task5Score === null) {
    return null;
  }

  return {
    processingSpeed: buildDomainReport(
      "Processing Speed",
      calculatePercentile(task2Score, SCORE_STATS.task2.mean, SCORE_STATS.task2.stdDev),
      calculateSeverity(task2Score, SCORE_STATS.task2.mean, SCORE_STATS.task2.stdDev)
    ),
    executiveFunction: buildDomainReport(
      "Executive Function",
      calculatePercentile(task3Score, SCORE_STATS.task3.mean, SCORE_STATS.task3.stdDev),
      calculateSeverity(task3Score, SCORE_STATS.task3.mean, SCORE_STATS.task3.stdDev)
    ),
    attention: buildDomainReport(
      "Attention",
      calculatePercentile(task4Score, SCORE_STATS.task4.mean, SCORE_STATS.task4.stdDev),
      calculateSeverity(task4Score, SCORE_STATS.task4.mean, SCORE_STATS.task4.stdDev)
    ),
    workingMemory: buildDomainReport(
      "Working Memory",
      calculatePercentile(task5Score, SCORE_STATS.task5.mean, SCORE_STATS.task5.stdDev),
      calculateSeverity(task5Score, SCORE_STATS.task5.mean, SCORE_STATS.task5.stdDev)
    ),
  };
}
