import { motion, useInView, useReducedMotion } from "framer-motion";
import React from "react";
import { BAND_ORDER, BANDS } from "src/lib/brainHealthScoring";
import type { BandName } from "src/types/quiz";
import { EASE_OUT, useScrollerRef } from "src/components/LiteOne/ReportV2/motion";

/**
 * Animated charts for /lite-one/report-v2.
 *
 * The curve and radar geometry is ported from ReportLab/visuals.tsx; those
 * originals animate with one-shot CSS transitions and stay untouched for
 * report-lab. These versions draw with framer-motion so the strokes render
 * as the section snaps into view, and they observe the page's snap container
 * rather than the window (see motion.tsx).
 */

function useSeen<T extends HTMLElement>(amount = 0.4) {
  const scroller = useScrollerRef();
  const ref = React.useRef<T>(null);
  const seen = useInView(ref, { once: true, amount, root: scroller ?? undefined });
  return { ref, seen };
}

/* ------------------------------------------------------------------ */
/* Percentile curve                                                    */
/* ------------------------------------------------------------------ */

/**
 * Axis and marker words for the charts. Every field is optional and defaults to
 * the English original, so only /lite-event (which can be running in Chinese or
 * Malay) passes anything; the other report pages call these unchanged.
 */
export type ScoreCurveLabels = {
  slower: string;
  average: string;
  faster: string;
  you: string;
};

export type RiskTrendLabels = {
  managed: string;
  unmanaged: string;
  faster: string;
  slower: string;
  /** Prefixed to the first age tick — "Age 30". */
  agePrefix: string;
  caption: string;
  aria: string;
};

const CURVE_LABELS: ScoreCurveLabels = {
  slower: "Slower",
  average: "Average",
  faster: "Faster",
  you: "YOU",
};

const TREND_LABELS: RiskTrendLabels = {
  managed: "Risk factors managed",
  unmanaged: "Risk factors unmanaged",
  faster: "Faster",
  slower: "Slower",
  agePrefix: "Age ",
  caption:
    "Illustrative trend, shaped by Jaarsma et al. 2024 and Yaffe et al. 2020 (CARDIA). Not a clinical prediction.",
  aria: "Illustrative chart: processing speed declines gently with age when risk factors are managed, and drops steeply when they are left unmanaged",
};

export function MotionScoreCurve({
  percentile,
  gradient,
  labels,
}: {
  percentile: number;
  gradient: string;
  labels?: ScoreCurveLabels;
}) {
  const l = labels ?? CURVE_LABELS;
  const { ref, seen } = useSeen<HTMLDivElement>(0.5);
  const reduced = useReducedMotion();
  const W = 520;
  const H = 190;
  const clamped = Math.min(97, Math.max(3, percentile));
  const x = (clamped / 100) * W;

  const points = React.useMemo(() => {
    const list: Array<[number, number]> = [];
    for (let i = 0; i <= 120; i += 1) {
      const p = (i / 120) * 100;
      const z = (p - 50) / 15.5;
      const y = H - 26 - Math.exp(-0.5 * z * z) * (H - 62);
      list.push([(p / 100) * W, y]);
    }
    return list;
  }, []);

  const line = points
    .map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${W} ${H - 26} L0 ${H - 26} Z`;
  const markerY = points.reduce(
    (best, [px, py]) => (Math.abs(px - x) < Math.abs(best[0] - x) ? [px, py] : best),
    points[0]
  )[1];

  // Reduced motion swaps the draw-on for an instant appear; the rendered
  // values stay identical on server and client so hydration never diverges.
  const drawn = seen;

  return (
    <div ref={ref} className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Your reaction time sits at the ${percentile}th percentile of your age band`}
      >
        <defs>
          <linearGradient id="rv2-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8A1F" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FF8A1F" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="rv2-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF8A1F" />
            <stop offset="55%" stopColor="#F9550F" />
            <stop offset="100%" stopColor="#D62F16" />
          </linearGradient>
          <clipPath id="rv2-left-of-you">
            <rect x="0" y="0" width={x} height={H} />
          </clipPath>
        </defs>

        {/* baseline */}
        <line x1="0" y1={H - 26} x2={W} y2={H - 26} stroke="#F2DDCE" strokeWidth="1.5" />

        {/* everyone they beat — fades up after the stroke lands */}
        <motion.path
          d={area}
          fill="url(#rv2-area)"
          clipPath="url(#rv2-left-of-you)"
          initial={false}
          animate={{ opacity: drawn ? 1 : 0 }}
          transition={{ duration: 0.7, delay: reduced ? 0 : 0.75, ease: "easeOut" }}
        />

        {/* the curve draws itself */}
        <motion.path
          d={line}
          fill="none"
          stroke="url(#rv2-stroke)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 1.1, ease: "easeInOut" }}
        />

        {/* the visitor's mark */}
        <motion.g
          initial={false}
          animate={drawn ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 20, delay: 0.9 }
          }
          style={{ transformOrigin: `${x}px ${markerY}px` }}
        >
          <line
            x1={x}
            y1={markerY - 6}
            x2={x}
            y2={H - 26}
            stroke="#D62F16"
            strokeWidth="2"
            strokeDasharray="3 5"
            strokeLinecap="round"
          />
          <circle cx={x} cy={H - 26} r="6" fill="#1D6E62" stroke="#FFFFFF" strokeWidth="2.5" />
          <g>
            <rect
              x={Math.min(W - 62, Math.max(2, x - 30))}
              y={markerY - 34}
              width="60"
              height="24"
              rx="12"
              fill="#2FB8A3"
            />
            <text
              x={Math.min(W - 62, Math.max(2, x - 30)) + 30}
              y={markerY - 18}
              textAnchor="middle"
              className="fill-white text-[11px] font-extrabold"
              style={{ letterSpacing: "0.1em" }}
            >
              {l.you}
            </text>
          </g>
        </motion.g>
      </svg>

      <div
        className="mt-2 flex items-baseline justify-between text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#B79C8E]"
        aria-hidden
      >
        <span>{l.slower}</span>
        <span>{l.average}</span>
        <span style={{ backgroundImage: gradient }} className="bg-clip-text text-transparent">
          {l.faster}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Risk trajectory                                                     */
