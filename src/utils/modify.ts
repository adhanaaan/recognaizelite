import { TaskProgressKey, TaskProgressType } from "src/constants/tasks";

export function modifyTaskProgress(taskProgress: TaskProgressType) {
  const newProgress = {} as TaskProgressType;
  Object.entries(taskProgress).forEach(([taskKey, taskValue]) => {
    newProgress[taskKey as TaskProgressKey] = {
      currLevel: parseInt(taskValue.currLevel as unknown as string),
      totalLevel: parseInt(taskValue.totalLevel as unknown as string),
    };
  });

  return newProgress;
}
