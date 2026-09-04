import {
  MotionConfig,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { ConsentCheckbox } from "src/components/LiteOne/ConsentCheckbox";
import {
  MotionRadar,
  MotionScoreCurve,
  RiskMeter,
  RiskTrendChart,
} from "src/components/LiteOne/ReportV2/charts";
import {
  Cascade,
  CountUp,
  EyebrowV2,
  ScrollerContext,
  SectionDots,
  Serif,
  SnapSection,
  pop,
  rise,
  stagger,
} from "src/components/LiteOne/ReportV2/motion";
import { ScrollMoreCue } from "src/components/LiteOne/ReportV2/ScrollMoreCue";
import { useReportData } from "src/components/LiteOne/ReportV2/useReportData";
import { RANK_GRADIENT } from "src/components/LiteOne/ReportLab/visuals";
import { liteEventReportCopy } from "src/data/liteEventReportCopy";
import type {
  LiteTwoBand,
  LiteTwoCopyCtx,
  LiteTwoPersona,
} from "src/data/liteTwoReportContent";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import {
  NTU_HOMECOMING,
  readReportInterest,
  recordReportInterest,
  stashReportInterest,
} from "src/utils/liteOne";

/**
 * /lite-event/ntuhomecoming — the NTU Homecoming copy of this /lite-event-template screen.
 *
 * The event link for NTU Homecoming: /lite-event-template taken page for page,
 * the report's CTA trial included, so a guest sees exactly what the template
 * shows. Nothing here diverges; what is this event's alone is the campaign its
 * rows carry. See NTU_HOMECOMING in src/utils/liteOne.ts.
 *
 * The closing is the template's trial, carried over. /lite-event's report ends
 * on a price card and a button to the voucher page; this one keeps every
 * personalised line above it and swaps the commerce for two things the booth
 * team can act on: an "I'm interested" button under the three steps, and a
 * "What happens next" card that names the in-person next step and ends on a
 * tips opt-in. Both are recorded, keyed by the run's attempt id, in
 * liteevent_report_interest (migration 020) via /api/lite-report-interest —
 * see recordReportInterest. report-full.tsx still exists but nothing here
 * links to it any more.
 */

/**
 * /lite-event/ntuhomecoming's report — the v2 scroll-snapped story, personalised.
 *
 * The layout, charts and motion are /lite-one/report-v2's, unchanged. What
 * moved is the wording: every line that differs between the four RevitalAIze
 * v2 designs lives in src/data/liteTwoReportContent.ts, keyed by
 *
 *   persona — optimizers (under 40) vs seniors (quiz age 40-49, 50-59, 60+)
 *   band    — strong (severity High) vs weak-adequate (everything else)
 *
 * so this page picks one of four copy sets and renders the same skeleton.
 *
 * globals.css pins html/body/#__next to 100dvh with overflow hidden for the
 * game screens. This page scrolls inside its own 100dvh container, which is
 * also what the scroll-snapping and every scroll-linked animation are
 * anchored to. Nothing global is touched, so the game screens and the other
 * report pages are unaffected.
 *
 * With no finished game on the device it renders a sample result plus a
 * preview banner. For design review, ?persona=senior|optimizer and
 * ?band=strong|weak force a variant without playing a run.
 */

const DARK_BAND = "linear-gradient(168deg,#2A1206 0%,#5C1E07 46%,#B23A0C 100%)";

/**
 * The scroll-dot rail's ids are structural, so they stay here; the labels beside
 * them, the how-it-works rows and the radar axis names are all the visitor's to
 * read, so they come from the copy set inside the component.
 */
const SECTION_IDS = [
  "rank",
  "meaning",
  "risk",
  "baseline",
  "recognaize",
  "next",
  "closing",
] as const;

/** The closing quotes name the product; keep its serif accent when they do. */
function withRecognaizeSerif(text: string): React.ReactNode {
  const parts = text.split("ReCOGnAIze");
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 && <Serif>ReCOGnAIze</Serif>}
      {part}
    </React.Fragment>
  ));
}

