import Head from "next/head";
import { useEffect } from "react";
import { DemoScreen } from "src/components/Demo";
import { DemoProvider } from "src/components/Demo/DemoContext";
import { Game2 } from "src/components/Games/Task5Game/Game-2";
import IMAGES from "src/constants/IMAGES.json";
import { task5 } from "src/constants/tasks";
import { preloadImages } from "src/lib/image-cache";
import { t } from "src/lib/translations";
import { DemoStep } from "src/types";
import { demoNextStep } from "src/utils/helpers";

const steps: DemoStep[] = [
  {
    elements: [
      {
        id: "demo-center",
        instructionClassName: "-translate-y-1/2",
        instruction: t.GS["Great!\nOn to the next game mode."],
        arrow: false,
        showPreviousBtn: false,
      },
    ],
    voiceover: "GS_7.mp3",
  },
  {
    elements: [
      {
        id: "gs-required-money",
        instruction: t.GS["You are shown an amount here."],
        showPreviousBtn: false,
      },
    ],
    voiceover: "GS_8.mp3",
  },
  {
    elements: [
      {
        id: "gs-required-money",
      },
      {
        id: "gs-money-register",
        instruction:
          t.GS["Select notes and coins to match the amount shown.\nYou can use them multiple times, tap to add."],
        side: "top",
        instructionClassName: "mb-4",
        arrow: false,
      },
    ],
    voiceover: "GS_9.mp3",
  },
  {
    elements: [],
    demoNextEvent: "gs-money-add",
  },
  {
    elements: [
      {
        id: "gs-money-counter",
        instruction: t.GS["Tap on the note or coin to remove it."],
        className: "-translate-x-0.5 -translate-y-0.5 pointer-events-auto cursor-pointer",
        onClick() {
          demoNextStep("demo-cc-clear");
        },
      },
    ],
    interactive: true,
    demoNextEvent: "demo-cc-clear",
    voiceover: "GS_10.mp3",
  },
  {
    elements: [
      {
        id: "demo-center",
        instructionClassName: "-translate-y-1/2",
        instruction: t.GS["Great!\nTry the next 2 rounds by yourself."],
        arrow: false,
        showPreviousBtn: false,
        texts: {
          next: t.GAME_SPECIFIC["Start demo"],
        },
      },
    ],
    delay: 1000,
    voiceover: "GS_11.mp3",
  },
  {
    elements: [],
    demoNextEvent: "gs-game-complete",
  },
  {
    elements: [],
    demoNextEvent: "gs-game-complete",
  },
];

export default function GameDemo() {
  useEffect(() => {
    preloadImages(IMAGES["task-5"], "/images/task-5");
  }, []);

  return (
    <DemoProvider
      value={{
        steps,
        name: "GS",
        title: task5.title,
        texts: {},
        colors: {
          color: task5.color,
          secondaryColor: "#E89660",
          previousBtn1: "#FDFDFD",
          previousBtn2: "#E7D9D0",
          arrow2: "#D0E7E0",
        },
      }}
    >
      <Head>
        <meta name="theme-color" content={task5.color} />
      </Head>

      <DemoScreen>
        <Game2
          budget={10}
          onError={() => {}}
          onSuccess={() => {
            demoNextStep("gs-game-complete");
            // Reset game state for the next round after a short delay
            setTimeout(() => window.dispatchEvent(new Event("demo.reset")), 300);
          }}
        />
      </DemoScreen>
    </DemoProvider>
  );
}
