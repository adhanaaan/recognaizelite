import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { DemoProvider } from "src/components/Demo/DemoContext";
import { DemoIndicator } from "src/components/Demo/DemoIndicator";
import { DemoScreen } from "src/components/Demo/DemoScreen";
import { Task4Game } from "src/components/Games/Task4Game";
import { HandIcon } from "src/components/Icons/HandIcon";
import { LivesTracker } from "src/components/LivesTracker";
import { task4Levels } from "src/constants/game-levels";
import IMAGES from "src/constants/IMAGES.json";
import { task4 } from "src/constants/tasks";
import { useDemoReset } from "src/hooks/useDemoReset";
import { preloadImages } from "src/lib/image-cache";
import { t } from "src/lib/translations";
import { DemoStep } from "src/types";
import { demoNextStep } from "src/utils/helpers";

function getSteps(isDesktop: boolean): DemoStep[] {
  return [
  {
    elements: [
      {
        id: "ag-game-type",
        className: "rounded-full scale-150",
        instruction: t.AG["Take note of the colour."],
      },
    ],
    voiceover: "AG_2.mp3",
  },
  {
    elements: [
      {
        id: "ag-fly-area",
        className: "touch-none scale-x-125",
        instruction: t.AG["Find the plane in the same colour.\nIn this case, find the blue plane."],
        instructionClassName: "mb-5",
        arrow: false,
        side: "top",
        style: { transform: "translate(-50%,-100%)" },
      },
    ],
    voiceover: "AG_3.mp3",
  },
  {
    elements: [
      {
        id: "ag-button-up",
        className: "scale-125",
        instruction: isDesktop
          ? t.AG["Since the blue plane is facing up, click/type the up arrow."]
          : t.AG["Since the blue plane is facing up, tap the up arrow."],
        instructionClassName: "mb-5",
        arrow: false,
        side: "top",
        style: { transform: "translate(-50%,-100%)" },
      },
      {
        id: "ag-button-up",
        className: "bg-transparent",
        children: (
          <div className="absolute z-50 inset-0 flex items-center justify-center hand-show-delay">
            <HandIcon fill="#01506c" className="size-12 sm:size-14 md:size-16 hand-tap-animation" />
          </div>
        ),
      },
    ],
    interactive: true,
    demoNextEvent: "ag-success",
    voiceover: "AG_4.mp3",
  },
  {
    elements: [
      {
        id: "ag-game-type",
        className: "rounded-full scale-150",
        instruction: t.AG["The colour is now Orange."],
        showPreviousBtn: false,
      },
    ],
    voiceover: "AG_2.mp3",
  },
  {
    elements: [
      {
        id: "ag-button-down",
        className: "scale-125",
        instruction: isDesktop
          ? t.AG["The orange plane is facing down, click/type the down arrow."]
          : t.AG["The orange plane is facing down, tap the down arrow."],
        instructionClassName: "mb-5",
        arrow: false,
        side: "top",
        style: { transform: "translate(-50%,-100%)" },
      },
      {
        id: "ag-button-down",
        className: "bg-transparent",
        children: (
          <div className="absolute z-50 inset-0 flex items-center justify-center hand-show-delay">
            <HandIcon fill="#87430a" className="size-12 sm:size-14 md:size-16 hand-tap-animation" />
          </div>
        ),
      },
    ],
    interactive: true,
    demoNextEvent: "ag-success",
    voiceover: "AG_5.mp3",
  },
  {
    elements: [
      {
        id: "demo-center",
        instruction: t.AG["Great!\nBe careful, a plane can move in a different direction than it’s facing."],
        instructionClassName: "-translate-y-1/2",
        showPreviousBtn: false,
        arrow: false,
      },
    ],
    voiceover: "AG_6.mp3",
    delay: 300,
  },
  {
    elements: [
      {
        id: "ag-target-plane",
        className: "touch-none scale-x-[100] scale-y-[2.5]",
        instruction: isDesktop
          ? t.AG["Like this.\nIn this case, click/type the up arrow instead of the right arrow."]
          : t.AG["Like this.\nIn this case, tap the up arrow instead of the right arrow."],
        instructionClassName: "mb-20",
        arrow: false,
        side: "top",
        style: { transform: "translate(-50%,-100%)" },
      },
    ],
    demoNextEvent: "ag-success",
    voiceover: "AG_4.mp3",
  },
  {
    elements: [
      {
        id: "lives-tracker",
        className: "rounded-full scale-125",
        instruction: isDesktop
          ? t.AG["If you click/type the wrong arrow, you lose a heart. Losing all the heart will cause the game to end."]
          : t.AG["If you tap the wrong arrow, you lose a heart. Losing all the heart will cause the game to end."],
        instructionClassName: "lg:translate-x-28",
        arrowStyle: { transform: "translateX(-120px)" },
      },
    ],
    voiceover: "AG_2.mp3",
  },
  {
    elements: [
      {
        id: "demo-center",
        arrow: false,
        instruction: isDesktop
          ? t.AG["Now try clicking/typing the arrows for the next 3 by yourself."]
          : t.AG["Now try tapping the arrows for the next 3 by yourself."],
        instructionClassName: "-translate-y-1/2",
        texts: {
          next: t.GAME_SPECIFIC["Start demo"],
        },
      },
    ],
    voiceover: "AG_9.mp3",
  },
  { elements: [], demoNextEvent: "ag-success-complete" },
  ];
}

export default function GameDemo() {
  const [gameLevel, setGameLevel] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const { planes, lives } = task4Levels[0];
  const steps = useMemo(() => getSteps(isDesktop), [isDesktop]);

  const [avlLives, setAvlLives] = useState(lives);
  useEffect(() => {
    preloadImages(IMAGES["task-4"], "/images/task-4");
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

  useEffect(() => {
    const disablePullToRefresh = (e: TouchEvent) => {
      if (e.touches.length > 1 || e.touches[0].clientY > 0) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", disablePullToRefresh, { passive: false });

    return () => document.removeEventListener("touchmove", disablePullToRefresh);
  }, []);

  useEffect(() => {
    const fn = () => setGameLevel(3);
    window.addEventListener("demo.next.8", fn);
    return () => window.removeEventListener("demo.next.8", fn);
  }, []);

  useDemoReset(() => {
    setGameLevel(3);
  });

  return (
    <DemoProvider
      value={{
        name: "AG",
        title: task4.title,
        steps: steps,
        texts: {},
        colors: {
          color: task4.color,
          secondaryColor: "#48BFD8",
          previousBtn1: "#FDFDFD",
          previousBtn2: "#D0E3E7",
          arrow2: "#D0E3E7",
        },
      }}
    >
      <Head>
        <meta name="theme-color" content={task4.color} />
      </Head>

      <DemoScreen>
        <Task4Game
          key={gameLevel * 100 + avlLives}
          gameLevel={gameLevel}
          planes={planes[gameLevel]}
          onSuccess={() => {
            demoNextStep("ag-success");
            setGameLevel(gameLevel + 1);
            if (gameLevel + 1 === 6) {
              demoNextStep("ag-success-complete");
            }
          }}
          onError={() => setAvlLives(avlLives - 1)}
        >
          <>
            <div className="justify-between f">
              <LivesTracker lives={lives} avlLives={lives} />
              <DemoIndicator />
            </div>
            <div className="items-center gap-2 f">
              <div className="font-bold">
                {gameLevel}/{planes.length}
              </div>
              <div className="h-3 overflow-hidden bg-white rounded-full grow scal">
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
      </DemoScreen>
    </DemoProvider>
  );
}
