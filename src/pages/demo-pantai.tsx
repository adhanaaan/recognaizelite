import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import {
  setAssessmentMode,
  setDemoFormPrefill,
  setDemoSource,
  setHookClinic,
  setHookReportPath,
} from "src/utils/assessment";
import { setAppLanguage } from "src/lib/translations";
import { resetQuestionnaire } from "src/stores/useQuestionnaireStore";

/**
 * Event-day variant of /demo for Pantai Hospital Kuala Lumpur.
 *
 * Same game + Brain Health Quiz + report as /demo. Three things differ:
 *   1. Top eyebrow: "Pantai Hospital Kuala Lumpur · Event Day"
 *   2. The B2B capture form pre-fills role = clinician and organisation =
 *      Pantai Hospital Kuala Lumpur (visitor can still edit).
 *   3. Leads are tagged demo_source = "pantai-kl" in Supabase so the post-
 *      event export is a single filter on demo_leads.
 *
 * Keep this in sync with /demo. When the next event ships, fork this file
 * the same way (/demo-{event}) and bump the eyebrow + setDemoSource value.
 */
export default function DemoPantaiEntry() {
  useEffect(() => {
    setAppLanguage("ENGLISH");
    setHookClinic("SJMC");
    setHookReportPath("/demo-questions");
    setAssessmentMode("short");
    setDemoSource("pantai-kl");
    setDemoFormPrefill({
      role: "clinician",
      organization: "Pantai Hospital Kuala Lumpur",
    });
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#fff4ee" />
        <title>Brain Health Check — Pantai KL Event | ReCOGnAIze by Gray Matter Solutions</title>
        <meta property="og:title" content="ReCOGnAIze · Pantai KL" />
        <meta property="og:description" content="Brain Health Check for the Pantai Hospital Kuala Lumpur event. A 60-second cognitive task plus a short evidence-based questionnaire." />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ReCOGnAIze · Pantai KL" />
        <meta name="twitter:description" content="Brain Health Check for the Pantai Hospital Kuala Lumpur event." />
        <meta name="twitter:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
      </Head>
      <main className="relative min-h-[100dvh] w-full flex flex-col px-6 overflow-hidden bg-gradient-to-b from-[#fff4ee] via-quizSurface to-quizSurface-container">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-quizPrimary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#ffb37a]/25 blur-3xl"
        />

        <header className="relative pt-7 sm:pt-9">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="Gray Matter Solutions" className="size-5" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-quizSecondary font-jakarta">
              Gray Matter Solutions
            </span>
          </div>
        </header>

        <div className="relative flex-1 flex flex-col items-center justify-center py-10">
          <div className="w-full max-w-[440px] text-center">
            {/* Event-specific eyebrow — replaces the generic "Brain Health
                Check · 4 minutes" line so attendees know they're in the right
                place. */}
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-quizPrimary font-jakarta">
              Pantai Hospital Kuala Lumpur · Event Day
            </p>
            <h1 className="mt-4 font-display text-[40px] sm:text-[52px] font-extrabold leading-[1.02] text-charcoal">
              Re<span className="text-quizPrimary">COG</span>n<span className="text-quizPrimary">AI</span>ze
              <span className="font-normal text-quizSecondary"> Demo</span>
            </h1>
            <p className="mt-5 font-jakarta text-[15px] leading-relaxed text-quizSecondary">
              A 60-second cognitive task, then a short evidence-based questionnaire. Your
              <span className="font-semibold text-charcoal"> Brain Health Score</span> on the spot.
            </p>

            <button
              onClick={() => Router.push("/instruction")}
              className="mt-8 w-full max-w-[300px] rounded-lg bg-quizPrimary px-8 py-4 text-[16px] font-bold text-quizPrimary-on tracking-wide shadow-card transition-all hover:brightness-105 hover:shadow-float active:scale-[0.98] font-jakarta"
            >
              Start the check
            </button>

            <p className="mt-6 text-[11px] leading-relaxed text-quizOutline font-jakarta">
              Anchored to{" "}
              <span className="font-semibold text-quizSecondary">Lancet Commission 2024</span>
              {" · "}
              <span className="font-semibold text-quizSecondary">CAIDE</span>
              {" · "}
              <span className="font-semibold text-quizSecondary">SCD literature</span>
              {" · "}
              <span className="font-semibold text-quizSecondary">IMH WiSE 2024</span>
            </p>
          </div>
        </div>

        <footer className="relative pb-6 text-center">
          <p className="text-[10.5px] text-quizOutline font-jakarta">
            Digital Cognitive Screening · 4 minutes
          </p>
        </footer>
      </main>
    </>
  );
}
