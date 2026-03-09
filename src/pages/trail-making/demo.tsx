import dynamic from "next/dynamic";
import Head from "next/head";
import trailMakingDemo from "public/lottie/trail-making-demo.json";
import { useEffect, useState } from "react";
import { DemoScreen } from "src/components/Demo";
import { DemoProvider } from "src/components/Demo/DemoContext";
import { DemoIndicator } from "src/components/Demo/DemoIndicator";
import { Task3Game } from "src/components/Games/Task3Game";
import { Background } from "src/components/Games/Task3Game/Background";
import { getPositions } from "src/components/Games/Task3Game/points-positions";
import { HandIcon } from "src/components/Icons/HandIcon";
import IMAGES from "src/constants/IMAGES.json";
import { task3 } from "src/constants/tasks";
import { preloadImages } from "src/lib/image-cache";
import { t } from "src/lib/translations";
import { DemoStep } from "src/types";
import { demoNextStep, rotateArray } from "src/utils/helpers";

const Lottie = dynamic(
  () => import("lottie-react"),
  { ssr: false } // Disable server-side rendering for this component
);

const steps: DemoStep[] = [
  {
    elements: [
      {
        id: "tm-lottie-demo",
        instruction:
          t.TM["Start by tapping 1, then tap the smallest green area. Alternating between number and green area."],
        instructionClassName: "mt-16",
        showNextBtn: true,
        arrow: false,
      },
    ],
    hideOverlay: true,
    voiceover: "TM_2.mp3",
  },
  {
    elements: [
      {
        id: "tm-element-1",
        className: "scale-150 rounded-full",
        instruction: t.TM["Start at ‘1’. Tap it"],
        side: "top",
        instructionClassName: "mb-16",
        showPreviousBtn: true,
        showNextBtn: false,
        arrow: false,
      },
      {
        id: "tm-element-1",
        className: "bg-transparent z-10 pointer-events-auto",
        children: (
          <div className="translate-x-2/3 translate-y-2/3 animate-pulse">
            <HandIcon fill="#b7430a" background="white" className="size-12 sm:size-16 md:size-20" />
          </div>
        ),
        onClick: () => {
          document.getElementById("tm-element-1")?.click();
          demoNextStep();
        },
      },
    ],
    interactive: true,
    voiceover: "TM_2.mp3",
  },
  {
    elements: [
      {
        id: "tm-element-1",
        className: "scale-150 rounded-full",
      },
      {
        id: "tm-element-2",
        className: "scale-150 rounded-full",
        side: "top",
        instruction: t.TM["Then, tap smallest green area"],
        instructionClassName: "!mb-16",
        arrow: false,
      },
      {
        id: "tm-element-2",
        className: "bg-transparent z-10 pointer-events-auto",
        children: (
          <div className="translate-x-2/3 translate-y-2/3 animate-pulse">
            <HandIcon fill="#b7430a" background="white" className="size-12 sm:size-16 md:size-20" />
          </div>
        ),
        onClick: () => {
          document.getElementById("tm-element-2")?.click();
          demoNextStep();
        },
      },
    ],
    interactive: true,
    delay: 500,
    voiceover: "TM_3.mp3",
  },
  {
    elements: [
      {
        id: "tm-element-1",
        className: "scale-150 rounded-full",
      },
      {
        id: "tm-element-2",
        className: "scale-150 rounded-full",
      },
      {
        id: "tm-element-3",
        className: "scale-150 rounded-full",
        side: "bottom",
        arrow: false,
        instruction: t.TM["Next is the untapped smallest number, it is 2."],
        instructionClassName: "mt-80 tall:mt-96 lg:translate-x-12",
      },
      {
        id: "tm-element-3",
        className: "bg-transparent z-10 pointer-events-auto",
        children: (
          <div className="translate-x-2/3 translate-y-2/3 animate-pulse">
            <HandIcon fill="#b7430a" background="white" className="size-12 sm:size-16 md:size-20" />
          </div>
        ),
        onClick: () => {
          document.getElementById("tm-element-3")?.click();
          demoNextStep();
        },
      },
    ],
    interactive: true,
    delay: 500,
    voiceover: "TM_4.mp3",
  },
  {
    elements: [
      {
        id: "tm-element-1",
        className: "scale-150 rounded-full",
      },
      {
        id: "tm-element-2",
        className: "scale-150 rounded-full",
      },
      {
        id: "tm-element-3",
        className: "scale-150 rounded-full",
      },
      {
        id: "tm-element-4",
        className: "scale-150 rounded-full",
        side: "bottom",
        instruction: t.TM["Then find the next smallest untapped green area and tap it."],
        instructionClassName: "mt-64 tall:mt-80",
        arrow: false,
      },
      {
        id: "tm-element-4",
        className: "bg-transparent z-10 pointer-events-auto",
        children: (
          <div className="translate-x-2/3 translate-y-2/3 animate-pulse">
            <HandIcon fill="#b7430a" background="white" className="size-12 sm:size-16 md:size-20" />
          </div>
        ),
        onClick: () => {
          document.getElementById("tm-element-4")?.click();
          demoNextStep();
        },
      },
    ],
    interactive: true,
    delay: 500,
    voiceover: "TM_5.mp3",
  },
  {
    elements: [
      {
        id: "tm-element-1",
        className: "scale-150 rounded-full",
      },
      {
        id: "tm-element-2",
        className: "scale-150 rounded-full",
      },
      {
        id: "tm-element-3",
        className: "scale-150 rounded-full",
      },
      {
        id: "tm-element-4",
        side: "bottom",
        className: "scale-150 rounded-full",
        instruction: t.TM["Great"],
        instructionClassName: "mt-64 tall:mt-80",
        showPreviousBtn: false,
        arrow: false,
      },
    ],
    delay: 500,
    voiceover: "TM_6.mp3",
  },
  {
    elements: [
      {
        id: "tm-element-20",
        className: "scale-150 rounded-full",
      },
      {
        id: "demo-center",
        className: "scale-150 rounded-full",
        instruction: t.TM["Tap all the circles until you reach the very last Green Area."],
        showPreviousBtn: false,
        arrow: false,
      },
    ],
  },
  {
    elements: [
      {
        id: "tm-element-7",
        className: "scale-150 rounded-full",
        children: (
          <div
            ref={(ref) => {
              const element = document.getElementById("tm-element-7")!;
              if (ref) {
                element.style.setProperty("--gradient-start", "#CF5B5B");
                element.style.setProperty("--gradient-end", "#860202");
                element.style.setProperty("--text-color", "#FC0303");
                element.style.setProperty("--number-bg", "#FDEDED");
              } else {
                element.style.setProperty("--gradient-start", "#5BCFAC");
                element.style.setProperty("--gradient-end", "#02865E");
                element.style.setProperty("--text-color", "#3A3A3A");
                element.style.setProperty("--number-bg", "white");
              }
            }}
          />
        ),
      },
      {
        id: "demo-center",
        className: "scale-150 rounded-full",
        instruction: t.TM["Be careful where you tap, tapping in the wrong order will lead to this."],
        arrow: false,
      },
    ],
  },
  {
    elements: [
      {
        id: "demo-center",
        instructionClassName: "-translate-y-1/2",
        instruction: t.TM["Now try tapping the next 4 by yourself."],
        arrow: false,
        texts: {
          next: t.GAME_SPECIFIC["Start demo"],
        },
      },
    ],
    voiceover: "TM_7.mp3",
  },
  { elements: [], interactive: true },
];

