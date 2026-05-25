import Head from "next/head";
import Router from "next/router";
import { useEffect, useState } from "react";
import { DomainReport, Severity } from "src/types/report";
import { useResultStore } from "src/stores/useResultStore";
import { clearHookClinic, clearAssessmentMode } from "src/utils/assessment";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";

// Mandarin variant of /sjmc-report. Fork of sjmc-report.tsx with all chrome
// translated and leads tagged clinic "sjmcmandarin" (segments in public.leads
// via the clinic column). The clinical report BODY (report.title / definition)
// still comes back from /api/generate-report in English — Phase 2 will localize
// the server report_data. Disclaimer is hardcoded Mandarin here.
const CJK_SERIF = "'Noto Sans SC', Georgia, 'Times New Roman', serif";

const CLINICAL_DISCLAIMER_ZH =
  "本报告仅用于健康筛查与教育目的，不能用于诊断疾病，也不能替代专业的医疗评估。检测结果应结合临床咨询、生活方式评估，并在适当情况下结合生物医学评估共同解读。";

type SeverityVisual = {
  label: string;
  color: string;
  softBg: string;
};

const severityVisuals: Record<Severity, SeverityVisual> = {
  Low: { label: "偏弱", color: "#EF4444", softBg: "rgba(239,68,68,0.10)" },
  Medium: { label: "中等", color: "#E8793B", softBg: "rgba(232,121,59,0.10)" },
  High: { label: "优秀", color: "#34D399", softBg: "rgba(52,211,153,0.10)" },
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
        <text x={BC_P} y={BC_H - 8} fill="#9CA3AF" fontSize="11" fontWeight="700" letterSpacing="1">偏弱</text>
        <text x={BC_W / 2} y={BC_H - 8} textAnchor="middle" fill="#9CA3AF" fontSize="11" fontWeight="700" letterSpacing="1">中等</text>
        <text x={BC_W - BC_P} y={BC_H - 8} textAnchor="end" fill="#9CA3AF" fontSize="11" fontWeight="700" letterSpacing="1">优秀</text>
      </svg>
    </div>
  );
}

const CTA_COPY: Record<Severity, { headline: string; body: string }> = {
  Low: {
    headline: "你只看到了全貌的 25%。",
    body: "处理速度出现了值得关注的信号——但这只是四大认知支柱之一。记忆力、注意力和执行功能可能正在默默代偿，也可能正在悄然衰退。没有完整的筛查，一切都只是猜测。",
  },
  Medium: {
    headline: "你只看到了全貌的 25%。",
    body: "处理速度看起来不错——但这并不能说明你的记忆力在压力下表现如何、专注力能维持多久，或决策是否敏锐。单一支柱无法定义你的大脑。",
  },
  High: {
    headline: "你只看到了全貌的 25%。",
    body: "处理速度很强——但高效能人士都明白，没有记忆力、专注力和决策力的速度是不完整的。完整的筛查才能揭示真正驱动你表现的因素。",
  },
};

const LOCKED_AREAS = [
  { name: "记忆力", skill: "压力下的回忆与记忆保持" },
  { name: "注意力", skill: "持续专注与多任务处理" },
  { name: "执行功能", skill: "决策与规划" },
];

const LEAD_EMAIL_KEY = "recognaize-lead-email";
const SHARE_URL = "https://recognaizelite.vercel.app/sjmcmandarin";

const AGE_OPTIONS = ["18-25", "26-35", "36-45", "46-55", "56-65", "66+"] as const;
const GENDER_OPTIONS = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
  { value: "prefer_not_to_say", label: "不愿透露" },
] as const;

const SEVERITY_TO_KEY: Record<Severity, string> = {
  Low: "low",
  Medium: "moderate",
  High: "high",
};

