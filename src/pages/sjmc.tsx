import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";

export default function SjmcEntry() {
  useEffect(() => {
    setHookClinic("SJMC");
    setHookReportPath("/sjmc-report");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#FAEEE6" />
        <title>Brain Health Screening | World Health Day @ SJMC</title>
        <meta property="og:title" content="Forgetting things more often?" />
        <meta property="og:description" content="Test your brain speed in 20 seconds. Free cognitive screening at SJMC World Health Day — no app needed." />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Forgetting things more often?" />
        <meta name="twitter:description" content="Test your brain speed in 20 seconds. Free cognitive screening at SJMC World Health Day — no app needed." />
        <meta name="twitter:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
      </Head>
      <div
        className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden relative"
        style={{ background: "linear-gradient(180deg, #FAEEE6 0%, #F5D4C0 50%, #FAEEE6 100%)" }}
      >
        {/* Event badge */}
        <div className="mb-4">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ backgroundColor: "rgba(232,121,59,0.12)", border: "1px solid rgba(232,121,59,0.25)" }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8793B]">
              World Health Day @ SJMC
            </span>
          </div>
        </div>

        {/* GMS brain logo */}
        <div className="text-center mb-3">
          <img src="/logo.png" alt="ReCOGnAIze" className="mx-auto w-[70px]" />
        </div>

        {/* Headline */}
        <div className="text-center max-w-sm mx-auto mb-5">
          <h1
            className="text-[#1F2937] text-[40px] sm:text-[50px] leading-[1.05] font-normal"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Forgetting things{" "}
            <em className="text-[#E8793B]">more often?</em>
          </h1>
          <p className="mt-3 text-[#4B5563] text-[15px] leading-relaxed">
            Test your brain speed in just 20 seconds.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {[
            { icon: "\u26A1", label: "20 seconds" },
            { icon: "\uD83D\uDEE1\uFE0F", label: "No app needed" },
            { icon: "\uD83D\uDCCA", label: "Instant results" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <span className="text-[13px]">{item.icon}</span>
              <span className="text-[12px] font-medium text-[#4B5563]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => Router.push("/instruction")}
          className="w-full max-w-[300px] rounded-full px-8 py-4 text-[17px] font-bold text-white tracking-wide transition-all active:opacity-90"
          style={{ backgroundColor: "#E8793B", boxShadow: "0 4px 24px rgba(232,121,59,0.35)" }}
        >
          Start Free Screening
        </button>

        {/* Bottom branding */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-[#9CA3AF] text-[10px]">
            Digital Cognitive Screening
          </p>
          <p className="text-[#B0A296] text-[9px]">
            Powered by ReCOGnAIze &middot; Gray Matter Solutions
          </p>
        </div>
      </div>
    </>
  );
}
