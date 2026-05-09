import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { useCumulativeCounter } from "src/hooks/useCumulativeCounter";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";

export default function TcmBrainEntry() {
  const liveCount = useCumulativeCounter({
    anchorDate: "2026-04-01",
    baseCount: 80,
    dailyMin: 10,
    dailyMax: 25,
  });

  useEffect(() => {
    // hookClinic stays "SJMC" so the games render in the existing 60s/light theme
    // without touching every isSjmcMode() call site. The lead is tagged "tcmbrain"
    // by the report page when the API call is made.
    setHookClinic("SJMC");
    setHookReportPath("/tcmbrain-report");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#F2F7F1" />
        <title>TCM Brain Health Screening | ReCOGnAIze</title>
        <meta property="og:title" content="Your brain in 60 seconds — through a TCM lens." />
        <meta property="og:description" content="Free 60-second brain speed test. Pair your TCM constitution check with a Western cognitive screen." />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TCM Brain Health Screening" />
        <meta name="twitter:description" content="Free 60-second brain speed test, paired with your TCM indices." />
        <meta name="twitter:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
      </Head>
      <div
        className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden relative"
        style={{ background: "linear-gradient(180deg, #F2F7F1 0%, #D7E8D4 50%, #F2F7F1 100%)" }}
      >
        {/* Event badge */}
        <div className="mb-5">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ backgroundColor: "rgba(56,142,107,0.12)", border: "1px solid rgba(56,142,107,0.25)" }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#388E6B]">
              TCM × ReCOGnAIze
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-[340px] mx-auto mb-5">
          <h1
            className="text-[#1F2937] text-[36px] sm:text-[44px] leading-[1.08] font-normal"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Your TCM body type knows.
            <br />
            Does your{" "}
            <em className="text-[#388E6B]">brain?</em>
          </h1>
          <p className="mt-4 text-[#4B5563] text-[15px] leading-relaxed">
            You&apos;ve checked your dampness and blood stasis.
            <br />
            <span className="font-semibold text-[#1F2937]">Now measure the cognition that ties it all together.</span>
          </p>
        </div>

        {/* Live counter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#388E6B] opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#388E6B]" />
          </span>
          <p className="text-[13px] text-[#4B5563]">
            <span className="font-bold text-[#1F2937]">{liveCount}</span> screened so far
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => Router.push("/instruction")}
          className="w-full max-w-[300px] rounded-full px-8 py-4 text-[17px] font-bold text-white tracking-wide transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#388E6B", boxShadow: "0 4px 24px rgba(56,142,107,0.35)" }}
        >
          Test My Brain — 60 Seconds
        </button>

        {/* Trust signals */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: "⚡", label: "60 seconds" },
            { icon: "📱", label: "No app needed" },
            { icon: "📊", label: "Instant results" },
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
