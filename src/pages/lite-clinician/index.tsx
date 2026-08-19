import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { Citations, PerformanceFigures } from "src/components/LiteClinician/Citations";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { INSTITUTION, PROTOCOL, SCOPE_NOTE } from "src/data/liteClinicianContent";
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
import { LITE_CLINICIAN } from "src/utils/liteOne";

/**
 * Clinician funnel — entry.
 *
 * Same instrument as /lite-one, addressed to a different reader. The consumer
 * hero opens on a hook over video ("You tracked everything. What about your
 * brain?"), a "Get started for free" button, and a rail of press logos. None of
 * that persuades a clinician, and the press rail in particular reads as
 * marketing where a citation would read as evidence — so the video, the hook
 * and the logos are all gone, replaced by a plain statement of what the
 * instrument is and the two papers behind it.
 *
 * Its own routes and leads table (public.liteclinician_leads) keep a clinician
 * audience out of the consumer funnels' conversion numbers.
 *
 * hookClinic is "LiteClinician", which isLiteOneMode() also matches, so the
 * shared Symbol Matching components keep the same palette. hookReportPath is
 * what separates the funnels after the game.
 *
 * resetTaskProgress() matters: without it a visitor who already finished a run
 * lands on the celebration screen instead of the game.
 */
export default function ClinicianEntry() {
  useEffect(() => {
    setAppLanguage("ENGLISH");
    setHookClinic(LITE_CLINICIAN.hookClinic);
    setHookEntryPath(LITE_CLINICIAN.basePath);
    setHookReportPath(`${LITE_CLINICIAN.basePath}/game-complete`);
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
  }, []);

  const start = () => Router.push(`${LITE_CLINICIAN.basePath}/ready`);

  return (
    <>
      <Head>
        <title>Cognitive screening assessment | Recog-Lite</title>
        <meta
          name="description"
          content="A validated digital assessment of processing speed, developed and validated in the BIOCIS cohort at the Dementia Research Centre, LKCMedicine, NTU Singapore."
        />
        <meta property="og:title" content="Recog-Lite — validated digital cognitive screening" />
        <meta
          property="og:description"
          content="Published in Alzheimer's & Dementia (2026). AUC 0.85 for vascular cognitive impairment, 0.90 for MCI."
        />
        <meta property="og:type" content="website" />
      </Head>

      <LiteShell scroll className="px-5 pb-14 sm:px-8">
        <div className="relative mx-auto w-full max-w-[560px] pt-10">
          {/* Provenance first. For this reader it is the credential, not a footnote. */}
          <p
            className="lite-rise text-[11px] font-semibold uppercase tracking-[0.18em] text-quizPrimary"
            style={{ animationDelay: "20ms" }}
          >
            {INSTITUTION}
          </p>

          <h1
            className="lite-rise mt-4 font-display text-[30px] font-extrabold leading-[1.14] text-charcoal sm:text-[38px]"
            style={{ animationDelay: "80ms" }}
          >
            A validated digital measure of processing speed
          </h1>

          <p
            className="lite-rise mt-4 text-[15px] leading-relaxed text-quizSecondary"
            style={{ animationDelay: "140ms" }}
          >
            Recog-Lite is a three-minute extract of the ReCOGnAIze assessment, developed
            and validated in a Southeast Asian community cohort. Take it yourself, and
            see the data it is scored against.
          </p>

          <div className="lite-rise mt-8" style={{ animationDelay: "200ms" }}>
            <PerformanceFigures />
          </div>

          <div className="lite-rise mt-8 max-w-[340px]" style={{ animationDelay: "260ms" }}>
            <LiteButton onClick={start}>Begin the assessment</LiteButton>
          </div>

          {/* What it is, before they commit three minutes to it. */}
          <div
            className="lite-rise mt-10 rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-5 sm:p-6"
            style={{ animationDelay: "320ms" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-quizOutline">
              Protocol
            </p>
            <ol className="mt-4 space-y-4">
              {PROTOCOL.map((step, i) => (
                <li key={step.label} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 font-display text-[13px] font-extrabold tabular-nums text-quizPrimary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold leading-snug text-charcoal">
                      {step.label}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-quizSecondary">
                      {step.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <p
            className="lite-rise mt-6 text-[12.5px] leading-relaxed text-quizSecondary"
            style={{ animationDelay: "380ms" }}
          >
            {SCOPE_NOTE}
          </p>

          <div className="lite-rise mt-8" style={{ animationDelay: "440ms" }}>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-quizOutline">
              References
            </p>
            <Citations />
          </div>
        </div>
      </LiteShell>
    </>
  );
}
