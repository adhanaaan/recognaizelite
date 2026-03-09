import { TaskProgressKey, TaskProgressType } from "src/constants/tasks";
import { useTaskProgress } from "src/stores/useTaskProgress";
import { isShortAssessment } from "src/utils/assessment";

export function verifyCompletedTasks(currTask: string) {
  if (isShortAssessment()) {
    return currTask === "task2";
  }
  const tasks = ["task2", "task3", "task4", "task5"];
  const taskIndex = tasks.indexOf(currTask);
  const { taskProgress } = useTaskProgress.getState();
  for (let i = 0; i < taskIndex; i++) {
    type TaskKey = "task2" | "task3" | "task4" | "task5";
    const task = tasks[i] as TaskKey;
    if (taskProgress[task].currLevel !== taskProgress[task].totalLevel) {
      return false;
    }
  }
  return true;
}

export function getTaskStatus(taskProgress: TaskProgressType) {
  if (isShortAssessment()) {
    const done = taskProgress.task2.currLevel === taskProgress.task2.totalLevel;
    return { taskRemaining: done ? 0 : 1, activeTask: done ? undefined : ("task2" as TaskProgressKey) };
  }
  let taskRemaining = 0;
  let activeTask = undefined;
  for (let i = 2; i <= 5; i++) {
    const task = `task${i}` as TaskProgressKey;
    if (taskProgress[task].currLevel !== taskProgress[task].totalLevel) {
      taskRemaining++;
      if (!activeTask) activeTask = task;
    }
  }

  return { taskRemaining, activeTask };
}
