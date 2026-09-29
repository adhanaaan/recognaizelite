import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteShell } from "src/components/LiteOne/LiteShell";
import { parkwayShentonLoadingCopy } from "src/data/parkwayShentonLoadingCopy";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import { useResultStore } from "src/stores/useResultStore";
import {
  PARKWAY_SHENTON,
  QUIZ_AGE_TO_LITE,
  fetchLiteReport,
  readAttribution,
  readLiteProfile,
  readOrCreateAttemptId,
  readStashedQuizResult,
  readStashedReport,
  readTask2Score,
  severityKey,
  stashLiteProfile,
  stashReport,
} from "src/utils/liteOne";
import type { DomainReport } from "src/types/report";

/**
 * /parkwayshenton — the Parkway Shenton copy of this /clinic-signup screen.
 *
 * The flow is /clinic-signup's: this funnel takes the name, the email and the
 * consents on its landing page, so there is no lead form after the quiz and no
 * consent screen before the result — the quiz hands straight here. See
 * PARKWAY_SHENTON in src/utils/liteOne.ts.
 *
 * That makes this the screen that finishes the lead. The landing opened the
 * row before the game with the contact details and both consents; this one
 * writes the same row again — same attempt id — with the score, the percentile
 * and the quiz, and that second write is what mails the visitor their result.
 * /lite-event-template does all of this on its results screen; the work is the
 * same, it has just moved to where the numbers now arrive.
 *
 * It is a single POST on mount, alongside the report fetch the screen already
 * made, and the ring fills for its full run either way: a save that fails must
 * not strand a visitor who has finished the assessment in front of a spinner.
 * The row it would have completed keeps the details the landing saved.
 *
 * The screen itself is Figma "09 · Loading" (node 711-6635): a progress ring,
 * the heading, and three lines that tick off as the ring fills. Its copy is
 * this funnel's own — src/data/parkwayShentonLoadingCopy.ts.
 */

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * One beat per checklist line. Every language carries the same three, so the
 * screen holds for the same time whichever one is showing.
 */
const STEP_MS = 2000;

const STEP_COUNT = 3;

/** The ring has to fill before the report page replaces this one. */
const MIN_VISIBLE_MS = STEP_MS * STEP_COUNT;

/** How long 100% and the last tick stay up before the report replaces them. */
const DONE_HOLD_MS = 600;

/** The design's orange (Primary/Orange/500) — the ring and the ticks. */
const ORANGE = "#E8784A";

/** The ring's geometry, measured off the design: 188px across, a 24px band. */
const RING_SIZE = 188;
const RING_STROKE = 24;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_LEN = 2 * Math.PI * RING_R;

/**
 * The progress ring. Starts at twelve o'clock and fills clockwise; the unfilled
 * track is the shell's own warm tint, so an empty ring still reads as a ring.
 */
function ProgressRing({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: RING_SIZE, height: RING_SIZE }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="size-full -rotate-90" aria-hidden>
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          fill="none"
          stroke="#F9DDCF"
          strokeWidth={RING_STROKE}
        />
        {percent > 0 && (
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            fill="none"
            stroke={ORANGE}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_LEN}
            strokeDashoffset={RING_LEN * (1 - percent / 100)}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
        )}
      </svg>
      <p className="absolute inset-0 flex items-center justify-center text-[32px] font-semibold leading-[1.2] tabular-nums text-charcoal">
        {percent}%
      </p>
    </div>
  );
}

/**
 * A checklist line's marker: an empty ring while it waits, the design's filled
 * tick once it's done. The tick is Iconify's lets-icons:check-fill — the icon
 * the design names — drawn inline so the screen needs no icon fetch.
 */
