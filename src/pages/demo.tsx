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
      <main className="relative h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden bg-gradient-to-b from-[#fff4ee] via-quizSurface to-quizSurface-container">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-quizPrimary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#ffb37a]/30 blur-3xl"
        />

        <div className="relative w-full max-w-lg flex flex-col items-center">
          {/* Product-demo eyebrow pill — uses the Pill spec (coral on cream). */}
          <div className="mb-5">
            <span className="inline-flex items-center rounded-full bg-quizPill-bg px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-quizPill-text font-jakarta">
              Product Demo
            </span>
          </div>

          {/* Headline — Plus Jakarta Sans display weight, charcoal. */}
          <div className="text-center max-w-[360px] mx-auto mb-6">
            <h1 className="font-display text-[36px] sm:text-[44px] font-bold leading-[1.05] text-charcoal">
              How sharp is your{" "}
              <span className="text-quizPrimary">brain?</span>
            </h1>
            <p className="mt-4 font-jakarta text-[15px] leading-relaxed text-quizSecondary">
              Try the cognitive screen we built — on yourself, in 4 minutes.
              <br />
              <span className="font-semibold text-charcoal">Get your Brain Health Score on the spot.</span>
            </p>
          </div>

          {/* CTA — Clinical Empathy primary button: 8px corners, shadow-card. */}
          <button
            onClick={() => Router.push("/instruction")}
            className="w-full max-w-[320px] rounded-lg bg-quizPrimary px-8 py-4 text-[17px] font-bold text-quizPrimary-on tracking-wide shadow-card transition-all hover:brightness-105 hover:shadow-float active:scale-[0.98] font-jakarta"
          >
            Start Brain Health Check
          </button>

          {/* Trust signals — small labels on soft cream pills. */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: "🧠", label: "Under 4 minutes" },
              { icon: "📱", label: "No app needed" },
              { icon: "📊", label: "Evidence-based" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 rounded-full bg-quizSurface-lowest/70 px-3 py-1.5"
              >
                <span className="text-[12px]">{item.icon}</span>
                <span className="text-[11px] font-medium text-quizSecondary font-jakarta">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom branding */}
        <div className="absolute bottom-5 left-0 right-0 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="/logo.png" alt="ReCOGnAIze" className="w-[22px] h-[22px]" />
            <span className="text-[11px] font-medium text-quizOutline font-jakarta">ReCOGnAIze</span>
          </div>
          <p className="text-[9px] text-quizOutline-variant font-jakarta">
            Digital Cognitive Screening by Gray Matter Solutions
          </p>
        </div>
      </main>
    </>
  );
}
