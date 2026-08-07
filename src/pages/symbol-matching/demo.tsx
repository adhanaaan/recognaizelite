import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { DemoScreen } from "src/components/Demo";
import { DemoProvider } from "src/components/Demo/DemoContext";
import { DemoIndicator } from "src/components/Demo/DemoIndicator";
import { Task2Game, resetSkipShuffle } from "src/components/Games/Task2Game";
import { HandIcon } from "src/components/Icons/HandIcon";
import { Score } from "src/components/Score";
import IMAGES from "src/constants/IMAGES.json";
import { task2 } from "src/constants/tasks";
import { preloadImages } from "src/lib/image-cache";
import { t } from "src/lib/translations";
import { DemoStep } from "src/types";
import { demoNextStep } from "src/utils/helpers";
import { isLiteOneMode } from "src/utils/assessment";
import { LITE } from "src/constants/liteOneTheme";

const getSteps = (isDesktop: boolean, handFill: string): DemoStep[] => [
  {
    elements: [{ id: "sb-main-icon", className: "scale-105", instruction: t.SM["Focus on the symbol at the top of the screen."] }],
    delay: 400,
    voiceover: "SM_2.mp3",
  },
  {
    elements: [
      {
        id: "sb-reference-icon-7",
        className: "scale-125",
        side: "top",
        instruction: t.SM["Look for the matching symbol and its number. Here, it is 7."],
        arrowStyle: { transform: "translateX(8px)" },
      },
    ],
    voiceover: "SM_3.mp3",
  },
  {
    elements: [
      {
        id: "sb-number-pad-7",
        side: "top",
        className: "scale-125 rounded-full",
        instructionClassName: "mb-8",
        instruction: isDesktop
          ? t.SM["Click No. 7 on the number pad or type \u201C7\u201D on your keyboard"]
          : t.SM["Tap \u201C7\u201D in the number pad below."],
        showPreviousBtn: true,
        showNextBtn: false,
        arrow: false,
      },
      {
        id: "sb-number-pad-7",
        className: "bg-transparent z-10",
        children: (
          <div className="translate-x-1/2 translate-y-2/3 animate-pulse">
            <HandIcon fill={handFill} background="white" className="size-12 sm:size-16 md:size-20" />
          </div>
        ),
        onClick: () => {
          document.getElementById("sb-number-pad-7")?.click();
          demoNextStep();
        },
      },
    ],
    interactive: true,
    voiceover: "SM_4.mp3",
  },
  {
    elements: [
      {
        id: "sb-reference-icons",
        side: "top",
        instruction: t.SM["Be careful, the order of the symbols will change after every turn."],
        showPreviousBtn: false,
      },
    ],
    delay: 1000,
    voiceover: "SM_5.mp3",
  },
  {
    elements: [
      {
        id: "demo-center",
        instructionClassName: "-translate-y-1/2",
        instruction: t.SM["Now try out the next 3 rounds by yourself!"],
        arrow: false,
        texts: {
          next: t.GAME_SPECIFIC["Start demo"],
        },
      },
    ],
    voiceover: "SM_6.mp3",
  },
  {
    elements: [],
  },
];

export default function GameDemo() {
  const score = useRef(-1); // start from -1 since first success will increment to 0
  const [isDesktop, setIsDesktop] = useState(false);
  // ReCOGnAIze Lite re-skins the tutorial card in the orange Clinical Empathy
  // palette. Every other funnel keeps the original purple values.
  const lite = isLiteOneMode();
  const handFill = lite ? LITE.accentDeep : "#b7430a";
  resetSkipShuffle();

  useEffect(() => {
    preloadImages(IMAGES["task-2"], "/images/task-2");
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();

    if (query.addEventListener) {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }

    query.addListener(update);
    return () => query.removeListener(update);
  }, []);

  return (
    <DemoProvider
      value={{
        name: "SM",
        title: task2.title,
        steps: getSteps(isDesktop, handFill),
        texts: {},
        colors: lite
          ? {
              color: LITE.accent,
              secondaryColor: "#ffa06b",
              previousBtn1: "#FFFFFF",
              previousBtn2: "#ffdbcb",
              arrow2: "#ffdbcb",
            }
          : {
              color: task2.color,
              secondaryColor: "#A969C7",
              previousBtn1: "#FDFDFD",
              previousBtn2: "#E0D0E7",
              arrow2: "#E0D0E7",
            },
      }}
    >
      <Head>
        <meta name="theme-color" content={lite ? LITE.surface : task2.color} />
      </Head>

      <DemoScreen>
        <Task2Game
          tiles={10}
          desktopDemo={isDesktop}
          onError={() => {}}
          onSuccess={() => {
            score.current++;
            if (score.current % 3 === 0) demoNextStep();
          }}
        >
          <div className={isDesktop ? "items-center justify-between w-full f" : "items-center justify-between w-full f"}>
            <Score
              score={0}
              className={isDesktop
                ? "[font-family:Avenir] [font-weight:800] text-[26.51px] leading-[26.51px] align-middle"
                : `text-2xl font-bold leading-6 ${lite ? "" : "text-task2"}`
              }
              style={isDesktop ? { color: lite ? LITE.accent : "#630092" } : lite ? { color: LITE.accent } : undefined}
            />
            {isDesktop ? (
              <div
                className="[font-family:Avenir] [font-weight:800] text-[26.09px] leading-[100%] align-middle rounded-full c"
                style={{
                  width: 113.13,
                  height: 55.57,
                  borderRadius: 16304.32,
                  border: `2.45px solid ${lite ? LITE.accentDeep : "#3A3A3A"}`,
                  color: lite ? LITE.accentDeep : "#3A3A3A",
                  padding: "9.78px 19.57px",
                }}
              >
                {t.GAME_SPECIFIC.Demo}
              </div>
            ) : (
              <div className="origin-top-right">
                <DemoIndicator />
              </div>
            )}
          </div>
        </Task2Game>
      </DemoScreen>
    </DemoProvider>
  );
}
