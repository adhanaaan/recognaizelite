import Head from "next/head";
import Router from "next/router";
import { useEffect, useState } from "react";
import { DomainReport, Severity } from "src/types/report";
import { useResultStore } from "src/stores/useResultStore";
import { clearHookClinic, clearAssessmentMode } from "src/utils/assessment";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { CLINICAL_DISCLAIMER } from "src/utils/disclaimers";

type SeverityVisual = {
  label: "WEAK" | "ADEQUATE" | "STRONG";
  color: string;
  softBg: string;
};

const severityVisuals: Record<Severity, SeverityVisual> = {
  Low: { label: "WEAK", color: "#EF4444", softBg: "rgba(239,68,68,0.15)" },
  Medium: { label: "ADEQUATE", color: "#E8A0B0", softBg: "rgba(232,160,176,0.12)" },
  High: { label: "STRONG", color: "#34D399", softBg: "rgba(52,211,153,0.15)" },
};

// --- Bell Curve (dark-themed, rose accent) ---
const BC_W = 500, BC_H = 260, BC_P = 20, BC_LS = 40, BC_N = 1000;
const BC_RANGE = { min: -4, max: 4 };
const BC_PDF_MAX = 1 / Math.sqrt(2 * Math.PI);

function inverseNormCdf(p: number) {
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

function buildCurvePath() {
  const ch = BC_H - BC_LS, iw = BC_W - BC_P * 2, ih = ch - BC_P * 2;
  let path = "";
  for (let i = 0; i <= BC_N; i++) {
    const t = i / BC_N;
    const x = BC_RANGE.min + (BC_RANGE.max - BC_RANGE.min) * t;
    const y = normPdf(x) / BC_PDF_MAX;
    path += `${i === 0 ? "M" : "L"}${(BC_P + t * iw).toFixed(2)} ${(BC_P + (1 - y) * ih).toFixed(2)} `;
  }
  return path.trim();
}

function buildAreaPath() {
  const ch = BC_H - BC_LS, iw = BC_W - BC_P * 2, ih = ch - BC_P * 2;
  const span = BC_RANGE.max - BC_RANGE.min;
  const baseY = BC_P + ih;
  let path = `M ${BC_P} ${baseY} `;
  for (let i = 0; i <= BC_N; i++) {
    const t = i / BC_N;
    const x = BC_RANGE.min + (BC_RANGE.max - BC_RANGE.min) * t;
    const y = normPdf(x) / BC_PDF_MAX;
    path += `L ${(BC_P + ((x - BC_RANGE.min) / span) * iw).toFixed(2)} ${(BC_P + (1 - y) * ih).toFixed(2)} `;
  }
  path += `L ${BC_P + iw} ${baseY} Z`;
  return path;
}

function BellCurve({ percentile, severity }: { percentile: number; severity: SeverityVisual }) {
  const ch = BC_H - BC_LS, iw = BC_W - BC_P * 2, ih = ch - BC_P * 2;
  const baseY = BC_P + ih, span = BC_RANGE.max - BC_RANGE.min;
  const p = Math.min(0.9999, Math.max(0.0001, percentile / 100));
  const z = Math.max(BC_RANGE.min, Math.min(BC_RANGE.max, inverseNormCdf(p)));
  const mx = BC_P + ((z - BC_RANGE.min) / span) * iw;
  const my = BC_P + (1 - normPdf(z) / BC_PDF_MAX) * ih;
  const labelText = `${Math.round(percentile)}%`;
  const lw = Math.max(72, labelText.length * 12 + 24), lh = 36;
  const lx = mx - lw / 2, ly = baseY + 4;

  return (
    <div className="overflow-hidden rounded-2xl p-4" style={{ backgroundColor: "#1E0E16" }}>
      <svg className="mx-auto block w-full h-auto" viewBox={`0 0 ${BC_W} ${BC_H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={BC_W} height={BC_H} fill="#1E0E16" rx="8" />
        <path d={buildAreaPath()} fill="rgba(232,160,176,0.15)" />
        <path d={buildCurvePath()} fill="none" stroke="#E8A0B0" strokeWidth="2.5" strokeOpacity="0.8" />
        <line x1={mx} y1={BC_P} x2={mx} y2={baseY} stroke={severity.color} strokeWidth="2" strokeDasharray="6 6" />
        <circle cx={mx} cy={my} r="6" fill="#1E0E16" stroke={severity.color} strokeWidth="2.5" />
        <rect x={lx} y={ly} width={lw} height={lh} rx="10" fill={severity.color} />
        <text x={mx} y={ly + lh / 2 + 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#ffffff">{labelText}</text>
        <text x={BC_P} y={BC_H - 8} fill="#6B7280" fontSize="11" fontWeight="700" letterSpacing="1">WEAK</text>
        <text x={BC_W / 2} y={BC_H - 8} textAnchor="middle" fill="#6B7280" fontSize="11" fontWeight="700" letterSpacing="1">ADEQUATE</text>
        <text x={BC_W - BC_P} y={BC_H - 8} textAnchor="end" fill="#6B7280" fontSize="11" fontWeight="700" letterSpacing="1">STRONG</text>
      </svg>
    </div>
  );
}

const CTA_COPY: Record<Severity, { headline: string; body: string }> = {
  Low: {
    headline: "Brain fog isn\u2019t something you just live with.",
    body: "Processing speed flagged a concern \u2014 but that\u2019s just one of four cognitive pillars. Hormonal shifts during perimenopause can affect memory, attention, and executive function too. A full screening can help you understand what\u2019s happening.",
  },
  Medium: {
    headline: "You\u2019ve only seen 25% of the picture.",
    body: "Processing speed looks adequate \u2014 but hormonal changes can silently affect memory, focus, and decision-making. One pillar doesn\u2019t tell the whole story, especially during perimenopause.",
  },
  High: {
    headline: "You\u2019ve only seen 25% of the picture.",
    body: "Processing speed is strong \u2014 but cognitive health is more than speed. Memory, attention, and executive function may still be affected by hormonal changes. The full screening reveals your complete cognitive baseline.",
  },
};

const LOCKED_AREAS = [
  { name: "Memory", skill: "Recall & retention under pressure" },
  { name: "Attention", skill: "Sustained focus & multitasking" },
  { name: "Executive Function", skill: "Decision-making & planning" },
];

export default function PrologueReportPage() {
  const { result } = useResultStore();
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    const next = document.getElementById("__next");
    if (next) {
      next.style.overflow = "auto";
      next.style.height = "auto";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      if (next) {
        next.style.overflow = "";
        next.style.height = "";
      }
    };
  }, []);

  useEffect(() => {
    async function fetchReport() {
      if (!result || Object.keys(result).length === 0) { setLoading(false); return; }
      const task2Score = Array.isArray(result.task2) ? result.task2[0]?.score : result.task2?.score;
      if (typeof task2Score !== "number") { setLoading(false); return; }
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.details || payload?.error || "Failed to generate report");
        }
        const data = await res.json();
        setReport(data.shortReport ?? null);
      } catch (err) {
        setError((err as Error).message || "Failed to generate report.");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [result]);

  const handleRetake = () => {
    clearHookClinic();
    clearAssessmentMode();
    resetResults();
    resetTaskProgress();
    Router.push("/prologue");
  };

  const page = (children: React.ReactNode) => (
    <>
    <Head>
      <meta name="theme-color" content="#1A0A10" />
    </Head>
    <div
      className="min-h-[100dvh] w-full px-5 py-10 sm:px-8 overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #1A0A10 0%, #2A1520 50%, #1A0A10 100%)" }}
    >
      <div className="max-w-2xl mx-auto space-y-6">{children}</div>
    </div>
    </>
  );

  if (loading) {
    return page(
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg" style={{ color: "#D4A0AE" }}>Generating your results...</p>
      </div>
    );
  }

  if (error) {
    return page(
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-red-800 bg-red-900/30 p-8 text-center text-red-300">{error}</div>
      </div>
    );
  }

  const severity = report ? severityVisuals[report.severity] : null;

  return page(
    report && severity ? (
      <>
        {/* Prologue branding */}
        <div className="text-center pt-2 pb-4">
          <h2
            className="text-white text-[14px] font-light"
            style={{ letterSpacing: "0.25em", fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            PROLOGUE
          </h2>
          <p className="text-[9px] uppercase mt-1" style={{ letterSpacing: "0.2em", color: "#8A6A74" }}>
            Your Results
          </p>
        </div>

        {/* Result Card */}
        <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#1E0E16", border: "1px solid #3A2030" }}>
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "#8A6A74" }}>
            Cognitive Screening
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h2
              className="text-[24px] sm:text-[30px] font-bold uppercase leading-tight text-white"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {report.title}
            </h2>
            <span
              className="rounded-full px-4 py-1.5 text-[13px] font-bold uppercase leading-none text-white"
              style={{ backgroundColor: severity.color }}
            >
              {severity.label}
            </span>
          </div>

          <div className="mt-4">
            <BellCurve percentile={Math.round(report.percentile)} severity={severity} />
          </div>

          <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: "#2A1520" }}>
            <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#D4A0AE" }}>
              What is {report.title}?
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-300">
              {report.definition}
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#1E0E16", border: "1px solid #3A2030" }}>
          <h3
            className="text-[20px] sm:text-[24px] font-bold leading-snug text-white"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {CTA_COPY[report.severity].headline}
          </h3>
          <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "#A08A90" }}>
            {CTA_COPY[report.severity].body}
          </p>

          {/* Progress indicator */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "#8A6A74" }}>Your screening progress</span>
              <span className="text-[13px] font-bold" style={{ color: "#E8A0B0" }}>1 of 4</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#3A2030" }}>
              <div className="h-full rounded-full w-1/4" style={{ backgroundColor: "#E8A0B0" }} />
            </div>
          </div>

          {/* Brain areas grid */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 px-4 py-4 text-center" style={{ borderColor: severity.color, backgroundColor: severity.softBg }}>
              <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: severity.color }}>
                &#10003; Complete
              </div>
              <div className="mt-1 text-[14px] font-bold text-white">Processing Speed</div>
              <div className="mt-0.5 text-[12px] font-semibold" style={{ color: severity.color }}>{severity.label}</div>
            </div>
            {LOCKED_AREAS.map((area) => (
              <div key={area.name} className="rounded-xl border px-4 py-4 text-center relative overflow-hidden" style={{ borderColor: "#3A2030", backgroundColor: "rgba(42,21,32,0.5)" }}>
                <div style={{ color: "#5A4A50" }}>
                  <svg className="mx-auto size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="mt-1 text-[14px] font-bold" style={{ color: "#A08A90" }}>{area.name}</div>
                <div className="mt-0.5 text-[11px]" style={{ color: "#5A4A50" }}>{area.skill}</div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-6 rounded-2xl px-5 py-6 text-center" style={{ background: "linear-gradient(135deg, #E8A0B0 0%, #D4869A 100%)" }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(26,10,16,0.6)" }}>
              Prologue Clinic
            </p>
            <p
              className="text-[19px] sm:text-[22px] font-bold leading-snug"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#1A0A10" }}
            >
              Unlock your complete cognitive baseline.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "rgba(26,10,16,0.7)" }}>
              Part of Prologue&apos;s women&apos;s health &amp; wellness screening.
              <br />
              10 minutes · Non-invasive · Science-backed
            </p>
            <div className="mt-4 inline-block rounded-full px-8 py-3 cursor-pointer transition-colors" style={{ backgroundColor: "#1A0A10" }}>
              <span className="text-[14px] font-bold text-white">Book Your Full Screening</span>
            </div>
          </div>

          <p className="mt-4 text-[11px] italic leading-normal" style={{ color: "#5A4A50" }}>
            {CLINICAL_DISCLAIMER}
          </p>
        </section>

        {/* Retake */}
        <button
          onClick={handleRetake}
          className="w-full rounded-full border py-3 text-center text-[14px] font-medium transition-colors"
          style={{ borderColor: "#3A2030", color: "#8A6A74" }}
        >
          Retake
        </button>
      </>
    ) : (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border p-6 text-center text-sm" style={{ borderColor: "#3A2030", backgroundColor: "rgba(42,21,32,0.5)", color: "#A08A90" }}>
          Complete the screening game to see your results.
        </div>
      </div>
    )
  );
}
