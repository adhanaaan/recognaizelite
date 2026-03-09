import Router from "next/router";
import { useEffect, useMemo } from "react";
import { DemoGIFContainer } from "src/components/DemoGIFContainer";
import IMAGES from "src/constants/IMAGES.json";
import { task2, task3, task4, task5 } from "src/constants/tasks";
import { preloadImages } from "src/lib/image-cache";
import { t } from "src/lib/translations";
import { useTaskProgress } from "src/stores/useTaskProgress";
import { isShortAssessment } from "src/utils/assessment";
import { getTaskStatus } from "src/utils/task-verif";
import { Background } from "../components/Layout/Background";
import { BackButton } from "./BackButton";
import { Button } from "./Button";
import { TimeRemainingCard } from "./TimeRemainingCard";

const TASKS_TO_IMAGES: Record<string, keyof typeof IMAGES> = {
  task2: "task-2",
  task3: "task-3",
  task4: "task-4",
  task5: "task-5",
};

const TASKS: Record<string, any> = {
  task2,
  task3,
  task4,
  task5,
};

export function TaskInstruction() {
  const { taskProgress } = useTaskProgress();
  const { activeTask } = useMemo(() => getTaskStatus(taskProgress), [taskProgress]);
  const task = activeTask ? TASKS[activeTask] : undefined;

  useEffect(() => {
    activeTask && preloadImages(IMAGES[TASKS_TO_IMAGES[activeTask]], `/images/${TASKS_TO_IMAGES[activeTask]}/`);
  }, []);

  // Skip the GIF instruction screen for Airplane Game — go straight to demo
  useEffect(() => {
    if (activeTask === "task4") {
      Router.replace("/airplane-game/demo");
    }
  }, [activeTask]);

  // Don't render anything while redirecting for Airplane Game
  if (activeTask === "task4") return null;

  return (
    <Background className="justify-between section-padding-large" gradient={activeTask}>
      <div className="justify-between w-full mx-auto f">
        <BackButton backUrl={isShortAssessment() ? "/landing" : "/about"} />
        <TimeRemainingCard time={task?.seconds} color={task?.color} disabled />
      </div>

      <div className="w-full mx-auto text-center cc grow">
        <h1 style={{ color: task.color }}>{task.name}</h1>
        <p className="text-sm font-medium sm:text-lg">{task.instruction}</p>

        <DemoGIFContainer name={task.name} className="h-full scale-90 min-h-80 max-h-[520px]" />
      </div>

      <div className="w-full mx-auto">
        <Button
          btn={activeTask}
          onClick={() => activeTask && Router.push(`/${task.name.replaceAll(" ", "-").toLowerCase()}/demo`)}
        >
          {t.GENERAL["Start tutorial"]}
        </Button>
      </div>
    </Background>
  );
}
