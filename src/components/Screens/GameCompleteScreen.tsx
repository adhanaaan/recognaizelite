import Router, { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { PcScreen } from "src/components/Layout/PcScreen";
import { FaCheck } from "react-icons/fa6";
import { PiSpinnerBold } from "react-icons/pi";
import { TaskProgressKey, tasks } from "src/constants/tasks";
import { am } from "src/lib/audio-manager";
import { Button } from "src/NewComponents/Button";
import { saveResult, useResultStore } from "src/stores/useResultStore";
import { saveProgress, useTaskProgress } from "src/stores/useTaskProgress";
import { ResultType } from "src/types";
import { APP_LANG } from "src/constants";
import { getAssessmentMode, getHookReportPath, isHookMode, isDarkHookMode, isNoviMode, isSjmcMode, isShortAssessment } from "src/utils/assessment";

// Minimal localized strings for the SJMC short-assessment completion flow.
// Only the SJMC (incl. Mandarin variant) path sets APP_LANG=MANDARIN today.
const GC_COPY = {
  ENGLISH: {
    saving: "Saving your result, please wait.",
    errorTitle: "Error saving your result.",
    errorBody: "Please check your internet connection and try again.",
    retry: "RETRY",
    complete: "Assessment Complete",
    ready: "Your report is ready to view.",
    viewReport: "View report",
  },
  MANDARIN: {
    saving: "正在保存您的结果，请稍候。",
    errorTitle: "保存结果时出错。",
    errorBody: "请检查您的网络连接后重试。",
    retry: "重试",
    complete: "评估完成",
    ready: "您的报告已准备就绪。",
    viewReport: "查看报告",
  },
};

export interface GameCompleteScreenProps extends React.PropsWithChildren {
  result: ResultType;
  color: string;
  task: TaskProgressKey;
  showBackground?: boolean;
  skip?: boolean;
}

const TASK_TO_LIGHT: Record<string, string> = {
  task2: "#E0D0E7",
  task3: "#D0E7E0",
  task4: "#D0E3E7",
  task5: "#DBDBDB",
};

const TASK_TO_GRADIENT: Record<string, string> = {
  task2: "radial-gradient(108.21% 50% at 50% 50%, rgba(228, 227, 255, 0.4) 0%, rgba(214, 141, 232, 0.4) 100%), #FFFFFF",
  task3: "radial-gradient(108.21% 50% at 50% 50%, rgba(200, 248, 216, 0.4) 0%, rgba(68, 234, 124, 0.4) 100%), #FFFFFF",
  task4: "radial-gradient(108.21% 50% at 50% 50%, rgba(175, 205, 250, 0.4) 0%, rgba(61, 136, 253, 0.4) 100%), #FFFFFF",
  task5: "radial-gradient(108.21% 50% at 50% 50%, rgba(242, 211, 191, 0.4) 0%, rgba(254, 142, 68, 0.4) 100%), #FFFFFF",
};

export function GameCompleteScreen({
  result,
  color,
  task,
  children,
  showBackground = true,
  skip,
}: GameCompleteScreenProps) {
  const router = useRouter();
  const { isSubmitting: resultSubmitting, error: resultError } = useResultStore();
  const { isSubmitting: taskSubmitting, error: taskError } = useTaskProgress();
  const assessmentMode = getAssessmentMode();
  const shortAssessment = isShortAssessment();

  const nextTask = useMemo(() => {
    if (shortAssessment) return undefined;
    const { taskProgress } = useTaskProgress.getState();
    for (let i = 2; i <= 5; i++) {
      const { totalLevel, currLevel } = taskProgress[("task" + i) as keyof typeof taskProgress];
      if (totalLevel != currLevel) return tasks[i - 2];
    }
  }, [result, shortAssessment]);

  useEffect(() => {
    if (skip) return;
    if (result) {
      am.play(router.pathname.split("/")[1]);
      saveResult();
      saveProgress();
    }
  }, [result]);

  useEffect(() => {
    if (skip || !result) return;
    if (shortAssessment && task === "task2" && !resultSubmitting && !taskSubmitting && !resultError && !taskError) {
      router.replace(isHookMode() ? getHookReportPath() : "/report");
      return;
    }
    if (assessmentMode === "full" && !nextTask && !resultSubmitting && !taskSubmitting && !resultError && !taskError) {
      router.replace("/report");
    }
  }, [assessmentMode, nextTask, result, resultError, resultSubmitting, shortAssessment, task, taskError, taskSubmitting]);

  const novi = isNoviMode();
  const ikigai = isDarkHookMode();
  const sjmc = isSjmcMode();
  const gc = APP_LANG === "MANDARIN" ? GC_COPY.MANDARIN : GC_COPY.ENGLISH;

  if (!result) return children;

  let content;
  if (resultSubmitting && taskSubmitting) {
    content = (
      <div className="space-y-16 text-center md:scale-125 lg:scale-150 cc">
        <PiSpinnerBold size={72} className={`animate-spin ${novi ? "text-[#EBB02D]" : ikigai ? "text-[#5CE0D8]" : sjmc ? "text-[#E8793B]" : ""}`} />
        <p className={`text-lg ${ikigai ? "text-gray-300" : sjmc ? "text-[#4B5563]" : ""}`}>{gc.saving}</p>
      </div>
    );
  } else if (resultError || taskError) {
    content = (
      <div className="space-y-16 text-center md:scale-125 lg:scale-150 cc">
        <p className={`text-lg ${ikigai ? "text-gray-300" : sjmc ? "text-[#4B5563]" : ""}`}>{gc.errorTitle}</p>
        <p className={`text-lg w-80 ${ikigai ? "text-gray-400" : sjmc ? "text-[#6B7280]" : ""}`}>{gc.errorBody}</p>
        {novi ? (
          <button
            className="w-84 rounded-full px-5 py-3 text-lg font-semibold text-[#1B2130]"
            style={{ backgroundColor: "#EBB02D" }}
            onClick={() => { saveResult(); saveProgress(); }}
          >
            RETRY
          </button>
        ) : ikigai ? (
          <button
            className="w-84 rounded-full bg-[#5CE0D8] px-5 py-3 text-lg font-semibold text-[#0B0F1A]"
            onClick={() => { saveResult(); saveProgress(); }}
          >
            RETRY
          </button>
        ) : sjmc ? (
          <button
            className="w-84 rounded-full px-5 py-3 text-lg font-semibold text-white"
            style={{ backgroundColor: "#E8793B" }}
            onClick={() => { saveResult(); saveProgress(); }}
          >
            {gc.retry}
          </button>
        ) : (
          <Button
            btn={task}
            className="w-84"
            onClick={() => { saveResult(); saveProgress(); }}
          >
            RETRY
          </Button>
        )}
      </div>
    );
  } else if (!nextTask) {
    content = novi ? (
      <div className="space-y-8 text-center text-white md:scale-125 lg:scale-150">
        <div className="h-16 tall:h-20" />
        <div
          className="mx-auto rounded-full c size-24"
          style={{
            background: "linear-gradient(to bottom, #252D3F, #1B2130)",
            boxShadow: "0 0 30px rgba(235,176,45,0.2)",
          }}
        >
          <FaCheck className="mx-auto size-14" style={{ color: "#EBB02D" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Assessment Complete</h2>
          <p className="mt-6 text-sm font-medium w-84 text-gray-400">
            Your report is ready to view.
          </p>
        </div>
        <div className="h-16 tall:h-20" />
        <div className="mx-auto w-84">
          <button
            className="w-full rounded-full px-5 py-3 text-lg font-semibold text-[#1B2130]"
            style={{ backgroundColor: "#EBB02D" }}
            onClick={() => Router.push(getHookReportPath())}
          >
            View report
          </button>
        </div>
      </div>
    ) : ikigai ? (
      <div className="space-y-8 text-center text-white md:scale-125 lg:scale-150">
        <div className="h-16 tall:h-20" />
        <div
          className="mx-auto rounded-full c size-24"
          style={{
            background: "linear-gradient(to bottom, #1a2332, #111827)",
            boxShadow: "0 0 30px rgba(92,224,216,0.2)",
          }}
        >
          <FaCheck className="mx-auto size-14" style={{ color: "#5CE0D8" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Assessment Complete</h2>
          <p className="mt-6 text-sm font-medium w-84 text-gray-400">
            Your report is ready to view.
          </p>
        </div>
        <div className="h-16 tall:h-20" />
        <div className="mx-auto w-84">
          <button
            className="w-full rounded-full bg-[#5CE0D8] px-5 py-3 text-lg font-semibold text-[#0B0F1A]"
            onClick={() => Router.push(getHookReportPath())}
          >
            View report
          </button>
        </div>
      </div>
    ) : sjmc ? (
      <div className="space-y-8 text-center text-[#1F2937] md:scale-125 lg:scale-150">
        <div className="h-16 tall:h-20" />
        <div
          className="mx-auto rounded-full c size-24"
          style={{
            background: "linear-gradient(to bottom, #FFFFFF, #F5D4C0)",
            boxShadow: "0 0 30px rgba(232,121,59,0.2)",
          }}
        >
          <FaCheck className="mx-auto size-14" style={{ color: "#E8793B" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{gc.complete}</h2>
          <p className="mt-6 text-sm font-medium w-84 text-[#6B7280]">
            {gc.ready}
          </p>
        </div>
        <div className="h-16 tall:h-20" />
        <div className="mx-auto w-84">
          <button
            className="w-full rounded-full px-5 py-3 text-lg font-semibold text-white"
            style={{ backgroundColor: "#E8793B" }}
            onClick={() => Router.push(getHookReportPath())}
          >
            {gc.viewReport}
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-8 text-center text-gray-900 md:scale-125 lg:scale-150">
        <div className="h-16 tall:h-20" />
        <div
          className="mx-auto bg-white rounded-full c size-24"
          style={{
            backgroundImage: `linear-gradient(to bottom, #FDFDFD, DBDBDB 180%)`,
            boxShadow: "0px 4px 24px -1px rgba(167, 210, 208, 0.25)",
            backdropFilter: "blur(15px)",
          }}
        >
          <FaCheck className="mx-auto size-14" style={{ color: "#383838" }} />
        </div>
        <div>
          <h2>Assessment Complete</h2>
          <p className="mt-6 text-sm font-medium w-84">
            Your report is ready to view.
          </p>
        </div>
        <div className="h-16 tall:h-20" />
        <div className="mx-auto w-84">
          <Button onClick={() => Router.push(isHookMode() ? getHookReportPath() : "/report")}>View report</Button>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="justify-between h-full py-4 fc">
        <div className="w-full h-12" />
        <div className="space-y-8 text-center">
          <div
            className="mx-auto bg-white rounded-full c size-24"
            style={{
              backgroundImage: `linear-gradient(to bottom, #FDFDFD, ${TASK_TO_LIGHT[task]} 180%)`,
              boxShadow: "0px 4px 24px -1px rgba(167, 210, 208, 0.25)",
              backdropFilter: "blur(15px)",
            }}
          >
            <FaCheck className="mx-auto size-14" style={{ color: color + "bb" }} />
          </div>
          <h2 style={{ color, lineHeight: "42px" }}>Test Complete</h2>
        </div>
        <Button
          btn={task}
          className="w-84"
          onClick={() => {
            Router.replace("/about");
          }}
        >
          Next test
        </Button>
      </div>
    );
  }

  const noviBg = "linear-gradient(180deg, #1B2130 0%, #252D3F 50%, #1B2130 100%)";
  const darkBg = "linear-gradient(180deg, #0B0F1A 0%, #101828 50%, #0B0F1A 100%)";
  const sjmcBg = "linear-gradient(180deg, #FAEEE6 0%, #F5D4C0 50%, #FAEEE6 100%)";

  return (
    <PcScreen>
      {!result ? (
        children
      ) : (
        <div
          className="c z-[1000] h-full section-padding-large"
          style={{
            background: novi
              ? noviBg
              : ikigai
              ? darkBg
              : sjmc
                ? sjmcBg
                : showBackground
                  ? nextTask
                    ? TASK_TO_GRADIENT[task]
                    : "radial-gradient(108.21% 50% at 50% 50%, rgba(228, 227, 255, 0.4) 0%, rgba(141, 231, 244, 0.4) 100%), #FFFFFF"
                  : undefined,
            color: ikigai ? "#fff" : sjmc ? "#1F2937" : color,
          }}
        >
          {content}
        </div>
      )}
    </PcScreen>
  );
}
