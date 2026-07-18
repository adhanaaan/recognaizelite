import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";
import { setAppLanguage } from "src/lib/translations";
import { resetQuestionnaire } from "src/stores/useQuestionnaireStore";

const CJK_SANS = "'Noto Sans SC', sans-serif";

export default function DemoMandarinEntry() {
  useEffect(() => {
    setAppLanguage("MANDARIN");
    setHookClinic("SJMC");
    setHookReportPath("/demo-mandarin-questions");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#fff4ee" />
        <title>脑健康检查 — 演示 | ReCOGnAIze by Gray Matter Solutions</title>
        <meta property="og:title" content="体验脑健康检查。" />
        <meta property="og:description" content="60 秒认知任务加上一份简短的循证问卷。即时获得您的脑健康评分。" />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="体验脑健康检查。" />
        <meta name="twitter:description" content="60 秒认知任务加上一份简短的循证问卷。即时获得您的脑健康评分。" />
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
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-quizPrimary font-jakarta">
              脑健康检查 · 4 分钟
            </p>
            <h1
              className="mt-4 text-[40px] sm:text-[52px] font-extrabold leading-[1.02] text-charcoal"
              style={{ fontFamily: CJK_SANS }}
            >
              Re<span className="text-quizPrimary">COG</span>n<span className="text-quizPrimary">AI</span>ze
              <span className="font-normal text-quizSecondary"> 演示</span>
            </h1>
            <p
              className="mt-5 text-[15px] leading-relaxed text-quizSecondary"
              style={{ fontFamily: CJK_SANS }}
            >
              60 秒认知任务，然后是一份简短的循证问卷。即时获得您的
              <span className="font-semibold text-charcoal">脑健康评分</span>。
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => Router.push("/demo")}
                className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-quizSecondary bg-white/60 border border-quizOutline/30 transition-all hover:bg-white/80 font-jakarta"
              >
                English
              </button>
              <span
                className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-quizPrimary bg-quizPrimary/10 border border-quizPrimary/30 font-jakarta"
                aria-current="true"
              >
                中文
              </span>
            </div>

            <button
              onClick={() => Router.push("/instruction")}
              className="mt-6 w-full max-w-[300px] rounded-lg bg-quizPrimary px-8 py-4 text-[16px] font-bold text-quizPrimary-on tracking-wide shadow-card transition-all hover:brightness-105 hover:shadow-float active:scale-[0.98]"
              style={{ fontFamily: CJK_SANS }}
            >
              开始检查
            </button>

            <p className="mt-6 text-[11px] leading-relaxed text-quizOutline font-jakarta">
              基于{" "}
              <span className="font-semibold text-quizSecondary">Lancet Commission 2024</span>
              {" · "}
              <span className="font-semibold text-quizSecondary">CAIDE</span>
              {" · "}
              <span className="font-semibold text-quizSecondary">SCD 文献</span>
              {" · "}
              <span className="font-semibold text-quizSecondary">IMH WiSE 2024</span>
            </p>
          </div>
        </div>

        <footer className="relative pb-6 text-center">
          <p
            className="text-[10.5px] text-quizOutline"
            style={{ fontFamily: CJK_SANS }}
          >
            数字认知筛查
          </p>
        </footer>
      </main>
    </>
  );
}
