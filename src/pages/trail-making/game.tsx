import Head from "next/head";
import { useCallback, useRef } from "react";
import { Celebrations } from "src/components/Celebrations";
import { CountDownScreen } from "src/components/Screens/CountDownScreen";
import { GameCompleteScreen } from "src/components/Screens/GameCompleteScreen";
import { Task3Game } from "src/components/Games/Task3Game";
import { TimeRemainingCard } from "src/NewComponents/TimeRemainingCard";
import { task3Levels } from "src/constants/game-levels";
import { getPositions } from "src/components/Games/Task3Game/points-positions";
import { task3 } from "src/constants/tasks";
import { useResult } from "src/hooks/useResult";
import { updateResult } from "src/stores/useResultStore";
import { updateTaskProgress, useTaskProgress } from "src/stores/useTaskProgress";
import { diffTime, getTimeLap } from "src/utils/helpers";
import { verifyCompletedTasks } from "src/utils/task-verif";
import Error403 from "src/pages/403";
import { AssetsLoading } from "src/components/AssetsLoading";
import IMAGES from "src/constants/IMAGES.json";

const positions = getPositions();

function Task3({ currLevel }: { currLevel: number }) {
  const { points, time } = task3Levels[currLevel];

  const { result, setResult } = useResult();
  const res = useRef({ correct: 0, errors: 0, time: new Date().getTime(), rounds: [] as any[] });
  const lap = useCallback(getTimeLap(), [currLevel]);

  const updateTask = () => {
    setResult("success");
    updateResult("task3", { ...res.current, time: diffTime(res.current.time) + "s" });
    updateTaskProgress("task3", { currLevel: currLevel + 1 });
  };

  const onError = () => {
    res.current.errors++;
    res.current.rounds.push({
      success: "No",
      time: lap(),
    });
  };

  const onSuccess = () => {
    res.current.correct++;
    res.current.rounds.push({
      success: "Yes",
      time: lap(),
    });
  };

  return (
    <GameCompleteScreen result={result} color={task3.color} task="task3">
      <Task3Game positions={positions} points={points} onComplete={updateTask} onSuccess={onSuccess} onError={onError}>
        <div className="justify-end f">
          <TimeRemainingCard time={time} callback={updateTask} showSeconds={false} />
        </div>
      </Task3Game>
    </GameCompleteScreen>
  );
}

function Task3Wrapper() {
  const { currLevel, totalLevel } = useTaskProgress.getState().taskProgress.task3;
  var allow = verifyCompletedTasks("task3");

  return (
    <>
      {!allow ? (
        <Error403 />
      ) : (
        <>
          <Head>
            <meta name="theme-color" content={task3.color} />
          </Head>
          {currLevel === totalLevel ? (
            <Celebrations />
          ) : (
            <AssetsLoading assets={IMAGES["task-3"]} prefix="/images/task-3">
              <CountDownScreen color={task3.color} backgroundColor={task3.color + "11"}>
                <Task3 currLevel={currLevel} />
              </CountDownScreen>
            </AssetsLoading>
          )}
        </>
      )}
    </>
  );
}

export default Task3Wrapper;