/* ------------------------------------------------------------------ */

/**
 * Two illustrative trajectories of processing speed across adult life: risk
 * factors managed vs left unmanaged. Shapes are schematic (informed by the
 * cohort curves the funnel cites), not a clinical prediction — the caption
 * under the chart says so.
 */
export function RiskTrendChart({ labels }: { labels?: RiskTrendLabels } = {}) {
  const l = labels ?? TREND_LABELS;
  const { ref, seen } = useSeen<HTMLDivElement>(0.5);
  const reduced = useReducedMotion();
  const drawn = seen;
  const W = 430;
  const H = 230;

  // Managed: gentle glide. Unmanaged: the same start, then a steepening drop.
  const managed = `M36 62 C 140 66, 240 84, 398 118`;
  const unmanaged = `M36 62 C 130 70, 230 108, 300 150 C 340 174, 370 190, 398 198`;

  return (
    <div
      ref={ref}
      className="rounded-[26px] border border-[#F2DDCE] bg-white p-5 shadow-[0_18px_46px_-28px_rgba(90,40,10,0.28)] sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em]">
        <span className="flex items-center gap-1.5 text-[#41586B]">
          <span aria-hidden className="h-[3px] w-5 rounded-full bg-[#41586B]" />
          {l.managed}
        </span>
        <span className="flex items-center gap-1.5 text-[#D62F16]">
          <span
            aria-hidden
            className="h-[3px] w-5 rounded-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg,#D62F16 0 5px,transparent 5px 9px)",
            }}
          />
          {l.unmanaged}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={l.aria}
      >
        <defs>
          <linearGradient id="rv2-riskgap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D62F16" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#D62F16" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* axes */}
        <line x1="36" y1="16" x2="36" y2={H - 28} stroke="#F2DDCE" strokeWidth="1.5" />
        <line x1="36" y1={H - 28} x2={W - 16} y2={H - 28} stroke="#F2DDCE" strokeWidth="1.5" />
        <text x="14" y="24" className="fill-[#B79C8E] text-[10px] font-bold">
          {l.faster}
        </text>
        <text x="14" y={H - 36} className="fill-[#B79C8E] text-[10px] font-bold">
          {l.slower}
        </text>
        {[
          [36, `${l.agePrefix}30`],
          [157, "45"],
          [278, "60"],
          [398, "75"],
        ].map(([tx, label]) => (
          <text
            key={label}
            x={tx}
            y={H - 12}
            textAnchor="middle"
            className="fill-[#B79C8E] text-[10px] font-bold"
          >
            {label}
          </text>
        ))}

        {/* the gap between the two futures */}
        <motion.path
          d={`${managed} L398 198 C 370 190, 340 174, 300 150 C 230 108, 130 70, 36 62 Z`}
          fill="url(#rv2-riskgap)"
          initial={false}
          animate={{ opacity: drawn ? 1 : 0 }}
          transition={{ duration: 0.8, delay: reduced ? 0 : 1.1, ease: "easeOut" }}
        />

        <motion.path
          d={managed}
          fill="none"
          stroke="#41586B"
          strokeWidth="3"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 1.1, ease: "easeInOut" }}
        />
        <motion.path
          d={unmanaged}
          fill="none"
          stroke="#D62F16"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="7 8"
          initial={false}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={
            reduced ? { duration: 0 } : { duration: 1.1, ease: "easeInOut", delay: 0.35 }
          }
        />
      </svg>

      <p className="mt-2 text-[10.5px] leading-snug text-[#B79C8E]">{l.caption}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Risk meter                                                          */
/* ------------------------------------------------------------------ */

