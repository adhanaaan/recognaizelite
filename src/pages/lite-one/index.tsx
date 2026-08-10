import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { BrainOrbit } from "src/components/LiteOne/BrainOrbit";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { VitalsAnimation } from "src/components/LiteOne/VitalsAnimation";
import { setAppLanguage } from "src/lib/translations";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { resetQuestionnaire } from "src/stores/useQuestionnaireStore";
import {
  setAssessmentMode,
  setHookClinic,
  setHookEntryPath,
  setHookReportPath,
} from "src/utils/assessment";

/**
 * ReCOGnAIze Lite — entry.
 *
 * Sets hookClinic to "LiteOne" so the shared Symbol Matching components
 * render in the orange Clinical Empathy palette, and points the post-game
 * hand-off at the lead form rather than straight at the report.
 *
 * resetTaskProgress() matters: without it a visitor who already finished a
 * run lands on the celebration screen instead of the game.
 */
export default function LiteOneEntry() {
  useEffect(() => {
    setAppLanguage("ENGLISH");
    setHookClinic("LiteOne");
    setHookEntryPath("/lite-one");
    setHookReportPath("/lite-one/results");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
  }, []);

  return (
    <>
      <Head>
        <title>Track your brain in 3 minutes | ReCOGnAIze Lite</title>
        <meta
          name="description"
          content="You track your heart, your sleep, your blood sugar. This is the same idea for your brain: a 60-second test and a score you can act on."
        />
        <meta property="og:title" content="You track everything. Why not your brain?" />
        <meta
          property="og:description"
          content="A 60-second cognitive test. See how your processing speed compares to people your age."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-6">
          <div className="w-full max-w-[440px] text-center">
            <h1
              className="lite-rise font-display text-[30px] font-extrabold leading-[1.08] text-charcoal sm:text-[36px]"
              style={{ animationDelay: "40ms" }}
            >
              You track everything.
            </h1>

            <div className="mt-6">
              <VitalsAnimation />
            </div>

            <p
              className="lite-rise mt-8 font-display text-[26px] font-extrabold leading-[1.1] text-charcoal sm:text-[30px]"
              style={{ animationDelay: "520ms" }}
            >
              Why not your brain
            </p>

            <div className="lite-rise mt-1" style={{ animationDelay: "600ms" }}>
              <BrainOrbit size={200} />
            </div>

            <div className="lite-rise mx-auto mt-2 max-w-[320px]" style={{ animationDelay: "700ms" }}>
              <LiteButton onClick={() => Router.push("/lite-one/ready")}>
                Track in 3 mins
              </LiteButton>
              <p className="mt-3 text-[11.5px] text-quizOutline">
                60-second test · Nothing to install
              </p>
            </div>
          </div>
        </div>

        <footer className="relative shrink-0 pb-5 text-center">
          <p className="text-[10.5px] text-quizOutline">Digital Cognitive Screening</p>
        </footer>
      </LiteShell>
    </>
  );
}
