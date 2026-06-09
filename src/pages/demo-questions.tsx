import Head from "next/head";
import Router from "next/router";
import { useEffect, useMemo } from "react";
import { QuestionStep } from "src/components/Quiz/QuestionStep";
import { QuestionGroupScreen } from "src/components/Quiz/QuestionGroupScreen";
import { QuizProgressBar } from "src/components/Quiz/ProgressBar";
import { StatCardScreen } from "src/components/Quiz/StatCardScreen";
import { QUESTIONS_BY_ID } from "src/data/brainHealthQuestions";
import { STAT_CARDS_BY_ID } from "src/data/brainHealthStatCards";
import type { AnswerValue, Question, Answers } from "src/types/quiz";
import {
  setAnswer,
  setCurrentStep,
  useQuestionnaireStore,
} from "src/stores/useQuestionnaireStore";

/**
 * Brain Health Quiz orchestrator — wedged between the 60s Symbol Matching
 * game and the existing /demo-report B2B capture page.
 *
 * Step structure mirrors b2cfunnel's FULL_FLOW (sibling repo,
 * src/config/funnelFlow.ts). The wins over a flat one-question-per-screen
 * list are the `questionGroup` blocks: the health-history group
 * (BP / cholesterol / diabetes / hearing / vision) and the lifestyle
 * group (smoking / sleep / exercise / diet / alcohol) each collapse five
 * yes/no taps into one labelled screen — the audience never feels like
 * they're 20 questions deep.
 *
 * Conditional branching:
 *   - hotFlushes appears only when sex === "female"
 *   - persistence appears only when forgetfulness was noticed
 *
 * Stat cards punctuate the flow with credibility (Lancet 2024 →
 * IMH WiSE 2024 → Salthouse 2017).
 */

type StepDef =
  | { kind: "question"; questionId: string }
  | { kind: "questionGroup"; title: string; questionIds: string[] }
  | { kind: "statCard"; cardId: string };

const ALL_STEPS: StepDef[] = [
  { kind: "question", questionId: "age" },
  { kind: "question", questionId: "sex" },
  { kind: "question", questionId: "hotFlushes" },
  { kind: "question", questionId: "familyHistory" },
  {
    kind: "questionGroup",
    title: "A bit of health history",
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
  { kind: "question", questionId: "concentrating" },
  { kind: "question", questionId: "judgement" },
  { kind: "question", questionId: "forgetfulness" },
  { kind: "question", questionId: "persistence" },
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

function visibleSteps(answers: Answers): StepDef[] {
  return ALL_STEPS.filter((step) => {
    if (step.kind !== "question") return true;
    const q = QUESTIONS_BY_ID[step.questionId];
    if (!q) return false;
    return questionVisible(q, answers);
  });
}

const isQuestionPage = (step: StepDef) =>
  step.kind === "question" || step.kind === "questionGroup";

/** 1-based question-page count up to and including `cursor`. */
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

export default function DemoQuestionsPage() {
  const answers = useQuestionnaireStore((s) => s.answers);
  const currentStep = useQuestionnaireStore((s) => s.currentStep);

  const steps = useMemo(() => visibleSteps(answers), [answers]);

  // Allow the page to scroll — the global game CSS pins overflow:hidden.
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

  // Clamp the cursor when conditional rewrites shorten the step list.
  useEffect(() => {
    if (currentStep > steps.length) setCurrentStep(steps.length);
  }, [currentStep, steps.length]);

  // Hand off to the report once we've walked past the last step.
  useEffect(() => {
    if (currentStep >= steps.length && steps.length > 0) {
      Router.replace("/demo-report");
    }
  }, [currentStep, steps.length]);

  const advance = () => setCurrentStep(currentStep + 1);
  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (currentStep >= steps.length) {
    return (
      <div
        className="min-h-[100dvh] w-full flex items-center justify-center px-6"
        style={{ background: "linear-gradient(180deg, #FAEEE6 0%, #F5D4C0 50%, #FAEEE6 100%)" }}
      >
        <p className="text-[#6B7280] text-[15px]">Preparing your result…</p>
      </div>
    );
  }

  const step = steps[currentStep];
  const canGoBack = currentStep > 0;
  const totalPages = totalQuestionPages(steps);
  const currentPage = questionNumber(steps, currentStep);

  return (
    <>
      <Head>
        <title>Brain Health Check | Gray Matter Solutions</title>
        <meta name="theme-color" content="#FAEEE6" />
      </Head>
      <div
        className="min-h-[100dvh] w-full"
        style={{ background: "linear-gradient(180deg, #FAEEE6 0%, #F5D4C0 50%, #FAEEE6 100%)" }}
      >
        <div className="max-w-[480px] mx-auto px-5 sm:px-6 pt-6 pb-12">
          <QuizProgressBar current={isQuestionPage(step) ? currentPage : currentPage} total={totalPages} />

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
                questions={step.questionIds.map((id) => QUESTIONS_BY_ID[id]).filter(Boolean)}
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
      </div>
    </>
  );
}
