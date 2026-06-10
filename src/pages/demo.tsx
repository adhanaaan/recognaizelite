import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";
import { setAppLanguage } from "src/lib/translations";
import { resetQuestionnaire } from "src/stores/useQuestionnaireStore";

export default function DemoEntry() {
  useEffect(() => {
    setAppLanguage("ENGLISH");
    // hookClinic stays "SJMC" so the games render in the existing light theme
    // without touching every isSjmcMode() call site. The actual lead is tagged
    // "healthtechx" by the demo-report page when the API call is made — the
    // tag is a historical artefact from the first event we showed this at;
    // the URL itself is now a generic B2B product demo (IHH-style sessions,
    // Gleneagles HK, hospital execs).
    setHookClinic("SJMC");
    // The game's end-of-task router uses hookReportPath. We detour through
    // the Brain Health Quiz first; /demo-questions hands off to /demo-report
    // after the final answer.
    setHookReportPath("/demo-questions");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#fff4ee" />
        <title>Brain Health Check — Demo | ReCOGnAIze by Gray Matter Solutions</title>
        <meta property="og:title" content="Try the Brain Health Check." />
        <meta property="og:description" content="A 60-second cognitive task and a short evidence-based questionnaire. Your Brain Health Score on the spot." />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Try the Brain Health Check." />
        <meta name="twitter:description" content="A 60-second cognitive task plus a short evidence-based questionnaire. Brain Health Score on the spot." />
        <meta name="twitter:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
      </Head>
      {/* ScreenShell — same gradient + ambient blur circles as the quiz, so
          the demo flow reads as one continuous Clinical Empathy surface. */}
      <main className="relative min-h-[100dvh] w-full flex flex-col px-6 overflow-hidden bg-gradient-to-b from-[#fff4ee] via-quizSurface to-quizSurface-container">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-quizPrimary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#ffb37a]/25 blur-3xl"
        />

        {/* Brand header — lead with the institution so the page never opens
            anonymously. Previously this lived as a tiny line at the bottom,
            which made the URL feel like a lead-magnet quiz; promoting it
            here is the single biggest credibility tweak on this view. */}
        <header className="relative pt-7 sm:pt-9">
          <div className="flex items-center justify-center gap-2.5">
            <img src="/logo.png" alt="ReCOGnAIze" className="size-7" />
            <div className="text-left leading-tight">
              <div className="font-display text-[15px] font-bold text-charcoal">ReCOGnAIze</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-quizSecondary font-jakarta">
                Digital Cognitive Screening
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="relative flex-1 flex flex-col items-center justify-center py-10">
          <div className="w-full max-w-[440px] text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-quizPrimary font-jakarta">
              Brain Health Check · 4 minutes
            </p>
            <h1 className="mt-4 font-display text-[32px] sm:text-[40px] font-bold leading-[1.08] text-charcoal">
              Try the cognitive screening,
              <br />
              on yourself.
            </h1>
            <p className="mt-4 font-jakarta text-[15px] leading-relaxed text-quizSecondary">
              A 60-second cognitive task, then a short evidence-based questionnaire. Your
              <span className="font-semibold text-charcoal"> Brain Health Score</span> on the spot.
            </p>

            <button
              onClick={() => Router.push("/instruction")}
              className="mt-8 w-full max-w-[300px] rounded-lg bg-quizPrimary px-8 py-4 text-[16px] font-bold text-quizPrimary-on tracking-wide shadow-card transition-all hover:brightness-105 hover:shadow-float active:scale-[0.98] font-jakarta"
            >
              Start the check
            </button>

            {/* Evidence row — replaces the old emoji trust badges with the
                actual references the questions are anchored to. This is the
                second credibility lever on this page. */}
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

        {/* Footer */}
        <footer className="relative pb-6 text-center">
          <p className="text-[10.5px] text-quizOutline font-jakarta">
            By Gray Matter Solutions · Singapore
          </p>
        </footer>
      </main>
    </>
  );
}