export function RiskMeter({
  band,
  labels,
  ariaLabel,
}: {
  band: BandName;
  /** Band name → display label. Defaults to the English band names. */
  labels?: Record<string, string>;
  /** Group label for screen readers. Defaults to the English sentence. */
  ariaLabel?: string;
}) {
  const label = (name: string) => labels?.[name] ?? BANDS[name as BandName].name;
  const { ref, seen } = useSeen<HTMLDivElement>(0.6);
  const reduced = useReducedMotion();
  const shown = seen;
  const activeIndex = BAND_ORDER.indexOf(band);

  return (
    <div ref={ref}>
      <div
        className="flex gap-1.5"
        role="img"
        aria-label={ariaLabel ?? `Your risk level: ${BANDS[band].name}`}
      >
        {BAND_ORDER.map((name, i) => {
          const active = i === activeIndex;
          return (
            <div key={name} className="flex-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-[#F1E3D8]">
                <motion.div
                  className="h-full w-full rounded-full"
                  style={{ background: BANDS[name].colour, transformOrigin: "0 50%" }}
                  initial={false}
                  animate={{ scaleX: shown ? 1 : 0, opacity: active ? 1 : 0.45 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.55, delay: 0.12 * i, ease: EASE_OUT }
                  }
                />
              </div>
              <motion.p
                initial={false}
                animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 6 }}
                transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 0.12 * i + 0.2 }}
                className={[
                  "mt-1.5 text-center text-[10px] font-extrabold uppercase tracking-[0.1em]",
                  active ? "text-[#5F4638]" : "text-[#C9B4A6]",
                ].join(" ")}
              >
                {label(name)}
              </motion.p>
              {active && (
                <motion.div
                  aria-hidden
                  className="mx-auto mt-0.5 h-0 w-0 border-x-[5px] border-b-0 border-t-[6px] border-x-transparent"
                  style={{ borderTopColor: BANDS[name].colour }}
                  initial={false}
                  animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 260, damping: 18, delay: 0.6 }
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Baseline radar                                                      */
/* ------------------------------------------------------------------ */

export function MotionRadar({
  axes,
  filled,
  aria = "Baseline radar: two of five parts measured, three still empty",
}: {
  axes: readonly string[];
  filled: Record<string, number>;
  aria?: string;
}) {
  const { ref, seen } = useSeen<HTMLDivElement>(0.5);
  const reduced = useReducedMotion();
  const shown = seen;
  // The root <svg> clips its own overflow, so a label wide enough to cross the
  // viewBox edge (e.g. act4health's "RISK SAFETY", "DECISION MAKING") is cut
  // off rather than just spilling into the container's padding. 40 extra units
  // of horizontal margin fixes that; it's a small, uniform shrink of the whole
  // chart rather than a change to the plotted shape, so lite-one/lite-two's
  // short single-word labels render at an imperceptibly smaller size.
  const W = 380;
  const H = 282;
  const cx = W / 2;
  const cy = 132;
  const r = 84;

  const point = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as const;
  };

  const rings = [0.35, 0.7, 1];
  const shape = axes
    .map((axis, i) => {
      const value = filled[axis] ?? 0;
      const [px, py] = point(i, Math.max(r * 0.08, r * value));
      return `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div ref={ref} className="mx-auto w-full max-w-[330px]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={aria}
      >
        <defs>
          <radialGradient id="rv2-radar" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFB55C" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#F9550F" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        {rings.map((ring, ri) => (
          <motion.polygon
            key={ring}
            points={axes
              .map((_, i) =>
                point(i, r * ring)
                  .map((n) => n.toFixed(1))
                  .join(",")
              )
              .join(" ")}
            fill="none"
            stroke="#EEDACD"
            strokeWidth="1"
            initial={false}
            animate={{ opacity: shown ? 1 : 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.12 * ri }}
          />
        ))}

        {axes.map((axis, i) => {
          const [px, py] = point(i, r);
          const [lx, ly] = point(i, r + 21);
          const measured = (filled[axis] ?? 0) > 0;
          return (
            <g key={axis}>
              <line x1={cx} y1={cy} x2={px} y2={py} stroke="#EEDACD" strokeWidth="1" />
              {!measured && (
                <circle cx={px} cy={py} r="3.5" fill="#FFF8F3" stroke="#E3C4B0" strokeWidth="1.4" />
              )}
              {measured && (
                <motion.circle
                  cx={px}
                  cy={py}
                  r="4.5"
                  fill="#D62F16"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  initial={false}
                  animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 260, damping: 18, delay: 0.7 + 0.1 * i }
                  }
                  style={{ transformOrigin: `${px}px ${py}px` }}
                />
              )}
              <text
                x={lx}
                y={ly}
                textAnchor={lx > cx + 4 ? "start" : lx < cx - 4 ? "end" : "middle"}
                dominantBaseline="middle"
                className={[
                  "text-[9px] font-bold uppercase",
                  measured ? "fill-[#C43C0E]" : "fill-[#BCA294]",
                ].join(" ")}
                style={{ letterSpacing: "0.08em" }}
              >
                {axis}
              </text>
            </g>
          );
        })}

        <motion.path
          d={`${shape} Z`}
          fill="url(#rv2-radar)"
          stroke="#D62F16"
          strokeWidth="2"
          initial={false}
          animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.35 }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 18, delay: 0.25 }
          }
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      </svg>
    </div>
  );
}
