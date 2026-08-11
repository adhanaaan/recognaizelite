import React from "react";
import type { Severity } from "src/types/report";

/**
 * Light-themed normal-distribution curve with the visitor's percentile marked.
 *
 * Lifted out of /demo-report so /lite-one/report can render the same chart
 * rather than a third copy. The palette is the Clinical Empathy orange, which
 * both pages share.
 *
 * Passing `zonePalette` switches on the banded render (see BellCurve's props):
 * without it the output is unchanged, so /demo-report keeps the flat orange
 * chart it was designed with.
 */

export type SeverityVisual = {
  label: "WEAK" | "ADEQUATE" | "STRONG";
  color: string;
  softBg: string;
};

export const severityVisuals: Record<Severity, SeverityVisual> = {
  Low: { label: "WEAK", color: "#ba1a1a", softBg: "rgba(186,26,26,0.08)" },
  Medium: { label: "ADEQUATE", color: "#f77528", softBg: "rgba(247,117,40,0.10)" },
  High: { label: "STRONG", color: "#97c459", softBg: "rgba(151,196,89,0.12)" },
};

/**
 * /lite-one's band palette: weak red, adequate blue, strong green.
 *
 * Adequate moves off the shared orange because on this page orange is the CTA
 * colour — a mid-range result marked in it reads as a warning rather than as
 * "fine". Kept as a separate record so /demo-report, which renders the same
 * chart, keeps the palette it was designed with.
 */
export const liteSeverityVisuals: Record<Severity, SeverityVisual> = {
  ...severityVisuals,
  Medium: { label: "ADEQUATE", color: "#2f6fd0", softBg: "rgba(47,111,208,0.10)" },
};

const BC_W = 500, BC_H = 260, BC_P = 20, BC_LS = 40, BC_N = 1000;
const BC_RANGE = { min: -4, max: 4 };
const BC_PDF_MAX = 1 / Math.sqrt(2 * Math.PI);

const BC_CH = BC_H - BC_LS;
const BC_IW = BC_W - BC_P * 2;
const BC_IH = BC_CH - BC_P * 2;
const BC_BASE_Y = BC_P + BC_IH;
const BC_SPAN = BC_RANGE.max - BC_RANGE.min;

/**
 * Band edges, in the same z units the chart is plotted in.
 *
 * These have to be ±1 exactly. `calculateSeverity` in src/server/report.ts
 * assigns Low below `mean - 1 * stdDev` and High above `mean + 1 * stdDev`, so
 * any other edge would let a visitor's marker sit inside the green region while
 * the pill beside it reads ADEQUATE.
 */
const BC_ZONE_EDGE = 1;

const BC_ZONES: ReadonlyArray<{ key: Severity; from: number; to: number; label: string }> = [
  { key: "Low", from: BC_RANGE.min, to: -BC_ZONE_EDGE, label: "Weak" },
  { key: "Medium", from: -BC_ZONE_EDGE, to: BC_ZONE_EDGE, label: "Adequate" },
  { key: "High", from: BC_ZONE_EDGE, to: BC_RANGE.max, label: "Strong" },
];

/** Filled in behind the visitor's marker vs. still ahead of it. */
const BC_REACHED_OPACITY = 0.9;
const BC_AHEAD_OPACITY = 0.22;

/**
 * Headroom above the plot in banded mode. The value pill sits over the marker,
 * and at the middle percentiles the marker *is* the peak — without this the
 * pill would be pinned to the frame and overlap the curve it labels.
 */
const BC_ZONED_TOP = 46;

export function inverseNormCdf(p: number) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a1 = -39.69683028665376, a2 = 220.9460984245205, a3 = -275.9285104469687;
  const a4 = 138.357751867269, a5 = -30.66479806614716, a6 = 2.506628277459239;
  const b1 = -54.47609879822406, b2 = 161.5858368580409, b3 = -155.6989798598866;
  const b4 = 66.80131188771972, b5 = -13.28068155288572;
  const c1 = -0.007784894002430293, c2 = -0.3223964580411365, c3 = -2.400758277161838;
  const c4 = -2.549732539343734, c5 = 4.374664141464968, c6 = 2.938163982698783;
  const d1 = 0.007784695709041462, d2 = 0.3224671290700398;
  const d3 = 2.445134137142996, d4 = 3.754408661907416;
  const pLow = 0.02425, pHigh = 1 - pLow;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
  if (p > pHigh) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
  const q = p - 0.5, r = q * q;
  return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
}

