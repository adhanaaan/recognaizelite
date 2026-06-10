import Head from "next/head";
import Router from "next/router";
import { useEffect, useMemo, useState } from "react";
import { DomainReport, Severity } from "src/types/report";
import { useResultStore } from "src/stores/useResultStore";
import { clearHookClinic, clearAssessmentMode } from "src/utils/assessment";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { useKioskAutoReset } from "src/hooks/useKioskAutoReset";
import { CLINICAL_DISCLAIMER } from "src/utils/disclaimers";
import {
  resetQuestionnaire,
  useQuestionnaireStore,
} from "src/stores/useQuestionnaireStore";
import {
  BANDS,
  BAND_LABELS,
  PERSONA_LABELS,
  computeScore,
} from "src/lib/brainHealthScoring";

type SeverityVisual = {
  label: "WEAK" | "ADEQUATE" | "STRONG";
  color: string;
  softBg: string;
};

const severityVisuals: Record<Severity, SeverityVisual> = {
  Low: { label: "WEAK", color: "#EF4444", softBg: "rgba(239,68,68,0.10)" },
  Medium: { label: "ADEQUATE", color: "#E8793B", softBg: "rgba(232,121,59,0.10)" },
  High: { label: "STRONG", color: "#34D399", softBg: "rgba(52,211,153,0.10)" },
};

