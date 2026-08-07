import { Icon } from "@iconify/react";
import Router from "next/router";
import { useEffect, useState } from "react";
import { HeaderWrapper } from "src/components/Layout/Header";
import MainLayout from "src/NewComponents/MainLayout";
import { Button } from "src/NewComponents/Button";
import { setAssessmentMode } from "src/utils/assessment";
import { improveIconPaths } from "src/constants/improveIcons";
import { DomainReport, Severity } from "src/types/report";
import { useResultStore } from "src/stores/useResultStore";
import { useTaskProgress } from "src/stores/useTaskProgress";

type SeverityVisual = {
  label: "WEAK" | "ADEQUATE" | "STRONG";
  color: string;
  softColor: string;
};

type FullReport = {
  processingSpeed: DomainReport;
  executiveFunction: DomainReport;
  attention: DomainReport;
  workingMemory: DomainReport;
};

const severityVisuals: Record<Severity, SeverityVisual> = {
  Low: {
    label: "WEAK",
    color: "#D6453D",
    softColor: "#F6D1CE",
  },
  Medium: {
    label: "ADEQUATE",
    color: "#1E7AB8",
    softColor: "#D4E5F2",
  },
  High: {
    label: "STRONG",
    color: "#1BAA63",
    softColor: "#D8EFE4",
  },
};

const BELL_CURVE_WIDTH = 500;
const BELL_CURVE_HEIGHT = 260;
const BELL_CURVE_PADDING = 20;
const BELL_CURVE_LABEL_SPACE = 40;
const BELL_CURVE_POINTS = 1000;
const BELL_CURVE_RANGE = { min: -4, max: 4 };
const BELL_CURVE_PDF_MAX = 1 / Math.sqrt(2 * Math.PI);

const BELL_CURVE_LINE_COLOR = "#ffffff";
const BELL_CURVE_BG = "#F1F0F0";
const BELL_CURVE_AREA = "#BBCDDE";

function splitItemsIntoColumns(items: string[]) {
  const pivot = Math.ceil(items.length / 2);
  return [items.slice(0, pivot), items.slice(pivot)];
}

function inverseNormCdf(p: number) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  const a1 = -39.69683028665376;
  const a2 = 220.9460984245205;
  const a3 = -275.9285104469687;
  const a4 = 138.357751867269;
  const a5 = -30.66479806614716;
  const a6 = 2.506628277459239;
  const b1 = -54.47609879822406;
  const b2 = 161.5858368580409;
  const b3 = -155.6989798598866;
  const b4 = 66.80131188771972;
  const b5 = -13.28068155288572;
  const c1 = -0.007784894002430293;
  const c2 = -0.3223964580411365;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;
  const d1 = 0.007784695709041462;
  const d2 = 0.3224671290700398;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  if (p > pHigh) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  const q = p - 0.5;
  const r = q * q;
  return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
}

function normPdf(x: number) {
  return Math.exp(-0.5 * x * x) * BELL_CURVE_PDF_MAX;
}

function buildBellCurvePath(
  width: number,
  height: number,
  padding: number,
  labelSpace: number,
  points: number
) {
  const chartHeight = height - labelSpace;
  const innerWidth = width - padding * 2;
  const innerHeight = chartHeight - padding * 2;
  let path = "";

  for (let i = 0; i <= points; i += 1) {
    const t = i / points;
    const x = BELL_CURVE_RANGE.min + (BELL_CURVE_RANGE.max - BELL_CURVE_RANGE.min) * t;
    const y = normPdf(x);
    const yNormalized = y / BELL_CURVE_PDF_MAX;
    const xPos = padding + t * innerWidth;
    const yPos = padding + (1 - yNormalized) * innerHeight;
    path += `${i === 0 ? "M" : "L"}${xPos.toFixed(2)} ${yPos.toFixed(2)} `;
  }

  return path.trim();
}