export default function SjmcMandarinReportPage() {
  const { result } = useResultStore();
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [ageInput, setAgeInput] = useState<string>("");
  const [genderInput, setGenderInput] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shared, setShared] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = emailInput.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFormError("请输入有效的电子邮箱地址。");
      return;
    }
    if (!ageInput) {
      setFormError("请选择您的年龄范围。");
      return;
    }
    if (!genderInput) {
      setFormError("请选择性别选项。");
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
      clinic: "sjmcmandarin",
      ageRange: ageInput,
      gender: genderInput,
      whatsapp: whatsappInput.trim() || null,
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
        throw new Error(data?.error || "保存失败，请重试。");
      }
      localStorage.setItem(LEAD_EMAIL_KEY, trimmed);
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
          body: JSON.stringify({ result }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.details || payload?.error || "无法生成报告");
        }
        const data = await res.json();
        setReport(data.shortReport ?? null);
      } catch (err) {
        setError((err as Error).message || "无法生成报告。");
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
    Router.push("/sjmcmandarin");
  };

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
        <p className="text-[#6B7280] text-lg">正在生成您的结果……</p>
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
        {/* GMS branding */}
        <div className="text-center pt-2 pb-4">
          <img src="/logo.png" alt="ReCOGnAIze" className="mx-auto w-[60px]" />
          <p className="text-[#9CA3AF] text-[9px] uppercase mt-3" style={{ letterSpacing: "0.2em" }}>
            您的结果
          </p>
        </div>

        {/* Result Card — teaser always visible */}
        <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #E5D5CA" }}>
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            认知筛查
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h2
              className="text-[24px] sm:text-[30px] font-bold uppercase leading-tight text-[#1F2937]"
              style={{ fontFamily: CJK_SERIF }}
            >
              {report.title}
            </h2>
            <span
              className="rounded-full px-4 py-1.5 text-[13px] font-bold leading-none text-white"
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
                <div className="rounded-xl px-5 py-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.85)" }}>
                  <svg className="mx-auto size-5 text-[#9CA3AF] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p className="text-[13px] font-semibold text-[#4B5563]">输入您的电子邮箱以查看您的得分</p>
                </div>
              </div>
            )}
          </div>

          {/* Definition — only shown after email */}
          {emailSubmitted && (
            <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: "#FFF7F2" }}>
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                什么是 {report.title}？
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#4B5563]">
                {report.definition}
              </p>
            </div>
          )}
        </section>

        {/* Email capture form — shown when email not yet submitted */}
        {!emailSubmitted && (
          <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #E5D5CA" }}>
            <h3
              className="text-[20px] sm:text-[24px] font-bold leading-snug text-[#1F2937] text-center"
              style={{ fontFamily: CJK_SERIF }}
            >
              想查看完整结果吗？
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#6B7280] text-center">
              输入您的电子邮箱，解锁详细的百分位得分，了解其含义，并获取改善建议。
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
                  placeholder="WhatsApp（例如 +65 9123 4567）"
                  value={whatsappInput}
                  onChange={(e) => { setWhatsappInput(e.target.value); setFormError(""); }}
                  className="w-full rounded-xl border border-[#D1C4B8] bg-[#FFF7F2] px-4 py-3.5 text-[15px] text-[#1F2937] placeholder-[#9CA3AF] outline-none focus:border-[#E8793B] transition-colors"
                />
                <p className="mt-1 text-[11px] text-[#9CA3AF]">选填——用于后续联系。</p>
              </div>

              {/* Age range */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  年龄
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
                          backgroundColor: active ? "#E8793B" : "#FFF7F2",
                          color: active ? "#ffffff" : "#4B5563",
                          border: `1px solid ${active ? "#E8793B" : "#D1C4B8"}`,
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
                  性别
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {GENDER_OPTIONS.map((g) => {
                    const active = genderInput === g.value;
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => { setGenderInput(g.value); setFormError(""); }}
                        className="rounded-lg py-2 text-[13px] font-semibold transition-all leading-tight"
                        style={{
                          backgroundColor: active ? "#E8793B" : "#FFF7F2",
                          color: active ? "#ffffff" : "#4B5563",
                          border: `1px solid ${active ? "#E8793B" : "#D1C4B8"}`,
                        }}
                      >
                        {g.label}
                      </button>
                    );
                  })}
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
                  backgroundColor: "#E8793B",
                  boxShadow: "0 0 30px rgba(232,121,59,0.25)",
                }}
              >
                {submitting ? "保存中……" : "获取我的结果"}
              </button>
            </form>
            <p className="mt-3 text-[11px] text-[#9CA3AF] text-center">
              我们会向您发送关于认知健康的洞见。绝不发送垃圾信息。
            </p>
          </section>
        )}

        {/* Full report — only shown after email */}
        {emailSubmitted && (
          <>
            {/* The bigger picture */}
            <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #E5D5CA" }}>
              <h3
                className="text-[20px] sm:text-[24px] font-bold leading-snug text-[#1F2937]"
                style={{ fontFamily: CJK_SERIF }}
              >
                {CTA_COPY[report.severity].headline}
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-[#6B7280]">
                {CTA_COPY[report.severity].body}
              </p>

              {/* Progress indicator */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">您的筛查进度</span>
                  <span className="text-[13px] font-bold" style={{ color: "#E8793B" }}>4 项中的 1 项</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F0E0D4] overflow-hidden">
                  <div className="h-full rounded-full w-1/4" style={{ backgroundColor: "#E8793B" }} />
                </div>
              </div>

              {/* Brain areas grid */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border-2 px-4 py-4 text-center" style={{ borderColor: severity.color, backgroundColor: severity.softBg }}>
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: severity.color }}>
                    &#10003; 已完成
                  </div>
                  <div className="mt-1 text-[14px] font-bold text-[#1F2937]">处理速度</div>
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

            {/* Waitlist / Early Access CTA */}
            <section className="rounded-2xl p-5 sm:p-6 text-center" style={{ background: "linear-gradient(135deg, #E8793B 0%, #D4693A 100%)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">
                即将推出
              </p>
              <h3
                className="text-[20px] sm:text-[22px] font-bold leading-snug text-white"
                style={{ fontFamily: CJK_SERIF }}
              >
                完整版 ReCOGnAIze 评估即将上线。
              </h3>
              <p className="mt-3 text-[13px] text-white/80 leading-relaxed">
                四大认知支柱 &middot; 10 分钟 &middot; 科学验证
                <br />
                记忆力 &middot; 注意力 &middot; 处理速度 &middot; 执行功能
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] font-semibold text-white">
                  您已加入抢先体验名单
                </span>
              </div>
              <p className="mt-3 text-[11px] text-white/50">
                完整版评估上线时我们会通知您。
              </p>
            </section>

            {/* Challenge a friend */}
            <section className="rounded-2xl p-5 sm:p-6 text-center" style={{ backgroundColor: "#ffffff", border: "1px solid #E5D5CA" }}>
              <h3 className="text-[18px] font-bold text-[#1F2937]" style={{ fontFamily: CJK_SERIF }}>
                自认反应快？来证明一下。
              </h3>
              <p className="mt-2 text-[13px] text-[#6B7280]">
                挑战朋友，看谁能超越你的分数。
              </p>
              <button
                onClick={async () => {
                  const text = `我刚在 SJMC 世界健康日活动测试了我的脑速——你能超过我的分数吗？快来试试：${SHARE_URL}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: "脑速挑战", text, url: SHARE_URL });
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
                {shared ? "链接已复制！" : "分享挑战"}
              </button>
            </section>

            <p className="text-[11px] leading-normal text-[#9CA3AF] text-center px-2">
              {CLINICAL_DISCLAIMER_ZH}
            </p>
          </>
        )}

        {/* Retake */}
        <button
          onClick={handleRetake}
          className="w-full rounded-full border border-[#D1C4B8] py-3 text-center text-[14px] font-medium text-[#9CA3AF] transition-colors hover:border-[#E8793B] hover:text-[#E8793B]"
        >
          重新测试
        </button>
      </>
    ) : (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-[#E5D5CA] bg-white p-6 text-center text-sm text-[#6B7280]">
          请完成筛查游戏以查看您的结果。
        </div>
      </div>
    )
  );
}
