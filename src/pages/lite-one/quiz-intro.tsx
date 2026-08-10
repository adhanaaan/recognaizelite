import Head from "next/head";
import Router from "next/router";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { SectionBadge } from "src/components/LiteOne/SectionBadge";

const PHOTOS: { label: string; color: string; rotate: string }[] = [
  { label: "Exercise", color: "#e8844a", rotate: "-3deg" },
  { label: "Yoga", color: "#7d5747", rotate: "2deg" },
  { label: "Nutrition", color: "#6c5d2e", rotate: "-4deg" },
  { label: "Sleep", color: "#4a6fa5", rotate: "3deg" },
  { label: "Hydration", color: "#5a9e6f", rotate: "-2deg" },
  { label: "Relaxation", color: "#8b6fa5", rotate: "4deg" },
];

function PhotoCard({
  label,
  color,
  rotate,
  delay,
}: {
  label: string;
  color: string;
  rotate: string;
  delay: number;
}) {
  return (
    <div
      className="lite-rise aspect-[4/3] overflow-hidden rounded-xl shadow-card"
      style={{ animationDelay: `${delay}ms`, transform: `rotate(${rotate})` }}
    >
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}30, ${color}18)` }}
      >
        <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>
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
        <div className="relative flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="lite-rise" style={{ animationDelay: "0ms" }}>
              <SectionBadge label="2 | Brain Health Quiz" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5 px-2">
              {PHOTOS.map((photo, i) => (
                <PhotoCard
                  key={photo.label}
                  {...photo}
                  delay={80 + i * 70}
                />
              ))}
            </div>

            <h1
              className="lite-rise mt-8 text-center font-display text-[28px] font-extrabold leading-[1.1] text-charcoal sm:text-[32px]"
              style={{ animationDelay: "540ms" }}
            >
              Is your brain at its peak performance?
            </h1>

            <p
              className="lite-rise mt-4 text-center text-[14.5px] leading-relaxed text-quizSecondary"
              style={{ animationDelay: "620ms" }}
            >
              Take a medically-backed quiz built on 14 modifiable risk factors to see how
              healthy your brain is.
            </p>

            <div
              className="lite-rise mx-auto mt-8 max-w-[320px]"
              style={{ animationDelay: "720ms" }}
            >
              <LiteButton onClick={() => Router.push("/lite-one/quiz")}>
                Start quiz
              </LiteButton>
            </div>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