function normPdf(x: number) { return Math.exp(-0.5 * x * x) * BC_PDF_MAX; }

const xForZ = (z: number) => BC_P + ((z - BC_RANGE.min) / BC_SPAN) * BC_IW;
const yForZ = (z: number) => BC_P + (1 - normPdf(z) / BC_PDF_MAX) * BC_IH;

function buildCurvePath() {
  let path = "";
  for (let i = 0; i <= BC_N; i++) {
    const t = i / BC_N;
    const z = BC_RANGE.min + BC_SPAN * t;
    path += `${i === 0 ? "M" : "L"}${(BC_P + t * BC_IW).toFixed(2)} ${yForZ(z).toFixed(2)} `;
  }
  return path.trim();
}

/**
 * Closed area under the curve between two z values. Defaults to the whole
 * range, which is the only slice the unbanded chart draws; the banded one asks
 * for one slice per zone.
 */
function buildAreaPath(from: number = BC_RANGE.min, to: number = BC_RANGE.max) {
  let path = `M ${xForZ(from).toFixed(2)} ${BC_BASE_Y} `;
  for (let i = 0; i <= BC_N; i++) {
    const z = from + (to - from) * (i / BC_N);
    path += `L ${xForZ(z).toFixed(2)} ${yForZ(z).toFixed(2)} `;
  }
  path += `L ${xForZ(to).toFixed(2)} ${BC_BASE_Y} Z`;
  return path;
}

