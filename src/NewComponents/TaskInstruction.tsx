import Router from "next/router";
import { useEffect, useMemo } from "react";
import { DemoGIFContainer } from "src/components/DemoGIFContainer";
import IMAGES from "src/constants/IMAGES.json";
import { task2, task3, task4, task5 } from "src/constants/tasks";
import { preloadImages } from "src/lib/image-cache";
import { t } from "src/lib/translations";
import { useTaskProgress } from "src/stores/useTaskProgress";
import { isDarkHookMode, getHookClinic, isPrologueMode, isShortAssessment } from "src/utils/assessment";
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

  const darkHook = isDarkHookMode();
  const clinic = getHookClinic();
  const backUrl = clinic === "Ikigai Medical" ? "/hookikigai" : clinic === "Prologue Clinic" ? "/prologue" : "/landing";

  if (darkHook) {
    return (
      <div
        className="w-full h-[100dvh] overflow-x-hidden overflow-y-auto fc"
        style={{ background: "linear-gradient(180deg, #0B0F1A 0%, #101828 50%, #0B0F1A 100%)" }}
      >
        <div className="flex-1 fc max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto justify-center gap-6 section-padding-large">
          <div className="justify-between w-full mx-auto f">
            <button
              className="items-center justify-center px-3 py-1.5 rounded-full f font-semibold text-gray-300 border border-gray-600"
              onClick={() => Router.replace(backUrl)}
            >
              <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t.GENERAL.Back}
            </button>
            <TimeRemainingCard time={20} color="#5CE0D8" disabled />
          </div>

          <div className="w-full mx-auto text-center cc grow">
            <h1 style={{ color: "#5CE0D8", fontFamily: "Georgia, 'Times New Roman', serif" }}>{task.name}</h1>
            <p className="text-sm font-medium sm:text-lg text-gray-300">
              {activeTask === "task2" ? "Match as many symbols to their numbers as possible within 20 seconds." : task.instruction}
            </p>

            <DemoGIFContainer name={task.name} className="h-full scale-90 min-h-80 max-h-[520px]" />
          </div>

          <div className="w-full mx-auto">
            <button
              onClick={() => activeTask && Router.push(`/${task.name.replaceAll(" ", "-").toLowerCase()}/demo`)}
              className="w-full rounded-full bg-[#5CE0D8] px-5 py-3 text-lg font-semibold text-[#0B0F1A] transition-all active:bg-[#4BC8C0]"
            >
              {t.GENERAL["Start tutorial"]}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const prologue = isPrologueMode();
  const defaultBackUrl = prologue ? "/prologue" : isShortAssessment() ? "/landing" : "/about";
  const displayTime = prologue ? 20 : task?.seconds;
  const displayInstruction = prologue && activeTask === "task2"
    ? "Match as many symbols to their numbers as possible within 20 seconds."
    : task.instruction;

  return (
    <Background className="justify-center gap-6 section-padding-large" gradient={activeTask}>
      <div className="justify-between w-full mx-auto f">
        <BackButton backUrl={defaultBackUrl} />
        <TimeRemainingCard time={displayTime} color={task?.color} disabled />
      </div>

      <div className="w-full mx-auto text-center cc grow">
        <h1 style={{ color: task.color }}>{task.name}</h1>
        <p className="text-sm font-medium sm:text-lg">{displayInstruction}</p>

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
