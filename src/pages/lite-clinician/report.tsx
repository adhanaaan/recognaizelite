import Head from "next/head";
import Router from "next/router";
import React from "react";
import { BellCurve, liteSeverityVisuals } from "src/components/Report/BellCurve";
import { DomainGrid } from "src/components/LiteOne/DomainGrid";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { SampleReportMock } from "src/components/LiteOne/SampleReportMock";
import { RiskFactorDropdown } from "src/components/LiteOne/RiskFactorDropdown";
import { Reveal } from "src/components/LiteOne/useInView";
import { LITE_DOMAIN_DEFINITIONS, RESEARCH_LINE } from "src/data/liteOneContent";
import { resetResults, useResultStore } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import type { DomainReport } from "src/types/report";
import {
  AGE_LABELS,
  LITE_CLINICIAN,
  clearLiteSession,
  fetchLiteReport,
  readLiteProfile,
  readStashedReport,
  readTask2Score,
} from "src/utils/liteOne";

/**
 * This funnel carries no commerce pitch.
 *
 * /lite-one closes with a "Claim 70% off" ribbon and an "Unlock Now" button
 * into a voucher page that discounts the assessment to $20. None of that
 * belongs here: the voucher page is test-only, and a consumer discount is the
 * wrong ask of a clinician regardless. The report ends on the result and the
 * evidence.
 *
 * There is deliberately no CTA in its place. The clinician next step — refer a
 * patient, offer it in practice, talk to us — hasn't been decided, and an
 * invented one would be worse than none. This is where it goes when it is.
 */
const sectionClass =
  "rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-5 shadow-card sm:p-6";

