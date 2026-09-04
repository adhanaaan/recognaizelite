/**
 * Brain Health Quiz answer store. Mirrors the shape/patterns of
 * `useResultStore.ts` — module-level setters, no hook needed to mutate.
 * The scoring engine is invoked on read (computeScore from current
 * answers) so consumers don't have to keep derived state in sync.
 *
 * Unlike `useResultStore`, this one mirrors itself into sessionStorage. The
 * answers are the only part of a run that cannot be recomputed: the game score
 * is refetched, the report is stashed, but a lost answer map means a lead row
 * with `quiz_answers` NULL — and with it the age band, gender and persona the
 * results form derives from those answers. An in-memory store empties on any
 * full page load, which at a booth is routine: a visitor refreshes the form, a
 * phone discards the backgrounded tab, someone taps a link and comes back.
 *
 * Mirroring is per-tab (sessionStorage, as with the lite funnel stashes) and is
 * cleared by `resetQuestionnaire`, which every funnel's entry page calls, so a
 * shared iPad never carries one visitor's answers into the next run.
 */

import { create } from "zustand";
import type { Answers, AnswerValue, ScoreResult } from "src/types/quiz";
import { computeScore } from "src/lib/brainHealthScoring";

export interface QuestionnaireStoreState {
  answers: Answers;
  currentStep: number;
}

const STORAGE_KEY = "recognaize-quiz-answers";

export const useQuestionnaireStore = create<QuestionnaireStoreState>()(() => ({
  answers: {},
  currentStep: 0,
}));

function persist(state: QuestionnaireStoreState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers: state.answers, currentStep: state.currentStep })
    );
  } catch {
    // Private-mode quota failures are not worth breaking the quiz over. The
    // store still holds the answers for as long as the tab lives.
  }
}

function clearPersisted() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear if storage is unavailable */
  }
}

/** `AnswerValue` is string | number | string[]; anything else came from a
    tampered-with or stale stash and is dropped rather than scored. */
function isAnswerValue(value: unknown): value is AnswerValue {
  if (typeof value === "string" || typeof value === "number") return true;
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function readPersisted(): QuestionnaireStoreState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const { answers, currentStep } = parsed as Record<string, unknown>;
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) return null;

    const restored: Answers = {};
    for (const [id, value] of Object.entries(answers as Record<string, unknown>)) {
      if (isAnswerValue(value)) restored[id] = value;
    }
    if (Object.keys(restored).length === 0) return null;

    return {
      answers: restored,
      currentStep: typeof currentStep === "number" && currentStep >= 0 ? currentStep : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Restores a run that survived a reload. Called once from `_app`, on mount
 * rather than at module scope so the first client render still matches the
 * pre-rendered HTML.
 *
 * Only ever fills an empty store: a store that already holds answers belongs
 * to the run in progress and outranks anything on disk.
 */
export function hydrateQuestionnaireFromStorage(): boolean {
  if (Object.keys(useQuestionnaireStore.getState().answers).length > 0) return false;
  const persisted = readPersisted();
  if (!persisted) return false;
  useQuestionnaireStore.setState(persisted);
  return true;
}

export function setAnswer(questionId: string, value: AnswerValue) {
  useQuestionnaireStore.setState(({ answers }) => ({
    answers: { ...answers, [questionId]: value },
  }));
  persist(useQuestionnaireStore.getState());
}

export function setCurrentStep(step: number) {
  useQuestionnaireStore.setState({ currentStep: step });
  persist(useQuestionnaireStore.getState());
}

export function resetQuestionnaire() {
  useQuestionnaireStore.setState({ answers: {}, currentStep: 0 });
  clearPersisted();
}

export function getQuestionnaireScore(): ScoreResult {
  return computeScore(useQuestionnaireStore.getState().answers);
}