function buildBellCurveAreaPath(
  start: number,
  end: number,
  width: number,
  height: number,
  padding: number,
  labelSpace: number,
  points: number
) {
  const chartHeight = height - labelSpace;
  const innerWidth = width - padding * 2;
  const innerHeight = chartHeight - padding * 2;
  const span = BELL_CURVE_RANGE.max - BELL_CURVE_RANGE.min;
  const baselineY = padding + innerHeight;
  let path = `M ${padding + ((start - BELL_CURVE_RANGE.min) / span) * innerWidth} ${baselineY} `;

  for (let i = 0; i <= points; i += 1) {
    const t = i / points;
    const x = start + (end - start) * t;
    const y = normPdf(x);
    const yNormalized = y / BELL_CURVE_PDF_MAX;
    const xPos = padding + ((x - BELL_CURVE_RANGE.min) / span) * innerWidth;
    const yPos = padding + (1 - yNormalized) * innerHeight;
    path += `L ${xPos.toFixed(2)} ${yPos.toFixed(2)} `;
  }

  const endX = padding + ((end - BELL_CURVE_RANGE.min) / span) * innerWidth;
  path += `L ${endX.toFixed(2)} ${baselineY} Z`;
  return path;
}

function BellCurve({ percentile, severity }: { percentile: number; severity: SeverityVisual }) {
  const chartHeight = BELL_CURVE_HEIGHT - BELL_CURVE_LABEL_SPACE;
  const innerWidth = BELL_CURVE_WIDTH - BELL_CURVE_PADDING * 2;
  const innerHeight = chartHeight - BELL_CURVE_PADDING * 2;
  const baselineY = BELL_CURVE_PADDING + innerHeight;
  const span = BELL_CURVE_RANGE.max - BELL_CURVE_RANGE.min;

  const path = buildBellCurvePath(
    BELL_CURVE_WIDTH,
    BELL_CURVE_HEIGHT,
    BELL_CURVE_PADDING,
    BELL_CURVE_LABEL_SPACE,
    BELL_CURVE_POINTS
  );

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
      <svg
        className="mx-auto block w-full h-auto"
        viewBox={`0 0 ${BELL_CURVE_WIDTH} ${BELL_CURVE_HEIGHT}`}
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width={BELL_CURVE_WIDTH} height={BELL_CURVE_HEIGHT} fill={BELL_CURVE_BG} rx="8" />
        <path
          d={buildBellCurveAreaPath(
            BELL_CURVE_RANGE.min,
            BELL_CURVE_RANGE.max,
            BELL_CURVE_WIDTH,
            BELL_CURVE_HEIGHT,
            BELL_CURVE_PADDING,
            BELL_CURVE_LABEL_SPACE,
            BELL_CURVE_POINTS
          )}
          fill={BELL_CURVE_AREA}
          fillOpacity="0.85"
        />
        <path d={path} fill="none" stroke={BELL_CURVE_LINE_COLOR} strokeWidth="3" strokeOpacity="0.9" />
        <line
          x1={markerX}
          y1={BELL_CURVE_PADDING}
          x2={markerX}
          y2={baselineY}
          stroke={severity.color}
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <circle cx={markerX} cy={markerY} r="6" fill="#ffffff" stroke={severity.color} strokeWidth="2" />
        <rect x={labelX} y={labelY} width={labelWidth} height={labelHeight} rx="10" fill={severity.color} />
        <text
          x={markerX}
          y={labelY + labelHeight / 2 + 6}
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="#ffffff"
        >
          {labelText}
        </text>
        <text x={BELL_CURVE_PADDING} y={BELL_CURVE_HEIGHT - 8} fill="#6B7280" fontSize="11" fontWeight="700" letterSpacing="1">
          WEAK
        </text>
        <text
          x={BELL_CURVE_WIDTH / 2}
          y={BELL_CURVE_HEIGHT - 8}
          textAnchor="middle"
          fill="#6B7280"
          fontSize="11"
          fontWeight="700"
          letterSpacing="1"
        >
          ADEQUATE
        </text>
        <text
          x={BELL_CURVE_WIDTH - BELL_CURVE_PADDING}
          y={BELL_CURVE_HEIGHT - 8}
          textAnchor="end"
          fill="#6B7280"
          fontSize="11"
          fontWeight="700"
          letterSpacing="1"
        >
          STRONG
        </text>
      </svg>
    </div>
  );
}

