import { IntialProgress, TaskProgressKey } from "src/constants/tasks";
import { isAssessmentModeSet } from "src/utils/assessment";
import { create } from "zustand";

export const InitialProgressString = JSON.stringify(IntialProgress);

export interface ProgressStoreState {
  isSubmitting?: boolean;
  error?: string;
  taskProgress: typeof IntialProgress;
  // updateTaskProgress: (task: TaskProgressKey, y: Partial<typeof IntialProgress.task1>) => void;
}

export const useTaskProgress = create<ProgressStoreState>()(() => ({
  taskProgress: JSON.parse(InitialProgressString),
}));

// export const useTaskProgress = create<ProgressStoreState>()((set, get) => ({
//   taskProgress: JSON.parse(InitialProgressString),

//   updateTaskProgress(task, y) {
//     const { taskProgress } = get();

//     taskProgress[task] = { ...taskProgress[task], ...y };

//     set({ taskProgress });
//   },
// }));

export type TaskDataType = Record<TaskProgressKey, any>;

export function updateTaskProgress(
  task: TaskProgressKey,
  messageOrFn: object | ((old: TaskDataType[TaskProgressKey]) => TaskDataType[TaskProgressKey])
) {
  const { taskProgress } = useTaskProgress.getState();
  if (typeof messageOrFn === "function") {
    taskProgress[task] = messageOrFn(taskProgress[task]);
  } else {
    taskProgress[task] = { ...taskProgress[task], ...messageOrFn };
  }
  useTaskProgress.setState({ taskProgress: { ...taskProgress } });
}

export async function saveProgress() {
  try {
    useTaskProgress.setState({ isSubmitting: true, error: undefined });
    if (isAssessmentModeSet()) {
      useTaskProgress.setState({ isSubmitting: false });
      return;
    }
    useTaskProgress.setState({ isSubmitting: false });
  } catch (err) {
    useTaskProgress.setState({ error: (err as Error).message ?? err, isSubmitting: false });
  }
}

export function resetTaskProgress() {
  useTaskProgress.setState({ taskProgress: JSON.parse(InitialProgressString) });
}
