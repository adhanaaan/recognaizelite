import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { useCumulativeCounter } from "src/hooks/useCumulativeCounter";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";
import { setAppLanguage } from "src/lib/translations";

// Mandarin variant of /sjmc. Keeps hookClinic "SJMC" so the shared game renders
// the existing light/60s theme and short-assessment flow; only the language and
// the report path differ. setAppLanguage("MANDARIN") persists APP_LANG so the
// shared game/instruction screens localize via the t system, and the Mandarin
// voiceover (public/sounds/voiceover/MANDARIN/) plays. Leads are tagged
// "sjmcmandarin" by the report page.
const CJK_SERIF = "'Noto Sans SC', Georgia, 'Times New Roman', serif";

export default function SjmcMandarinEntry() {
  const liveCount = useCumulativeCounter({
    anchorDate: "2026-04-01",
    baseCount: 40,
    dailyMin: 20,
    dailyMax: 45,
  });

  useEffect(() => {
    setAppLanguage("MANDARIN");
    setHookClinic("SJMC");
    setHookReportPath("/sjmcmandarin-report");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#FAEEE6" />
        <title>脑健康筛查 | SJMC 世界健康日</title>
        <meta property="og:title" content="你常锻炼身体，那你锻炼过大脑吗？" />
        <meta property="og:description" content="SJMC 世界健康日免费 60 秒脑速测试。无需下载应用，即时出结果。" />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="你常锻炼身体，那你锻炼过大脑吗？" />
        <meta name="twitter:description" content="SJMC 世界健康日免费 60 秒脑速测试。" />
        <meta name="twitter:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
      </Head>
      <div
        className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden relative"
        style={{ background: "linear-gradient(180deg, #FAEEE6 0%, #F5D4C0 50%, #FAEEE6 100%)" }}
      >
        {/* Event badge */}
        <div className="mb-5">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ backgroundColor: "rgba(232,121,59,0.12)", border: "1px solid rgba(232,121,59,0.25)" }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8793B]">
              SJMC 世界健康日
            </span>
          </div>
        </div>

        {/* Headline — fitness angle */}
        <div className="text-center max-w-[340px] mx-auto mb-5">
          <h1
            className="text-[#1F2937] text-[34px] sm:text-[42px] leading-[1.15] font-normal"
            style={{ fontFamily: CJK_SERIF }}
          >
            你常锻炼身体，
            <br />
            那你锻炼过你的
            <em className="not-italic text-[#E8793B]">大脑</em>
            吗？
          </h1>
          <p className="mt-4 text-[#4B5563] text-[15px] leading-relaxed">
            今天你已经检查了体重指数、血压和血糖。
            <br />
            <span className="font-semibold text-[#1F2937]">现在，检查一下掌控这一切的器官。</span>
          </p>
        </div>

        {/* Live event counter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8793B] opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#E8793B]" />
          </span>
          <p className="text-[13px] text-[#4B5563]">
            已有 <span className="font-bold text-[#1F2937]">{liveCount}</span> 人在本次活动完成筛查
          </p>
        </div>

        {/* Language selector — central + prominent. Mandarin is the default;
            choosing English routes to the existing /sjmc funnel (which sets
            ENGLISH + the English report path). */}
        <div className="w-full max-w-[300px] mb-4">
          <label
            htmlFor="lang-select"
            className="block text-center text-[12px] font-semibold uppercase tracking-wider text-[#4B5563] mb-2"
          >
            选择语言 · Select language
          </label>
          <div className="relative">
            <select
              id="lang-select"
              value="MANDARIN"
              onChange={(e) => {
                if (e.target.value === "ENGLISH") Router.push("/sjmc");
              }}
              className="w-full appearance-none cursor-pointer rounded-full border px-5 py-3 pr-10 text-[16px] font-semibold text-[#1F2937] focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "rgba(232,121,59,0.35)",
                boxShadow: "0 2px 12px rgba(232,121,59,0.12)",
              }}
            >
              <option value="MANDARIN">中文</option>
              <option value="ENGLISH">English</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-[#E8793B]">
              ▼
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => Router.push("/instruction")}
          className="w-full max-w-[300px] rounded-full px-8 py-4 text-[17px] font-bold text-white tracking-wide transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#E8793B", boxShadow: "0 4px 24px rgba(232,121,59,0.35)" }}
        >
          测试我的大脑 — 60 秒
        </button>

        {/* Trust signals */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: "⚡", label: "60 秒" },
            { icon: "📱", label: "无需下载应用" },
            { icon: "📊", label: "即时结果" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <span className="text-[12px]">{item.icon}</span>
              <span className="text-[11px] font-medium text-[#4B5563]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom branding */}
        <div className="absolute bottom-5 left-0 right-0 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="/logo.png" alt="ReCOGnAIze" className="w-[22px] h-[22px]" />
            <span className="text-[11px] font-medium text-[#9CA3AF]">ReCOGnAIze</span>
          </div>
          <p className="text-[9px] text-[#B0A296]">
            由 Gray Matter Solutions 提供的数字认知筛查
          </p>
        </div>
      </div>
    </>
  );
}
