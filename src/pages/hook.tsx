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
          How Sharp Is
          <br />
          <span className="text-[#630092]">Your Brain?</span>
        </h1>

        <p className="text-base text-gray-600 sm:text-lg max-w-md mx-auto leading-relaxed">
          Cognitive changes can be subtle — and start earlier than most people think.
          This <strong>1-minute game</strong> checks your processing speed and compares it to your age group.
        </p>

        <div className="text-left max-w-xs mx-auto">
          <p className="text-sm font-semibold text-[#002D7C]">Worth checking if you've noticed:</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-500">
            <li>• Feeling mentally slower or more fatigued</li>
            <li>• Difficulty concentrating or staying focused</li>
            <li>• Taking longer to process new information</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>Free · Anonymous · 2 minutes</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        {clinic && (
          <p className="text-center text-sm text-gray-500">
            Provided by <strong className="text-[#002D7C]">{clinic}</strong>
          </p>
        )}
        <Button onClick={handleStart}>Play Now — It's Free</Button>
      </div>
    </Background>
  );
}
