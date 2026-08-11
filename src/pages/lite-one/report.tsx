import Head from "next/head";
import Router from "next/router";
import React from "react";
import { BellCurve, severityVisuals } from "src/components/Report/BellCurve";
import { DomainGrid } from "src/components/LiteOne/DomainGrid";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { LiteModal } from "src/components/LiteOne/LiteModal";
import { OfferCard } from "src/components/LiteOne/OfferCard";
import { SampleReportMock } from "src/components/LiteOne/SampleReportMock";
import { QuoteBubbles, TestimonialRail } from "src/components/LiteOne/Testimonials";
import { RiskFactorDropdown } from "src/components/LiteOne/RiskFactorDropdown";
import { Reveal } from "src/components/LiteOne/useInView";
import { improveIconPaths } from "src/constants/improveIcons";
import { OFFER, PROOF_POINTS, RESEARCH_LINE } from "src/data/liteOneContent";
import { useCumulativeCounter } from "src/hooks/useCumulativeCounter";
import { resetResults, useResultStore } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import type { DomainReport } from "src/types/report";
import { CLINICAL_DISCLAIMER } from "src/utils/disclaimers";
import {
  AGE_LABELS,
  clearLiteSession,
  fetchLiteReport,
  readLiteProfile,
  readStashedReport,
  readTask2Score,
  ordinal,
} from "src/utils/liteOne";

const OFFER_ANCHOR = "lite-offer";

