import Head from "next/head";
import Router from "next/router";
import { useEffect, useMemo } from "react";
import { QuestionStep } from "src/components/Quiz/QuestionStep";
import { QuestionGroupScreen } from "src/components/Quiz/QuestionGroupScreen";
import { QuizProgressBar } from "src/components/Quiz/ProgressBar";
import { StatCardScreen } from "src/components/Quiz/StatCardScreen";
import { LITE_EVENT_TEMPLATE_QUESTION_BANKS } from "src/data/liteEventTemplateQuestions";
import { STAT_CARDS_BY_ID } from "src/data/brainHealthStatCards";
import { STAT_CARDS_MS_BY_ID } from "src/data/brainHealthStatCards.ms";
import { STAT_CARDS_ZH_BY_ID } from "src/data/brainHealthStatCards.zh";
import type { StatCard } from "src/data/brainHealthStatCards";
import { useLiteEventLang, type LiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy, type LiteEventCopy } from "src/i18n/liteEventCopy";
import { computeScore } from "src/lib/brainHealthScoring";
import type { Question, Answers } from "src/types/quiz";
import {
  setAnswer,
  setCurrentStep,
  useQuestionnaireStore,
} from "src/stores/useQuestionnaireStore";
import { LITE_EVENT_TEMPLATE, stashQuizResult } from "src/utils/liteOne";

/**
 * /lite-event-template — the template copy of this /lite-event screen.
 *
 * The template funnel is where flow changes are trialled before they are
 * folded back into /lite-event, so this file starts as a page-for-page copy
 * and only diverges where a change is being tried out. See LITE_EVENT_TEMPLATE
 * in src/utils/liteOne.ts for what the two funnels share and what they don't.
 */

type StepDef =
  | { kind: "question"; questionId: string }
  | { kind: "questionGroup"; title: string; description?: string; questionIds: string[] }
  | { kind: "statCard"; cardId: string };

/**
 * The three question banks, keyed by the funnel's language. Every bank carries
 * the same question ids, option ids and scores — only the wording differs — so
 * `computeScore` (which reads the English bank) grades a Chinese or Malay run
 * exactly as it grades an English one, and the answers written to
 * liteevent_leads stay comparable across languages.
 *
 * The template asks from its own banks: the shared ones plus this funnel's
 * wording changes. See src/data/liteEventTemplateQuestions.ts.
 */
const QUESTION_BANKS: Record<LiteEventLang, Record<string, Question>> =
  LITE_EVENT_TEMPLATE_QUESTION_BANKS;

const STAT_CARD_BANKS: Record<LiteEventLang, Record<string, StatCard>> = {
  en: STAT_CARDS_BY_ID,
  zh: STAT_CARDS_ZH_BY_ID,
  ms: STAT_CARDS_MS_BY_ID,
};

/**
 * The question path of b2cfunnel's `FULL_FLOW` (`src/config/funnelFlow.ts`),
 * step for step. Its flow also carries the hook, email gate, analysing, result
 * and paywall steps; in this funnel those are separate routes, so only the
 * question and stat-card steps live here.
 *
 * Built from the copy set rather than declared as a constant, because the
 * group headings are the visitor's to read and so are translated.
 */
function allSteps(t: LiteEventCopy): StepDef[] {
  return [
    { kind: "question", questionId: "age" },
    { kind: "question", questionId: "sex" },
    { kind: "question", questionId: "hotFlushes" }, // pruned if sex !== female
    { kind: "question", questionId: "familyHistory" },

    {
      kind: "questionGroup",
      title: t.quiz.groupRiskFactors,
      // The previous question was about family history — this one is not, and
      // testers assumed it still was without this line.
      description: t.quiz.groupRiskFactorsNote,
      questionIds: ["highBp", "highCholesterol", "diabetes", "hearingLoss", "visionLoss"],
    },

    {
      kind: "questionGroup",
      title: t.quiz.groupLifestyle,
      questionIds: ["smoking", "sleep", "exercise", "diet", "alcohol"],
    },

    // The only stat card this funnel keeps — the rest (lancet2024, salthouse)
    // are dropped so the quiz carries a single credibility beat instead of
    // three, at the position IMH WiSE already had.
    { kind: "statCard", cardId: "imhWise" },

    { kind: "question", questionId: "tracks" },

    // The three experiential symptom questions share a frequency scale and sit
    // on one page together. /lite-event renders them as sliders; here they are
    // option buttons like every other question in the quiz — see `buttonsOnly`
    // on QuestionGroupScreen for why.
    {
      kind: "questionGroup",
      title: t.quiz.groupChanges,
      questionIds: ["concentrating", "judgement", "forgetfulness"],
    },
    { kind: "question", questionId: "persistence" }, // pruned if forgetfulness not noticed
    { kind: "question", questionId: "someoneElseNoticed" },
  ];
}

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
  answers: Answers,
  bank: Record<string, Question>
): Question[] {
  return questionIds
    .map((id) => bank[id])
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
function visibleSteps(
  answers: Answers,
  t: LiteEventCopy,
  bank: Record<string, Question>
): StepDef[] {
  return allSteps(t).filter((step) => {
    if (step.kind !== "question") return true;
    const question = bank[step.questionId];
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

export default function LiteEventTemplateQuizPage() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const bank = QUESTION_BANKS[lang];
  const statCards = STAT_CARD_BANKS[lang];

  const answers = useQuestionnaireStore((s) => s.answers);
  const currentStep = useQuestionnaireStore((s) => s.currentStep);

  const steps = useMemo(() => visibleSteps(answers, t, bank), [answers, t, bank]);

  const quizLabels = useMemo(
    () => ({ back: t.quiz.back, continue: t.quiz.continue }),
    [t]
  );
  const statLabels = useMemo(
    () => ({
      didYouKnow: t.quiz.didYouKnow,
      source: t.quiz.source,
      continue: t.quiz.continue,
    }),
    [t]
  );
  const progressLabels = useMemo(() => ({ questionXOfY: t.quiz.questionXOfY }), [t]);

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
      stashQuizResult(score, LITE_EVENT_TEMPLATE);
      Router.replace(`${LITE_EVENT_TEMPLATE.basePath}/results`);
    }
  }, [currentStep, steps.length, answers]);

  const advance = () => setCurrentStep(currentStep + 1);
  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (currentStep >= steps.length) {
    return (
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fff4ee] via-quizSurface to-quizSurface-container px-6">
        <p className="text-[15px] font-jakarta text-quizSecondary">{t.quiz.preparing}</p>
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
        <title>{t.quiz.headTitle}</title>
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
          <QuizProgressBar current={currentPage} total={totalPages} labels={progressLabels} />

          <div className="mt-8">
            {step.kind === "question" && (
              <QuestionStep
                key={step.questionId}
                question={bank[step.questionId]}
                value={answers[step.questionId]}
                canGoBack={canGoBack}
                onAnswer={(value) => setAnswer(step.questionId, value)}
                onNext={advance}
                onBack={goBack}
                labels={quizLabels}
              />
            )}
            {step.kind === "questionGroup" && (
              <QuestionGroupScreen
                key={step.title}
                title={step.title}
                description={step.description}
                questions={visibleQuestionsForGroup(step.questionIds, answers, bank)}
                answers={answers}
                canGoBack={canGoBack}
                onAnswer={(qid, value) => setAnswer(qid, value)}
                onNext={advance}
                onBack={goBack}
                labels={quizLabels}
                buttonsOnly
              />
            )}
            {step.kind === "statCard" && (
              <StatCardScreen
                key={step.cardId}
                card={statCards[step.cardId]}
                onNext={advance}
                labels={statLabels}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
