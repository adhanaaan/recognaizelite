import Router, { useRouter } from "next/router";
import { useEffect } from "react";
import { Background } from "src/components/Layout/Background";
import { Button } from "src/NewComponents/Button";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic } from "src/utils/assessment";

export default function HookEntry() {
  const router = useRouter();
  const clinic = typeof router.query.clinic === "string" ? router.query.clinic : "";

  useEffect(() => {
    if (!router.isReady) return;
    const clinicParam = typeof router.query.clinic === "string" ? router.query.clinic.trim() : "";
    if (clinicParam) {
      setHookClinic(clinicParam);
    } else {
      setHookClinic("your clinic");
    }
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
  }, [router.isReady, router.query.clinic]);

  const handleStart = () => {
    Router.push("/instruction");
  };

  return (
    <Background className="justify-between section-padding-large">
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
          Quick Brain
          <br />
          <span className="text-[#630092]">Check</span>
        </h1>

        <p className="text-base text-gray-600 sm:text-lg max-w-md mx-auto leading-relaxed">
          Take a <strong>1-minute</strong> cognitive screening game to check your processing speed.
          It's quick, free, and completely anonymous.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>Takes about 2 minutes including tutorial</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        {clinic && (
          <p className="text-center text-sm text-gray-500">
            Provided by <strong className="text-[#002D7C]">{clinic}</strong>
          </p>
        )}
        <Button onClick={handleStart}>Start Screening</Button>
      </div>
    </Background>
  );
}
