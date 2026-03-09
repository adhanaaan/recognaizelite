import Head from "next/head";
import { AssetsLoading } from "src/components/AssetsLoading";
import { Celebrations } from "src/components/Celebrations";
import { ChildProp, ComponentRefresh } from "src/components/ComponentRefresh";
import { Task5Game } from "src/components/Games/Task5Game";
import { GameCompleteScreen } from "src/components/Screens/GameCompleteScreen";
import { task5Levels } from "src/constants/game-levels";
import IMAGES from "src/constants/IMAGES.json";
import { task5 } from "src/constants/tasks";
import { useResult } from "src/hooks/useResult";
import Error403 from "src/pages/403";
import { updateResult } from "src/stores/useResultStore";
import { updateTaskProgress, useTaskProgress } from "src/stores/useTaskProgress";
import { GameProps } from "src/types";
import { verifyCompletedTasks } from "src/utils/task-verif";

const Task5 = ({ onRefresh, currLevel, totalLevel }: ChildProp & GameProps) => {
  const { result, setResult } = useResult();

  const saveResult = (x: any) => {
    updateTaskProgress("task5", { currLevel: currLevel + 1 });
    updateResult("task5", ({ rounds = [] }) => ({ rounds: [...rounds, x] }));

    if (currLevel === totalLevel - 1) {
      setResult("success");
    } else {
      onRefresh();
    }
  };

  return (
    <GameCompleteScreen result={result} color={task5.color} task="task5">
      <Task5Game
        level={currLevel}
        totalLevel={totalLevel}
        onError={saveResult}
        onSuccess={saveResult}
        {...task5Levels[currLevel]}
      />
    </GameCompleteScreen>
  );
};

const Task5Wrapper = ComponentRefresh(({ onRefresh }: ChildProp) => {
  const { currLevel, totalLevel } = useTaskProgress.getState().taskProgress.task5;
  var allow = verifyCompletedTasks("task5");

  return (
    <>
      {!allow ? (
        <Error403 />
      ) : (
        <>
          <Head>
            <meta name="theme-color" content={task5.color} />
          </Head>
          {currLevel === totalLevel ? (
            <Celebrations />
          ) : (
            <AssetsLoading assets={IMAGES["task-5"]} prefix="/images/task-5">
              <Task5 currLevel={currLevel} totalLevel={totalLevel} onRefresh={onRefresh} />
            </AssetsLoading>
          )}
        </>
      )}
    </>
  );
});

export default Task5Wrapper;