export function BellCurve({
  percentile,
  severity,
  animate = false,
  zonePalette,
}: {
  percentile: number;
  severity: SeverityVisual;
  /** Draws the curve on and floats the marker in. Off by default so the
      print report and /demo-report keep their existing static render. */
  animate?: boolean;
  /** Opt in to the banded render: the curve is filled per band — weak, adequate
      and strong each in their own colour, solid up to the marker and faded
      after it — and the axis labels are tinted to match. Omit for the flat
      single-tone chart. */
  zonePalette?: Record<Severity, SeverityVisual>;
}) {
  const uid = React.useId();
  const p = Math.min(0.9999, Math.max(0.0001, percentile / 100));
  const z = Math.max(BC_RANGE.min, Math.min(BC_RANGE.max, inverseNormCdf(p)));
  const mx = xForZ(z);
  const my = yForZ(z);
  const labelText = `${Math.round(percentile)}%`;

  if (!zonePalette) {
    const lw = Math.max(72, labelText.length * 12 + 24), lh = 36;
    const lx = mx - lw / 2, ly = BC_BASE_Y + 4;

    return (
      <div className="overflow-hidden rounded-2xl bg-quizSurface-low p-4">
        <svg className="mx-auto block w-full h-auto" viewBox={`0 0 ${BC_W} ${BC_H}`} preserveAspectRatio="xMidYMid meet">
          <rect width={BC_W} height={BC_H} fill="#fff1eb" rx="8" />
          <path d={buildAreaPath()} fill="rgba(247,117,40,0.12)" />
          <path
            d={buildCurvePath()}
            fill="none"
            stroke="#f77528"
            strokeWidth="2.5"
            strokeOpacity="0.8"
            className={animate ? "bc-draw" : undefined}
          />
          <g className={animate ? "bc-marker" : undefined}>
            <line x1={mx} y1={BC_P} x2={mx} y2={BC_BASE_Y} stroke={severity.color} strokeWidth="2" strokeDasharray="6 6" />
            <circle cx={mx} cy={my} r="6" fill="#fff1eb" stroke={severity.color} strokeWidth="2.5" />
            <rect x={lx} y={ly} width={lw} height={lh} rx="10" fill={severity.color} />
            <text x={mx} y={ly + lh / 2 + 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#ffffff">{labelText}</text>
          </g>
          <text x={BC_P} y={BC_H - 8} fill="#85736b" fontSize="11" fontWeight="700" letterSpacing="1">WEAK</text>
          <text x={BC_W / 2} y={BC_H - 8} textAnchor="middle" fill="#85736b" fontSize="11" fontWeight="700" letterSpacing="1">ADEQUATE</text>
          <text x={BC_W - BC_P} y={BC_H - 8} textAnchor="end" fill="#85736b" fontSize="11" fontWeight="700" letterSpacing="1">STRONG</text>
        </svg>
      </div>
    );
  }

  // Which band the marker landed in. Taken from the plotted z rather than the
  // `severity` prop so the emphasised label can never disagree with the region
  // the dot is sitting in; both derive from the same z-score server-side.
  const activeKey: Severity = z < -BC_ZONE_EDGE ? "Low" : z > BC_ZONE_EDGE ? "High" : "Medium";

  // The value pill rides just above the dot, clamped inside the frame so it
  // still reads at the extremes where the marker is near an edge.
  const pillW = Math.max(58, labelText.length * 13 + 22), pillH = 34;
  const pillX = Math.min(BC_W - BC_P - pillW, Math.max(BC_P, mx - pillW / 2));
  // Negative y is legal here: the group is shifted down by BC_ZONED_TOP, so the
  // pill can rise into that headroom instead of onto the curve.
  const pillY = Math.max(-BC_ZONED_TOP + 4, my - 18 - pillH);
  const tailY = pillY + pillH;

  return (
    <div className="overflow-hidden rounded-2xl bg-quizSurface-lowest p-4">
      <svg
        className="mx-auto block w-full h-auto"
        viewBox={`0 0 ${BC_W} ${BC_H + BC_ZONED_TOP}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id={`${uid}-reached`}>
            <rect x={0} y={-BC_ZONED_TOP} width={Math.max(0, mx)} height={BC_H + BC_ZONED_TOP} />
          </clipPath>
          <clipPath id={`${uid}-ahead`}>
            <rect
              x={mx}
              y={-BC_ZONED_TOP}
              width={Math.max(0, BC_W - mx)}
              height={BC_H + BC_ZONED_TOP}
            />
          </clipPath>
        </defs>

        <rect width={BC_W} height={BC_H + BC_ZONED_TOP} fill="#ffffff" rx="8" />

        <g transform={`translate(0,${BC_ZONED_TOP})`}>
          {/* Each band drawn twice against complementary clips, rather than once
              over the other — stacking two translucent fills would tint the
              reached side a colour that is in neither palette. */}
          {([
            { clip: `${uid}-reached`, opacity: BC_REACHED_OPACITY },
            { clip: `${uid}-ahead`, opacity: BC_AHEAD_OPACITY },
          ] as const).map((side) => (
            <g key={side.clip} clipPath={`url(#${side.clip})`}>
              {BC_ZONES.map((zone) => (
                <path
                  key={zone.key}
                  d={buildAreaPath(zone.from, zone.to)}
                  fill={zonePalette[zone.key].color}
                  fillOpacity={side.opacity}
                />
              ))}
            </g>
          ))}

          {/* Hairline over the band edges, so the silhouette still reads where
              two faded bands meet. Neutral, to stay out of the palette's way. */}
          <path
            d={buildCurvePath()}
            fill="none"
            stroke="#85736b"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            className={animate ? "bc-draw" : undefined}
          />

          <g className={animate ? "bc-marker" : undefined}>
            <line
              x1={mx}
              y1={my}
              x2={mx}
              y2={BC_BASE_Y}
              stroke={severity.color}
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <circle cx={mx} cy={my} r="6" fill="#ffffff" stroke={severity.color} strokeWidth="3" />
            <rect x={pillX} y={pillY} width={pillW} height={pillH} rx="9" fill={severity.color} />
            <path
              d={`M ${mx - 7} ${tailY} L ${mx + 7} ${tailY} L ${mx} ${tailY + 8} Z`}
              fill={severity.color}
            />
            <text
              x={pillX + pillW / 2}
              y={pillY + pillH / 2 + 6}
              textAnchor="middle"
              fontSize="19"
              fontWeight="700"
              fill="#ffffff"
            >
              {labelText}
            </text>
          </g>

          {BC_ZONES.map((zone) => (
            <text
              key={zone.key}
              x={xForZ((zone.from + zone.to) / 2)}
              y={BC_H - 8}
              textAnchor="middle"
              fill={zonePalette[zone.key].color}
              fontSize="13"
              fontWeight={zone.key === activeKey ? 800 : 600}
            >
              {zone.label}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