function CognitiveReportSection({ domain }: { domain: DomainReport }) {
  const severity = severityVisuals[domain.severity];
  const percentile = Math.round(domain.percentile);
  const introLine = `With ${severity.label.toLowerCase()} ${domain.title.toLowerCase()}, you may:`;
  const improveItems = domain.improve.slice(0, 6);
  const iconPaths = improveIconPaths[domain.title] ?? [];
  const [firstAffectColumn, secondAffectColumn] = splitItemsIntoColumns(domain.affects);

  return (
    <section
      className="report-page-fill relative overflow-hidden rounded-[22px] bg-[#F4F4F4] p-4 shadow-[0_10px_26px_rgba(17,24,39,0.08)] md:p-6 lg:p-7"
      style={{ fontFamily: "Avenir, sans-serif" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[20px] bg-[#F1F1F1] p-5 md:p-6">
          <header className="report-section-header relative z-[1]">
            <p className="text-[16px] font-bold uppercase tracking-tight text-[#8E8E8E] md:text-[22px]">COGNITIVE PERFORMANCE</p>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[30px] font-bold uppercase leading-tight tracking-tight text-[#20223A] md:text-[40px] xl:text-[54px]">
                {domain.title}
              </h2>
              <span
                className="rounded-full px-6 py-2 text-[18px] font-bold uppercase leading-none text-white md:text-[22px] xl:text-[26px]"
                style={{ backgroundColor: severity.color }}
              >
                {severity.label}
              </span>
            </div>
          </header>

          <div className="report-section-curve relative z-[1] mt-4">
            <BellCurve percentile={percentile} severity={severity} />
          </div>

          <div className="report-section-definition relative z-[1] mt-5 rounded-[16px] bg-[#EAEAEA] p-4 md:p-5">
            <p className="text-[18px] font-bold uppercase tracking-tight text-[#333333] md:text-[21px]">WHAT IS {domain.title.toUpperCase()}?</p>
            <p className="mt-2 text-[16px] leading-relaxed text-[#666666] break-words md:text-[20px]">{domain.definition}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[14px] bg-black px-4 py-3 text-center text-[15px] font-bold uppercase tracking-[0.16em] text-white md:text-[19px]">
            HOW THIS AFFECTS YOU
          </div>
          <div className="rounded-[16px] bg-[#F1F1F1] p-5 md:p-6">
            <p className="mb-3 text-[16px] leading-relaxed text-[#222222] md:text-[20px]">{introLine}</p>
            <div className="grid gap-x-5 gap-y-2 md:grid-cols-2">
              <ul className="list-inside list-disc space-y-2 text-[16px] font-semibold leading-relaxed text-[#111111] md:text-[17px]">
                {firstAffectColumn.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ul className="list-inside list-disc space-y-2 text-[16px] font-semibold leading-relaxed text-[#111111] md:text-[17px]">
                {secondAffectColumn.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[14px] bg-black px-4 py-3 text-center text-[15px] font-bold uppercase tracking-[0.16em] text-white md:text-[19px]">
            HOW TO IMPROVE
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {improveItems.map((item, index) => (
              <div key={item} className="flex min-w-0 items-center gap-3 rounded-[16px] bg-[#F1F1F1] px-3 py-4 md:px-4">
                {iconPaths[index] ? (
                  <img src={iconPaths[index]} alt="" className="h-10 w-10 shrink-0 object-contain" />
                ) : (
                  <div
                    className="c h-10 w-10 shrink-0 rounded-full border text-[18px] font-bold"
                    style={{ borderColor: severity.color, color: severity.color, backgroundColor: severity.softColor }}
                  >
                    +
                  </div>
                )}
                <p className="min-w-0 break-words text-[14px] leading-snug text-[#252525] md:text-[16px]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ReportPage() {
  const { result } = useResultStore();
  const { taskProgress } = useTaskProgress();

  const [shortReport, setShortReport] = useState<DomainReport | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message = payload?.details || payload?.error || 'Failed to generate report';
          throw new Error(message);
        }

        const data = await response.json();
        setShortReport(data.shortReport ?? null);
        setFullReport(data.fullReport ?? null);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError((err as Error).message || 'Failed to generate report. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [result]);

  const fullReportSections: DomainReport[] = fullReport
    ? [fullReport.processingSpeed, fullReport.executiveFunction, fullReport.attention, fullReport.workingMemory]
    : [];
  const fullComplete = ["task2", "task3", "task4", "task5"].every(
    (task) => taskProgress[task as keyof typeof taskProgress].currLevel === taskProgress[task as keyof typeof taskProgress].totalLevel
  );

  const title = fullComplete ? "Full Cognitive Report" : "Processing Speed Report";
  const canDownload = Boolean(shortReport || fullReport);
  const handleDownloadPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <HeaderWrapper title="Loading Report..." className="report-print-container !max-w-none">
        <MainLayout className="report-print-layout items-center gap-6 justify-start">
          <div className="report-canvas rounded-xl border border-[#D1D5DB] bg-white p-6 text-center text-sm text-[#6B7280] shadow-lg">
            Generating your report in clinic format...
          </div>
        </MainLayout>
      </HeaderWrapper>
    );
  }

  if (error) {
    return (
      <HeaderWrapper title={title} className="report-print-container !max-w-none">
        <MainLayout className="report-print-layout items-center gap-6 justify-start">
          <div className="report-canvas rounded-xl border border-[#FCA5A5] bg-white p-6 text-center text-sm text-red-600 shadow-lg">
            {error}
          </div>
        </MainLayout>
      </HeaderWrapper>
    );
  }

  return (
    <HeaderWrapper title={title} className="report-print-container !max-w-none" isHideBack>
      <MainLayout className="report-print-layout items-center gap-6 justify-start pt-[80px] pb-10 md:pt-[100px] md:pb-14 lg:pt-[80px] lg:pb-10">
        <div className="report-canvas report-canvas-desktop print-hidden">
          <div className="flex items-center justify-between gap-4">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[#F0F0F0] px-5 py-2.5 text-[17px] font-semibold text-[#3E3E43] transition-opacity hover:opacity-90 md:px-7 md:py-3 md:text-[22px]"
              onClick={() => Router.back()}
            >
              <Icon icon="ion:arrow-back" className="h-5 w-5 md:h-6 md:w-6" />
              <span>Back</span>
            </button>
            {canDownload && (
              <button
                className="rounded-full bg-[#3F3F43] px-6 py-2.5 text-[17px] font-semibold text-white transition-opacity hover:opacity-90 md:px-9 md:py-3 md:text-[22px]"
                onClick={handleDownloadPdf}
              >
                Download PDF
              </button>
            )}
          </div>
        </div>

        {fullComplete && fullReport ? (
          <div className="report-print-sections w-full space-y-8">
            {fullReportSections.map((domain) => (
              <div key={domain.title} className="print-page">
                <div className="report-canvas report-canvas-desktop">
                  <CognitiveReportSection domain={domain} />
                </div>
              </div>
            ))}
          </div>
        ) : shortReport ? (
          <div className="print-page">
            <div className="report-canvas report-canvas-desktop">
              <CognitiveReportSection domain={shortReport} />
            </div>
          </div>
        ) : (
          <div className="report-canvas report-canvas-desktop rounded-xl border border-[#D1D5DB] bg-white p-6 text-center text-sm text-[#6B7280] shadow-lg">
            Complete the Processing Speed game to unlock your clinic-style report.
          </div>
        )}

        {!fullComplete && (
          <div className="report-canvas report-canvas-desktop rounded-[22px] border border-[#D1D5DB] bg-[#F1F1F1] p-6 shadow-lg print-hidden md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[1000px]">
                <h3 className="text-[22px] font-bold uppercase tracking-tight text-[#20223A] md:text-[34px]">Unlock Full Cognitive Profile</h3>
                <p className="mt-2 text-[18px] leading-relaxed text-[#636363] break-words md:text-[20px]">
                  Continue with the remaining three games to generate a comprehensive brain report that includes Executive Function, Attention, and
                  Working Memory, alongside personalized insights.
                </p>
              </div>
              <div className="w-full lg:w-auto lg:min-w-[360px]">
                <Button
                  onClick={() => {
                    setAssessmentMode("full");
                    Router.push("/about");
                  }}
                  className="print-hidden"
                >
                  Continue to Full Assessment
                </Button>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </HeaderWrapper>
  );
}
