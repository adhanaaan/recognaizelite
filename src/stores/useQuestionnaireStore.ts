/**
 * Brain Health Quiz answer store. Mirrors the shape/patterns of
 * `useResultStore.ts` — module-level setters, no hook needed to mutate.
 * The scoring engine is invoked on read (computeScore from current
 * answers) so consumers don't have to keep derived state in sync.
 */

import { create } from "zustand";
import type { Answers, AnswerValue, ScoreResult } from "src/types/quiz";
import { computeScore } from "src/lib/brainHealthScoring";

export interface QuestionnaireStoreState {
  answers: Answers;
  currentStep: number;
}

export const useQuestionnaireStore = create<QuestionnaireStoreState>()(() => ({
  answers: {},
  currentStep: 0,
}));

export function setAnswer(questionId: string, value: AnswerValue) {
  useQuestionnaireStore.setState(({ answers }) => ({
    answers: { ...answers, [questionId]: value },
  }));
}

export function setCurrentStep(step: number) {
  useQuestionnaireStore.setState({ currentStep: step });
}

export function resetQuestionnaire() {
  useQuestionnaireStore.setState({ answers: {}, currentStep: 0 });
}

export function getQuestionnaireScore(): ScoreResult {
  return computeScore(useQuestionnaireStore.getState().answers);
}
