import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { useCumulativeCounter } from "src/hooks/useCumulativeCounter";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";
import { setAppLanguage } from "src/lib/translations";
import { resetQuestionnaire } from "src/stores/useQuestionnaireStore";

export default function DemoEntry() {
  const liveCount = useCumulativeCounter({
    anchorDate: "2026-04-01",
    baseCount: 40,
    dailyMin: 20,
    dailyMax: 45,
  });

  useEffect(() => {
    setAppLanguage("ENGLISH");
    // hookClinic stays "SJMC" so the games render in the existing light theme
    // without touching every isSjmcMode() call site. The actual lead is tagged
    // "healthtechx" by the demo-report page when the API call is made.
    setHookClinic("SJMC");
    // The game's end-of-task router uses hookReportPath. We detour through
    // the Brain Health Quiz first; /demo-questions hands off to /demo-report
    // after the final answer.
    setHookReportPath("/demo-questions");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#FAEEE6" />
        <title>Brain Health Check | HealthTechX Asia 2026</title>
        <meta property="og:title" content="Train your brain at HealthTechX Asia." />
        <meta property="og:description" content="A free Brain Health Check at the ReCOGnAIze booth — cognitive task + a short evidence-based questionnaire, instant result." />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Train your brain at HealthTechX Asia." />
        <meta name="twitter:description" content="Free Brain Health Check at the ReCOGnAIze booth." />
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
              HealthTechX Asia 2026
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-[340px] mx-auto mb-5">
          <h1
            className="text-[#1F2937] text-[36px] sm:text-[44px] leading-[1.08] font-normal"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            You build the future of health.
            <br />
            Have you tested your{" "}
            <em className="text-[#E8793B]">brain?</em>
          </h1>
          <p className="mt-4 text-[#4B5563] text-[15px] leading-relaxed">
            A 60-second cognitive task, then a short evidence-based questionnaire.
            <br />
            <span className="font-semibold text-[#1F2937]">Get your Brain Health Score on the spot.</span>
          </p>
        </div>

        {/* Live event counter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8793B] opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#E8793B]" />
          </span>
          <p className="text-[13px] text-[#4B5563]">
            <span className="font-bold text-[#1F2937]">{liveCount}</span> screened at this event
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => Router.push("/instruction")}
          className="w-full max-w-[300px] rounded-full px-8 py-4 text-[17px] font-bold text-white tracking-wide transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#E8793B", boxShadow: "0 4px 24px rgba(232,121,59,0.35)" }}
        >
          Start Brain Health Check
        </button>

        {/* Trust signals */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: "🧠", label: "Under 4 minutes" },
            { icon: "📱", label: "No app needed" },
            { icon: "📊", label: "Evidence-based" },
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
            Digital Cognitive Screening by Gray Matter Solutions
          </p>
        </div>
      </div>
    </>
  );
}
