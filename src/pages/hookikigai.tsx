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
    <div
      className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0B0F1A 0%, #101828 50%, #0B0F1A 100%)" }}
    >
      {/* Ikigai branding */}
      <div className="text-center mb-10">
        <h2
          className="text-white text-[18px] font-light"
          style={{ letterSpacing: "0.35em", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          I K I G A I
        </h2>
        <div className="w-12 h-px bg-gray-600 mx-auto mt-2 mb-1.5" />
        <p className="text-gray-400 text-[10px] uppercase" style={{ letterSpacing: "0.25em" }}>
          Wellness Clinic
        </p>
      </div>

      {/* Headline */}
      <div className="text-center max-w-sm mx-auto mb-8">
        <h1
          className="text-white text-[42px] sm:text-[52px] leading-[1.1] font-normal"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          How sharp is your{" "}
          <em className="text-[#5CE0D8]">brain?</em>
        </h1>
        <p className="mt-5 text-gray-400 text-[15px] leading-relaxed">
          Complimentary cognitive screening.
          <br />
          Takes 60 seconds.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => Router.push("/instruction")}
        className="w-full max-w-[260px] rounded-full bg-[#5CE0D8] px-8 py-4 text-[15px] font-bold text-[#0B0F1A] tracking-wide transition-all active:bg-[#4BC8C0]"
      >
        Test Your Brain
      </button>

      {/* Footer */}
      <div className="mt-8 text-center space-y-1.5">
        <p className="text-gray-500 text-[11px]">
          Free · Anonymous · No signup required
        </p>
        <p className="text-gray-600 text-[10px]">
          Powered by RecognAIze
        </p>
      </div>
    </div>
  );
}
