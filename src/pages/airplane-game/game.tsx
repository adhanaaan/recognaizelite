import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import StopWatchIcon from "src/assets/stop-watch.svg";
import { AssetsLoading } from "src/components/AssetsLoading";
import { Celebrations } from "src/components/Celebrations";
import { Task4Game } from "src/components/Games/Task4Game";
import { LivesTracker } from "src/components/LivesTracker";
import { CountDownScreen } from "src/components/Screens/CountDownScreen";
import { GameCompleteScreen } from "src/components/Screens/GameCompleteScreen";
import IMAGES from "src/constants/IMAGES.json";
import { task4Levels } from "src/constants/game-levels";
import { task4 } from "src/constants/tasks";
import { useCountDown } from "src/hooks/useCountDown";
import { useResult } from "src/hooks/useResult";
import Error403 from "src/pages/403";
import { updateResult } from "src/stores/useResultStore";
import { updateTaskProgress, useTaskProgress } from "src/stores/useTaskProgress";
import { diffTime, getTimeLap } from "src/utils/helpers";
import { verifyCompletedTasks } from "src/utils/task-verif";

function Task4({ currLevel }: { currLevel: number }) {
  const [gameLevel, setGameLevel] = useState(0);

  const { planes, time, lives } = task4Levels[currLevel];
  const res = useRef({ correct: 0, errors: 0, time: new Date().getTime(), rounds: [] as any[] });
  const lap = useCallback(getTimeLap(), [currLevel]);

  const [avlLives, setAvlLives] = useState(lives);

  const { result, setResult } = useResult();

  const updateTask = () => {
    setResult("success");
    updateResult("task4", { ...res.current, time: diffTime(res.current.time) + "s" });
    updateTaskProgress("task4", { currLevel: currLevel + 1 });
  };
  const { countDown } = useCountDown(time, updateTask);

  const onError = () => {
    res.current.errors++;
    res.current.rounds.push({
      success: "No",
      time: lap(),
    });

    if (avlLives === 1) {
      updateTask();
    } else {
      setAvlLives(avlLives - 1);
    }
  };

  const onSuccess = () => {
    res.current.correct++;
    res.current.rounds.push({
      success: "Yes",
      time: lap(),
    });

    if (gameLevel + 1 === planes.length) {
      updateTask();
    } else {
      setGameLevel(gameLevel + 1);
    }
  };

  useEffect(() => {
    const disablePullToRefresh = (e: TouchEvent) => {
      if (e.touches.length > 1 || e.touches[0].clientY > 0) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", disablePullToRefresh, { passive: false });
    return () => document.removeEventListener("touchmove", disablePullToRefresh);
  }, []);

  return (
    <GameCompleteScreen result={result} color={task4.color} task="task4">
      <Task4Game
        key={gameLevel * 100 + avlLives}
        gameLevel={gameLevel}
        planes={planes[gameLevel]}
        onSuccess={onSuccess}
        onError={onError}
      >
        <>
          <div className="justify-between f">
            <LivesTracker lives={lives} avlLives={avlLives} />
            <h4
              className="max-w-28 f justify-end items-center gap-1.5"
              style={{ color: "#3A3A3A", lineHeight: "24px" }}
            >
              <StopWatchIcon className="fill-current size-6" />
              {countDown}
            </h4>
          </div>
          <div className="items-center gap-2 f">
            <div className="font-bold">
              {gameLevel}/{planes.length}
            </div>
            <div className="h-3 overflow-hidden bg-white rounded-full grow">
              <div
                className="h-3 rounded-full"
                style={{
                  width: (gameLevel * 100) / planes.length + "%",
                  backgroundImage: "linear-gradient(180deg, #48BFD8 1.04%, #006D85 98.96%)",
                }}
              />
            </div>
          </div>
        </>
      </Task4Game>
    </GameCompleteScreen>
  );
}

function Task4Wrapper() {
  const { currLevel, totalLevel } = useTaskProgress.getState().taskProgress.task4;
  var allow = verifyCompletedTasks("task4");

  return (
    <>
      {!allow ? (
        <Error403 />
      ) : (
        <>
          <Head>
            <meta name="theme-color" content={task4.color} />
          </Head>
          {currLevel === totalLevel ? (
            <Celebrations />
          ) : (
            <AssetsLoading assets={IMAGES["task-4"]} prefix="/images/task-4">
              <CountDownScreen color={task4.color} backgroundColor={task4.color + "11"}>
                <Task4 currLevel={currLevel} />
              </CountDownScreen>
            </AssetsLoading>
          )}
        </>
      )}
    </>
  );
}

export default Task4Wrapper;
