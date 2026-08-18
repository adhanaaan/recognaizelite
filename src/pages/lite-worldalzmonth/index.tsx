import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import {
  HeroFeaturedIn,
  HeroPill,
  HeroVideo,
  TrustBand,
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
import { LITE_WORLDALZ } from "src/utils/liteOne";

/**
 * The hero's "as featured in" rail: the press mentions, plus PubMed for the
 * published research. Widths differ a lot, so each height is tuned by eye.
 */
const PRESS: PressLogo[] = [
  { src: "press-cna.svg", alt: "CNA", h: 30 },
  { src: "press-st.svg", alt: "The Straits Times", h: 30 },
  { src: "press-alzheimers-brand.svg", alt: "Alzheimer's Association", h: 22 },
  { src: "press-zaobao.svg", alt: "Lianhe Zaobao", h: 30 },
  { src: "logo-pubmed.svg", alt: "PubMed", h: 20 },
];

/**
 * World Alzheimer's Month — entry.
 *
 * A copy of /lite-one aimed at the email list: same game, same quiz, same
 * report, its own routes and its own leads table (public.liteworldalz_leads)
 * so campaign numbers never blend into the /lite-one baseline. Individual
 * sends are separated within that table by utm_campaign, which
 * LITE_WORLDALZ.defaultCampaign backstops when a link arrives without one.
 *
 * It starts as a copy-for-copy duplicate on purpose — this is the control the
 * campaign variants get measured against, so divergence should be deliberate.
 *
 * hookClinic is "LiteWorldAlz", which isLiteOneMode() also matches, so the
 * shared Symbol Matching components render in the same orange Clinical Empathy
 * palette. hookReportPath is what actually splits the two funnels after the
 * game: it points the post-game hand-off at this funnel's game-complete screen.
 *
 * resetTaskProgress() matters: without it a visitor who already finished a run
 * lands on the celebration screen instead of the game.
 */
export default function WorldAlzEntry() {
  useEffect(() => {
    setAppLanguage("ENGLISH");
    setHookClinic(LITE_WORLDALZ.hookClinic);
    setHookEntryPath(LITE_WORLDALZ.basePath);
    setHookReportPath(`${LITE_WORLDALZ.basePath}/game-complete`);
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
  }, []);

  const start = () => Router.push(`${LITE_WORLDALZ.basePath}/ready`);

  return (
    <>
      <Head>
        <title>Brain Health Check | Recog-Lite</title>
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
        {/*
         * The whole page is meant to sit above the fold, so the hero has no
         * fixed height of its own — `flex flex-col` here plus `flex-1` on
         * HeroVideo makes it fill exactly whatever the trust band doesn't
         * need, on any viewport, with no dead space and no cropping.
         * `min-h-[100dvh]` is a floor, not a fixed height: on a viewport
         * taller than the content needs, the hero simply grows to fill it.
         */}
        <div className="flex min-h-[100dvh] flex-col">
          <HeroVideo>
            {/*
             * Three groups, spread by HeroVideo's `justify-between`: the pill
             * near the top under the lock-up, the headline stack in the middle,
             * and the featured-in bar at the bottom above the cream fade.
             */}
            <div className="lite-rise" style={{ animationDelay: "40ms" }}>
              <HeroPill>Clinically validated at NTU LKCMedicine</HeroPill>
            </div>

            <div className="flex flex-col items-center">
              <h1
                className="lite-rise font-display text-[30px] leading-[1.16] text-white sm:text-[46px]"
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
                className="lite-rise mt-6 max-w-[420px] font-display text-[17px] font-bold leading-snug text-white/95 sm:text-[19px]"
                style={{ animationDelay: "200ms" }}
              >
                Take a 3-min quiz and find out how your brain is performing
              </p>

              <div
                className="lite-rise mt-8 w-full max-w-[320px]"
                style={{ animationDelay: "280ms" }}
              >
                <LiteButton onClick={start}>Get started for free</LiteButton>
              </div>
            </div>

            <div className="lite-rise" style={{ animationDelay: "360ms" }}>
              <HeroFeaturedIn logos={PRESS} />
            </div>
          </HeroVideo>

          <TrustBand />
        </div>
      </LiteShell>
    </>
  );
}
