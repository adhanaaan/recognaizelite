import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { SectionBadge } from "src/components/LiteOne/SectionBadge";
import { useResultStore } from "src/stores/useResultStore";
import { readTask2Score } from "src/utils/liteOne";

const ICONS = [
  { src: "/images/task-2/sun.png", alt: "", className: "absolute -left-2 top-[18%] size-16 lite-bob", delay: 0 },
  { src: "/images/task-2/flash.png", alt: "", className: "absolute -right-1 top-[14%] size-14 lite-rock", delay: 400 },
];

export default function LiteOneGameComplete() {
  const { result } = useResultStore();
  const score = readTask2Score(result);

  return (
    <>
      <Head>
        <title>Game complete | ReCOGnAIze Lite</title>
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-8">
          <div className="relative mx-auto w-full max-w-[440px] text-center">
            <div className="lite-rise" style={{ animationDelay: "0ms" }}>
              <SectionBadge label="1 | Cognitive Game" />
            </div>

            {ICONS.map((icon) => (
              <img
                key={icon.src}
                src={icon.src}
                alt={icon.alt}
                aria-hidden
                className={`${icon.className} lite-rise pointer-events-none select-none`}
                style={{ animationDelay: `${icon.delay + 200}ms` }}
              />
            ))}

            <h1
              className="lite-rise mt-14 font-display text-[32px] font-extrabold leading-[1.08] text-charcoal sm:text-[38px]"
              style={{ animationDelay: "100ms" }}
            >
              Game complete!
            </h1>

            <p
              className="lite-rise mt-4 text-[18px] font-semibold text-charcoal"
              style={{ animationDelay: "180ms" }}
            >
              Correct symbols: {score ?? "—"}
            </p>

            <div
              className="lite-rise mx-auto mt-16 max-w-[320px]"
              style={{ animationDelay: "300ms" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-quizOutline">
                Next
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-quizSecondary">
                Take a medically-backed quiz on brain health risk factors
              </p>
            </div>

            <div
              className="lite-rise mx-auto mt-8 max-w-[320px]"
              style={{ animationDelay: "420ms" }}
            >
              <LiteButton onClick={() => Router.push("/lite-one/quiz-intro")}>
                Continue
              </LiteButton>
            </div>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
