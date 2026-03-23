import Router from "next/router";
import { useEffect } from "react";
import { Background } from "src/components/Layout/Background";
import { Button } from "src/NewComponents/Button";
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

  const handleStart = () => {
    Router.push("/instruction");
  };

  return (
    <Background className="justify-center gap-10 section-padding-large">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Gray Matter Logo" className="size-12 sm:size-14" />
          <div>
            <div className="text-lg font-bold text-[#002D7C] sm:text-xl">Gray Matter Solutions</div>
            <div className="text-xs text-gray-500">A spin-off from NTU, Singapore</div>
          </div>
        </div>
      </div>

      <div className="w-full text-center space-y-5">
        <h1 className="text-3xl font-bold text-[#002D7C] sm:text-4xl leading-tight">
          Still Sharp Enough
          <br />
          <span className="text-[#630092]">Under Pressure?</span>
        </h1>

        <p className="text-base text-gray-600 sm:text-lg max-w-md mx-auto leading-relaxed">
          You're in back-to-back meetings. Making fast calls all day.
          But lately — <strong>something feels off</strong>.
          This 1-minute game measures how fast your brain actually processes information.
        </p>

        <div className="text-left max-w-xs mx-auto">
          <p className="text-sm font-semibold text-[#002D7C]">Sound familiar?</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-500">
            <li>• Slower to react in conversations or decisions</li>
            <li>• Mental fog that kicks in by 3pm</li>
            <li>• Reading the same paragraph twice</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>Free · Anonymous · 1 minute</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        <p className="text-center text-sm text-gray-500">
          Provided by <strong className="text-[#002D7C]">Ikigai Medical</strong>
        </p>
        <Button onClick={handleStart}>Find Out In 60 Seconds</Button>
      </div>
    </Background>
  );
}
