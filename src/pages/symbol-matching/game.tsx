import Head from "next/head";
import { useCallback, useRef } from "react";
import { AssetsLoading } from "src/components/AssetsLoading";
import { Celebrations } from "src/components/Celebrations";
import { Task2Game } from "src/components/Games/Task2Game";
import { CountDownScreen } from "src/components/Screens/CountDownScreen";
import { GameCompleteScreen } from "src/components/Screens/GameCompleteScreen";
import { Score } from "src/components/Score";
import { task2Levels, task2LevelsShort } from "src/constants/game-levels";
import IMAGES from "src/constants/IMAGES.json";
import { task2 } from "src/constants/tasks";
import { useForceUpdate } from "src/hooks/useForceUpdate";
import { useResult } from "src/hooks/useResult";
import { TimeRemainingCard } from "src/NewComponents/TimeRemainingCard";
import Error403 from "src/pages/403";
import { updateResult } from "src/stores/useResultStore";
import { updateTaskProgress, useTaskProgress } from "src/stores/useTaskProgress";
import { isIkigaiMode } from "src/utils/assessment";
import { getTimeLap } from "src/utils/helpers";
import { verifyCompletedTasks } from "src/utils/task-verif";

function Task2({ currLevel }: { currLevel: number }) {
  const ikigaiMode = isIkigaiMode();
  const levels = ikigaiMode ? task2LevelsShort : task2Levels;
  const { tiles, time } = levels[currLevel];
  const res = useRef({ correct: 0, errors: 0, rounds: [] as any[] });
  const lap = useCallback(getTimeLap(), [currLevel]);
  const ikigai = isIkigaiMode();

  const update = useForceUpdate();
  const { result, setResult } = useResult();

  const score = Math.max(res.current.correct - res.current.errors, 0);
  const onError = () => {
    res.current.errors++;
    res.current.rounds.push({
      success: "No",
      time: lap(),
    });
    update();
  };

  const onSuccess = () => {
    res.current.correct++;
    res.current.rounds.push({
      success: "Yes",
      time: lap(),
    });
    update();
  };

  const updateTask = () => {
    setResult("success");
    updateResult("task2", { score, ...res.current });
    updateTaskProgress("task2", { currLevel: currLevel + 1 });
  };

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <GameCompleteScreen result={result} color={task2.color} task="task2">
      <Task2Game tiles={tiles} desktopDemo={isDesktop} onError={onError} onSuccess={onSuccess}>
        <div className={isDesktop ? "items-center justify-between w-full f" : "items-center justify-between w-full f"}>
          <Score
            score={score}
            className={isDesktop
              ? "[font-family:Avenir] [font-weight:800] text-[26.51px] leading-[26.51px] align-middle"
              : `text-2xl font-bold leading-6 ${ikigai ? "" : "text-task2"}`
            }
            style={isDesktop ? { color: ikigai ? "#5CE0D8" : "#630092" } : ikigai ? { color: "#5CE0D8" } : undefined}
          />
          <TimeRemainingCard time={time} callback={updateTask} showSeconds={false} color={ikigai ? "#5CE0D8" : "#3A3A3A"} />
        </div>
      </Task2Game>
    </GameCompleteScreen>
  );
}

const Task2Wrapper = () => {
  const { currLevel, totalLevel } = useTaskProgress.getState().taskProgress.task2;
  var allow = verifyCompletedTasks("task2");
  const ikigai = isIkigaiMode();

  return (
    <>
      {!allow ? (
        <Error403 />
      ) : (
        <>
          <Head>
            <meta name="theme-color" content={ikigai ? "#0B0F1A" : task2.color} />
          </Head>
          {currLevel === totalLevel ? (
            <Celebrations />
          ) : (
            <AssetsLoading assets={IMAGES["task-2"]} prefix="/images/task-2">
              <CountDownScreen
                color={ikigai ? "#5CE0D8" : task2.color}
                backgroundColor={ikigai ? "#0B0F1A" : task2.color + "11"}
              >
                <Task2 currLevel={currLevel} />
              </CountDownScreen>
            </AssetsLoading>
          )}
        </>
      )}
    </>
  );
};

export default Task2Wrapper;
