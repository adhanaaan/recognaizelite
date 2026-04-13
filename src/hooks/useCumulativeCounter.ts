import { useEffect, useState } from "react";

/**
 * Deterministic cumulative counter that grows daily and never resets.
 *
 * All visitors at the same time see the same number (seeded by date).
 * No API call, no loading state, works offline.
 */
export function useCumulativeCounter(config: {
  /** ISO date string when the funnel launched, e.g. "2025-10-01" */
  anchorDate: string;
  /** Believable count as of the anchor date */
  baseCount: number;
  /** Minimum daily growth */
  dailyMin: number;
  /** Maximum daily growth */
  dailyMax: number;
}): number {
  const { anchorDate, baseCount, dailyMin, dailyMax } = config;

  function compute(): number {
    const now = new Date();
    const anchor = new Date(anchorDate + "T00:00:00");
    const msPerDay = 86_400_000;
    const elapsed = now.getTime() - anchor.getTime();
    if (elapsed <= 0) return baseCount;

    const fullDays = Math.floor(elapsed / msPerDay);
    const dayFraction = (elapsed % msPerDay) / msPerDay;

    let total = baseCount;
    const range = dailyMax - dailyMin;

    // Add a deterministic amount for each completed day.
    for (let d = 0; d < fullDays; d++) {
      total += dailyMin + (simpleSeed(anchorDate, d) % (range + 1));
    }

    // Partial-day interpolation so the number ticks up during the day.
    const todayGrowth = dailyMin + (simpleSeed(anchorDate, fullDays) % (range + 1));
    total += Math.floor(todayGrowth * dayFraction);

    return total;
  }

  const [count, setCount] = useState(compute);

  useEffect(() => {
    const id = setInterval(() => setCount(compute()), 60_000);
    return () => clearInterval(id);
  }, []);

  return count;
}

/** Simple deterministic hash: same (anchor, dayIndex) → same number. */
function simpleSeed(anchor: string, day: number): number {
  const str = `${anchor}-${day}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