export default function ClinicianReport() {
  const { result } = useResultStore();

  const [report, setReport] = React.useState<DomainReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<{ ageRange: string } | null>(null);

  React.useEffect(() => {
    const stashedProfile = readLiteProfile(LITE_CLINICIAN);
    if (stashedProfile) {
      setProfile({ ageRange: stashedProfile.ageRange });
    }

    const stashed = readStashedReport(LITE_CLINICIAN);
    if (stashed) {
      setReport(stashed);
      setLoading(false);
      return;
    }
    if (!result || Object.keys(result).length === 0 || readTask2Score(result) === null) {
      setLoading(false);
      return;
    }
    fetchLiteReport(result, LITE_CLINICIAN)
      .then(setReport)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [result]);

  const handleRetake = () => {
    clearLiteSession(LITE_CLINICIAN);
    resetResults();
    resetTaskProgress();
    Router.replace(LITE_CLINICIAN.basePath);
  };


  const shell = (children: React.ReactNode) => (
    <>
      <Head>
        <title>Your brain speed result | Recog-Lite</title>
      </Head>
      <LiteShell scroll className="px-5 pb-16 sm:px-8">
        <div className="relative mx-auto w-full max-w-[520px] space-y-5 pt-6">{children}</div>
      </LiteShell>
    </>
  );

  if (loading) {
    return shell(
      <div className="py-24 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-[3px] border-quizOutline-variant border-t-quizPrimary" />
        <p className="mt-5 text-[14px] text-quizSecondary">Working out your result…</p>
      </div>
    );
  }

  if (error || !report) {
    return shell(
      <div className={`${sectionClass} text-center`}>
        <h1 className="font-display text-[22px] font-extrabold text-charcoal">
          We couldn&apos;t load your result
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-quizSecondary">
          {error ?? "We don't have a finished game on this device. Take the 60-second test and your score will appear here."}
        </p>
        <div className="mx-auto mt-6 max-w-[280px]">
          <LiteButton onClick={handleRetake}>Take the test</LiteButton>
        </div>
      </div>
    );
  }

  const severity = liteSeverityVisuals[report.severity];
  const percentile = Math.round(report.percentile);
  const ageLabel = profile?.ageRange ? AGE_LABELS[profile.ageRange] ?? profile.ageRange : null;
  const peerGroup = ageLabel ? `people aged ${ageLabel}` : "people in your age band";

  // Result headline — one sentence, keyed off severity rather than percentile.
  //
  // The previous two-tile grid displayed the percentile as an ordinal ("1st",
  // "42nd", "95th"). On the weak end that read as an achievement ("1st" is
  // universally best-in-context in every other place a visitor sees it), and
  // even paired with red type it took a beat to reconcile with the "Weak"
  // label. We drop the tiles and speak in plain comparisons instead.
  //
  // The weak reframe flips the subject: "most people were faster than you"
  // states the fact honestly without letting a rank number look like a rank.
  // The follow-up sentence names what the number is not (a diagnosis) and
  // hands off to the sections below that make the result actionable.
  const resultCopy =
    report.severity === "High"
      ? {
          fact: `You reacted faster than ${percentile}% of ${peerGroup}.`,
          reframe: `That puts you in the top ${Math.max(1, 100 - percentile)}% for your age band.`,
        }
      : report.severity === "Medium"
        ? {
            fact: `You reacted faster than ${percentile}% of ${peerGroup}.`,
            reframe: "That's within the typical range for your age band.",
          }
        : {
            fact: `Most ${peerGroup} reacted faster than you today.`,
            reframe:
              "Processing speed dips with poor sleep and slows with age. The risk factors below help explain today's score.",
          };

  // Overrides the shared server copy for a domain when this funnel has its own
  // wording for it (currently just Processing Speed). Falls back cleanly, so a
  // new domain the server adds later renders with whatever the server sent.
  const definition = LITE_DOMAIN_DEFINITIONS[report.title] ?? report.definition;

  return shell(
    <>
      {/* 1 — the result they earned */}
      <Reveal className={sectionClass}>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-quizOutline">
          Game result
        </p>
        <h1 className="mt-2 font-display text-[27px] font-extrabold leading-[1.12] text-charcoal sm:text-[31px]">
          Your speed is in the{" "}
          <span style={{ color: severity.color }}>{severity.label.toLowerCase()}</span> range
        </h1>

        <div className="mt-4">
          <BellCurve
            percentile={percentile}
            severity={severity}
            animate
            zonePalette={liteSeverityVisuals}
          />
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-[15px] font-semibold leading-snug text-charcoal">
            {resultCopy.fact}
          </p>
          <p className="text-[13.5px] leading-relaxed text-quizSecondary">
            {resultCopy.reframe}
          </p>
        </div>


        <div className="mt-4 rounded-xl bg-quizSurface-low p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-quizOutline">
            What is {report.title.toLowerCase()}?
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-quizSecondary">{definition}</p>
        </div>
      </Reveal>

      {/* 2 — room for improvement (moved above the risk-factors block, so the
          domain grid sits next to the game result that made it relevant) */}
      <Reveal className={sectionClass}>
        <h2 className="font-display text-[24px] font-extrabold leading-tight text-charcoal">
          There is room for improvement
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-quizSecondary">
          Speed is one of four domains. The 60-second test can&apos;t see the other three.
        </p>

        <div className="mt-4">
          <DomainGrid severity={severity} />
        </div>

      </Reveal>

      {/* 3 — brain health risk factor quiz results */}
      <Reveal>
        <RiskFactorDropdown />
      </Reveal>

      {/* 3 — what the full assessment reports. Informational, not a pitch:
          "Unlock" was the wording when this section ended in a buy button. */}
      <Reveal className={sectionClass}>
        <h2 className="text-center font-display text-[24px] font-extrabold leading-tight text-charcoal">
          What the full assessment reports
        </h2>
        <p className="mt-2 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-quizOutline">
          Sample report
        </p>

        <div className="mt-5">
          <SampleReportMock />
        </div>

        <p className="mt-6 text-center text-[13px] leading-relaxed text-quizSecondary">
          {RESEARCH_LINE}
        </p>

      </Reveal>

      {/* Retake. With no offer block and no page two, this is the report's
          only remaining action. */}
      <Reveal className="pb-4 pt-1 text-center">
        <button
          type="button"
          onClick={handleRetake}
          className="text-[13px] font-semibold text-quizSecondary underline underline-offset-4 transition-colors hover:text-charcoal"
        >
          Retake the test
        </button>
      </Reveal>
    </>
  );
}
