import Head from "next/head";
import Router from "next/router";
import { useEffect, useState } from "react";
import { DomainReport, Severity } from "src/types/report";
import { useResultStore } from "src/stores/useResultStore";
import { clearHookClinic, clearAssessmentMode } from "src/utils/assessment";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";

type SeverityVisual = {
  label: "WEAK" | "ADEQUATE" | "STRONG";
  color: string;
  softBg: string;
};

const severityVisuals: Record<Severity, SeverityVisual> = {
  Low: { label: "WEAK", color: "#EF4444", softBg: "rgba(239,68,68,0.15)" },
  Medium: { label: "ADEQUATE", color: "#5CE0D8", softBg: "rgba(92,224,216,0.12)" },
  High: { label: "STRONG", color: "#34D399", softBg: "rgba(52,211,153,0.15)" },
};

// --- Bell Curve (dark-themed) ---
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
    <div className="overflow-hidden rounded-2xl p-4" style={{ backgroundColor: "#141925" }}>
      <svg className="mx-auto block w-full h-auto" viewBox={`0 0 ${BC_W} ${BC_H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={BC_W} height={BC_H} fill="#141925" rx="8" />
        <path d={buildAreaPath()} fill="rgba(92,224,216,0.15)" />
        <path d={buildCurvePath()} fill="none" stroke="#5CE0D8" strokeWidth="2.5" strokeOpacity="0.8" />
        <line x1={mx} y1={BC_P} x2={mx} y2={baseY} stroke={severity.color} strokeWidth="2" strokeDasharray="6 6" />
        <circle cx={mx} cy={my} r="6" fill="#141925" stroke={severity.color} strokeWidth="2.5" />
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
    headline: "You\u2019ve only seen 25% of the picture.",
    body: "Processing speed flagged a concern \u2014 but that\u2019s just one of four cognitive pillars. Memory, attention, and executive function could be compensating or declining silently. Without the full screening, you\u2019re guessing.",
  },
  Medium: {
    headline: "You\u2019ve only seen 25% of the picture.",
    body: "Processing speed looks adequate \u2014 but that tells you nothing about how your memory holds under pressure, how long your focus lasts, or how sharp your decisions are. One pillar doesn\u2019t define your brain.",
  },
  High: {
    headline: "You\u2019ve only seen 25% of the picture.",
    body: "Processing speed is strong \u2014 but high performers know that speed without memory, focus, and decision-making is incomplete. The full screening reveals what\u2019s really driving your performance.",
  },
};

const LOCKED_AREAS = [
  { name: "Memory", skill: "Recall & retention under pressure" },
  { name: "Attention", skill: "Sustained focus & multitasking" },
  { name: "Executive Function", skill: "Decision-making & planning" },
];

const LEAD_EMAIL_KEY = "recognaize-lead-email";

export default function HookIkigaiReportPage() {
  const { result } = useResultStore();
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(LEAD_EMAIL_KEY);
    if (stored) setEmailSubmitted(true);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    localStorage.setItem(LEAD_EMAIL_KEY, trimmed);
    setEmailSubmitted(true);
    setEmailError("");

    // Fire-and-forget: persist lead to server
    fetch("/api/save-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmed,
        clinic: "hookikigai",
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently ignore — localStorage is the primary gate
    });
  };

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
    Router.push("/hookikigai");
  };

  const page = (children: React.ReactNode) => (
    <>
    <Head>
      <meta name="theme-color" content="#0B0F1A" />
    </Head>
    <div
      className="min-h-[100dvh] w-full px-5 py-10 sm:px-8 overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #0B0F1A 0%, #101828 50%, #0B0F1A 100%)" }}
    >
      <div className="max-w-2xl mx-auto space-y-6">{children}</div>
    </div>
    </>
  );

  if (loading) {
    return page(
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-lg">Generating your results...</p>
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
        {/* GMS branding */}
        <div className="text-center pt-2 pb-4">
          <img src="/logo.png" alt="GMS Logo" className="mx-auto w-[100px]" />
          <p className="text-gray-500 text-[9px] uppercase mt-2" style={{ letterSpacing: "0.2em" }}>
            Your Results
          </p>
        </div>

        {/* Result Card — teaser always visible */}
        <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#111827", border: "1px solid #1F2937" }}>
          <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
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

          {/* Bell curve — blurred if email not submitted */}
          <div className="mt-4 relative">
            <div style={!emailSubmitted ? { filter: "blur(12px)", pointerEvents: "none" } : undefined}>
              <BellCurve percentile={Math.round(report.percentile)} severity={severity} />
            </div>
            {!emailSubmitted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-xl px-5 py-3 text-center" style={{ backgroundColor: "rgba(17,24,39,0.85)" }}>
                  <svg className="mx-auto size-5 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p className="text-[13px] font-semibold text-gray-300">Enter your email to reveal your score</p>
                </div>
              </div>
            )}
          </div>

          {/* Definition — only shown after email */}
          {emailSubmitted && (
            <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: "#1A2035" }}>
              <p className="text-[13px] font-bold uppercase tracking-wider text-gray-400">
                What is {report.title}?
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-300">
                {report.definition}
              </p>
            </div>
          )}
        </section>

        {/* Email capture form — shown when email not yet submitted */}
        {!emailSubmitted && (
          <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#111827", border: "1px solid #1F2937" }}>
            <h3
              className="text-[20px] sm:text-[24px] font-bold leading-snug text-white text-center"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Want to see your full results?
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-gray-400 text-center">
              Enter your email to unlock your detailed percentile score, learn what it means, and get tips to improve.
            </p>
            <form onSubmit={handleEmailSubmit} className="mt-5 space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3.5 text-[15px] text-white placeholder-gray-500 outline-none focus:border-[#5CE0D8] transition-colors"
              />
              {emailError && (
                <p className="text-red-400 text-[12px]">{emailError}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-full px-8 py-4 text-[16px] font-bold tracking-wide transition-all active:opacity-90"
                style={{
                  backgroundColor: "#5CE0D8",
                  color: "#0B0F1A",
                  boxShadow: "0 0 30px rgba(92,224,216,0.25)",
                }}
              >
                Get My Results
              </button>
            </form>
            <p className="mt-3 text-[11px] text-gray-600 text-center">
              We&apos;ll send you insights about your cognitive health. No spam.
            </p>
          </section>
        )}

        {/* Full report — only shown after email */}
        {emailSubmitted && (
          <>
            {/* CTA Section */}
            <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#111827", border: "1px solid #1F2937" }}>
              <h3
                className="text-[20px] sm:text-[24px] font-bold leading-snug text-white"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {CTA_COPY[report.severity].headline}
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-gray-400">
                {CTA_COPY[report.severity].body}
              </p>

              {/* Progress indicator */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Your screening progress</span>
                  <span className="text-[13px] font-bold" style={{ color: "#5CE0D8" }}>1 of 4</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full w-1/4" style={{ backgroundColor: "#5CE0D8" }} />
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
                  <div key={area.name} className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-4 text-center relative overflow-hidden">
                    <div className="text-gray-600">
                      <svg className="mx-auto size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div className="mt-1 text-[14px] font-bold text-gray-400">{area.name}</div>
                    <div className="mt-0.5 text-[11px] text-gray-600">{area.skill}</div>
                  </div>
                ))}
              </div>

              {/* CTA Banner */}
              <div className="mt-6 rounded-2xl px-5 py-6 text-center" style={{ background: "linear-gradient(135deg, #5CE0D8 0%, #3BB8B0 100%)" }}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#0B0F1A]/60 mb-2">
                  RecognAIze
                </p>
                <p
                  className="text-[19px] sm:text-[22px] font-bold leading-snug text-[#0B0F1A]"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Unlock your complete cognitive baseline.
                </p>
                <p className="mt-2 text-[13px] text-[#0B0F1A]/70 leading-relaxed">
                  A comprehensive cognitive health check-up.
                  <br />
                  10 minutes · Non-invasive · Science-backed
                </p>
                <div className="mt-4 inline-block rounded-full bg-[#0B0F1A] px-8 py-3 cursor-pointer hover:bg-[#1a2332] transition-colors">
                  <span className="text-[14px] font-bold text-white">Book Your Full Screening</span>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-normal text-gray-600">
                This screening is not a diagnostic tool. Results are for informational purposes only and should be discussed with a healthcare professional.
              </p>
            </section>
          </>
        )}

        {/* Retake */}
        <button
          onClick={handleRetake}
          className="w-full rounded-full border border-gray-700 py-3 text-center text-[14px] font-medium text-gray-500 transition-colors hover:border-gray-500 hover:text-gray-300"
        >
          Retake
        </button>
      </>
    ) : (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6 text-center text-sm text-gray-400">
          Complete the screening game to see your results.
        </div>
      </div>
    )
  );
}
