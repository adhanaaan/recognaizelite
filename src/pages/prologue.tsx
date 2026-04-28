import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";

export default function PrologueEntry() {
  useEffect(() => {
    setHookClinic("Prologue Clinic");
    setHookReportPath("/prologue-report");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#1A0A10" />
      </Head>
      <div
        className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1A0A10 0%, #2A1520 50%, #1A0A10 100%)" }}
      >
        {/* Prologue branding */}
        <div className="text-center mb-8">
          <h2
            className="text-white text-[20px] font-light"
            style={{ letterSpacing: "0.25em", fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            PROLOGUE
          </h2>
          <div className="w-12 h-px mx-auto mt-2 mb-1.5" style={{ backgroundColor: "#D48A9A" }} />
          <p className="text-[10px] uppercase" style={{ letterSpacing: "0.25em", color: "#D4A0AE" }}>
            The Lifestyle Medical Clinic
          </p>
        </div>

        {/* Headline */}
        <div className="text-center max-w-sm mx-auto mb-5">
          <h1
            className="text-white text-[38px] sm:text-[48px] leading-[1.1] font-normal"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Could brain fog{" "}
            <em style={{ color: "#E8A0B0" }}>be hormonal?</em>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#C0A0AA" }}>
            A quick cognitive check — right on your phone.
          </p>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="size-7 rounded-full border-2"
                style={{
                  borderColor: "#1A0A10",
                  backgroundColor: ["#E8A0B0", "#D4869A", "#C07088", "#A85A72"][i],
                }}
              />
            ))}
          </div>
          <p className="text-[12px]" style={{ color: "#8A6A74" }}>
            <span className="font-semibold" style={{ color: "#D4A0AE" }}>1,243</span> tested this week
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => Router.push("/instruction")}
          className="w-full max-w-[280px] rounded-full px-8 py-4 text-[16px] font-bold tracking-wide transition-all active:opacity-90"
          style={{
            backgroundColor: "#E8A0B0",
            color: "#1A0A10",
            boxShadow: "0 0 30px rgba(232,160,176,0.25)",
          }}
        >
          Take the 30-Second Test
        </button>

        {/* Trust signals */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-[11px]" style={{ color: "#8A6A74" }}>
            <span>Free</span>
            <span className="size-1 rounded-full" style={{ backgroundColor: "#4A3A40" }} />
            <span>No signup</span>
            <span className="size-1 rounded-full" style={{ backgroundColor: "#4A3A40" }} />
            <span>Instant results</span>
          </div>
          <p className="text-[10px]" style={{ color: "#5A4A50" }}>
            Powered by RecognAIze
          </p>
        </div>
      </div>
    </>
  );
}