// --- Bell Curve (light-themed) ---
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
    <div className="overflow-hidden rounded-2xl p-4" style={{ backgroundColor: "#FFF7F2" }}>
      <svg className="mx-auto block w-full h-auto" viewBox={`0 0 ${BC_W} ${BC_H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={BC_W} height={BC_H} fill="#FFF7F2" rx="8" />
        <path d={buildAreaPath()} fill="rgba(232,121,59,0.12)" />
        <path d={buildCurvePath()} fill="none" stroke="#E8793B" strokeWidth="2.5" strokeOpacity="0.8" />
        <line x1={mx} y1={BC_P} x2={mx} y2={baseY} stroke={severity.color} strokeWidth="2" strokeDasharray="6 6" />
        <circle cx={mx} cy={my} r="6" fill="#FFF7F2" stroke={severity.color} strokeWidth="2.5" />
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
    body: "Processing speed flagged a concern — but that’s just one of four cognitive pillars. Memory, attention, and executive function could be compensating or declining silently. Without the full screening, you’re guessing.",
  },
  Medium: {
    headline: "You’ve only seen 25% of the picture.",
    body: "Processing speed looks adequate — but that tells you nothing about how your memory holds under pressure, how long your focus lasts, or how sharp your decisions are. One pillar doesn’t define your brain.",
  },
  High: {
    headline: "You’ve only seen 25% of the picture.",
    body: "Processing speed is strong — but high performers know that speed without memory, focus, and decision-making is incomplete. The full screening reveals what’s really driving your performance.",
  },
};

const LOCKED_AREAS = [
  { name: "Memory", skill: "Recall & retention under pressure" },
  { name: "Attention", skill: "Sustained focus & multitasking" },
  { name: "Executive Function", skill: "Decision-making & planning" },
];

const LEAD_EMAIL_KEY = "recognaize-lead-email";
const SHARE_URL = "https://recognaizelite.vercel.app/demo";
const KIOSK_IDLE_MS = 90_000;

const ROLE_OPTIONS = [
  { value: "clinician", label: "Clinician" },
  { value: "executive", label: "Executive" },
  { value: "investor", label: "Investor" },
  { value: "pharma", label: "Pharma" },
  { value: "vendor", label: "Vendor" },
  { value: "researcher", label: "Researcher" },
  { value: "press", label: "Press" },
  { value: "other", label: "Other" },
] as const;

const SEVERITY_TO_KEY: Record<Severity, string> = {
  Low: "low",
  Medium: "moderate",
  High: "high",
};

// --- Brain Health Score panel (headline result for the questioned demo) ---

function softBg(colour: string, alpha = 0.12) {
  // Convert "#aabbcc" to "rgba(r,g,b,alpha)" for a soft band background.
  const c = colour.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function BrainHealthScorePanel({
  score,
  emailSubmitted,
}: {
  score: ReturnType<typeof computeScore>;
  emailSubmitted: boolean;
}) {
  const band = BANDS[score.band];
  const bandSoft = softBg(band.colour, 0.16);
  const riskPct = Math.min(100, Math.round((score.riskScore / 68) * 100));
  const symptomPct = Math.min(100, Math.round((score.symptomScore / 32) * 100));

  return (
    <section
      className="rounded-2xl p-5 sm:p-6"
      style={{ backgroundColor: "#ffffff", border: "1px solid #E5D5CA" }}
    >
      <p className="text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">
        Your Brain Health Score
      </p>

      {/* Always visible — gives the visitor something to chew on before the
          submit gate. Mirrors b2cfunnel's paywall pattern: band + lifestyle
          drivers stay open, the actual number and the per-axis breakdown
          stay gated. */}
      <div className="mt-4 flex flex-col items-center text-center">
        <span
          className="rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.15em]"
          style={{ backgroundColor: bandSoft, color: band.colour }}
        >
          {BAND_LABELS[score.band]} band
        </span>
        <p className="mt-1.5 text-[11px] text-[#9CA3AF] uppercase tracking-[0.18em]">
          {emailSubmitted ? "Your headline result" : "Provisional · enter details for the full breakdown"}
        </p>
      </div>

      {/* Gated section — score number + axis breakdown. */}
      <div className="mt-5 relative">
        <div style={!emailSubmitted ? { filter: "blur(12px)", pointerEvents: "none" } : undefined}>
          <div className="flex flex-col items-center">
            <div
              className="rounded-full flex flex-col items-center justify-center"
              style={{
                width: 144,
                height: 144,
                backgroundColor: bandSoft,
                border: `4px solid ${band.colour}`,
              }}
            >
              <span
                className="font-bold leading-none"
                style={{ fontSize: 48, color: band.colour, fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {score.total}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] mt-1">
                / {score.maxTotal}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: "#FFF7F2" }}>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Risk factors
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[22px] font-bold text-[#1F2937]">{score.riskScore}</span>
                <span className="text-[12px] text-[#9CA3AF]">/ 68</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(232,121,59,0.10)" }}>
                <div className="h-full rounded-full" style={{ width: `${riskPct}%`, backgroundColor: "#E8793B" }} />
              </div>
              <div className="mt-1.5 text-[11px] text-[#6B7280] capitalize">
                {BAND_LABELS[score.riskBand]} risk
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: "#FFF7F2" }}>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Symptom signal
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[22px] font-bold text-[#1F2937]">{score.symptomScore}</span>
                <span className="text-[12px] text-[#9CA3AF]">/ 32</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(232,121,59,0.10)" }}>
                <div className="h-full rounded-full" style={{ width: `${symptomPct}%`, backgroundColor: "#E8793B" }} />
              </div>
              <div className="mt-1.5 text-[11px] text-[#6B7280] capitalize">
                {BAND_LABELS[score.symptomBand]} signal
              </div>
            </div>
          </div>
        </div>

        {!emailSubmitted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl px-5 py-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.92)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <svg className="mx-auto size-5 text-[#9CA3AF] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="text-[13px] font-semibold text-[#4B5563]">Enter your details to see your number</p>
            </div>
          </div>
        )}
      </div>

      {/* Always visible — what's behind the band. Driving factors are
          lifestyle/biomedical only (the engine never surfaces symptoms
          here); persona surfaces when we have signal. */}
      {score.drivingFactors.length > 0 && (
        <div className="mt-6">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            What&apos;s driving this
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {score.drivingFactors.map((f) => (
              <span
                key={f.id}
                className="rounded-full px-3 py-1 text-[12px] font-medium"
                style={{ backgroundColor: "rgba(232,121,59,0.10)", color: "#C25D27" }}
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {score.persona !== "neutral" && (
        <p className="mt-4 text-[12px] text-[#6B7280]">
          Profile: <span className="font-semibold text-[#1F2937]">{PERSONA_LABELS[score.persona]}</span>
        </p>
      )}

      <p className="mt-5 pt-3 text-[10px] leading-relaxed text-[#9CA3AF] text-center border-t border-[#F0E0D4]">
        Anchored to CAIDE · Lancet Commission on Dementia Prevention (2024) · SCD literature · IMH WiSE Study (2024)
      </p>
    </section>
  );
}

export default function DemoReportPage() {
  const { result } = useResultStore();
  const quizAnswers = useQuestionnaireStore((s) => s.answers);
  const hasQuizAnswers = Object.keys(quizAnswers).length > 0;
  const brainScore = useMemo(
    () => (hasQuizAnswers ? computeScore(quizAnswers) : null),
    [quizAnswers, hasQuizAnswers]
  );
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [roleInput, setRoleInput] = useState<string>("");
  const [organizationInput, setOrganizationInput] = useState<string>("");
  const [cognitiveInterestInput, setCognitiveInterestInput] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shared, setShared] = useState(false);

  const COGNITIVE_INTEREST_MAX = 1000;

  const handleKioskReset = () => {
    clearHookClinic();
    clearAssessmentMode();
    resetResults();
    resetTaskProgress();
    resetQuestionnaire();
    Router.replace("/demo");
  };

  // Auto-reset kiosk after idle. Pause while a submit is in-flight so we
  // don't yank the page mid-POST.
  useKioskAutoReset({
    idleMs: KIOSK_IDLE_MS,
    onIdle: handleKioskReset,
    paused: submitting,
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!roleInput) {
      setFormError("Please select your role.");
      return;
    }
    const trimmedOrg = organizationInput.trim();
    if (!trimmedOrg) {
      setFormError("Please enter your organization.");
      return;
    }
    if (trimmedOrg.length > 200) {
      setFormError("Organization name is too long.");
      return;
    }
    const trimmedInterest = cognitiveInterestInput.trim();
    if (trimmedInterest.length > COGNITIVE_INTEREST_MAX) {
      setFormError("Please keep your interest note under 1000 characters.");
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
      email: trimmedEmail,
      clinic: "healthtechx",
      role: roleInput,
      organization: trimmedOrg,
      whatsapp: whatsappInput.trim() || null,
      cognitiveInterest: trimmedInterest || null,
      score: typeof task2Score === "number" ? task2Score : null,
      percentile: report ? Math.round(report.percentile) : null,
      severity: report ? SEVERITY_TO_KEY[report.severity] : null,
      // Brain Health Quiz signals (added with /demo-questions). Stored as
      // a JSONB blob on demo_leads so the schema stays stable as the
      // question bank evolves; alongside denormalised columns for the
      // computed score, the per-axis breakdown, band, and persona to
      // make lead-dashboard filtering easy.
      quizAnswers: hasQuizAnswers ? quizAnswers : null,
      brainHealthScore: brainScore ? brainScore.total : null,
      riskScore: brainScore ? brainScore.riskScore : null,
      symptomScore: brainScore ? brainScore.symptomScore : null,
      band: brainScore ? brainScore.band : null,
      persona: brainScore ? brainScore.persona : null,
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
      localStorage.setItem(LEAD_EMAIL_KEY, trimmedEmail);
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
          body: JSON.stringify({ result, clinic: "healthtechx" }),
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

  const page = (children: React.ReactNode) => (
    <>
    <Head>
      <meta name="theme-color" content="#FAEEE6" />
    </Head>
    <div
      className="min-h-[100dvh] w-full px-5 py-10 sm:px-8 overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #FAEEE6 0%, #F5D4C0 50%, #FAEEE6 100%)" }}
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
          <p className="text-[#9CA3AF] text-[9px] uppercase mt-3" style={{ letterSpacing: "0.2em" }}>
            HealthTechX Asia 2026 — Your Results
          </p>
        </div>

        {/* Brain Health Score — the new headline panel. Only rendered when
            the user actually completed the Brain Health Quiz; legacy direct
            hits to /demo-report (without quiz answers in store) fall through
            to the existing cognitive panel below. */}
        {brainScore && (
          <BrainHealthScorePanel
            score={brainScore}
            emailSubmitted={emailSubmitted}
          />
        )}

        {/* Result Card */}
        <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #E5D5CA" }}>
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
            <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: "#FFF7F2" }}>
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                What is {report.title}?
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#4B5563]">
                {report.definition}
              </p>
            </div>
          )}
        </section>

        {/* B2B qualifier form — shown when email not yet submitted */}
        {!emailSubmitted && (
          <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #E5D5CA" }}>
            <h3
              className="text-[20px] sm:text-[24px] font-bold leading-snug text-[#1F2937] text-center"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Want to see your full results?
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#6B7280] text-center">
              Tell us a bit about you so the team can follow up with relevant info.
            </p>
            <form onSubmit={handleEmailSubmit} className="mt-5 space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setFormError(""); }}
                className="w-full rounded-xl border border-[#D1C4B8] bg-[#FFF7F2] px-4 py-3.5 text-[15px] text-[#1F2937] placeholder-[#9CA3AF] outline-none focus:border-[#E8793B] transition-colors"
              />

              <div>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="WhatsApp (e.g. +65 9123 4567)"
                  value={whatsappInput}
                  onChange={(e) => { setWhatsappInput(e.target.value); setFormError(""); }}
                  className="w-full rounded-xl border border-[#D1C4B8] bg-[#FFF7F2] px-4 py-3.5 text-[15px] text-[#1F2937] placeholder-[#9CA3AF] outline-none focus:border-[#E8793B] transition-colors"
                />
                <p className="mt-1 text-[11px] text-[#9CA3AF]">Optional — for follow-up.</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Your role
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => { setRoleInput(e.target.value); setFormError(""); }}
                  className="w-full rounded-xl border border-[#D1C4B8] bg-[#FFF7F2] px-4 py-3 text-[15px] text-[#1F2937] outline-none focus:border-[#E8793B] transition-colors appearance-none"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239CA3AF' d='M6 8L0 0h12z'/></svg>\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="" disabled>Select your role</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="Your organization name"
                  maxLength={200}
                  value={organizationInput}
                  onChange={(e) => { setOrganizationInput(e.target.value); setFormError(""); }}
                  className="w-full rounded-xl border border-[#D1C4B8] bg-[#FFF7F2] px-4 py-3 text-[15px] text-[#1F2937] placeholder-[#9CA3AF] outline-none focus:border-[#E8793B] transition-colors"
                />
              </div>

              {/* Cognitive health interest (optional, free text) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Interest in cognitive health <span className="text-[#C4B5A8] font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="What draws you to cognitive health? (research, partnership, deploying for patients, personal, etc.)"
                  maxLength={COGNITIVE_INTEREST_MAX}
                  rows={3}
                  value={cognitiveInterestInput}
                  onChange={(e) => { setCognitiveInterestInput(e.target.value); setFormError(""); }}
                  className="w-full rounded-xl border border-[#D1C4B8] bg-[#FFF7F2] px-4 py-3 text-[14px] text-[#1F2937] placeholder-[#9CA3AF] outline-none focus:border-[#E8793B] transition-colors resize-none"
                />
              </div>

              {formError && (
                <p className="text-red-500 text-[12px]">{formError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full px-8 py-4 text-[16px] font-bold tracking-wide text-white transition-all active:opacity-90 disabled:opacity-60"
                style={{
                  backgroundColor: "#E8793B",
                  boxShadow: "0 0 30px rgba(232,121,59,0.25)",
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

        {/* Full report — only shown after email */}
        {emailSubmitted && (
          <>
            <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #E5D5CA" }}>
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
                  <span className="text-[13px] font-bold" style={{ color: "#E8793B" }}>1 of 4</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F0E0D4] overflow-hidden">
                  <div className="h-full rounded-full w-1/4" style={{ backgroundColor: "#E8793B" }} />
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
                  <div key={area.name} className="rounded-xl border border-[#E5D5CA] bg-[#FFF7F2] px-4 py-4 text-center relative overflow-hidden">
                    <div className="text-[#C4B5A8]">
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

            <section className="rounded-2xl p-5 sm:p-6 text-center" style={{ background: "linear-gradient(135deg, #E8793B 0%, #D4693A 100%)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">
                Coming Soon
              </p>
              <h3
                className="text-[20px] sm:text-[22px] font-bold leading-snug text-white"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                The full ReCOGnAIze assessment is launching soon.
              </h3>
              <p className="mt-3 text-[13px] text-white/80 leading-relaxed">
                4 cognitive pillars &middot; 10 minutes &middot; Science-backed
                <br />
                Memory &middot; Attention &middot; Processing Speed &middot; Executive Function
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] font-semibold text-white">
                  You&apos;re on the early access list
                </span>
              </div>
              <p className="mt-3 text-[11px] text-white/50">
                We&apos;ll notify you when the full assessment launches.
              </p>
            </section>

            <section className="rounded-2xl p-5 sm:p-6 text-center" style={{ backgroundColor: "#ffffff", border: "1px solid #E5D5CA" }}>
              <h3 className="text-[18px] font-bold text-[#1F2937]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Think you&apos;re fast? Prove it.
              </h3>
              <p className="mt-2 text-[13px] text-[#6B7280]">
                Challenge a colleague to beat your score.
              </p>
              <button
                onClick={async () => {
                  const text = `I just tested my brain speed at the ReCOGnAIze booth at HealthTechX Asia — can you beat my score? Try it: ${SHARE_URL}`;
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

            <p className="text-[11px] italic leading-normal text-[#9CA3AF] text-center px-2">
              {CLINICAL_DISCLAIMER}
            </p>
          </>
        )}

        {/* Manual reset for booth staff */}
        <button
          onClick={handleKioskReset}
          className="w-full rounded-full border border-[#D1C4B8] py-3 text-center text-[14px] font-medium text-[#9CA3AF] transition-colors hover:border-[#E8793B] hover:text-[#E8793B]"
        >
          Start over
        </button>
      </>
    ) : (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-[#E5D5CA] bg-white p-6 text-center text-sm text-[#6B7280]">
          Complete the screening game to see your results.
        </div>
      </div>
    )
  );
}
