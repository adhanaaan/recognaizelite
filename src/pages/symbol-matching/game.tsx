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
import { isDarkHookMode, isLiteOneMode, isNoviMode, isSjmcMode, isShortAssessment } from "src/utils/assessment";
import { LITE } from "src/constants/liteOneTheme";
import { APP_LANG } from "src/constants";
import { liteEventGameCopy } from "src/i18n/liteEventCopy";
import { getTimeLap } from "src/utils/helpers";
import { verifyCompletedTasks } from "src/utils/task-verif";

function Task2({ currLevel }: { currLevel: number }) {
  const shortMode = isShortAssessment();
  const sjmc = isSjmcMode();
  const novi = isNoviMode();
  const ikigai = isDarkHookMode();
  const lite = isLiteOneMode();
  // SJMC, Novi and Lite run the full 60-second test even though short mode is enabled for report routing
  const levels = shortMode && !sjmc && !novi && !lite ? task2LevelsShort : task2Levels;
  const { tiles, time } = levels[currLevel];
  const res = useRef({ correct: 0, errors: 0, rounds: [] as any[] });
  const lap = useCallback(getTimeLap(), [currLevel]);

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
              : `text-2xl font-bold leading-6 ${ikigai || sjmc || lite ? "" : "text-task2"}`
            }
            style={isDesktop ? { color: lite ? LITE.accent : novi ? "#EBB02D" : ikigai ? "#5CE0D8" : sjmc ? "#E8793B" : "#630092" } : lite ? { color: LITE.accent } : novi ? { color: "#EBB02D" } : ikigai ? { color: "#5CE0D8" } : sjmc ? { color: "#E8793B" } : undefined}
          />
          <TimeRemainingCard time={time} callback={updateTask} showSeconds={false} color={lite ? LITE.accent : novi ? "#EBB02D" : ikigai ? "#5CE0D8" : sjmc ? "#E8793B" : "#3A3A3A"} />
        </div>
      </Task2Game>
    </GameCompleteScreen>
  );
}

const Task2Wrapper = () => {
  const { currLevel, totalLevel } = useTaskProgress.getState().taskProgress.task2;
  var allow = verifyCompletedTasks("task2");
  const noviW = isNoviMode();
  const ikigai = isDarkHookMode();
  const sjmcW = isSjmcMode();
  const liteW = isLiteOneMode();
  // The lite countdown card names the task. /lite-event can be running in
  // Chinese or Malay, which it carries here through APP_LANG; every other lite
  // funnel leaves that at ENGLISH and gets the English lines it always had.
  const liteCountdown = liteEventGameCopy(APP_LANG);

  return (
    <>
      {!allow ? (
        <Error403 />
      ) : (
        <>
          <Head>
            <meta name="theme-color" content={liteW ? LITE.surface : noviW ? "#1B2130" : ikigai ? "#0B0F1A" : sjmcW ? "#FAEEE6" : task2.color} />
          </Head>
          {currLevel === totalLevel ? (
            <Celebrations />
          ) : (
            <AssetsLoading
              assets={IMAGES["task-2"]}
              prefix="/images/task-2"
              loadingGradient={liteW ? "lite" : undefined}
              loadingColor={liteW ? LITE.accent : undefined}
            >
              <CountDownScreen
                color={liteW ? LITE.accent : noviW ? "#EBB02D" : ikigai ? "#5CE0D8" : sjmcW ? "#E8793B" : task2.color}
                backgroundColor={liteW ? LITE.surface : noviW ? "#1B2130" : ikigai ? "#0B0F1A" : sjmcW ? "#FAEEE6" : task2.color + "11"}
                variant={liteW ? "numeric" : "dots"}
                title={liteW ? liteCountdown.title : undefined}
                subtitle={liteW ? liteCountdown.subtitle : undefined}
                titleColor={liteW ? LITE.accentDeep : undefined}
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