function StepMark({ done }: { done: boolean }) {
  return (
    <span aria-hidden className="relative block size-6 shrink-0">
      <span
        className={`absolute inset-[3px] rounded-full border-2 border-quizOutline-variant transition-opacity duration-300 ${
          done ? "opacity-0" : "opacity-100"
        }`}
      />
      <svg
        viewBox="0 0 24 24"
        className={`absolute inset-0 size-6 transition-[opacity,transform] duration-300 ease-out ${
          done ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
        style={{ color: ORANGE }}
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18m-.232-5.36l5-6l-1.536-1.28l-4.3 5.159l-2.225-2.226l-1.414 1.414l3 3l.774.774z"
        />
      </svg>
    </span>
  );
}

export default function ParkwayShentonLoading() {
  const { lang } = useLiteEventLang();
  const copy = parkwayShentonLoadingCopy(lang);
  const { result } = useResultStore();
  const quizAnswers = useQuestionnaireStore((s) => s.answers);
  const [name, setName] = React.useState("");
  /** Share of MIN_VISIBLE_MS gone by, 0 to 1. */
  const [elapsed, setElapsed] = React.useState(0);
  /** The report is fetched and the lead saved (or given up on). */
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const profile = readLiteProfile(PARKWAY_SHENTON);
    if (profile?.name) setName(profile.name);
  }, []);

  // Fill the ring against the clock. Navigation is driven by the effect below,
  // not by the end of this run.
  React.useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const share = Math.min(1, (now - start) / MIN_VISIBLE_MS);
      setElapsed(share);
      if (share < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /**
   * Completes the row the landing opened, then moves on.
   *
   * The two are one effect because the save has to wait for the report: the
   * percentile and severity in the lead row — and in the email that row
   * triggers — come out of it. The template's results screen fetched the report
   * on mount and this screen only re-used the stash; with that screen gone, the
   * fetch happens here, the save follows it, and the crumbs run their five
   * beats alongside both.
   *
   * `saved` guards the double-mount React's StrictMode does in development;
   * nothing else re-runs this.
   */
  const saved = React.useRef(false);
  React.useEffect(() => {
    if (saved.current) return;
    saved.current = true;

    let cancelled = false;
    const go = () => {
      if (!cancelled) Router.replace(`${PARKWAY_SHENTON.basePath}/report`);
    };
    // Show 100% and the last tick for a beat before the report replaces them.
    const finish = () => {
      if (cancelled) return;
      setDone(true);
      setTimeout(go, DONE_HOLD_MS);
    };

    const profile = readLiteProfile(PARKWAY_SHENTON);
    const score = readTask2Score(result);

    /**
     * Writes the run's numbers onto the row the landing opened, under the same
     * attempt id. This is the write that mails the visitor their result — the
     * landing's carried `deferEmail`.
     *
     * Skipped without a profile: a direct hit on this URL or a wiped session
     * has no row to complete, and inventing one from an empty form would write
     * a lead with no contact details.
     */
    const completeLead = async (report: DomainReport | null) => {
      if (!profile?.email) return;

      const hasQuizAnswers = Object.keys(quizAnswers).length > 0;
      const brainScore = hasQuizAnswers
        ? computeScore(quizAnswers)
        : readStashedQuizResult(PARKWAY_SHENTON);

      const quizAge = typeof quizAnswers.age === "string" ? quizAnswers.age : null;
      const ageRange = quizAge ? QUIZ_AGE_TO_LITE[quizAge] ?? null : null;
      const gender = typeof quizAnswers.sex === "string"
        ? (quizAnswers.sex === "female" ? "female" : quizAnswers.sex === "male" ? "male" : null)
        : null;
      const { utm, referrer } = readAttribution(PARKWAY_SHENTON);

      // Topped up for the report screens, which greet the visitor by name,
      // print the score, and split their copy on the raw quiz age band.
      stashLiteProfile({
        ...profile,
        ageRange: ageRange ?? "",
        gender: gender ?? "",
        score,
        quizAge,
      }, PARKWAY_SHENTON);

      try {
        await fetch("/api/save-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinic: PARKWAY_SHENTON.clinic,
            attemptId: readOrCreateAttemptId(PARKWAY_SHENTON),
            name: profile.name,
            email: profile.email,
            ageRange,
            gender,
            score,
            percentile: report ? Math.round(report.percentile) : null,
            severity: severityKey(report?.severity),
            quizAnswers: hasQuizAnswers ? quizAnswers : null,
            brainHealthScore: brainScore ? brainScore.total : null,
            riskScore: brainScore ? brainScore.riskScore : null,
            symptomScore: brainScore ? brainScore.symptomScore : null,
            band: brainScore ? brainScore.band : null,
            persona: brainScore ? brainScore.persona : null,
            // No consents on this write, where /clinic-signup re-sends its one.
            // /api/save-lead treats the three as a set: it writes all of them
            // whenever any one arrives, so re-sending only the Gray Matter tick
            // would blank the partner's — the column a PDPA request is answered
            // from — on an update that never asked about it. Leaving all three
            // out keeps exactly what the landing page recorded, whichever way
            // the two boxes were ticked.
            utm,
            referrer,
          }),
        });
      } catch {
        // Offline or blocked. The landing's row still carries the name, the
        // email and both consents; only the result is missing from it, and the
        // visitor still gets their report on screen.
      }
    };

    /**
     * The report, then the save, then the report screen once the ring has had
     * its run. Every failure path still finishes: a visitor who has completed
     * the assessment must never be left on a spinner because a write failed.
     */
    const stashed = readStashedReport(PARKWAY_SHENTON);
    const reportReady: Promise<DomainReport | null> = stashed
      ? Promise.resolve(stashed)
      : !result || Object.keys(result).length === 0
        ? Promise.resolve(null)
        : fetchLiteReport(result, PARKWAY_SHENTON)
            .then((report) => {
              stashReport(report, PARKWAY_SHENTON);
              return report;
            })
            // The report page re-fetches and shows its own error state, so a
            // failure here still saves the lead and moves the visitor on.
            .catch(() => null);

    Promise.all([reportReady.then(completeLead), delay(MIN_VISIBLE_MS)]).then(finish, finish);

    return () => {
      cancelled = true;
    };
  }, [result]);

  const heading = name ? copy.headingNamed(name) : copy.heading;
  // The clock takes the ring to 99% and ticks the first two lines; the last
  // tick and 100% wait for the work itself, so the screen never claims to be
  // finished while the save is still in flight.
  const percent = done ? 100 : Math.min(99, Math.floor(elapsed * 100));
  const stepsDone = done ? STEP_COUNT : Math.min(STEP_COUNT - 1, Math.floor(elapsed * STEP_COUNT));

  return (
    <>
      <Head>
        <title>{copy.headTitle}</title>
      </Head>

      {/* No logo band: the design gives the whole screen to the ring. */}
      <LiteShell showHeader={false}>
        <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="lite-rise">
            <ProgressRing percent={percent} label={copy.progressLabel} />
          </div>

          <h1
            className="lite-rise mt-7 max-w-[340px] font-display text-[28px] font-extrabold leading-[1.2] text-charcoal"
            style={{ animationDelay: "80ms" }}
          >
            {heading}
          </h1>

          <ul
            className="lite-rise mt-7 w-full max-w-[308px] space-y-5 text-left"
            style={{ animationDelay: "160ms" }}
          >
            {copy.steps.map((line, i) => {
              const stepDone = i < stepsDone;
              return (
                <li key={line} className="flex items-center gap-[15px]">
                  <StepMark done={stepDone} />
                  <span
                    className={`text-[15px] leading-[1.6] transition-colors duration-300 ${
                      stepDone ? "text-charcoal" : "text-charcoal/45"
                    }`}
                  >
                    {line}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </LiteShell>
    </>
  );
}
