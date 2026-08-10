import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { SectionBadge } from "src/components/LiteOne/SectionBadge";
import { setAppLanguage } from "src/lib/translations";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { resetQuestionnaire } from "src/stores/useQuestionnaireStore";
import {
  setAssessmentMode,
  setHookClinic,
  setHookEntryPath,
  setHookReportPath,
} from "src/utils/assessment";

/** "As seen on" row. Widths differ a lot, so each height is tuned by eye. */
const PRESS = [
  { src: "press-alzheimers", alt: "Alzheimer's Association", h: 23 },
  { src: "press-cna", alt: "CNA", h: 29 },
  { src: "press-st", alt: "The Straits Times", h: 25 },
  { src: "press-zaobao", alt: "Lianhe Zaobao", h: 27 },
];

/**
 * A photo in the hero collage.
 *
 * The rotation lives on an inner element: `lite-rise` animates `transform`, so
 * a tilt on the same node would be overwritten the moment the entrance runs.
 */
function CollageCard({
  src,
  alt,
  tilt,
  delay,
  className,
}: {
  src: string;
  alt: string;
  tilt: string;
  delay: number;
  className: string;
}) {
  return (
    <div className={`lite-rise absolute z-10 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="overflow-hidden rounded-2xl shadow-float" style={{ transform: `rotate(${tilt})` }}>
        <img src={`/images/lite-one/${src}.jpg`} alt={alt} className="block w-full" />
      </div>
    </div>
  );
}

/** A floating symptom label over the collage. */
function Chip({
  label,
  delay,
  className,
  bob,
}: {
  label: string;
  delay: number;
  className: string;
  bob?: boolean;
}) {
  return (
    <div className={`lite-rise absolute z-20 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <span
        className={`block whitespace-nowrap rounded-full bg-quizSurface-lowest px-3 py-1.5 text-[12.5px] font-medium text-charcoal shadow-card ${bob ? "lite-bob" : ""}`}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * ReCOGnAIze Lite — entry.
 *
 * Sets hookClinic to "LiteOne" so the shared Symbol Matching components render
 * in the orange Clinical Empathy palette, and points the post-game hand-off at
 * the game-complete screen that opens the quiz leg of the funnel.
 *
 * resetTaskProgress() matters: without it a visitor who already finished a run
 * lands on the celebration screen instead of the game.
 */
export default function LiteOneEntry() {
  useEffect(() => {
    setAppLanguage("ENGLISH");
    setHookClinic("LiteOne");
    setHookEntryPath("/lite-one");
    setHookReportPath("/lite-one/game-complete");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
  }, []);

  return (
    <>
      <Head>
        <title>Brain Health Check | ReCOGnAIze Lite</title>
        <meta
          name="description"
          content="You track your heart, your sleep, your blood sugar. This is the same idea for your brain: a 3-minute check and a score you can act on."
        />
        <meta property="og:title" content="You tracked everything. How about your brain?" />
        <meta
          property="og:description"
          content="Take a 3-min quiz and find out how your brain is performing."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-5">
          <div className="w-full max-w-[440px] text-center">
            <div className="lite-rise" style={{ animationDelay: "40ms" }}>
              <SectionBadge label="Brain Health Check" />
            </div>

            <h1
              className="lite-rise mt-5 font-display text-[27px] leading-[1.16] text-charcoal sm:text-[30px]"
              style={{ animationDelay: "110ms" }}
            >
              <span className="font-medium">You tracked </span>
              <span className="font-medium italic">everything</span>
              <br />
              <span className="font-extrabold">How about your </span>
              <span className="font-extrabold italic">brain</span>
              <span className="font-extrabold">?</span>
            </h1>

            {/* Hero collage — two photos under three floating symptom labels. */}
            <div className="relative mx-auto mt-7 h-[196px] w-full max-w-[326px]">
              <CollageCard
                src="landing-focus"
                alt="Losing the thread in a conversation"
                tilt="-5deg"
                delay={220}
                className="left-[1%] top-[13%] w-[47%]"
              />
              <CollageCard
                src="landing-insomnia"
                alt="Lying awake at night"
                tilt="4.5deg"
                delay={330}
                className="right-[1%] top-[2%] w-[46%]"
              />

              <Chip label="Stress" delay={470} className="left-[22%] top-[-4%]" bob />
              <Chip label="Lost train of thoughts" delay={550} className="left-0 bottom-[-2%]" />
              <Chip label="Insomnia" delay={620} className="right-0 bottom-[19%]" bob />
            </div>

            <p
              className="lite-rise mx-auto mt-7 max-w-[300px] font-display text-[17px] font-bold leading-snug text-charcoal"
              style={{ animationDelay: "700ms" }}
            >
              Take a 3-min quiz and find out how your brain is performing
            </p>

            <div className="lite-rise mt-7" style={{ animationDelay: "780ms" }}>
              <p className="text-[11.5px] font-bold text-quizSecondary">As seen on:</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                {PRESS.map((logo) => (
                  <img
                    key={logo.src}
                    src={`/images/lite-one/${logo.src}.png`}
                    alt={logo.alt}
                    style={{ height: logo.h }}
                    className="w-auto opacity-90"
                  />
                ))}
              </div>
            </div>

            <div className="lite-rise mx-auto mt-8 max-w-[320px]" style={{ animationDelay: "860ms" }}>
              <LiteButton onClick={() => Router.push("/lite-one/ready")}>
                Get started for free
              </LiteButton>
              <p className="mt-3 text-[11.5px] text-quizOutline">
                60-second test · Nothing to install
              </p>
            </div>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