const positions = rotateArray(getPositions(), 9);

export default function GameDemo() {
  const [showRecordingScreen, setShowRecordingScreen] = useState(true);

  useEffect(() => {
    preloadImages(IMAGES["task-3"], "/images/task-3");
  }, []);

  useEffect(() => {
    if (showRecordingScreen) {
      const cb = () => setShowRecordingScreen(false);
      window.addEventListener("demo.next.0", cb);
      return () => window.removeEventListener("demo.next.0", cb);
    } else {
      const cb = () => setShowRecordingScreen(true);
      window.addEventListener("demo.prev.1", cb);
      return () => window.removeEventListener("demo.prev.1", cb);
    }
  }, [showRecordingScreen]);

  return (
    <DemoProvider
      value={{
        name: "TM",
        title: task3.title,
        steps,
        texts: {},
        colors: {
          color: task3.color,
          secondaryColor: "#5BCFAC",
          previousBtn1: "#FDFDFD",
          previousBtn2: "#D0E7E0",
          arrow2: "#D0E7E0",
        },
      }}
    >
      <Head>
        <meta name="theme-color" content={task3.color} />
      </Head>

      <DemoScreen>
        {showRecordingScreen ? (
          <Background className="cc">
            <div id="tm-lottie-demo" style={{ width: 285, height: 285 }}>
              <Lottie autoPlay loop animationData={trailMakingDemo} />
            </div>
            <div className="size-60" />
          </Background>
        ) : (
          <Task3Game points={20} positions={positions} onSuccess={() => {}} onError={() => {}} onComplete={() => {}}>
            <div className="justify-end f">
              <DemoIndicator />
            </div>
          </Task3Game>
        )}
      </DemoScreen>
    </DemoProvider>
  );
}