function scrollToOffer() {
  document.getElementById(OFFER_ANCHOR)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

const sectionClass =
  "rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-5 shadow-card sm:p-6";

export default function LiteOneReport() {
  const { result } = useResultStore();

  const [report, setReport] = React.useState<DomainReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [improveOpen, setImproveOpen] = React.useState(false);
  const [profile, setProfile] = React.useState<{ ageRange: string; score: number | null } | null>(
    null
  );

  const testedCountRaw = useCumulativeCounter({
    anchorDate: "2025-10-01",
    baseCount: 98_400,
    dailyMin: 40,
    dailyMax: 90,
  });
  // Rounded down to the nearest thousand — an exact live figure reads as a
  // fake-precise vanity metric on a marketing page.
  const testedCount = Math.floor(testedCountRaw / 1000) * 1000;

  React.useEffect(() => {
    const stashedProfile = readLiteProfile();
    if (stashedProfile) {
      setProfile({ ageRange: stashedProfile.ageRange, score: stashedProfile.score ?? null });
    }

    const stashed = readStashedReport();
    if (stashed) {
      setReport(stashed);
      setLoading(false);
      return;
    }
    if (!result || Object.keys(result).length === 0 || readTask2Score(result) === null) {
      setLoading(false);
      return;
    }
    fetchLiteReport(result)
      .then(setReport)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [result]);

  const handleRetake = () => {
    clearLiteSession();
    resetResults();
    resetTaskProgress();
    Router.replace("/lite-one");
  };

  const score = readTask2Score(result) ?? profile?.score ?? null;

  const shell = (children: React.ReactNode) => (
    <>
      <Head>
        <title>Your brain speed result | ReCOGnAIze Lite</title>
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

  const severity = severityVisuals[report.severity];
  const percentile = Math.round(report.percentile);
  const ageLabel = profile?.ageRange ? AGE_LABELS[profile.ageRange] ?? profile.ageRange : null;
  const peerGroup = ageLabel ? `people aged ${ageLabel}` : "people in your age band";
  const improveIcons = improveIconPaths[report.title] ?? [];

  // "Top X%" is only worth saying when it's earned. At the 1st percentile it
  // would read as "top 99%", which is true as a rank and completely misleading
  // as praise — so below the midpoint we state the percentile plainly instead.
  const strongRank = percentile >= 60;
  const rankValue = strongRank ? `Top ${Math.max(1, 100 - percentile)}%` : ordinal(percentile);
  const rankLabel = strongRank ? "Peer rank" : "Percentile";
  const rankSentence = strongRank
    ? `You're in the top ${Math.max(1, 100 - percentile)}% for processing speed among ${peerGroup}.`
    : `You scored faster than ${percentile}% of ${peerGroup}.`;

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
          <BellCurve percentile={percentile} severity={severity} animate />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-quizSurface-low p-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-quizOutline">
              Your score
            </p>
            <p className="mt-1 font-display text-[30px] font-extrabold leading-none text-charcoal">
              {score ?? "—"}
            </p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: severity.softBg }}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-quizOutline">
              {rankLabel}{ageLabel ? ` (${ageLabel})` : ""}
            </p>
            <p
              className="mt-1 font-display text-[30px] font-extrabold leading-none"
              style={{ color: severity.color }}
            >
              {rankValue}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[13.5px] leading-relaxed text-quizSecondary">{rankSentence}</p>

        <div className="mt-4 rounded-xl bg-quizSurface-low p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-quizOutline">
            What is {report.title.toLowerCase()}?
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-quizSecondary">{report.definition}</p>
        </div>
      </Reveal>

      {/* 1b — brain health risk factor quiz results */}
      <Reveal>
        <RiskFactorDropdown />
      </Reveal>

      {/* 2 — room for improvement */}
      <Reveal className={sectionClass}>
        <h2 className="font-display text-[24px] font-extrabold leading-tight text-charcoal">
          There is room for improvement
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-quizSecondary">
          Speed is one of four domains. The 60-second test can&apos;t see the other three.
        </p>

        <div className="mt-4">
          <DomainGrid
            score={score}
            severity={severity}
            onHowToImprove={() => setImproveOpen(true)}
            onUnlock={scrollToOffer}
          />
        </div>

        <button
          type="button"
          onClick={scrollToOffer}
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl bg-quizPrimary px-4 py-3 text-left transition-all hover:brightness-105 active:scale-[0.99]"
        >
          <span className="text-[13.5px] font-bold leading-snug text-white">{OFFER.ribbon}</span>
          <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold text-white">
            See offer
          </span>
        </button>
      </Reveal>

      {/* 3 — unlock the full picture */}
      <Reveal className={sectionClass}>
        <h2 className="text-center font-display text-[24px] font-extrabold leading-tight text-charcoal">
          Unlock the complete picture of your brain performance
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

      {/* 4 — why the test holds up, plus what people said */}
      <Reveal className={sectionClass}>
        <h2 className="font-display text-[24px] font-extrabold leading-tight text-charcoal">
          Why this test is worth your time
        </h2>

        <ul className="mt-4 space-y-4">
          {PROOF_POINTS.map((point) => (
            <li key={point.title} className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-quizPrimary">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span>
                <span className="block text-[14.5px] font-bold text-charcoal">{point.title}</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-quizSecondary">
                  {point.body}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <QuoteBubbles />
        </div>
      </Reveal>

      {/* 5 — the offer */}
      <Reveal delay={40}>
        <OfferCard id={OFFER_ANCHOR} />
      </Reveal>

      {/* 6 — social proof rail */}
      <Reveal className={sectionClass}>
        <h2 className="font-display text-[22px] font-extrabold leading-tight text-charcoal">
          What {testedCount.toLocaleString()}+ people say about the test
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-quizSurface-low p-3 text-center">
          <div>
            <p className="font-display text-[18px] font-extrabold text-charcoal">
              {testedCount.toLocaleString()}+
            </p>
            <p className="mt-0.5 text-[10.5px] uppercase tracking-wider text-quizOutline">Tests run</p>
          </div>
          <div>
            <p className="font-display text-[18px] font-extrabold text-charcoal">4.8/5</p>
            <p className="mt-0.5 text-[10.5px] uppercase tracking-wider text-quizOutline">Average rating</p>
          </div>
          <div>
            <p className="font-display text-[18px] font-extrabold text-charcoal">12</p>
            <p className="mt-0.5 text-[10.5px] uppercase tracking-wider text-quizOutline">Countries</p>
          </div>
        </div>

        <div className="mt-4">
          <TestimonialRail />
        </div>
      </Reveal>

      {/* footer */}
      <Reveal className="pb-4 pt-2 text-center">
        <p className="text-[11px] leading-relaxed text-quizOutline">{CLINICAL_DISCLAIMER}</p>
        <button
          type="button"
          onClick={handleRetake}
          className="mt-4 text-[13px] font-semibold text-quizSecondary underline underline-offset-4 transition-colors hover:text-charcoal"
        >
          Retake the test
        </button>
      </Reveal>

      {/* "How to improve?" popup */}
      <LiteModal
        open={improveOpen}
        onClose={() => setImproveOpen(false)}
        title={`Improving your ${report.title.toLowerCase()}`}
        subtitle="Things that fit into an ordinary day. Small and repeated beats occasional and heroic."
      >
        <ul className="space-y-3">
          {report.improve.map((tip, i) => (
            <li
              key={tip}
              className="flex items-start gap-3 rounded-xl border border-quizOutline-variant bg-quizSurface-low p-3"
            >
              {improveIcons[i] ? (
                <img src={improveIcons[i]} alt="" className="size-9 shrink-0" />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-quizPrimary/12 text-[13px] font-bold text-quizPrimary">
                  {i + 1}
                </span>
              )}
              <p className="text-[13.5px] leading-relaxed text-charcoal">{tip}</p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => {
            setImproveOpen(false);
            // Let the modal unmount before scrolling, or the restored body
            // overflow fights the smooth scroll.
            setTimeout(scrollToOffer, 60);
          }}
          className="mt-5 w-full rounded-full bg-quizPrimary px-6 py-3.5 text-[15px] font-bold text-quizPrimary-on transition-all hover:brightness-105 active:scale-[0.98]"
        >
          See the full test offer
        </button>
      </LiteModal>
    </>
  );
}
