import {
  MotionConfig,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import React from "react";
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
import { parkwayReportCopy } from "src/data/parkwayReportCopy";
import type {
  LiteTwoBand,
  LiteTwoCopyCtx,
  LiteTwoPersona,
} from "src/data/liteTwoReportContent";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import { PARKWAY } from "src/utils/liteOne";
import {
  PARKWAY_LOGO,
  PARKWAY_SITES,
  PARKWAY_WHATSAPP_URL,
  parkwaySiteName,
  type ParkwaySite,
} from "src/utils/parkway";

/**
 * /parkway — the Parkway Shenton copy of this /lite-event-template screen.
 *
 * The flow is /lite-event-template's, page for page and unchanged; what the
 * partner funnel changes is the report, whose conversion path books a
 * consultation at a Parkway Shenton site instead of selling the online
 * assessment. See PARKWAY in src/utils/liteOne.ts for what the two funnels
 * share and what they don't.
 */

/**
 * /parkway's report — the v2 scroll-snapped story, personalised, closing on a
 * Parkway Shenton consultation.
 *
 * Two sections differ from /lite-event-template's, and both are the partner's:
 * "What to do now?" walks the reader through booking a screening at one of the
 * four Parkway sites before describing the test itself, and the section that
 * sold the online assessment is now the consultation offer, booked over the
 * clinic's WhatsApp line. Everything above them — the rank, what the score
 * means, the risk factors, the baseline radar — is unchanged.
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
  "offer",
  "closing",
] as const;

/** WhatsApp brand green — every booking CTA reads as "this opens a chat". */
const WHATSAPP_GREEN = "#1FAF57";

/**
 * The sticky bar's icon — akar-icons:arrow-up-thick, rotated to point down in
 * the design. Drawn inline rather than pulled in through an icon package: the
 * report's other glyphs (chevrons, checks, the WhatsApp mark) are all inline
 * SVG already, and this funnel runs at booths where a run to an icon CDN is
 * not something to depend on.
 */
function ThickArrowDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 4v16" />
      <path d="M6 14l6 6 6-6" />
    </svg>
  );
}

/**
 * One step's illustration. Removes itself if the asset 404s, so a step whose
 * image hasn't been committed yet still reads as a normal text step instead of
 * a broken-image placeholder — the same guard /act4health's report uses.
 */
function StepImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return null;
  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-[#F2DDCE] bg-white">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="block h-auto w-full"
      />
    </div>
  );
}

/**
 * A site's photograph, or a plain tile in its place.
 *
 * The four photographs are the clinic's to supply (see
 * public/images/parkway/sites/README.md); until they land, every place a site
 * appears still lays out correctly rather than showing four broken images.
 */
