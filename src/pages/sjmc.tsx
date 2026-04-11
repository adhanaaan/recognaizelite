import Head from "next/head";
import Router from "next/router";
import { useEffect, useState } from "react";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";

function useLiveCounter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Simulate realistic event-day counter based on time
    // Event starts 8am MYT (UTC+8), ramps up through the morning
    const update = () => {
      const now = new Date();
      const myt = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
      const hour = myt.getHours();
      const mins = myt.getMinutes();
      const minsSince8am = Math.max(0, (hour - 8) * 60 + mins);
      // Ramp: slow start, peaks mid-morning, tapers
      const base = 38;
      const rate = minsSince8am < 60 ? 0.5 : minsSince8am < 180 ? 1.2 : 0.6;
      const jitter = Math.floor(Math.sin(minsSince8am * 0.7) * 3);
      setCount(base + Math.floor(minsSince8am * rate) + jitter);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  return count;
}

export default function SjmcEntry() {
  const liveCount = useLiveCounter();

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
        <meta property="og:title" content="You train your body. Have you trained your brain?" />
        <meta property="og:description" content="Free 60-second brain speed test at SJMC World Health Day. No app needed — instant results." />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="You train your body. Have you trained your brain?" />
        <meta name="twitter:description" content="Free 60-second brain speed test at SJMC World Health Day." />
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
              World Health Day @ SJMC
            </span>
          </div>
        </div>

        {/* Headline — fitness angle */}
        <div className="text-center max-w-[340px] mx-auto mb-5">
          <h1
            className="text-[#1F2937] text-[36px] sm:text-[44px] leading-[1.08] font-normal"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            You train your body.
            <br />
            Have you trained your{" "}
            <em className="text-[#E8793B]">brain?</em>
          </h1>
          <p className="mt-4 text-[#4B5563] text-[15px] leading-relaxed">
            You&apos;ve checked your BMI, blood pressure, and glucose today.
            <br />
            <span className="font-semibold text-[#1F2937]">Now check the organ that runs it all.</span>
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
          Test My Brain — 60 Seconds
        </button>

        {/* Trust signals */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: "\u26A1", label: "60 seconds" },
            { icon: "\uD83D\uDCF1", label: "No app needed" },
            { icon: "\uD83D\uDCCA", label: "Instant results" },
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
