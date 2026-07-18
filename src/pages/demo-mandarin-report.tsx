import Head from "next/head";
import Router from "next/router";
import { useEffect, useMemo, useState } from "react";
import { DomainReport, Severity } from "src/types/report";
import { useResultStore } from "src/stores/useResultStore";
import { clearHookClinic, clearAssessmentMode } from "src/utils/assessment";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { useKioskAutoReset } from "src/hooks/useKioskAutoReset";
import {
  resetQuestionnaire,
  useQuestionnaireStore,
} from "src/stores/useQuestionnaireStore";
import {
  BANDS,
  computeScore,
} from "src/lib/brainHealthScoring";
import type { BandName, Persona } from "src/types/quiz";

const CJK_SANS = "'Noto Sans SC', sans-serif";

const CLINICAL_DISCLAIMER_ZH =
  "本报告仅用于健康筛查和教育目的。它不能诊断医学疾病，也不能替代专业的医学评估。结果应结合临床咨询、生活方式评估以及必要时的生物医学检查一并解读。";

const BAND_LABELS_ZH: Record<BandName, string> = {
  low: "低",
  moderate: "中等",
  elevated: "偏高",
  high: "高",
};

const PERSONA_LABELS_ZH: Record<Persona, string> = {
  neutral: "一般",
  highPerformer: "高效能人士",
  perimenopausal: "围绝经期",
  caregiver: "照护者",
};

const FACTOR_LABELS_ZH: Record<string, string> = {
  age: "年龄",
  hotFlushes: "荷尔蒙变化",
  familyHistory: "家族史",
  highBp: "血压",
  highCholesterol: "胆固醇",
  diabetes: "糖尿病/糖尿病前期",
  hearingLoss: "未治疗的听力损失",
  visionLoss: "未矫正的视力问题",
  smoking: "吸烟",
  sleep: "睡眠",
  exercise: "运动",
  diet: "饮食",
  alcohol: "饮酒",
};

type SeverityVisual = {
  label: string;
  color: string;
  softBg: string;
};

