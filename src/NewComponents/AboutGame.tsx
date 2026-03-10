import Router from "next/router";
import { useMemo } from "react";
import { CenterLoading } from "src/components/Layout/CenterLoading";
import { tasks } from "src/constants/tasks";
import { getTaskStatus } from "src/utils/task-verif";
import { Background } from "../components/Layout/Background";
import { Button } from "./Button";
import { useTaskProgress } from "src/stores/useTaskProgress";
import { AboutGameDesktopCombined } from "./AboutGameDesktopCombined";

const TASKS: Record<string, any> = {
  task2: tasks[0],
  task3: tasks[1],
  task4: tasks[2],
  task5: tasks[3],
};

export function AboutGame() {
  const { taskProgress } = useTaskProgress();
  const { activeTask, taskRemaining } = useMemo(() => getTaskStatus(taskProgress), [taskProgress]);
  const task = activeTask ? TASKS[activeTask] : undefined;

  if (!task) {
    Router.replace("/report");
    return <CenterLoading />;
  }

  return (
    <>
      <div className="lg:hidden">
        <Background className="justify-center gap-6 section-padding-large" gradient={activeTask}>
          <div className="w-full mx-auto">{/* <BackButton /> */}</div>

          <div className="w-full mx-auto text-center cc">
            <h4 className="tracking-wider">Next test</h4>
            <h1 style={{ color: task?.color }} className="text-3xl sm:text-4xl">
              {task.name}
            </h1>

            <div className="p-5 c sm:p-8">
              <img className="scale-125 size-52" src={`/images/play/${task.name}.png`} />
            </div>

            <p className="mb-2 font-bold sm:text-xl">{task.info}</p>
            <p className="text-sm font-medium sm:text-lg">{task.description}</p>
          </div>

          <div className="w-full mx-auto">
            {taskRemaining && <p className="py-1 text-sm font-medium text-center">{taskRemaining} tests remaining</p>}
            <Button btn={activeTask} onClick={() => activeTask && Router.push("/instruction")}>
              Watch demo
            </Button>
          </div>
        </Background>
      </div>

      <AboutGameDesktopCombined task={task} activeTask={activeTask!} taskRemaining={taskRemaining} />
    </>
  );
}
