import Head from "next/head";
import Router from "next/router";
import { useEffect, useMemo } from "react";
import { QuestionStep } from "src/components/Quiz/QuestionStep";
import { QuestionGroupScreen } from "src/components/Quiz/QuestionGroupScreen";
import { QuizProgressBar } from "src/components/Quiz/ProgressBar";
import { StatCardScreen } from "src/components/Quiz/StatCardScreen";
import { QUESTIONS_BY_ID } from "src/data/brainHealthQuestions";
import { STAT_CARDS_BY_ID } from "src/data/brainHealthStatCards";
import { computeScore } from "src/lib/brainHealthScoring";
import type { Question, Answers } from "src/types/quiz";
import {
  setAnswer,
  setCurrentStep,
  useQuestionnaireStore,
} from "src/stores/useQuestionnaireStore";
import { LITE_WORLDALZ, stashQuizResult } from "src/utils/liteOne";

type StepDef =
  | { kind: "question"; questionId: string }
  | { kind: "questionGroup"; title: string; questionIds: string[] }
  | { kind: "statCard"; cardId: string };

/**
 * The question path of b2cfunnel's `FULL_FLOW` (`src/config/funnelFlow.ts`),
 * step for step. Its flow also carries the hook, email gate, analysing, result
 * and paywall steps; in this funnel those are separate routes, so only the
 * question and stat-card steps live here.
 */
const ALL_STEPS: StepDef[] = [
  { kind: "question", questionId: "age" },
  { kind: "question", questionId: "sex" },
  { kind: "question", questionId: "hotFlushes" }, // pruned if sex !== female
  { kind: "question", questionId: "familyHistory" },

  {
    kind: "questionGroup",
    title: "Some risk factors",
    questionIds: ["highBp", "highCholesterol", "diabetes", "hearingLoss", "visionLoss"],
  },

  { kind: "statCard", cardId: "lancet2024" },

  {
    kind: "questionGroup",
    title: "Your lifestyle",
    questionIds: ["smoking", "sleep", "exercise", "diet", "alcohol"],
  },

  { kind: "statCard", cardId: "imhWise" },

  { kind: "question", questionId: "tracks" },

  // The three experiential symptom questions share a frequency scale, so they
  // sit on one page as sliders.
  {
    kind: "questionGroup",
    title: "Changes you might have noticed",
    questionIds: ["concentrating", "judgement", "forgetfulness"],
  },
  { kind: "question", questionId: "persistence" }, // pruned if forgetfulness not noticed
  { kind: "question", questionId: "someoneElseNoticed" },

  { kind: "statCard", cardId: "salthouse" },
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
    .map((id) => QUESTIONS_BY_ID[id])
    .filter((q): q is Question => Boolean(q) && questionVisible(q, answers));
}

/**
 * Prunes standalone question steps whose `showIf` isn't satisfied — hot flushes
 * when sex ≠ female, the persistence follow-up when forgetfulness was never
 * reported. Mirrors b2cfunnel's `resolveFlow`. Questions inside a group are
 * pruned separately, by `visibleQuestionsForGroup`.
 *
 * Pruning shifts the indices after the removed step, which is safe because the
 * answer that prunes a step is always given on an earlier step: the cursor only
 * ever moves forward into the already-recomputed array.
 */
function visibleSteps(answers: Answers): StepDef[] {
  return ALL_STEPS.filter((step) => {
    if (step.kind !== "question") return true;
    const question = QUESTIONS_BY_ID[step.questionId];
    return Boolean(question) && questionVisible(question, answers);
  });
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

export default function WorldAlzQuizPage() {
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
      const score = computeScore(answers);
      stashQuizResult(score, LITE_WORLDALZ);
      Router.replace(`${LITE_WORLDALZ.basePath}/results`);
    }
  }, [currentStep, steps.length, answers]);

  const advance = () => setCurrentStep(currentStep + 1);
  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (currentStep >= steps.length) {
    return (
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fff4ee] via-quizSurface to-quizSurface-container px-6">
        <p className="text-[15px] font-jakarta text-quizSecondary">Preparing your result…</p>
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
        <title>Brain Health Quiz | Recog-Lite</title>
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
          <QuizProgressBar current={currentPage} total={totalPages} />

          <div className="mt-8">
            {step.kind === "question" && (
              <QuestionStep
                key={step.questionId}
                question={QUESTIONS_BY_ID[step.questionId]}
                value={answers[step.questionId]}
                canGoBack={canGoBack}
                onAnswer={(value) => setAnswer(step.questionId, value)}
                onNext={advance}
                onBack={goBack}
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
              />
            )}
            {step.kind === "statCard" && (
              <StatCardScreen
                key={step.cardId}
                card={STAT_CARDS_BY_ID[step.cardId]}
                onNext={advance}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
