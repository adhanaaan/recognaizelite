import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteShell } from "src/components/LiteOne/LiteShell";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import { useResultStore } from "src/stores/useResultStore";
import {
  LITE_EVENT_TEMPLATE,
  fetchLiteReport,
  readLiteProfile,
  readStashedReport,
  stashReport,
} from "src/utils/liteOne";

/**
 * /lite-event-template — the template copy of this /lite-event screen.
 *
 * The template funnel is where flow changes are trialled before they are
 * folded back into /lite-event, so this file starts as a page-for-page copy
 * and only diverges where a change is being tried out. See LITE_EVENT_TEMPLATE
 * in src/utils/liteOne.ts for what the two funnels share and what they don't.
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

export default function LiteEventTemplateLoading() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const { result } = useResultStore();
  const [name, setName] = React.useState("");
  const [crumb, setCrumb] = React.useState(0);

  React.useEffect(() => {
    const profile = readLiteProfile(LITE_EVENT_TEMPLATE);
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
      if (!cancelled) Router.replace(`${LITE_EVENT_TEMPLATE.basePath}/report`);
    };

    const stashed = readStashedReport(LITE_EVENT_TEMPLATE);
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

    Promise.all([fetchLiteReport(result, LITE_EVENT_TEMPLATE), delay(MIN_VISIBLE_MS)])
      .then(([report]) => {
        if (cancelled) return;
        stashReport(report, LITE_EVENT_TEMPLATE);
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
