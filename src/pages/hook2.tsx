import Head from "next/head";
import Router, { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Background } from "src/components/Layout/Background";
import { Task2Game } from "src/components/Games/Task2Game";
import { CountDownScreen } from "src/components/Screens/CountDownScreen";
import { GameCompleteScreen } from "src/components/Screens/GameCompleteScreen";
import { Score } from "src/components/Score";
import { Button } from "src/NewComponents/Button";
import { TimeRemainingCard } from "src/NewComponents/TimeRemainingCard";
import { task2 } from "src/constants/tasks";
import { task2Levels } from "src/constants/game-levels";
import { useForceUpdate } from "src/hooks/useForceUpdate";
import { useResult } from "src/hooks/useResult";
import { resetResults, updateResult } from "src/stores/useResultStore";
import { resetTaskProgress, updateTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic } from "src/utils/assessment";
import { getTimeLap } from "src/utils/helpers";

// ---------- Game Screen (copied from symbol-matching/game.tsx) ----------

function SymbolGame() {
  const { tiles, time } = task2Levels[0];
  const res = useRef({ correct: 0, errors: 0, rounds: [] as any[] });
  const lap = useCallback(getTimeLap(), []);

  const update = useForceUpdate();
  const { result, setResult } = useResult();

  const score = Math.max(res.current.correct - res.current.errors, 0);

  const onError = () => {
    res.current.errors++;
    res.current.rounds.push({ success: "No", time: lap() });
    update();
  };

  const onSuccess = () => {
    res.current.correct++;
    res.current.rounds.push({ success: "Yes", time: lap() });
    update();
  };

  const updateTask = () => {
    setResult("success");
    updateResult("task2", { score, ...res.current });
    updateTaskProgress("task2", { currLevel: 1 });
  };

  return (
    <GameCompleteScreen result={result} color={task2.color} task="task2">
      <Task2Game tiles={tiles} onError={onError} onSuccess={onSuccess}>
        <div className="items-center justify-between w-full f">
          <Score score={score} className="text-2xl font-bold leading-6 text-task2" />
          <TimeRemainingCard time={time} callback={updateTask} showSeconds={false} />
        </div>
      </Task2Game>
    </GameCompleteScreen>
  );
}

// ---------- Landing Screen ----------

function Landing({ clinic, onStart }: { clinic: string; onStart: () => void }) {
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
          <span>Free · Anonymous · 1 minute</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        {clinic && (
          <p className="text-center text-sm text-gray-500">
            Provided by <strong className="text-[#002D7C]">{clinic}</strong>
          </p>
        )}
        <Button onClick={onStart}>Play Now — It's Free</Button>
      </div>
    </Background>
  );
}

// ---------- Main Page ----------

type Phase = "landing" | "countdown" | "game";

export default function Hook2() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("landing");
  const clinic = typeof router.query.clinic === "string" ? router.query.clinic : "";

  // Initialize assessment state on mount
  useEffect(() => {
    if (!router.isReady) return;
    const clinicParam = typeof router.query.clinic === "string" ? router.query.clinic.trim() : "";
    setHookClinic(clinicParam || "your clinic");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
  }, [router.isReady, router.query.clinic]);

  const handleStart = () => {
    setPhase("countdown");
  };

  return (
    <>
      <Head>
        <meta name="theme-color" content={task2.color} />
      </Head>

      {phase === "landing" && <Landing clinic={clinic} onStart={handleStart} />}

      {phase === "countdown" && (
        <CountDownScreen color={task2.color} backgroundColor={task2.color + "11"}>
          <SymbolGame />
        </CountDownScreen>
      )}
    </>
  );
}
