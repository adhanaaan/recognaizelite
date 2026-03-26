import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";

export default function HookIkigaiEntry() {
  useEffect(() => {
    setHookClinic("Ikigai Medical");
    setHookReportPath("/hookikigai-report");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#0B0F1A" />
      </Head>
      <div
        className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0B0F1A 0%, #101828 50%, #0B0F1A 100%)" }}
      >
        {/* Ikigai branding */}
        <div className="text-center mb-8">
          <h2
            className="text-white text-[22px] font-light uppercase"
            style={{ letterSpacing: "0.35em", fontFamily: "'Century Gothic', CenturyGothic, AppleGothic, Futura, sans-serif" }}
          >
            Ikigai
          </h2>
          <p
            className="text-gray-400 text-[10px] uppercase mt-1.5"
            style={{ letterSpacing: "0.2em", fontFamily: "'Hero', Avenir, 'Helvetica Neue', sans-serif" }}
          >
            Medical Clinic
          </p>
        </div>

        {/* Headline */}
        <div className="text-center max-w-sm mx-auto mb-5">
          <h1
            className="text-white text-[42px] sm:text-[52px] leading-[1.1] font-normal"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Are you sleeping{" "}
            <em className="text-[#5CE0D8]">enough?</em>
          </h1>
          <p className="mt-4 text-gray-300 text-[15px] leading-relaxed">
            Your reaction time reveals what your body won&apos;t tell you.
          </p>
        </div>

        {/* Social proof / urgency strip */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="size-7 rounded-full border-2 border-[#0B0F1A]"
                style={{ backgroundColor: ["#5CE0D8", "#3BB8B0", "#2A9D8F", "#1A7A74"][i] }}
              />
            ))}
          </div>
          <p className="text-gray-500 text-[12px]">
            <span className="text-gray-300 font-semibold">2,847</span> tested this week
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => Router.push("/instruction")}
          className="w-full max-w-[280px] rounded-full bg-[#5CE0D8] px-8 py-4 text-[16px] font-bold text-[#0B0F1A] tracking-wide transition-all active:bg-[#4BC8C0] shadow-[0_0_30px_rgba(92,224,216,0.25)]"
        >
          Take the 20-Second Test
        </button>

        {/* Trust signals */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-gray-500 text-[11px]">
            <span>Free</span>
            <span className="size-1 rounded-full bg-gray-700" />
            <span>No signup</span>
            <span className="size-1 rounded-full bg-gray-700" />
            <span>Instant results</span>
          </div>
          <p className="text-gray-600 text-[10px]">
            Powered by RecognAIze
          </p>
        </div>
      </div>
    </>
  );
}
