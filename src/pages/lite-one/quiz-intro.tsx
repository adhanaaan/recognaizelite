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
        <div className="relative flex flex-1 flex-col justify-center overflow-y-auto px-6 py-5">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="lite-rise" style={{ animationDelay: "40ms" }}>
              <SectionBadge label="2 | Brain Health Quiz" />
            </div>

            <div className="mt-5">
              <PhotoRow items={TOP_ROW} baseDelay={140} />
            </div>

            <h1
              className="lite-rise mt-8 text-center font-display text-[27px] font-extrabold leading-[1.15] text-charcoal sm:text-[30px]"
              style={{ animationDelay: "430ms" }}
            >
              Is your brain at its peak performance?
            </h1>

            <p
              className="lite-rise mx-auto mt-3.5 max-w-[330px] text-center text-[14px] leading-relaxed text-quizSecondary"
              style={{ animationDelay: "500ms" }}
            >
              Take a medically-backed quiz built on 14 modifiable risk factors to see how
              healthy your brain is.
            </p>

            <div className="mt-8">
              <PhotoRow items={BOTTOM_ROW} baseDelay={560} />
            </div>

            <div
              className="lite-rise mx-auto mt-9 max-w-[320px]"
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
