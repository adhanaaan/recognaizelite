import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteShell } from "src/components/LiteOne/LiteShell";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import { useResultStore } from "src/stores/useResultStore";
import {
  NTU_HOMECOMING,
  fetchLiteReport,
  readLiteProfile,
  readStashedReport,
  stashReport,
} from "src/utils/liteOne";

/**
 * /lite-event/ntuhomecoming — the NTU Homecoming copy of this /lite-event-template screen.
 *
 * The event link for NTU Homecoming: /lite-event-template taken page for page,
 * the report's CTA trial included, so a guest sees exactly what the template
 * shows. Nothing here diverges; what is this event's alone is the campaign its
 * rows carry. See NTU_HOMECOMING in src/utils/liteOne.ts.
 */

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Suspense crumbs, ported from b2cfunnel's AnalysingScreen
 * (`src/components/screens/AnalysingScreen.tsx`) along with its 1300ms beat.
 * The lines themselves live in the copy set; only the count and the beat are
 * fixed here, and every language carries the same five, so the screen holds
 * for the same time whichever one is showing.
 */
const CRUMB_MS = 1300;

const CRUMB_COUNT = 5;

/** The crumbs have to finish before the report page replaces this one. */
const MIN_VISIBLE_MS = CRUMB_MS * CRUMB_COUNT;

export default function NtuHomecomingLoading() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const { result } = useResultStore();
  const [name, setName] = React.useState("");
  const [crumb, setCrumb] = React.useState(0);

  React.useEffect(() => {
    const profile = readLiteProfile(NTU_HOMECOMING);
    if (profile?.name) setName(profile.name);
  }, []);

  // Advance the crumb line, then hold on the last one — navigation is driven by
  // the effect below, not by the end of this cycle.
  React.useEffect(() => {
    if (crumb >= CRUMB_COUNT - 1) return;
    const timer = setTimeout(() => setCrumb((i) => i + 1), CRUMB_MS);
    return () => clearTimeout(timer);
  }, [crumb]);

  React.useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (!cancelled) Router.replace(`${NTU_HOMECOMING.basePath}/report`);
    };

    const stashed = readStashedReport(NTU_HOMECOMING);
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

    Promise.all([fetchLiteReport(result, NTU_HOMECOMING), delay(MIN_VISIBLE_MS)])
      .then(([report]) => {
        if (cancelled) return;
        stashReport(report, NTU_HOMECOMING);
        go();
      })
      // The report page re-fetches and shows its own error state, so a failure
      // here still moves the visitor on rather than stranding them.
      .catch(go);

    return () => {
      cancelled = true;
    };
  }, [result]);

  const greeting = name ? t.loading.greetingNamed(name) : t.loading.greeting;

  return (
    <>
      <Head>
        <title>{t.loading.headTitle}</title>
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div
            className="size-14 animate-spin rounded-full border-4 border-quizSurface-high border-t-quizPrimary"
            role="status"
            aria-label={t.loading.spinnerLabel}
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
            {t.loading.crumbs[crumb]}
          </p>
        </div>
      </LiteShell>
    </>
  );
}
