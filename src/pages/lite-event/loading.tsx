import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteShell } from "src/components/LiteOne/LiteShell";
import { useResultStore } from "src/stores/useResultStore";
import {
  LITE_EVENT,
  fetchLiteReport,
  readLiteProfile,
  readStashedReport,
  stashReport,
} from "src/utils/liteOne";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Suspense crumbs, ported from b2cfunnel's AnalysingScreen
 * (`src/components/screens/AnalysingScreen.tsx`) along with its 1300ms beat.
 */
const CRUMB_MS = 1300;

const CRUMBS = [
  "Reviewing your profile of factors…",
  "Comparing with an age-matched cohort…",
  "Weighing lifestyle and biomedical factors…",
  "Cross-referencing the 2024 Lancet Commission framework…",
  "Preparing your Brain Health Score…",
] as const;

/** The crumbs have to finish before the report page replaces this one. */
const MIN_VISIBLE_MS = CRUMB_MS * CRUMBS.length;

export default function LiteEventLoading() {
  const { result } = useResultStore();
  const [name, setName] = React.useState("");
  const [crumb, setCrumb] = React.useState(0);

  React.useEffect(() => {
    const profile = readLiteProfile(LITE_EVENT);
    if (profile?.name) setName(profile.name);
  }, []);

  // Advance the crumb line, then hold on the last one — navigation is driven by
  // the effect below, not by the end of this cycle.
  React.useEffect(() => {
    if (crumb >= CRUMBS.length - 1) return;
    const timer = setTimeout(() => setCrumb((i) => i + 1), CRUMB_MS);
    return () => clearTimeout(timer);
  }, [crumb]);

  React.useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (!cancelled) Router.replace(`${LITE_EVENT.basePath}/report`);
    };

    const stashed = readStashedReport(LITE_EVENT);
    if (stashed) {
      delay(MIN_VISIBLE_MS).then(go);
      return () => {
        cancelled = true;
      };
    }

    if (!result || Object.keys(result).length === 0) {
      delay(MIN_VISIBLE_MS).then(go);
      return () => {
        cancelled = true;
      };
    }

    Promise.all([fetchLiteReport(result, LITE_EVENT), delay(MIN_VISIBLE_MS)])
      .then(([report]) => {
        if (cancelled) return;
        stashReport(report, LITE_EVENT);
        go();
      })
      // The report page re-fetches and shows its own error state, so a failure
      // here still moves the visitor on rather than stranding them.
      .catch(go);

    return () => {
      cancelled = true;
    };
  }, [result]);

  const greeting = name
    ? `${name}, we are building your profile`
    : "We are building your profile";

  return (
    <>
      <Head>
        <title>Building your profile | ReCOGnAIze</title>
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div
            className="size-14 animate-spin rounded-full border-4 border-quizSurface-high border-t-quizPrimary"
            role="status"
            aria-label="Building your profile"
          />

          <p
            className="lite-rise mt-8 max-w-[320px] font-display text-[24px] font-extrabold leading-[1.2] text-charcoal sm:text-[28px]"
            style={{ animationDelay: "80ms" }}
          >
            {greeting}
          </p>

          <p
            key={crumb}
            className="lite-crumb mt-4 min-h-[3rem] max-w-[320px] text-[14px] leading-relaxed text-quizSecondary"
          >
            {CRUMBS[crumb]}
          </p>
        </div>
      </LiteShell>
    </>
  );
}
