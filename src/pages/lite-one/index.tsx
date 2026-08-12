import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import {
  AssessmentTeaser,
  HeroFeaturedIn,
  HeroPill,
  HeroVideo,
  HowItWorks,
  LandingFooter,
  ProblemSection,
  ScienceBand,
  SocialProof,
  StatsSection,
  TrustBand,
  WhatYouGet,
  type PressLogo,
} from "src/components/LiteOne/LandingSections";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
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

/**
 * The hero's "as featured in" rail: the press mentions, plus PubMed for the
 * published research — the same mix b2cfunnel's full.html carries in this bar,
 * minus its own NTU lock-up, which is already on the hero and isn't somewhere
 * the test was featured. Widths differ a lot, so each height is tuned by eye.
 */
const PRESS: PressLogo[] = [
  { src: "press-cna.png", alt: "CNA", h: 26 },
  { src: "press-st.png", alt: "The Straits Times", h: 23 },
  { src: "press-alzheimers.png", alt: "Alzheimer's Association", h: 21 },
  { src: "press-zaobao.png", alt: "Lianhe Zaobao", h: 24 },
  { src: "logo-pubmed.svg", alt: "PubMed", h: 18 },
];

/**
 * ReCOGnAIze Lite — entry.
 *
 * Sets hookClinic to "LiteOne" so the shared Symbol Matching components render
 * in the orange Clinical Empathy palette, and points the post-game hand-off at
 * the game-complete screen that opens the quiz leg of the funnel.
 *
 * resetTaskProgress() matters: without it a visitor who already finished a run
 * lands on the celebration screen instead of the game.
 *
 * The page follows b2cfunnel's short homepage (`public/landing/index.html`):
 * a video hero over the co-branded lock-up, then the scrolling proof sections.
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

  const start = () => Router.push("/lite-one/ready");

  return (
    <>
      <Head>
        <title>Brain Health Check | ReCOGnAIze Lite</title>
        <meta
          name="description"
          content="You track your heart, your sleep, your blood sugar. This is the same idea for your brain: a 3-minute check and a score you can act on."
        />
        <meta property="og:title" content="You tracked everything. What about your brain?" />
        <meta
          property="og:description"
          content="Take a 3-min quiz and find out how your brain is performing."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* No shell header: the co-branded lock-up sits on the video itself, so a
          separate band above it would state the same thing twice. */}
      <LiteShell scroll showHeader={false}>
        <HeroVideo>
          <div className="lite-rise" style={{ animationDelay: "40ms" }}>
            <HeroPill>Clinically validated at NTU LKCMedicine</HeroPill>
          </div>

          <h1
            className="lite-rise mt-6 font-display text-[30px] leading-[1.16] text-white sm:text-[46px]"
            style={{ animationDelay: "110ms" }}
          >
            <span className="font-medium">You tracked </span>
            <span className="font-medium italic">everything</span>
            <br />
            <span className="font-extrabold">What about your </span>
            <span className="font-extrabold italic">brain</span>
            <span className="font-extrabold">?</span>
          </h1>

          <p
            className="lite-rise mx-auto mt-6 max-w-[420px] font-display text-[17px] font-bold leading-snug text-white/95 sm:text-[19px]"
            style={{ animationDelay: "200ms" }}
          >
            Take a 3-min quiz and find out how your brain is performing
          </p>

          <div
            className="lite-rise mx-auto mt-8 max-w-[320px]"
            style={{ animationDelay: "280ms" }}
          >
            <LiteButton onClick={start}>Get started for free</LiteButton>
          </div>

          <div className="lite-rise" style={{ animationDelay: "360ms" }}>
            <HeroFeaturedIn logos={PRESS} />
          </div>
        </HeroVideo>

        <TrustBand />
        <ProblemSection />
        <StatsSection />
        <ScienceBand />
        <HowItWorks />
        <WhatYouGet onStart={start} />
        <SocialProof />
        <AssessmentTeaser onStart={start} />
        <LandingFooter />
      </LiteShell>
    </>
  );
}
