import Head from "next/head";
import Router from "next/router";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import {
  CurveGlyph,
  GamepadGlyph,
  QuizGlyph,
  StepList,
} from "src/components/LiteOne/StepList";

const STEPS = [
  { label: "Play a 60-second cognitive game", icon: GamepadGlyph },
  { label: "Take a medically-backed quiz on brain health risk factors", icon: QuizGlyph },
  { label: "See how you compare to people your age", icon: CurveGlyph },
];

/** Circumference of the r=46 ring below, used to drive the draw-on animation. */
const RING_R = 46;
const RING_LEN = 2 * Math.PI * RING_R;

export default function LiteOneReady() {
  return (
    <>
      <Head>
        <title>What happens next | ReCOGnAIze Lite</title>
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8">
          <div className="w-full max-w-[440px]">
            {/* Headline — the numeral is the anchor, with a ring that draws
                once so the "3 minutes" promise feels measured, not asserted. */}
            <div className="lite-rise flex flex-col items-center text-center">
              <span className="font-display text-[26px] font-extrabold leading-none text-charcoal sm:text-[30px]">
                In the next
              </span>

              <span className="relative mt-3 inline-flex size-[124px] items-center justify-center">
                <svg viewBox="0 0 104 104" className="absolute inset-0 -rotate-90" aria-hidden>
                  <circle cx="52" cy="52" r={RING_R} fill="none" stroke="#f9ddcf" strokeWidth="3.5" />
                  <circle
                    cx="52"
                    cy="52"
                    r={RING_R}
                    fill="none"
                    stroke="#f77528"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="lite-ring-draw"
                    style={
                      {
                        strokeDasharray: RING_LEN,
                        "--ring-len": RING_LEN,
                        "--ring-offset": RING_LEN * 0.12,
                      } as React.CSSProperties
                    }
                  />
                </svg>
                <span className="font-display text-[70px] font-extrabold leading-none text-quizPrimary">
                  3
                </span>
              </span>

              <span className="mt-3 font-display text-[26px] font-extrabold leading-none text-charcoal sm:text-[30px]">
                minutes
              </span>
            </div>

            <div className="mt-10">
              <StepList steps={STEPS} />
            </div>

            <div className="lite-rise mx-auto mt-12 max-w-[320px]" style={{ animationDelay: "620ms" }}>
              <LiteButton onClick={() => Router.push("/lite-one/challenge")}>
                I&apos;m ready
              </LiteButton>
              <p className="mt-3 text-center text-[11.5px] text-quizOutline">
                No sign-up until you&apos;ve seen your score
              </p>
            </div>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