const severityVisuals: Record<Severity, SeverityVisual> = {
  Low: { label: "薄弱", color: "#ba1a1a", softBg: "rgba(186,26,26,0.08)" },
  Medium: { label: "尚可", color: "#f77528", softBg: "rgba(247,117,40,0.10)" },
  High: { label: "良好", color: "#97c459", softBg: "rgba(151,196,89,0.12)" },
};

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
  const baseY = BC_P + ih;
  const span = BC_RANGE.max - BC_RANGE.min;
  const p = Math.min(0.9999, Math.max(0.0001, percentile / 100));
  const z = Math.max(BC_RANGE.min, Math.min(BC_RANGE.max, inverseNormCdf(p)));
  const mx = BC_P + ((z - BC_RANGE.min) / span) * iw;
  const my = BC_P + (1 - normPdf(z) / BC_PDF_MAX) * ih;
  const labelText = `${Math.round(percentile)}%`;
  const lw = Math.max(72, labelText.length * 12 + 24), lh = 36;
  const lx = mx - lw / 2, ly = baseY + 4;

  return (
    <div className="overflow-hidden rounded-2xl bg-quizSurface-low p-4">
      <svg className="mx-auto block w-full h-auto" viewBox={`0 0 ${BC_W} ${BC_H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={BC_W} height={BC_H} fill="#fff1eb" rx="8" />
        <path d={buildAreaPath()} fill="rgba(247,117,40,0.12)" />
        <path d={buildCurvePath()} fill="none" stroke="#f77528" strokeWidth="2.5" strokeOpacity="0.8" />
        <line x1={mx} y1={BC_P} x2={mx} y2={baseY} stroke={severity.color} strokeWidth="2" strokeDasharray="6 6" />
        <circle cx={mx} cy={my} r="6" fill="#fff1eb" stroke={severity.color} strokeWidth="2.5" />
        <rect x={lx} y={ly} width={lw} height={lh} rx="10" fill={severity.color} />
        <text x={mx} y={ly + lh / 2 + 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#ffffff">{labelText}</text>
        <text x={BC_P} y={BC_H - 8} fill="#85736b" fontSize="11" fontWeight="700" letterSpacing="1">薄弱</text>
        <text x={BC_W / 2} y={BC_H - 8} textAnchor="middle" fill="#85736b" fontSize="11" fontWeight="700" letterSpacing="1">尚可</text>
        <text x={BC_W - BC_P} y={BC_H - 8} textAnchor="end" fill="#85736b" fontSize="11" fontWeight="700" letterSpacing="1">良好</text>
      </svg>
    </div>
  );
}

const CTA_COPY: Record<Severity, { headline: string; body: string }> = {
  Low: {
    headline: "您目前只看到了全貌的 25%。",
    body: "处理速度显示出值得关注的信号——但这只是四大认知支柱之一。记忆力、注意力和执行功能可能在无声地补偿或悄然衰退。没有完整筛查，您只是在猜测。",
  },
  Medium: {
    headline: "您目前只看到了全貌的 25%。",
    body: "处理速度看起来尚可——但这并不能反映您的记忆在压力下的表现、注意力持续时间或决策敏锐度。一个支柱无法定义您的大脑。",
  },
  High: {
    headline: "您目前只看到了全貌的 25%。",
    body: "处理速度表现良好——但高效能人士深知，速度离开了记忆力、专注力和决策力便不完整。完整筛查将揭示真正驱动您表现的因素。",
  },
};

const LOCKED_AREAS = [
  { name: "记忆力", skill: "压力下的回忆与记忆保持" },
  { name: "注意力", skill: "持续专注与多任务处理" },
  { name: "执行功能", skill: "决策与规划" },
];

const LEAD_EMAIL_KEY = "recognaize-lead-email";
const SHARE_URL = "https://recognaizelite.vercel.app/demo-mandarin";
const KIOSK_IDLE_MS = 90_000;

const ROLE_OPTIONS = [
  { value: "clinician", label: "临床医生" },
  { value: "executive", label: "高管" },
  { value: "investor", label: "投资人" },
  { value: "pharma", label: "制药行业" },
  { value: "vendor", label: "供应商" },
  { value: "researcher", label: "研究人员" },
  { value: "press", label: "媒体" },
  { value: "other", label: "其他" },
] as const;

const SEVERITY_TO_KEY: Record<Severity, string> = {
  Low: "low",
  Medium: "moderate",
  High: "high",
};

const DOMAIN_TITLE_ZH: Record<string, string> = {
  "Processing Speed": "处理速度",
};

const DOMAIN_DEFINITION_PREFIX_ZH: Record<string, string> = {
  "Processing Speed": "处理速度",
};

function softBg(colour: string, alpha = 0.12) {
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
    <section className="rounded-2xl bg-quizSurface-lowest border border-quizOutline-variant p-5 sm:p-6 shadow-card" style={{ fontFamily: CJK_SANS }}>
      <p className="text-[12px] font-bold uppercase tracking-wider text-quizOutline">
        您的脑健康评分
      </p>

      <div className="mt-4 flex flex-col items-center text-center">
        <span
          className="rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.15em]"
          style={{ backgroundColor: bandSoft, color: band.colour }}
        >
          {BAND_LABELS_ZH[score.band]}等级
        </span>
        <p className="mt-1.5 text-[10.5px] text-quizOutline uppercase tracking-[0.18em]">
          {emailSubmitted ? "您的总体结果" : "初步结果 · 输入详情以查看完整分析"}
        </p>
      </div>

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
                className="font-display font-extrabold leading-none"
                style={{ fontSize: 52, color: band.colour }}
              >
                {score.total}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-quizOutline mt-1">
                / {score.maxTotal}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-quizSurface-low p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-quizOutline">
                风险因素
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[22px] font-bold text-charcoal">{score.riskScore}</span>
                <span className="text-[12px] text-quizOutline">/ 68</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-quizPrimary/10">
                <div className="h-full rounded-full bg-quizPrimary" style={{ width: `${riskPct}%` }} />
              </div>
              <div className="mt-1.5 text-[11px] text-quizSecondary">
                {BAND_LABELS_ZH[score.riskBand]}风险
              </div>
            </div>
            <div className="rounded-xl bg-quizSurface-low p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-quizOutline">
                症状信号
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[22px] font-bold text-charcoal">{score.symptomScore}</span>
                <span className="text-[12px] text-quizOutline">/ 32</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-quizPrimary/10">
                <div className="h-full rounded-full bg-quizPrimary" style={{ width: `${symptomPct}%` }} />
              </div>
              <div className="mt-1.5 text-[11px] text-quizSecondary">
                {BAND_LABELS_ZH[score.symptomBand]}信号
              </div>
            </div>
          </div>
        </div>

        {!emailSubmitted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl bg-quizSurface-lowest/95 shadow-card px-5 py-3 text-center">
              <svg className="mx-auto size-5 text-quizOutline mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="text-[13px] font-semibold text-charcoal">输入您的详情以查看评分</p>
            </div>
          </div>
        )}
      </div>

      {score.drivingFactors.length > 0 && (
        <div className="mt-6">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-quizOutline">
            主要影响因素
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {score.drivingFactors.map((f) => (
              <span
                key={f.id}
                className="rounded-full bg-quizPill-bg text-quizPill-text px-3 py-1 text-[12px] font-medium"
              >
                {FACTOR_LABELS_ZH[f.id] ?? f.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {score.persona !== "neutral" && (
        <p className="mt-4 text-[12px] text-quizSecondary">
          画像：<span className="font-semibold text-charcoal">{PERSONA_LABELS_ZH[score.persona]}</span>
        </p>
      )}

      <p className="mt-5 pt-3 text-[10px] leading-relaxed text-quizOutline text-center border-t border-quizOutline-variant/60">
        基于 CAIDE · 《柳叶刀》痴呆症预防委员会报告 (2024) · SCD 文献 · IMH WiSE 研究 (2024)
      </p>
    </section>
  );
}

export default function DemoMandarinReportPage() {
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
    Router.replace("/demo-mandarin");
  };

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
      setFormError("请输入有效的电子邮件地址。");
      return;
    }
    if (!roleInput) {
      setFormError("请选择您的角色。");
      return;
    }
    const trimmedOrg = organizationInput.trim();
    if (!trimmedOrg) {
      setFormError("请输入您的组织名称。");
      return;
    }
    if (trimmedOrg.length > 200) {
      setFormError("组织名称过长。");
      return;
    }
    const trimmedInterest = cognitiveInterestInput.trim();
    if (trimmedInterest.length > COGNITIVE_INTEREST_MAX) {
      setFormError("请将您的兴趣说明控制在 1000 字以内。");
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
        throw new Error(data?.error || "保存失败，请重试。");
      }
      localStorage.setItem(LEAD_EMAIL_KEY, trimmedEmail);
      setEmailSubmitted(true);
    } catch (err) {
      setFormError((err as Error).message || "保存失败，请重试。");
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
          throw new Error(payload?.details || payload?.error || "生成报告失败");
        }
        const data = await res.json();
        setReport(data.shortReport ?? null);
      } catch (err) {
        setError((err as Error).message || "生成报告失败。");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [result]);

  const titleZh = (title: string) => DOMAIN_TITLE_ZH[title] ?? title;

  const page = (children: React.ReactNode) => (
    <>
    <Head>
      <meta name="theme-color" content="#fff4ee" />
    </Head>
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#fff4ee] via-quizSurface to-quizSurface-container px-5 py-10 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none fixed -right-20 -top-24 h-72 w-72 rounded-full bg-quizPrimary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#ffb37a]/30 blur-3xl"
      />
      <div className="relative max-w-2xl mx-auto space-y-6">{children}</div>
    </main>
    </>
  );

  if (loading) {
    return page(
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-quizSecondary text-lg" style={{ fontFamily: CJK_SANS }}>正在生成您的结果…</p>
      </div>
    );
  }

  if (error) {
    return page(
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-quizError/40 bg-quizError/5 p-8 text-center text-quizError" style={{ fontFamily: CJK_SANS }}>{error}</div>
      </div>
    );
  }

  const severity = report ? severityVisuals[report.severity] : null;

  return page(
    report && severity ? (
      <>
        <div className="text-center pt-2 pb-4">
          <img src="/logo.png" alt="ReCOGnAIze" className="mx-auto w-[60px]" />
          <p className="text-quizOutline text-[9px] font-bold uppercase mt-3" style={{ fontFamily: CJK_SANS, letterSpacing: "0.2em" }}>
            脑健康检查 — 您的结果
          </p>
        </div>

        <section className="rounded-2xl bg-quizSurface-lowest border border-quizOutline-variant p-5 sm:p-6 shadow-card" style={{ fontFamily: CJK_SANS }}>
          <p className="text-[12px] font-bold uppercase tracking-wider text-quizOutline">
            认知筛查
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[24px] sm:text-[30px] font-bold uppercase leading-tight text-charcoal">
              {titleZh(report.title)}
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

          <div className="mt-4 rounded-xl bg-quizSurface-low p-4">
            <p className="text-[13px] font-bold uppercase tracking-wider text-quizOutline">
              什么是{titleZh(report.title)}？
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-quizSecondary">
              {report.definition}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-quizSurface-lowest border border-quizOutline-variant p-5 sm:p-6 shadow-card" style={{ fontFamily: CJK_SANS }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-quizOutline">您的筛查进度</span>
            <span className="text-[13px] font-bold text-quizPrimary">4 之 1</span>
          </div>
          <div className="h-1.5 rounded-full bg-quizSurface-high overflow-hidden">
            <div className="h-full rounded-full w-1/4 bg-quizPrimary" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 px-4 py-4 text-center" style={{ borderColor: severity.color, backgroundColor: severity.softBg }}>
              <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: severity.color }}>
                &#10003; 已完成
              </div>
              <div className="mt-1 text-[14px] font-bold text-charcoal">处理速度</div>
              <div className="mt-0.5 text-[12px] font-semibold" style={{ color: severity.color }}>{severity.label}</div>
            </div>
            {LOCKED_AREAS.map((area) => (
              <div key={area.name} className="rounded-xl border border-quizOutline-variant bg-quizSurface-low px-4 py-4 text-center relative overflow-hidden">
                <div className="text-quizOutline-variant">
                  <svg className="mx-auto size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="mt-1 text-[14px] font-bold text-quizSecondary">{area.name}</div>
                <div className="mt-0.5 text-[11px] text-quizOutline">{area.skill}</div>
              </div>
            ))}
          </div>
        </section>

        {brainScore && (
          <BrainHealthScorePanel
            score={brainScore}
            emailSubmitted={emailSubmitted}
          />
        )}

        {!emailSubmitted && (
          <section className="rounded-2xl bg-quizSurface-lowest border border-quizOutline-variant p-5 sm:p-6 shadow-card" style={{ fontFamily: CJK_SANS }}>
            <h3 className="font-display text-[20px] sm:text-[24px] font-bold leading-snug text-charcoal text-center">
              想查看您的完整结果？
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-quizSecondary text-center">
              请告诉我们一些关于您的信息，以便团队跟进相关资料。
            </p>
            <form onSubmit={handleEmailSubmit} className="mt-5 space-y-3">
              <input
                type="email"
                placeholder="您的电子邮箱"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setFormError(""); }}
                className="w-full rounded-lg border border-quizOutline-variant bg-quizSurface-low px-4 py-3.5 text-[15px] text-charcoal placeholder-quizOutline outline-none focus:border-quizPrimary transition-colors"
              />

              <div>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="WhatsApp（例如 +65 9123 4567）"
                  value={whatsappInput}
                  onChange={(e) => { setWhatsappInput(e.target.value); setFormError(""); }}
                  className="w-full rounded-lg border border-quizOutline-variant bg-quizSurface-low px-4 py-3.5 text-[15px] text-charcoal placeholder-quizOutline outline-none focus:border-quizPrimary transition-colors"
                />
                <p className="mt-1 text-[11px] text-quizOutline">可选——用于后续联系。</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-quizOutline mb-1.5">
                  您的角色
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => { setRoleInput(e.target.value); setFormError(""); }}
                  className="w-full rounded-lg border border-quizOutline-variant bg-quizSurface-low px-4 py-3 text-[15px] text-charcoal outline-none focus:border-quizPrimary transition-colors appearance-none"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%2385736b' d='M6 8L0 0h12z'/></svg>\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="" disabled>请选择您的角色</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-quizOutline mb-1.5">
                  组织名称
                </label>
                <input
                  type="text"
                  placeholder="您的组织名称"
                  maxLength={200}
                  value={organizationInput}
                  onChange={(e) => { setOrganizationInput(e.target.value); setFormError(""); }}
                  className="w-full rounded-lg border border-quizOutline-variant bg-quizSurface-low px-4 py-3 text-[15px] text-charcoal placeholder-quizOutline outline-none focus:border-quizPrimary transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-quizOutline mb-1.5">
                  对认知健康的兴趣 <span className="text-quizOutline-variant font-normal normal-case tracking-normal">（可选）</span>
                </label>
                <textarea
                  placeholder="是什么让您关注认知健康？（研究、合作、为患者部署、个人兴趣等）"
                  maxLength={COGNITIVE_INTEREST_MAX}
                  rows={3}
                  value={cognitiveInterestInput}
                  onChange={(e) => { setCognitiveInterestInput(e.target.value); setFormError(""); }}
                  className="w-full rounded-lg border border-quizOutline-variant bg-quizSurface-low px-4 py-3 text-[14px] text-charcoal placeholder-quizOutline outline-none focus:border-quizPrimary transition-colors resize-none"
                />
              </div>

              {formError && (
                <p className="text-quizError text-[12px]">{formError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-quizPrimary px-8 py-4 text-[16px] font-bold tracking-wide text-quizPrimary-on shadow-card transition-all hover:brightness-105 hover:shadow-float active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? "保存中…" : "查看我的结果"}
              </button>
            </form>
            <p className="mt-3 text-[11px] text-quizOutline text-center">
              我们只会就 ReCOGnAIze 与您联系，绝不发送垃圾信息。
            </p>
          </section>
        )}

        {emailSubmitted && (
          <>
            <section className="rounded-2xl bg-quizSurface-lowest border border-quizOutline-variant p-5 sm:p-6 shadow-card" style={{ fontFamily: CJK_SANS }}>
              <h3 className="font-display text-[20px] sm:text-[24px] font-bold leading-snug text-charcoal">
                {CTA_COPY[report.severity].headline}
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-quizSecondary">
                {CTA_COPY[report.severity].body}
              </p>
            </section>

            <section className="rounded-2xl p-5 sm:p-6 text-center shadow-card" style={{ fontFamily: CJK_SANS, background: "linear-gradient(135deg, #f77528 0%, #d65f1d 100%)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/65 mb-2">
                即将推出
              </p>
              <h3 className="font-display text-[20px] sm:text-[22px] font-bold leading-snug text-white">
                完整的 ReCOGnAIze 评估即将上线。
              </h3>
              <p className="mt-3 text-[13px] text-white/85 leading-relaxed">
                4 大认知支柱 · 10 分钟 · 科学循证
                <br />
                记忆力 · 注意力 · 处理速度 · 执行功能
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] font-semibold text-white">
                  您已加入抢先体验名单
                </span>
              </div>
              <p className="mt-3 text-[11px] text-white/60">
                完整评估上线时我们会通知您。
              </p>
            </section>

            <section className="rounded-2xl bg-quizSurface-lowest border border-quizOutline-variant p-5 sm:p-6 text-center shadow-card" style={{ fontFamily: CJK_SANS }}>
              <h3 className="font-display text-[18px] font-bold text-charcoal">
                分享给他人
              </h3>
              <p className="mt-2 text-[13px] text-quizSecondary">
                将此演示分享给同事。
              </p>
              <button
                onClick={async () => {
                  const text = `我刚体验了 ReCOGnAIze 的脑健康检查——来看看：${SHARE_URL}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: "ReCOGnAIze — 脑健康检查", text, url: SHARE_URL });
                      setShared(true);
                    } catch { /* cancelled */ }
                  } else {
                    await navigator.clipboard.writeText(text);
                    setShared(true);
                    setTimeout(() => setShared(false), 3000);
                  }
                }}
                className="mt-4 w-full rounded-lg px-6 py-3 text-[15px] font-bold transition-all active:scale-[0.98] shadow-card"
                style={{
                  backgroundColor: shared ? "#97c459" : "#2d2d2d",
                  color: "#ffffff",
                }}
              >
                {shared ? "链接已复制！" : "分享演示"}
              </button>
            </section>

            <p className="text-[11px] italic leading-normal text-quizOutline text-center px-2" style={{ fontFamily: CJK_SANS }}>
              {CLINICAL_DISCLAIMER_ZH}
            </p>
          </>
        )}

        <button
          onClick={handleKioskReset}
          className="w-full rounded-lg border border-quizOutline-variant bg-quizSurface-lowest/60 py-3 text-center text-[14px] font-medium text-quizOutline transition-colors hover:border-quizPrimary hover:text-quizPrimary"
          style={{ fontFamily: CJK_SANS }}
        >
          重新开始
        </button>
      </>
    ) : (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ fontFamily: CJK_SANS }}>
        <div className="rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-6 text-center text-sm text-quizSecondary shadow-card">
          请完成筛查游戏以查看您的结果。
        </div>
      </div>
    )
  );
}
