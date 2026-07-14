import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { useCumulativeCounter } from "src/hooks/useCumulativeCounter";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";
import { setAppLanguage } from "src/lib/translations";

export default function NoviEntry() {
  const liveCount = useCumulativeCounter({
    anchorDate: "2026-07-01",
    baseCount: 30,
    dailyMin: 15,
    dailyMax: 35,
  });

  useEffect(() => {
    setAppLanguage("ENGLISH");
    setHookClinic("Novi");
    setHookReportPath("/novi-report");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#1B2130" />
        <title>Brain Health Screening | NOVI Health</title>
        <meta property="og:title" content="Your body gets check-ups. What about your brain?" />
        <meta property="og:description" content="Free 60-second brain speed test by NOVI Health. No app needed — instant results." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Your body gets check-ups. What about your brain?" />
        <meta name="twitter:description" content="Free 60-second brain speed test by NOVI Health." />
      </Head>
      <div
        className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden relative"
        style={{ background: "linear-gradient(180deg, #1B2130 0%, #252D3F 50%, #1B2130 100%)", fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Event badge */}
        <div className="mb-5">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ backgroundColor: "rgba(235,176,45,0.15)", border: "1px solid rgba(235,176,45,0.30)" }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#EBB02D]">
              NOVI Experience
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-[340px] mx-auto mb-5">
          <h1
            className="text-white text-[36px] sm:text-[44px] leading-[1.08] font-semibold"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Your body gets check-ups.
            <br />
            What about your{" "}
            <em className="text-[#EBB02D]">brain?</em>
          </h1>
          <p className="mt-4 text-gray-400 text-[15px] leading-relaxed">
            You track your blood sugar, weight, and vitals.
            <br />
            <span className="font-semibold text-white">Now check the organ that runs it all.</span>
          </p>
        </div>

        {/* Live counter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EBB02D] opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#EBB02D]" />
          </span>
          <p className="text-[13px] text-gray-400">
            <span className="font-bold text-white">{liveCount}</span> screened so far
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => Router.push("/instruction")}
          className="w-full max-w-[300px] rounded-full px-8 py-4 text-[17px] font-bold text-[#1B2130] tracking-wide transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#EBB02D", boxShadow: "0 4px 24px rgba(235,176,45,0.30)" }}
        >
          Start the 60-second check
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
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <span className="text-[12px]">{item.icon}</span>
              <span className="text-[11px] font-medium text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom branding */}
        <div className="absolute bottom-5 left-0 right-0 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="/logo.png" alt="ReCOGnAIze" className="w-[36px] h-[36px]" />
            <span className="text-[11px] font-medium text-gray-500">ReCOGnAIze</span>
          </div>
          <p className="text-[9px] text-gray-600">
            Digital Cognitive Screening by Gray Matter Solutions
          </p>
        </div>
      </div>
    </>
  );
}
