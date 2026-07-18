import Head from "next/head";
import Router from "next/router";
import { useEffect, useMemo } from "react";
import { QuestionStep } from "src/components/Quiz/QuestionStep";
import { QuestionGroupScreen } from "src/components/Quiz/QuestionGroupScreen";
import { QuizProgressBar } from "src/components/Quiz/ProgressBar";
import { StatCardScreen } from "src/components/Quiz/StatCardScreen";
import { QUESTIONS_ZH_BY_ID } from "src/data/brainHealthQuestions.zh";
import { STAT_CARDS_ZH_BY_ID } from "src/data/brainHealthStatCards.zh";
import type { AnswerValue, Question, Answers } from "src/types/quiz";
import {
  setAnswer,
  setCurrentStep,
  useQuestionnaireStore,
} from "src/stores/useQuestionnaireStore";

const ZH_LABELS = {
  back: "← 返回",
  continue: "继续",
};

const ZH_STAT_LABELS = {
  didYouKnow: "您知道吗",
  source: "来源",
  continue: "继续",
};

const ZH_PROGRESS_LABELS = {
  questionXOfY: (current: number, total: number) => `第 ${current} 题，共 ${total} 题`,
};

type StepDef =
  | { kind: "question"; questionId: string }
  | { kind: "questionGroup"; title: string; questionIds: string[] }
  | { kind: "statCard"; cardId: string };

const ALL_STEPS: StepDef[] = [
  {
    kind: "questionGroup",
    title: "关于您",
    questionIds: ["age", "sex", "hotFlushes", "familyHistory"],
  },
  {
    kind: "questionGroup",
    title: "您的健康",
    questionIds: ["highBp", "highCholesterol", "diabetes"],
  },
  {
    kind: "questionGroup",
    title: "您的生活方式",
    questionIds: ["smoking", "sleep", "exercise", "diet", "alcohol"],
  },
  {
    kind: "questionGroup",
    title: "您的日常",
    questionIds: ["concentrating", "judgement", "forgetfulness", "persistence", "someoneElseNoticed"],
  },
  { kind: "statCard", cardId: "imhWise" },
];

function questionVisible(question: Question, answers: Answers): boolean {
  if (!question.showIf) return true;
  const target = answers[question.showIf.questionId];
  if (target === undefined) return false;
  const expected = Array.isArray(question.showIf.equals)
    ? question.showIf.equals
    : [question.showIf.equals];
  return typeof target === "string" && expected.includes(target);
}

function visibleQuestionsForGroup(
  questionIds: readonly string[],
  answers: Answers
): Question[] {
  return questionIds
    .map((id) => QUESTIONS_ZH_BY_ID[id])
    .filter((q): q is Question => Boolean(q) && questionVisible(q, answers));
}

function visibleSteps(_answers: Answers): StepDef[] {
  return ALL_STEPS;
}

const isQuestionPage = (step: StepDef) =>
  step.kind === "question" || step.kind === "questionGroup";

function questionNumber(steps: StepDef[], cursor: number): number {
  let n = 0;
  for (let i = 0; i <= cursor && i < steps.length; i++) {
    if (isQuestionPage(steps[i])) n++;
  }
  return n;
}

function totalQuestionPages(steps: StepDef[]): number {
  return steps.filter(isQuestionPage).length;
}

export default function DemoMandarinQuestionsPage() {
  const answers = useQuestionnaireStore((s) => s.answers);
  const currentStep = useQuestionnaireStore((s) => s.currentStep);

  const steps = useMemo(() => visibleSteps(answers), [answers]);

  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    const next = document.getElementById("__next");
    if (next) {
      next.style.overflow = "auto";
      next.style.height = "auto";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      if (next) {
        next.style.overflow = "";
        next.style.height = "";
      }
    };
  }, []);

  useEffect(() => {
    if (currentStep > steps.length) setCurrentStep(steps.length);
  }, [currentStep, steps.length]);

  useEffect(() => {
    if (currentStep >= steps.length && steps.length > 0) {
      Router.replace("/demo-mandarin-report");
    }
  }, [currentStep, steps.length]);

  const advance = () => setCurrentStep(currentStep + 1);
  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (currentStep >= steps.length) {
    return (
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fff4ee] via-quizSurface to-quizSurface-container px-6">
        <p className="text-quizSecondary text-[15px] font-jakarta">正在生成您的结果…</p>
      </main>
    );
  }

  const step = steps[currentStep];
  const canGoBack = currentStep > 0;
  const totalPages = totalQuestionPages(steps);
  const currentPage = questionNumber(steps, currentStep);

  return (
    <>
      <Head>
        <title>脑健康检查 | Gray Matter Solutions</title>
        <meta name="theme-color" content="#fff4ee" />
      </Head>
      <main className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden bg-gradient-to-b from-[#fff4ee] via-quizSurface to-quizSurface-container px-4 py-8 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-quizPrimary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#ffb37a]/30 blur-3xl"
        />

        <div className="relative w-full max-w-lg">
          <QuizProgressBar current={currentPage} total={totalPages} labels={ZH_PROGRESS_LABELS} />

          <div className="mt-8">
            {step.kind === "question" && (
              <QuestionStep
                key={step.questionId}
                question={QUESTIONS_ZH_BY_ID[step.questionId]}
                value={answers[step.questionId]}
                canGoBack={canGoBack}
                onAnswer={(value) => setAnswer(step.questionId, value)}
                onNext={advance}
                onBack={goBack}
                labels={ZH_LABELS}
              />
            )}
            {step.kind === "questionGroup" && (
              <QuestionGroupScreen
                key={step.title}
                title={step.title}
                questions={visibleQuestionsForGroup(step.questionIds, answers)}
                answers={answers}
                canGoBack={canGoBack}
                onAnswer={(qid, value) => setAnswer(qid, value)}
                onNext={advance}
                onBack={goBack}
                labels={ZH_LABELS}
              />
            )}
            {step.kind === "statCard" && (
              <StatCardScreen
                key={step.cardId}
                card={STAT_CARDS_ZH_BY_ID[step.cardId]}
                onNext={advance}
                labels={ZH_STAT_LABELS}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
