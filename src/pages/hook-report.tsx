import { Icon } from "@iconify/react";
import Router from "next/router";
import { useEffect, useState } from "react";
import { HeaderWrapper } from "src/components/Layout/Header";
import MainLayout from "src/NewComponents/MainLayout";
import { Button } from "src/NewComponents/Button";
import { DomainReport, Severity } from "src/types/report";
import { useResultStore } from "src/stores/useResultStore";
import { getHookClinic, clearHookClinic, clearAssessmentMode } from "src/utils/assessment";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";

type SeverityVisual = {
  label: "WEAK" | "ADEQUATE" | "STRONG";
  color: string;
  softColor: string;
};

const severityVisuals: Record<Severity, SeverityVisual> = {
  Low: { label: "WEAK", color: "#D6453D", softColor: "#F6D1CE" },
  Medium: { label: "ADEQUATE", color: "#1E7AB8", softColor: "#D4E5F2" },
  High: { label: "STRONG", color: "#1BAA63", softColor: "#D8EFE4" },
};

const BELL_CURVE_WIDTH = 500;
const BELL_CURVE_HEIGHT = 260;
const BELL_CURVE_PADDING = 20;
const BELL_CURVE_LABEL_SPACE = 40;
const BELL_CURVE_POINTS = 1000;
const BELL_CURVE_RANGE = { min: -4, max: 4 };
const BELL_CURVE_PDF_MAX = 1 / Math.sqrt(2 * Math.PI);
const BELL_CURVE_BG = "#F1F0F0";
const BELL_CURVE_AREA = "#BBCDDE";

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

function normPdf(x: number) {
  return Math.exp(-0.5 * x * x) * BELL_CURVE_PDF_MAX;
}

function buildBellCurvePath() {
  const chartHeight = BELL_CURVE_HEIGHT - BELL_CURVE_LABEL_SPACE;
  const innerWidth = BELL_CURVE_WIDTH - BELL_CURVE_PADDING * 2;
  const innerHeight = chartHeight - BELL_CURVE_PADDING * 2;
  let path = "";
  for (let i = 0; i <= BELL_CURVE_POINTS; i++) {
    const t = i / BELL_CURVE_POINTS;
    const x = BELL_CURVE_RANGE.min + (BELL_CURVE_RANGE.max - BELL_CURVE_RANGE.min) * t;
    const y = normPdf(x) / BELL_CURVE_PDF_MAX;
    const xPos = BELL_CURVE_PADDING + t * innerWidth;
    const yPos = BELL_CURVE_PADDING + (1 - y) * innerHeight;
    path += `${i === 0 ? "M" : "L"}${xPos.toFixed(2)} ${yPos.toFixed(2)} `;
  }
  return path.trim();
}

function buildBellCurveAreaPath() {
  const chartHeight = BELL_CURVE_HEIGHT - BELL_CURVE_LABEL_SPACE;
  const innerWidth = BELL_CURVE_WIDTH - BELL_CURVE_PADDING * 2;
  const innerHeight = chartHeight - BELL_CURVE_PADDING * 2;
  const span = BELL_CURVE_RANGE.max - BELL_CURVE_RANGE.min;
  const baselineY = BELL_CURVE_PADDING + innerHeight;
  const start = BELL_CURVE_RANGE.min, end = BELL_CURVE_RANGE.max;
  let path = `M ${BELL_CURVE_PADDING + ((start - BELL_CURVE_RANGE.min) / span) * innerWidth} ${baselineY} `;
  for (let i = 0; i <= BELL_CURVE_POINTS; i++) {
    const t = i / BELL_CURVE_POINTS;
    const x = start + (end - start) * t;
    const y = normPdf(x) / BELL_CURVE_PDF_MAX;
    const xPos = BELL_CURVE_PADDING + ((x - BELL_CURVE_RANGE.min) / span) * innerWidth;
    const yPos = BELL_CURVE_PADDING + (1 - y) * innerHeight;
    path += `L ${xPos.toFixed(2)} ${yPos.toFixed(2)} `;
  }
  path += `L ${BELL_CURVE_PADDING + ((end - BELL_CURVE_RANGE.min) / span) * innerWidth} ${baselineY} Z`;
  return path;
}

