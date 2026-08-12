import Head from "next/head";
import Router from "next/router";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { SectionBadge } from "src/components/LiteOne/SectionBadge";

const TOP_ROW = [
  { src: "quiz-exercise", alt: "Cycling outdoors", tilt: "-7deg" },
  { src: "quiz-yoga", alt: "Stretching in a meadow", tilt: "3deg" },
  { src: "quiz-nutrition", alt: "A bowl of vegetables and grains", tilt: "-5deg" },
];

const BOTTOM_ROW = [
  { src: "quiz-sleep", alt: "Sleeping in morning light", tilt: "-3deg" },
  { src: "quiz-hydration", alt: "Drinking water by the sea", tilt: "5deg" },
  { src: "quiz-supplements", alt: "Supplements on a counter", tilt: "-8deg" },
];

/**
 * One lifestyle card. The tilt sits on an inner element because `lite-rise`
 * animates `transform`, which would otherwise cancel the rotation.
 */
function PhotoCard({
  src,
  alt,
  tilt,
  delay,
}: {
  src: string;
  alt: string;
  tilt: string;
  delay: number;
}) {
  return (
    <div className="lite-rise w-[140px] shrink-0" style={{ animationDelay: `${delay}ms` }}>
      <div
        className="overflow-hidden rounded-[18px] shadow-float"
        style={{ transform: `rotate(${tilt})` }}
      >
        <img
          src={`/images/lite-one/${src}.jpg`}
          alt={alt}
          className="block aspect-square w-full object-cover"
        />
      </div>
    </div>
  );
}

/**
 * A row of three cards, wider than the page so the outer cards run off both
 * edges as the comp shows. `left-1/2` + `-translate-x-1/2` centres the fixed
 * width on the column whatever the column measures; LiteShell clips the
 * overflow.
 */
function PhotoRow({
  items,
  baseDelay,
}: {
  items: typeof TOP_ROW;
  baseDelay: number;
}) {
  return (
    <div className="relative left-1/2 flex w-[456px] -translate-x-1/2 justify-center gap-[18px]">
      {items.map((item, i) => (
        <PhotoCard key={item.src} {...item} delay={baseDelay + i * 90} />
      ))}
    </div>
  );
}

export default function LiteOneQuizIntro() {
  return (
    <>
      <Head>
        <title>Brain Health Quiz | ReCOGnAIze Lite</title>
      </Head>

      <LiteShell>
        {/*
         * Five groups distributed by `justify-between` so the whole intro sits
         * in one viewport: badge, top photo row, headline stack, bottom photo
         * row, CTA. The middle stack takes the slack via `flex-1`, so a tall
         * screen fills naturally and a short one compresses the gap instead of
         * spilling below the fold.
         */}
        <div className="relative flex flex-1 flex-col px-6 pb-6 pt-4">
          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
            <div className="lite-rise" style={{ animationDelay: "40ms" }}>
              <SectionBadge label="2 | Brain Health Quiz" />
            </div>

            <div className="mt-4">
              <PhotoRow items={TOP_ROW} baseDelay={140} />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center py-4">
              <h1
                className="lite-rise text-center font-display text-[26px] font-extrabold leading-[1.15] text-charcoal sm:text-[30px]"
                style={{ animationDelay: "430ms" }}
              >
                Is your brain at its peak performance?
              </h1>

              <p
                className="lite-rise mx-auto mt-3 max-w-[330px] text-center text-[14px] leading-relaxed text-quizSecondary"
                style={{ animationDelay: "500ms" }}
              >
                Take a medically-backed quiz built on 14 modifiable risk factors to see how
                healthy your brain is.
              </p>
            </div>

            <div>
              <PhotoRow items={BOTTOM_ROW} baseDelay={560} />
            </div>

            <div
              className="lite-rise mx-auto mt-6 w-full max-w-[320px]"
              style={{ animationDelay: "840ms" }}
            >
              <LiteButton onClick={() => Router.push("/lite-one/quiz")}>Start quiz</LiteButton>
            </div>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
