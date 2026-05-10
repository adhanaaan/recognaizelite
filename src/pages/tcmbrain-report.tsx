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
  Low: { label: "WEAK", color: "#EF4444", softBg: "rgba(239,68,68,0.10)" },
  Medium: { label: "ADEQUATE", color: "#7AB5A7", softBg: "rgba(122,181,167,0.10)" },
  High: { label: "STRONG", color: "#34D399", softBg: "rgba(52,211,153,0.10)" },
};

// --- Bell Curve (light-themed, jade accent) ---
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
    <div className="overflow-hidden rounded-2xl p-4" style={{ backgroundColor: "#F5F9F3" }}>
      <svg className="mx-auto block w-full h-auto" viewBox={`0 0 ${BC_W} ${BC_H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={BC_W} height={BC_H} fill="#F5F9F3" rx="8" />
        <path d={buildAreaPath()} fill="rgba(122,181,167,0.12)" />
        <path d={buildCurvePath()} fill="none" stroke="#7AB5A7" strokeWidth="2.5" strokeOpacity="0.8" />
        <line x1={mx} y1={BC_P} x2={mx} y2={baseY} stroke={severity.color} strokeWidth="2" strokeDasharray="6 6" />
        <circle cx={mx} cy={my} r="6" fill="#F5F9F3" stroke={severity.color} strokeWidth="2.5" />
        <rect x={lx} y={ly} width={lw} height={lh} rx="10" fill={severity.color} />
        <text x={mx} y={ly + lh / 2 + 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#ffffff">{labelText}</text>
        <text x={BC_P} y={BC_H - 8} fill="#9CA3AF" fontSize="11" fontWeight="700" letterSpacing="1">WEAK</text>
        <text x={BC_W / 2} y={BC_H - 8} textAnchor="middle" fill="#9CA3AF" fontSize="11" fontWeight="700" letterSpacing="1">ADEQUATE</text>
        <text x={BC_W - BC_P} y={BC_H - 8} textAnchor="end" fill="#9CA3AF" fontSize="11" fontWeight="700" letterSpacing="1">STRONG</text>
      </svg>
    </div>
  );
}

const CTA_COPY: Record<Severity, { headline: string; body: string }> = {
  Low: {
    headline: "You’ve only seen 25% of the picture.",
    body: "Your processing speed flagged a concern today — but speed is one piece of cognition, and cognition is one piece of your constitution. The full screening adds memory, attention, and executive function — completing the cognitive side of your mind-body picture.",
  },
  Medium: {
    headline: "You’ve only seen 25% of the picture.",
    body: "Your processing speed looks adequate today. That’s one piece of cognition, and cognition is one piece of your constitution. The full screening reveals how memory, attention, and decision-making are holding up — the rest of the cognitive picture.",
  },
  High: {
    headline: "You’ve only seen 25% of the picture.",
    body: "Your processing speed is strong today. That’s one piece of cognition, and cognition is one piece of your constitution. The full screening rounds out the picture: memory, attention, and decision-making — to see if your edge is balanced or one-sided.",
  },
};

const LOCKED_AREAS = [
  { name: "Memory", skill: "Recall & retention under pressure" },
  { name: "Attention", skill: "Sustained focus & multitasking" },
  { name: "Executive Function", skill: "Decision-making & planning" },
];

const LEAD_EMAIL_KEY = "recognaize-lead-email";
const SHARE_URL = "https://recognaizelite.vercel.app/tcmbrain";

// TODO: Update once Shantal confirms final membership tiers, copy, and signup URL.
// Booth-conversion hook shown after the visitor's email is captured. Coral
// pill draws the eye; CTA opens AI Wellness in a new tab so the practitioner
// can walk the visitor through pricing right at the booth.
const MEMBERSHIP = {
  pillLabel: "AT THE BOOTH",
  headline: "Want the full picture?",
  body:
    "AI Wellness members get the complete cognitive assessment, your TCM constitution mapping, and a longevity protocol designed around your dampness, blood stasis, and cognitive profile.",
  perks: [
    "Full ReCOGnAIze assessment — Memory, Attention, Executive Function",
    "TCM constitution consultation",
    "Personalised longevity protocol",
    "Quarterly re-screening to track progress",
  ],
  ctaLabel: "Become a Member",
  ctaUrl: "https://www.asiaintegratedwellness.com/",
  boothNote: "Speak to the practitioner at the booth to sign up today.",
};

const AGE_OPTIONS = ["18-25", "26-35", "36-45", "46-55", "56-65", "66+"] as const;
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const SEVERITY_TO_KEY: Record<Severity, string> = {
  Low: "low",
  Medium: "moderate",
  High: "high",
};

export default function TcmBrainReportPage() {
  const { result } = useResultStore();
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [ageInput, setAgeInput] = useState<string>("");
  const [genderInput, setGenderInput] = useState<string>("");
  const [dampness, setDampness] = useState<number>(5);
  const [bloodStasis, setBloodStasis] = useState<number>(5);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shared, setShared] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = emailInput.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!ageInput) {
      setFormError("Please select your age range.");
      return;
    }
    if (!genderInput) {
      setFormError("Please select an option for gender.");
      return;
    }
    if (!Number.isInteger(dampness) || dampness < 1 || dampness > 10) {
      setFormError("Please rate your dampness index from 1 to 10.");
      return;
    }
    if (!Number.isInteger(bloodStasis) || bloodStasis < 1 || bloodStasis > 10) {
      setFormError("Please rate your blood stasis index from 1 to 10.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const task2Score = Array.isArray(result?.task2)
      ? result?.task2?.[0]?.score
      : (result as any)?.task2?.score;
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const utm = {
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
    };
    const referrer = typeof document !== "undefined" ? document.referrer || null : null;

    const payload = {
      email: trimmed,
      clinic: "tcmbrain",
      ageRange: ageInput,
      gender: genderInput,
      dampnessIndex: dampness,
      bloodStasisIndex: bloodStasis,
      score: typeof task2Score === "number" ? task2Score : null,
      percentile: report ? Math.round(report.percentile) : null,
      severity: report ? SEVERITY_TO_KEY[report.severity] : null,
      utm,
      referrer,
    };

    try {
      const res = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save. Please try again.");
      }
      localStorage.setItem(LEAD_EMAIL_KEY, trimmed);
      setEmailSubmitted(true);
    } catch (err) {
      setFormError((err as Error).message || "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
          body: JSON.stringify({ result, clinic: "tcmbrain" }),
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
    Router.push("/tcmbrain");
  };

  const page = (children: React.ReactNode) => (
    <>
    <Head>
      <meta name="theme-color" content="#F5F9F3" />
    </Head>
    <div
      className="min-h-[100dvh] w-full px-5 py-10 sm:px-8 overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #F5F9F3 0%, #DCEAD7 50%, #F5F9F3 100%)" }}
    >
      <div className="max-w-2xl mx-auto space-y-6">{children}</div>
    </div>
    </>
  );

  if (loading) {
    return page(
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6B7280] text-lg">Generating your results...</p>
      </div>
    );
  }

  if (error) {
    return page(
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-red-300 bg-red-50 p-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  const severity = report ? severityVisuals[report.severity] : null;

  return page(
    report && severity ? (
      <>
        {/* Branding */}
        <div className="text-center pt-2 pb-4">
          <img src="/logo.png" alt="ReCOGnAIze" className="mx-auto w-[60px]" />
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#9CA3AF]">
              In partnership with
            </span>
            <img src="/aiwellness-logo.jpeg" alt="AI Wellness" className="h-[24px] rounded" />
          </div>
          <p className="text-[#9CA3AF] text-[9px] uppercase mt-3" style={{ letterSpacing: "0.2em" }}>
            Mind-Body Cognitive Screening — Your Results
          </p>
        </div>

        {/* Result Card */}
        <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #D6E4D2" }}>
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            Cognitive Screening
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h2
              className="text-[24px] sm:text-[30px] font-bold uppercase leading-tight text-[#1F2937]"
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

          <div className="mt-4 relative">
            <div style={!emailSubmitted ? { filter: "blur(12px)", pointerEvents: "none" } : undefined}>
              <BellCurve percentile={Math.round(report.percentile)} severity={severity} />
            </div>
            {!emailSubmitted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-xl px-5 py-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.85)" }}>
                  <svg className="mx-auto size-5 text-[#9CA3AF] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p className="text-[13px] font-semibold text-[#4B5563]">Enter your details to reveal your score</p>
                </div>
              </div>
            )}
          </div>

          {emailSubmitted && (
            <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: "#F5F9F3" }}>
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                What is {report.title}?
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#4B5563]">
                {report.definition}
              </p>
            </div>
          )}
        </section>

        {/* Form — shown when email not yet submitted */}
        {!emailSubmitted && (
          <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #D6E4D2" }}>
            <h3
              className="text-[20px] sm:text-[24px] font-bold leading-snug text-[#1F2937] text-center"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Want to see your full results?
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#6B7280] text-center">
              Tell us a bit about you — including your TCM constitution today.
            </p>
            <form onSubmit={handleEmailSubmit} className="mt-5 space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setFormError(""); }}
                className="w-full rounded-xl border border-[#D6E4D2] bg-[#F5F9F3] px-4 py-3.5 text-[15px] text-[#1F2937] placeholder-[#9CA3AF] outline-none focus:border-[#7AB5A7] transition-colors"
              />

              {/* Age */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Age
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {AGE_OPTIONS.map((age) => {
                    const active = ageInput === age;
                    return (
                      <button
                        key={age}
                        type="button"
                        onClick={() => { setAgeInput(age); setFormError(""); }}
                        className="rounded-lg py-2 text-[13px] font-semibold transition-all"
                        style={{
                          backgroundColor: active ? "#7AB5A7" : "#F5F9F3",
                          color: active ? "#ffffff" : "#4B5563",
                          border: `1px solid ${active ? "#7AB5A7" : "#D6E4D2"}`,
                        }}
                      >
                        {age}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {GENDER_OPTIONS.map((g) => {
                    const active = genderInput === g.value;
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => { setGenderInput(g.value); setFormError(""); }}
                        className="rounded-lg py-2 text-[12px] font-semibold transition-all leading-tight"
                        style={{
                          backgroundColor: active ? "#7AB5A7" : "#F5F9F3",
                          color: active ? "#ffffff" : "#4B5563",
                          border: `1px solid ${active ? "#7AB5A7" : "#D6E4D2"}`,
                        }}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dampness Index slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Dampness index
                  </label>
                  <span className="text-[14px] font-bold text-[#7AB5A7]">{dampness} / 10</span>
                </div>
                <p className="text-[12px] text-[#9CA3AF] mb-1.5">How heavy or foggy do you feel today?</p>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={dampness}
                  onChange={(e) => { setDampness(Number(e.target.value)); setFormError(""); }}
                  className="w-full accent-[#7AB5A7]"
                />
                <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5">
                  <span>1 — minimal</span>
                  <span>10 — severe</span>
                </div>
              </div>

              {/* Blood Stasis Index slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Blood stasis index
                  </label>
                  <span className="text-[14px] font-bold text-[#7AB5A7]">{bloodStasis} / 10</span>
                </div>
                <p className="text-[12px] text-[#9CA3AF] mb-1.5">How stagnant or stuck does your circulation feel today?</p>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={bloodStasis}
                  onChange={(e) => { setBloodStasis(Number(e.target.value)); setFormError(""); }}
                  className="w-full accent-[#7AB5A7]"
                />
                <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5">
                  <span>1 — minimal</span>
                  <span>10 — severe</span>
                </div>
              </div>

              {formError && (
                <p className="text-red-500 text-[12px]">{formError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full px-8 py-4 text-[16px] font-bold tracking-wide text-white transition-all active:opacity-90 disabled:opacity-60"
                style={{
                  backgroundColor: "#7AB5A7",
                  boxShadow: "0 0 30px rgba(122,181,167,0.25)",
                }}
              >
                {submitting ? "Saving…" : "Get My Results"}
              </button>
            </form>
            <p className="mt-3 text-[11px] text-[#9CA3AF] text-center">
              We&apos;ll only contact you about ReCOGnAIze. No spam.
            </p>
          </section>
        )}

        {/* Full report */}
        {emailSubmitted && (
          <>
            <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #D6E4D2" }}>
              <h3
                className="text-[20px] sm:text-[24px] font-bold leading-snug text-[#1F2937]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {CTA_COPY[report.severity].headline}
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-[#6B7280]">
                {CTA_COPY[report.severity].body}
              </p>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Your screening progress</span>
                  <span className="text-[13px] font-bold" style={{ color: "#7AB5A7" }}>1 of 4</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#DCEAD7] overflow-hidden">
                  <div className="h-full rounded-full w-1/4" style={{ backgroundColor: "#7AB5A7" }} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border-2 px-4 py-4 text-center" style={{ borderColor: severity.color, backgroundColor: severity.softBg }}>
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: severity.color }}>
                    &#10003; Complete
                  </div>
                  <div className="mt-1 text-[14px] font-bold text-[#1F2937]">Processing Speed</div>
                  <div className="mt-0.5 text-[12px] font-semibold" style={{ color: severity.color }}>{severity.label}</div>
                </div>
                {LOCKED_AREAS.map((area) => (
                  <div key={area.name} className="rounded-xl border border-[#D6E4D2] bg-[#F5F9F3] px-4 py-4 text-center relative overflow-hidden">
                    <div className="text-[#B4C9B0]">
                      <svg className="mx-auto size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div className="mt-1 text-[14px] font-bold text-[#6B7280]">{area.name}</div>
                    <div className="mt-0.5 text-[11px] text-[#9CA3AF]">{area.skill}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Booth-conversion hook — membership CTA. Edit MEMBERSHIP constants
                at top of file once Shantal confirms final wording / signup URL. */}
            <section
              className="rounded-2xl p-5 sm:p-6 text-center"
              style={{ background: "linear-gradient(135deg, #7AB5A7 0%, #5A9582 100%)" }}
            >
              <span
                className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-3 text-white"
                style={{ backgroundColor: "rgba(232,150,113,0.95)" }}
              >
                {MEMBERSHIP.pillLabel}
              </span>
              <h3
                className="text-[20px] sm:text-[22px] font-bold leading-snug text-white"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {MEMBERSHIP.headline}
              </h3>
              <p className="mt-3 text-[13px] text-white/85 leading-relaxed">
                {MEMBERSHIP.body}
              </p>
              <ul className="mt-4 space-y-1.5 text-left max-w-sm mx-auto">
                {MEMBERSHIP.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-[13px] text-white/90">
                    <svg
                      className="size-4 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <a
                href={MEMBERSHIP.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full sm:w-auto items-center justify-center rounded-full px-8 py-3 text-[15px] font-bold tracking-wide transition-all active:scale-[0.97]"
                style={{ backgroundColor: "#ffffff", color: "#5A9582" }}
              >
                {MEMBERSHIP.ctaLabel} →
              </a>
              <p className="mt-3 text-[11px] text-white/70">
                {MEMBERSHIP.boothNote}
              </p>
            </section>

            <section className="rounded-2xl p-5 sm:p-6 text-center" style={{ backgroundColor: "#ffffff", border: "1px solid #D6E4D2" }}>
              <h3 className="text-[18px] font-bold text-[#1F2937]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Think you&apos;re fast? Prove it.
              </h3>
              <p className="mt-2 text-[13px] text-[#6B7280]">
                Challenge a friend to beat your score.
              </p>
              <button
                onClick={async () => {
                  const text = `I just took a 60-second cognitive screening as part of a mind-body health check — can you beat my score? Try it: ${SHARE_URL}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: "Brain Speed Challenge", text, url: SHARE_URL });
                      setShared(true);
                    } catch { /* cancelled */ }
                  } else {
                    await navigator.clipboard.writeText(text);
                    setShared(true);
                    setTimeout(() => setShared(false), 3000);
                  }
                }}
                className="mt-4 w-full rounded-full px-6 py-3 text-[15px] font-bold transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: shared ? "#34D399" : "#1F2937",
                  color: "#ffffff",
                }}
              >
                {shared ? "Link copied!" : "Share Challenge"}
              </button>
            </section>

            <p className="text-[11px] leading-normal text-[#9CA3AF] text-center px-2">
              This screening is not a diagnostic tool. Discuss results with your TCM practitioner or healthcare professional alongside your full constitutional reading.
            </p>
          </>
        )}

        <button
          onClick={handleRetake}
          className="w-full rounded-full border border-[#D6E4D2] py-3 text-center text-[14px] font-medium text-[#9CA3AF] transition-colors hover:border-[#7AB5A7] hover:text-[#7AB5A7]"
        >
          Retake
        </button>
      </>
    ) : (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-[#D6E4D2] bg-white p-6 text-center text-sm text-[#6B7280]">
          Complete the screening game to see your results.
        </div>
      </div>
    )
  );
}
