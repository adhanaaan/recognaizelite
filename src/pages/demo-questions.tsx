import Head from "next/head";
import Router from "next/router";
import { useEffect, useMemo } from "react";
import { QuestionStep } from "src/components/Quiz/QuestionStep";
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
 * Brain Health Quiz orchestrator — the new screen wedged between the 60s
 * Symbol Matching game and the existing /demo-report B2B capture page.
 *
 * Step list mirrors b2cfunnel's EVENT_FLOW, extended with the universal
 * questions (hot flushes / family history / hearing / vision) so this
 * demo carries the *full* question bank. Conditional branching matches
 * the source: hot flushes only when sex=female, persistence only when
 * forgetfulness is reported. Stat cards punctuate the flow with
 * credibility — Lancet (after health), IMH WiSE (after lifestyle —
 * Singapore-specific), Salthouse (after symptoms — bridges back to the
 * game).
 */

type StepDef =
  | { kind: "question"; questionId: string }
  | { kind: "statCard"; cardId: string };

const ALL_STEPS: StepDef[] = [
  { kind: "question", questionId: "age" },
  { kind: "question", questionId: "sex" },
  { kind: "question", questionId: "hotFlushes" },
  { kind: "question", questionId: "familyHistory" },
  { kind: "question", questionId: "highBp" },
  { kind: "question", questionId: "highCholesterol" },
  { kind: "question", questionId: "diabetes" },
  { kind: "question", questionId: "hearingLoss" },
  { kind: "question", questionId: "visionLoss" },
  { kind: "statCard", cardId: "lancet2024" },
  { kind: "question", questionId: "smoking" },
  { kind: "question", questionId: "sleep" },
  { kind: "question", questionId: "exercise" },
  { kind: "question", questionId: "diet" },
  { kind: "question", questionId: "alcohol" },
  { kind: "statCard", cardId: "imhWise" },
  { kind: "question", questionId: "tracks" },
  { kind: "question", questionId: "concentrating" },
  { kind: "question", questionId: "judgement" },
  { kind: "question", questionId: "forgetfulness" },
  { kind: "question", questionId: "persistence" },
  { kind: "question", questionId: "someoneElseNoticed" },
  { kind: "statCard", cardId: "salthouse" },
];

function showIfPasses(question: Question, answers: Answers): boolean {
  if (!question.showIf) return true;
  const target = answers[question.showIf.questionId];
  if (target === undefined) return false;
  const expected = Array.isArray(question.showIf.equals)
    ? question.showIf.equals
    : [question.showIf.equals];
  return expected.includes(String(target));
}

function visibleSteps(answers: Answers): StepDef[] {
  return ALL_STEPS.filter((step) => {
    if (step.kind !== "question") return true;
    const q = QUESTIONS_BY_ID[step.questionId];
    if (!q) return false;
    return showIfPasses(q, answers);
  });
}

// Total questions visible if every conditional fired — used as a stable
// denominator for the progress bar so the UI doesn't shrink/expand as
// conditional questions appear/disappear.
const QUESTION_COUNT = ALL_STEPS.filter((s) => s.kind === "question").length;

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

  // Clamp the step pointer if conditional rewrites shorten the list (e.g. the
  // user changed forgetfulness and persistence disappeared).
  useEffect(() => {
    if (currentStep > steps.length) setCurrentStep(steps.length);
  }, [currentStep, steps.length]);

  // After the final step, hand off to the existing demo-report page. The
  // questionnaire store is persisted for the report to read.
  useEffect(() => {
    if (currentStep >= steps.length) {
      Router.replace("/demo-report");
    }
  }, [currentStep, steps.length]);

  const advance = () => setCurrentStep(currentStep + 1);

  const handleAnswer = (questionId: string, value: AnswerValue) => {
    setAnswer(questionId, value);
    advance();
  };

  // Show a placeholder while the redirect is in flight.
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

  // Track how many *question* screens precede this one for the progress bar.
  const questionsAnswered = steps
    .slice(0, currentStep)
    .filter((s) => s.kind === "question").length;

  return (
    <>
      <Head>
        <title>Brain Health Check | Gray Matter Solutions</title>
        <meta name="theme-color" content="#FAEEE6" />
      </Head>
      <div
        className="min-h-[100dvh] w-full px-5 py-6 sm:px-8 sm:py-10"
        style={{ background: "linear-gradient(180deg, #FAEEE6 0%, #F5D4C0 50%, #FAEEE6 100%)" }}
      >
        <QuizProgressBar current={questionsAnswered} total={QUESTION_COUNT} />

        <div className="mt-8 sm:mt-12 pb-12">
          {step.kind === "question" ? (
            <QuestionStep
              key={step.questionId}
              question={QUESTIONS_BY_ID[step.questionId]}
              initial={answers[step.questionId]}
              onAnswer={(value) => handleAnswer(step.questionId, value)}
            />
          ) : (
            <StatCardScreen
              key={step.cardId}
              card={STAT_CARDS_BY_ID[step.cardId]}
              onContinue={advance}
            />
          )}
        </div>
      </div>
    </>
  );
}