function SiteThumb({ site, className = "" }: { site: ParkwaySite; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return <div aria-hidden className={`bg-[#F6E4D8] ${className}`} />;
  }
  return (
    <img
      src={site.image}
      alt={parkwaySiteName(site)}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

/**
 * Step 1's sites, as the design draws them: cards wider than the column, so
 * the row scrolls sideways and the fourth card's edge shows there is more.
 *
 * The negative margins let the strip bleed to the section's edges while the
 * matching padding keeps the first card aligned with the text above it —
 * without them the cards would be inset twice. `scroll-pl` has to match that
 * padding: mandatory snapping aligns the first card's edge to the container's
 * own, which scrolls straight past the padding and puts the card back against
 * the screen edge on load.
 */
function SiteCarousel() {
  return (
    <div className="scroll-hidden -mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-5 px-5 sm:-mx-8 sm:scroll-pl-8 sm:px-8">
      {PARKWAY_SITES.map((site) => (
        <div
          key={site.location}
          className="w-[216px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white pb-4 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04)]"
        >
          <SiteThumb site={site} className="h-[125px] w-full rounded-t-[10px]" />
          <p className="mt-2.5 px-4 text-[13.5px] font-semibold leading-[1.36] text-[#171717]">
            {site.practice}
            <br />
            {site.location}
          </p>
        </div>
      ))}
    </div>
  );
}

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

export default function ParkwayReport() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  // The two sections Parkway does differently; everything else on the page
  // still reads from the shared sets.
  const pk = parkwayReportCopy(lang);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const heroRef = React.useRef<HTMLDivElement>(null);
  // Watched by ScrollMoreCue: on a viewport too short to show the hero's own
  // scroll cue (a landscape iPad, chiefly) a floating one takes over.
  const inlineCueRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { query } = useRouter();

  const data = useReportData(PARKWAY);
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

  // The shared set labels dot 6 "Special offer", which this funnel no longer
  // has — the same dot now points at the consultation, so it takes that name.
  const sections = SECTION_IDS.map((id, i) => ({
    id,
    label: id === "offer" ? pk.offer.eyebrow : t.report.sections[i],
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
  const share = async (text: string) => {
    const url = typeof window === "undefined" ? "" : `${window.location.origin}${PARKWAY.basePath}`;
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
                <EyebrowV2>{pk.product.eyebrow}</EyebrowV2>
                <motion.h2
                  variants={rise}
                  className="mt-3 font-display text-[clamp(28px,7.6vw,36px)] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#1C110A]"
                >
                  {pk.product.h2Lead}
                  <br />
                  {pk.product.h2Tail}
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

                <motion.ol variants={stagger} className="mt-9 space-y-6">
                  {pk.product.steps.map((s, i) => (
                    <motion.li key={s.step} variants={rise}>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#B4653C]">
                        {s.step}
                      </p>
                      <p className="mt-2 font-display text-[20px] font-extrabold tracking-[-0.01em] text-[#1C110A]">
                        {s.title}
                      </p>
                      <p className="mt-2 text-[14.5px] leading-[1.6] text-[#6B5245]">{s.body}</p>

                      {/* Step 1 carries the sites themselves; steps 2 and 3 are
                          illustrated with the product they describe. */}
                      {i === 0 && <SiteCarousel />}
                      {i === 1 && (
                        <StepImage
                          src="/images/parkway/steps/step-2-games.png"
                          alt={pk.product.stepGamesAlt}
                        />
                      )}
                      {i === 2 && (
                        <StepImage
                          src="/images/parkway/steps/step-3-report.png"
                          alt={pk.product.stepReportAlt}
                        />
                      )}

                      {i < pk.product.steps.length - 1 && (
                        <div aria-hidden className="mt-6 h-px bg-[#F2DDCE]" />
                      )}
                    </motion.li>
                  ))}
                </motion.ol>

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

            {/* ------------------------------- 9 · book a consultation --- */}
            <SnapSection id="offer">
              <Cascade amount={0.15}>
                {/* The design sets this eyebrow a step larger than EyebrowV2's
                    10.5px — it is the one that opens the conversion section,
                    so it reads at the same weight as the headline under it. */}
                <motion.p
                  variants={rise}
                  className="text-[14px] font-extrabold uppercase tracking-[0.24em] text-[#B4653C]"
                >
                  {pk.offer.eyebrow}
                </motion.p>
                <motion.h2
                  variants={rise}
                  className="mt-3 font-display text-[clamp(28px,7.6vw,30px)] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#1C110A]"
                >
                  {pk.offer.h2}
                </motion.h2>
                <motion.p variants={rise} className="mt-4 text-[15.5px] leading-[1.6] text-[#6B5245]">
                  {pk.offer.body}
                </motion.p>

                <motion.div
                  variants={rise}
                  className="mt-7 rounded-[26px] border border-[#F2DDCE] bg-white p-6 shadow-[0_18px_46px_-28px_rgba(89,41,10,0.14)] sm:p-7"
                >
                  <img
                    src={PARKWAY_LOGO.src}
                    alt={PARKWAY_LOGO.alt}
                    className="h-[47px] w-auto"
                  />
                  <p className="mt-4 font-display text-[19px] font-extrabold leading-[1.3] tracking-[-0.01em] text-[#1C110A]">
                    {pk.offer.cardTitle}
                  </p>

                  <ul className="mt-[18px] space-y-3 border-t border-[#F2DDCE] pt-[18px]">
                    {pk.offer.included.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[15px] leading-[1.6] text-[#6B5245]"
                      >
                        <span
                          className="mt-[3px] grid size-[22px] shrink-0 place-items-center rounded-full"
                          style={{ background: WHATSAPP_GREEN }}
                          aria-hidden
                        >
                          <svg viewBox="0 0 16 16" className="size-3 text-white">
                            <path
                              d="M3 8.5l3 3 7-8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-5 text-[13px] font-bold text-[#B79C8E]">{pk.offer.sitesLabel}</p>
                  <ul className="mt-2 overflow-hidden rounded-[14px]">
                    {PARKWAY_SITES.map((site, i) => (
                      <li key={site.location}>
                        {i > 0 && <div aria-hidden className="h-px bg-[#E5E7EB]" />}
                        <div className="flex items-center gap-4 py-2">
                          <SiteThumb site={site} className="size-10 shrink-0 rounded-lg" />
                          <span className="min-w-0 flex-1 text-[12px] leading-[1.58] text-black">
                            {site.practice}
                            <br />
                            {site.location}
                          </span>
                          <svg
                            viewBox="0 0 24 24"
                            className="size-4 shrink-0 text-[#B79C8E]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Cascade>
            </SnapSection>

            {/* ---------------------------------------- 10 · wrap up --- */}
            <SnapSection id="closing" paddingClassName="pb-32 pt-24">
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

            {/* ------------------------------------ sticky booking bar --- */}
            {/* Always one tap from a booking, whatever section is on screen —
                same job /act4health's WhatsApp bar does for its clinic, in
                this design's rank-gradient styling. The closing section
                above carries pb-32 so the bar never sits on top of the last
                line the visitor can't scroll past. */}
            <a
              href={PARKWAY_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-[560px] items-center justify-between gap-3 rounded-2xl py-3 pl-5 pr-3 text-white shadow-[0_18px_40px_-14px_rgba(214,47,22,0.55)] transition-transform active:scale-[0.985]"
              style={{ background: RANK_GRADIENT }}
            >
              <span className="min-w-0">
                <span className="block text-[14px] font-extrabold uppercase italic tracking-wide leading-tight sm:text-[15px]">
                  {pk.stickyBar.title}
                </span>
                <span className="block truncate text-[12.5px] font-semibold text-white/90">
                  {pk.stickyBar.subtitle}
                </span>
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/[0.16]">
                <ThickArrowDown className="size-6" />
              </span>
            </a>
          </div>
        </ScrollerContext.Provider>
      </MotionConfig>
    </>
  );
}
