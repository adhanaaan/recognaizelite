import Head from "next/head";
import { useEffect } from "react";
import { DemoScreen } from "src/components/Demo";
import { DemoProvider } from "src/components/Demo/DemoContext";
import { Game1 } from "src/components/Games/Task5Game/Game-1";
import { HandIcon } from "src/components/Icons/HandIcon";
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
        id: "gs-shopping-list-items",
        instruction: t.GS["A shopping list of items will be shown."],
        instructionClassName: "-mt-12 tall:-mt-4",
        className: "rounded-3xl scale-110 tall:-translate-y-1/4 -translate-y-1/3",
        arrow: false,
      },
    ],
    voiceover: "GS_2.mp3",
  },
  {
    elements: [
      {
        id: "gs-shopping-list-timer",
        className: "rounded-3xl scale-150",
        instruction: t.GS["Memorise within the given time.\nYou can view it again later."],
        arrowStyle: { transform: "translateX(100px)" },
      },
    ],
    voiceover: "GS_3.mp3",
  },
  {
    elements: [
      {
        id: "gs-conveyor",
        instruction: t.GS["Items will appear below here.\nTap to select those in the shopping list."],
        instructionClassName: "mb-10",
        arrow: false,
        showPreviousBtn: false,
        side: "top",
      },
    ],
    voiceover: "GS_6.mp3",
    delay: 500,
  },
  {
    elements: [
      {
        id: "gs-shopping-list",
        instruction: t.GS["Tap here to open the list to view the items again."],
      },
      {
        id: "gs-shopping-list",
        className: "bg-transparent pointer-events-auto cursor-pointer",
        children: (
          <div className="absolute z-50 left-1/2 bottom-8 animate-pulse">
            <HandIcon fill="#87430a" className="size-12 sm:size-16 md:size-20" />
          </div>
        ),
        onClick() {
          document.getElementById("gs-shopping-list-arrow")?.click();
          demoNextStep();
        },
      },
    ],
    interactive: true,
    voiceover: "GS_4.mp3",
  },
  {
    elements: [
      {
        id: "gs-shopping-list",
        instruction: t.GS["Tap here to close the list."],
        instructionClassName: "mt-4",
        arrow: false,
      },
      {
        id: "gs-shopping-list",
        className: "bg-transparent pointer-events-auto cursor-pointer",
        children: (
          <div className="absolute z-50 left-1/2 bottom-12 animate-pulse">
            <HandIcon fill="#87430a" className="size-12 sm:size-16 md:size-20" />
          </div>
        ),
        onClick() {
          document.getElementById("gs-shopping-list-arrow")?.click();
          demoNextStep();
        },
      },
    ],
    delay: 500,
    interactive: true,
    voiceover: "GS_5.mp3",
  },
  {
    elements: [
      {
        id: "gs-conveyor",
        instruction: t.GS["Try finding 2 items!\nRemember you can open the list again."],
        instructionClassName: "mb-10",
        arrow: false,
        showPreviousBtn: false,
        side: "top",
        texts: {
          next: t.GAME_SPECIFIC["Start demo"],
        },
      },
    ],
    voiceover: "GS_6.mp3",
  },
  {
    elements: [],
    interactive: true,
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
        <Game1 retries={3} shoppingListSize={2} time={60} onError={() => {}} onSuccess={demoNextStep} />
      </DemoScreen>
    </DemoProvider>
  );
}
