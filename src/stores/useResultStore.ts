import type { TaskProgressKey } from "src/constants/tasks";
import { isAssessmentModeSet } from "src/utils/assessment";
import { create } from "zustand";

export const InitialResult = JSON.stringify({
  task1: {},
  task2: {},
  task3: {},
  task4: {},
  task5: {},
});

export type ResultDataType = Record<TaskProgressKey, any>;

export interface ResultStoreState {
  isSubmitting?: boolean;
  error?: string;
  result: ResultDataType;
}

export const useResultStore = create<ResultStoreState>()(() => ({
  result: JSON.parse(InitialResult),
}));

export function resetTaskResult(task: TaskProgressKey) {
  useResultStore.setState(({ result }) => ({
    result: { ...result, [task]: {} },
  }));
}

export function resetResults() {
  useResultStore.setState({ result: JSON.parse(InitialResult) });
}

export function updateResult(
  task: TaskProgressKey,
  messageOrFn: object | ((old: ResultDataType[TaskProgressKey]) => ResultDataType[TaskProgressKey])
) {
  const { result } = useResultStore.getState();
  if (typeof messageOrFn === "function") {
    result[task] = messageOrFn(result[task]);
  } else {
    result[task] = { ...result[task], ...messageOrFn };
  }
}

export async function saveResult() {
  try {
    useResultStore.setState({ isSubmitting: true, error: undefined });
    if (isAssessmentModeSet()) {
      useResultStore.setState({ isSubmitting: false });
      return;
    }
    useResultStore.setState({ isSubmitting: false });
  } catch (err) {
    useResultStore.setState({ error: (err as Error).message ?? err, isSubmitting: false });
  }
}
