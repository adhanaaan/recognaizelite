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
        <title>ReCOGnAIze Cognitive Screening</title>
        <meta property="og:title" content="Forgetting things more often?" />
        <meta property="og:description" content="Test your brain speed in 20 seconds. Free cognitive screening — no app needed." />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Forgetting things more often?" />
        <meta name="twitter:description" content="Test your brain speed in 20 seconds. Free cognitive screening — no app needed." />
        <meta name="twitter:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
      </Head>
      <div
        className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FAEEE6 0%, #F5D4C0 50%, #FAEEE6 100%)" }}
      >
        {/* GMS branding */}
        <div className="text-center mb-2">
          <img src="/logo.png" alt="ReCOGnAIze" className="mx-auto w-[80px]" />
        </div>

        {/* Headline */}
        <div className="text-center max-w-sm mx-auto mb-5">
          <h1
            className="text-[#1F2937] text-[42px] sm:text-[52px] leading-[1.1] font-normal"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Forgetting things{" "}
            <em className="text-[#E8793B]">more often?</em>
          </h1>
          <p className="mt-4 text-[#4B5563] text-[15px] leading-relaxed">
            Test your brain speed in 20 seconds.
          </p>
        </div>

        {/* Social proof / urgency strip */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="size-7 rounded-full border-2 border-[#FAEEE6]"
                style={{ backgroundColor: ["#E8793B", "#D4693A", "#C05A35", "#A84C2E"][i] }}
              />
            ))}
          </div>
          <p className="text-[#6B7280] text-[12px]">
            <span className="text-[#1F2937] font-semibold">2,847</span> tested this week
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => Router.push("/instruction")}
          className="w-full max-w-[280px] rounded-full px-8 py-4 text-[16px] font-bold text-white tracking-wide transition-all active:opacity-90"
          style={{ backgroundColor: "#E8793B", boxShadow: "0 0 30px rgba(232,121,59,0.3)" }}
        >
          Take the 20-Second Test
        </button>

        {/* Trust signals */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-[#6B7280] text-[11px]">
            <span>Free</span>
            <span className="size-1 rounded-full bg-[#D1C4B8]" />
            <span>No signup</span>
            <span className="size-1 rounded-full bg-[#D1C4B8]" />
            <span>Instant results</span>
          </div>
          <p className="text-[#9CA3AF] text-[10px]">
            Powered by ReCOGnAIze
          </p>
        </div>
      </div>
    </>
  );
}