export default function NtuHomecomingReport() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const heroRef = React.useRef<HTMLDivElement>(null);
  // Watched by ScrollMoreCue: on a viewport too short to show the hero's own
  // scroll cue (a landscape iPad, chiefly) a floating one takes over.
  const inlineCueRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { query } = useRouter();

  const data = useReportData(NTU_HOMECOMING);
  const { strong, senior, isSample, name, riskFill } = data;
  const meterBand = data.quiz?.band ?? "moderate";
  // `useReportData` hands back English labels (they come from the shared scoring
  // engine and the report API); the report renders this funnel's language, so
  // each one is looked up rather than printed as it arrives.
  const domain = t.report.domainName;
  const riskBand = t.report.bandLabels[meterBand] ?? data.riskBand;
  const factorChips = Array.from(new Set(data.riskFactors))
    .slice(0, 5)
    .map((label) => t.report.factorLabels[label] ?? label);

  // The rail's labels are the shared set, except the slot the offer used to
  // fill: that label still names /lite-event's price card, so this funnel's
  // closing carries its own.
  const sections = SECTION_IDS.map((id, i) => ({
    id,
    label: id === "next" ? t.report.nextSectionLabel : t.report.sections[i],
  }));

  // ?persona= and ?band= force a variant for design review; the visitor's own
  // run decides otherwise.
  const persona: LiteTwoPersona =
    query.persona === "senior" || query.persona === "optimizer"
      ? query.persona
      : senior
        ? "senior"
        : "optimizer";
  const band: LiteTwoBand =
    query.band === "strong" || query.band === "weak" ? query.band : strong ? "strong" : "weak";
  const copy = liteEventReportCopy(lang, persona, band);

  // In preview mode the sample run is an optimizer's strong result, so a
  // variant forced by query would contradict its own numbers. Bend the sample
  // to the variant being reviewed; real runs pass through untouched.
  const previewWeak = isSample && band === "weak";
  const previewSenior = isSample && persona === "senior";
  const percentile = previewWeak ? (persona === "senior" ? 25 : 30) : data.percentile;
  const topBand = Math.max(1, 100 - percentile);
  const avgSeconds = previewWeak
    ? persona === "senior"
      ? "1.02"
      : "0.61"
    : data.avgSeconds;
  const quizAgeLabel = data.quizAge ? t.report.quizAgeLabels[data.quizAge] ?? null : null;
  const ageLabel = previewSenior ? t.report.quizAgeLabels["60+"] : quizAgeLabel;

  const ctx: LiteTwoCopyCtx = {
    name,
    percentile,
    topBand,
    domain,
    avgSeconds,
    ageLabel,
  };

  const ageChip = ageLabel
    ? t.report.agedChip(ageLabel)
    : data.ageRange
      ? t.report.agedChip(data.ageRange)
      : t.report.allAges;

  const peers = data.ageRange ? t.report.peopleAged(data.ageRange) : t.report.peopleYourAge;

  const [shared, setShared] = React.useState(false);

  // The closing's two trackers. Hydrated from the device copy so a refresh
  // shows the same state the run's row holds; each change is mirrored there
  // and posted, best-effort, to /api/lite-report-interest.
  const [interested, setInterested] = React.useState(false);
  const [tipsOptIn, setTipsOptIn] = React.useState(false);
  React.useEffect(() => {
    const stored = readReportInterest(NTU_HOMECOMING);
    if (stored) {
      setInterested(stored.interested);
      setTipsOptIn(stored.tipsOptIn);
    }
  }, []);
  const markInterested = () => {
    if (interested) return;
    setInterested(true);
    stashReportInterest({ interested: true }, NTU_HOMECOMING);
    void recordReportInterest({ interested: true }, NTU_HOMECOMING, { lang });
  };
  const toggleTips = (next: boolean) => {
    setTipsOptIn(next);
    stashReportInterest({ tipsOptIn: next }, NTU_HOMECOMING);
    void recordReportInterest({ tipsOptIn: next }, NTU_HOMECOMING, { lang });
  };
  const share = async (text: string) => {
    const url = typeof window === "undefined" ? "" : `${window.location.origin}${NTU_HOMECOMING.basePath}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: t.report.shareSheetTitle, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      // Cancelled share sheets and blocked clipboards both land here; an
      // error toast on a share button reads as a bug.
    }
  };
  const shareScore = () => share(t.report.shareScore(percentile, peers));

  // Sticky header: transparent over the hero, frosted once the page moves.
  const { scrollY } = useScroll({ container: scrollerRef });
  const headerBg = useTransform(scrollY, [0, 90], ["rgba(255,248,243,0)", "rgba(255,248,243,0.88)"]);
  const headerLine = useTransform(scrollY, [0, 90], ["rgba(242,221,206,0)", "rgba(242,221,206,1)"]);
  const headerBlurPx = useTransform(scrollY, [0, 90], [0, 10]);
  const headerBlur = useMotionTemplate`blur(${headerBlurPx}px)`;

  // Hero parallax: the glow and triangles drift as the rank scrolls away,
  // and the scroll cue gets out of the reader's way.
  const { scrollYProgress: heroGone } = useScroll({
    container: scrollerRef,
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const glowY = useTransform(heroGone, [0, 1], [0, -110]);
  const triangleY = useTransform(heroGone, [0, 1], [0, 140]);
  const triangleRotate = useTransform(heroGone, [0, 1], [0, 24]);
  const cueOpacity = useTransform(heroGone, [0, 0.18], [1, 0]);

  return (
    <>
      <Head>
        <title>{t.report.headTitle}</title>
        <meta name="theme-color" content="#FFF8F3" />
        <meta name="robots" content="noindex" />
        {/* Lora is only used on the v2 report pages, so it loads here rather
            than in _app; the Google Fonts preconnects are already global. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </Head>

      <MotionConfig reducedMotion="user">
        <ScrollerContext.Provider value={scrollerRef}>
          <div
            ref={scrollerRef}
            className="scroll-hidden h-[100dvh] w-full snap-y snap-proximity overflow-y-auto overflow-x-hidden overscroll-contain bg-[#FFF8F3] font-jakarta text-[#241610] antialiased"
          >
            {/* ------------------------------------------------ header --- */}
            <motion.header
              className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 sm:px-8"
              style={{
                backgroundColor: headerBg,
                backdropFilter: headerBlur,
                WebkitBackdropFilter: headerBlur,
                borderBottom: "1px solid",
                borderBottomColor: headerLine,
              }}
            >
              <img
                src="/images/lite-one/logo-gray-matter.svg"
                alt="Gray Matter Solutions"
                className="h-[26px] w-auto"
              />
              <button
                type="button"
                onClick={shareScore}
                className="rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_10px_22px_-10px_rgba(214,47,22,0.55)] transition-transform active:scale-[0.97]"
                style={{ background: RANK_GRADIENT }}
              >
                {shared ? t.report.shared : t.report.share}
              </button>
            </motion.header>

            <SectionDots sections={sections} gradient={RANK_GRADIENT} />

            <ScrollMoreCue
              inlineCueRef={inlineCueRef}
              label={t.report.moreBelow}
              gradient={RANK_GRADIENT}
            />

            {/* ------------------------------------------- 1 · the rank --- */}
            <div ref={heroRef}>
              <SnapSection
                id="rank"
                snapAlways
                className="-mt-[65px]"
                backdrop={
                  <>
                    {/* warm light spilling from the top */}
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
                      style={{
                        y: reduced ? 0 : glowY,
                        background:
                          "radial-gradient(120% 75% at 50% -12%, #FAE0C7 0%, #FCF0E5 52%, rgba(255,247,242,0) 100%)",
                      }}
                    />
                    {/* soft geometry behind the card */}
                    <motion.svg
                      aria-hidden
                      viewBox="0 0 200 180"
                      className="pointer-events-none absolute -right-16 bottom-[-40px] w-[300px] text-[#F6DFC9] opacity-70"
                      style={{ y: reduced ? 0 : triangleY, rotate: reduced ? 0 : triangleRotate }}
                    >
                      <path d="M100 8 L192 172 L8 172 Z" fill="currentColor" />
                    </motion.svg>
                    <motion.svg
                      aria-hidden
                      viewBox="0 0 200 180"
                      className="pointer-events-none absolute -left-24 bottom-[-70px] w-[300px] text-[#F9E9DA] opacity-70"
                      style={{ y: reduced ? 0 : triangleY, rotate: reduced ? 0 : triangleRotate }}
                    >
                      <path d="M100 8 L192 172 L8 172 Z" fill="currentColor" />
                    </motion.svg>
                  </>
                }
              >
                <Cascade amount={0.2}>
                  {isSample && (
                    <motion.p
                      variants={rise}
                      className="mb-5 rounded-2xl border border-[#F0D9C9] bg-white/70 px-4 py-2.5 text-[12px] leading-snug text-[#8A6A58]"
                    >
                      {t.report.previewNotice}
                    </motion.p>
                  )}

                  <EyebrowV2>{copy.hero.eyebrow}</EyebrowV2>

                  {copy.hero.h1Kind === "countup" ? (
                    <motion.h1
                      variants={stagger}
                      className="mt-3 font-display text-[clamp(33px,9vw,46px)] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#1C110A]"
                    >
                      <motion.span variants={rise} className="inline-block">
                        {name ? t.report.countupLeadNamed(name) : t.report.countupLead}
                      </motion.span>{" "}
                      <motion.span variants={rise} className="inline-block">
                        {t.report.countupMid}{" "}
                        <CountUp
                          value={percentile}
                          suffix="%"
                          className="bg-clip-text text-transparent"
                          style={{ backgroundImage: RANK_GRADIENT }}
                        />
                      </motion.span>{" "}
                      <motion.span variants={rise} className="inline-block">
                        {t.report.countupTail}
                      </motion.span>
                    </motion.h1>
                  ) : (
                    <motion.h1
                      variants={rise}
                      className="mt-3 font-display text-[clamp(33px,9vw,46px)] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#1C110A]"
                    >
                      {copy.hero.h1(ctx)}
                    </motion.h1>
                  )}

                  <motion.div
                    variants={rise}
                    className="mt-7 rounded-[26px] border border-[#F2DDCE] bg-white p-5 shadow-[0_18px_46px_-28px_rgba(90,40,10,0.28)] sm:p-6"
                  >
                    <div className="flex items-baseline justify-between">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#B4653C]">
                        {t.report.ageBandLabel}
                      </p>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B79C8E]">
                        {ageChip}
                      </p>
                    </div>
                    <div className="mt-4">
                      <MotionScoreCurve
                        percentile={percentile}
                        gradient={RANK_GRADIENT}
                        labels={t.report.curve}
                      />
                    </div>
                    <p className="mt-4 text-[15px] leading-[1.55] text-[#6B5245]">
                      {copy.hero.sub(ctx)}
                    </p>
                  </motion.div>
                </Cascade>

                <motion.div
                  ref={inlineCueRef}
                  className="mt-10 flex flex-col items-center gap-1 text-center"
                  style={{ opacity: reduced ? 1 : cueOpacity }}
                >
                  <Serif className="text-[20px] text-[#B4653C]">{copy.hero.scrollCue}</Serif>
                  <motion.svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-9 w-9 text-[#C4763F]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={reduced ? undefined : { y: [0, 7, 0] }}
                    transition={
                      reduced
                        ? undefined
                        : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                    }
                  >
                    <path d="M5 7l7 7 7-7" />
                    <path d="M5 13l7 7 7-7" opacity="0.45" />
                  </motion.svg>
                </motion.div>
              </SnapSection>
            </div>

            {/* -------------------------------------- 2 · what it means --- */}
            <SnapSection
              id="meaning"
              className="text-white"
              backdrop={
                <>
                  <div aria-hidden className="absolute inset-0" style={{ background: DARK_BAND }} />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-40"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,248,243,0.16), rgba(255,248,243,0))",
                    }}
                  />
                </>
              }
            >
              <Cascade>
                <EyebrowV2 tone="light">{t.report.meaningEyebrow}</EyebrowV2>
                <motion.h2
                  variants={rise}
                  className="mt-3 font-display text-[clamp(28px,7.6vw,38px)] font-extrabold leading-[1.22] tracking-[-0.02em]"
                >
                  {t.report.meaningH2[0]}
                  <Serif>{t.report.meaningH2[1]}</Serif>
                  {t.report.meaningH2[2]}
                  <Serif>{t.report.meaningH2[3]}</Serif>
                  {t.report.meaningH2[4]}
                  <Serif>{t.report.meaningH2[5]}</Serif>
                  {t.report.meaningH2[6]}
                </motion.h2>
                <motion.p variants={rise} className="mt-6 text-[17px] leading-[1.6] text-white/75">
                  {copy.meaning.intro}
                </motion.p>
                <div className="mt-5 space-y-3">
                  {copy.meaning.perks.map((perk, i) => (
                    <motion.div
                      key={perk}
                      variants={rise}
                      className="flex items-start gap-3.5 rounded-2xl border border-white/[0.14] bg-white/[0.08] px-4 py-4 backdrop-blur-[2px]"
                    >
                      <span className="mt-[1px] grid size-[22px] shrink-0 place-items-center rounded-full bg-white/15 text-[10.5px] font-extrabold text-white/80">
                        {i + 1}
                      </span>
                      <span className="text-[15px] font-medium leading-[1.45] text-white/90">
                        {perk}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <motion.p
                  variants={rise}
                  className="mt-7 text-[15px] font-bold leading-snug text-[#FFCE9B]"
                >
                  {copy.meaning.accent}
                </motion.p>
              </Cascade>
            </SnapSection>

            {/* -------------------------------------- 3 · risk factors --- */}
            <SnapSection id="risk">
              <Cascade amount={0.15}>
                <EyebrowV2>{t.report.riskEyebrow}</EyebrowV2>
                <motion.h2
                  variants={rise}
                  className="mt-3 font-display text-[clamp(28px,7.6vw,36px)] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#1C110A]"
                >
                  {t.report.riskH2}
                </motion.h2>
                <motion.p variants={rise} className="mt-4 text-[16px] leading-[1.6] text-[#41586B]">
                  {copy.risk.body}
                </motion.p>

                <motion.div variants={rise} className="mt-6">
                  <RiskTrendChart labels={t.report.trend} />
                </motion.div>

                <motion.div
                  variants={rise}
                  className="mt-6 rounded-[26px] border border-[#F2DDCE] bg-white p-5 shadow-[0_18px_46px_-28px_rgba(90,40,10,0.28)] sm:p-6"
                >
                  <p className="text-[15px] font-bold text-[#41586B]">
                    {t.report.riskLevelLabel}{" "}
                    <span className="text-[17px] font-extrabold text-[#1C110A]">{riskBand}</span>
                  </p>
                  <div className="mt-4">
                    <RiskMeter
                      band={meterBand}
                      labels={t.report.bandLabels}
                      ariaLabel={`${t.report.riskLevelLabel} ${riskBand}`}
                    />
                  </div>
                </motion.div>

                {factorChips.length > 0 && (
                  <motion.div variants={rise} className="mt-6">
                    <p className="text-[14.5px] leading-[1.55] text-[#41586B]">
                      {t.report.riskFactorsIntro}{name ? `, ${name}` : ""}:
                    </p>
                    <motion.div variants={stagger} className="mt-3 flex flex-wrap gap-2">
                      {factorChips.map((label) => (
                        <motion.span
                          key={label}
                          variants={pop}
                          className="rounded-full border border-[#E7D3C4] bg-white px-4 py-2 text-[13px] font-bold text-[#5F4638]"
                        >
                          {label}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                <motion.div variants={rise} className="mt-7">
                  <p className="text-[14.5px] text-[#41586B]">{t.report.goodNews}</p>
                  <p className="mt-1 font-display text-[30px] font-extrabold tracking-[-0.02em] text-[#1C110A]">
                    {t.report.goodNewsAbout}{" "}
                    <CountUp
                      value={45}
                      suffix="%"
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: RANK_GRADIENT }}
                    />
                  </p>
                  <p className="mt-1 text-[15px] leading-[1.6] text-[#41586B]">
                    {t.report.goodNewsBody}
                  </p>
                </motion.div>

                <motion.div
                  variants={rise}
                  className="mt-7 rounded-[26px] border border-[#F5E6B8] bg-[#FFFBEE] p-5 shadow-[0_14px_34px_-26px_rgba(180,120,20,0.18)] sm:p-6"
                >
                  <p className="font-display text-[18px] font-extrabold tracking-[-0.01em] text-[#1C110A]">
                    {copy.risk.actionablesIntro}
                  </p>
                  <motion.ol variants={stagger} className="mt-4 space-y-3">
                    {copy.risk.actionables.map((item, i) => (
                      <motion.li key={item} variants={rise} className="flex gap-3.5">
                        <span
                          className="mt-[2px] grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-extrabold text-white"
                          style={{ background: RANK_GRADIENT }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-[14.5px] leading-[1.55] text-[#5F4638]">{item}</span>
                      </motion.li>
                    ))}
                  </motion.ol>
                </motion.div>
              </Cascade>
            </SnapSection>

            {/* ------------------------------------- 5 · your baseline --- */}
            <SnapSection id="baseline">
              <Cascade amount={0.2}>
                <EyebrowV2>{copy.baseline.eyebrow}</EyebrowV2>
                <motion.h2
                  variants={rise}
                  className="mt-3 font-display text-[clamp(28px,7.6vw,36px)] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#1C110A]"
                >
                  {copy.baseline.h2Lead}
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: RANK_GRADIENT }}
                  >
                    {copy.baseline.h2Gradient}
                  </span>
                </motion.h2>

                <motion.div
                  variants={rise}
                  className="mt-7 rounded-[26px] border border-[#F2DDCE] bg-white p-5 pb-6 shadow-[0_18px_46px_-28px_rgba(90,40,10,0.28)] sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#B4653C]">
                      {t.report.baselineLabel}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B79C8E]">
                      {t.report.baselineProgress}
                    </p>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#F6E4D8]">
                    <motion.div
                      className="h-full w-2/5 rounded-full"
                      style={{ background: RANK_GRADIENT, transformOrigin: "0 50%" }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.9, root: scrollerRef }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    />
                  </div>
                  <div className="mt-4">
                    <MotionRadar
                      axes={t.report.radarAxes}
                      aria={t.report.radarAria}
                      filled={{
                        [t.report.radarAxes[0]]: Math.max(0.25, percentile / 100),
                        [t.report.radarAxes[4]]: riskFill,
                      }}
                    />
                  </div>
                </motion.div>

                <motion.div variants={rise} className="mt-6 space-y-3 text-[15px] leading-[1.6] text-[#6B5245]">
                  {copy.baseline.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </motion.div>
              </Cascade>
            </SnapSection>

            {/* --------------------------------------- 6 · the product --- */}
            <SnapSection id="recognaize">
              <Cascade amount={0.2}>
                <EyebrowV2>{copy.product.eyebrow}</EyebrowV2>
                <motion.h2
                  variants={rise}
                  className="mt-3 font-display text-[clamp(28px,7.6vw,36px)] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#1C110A]"
                >
                  {copy.product.h2}
                </motion.h2>
                <motion.p variants={rise} className="mt-4 text-[15.5px] leading-[1.6] text-[#6B5245]">
                  {copy.product.bodyLead}
                  <Serif>Alzheimer&apos;s &amp; Dementia</Serif>.
                </motion.p>

                <motion.div
                  variants={rise}
                  className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 rounded-2xl border border-[#F2DDCE] bg-white/70 px-4 py-4 sm:px-5"
                >
                  {/* Three real logos at their native aspect ratio, so the
                      row is wide even scaled down — h-9/h-6 (the desktop
                      sizing) overflowed a 375-430px phone card by ~70px.
                      Smaller by default, full size from sm: up; flex-wrap
                      is a safety net for anything narrower still. */}
                  <img
                    src="/images/lite-one/logo-gms-ntu.png"
                    alt="Nanyang Technological University"
                    className="h-6 w-auto shrink-0 opacity-80 sm:h-9"
                  />
                  <img
                    src="/images/lite-one/logo-lkc-drc.png"
                    alt="LKC Medicine Dementia Research Centre"
                    className="h-6 w-auto shrink-0 opacity-80 sm:h-9"
                  />
                  <img
                    src="/images/lite-one/logo-pubmed.svg"
                    alt="PubMed"
                    className="h-4 w-auto shrink-0 opacity-80 sm:h-6"
                  />
                </motion.div>

                <div className="mt-9">
                  <EyebrowV2>{t.report.howItWorksEyebrow}</EyebrowV2>
                </div>
                <motion.h2
                  variants={rise}
                  className="mt-3 font-display text-[clamp(28px,7.6vw,36px)] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#1C110A]"
                >
                  {t.report.howItWorksH2}
                </motion.h2>

                <motion.ol variants={stagger} className="mt-8 space-y-6">
                  {t.report.howItWorksSteps.map(({ step, title, body, domains }, i) => (
                    <motion.li key={title} variants={rise}>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#B4653C]">
                        {step}
                      </p>
                      <p className="mt-2 font-display text-[20px] font-extrabold tracking-[-0.01em] text-[#1C110A]">
                        {title}
                      </p>
                      <p className="mt-2 text-[14.5px] leading-[1.6] text-[#6B5245]">{body}</p>

                      {domains.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {domains.map((d) => (
                            <span
                              key={d}
                              className="rounded-full border border-[#E7D3C4] bg-white px-4 py-2 text-[13px] font-bold text-[#5F4638]"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}

                      {i < t.report.howItWorksSteps.length - 1 && (
                        <div aria-hidden className="mt-6 h-px bg-[#F2DDCE]" />
                      )}
                    </motion.li>
                  ))}
                </motion.ol>

                {/* The trial's first tracker. Where /lite-event opens the
                    voucher page, this records a raised hand and stays
                    confirmed; the next step is the team at the booth, named
                    in the card two sections down. */}
                <motion.button
                  variants={rise}
                  type="button"
                  onClick={markInterested}
                  disabled={interested}
                  aria-pressed={interested}
                  whileTap={interested ? undefined : { scale: 0.98 }}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full px-8 py-[17px] text-[16px] font-bold leading-none tracking-[0.025em] text-white shadow-[0_16px_34px_-16px_rgba(214,47,22,0.6)] transition-[filter] hover:brightness-[1.06] disabled:cursor-default disabled:hover:brightness-100"
                  style={{ background: RANK_GRADIENT }}
                >
                  {interested && (
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="size-[18px] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4.5 12.6l5 5 10-10.5" />
                    </svg>
                  )}
                  {interested ? t.report.interestedDone : t.report.interested}
                </motion.button>

                <motion.figure
                  variants={rise}
                  className="mt-10 rounded-[26px] border border-[#F2DDCE] bg-white p-6 shadow-[0_18px_46px_-28px_rgba(90,40,10,0.28)]"
                >
                  <span
                    aria-hidden
                    className="block font-display text-[40px] font-extrabold leading-none text-[#FFCE9B]"
                  >
                    &ldquo;&rdquo;
                  </span>
                  <blockquote className="-mt-3 text-[15px] leading-[1.6] text-[#1C110A]">
                    {t.report.clinicianQuote}
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <img
                      src="/images/lite-one/prof-nagaendran.png"
                      alt="A/Prof Nagaendran Kandiah"
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[14px] font-extrabold text-[#1C110A]">
                        {t.report.clinicianName}
                      </p>
                      <p className="text-[11.5px] leading-[1.4] text-[#8A6A58]">
                        {t.report.clinicianRole}
                        <br />
                        {t.report.clinicianCreds}
                      </p>
                    </div>
                  </figcaption>
                </motion.figure>
              </Cascade>
            </SnapSection>

            {/* ------------------------------------ 9 · what happens next --- */}
            {/* The trial's closing, in place of /lite-event's price card. The
                card is set in the quiz screens' Clinical Empathy tokens — the
                same values the design's variables resolve to — rather than the
                report's own warm neutrals, which is what makes it read as a
                hand-off to the booth rather than one more section. */}
            <SnapSection id="next">
              <Cascade amount={0.15}>
                <motion.div
                  variants={rise}
                  className="rounded-[26px] bg-quizSurface-container px-[22px] py-[26px] sm:px-7 sm:py-8"
                >
                  <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-quizPrimary">
                    {t.report.nextEyebrow}
                  </p>
                  <h2 className="mt-2 font-display text-[22px] font-extrabold leading-[1.375] text-charcoal">
                    {t.report.nextH2}
                  </h2>
                  <p className="mt-2 text-[15.5px] leading-[1.62] text-quizSecondary">
                    {t.report.nextBody}
                  </p>
                  <p className="mt-2 text-[15.5px] leading-[1.62] text-quizSecondary">
                    {t.report.nextReassurance}
                  </p>

                  <div className="mt-[22px] rounded-[18px] bg-quizSurface-lowest p-[18px]">
                    <p className="font-display text-[17.5px] font-extrabold leading-[1.5] text-charcoal">
                      {t.report.nextProductName}
                    </p>
                    <ul className="mt-[11px] space-y-2">
                      {t.report.nextPoints.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span
                            aria-hidden
                            className="mt-[7px] size-[7px] shrink-0 rounded-full bg-quizPrimary"
                          />
                          <span className="text-[15.5px] leading-[1.4] text-quizSecondary">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* A callout, not a button: the next step happens in person. */}
                  <p className="mt-[19px] rounded-2xl border border-quizPrimary bg-quizPrimary-container px-[18px] py-[13px] text-center text-[17.5px] font-bold leading-[1.5] text-quizPrimary-onContainer">
                    {t.report.nextCallout}
                  </p>

                  {/* The trial's second tracker, and the card's one control. */}
                  <ConsentCheckbox
                    id="levt-ntuhc-tips-opt-in"
                    checked={tipsOptIn}
                    onChange={toggleTips}
                    className="mt-[22px] py-1"
                  >
                    <span className="mt-[2px] block text-[15.5px] leading-[1.4] text-quizSecondary">
                      {t.report.tipsOptIn}
                    </span>
                  </ConsentCheckbox>

                  <p className="mt-[21px] text-center text-[13px] leading-[1.35] text-quizOutline">
                    {t.report.credibilityLine}
                  </p>
                </motion.div>
              </Cascade>
            </SnapSection>

            {/* ---------------------------------------- 10 · wrap up --- */}
            <SnapSection id="closing">
              <Cascade amount={0.2}>
                <motion.figure variants={rise}>
                  <span
                    aria-hidden
                    className="block font-display text-[64px] font-extrabold leading-none text-[#F2DDCE]"
                  >
                    &ldquo;
                  </span>
                  <blockquote className="-mt-5 space-y-3 text-[21px] leading-[1.55] tracking-[-0.01em] text-[#1C110A]">
                    {copy.closing.quote.map((paragraph) => (
                      <p key={paragraph}>{withRecognaizeSerif(paragraph)}</p>
                    ))}
                  </blockquote>
                  <figcaption className="mt-4 text-[14.5px] text-[#8A6A58]">
                    {copy.closing.attribution(ctx)}
                  </figcaption>
                </motion.figure>

                <motion.div
                  variants={rise}
                  className="relative mt-10 rounded-[26px] border border-[#EEDACD] bg-[#FFFDFB] p-6 sm:p-7"
                >
                  <h3 className="font-display text-[21px] font-extrabold leading-tight tracking-[-0.015em] text-[#1C110A]">
                    {t.report.stillThinking}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-[1.6] text-[#6B5245]">
                    {copy.exit.body}
                  </p>
                  <p className="mt-2 text-[14.5px] leading-[1.6] text-[#6B5245]">
                    {copy.exit.body2}
                  </p>
                  <motion.div
                    variants={stagger}
                    className="pointer-events-none absolute -top-5 right-5 flex gap-2"
                  >
                    {["👍", "🧡"].map((sticker, i) => (
                      <motion.span
                        key={sticker}
                        variants={{
                          hidden: { opacity: 0, scale: 1.6, rotate: i === 0 ? -18 : 14 },
                          shown: {
                            opacity: 1,
                            scale: 1,
                            rotate: i === 0 ? -10 : 8,
                            transition: { type: "spring", stiffness: 300, damping: 16 },
                          },
                        }}
                        className="grid size-12 place-items-center rounded-full bg-white text-[22px] shadow-[0_10px_24px_-10px_rgba(90,40,10,0.45)]"
                      >
                        {sticker}
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>

                <motion.p variants={rise} className="mt-8 text-center text-[11px] leading-[1.6] text-[#C9B4A6]">
                  {t.report.researchLine}
                </motion.p>
              </Cascade>
            </SnapSection>
          </div>
        </ScrollerContext.Provider>
      </MotionConfig>
    </>
  );
}
