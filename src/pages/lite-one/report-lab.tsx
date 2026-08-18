import Head from "next/head";
import Router from "next/router";
import React from "react";
import { SampleReportMock } from "src/components/LiteOne/SampleReportMock";
import { BAND_LABELS, computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import {
  Band,
  BaselineSteps,
  DomainRadar,
  Eyebrow,
  LockIcon,
  PeopleIcon,
  RANK_GRADIENT,
  ScoreCurve,
  ShareIcon,
  ShieldIcon,
} from "src/components/LiteOne/ReportLab/visuals";
import type { ScoreResult } from "src/types/quiz";
import type { DomainReport } from "src/types/report";
import {
  AGE_LABELS,
  readLiteProfile,
  readStashedQuizResult,
  readStashedReport,
} from "src/utils/liteOne";

/**
 * Report redesign, parked outside the funnel.
 *
 * Nothing links here: /lite-one/report is still the live page. This one exists
 * to test a single scrolling report against the research finding that visitors
 * who pick the competitive hook ("see how your brain scores against people
 * your age") are optimizers. They came for a ranking and a way to move it, not
 * for reassurance about decline, so the page is ordered accordingly:
 *
 *   rank -> what the rank means in a normal day -> one thing to try
 *   -> the risk-factor result -> how much is still unmeasured -> why a baseline
 *   -> the full test -> the quiet exit
 *
 * The baseline is five pieces: processing speed, risk factors, and the three
 * locked domains (memory, attention, executive function). The 60-second funnel
 * measures the first two, so the radar fills two axes and leaves three hollow.
 *
 * With no finished game on the device it renders a sample result so the layout
 * can be reviewed and tested on its own.
 */

const SAMPLE: DomainReport = {
  title: "Processing Speed",
  percentile: 90,
  severity: "High",
  definition:
    "How quickly your brain takes in information and responds. It is the engine behind quick thinking.",
  affects: [],
  improve: [],
  maintain: [],
};

const DAY_TO_DAY = [
  "Scanning a menu and deciding before the table starts waiting on you",
  "Keeping up when a group conversation jumps between three topics",
  "Adding up the bill in your head while the cashier is still scanning",
  "Hearing a new instruction once and starting straight away",
];

/** Stand-in band for preview mode, so the curve header never reads "All ages". */
const SAMPLE_AGE = "26-35";

/** Short labels so the side axes never clip inside the radar frame. */
const RADAR_AXES = ["Speed", "Memory", "Attention", "Executive", "Risk"];

/** Preview-mode stand-in for the quiz result. */
const SAMPLE_RISK = {
  band: "Moderate",
  fill: 0.58,
  factors: ["Sleep", "Physical activity", "Stress"],
};

/** Why each flagged factor matters to the number they just scored. */
const FACTOR_NOTES: Record<string, string> = {
  sleep: "The biggest same-day swing in reaction time",
  "physical activity": "Raises blood flow to the areas timing this task",
  stress: "Steals attention before it reaches your reaction",
  diet: "Feeds the same vascular system your speed runs on",
  smoking: "Narrows the vessels supplying oxygen to the brain",
  alcohol: "Disrupts the deep sleep that restores speed",
  "blood pressure": "Strains the small vessels behind processing speed",
  hearing: "Extra effort spent decoding sound leaves less for the task",
  "social contact": "Conversation is the everyday workout for fast thinking",
  mood: "Low mood slows decisions before the body reacts",
};

const TRUST = [
  { icon: ShieldIcon, label: "Clinically validated tasks" },
  { icon: PeopleIcon, label: "Age-normed comparison" },
  { icon: LockIcon, label: "Private" },
];

export default function ReportLab() {
  const [report, setReport] = React.useState<DomainReport>(SAMPLE);
  const [ageRange, setAgeRange] = React.useState<string | null>(SAMPLE_AGE);
  const [isSample, setIsSample] = React.useState(true);
  const [quiz, setQuiz] = React.useState<ScoreResult | null>(null);
  const [shared, setShared] = React.useState(false);

  React.useEffect(() => {
    const stashed = readStashedReport();
    if (stashed) {
      setReport(stashed);
      setIsSample(false);
    }
    const profile = readLiteProfile();
    if (profile?.ageRange) {
      setAgeRange(AGE_LABELS[profile.ageRange] ?? profile.ageRange);
    } else if (stashed) {
      setAgeRange(null);
    }

    // Same source the live report reads: live answers if the quiz is still in
    // memory, otherwise whatever this device stashed.
    const answers = useQuestionnaireStore.getState().answers;
    const scored =
      Object.keys(answers).length > 0 ? computeScore(answers) : readStashedQuizResult();
    if (scored) setQuiz(scored);
  }, []);

  const percentile = Math.round(report.percentile);
  const peers = ageRange ? `people aged ${ageRange}` : "people your age";
  const topBand = Math.max(1, 100 - percentile);
  const strong = report.severity === "High";
  const domain = report.title.toLowerCase();

  // Risk sits on the radar inverted: a clean profile fills the axis, a loaded
  // one pulls it in. Floored so a high-risk profile still reads as measured.
  const riskBand = quiz ? BAND_LABELS[quiz.band] : SAMPLE_RISK.band;
  const riskFill = quiz
    ? Math.min(1, Math.max(0.22, 1 - quiz.total / Math.max(1, quiz.maxTotal)))
    : SAMPLE_RISK.fill;
  const riskFactors = quiz
    ? quiz.drivingFactors.map((factor) => factor.label)
    : SAMPLE_RISK.factors;

  const share = async () => {
    const text = `I reacted faster than ${percentile}% of ${peers} on a 60-second cognitive test.`;
    const url = typeof window === "undefined" ? "" : `${window.location.origin}/lite-one`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "My brain speed score", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      // Cancelled share sheets and blocked clipboards both land here. Nothing
      // to recover from, and an error toast on a share button reads as a bug.
    }
  };

  return (
    <>
      <Head>
        <title>Your reaction time, ranked | BrainScan Testing</title>
        <meta name="theme-color" content="#FFF8F3" />
        <meta name="robots" content="noindex" />
      </Head>

      <ScrollUnlock />

      <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#FFF8F3] font-jakarta text-[#241610] antialiased">
        {/* warm light spilling from the top of the page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
          style={{ background: "radial-gradient(120% 70% at 50% -10%, #FFE3C7 0%, rgba(255,248,243,0) 72%)" }}
        />

        <header className="relative flex items-center justify-between px-5 pt-6 sm:px-8">
          <img
            src="/images/lite-one/logo-gray-matter.svg"
            alt="Gray Matter Solutions"
            className="h-[26px] w-auto"
          />
          <span
            className="rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white"
            style={{ background: RANK_GRADIENT }}
          >
            {strong ? `Top ${topBand}%` : `${percentile}th percentile`}
          </span>
        </header>

        {isSample && (
          <div className="relative px-5 pt-5 sm:px-8">
            <p className="mx-auto max-w-[560px] rounded-2xl border border-[#F0D9C9] bg-white/70 px-4 py-2.5 text-[12px] leading-snug text-[#8A6A58]">
              Preview mode. No finished game on this device, so the numbers below are a sample.
            </p>
          </div>
        )}

        {/* 1 — the rank they came for */}
        <Band className="pb-4 pt-9 sm:pt-12">
          <Eyebrow>Reaction time challenge</Eyebrow>
          <h1 className="mt-3 font-display text-[clamp(32px,9vw,44px)] font-extrabold leading-[1.03] tracking-[-0.03em] text-[#1C110A]">
            You were faster than{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: RANK_GRADIENT }}
            >
              {percentile}%
            </span>{" "}
            of {peers}.
          </h1>
          <p className="mt-4 max-w-[440px] text-[15.5px] leading-[1.55] text-[#6B5245]">
            {strong
              ? `That is the top ${topBand}% of your age band on ${domain}. Most people never find out where they sit.`
              : `That is the middle of your age band on ${domain}. It moves more than people expect, and it moves fast.`}
          </p>

          <div className="mt-8 rounded-[26px] border border-[#F2DDCE] bg-white p-5 shadow-[0_18px_46px_-28px_rgba(90,40,10,0.28)] sm:p-6">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#B4653C]">
                Your age band
              </p>
              <p className="text-[11px] font-bold text-[#B79C8E]">
                {ageRange ? `Aged ${ageRange}` : "All ages"}
              </p>
            </div>
            <div className="mt-4">
              <ScoreCurve percentile={percentile} />
            </div>
          </div>

          <button
            type="button"
            onClick={share}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#EBD3C2] bg-white py-3.5 text-[14px] font-bold text-[#8A4A22] transition-all hover:border-[#E0B79C] hover:bg-[#FFF3EA] active:scale-[0.99]"
          >
            <ShareIcon />
            {shared ? "Copied" : "Share your score"}
          </button>
        </Band>

        {/* 2 — the rank in a normal day, on the dark section */}
        <div className="relative mt-14">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(168deg,#2A1206 0%,#5C1E07 46%,#B23A0C 100%)" }}
          />
          <Band className="relative py-16 sm:py-20">
            <Eyebrow tone="light">What that actually means</Eyebrow>
            <h2 className="mt-3 font-display text-[clamp(27px,7.4vw,36px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-white">
              Processing speed is how fast you connect the dots.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.6] text-white/70">
              It sits underneath most of a normal day. Reading speed, reaction time, quick mental
              math. You rarely notice it until it lags.
            </p>

            <ul className="mt-8 space-y-3">
              {DAY_TO_DAY.map((item, i) => (
                <li
                  key={item}
                  className="flex items-start gap-3.5 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3.5 backdrop-blur-[2px]"
                >
                  <span className="mt-[1px] grid size-[22px] shrink-0 place-items-center rounded-full bg-white/15 text-[10.5px] font-extrabold text-white/80">
                    {i + 1}
                  </span>
                  <span className="text-[14.5px] leading-[1.45] text-white/90">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-[15px] font-bold leading-snug text-[#FFCE9B]">
              {strong
                ? "If those four feel effortless, your score just told you why."
                : "If any of those four feel like work lately, your score is the reason."}
            </p>
          </Band>
        </div>

        {/* 3 — one thing to do with the number */}
        <Band className="pt-16 sm:pt-20">
          <Eyebrow>One thing to try this week</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(27px,7.4vw,36px)] font-extrabold leading-[1.08] tracking-[-0.025em]">
            Read it once, then answer.
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.6] text-[#6B5245]">
            Open your next long email and read it a single time. No scrolling back up before you
            reply. Re-reading is the tax most people pay on their own inbox, and comprehension speed
            is what stops you paying it.
          </p>

          <div className="mt-7 overflow-hidden rounded-[26px] border border-[#F2DDCE] bg-white shadow-[0_18px_46px_-30px_rgba(90,40,10,0.26)]">
            <div className="px-5 py-5 sm:px-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#B4653C]">
                Why it works on your score
              </p>
              <p className="mt-2.5 text-[14.5px] leading-[1.55] text-[#5F4638]">
                Speed drills only hold if you use them under normal pressure. An inbox is the
                cheapest place to practise, because you are already there.
              </p>
            </div>
            <button
              type="button"
              onClick={share}
              className="flex w-full items-center justify-center gap-2 border-t border-[#F2DDCE] bg-[#FFF6EF] py-3.5 text-[13.5px] font-bold text-[#8A4A22] transition-colors hover:bg-[#FFEFE3]"
            >
              <ShareIcon />
              {shared ? "Copied" : "Send this to someone who needs it"}
            </button>
          </div>
        </Band>

        {/* 4 — the second thing measured: the risk-factor result */}
        <Band className="pt-16 sm:pt-20">
          <div className="rounded-[28px] border border-[#DCE7F2] bg-gradient-to-br from-[#F3F8FD] to-[#E7F0FA] p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <Eyebrow>Also measured</Eyebrow>
              <span className="rounded-full bg-[#13232F] px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-white">
                {riskBand} risk
              </span>
            </div>
            <h2 className="mt-3.5 font-display text-[clamp(24px,6.6vw,31px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#13232F]">
              Speed was not the only thing we looked at.
            </h2>
            <p className="mt-3.5 text-[15px] leading-[1.6] text-[#41586B]">
              Your quiz answers put your risk profile in the {riskBand.toLowerCase()} band. These
              are the factors pulling reaction time down before age gets a say, and they move in
              weeks rather than years.
            </p>

            {riskFactors.length > 0 && (
              <div className="mt-5 space-y-2.5">
                {riskFactors.slice(0, 4).map((label) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-xl border border-white bg-white/80 px-4 py-3"
                  >
                    <span className="shrink-0 text-[13px] font-extrabold text-[#13232F]">
                      {label}
                    </span>
                    <span className="text-[12.5px] leading-snug text-[#5A7180]">
                      {FACTOR_NOTES[label.toLowerCase()] ?? "One of the levers you can still move"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Band>

        {/* 5 — how much of the picture is still missing */}
        <Band className="pt-16 sm:pt-20">
          <Eyebrow>Your baseline so far</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(27px,7.4vw,36px)] font-extrabold leading-[1.08] tracking-[-0.025em]">
            Two of five, measured.
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.6] text-[#6B5245]">
            Sixty seconds bought you the speed axis, and the quiz filled in your risk profile. The
            three still hollow are where most people find their gap, and a strong score on one axis
            says nothing about the rest.
          </p>

          <div className="mt-8 rounded-[26px] border border-[#F2DDCE] bg-white p-5 pb-6 shadow-[0_18px_46px_-30px_rgba(90,40,10,0.26)] sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#B4653C]">
                Your baseline
              </p>
              <p className="text-[12px] font-bold text-[#B79C8E]">2 of 5 done</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F6E4D8]">
              <div className="h-full w-2/5 rounded-full" style={{ background: RANK_GRADIENT }} />
            </div>

            <div className="mt-6">
              <DomainRadar
                axes={RADAR_AXES}
                filled={{
                  Speed: Math.max(0.25, percentile / 100),
                  Risk: riskFill,
                }}
              />
            </div>
          </div>
        </Band>

        {/* 6 — why a baseline is worth having */}
        <div className="relative mt-16 sm:mt-20">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(150deg,#C4400E 0%,#EE6A12 55%,#FF9A2E 100%)" }}
          />
          <Band className="relative py-16 sm:py-20">
            <Eyebrow tone="light">Why now</Eyebrow>
            <h2 className="mt-3 font-display text-[clamp(27px,7.4vw,36px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-white">
              The best time to set a baseline is while you are sharp.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.6] text-white/80">
              A score on its own is trivia. A score you can retest against in six months tells you
              whether the habits you changed did anything.
            </p>

            <div className="mt-9">
              <BaselineSteps />
            </div>

            <div className="mt-9 grid grid-cols-3 divide-x divide-white/20 rounded-2xl border border-white/20 bg-white/10 py-4">
              {TRUST.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 px-2 text-center text-white/85">
                  <Icon />
                  <span className="text-[10px] font-extrabold uppercase leading-[1.25] tracking-[0.08em]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Band>
        </div>

        {/* 7 — the full test */}
        <Band className="pt-16 sm:pt-20">
          <Eyebrow>The full picture</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(27px,7.4vw,36px)] font-extrabold leading-[1.08] tracking-[-0.025em]">
            Ready to challenge the other three?
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.6] text-[#6B5245]">
            The full assessment measures memory, attention and executive function, then plots every
            axis against your age group in one report.
          </p>

          <div className="mt-9">
            <SampleReportMock />
          </div>

          <button
            type="button"
            onClick={() => Router.push("/lite-one/report-full")}
            className="mt-10 w-full rounded-full py-4 text-[16px] font-extrabold tracking-wide text-white shadow-[0_16px_34px_-16px_rgba(214,47,22,0.6)] transition-all hover:brightness-[1.06] active:scale-[0.985]"
            style={{ background: RANK_GRADIENT }}
          >
            See the full assessment
          </button>
          <p className="mt-3 text-center text-[12.5px] text-[#A98D7D]">
            Takes about 15 minutes. Same tasks clinicians use.
          </p>
        </Band>

        {/* 8 — the quiet exit */}
        <Band className="pb-16 pt-16 sm:pt-20">
          <div className="rounded-[26px] border border-[#F0DFD3] bg-[#FFFDFB] p-6 sm:p-7">
            <h3 className="font-display text-[21px] font-extrabold leading-tight tracking-[-0.015em]">
              Not today?
            </h3>
            <p className="mt-3 text-[14.5px] leading-[1.6] text-[#6B5245]">
              Your score is already in your inbox, along with a short set of strategies for pushing
              it up. Nothing else is coming. When you want the other three numbers, you know where
              we are.
            </p>
            <button
              type="button"
              onClick={() => Router.push("/lite-one")}
              className="mt-5 text-[13.5px] font-bold text-[#8A4A22] underline underline-offset-4 transition-colors hover:text-[#C4400E]"
            >
              Retake the 60-second test
            </button>
          </div>
        </Band>
      </main>
    </>
  );
}

/**
 * globals.css pins html, body and #__next to 100dvh with overflow hidden for
 * the game screens. This page scrolls, so it opts out for its lifetime.
 */
function ScrollUnlock() {
  React.useEffect(() => {
    const next = document.getElementById("__next");
    const prev = {
      html: document.documentElement.style.cssText,
      body: document.body.style.cssText,
      next: next?.style.cssText ?? "",
    };
    for (const el of [document.documentElement, document.body, next]) {
      if (!el) continue;
      el.style.overflow = "auto";
      el.style.height = "auto";
    }
    return () => {
      document.documentElement.style.cssText = prev.html;
      document.body.style.cssText = prev.body;
      if (next) next.style.cssText = prev.next;
    };
  }, []);
  return null;
}