function BellCurve({ percentile, severity }: { percentile: number; severity: SeverityVisual }) {
  const chartHeight = BELL_CURVE_HEIGHT - BELL_CURVE_LABEL_SPACE;
  const innerWidth = BELL_CURVE_WIDTH - BELL_CURVE_PADDING * 2;
  const innerHeight = chartHeight - BELL_CURVE_PADDING * 2;
  const baselineY = BELL_CURVE_PADDING + innerHeight;
  const span = BELL_CURVE_RANGE.max - BELL_CURVE_RANGE.min;

  const p = Math.min(0.9999, Math.max(0.0001, percentile / 100));
  const z = Math.max(BELL_CURVE_RANGE.min, Math.min(BELL_CURVE_RANGE.max, inverseNormCdf(p)));
  const markerX = BELL_CURVE_PADDING + ((z - BELL_CURVE_RANGE.min) / span) * innerWidth;
  const markerY = BELL_CURVE_PADDING + (1 - normPdf(z) / BELL_CURVE_PDF_MAX) * innerHeight;
  const labelText = `${Math.round(percentile)}%`;
  const labelWidth = Math.max(72, labelText.length * 12 + 24);
  const labelHeight = 36;
  const labelX = markerX - labelWidth / 2;
  const labelY = baselineY + 4;

  return (
    <div className="overflow-hidden rounded-[16px] bg-[#EDEDED] p-4 text-center md:p-5">
      <svg className="mx-auto block w-full h-auto" viewBox={`0 0 ${BELL_CURVE_WIDTH} ${BELL_CURVE_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <rect width={BELL_CURVE_WIDTH} height={BELL_CURVE_HEIGHT} fill={BELL_CURVE_BG} rx="8" />
        <path d={buildBellCurveAreaPath()} fill={BELL_CURVE_AREA} fillOpacity="0.85" />
        <path d={buildBellCurvePath()} fill="none" stroke="#ffffff" strokeWidth="3" strokeOpacity="0.9" />
        <line x1={markerX} y1={BELL_CURVE_PADDING} x2={markerX} y2={baselineY} stroke={severity.color} strokeWidth="2" strokeDasharray="6 6" />
        <circle cx={markerX} cy={markerY} r="6" fill="#ffffff" stroke={severity.color} strokeWidth="2" />
        <rect x={labelX} y={labelY} width={labelWidth} height={labelHeight} rx="10" fill={severity.color} />
        <text x={markerX} y={labelY + labelHeight / 2 + 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#ffffff">{labelText}</text>
        <text x={BELL_CURVE_PADDING} y={BELL_CURVE_HEIGHT - 8} fill="#6B7280" fontSize="11" fontWeight="700" letterSpacing="1">WEAK</text>
        <text x={BELL_CURVE_WIDTH / 2} y={BELL_CURVE_HEIGHT - 8} textAnchor="middle" fill="#6B7280" fontSize="11" fontWeight="700" letterSpacing="1">ADEQUATE</text>
        <text x={BELL_CURVE_WIDTH - BELL_CURVE_PADDING} y={BELL_CURVE_HEIGHT - 8} textAnchor="end" fill="#6B7280" fontSize="11" fontWeight="700" letterSpacing="1">STRONG</text>
      </svg>
    </div>
  );
}

const FULL_DOMAINS = [
  { icon: "mdi:brain", title: "Executive Function", desc: "Planning, problem-solving, and staying focused" },
  { icon: "mdi:eye-outline", title: "Attention", desc: "Focusing while ignoring distractions" },
  { icon: "mdi:head-cog-outline", title: "Working Memory", desc: "Holding and recalling information" },
];

export default function HookReportPage() {
  const { result } = useResultStore();
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clinic, setClinic] = useState<string>("your clinic");

  useEffect(() => {
    const c = getHookClinic();
    if (c) setClinic(c);
  }, []);

  useEffect(() => {
    async function fetchReport() {
      if (!result || Object.keys(result).length === 0) {
        setLoading(false);
        return;
      }
      const task2Score = Array.isArray(result.task2) ? result.task2[0]?.score : result.task2?.score;
      if (typeof task2Score !== "number") {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.details || payload?.error || "Failed to generate report");
        }
        const data = await response.json();
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
    Router.push("/hook" + (clinic !== "your clinic" ? `?clinic=${encodeURIComponent(clinic)}` : ""));
  };

  if (loading) {
    return (
      <HeaderWrapper title="Your Results" className="!max-w-none" isHideBack>
        <MainLayout className="items-center gap-6 justify-center">
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-lg">
            Generating your results...
          </div>
        </MainLayout>
      </HeaderWrapper>
    );
  }

  if (error) {
    return (
      <HeaderWrapper title="Your Results" className="!max-w-none" isHideBack>
        <MainLayout className="items-center gap-6 justify-center">
          <div className="rounded-xl border border-red-300 bg-white p-8 text-center text-red-600 shadow-lg">
            {error}
          </div>
        </MainLayout>
      </HeaderWrapper>
    );
  }

  const severity = report ? severityVisuals[report.severity] : null;

  return (
    <HeaderWrapper title="Your Results" className="!max-w-none" isHideBack>
      <MainLayout className="items-center gap-6 justify-start pt-[80px] pb-10 md:pt-[100px] md:pb-14 lg:pt-[80px] lg:pb-10">
        {report && severity ? (
          <>
            {/* Result Card */}
            <div className="w-full max-w-2xl mx-auto">
              <section
                className="relative overflow-hidden rounded-[22px] bg-[#F4F4F4] p-5 shadow-[0_10px_26px_rgba(17,24,39,0.08)] md:p-7"
                style={{ fontFamily: "Avenir, sans-serif" }}
              >
                <div className="rounded-[20px] bg-[#F1F1F1] p-5 md:p-6">
                  <p className="text-[14px] font-bold uppercase tracking-tight text-[#8E8E8E] md:text-[18px]">
                    YOUR COGNITIVE SCREENING
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[26px] font-bold uppercase leading-tight tracking-tight text-[#20223A] md:text-[36px]">
                      {report.title}
                    </h2>
                    <span
                      className="rounded-full px-5 py-2 text-[16px] font-bold uppercase leading-none text-white md:text-[20px]"
                      style={{ backgroundColor: severity.color }}
                    >
                      {severity.label}
                    </span>
                  </div>

                  <div className="mt-4">
                    <BellCurve percentile={Math.round(report.percentile)} severity={severity} />
                  </div>

                  <div className="mt-4 rounded-[16px] bg-[#EAEAEA] p-4">
                    <p className="text-[15px] font-bold uppercase tracking-tight text-[#333] md:text-[18px]">
                      What is {report.title}?
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#666] md:text-[17px]">
                      {report.definition}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Hook CTA — The Main Sell */}
            <div className="w-full max-w-2xl mx-auto">
              <div className="rounded-[22px] bg-gradient-to-br from-[#002D7C] to-[#1a1a3e] p-6 text-white shadow-xl md:p-8">
                <h3 className="text-xl font-bold md:text-2xl">
                  This is just 1 of 4 brain areas.
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-blue-100 md:text-[17px]">
                  The full RecognAIze assessment also screens:
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {FULL_DOMAINS.map((d) => (
                    <div key={d.title} className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                      <Icon icon={d.icon} className="text-blue-200 size-7" />
                      <p className="mt-1 text-sm font-bold">{d.title}</p>
                      <p className="mt-0.5 text-xs text-blue-200">{d.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-white/15 p-4 text-center backdrop-blur">
                  <p className="text-lg font-bold md:text-xl">
                    Ask <span className="text-yellow-300">{clinic}</span> for the full RecognAIze assessment
                  </p>
                  <p className="mt-1 text-sm text-blue-200">
                    Get a comprehensive cognitive profile with personalized insights
                  </p>
                </div>
              </div>
            </div>

            {/* Retake Button */}
            <div className="w-full max-w-2xl mx-auto">
              <button
                onClick={handleRetake}
                className="w-full rounded-full border-2 border-gray-300 py-3 text-center text-[15px] font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Retake Screening
              </button>
            </div>
          </>
        ) : (
          <div className="w-full max-w-2xl mx-auto rounded-xl border border-gray-300 bg-white p-6 text-center text-sm text-gray-500 shadow-lg">
            Complete the screening game to see your results.
          </div>
        )}
      </MainLayout>
    </HeaderWrapper>
  );
}
