import Head from "next/head";
import Router from "next/router";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { StepList } from "src/components/LiteOne/StepList";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy, type LiteEventCopy } from "src/i18n/liteEventCopy";
import { NTU_HOMECOMING } from "src/utils/liteOne";

/**
 * /lite-event/ntuhomecoming — the NTU Homecoming copy of this /lite-event-template screen.
 *
 * The event link for NTU Homecoming: /lite-event-template taken page for page,
 * the report's CTA trial included, so a guest sees exactly what the template
 * shows. Nothing here diverges; what is this event's alone is the campaign its
 * rows carry. See NTU_HOMECOMING in src/utils/liteOne.ts.
 */

/**
 * Step previews. Each one is a miniature of the screen it points at — the game
 * symbols, the quiz answer scale, the peer-comparison curve — drawn in the
 * Clinical Empathy palette rather than the comp's teal.
 *
 * The two that carry words take them from the copy set, so the miniatures read
 * in the language the visitor picked rather than staying English under a
 * translated headline.
 */

function GameArt() {
  return (
    <span className="relative block h-[58px] w-[62px]" aria-hidden>
      <img
        src="/images/task-2/flash.png"
        alt=""
        className="lite-bob absolute right-0 top-0 size-[36px] drop-shadow"
      />
      <img
        src="/images/task-2/setting.png"
        alt=""
        className="lite-rock absolute bottom-0 left-0 size-[32px] drop-shadow"
        style={{ animationDelay: "500ms" }}
      />
    </span>
  );
}

function QuizArt({ high, low }: { high: string; low: string }) {
  return (
    <span className="block w-[86px]" aria-hidden>
      <span className="block text-right text-[8.5px] font-bold leading-none text-quizPrimary">
        {high}
      </span>
      <span
        className="mt-1.5 block h-[7px] rounded-full"
        style={{
          background: "linear-gradient(90deg,#97c459 0%,#fac775 45%,#ef9f27 75%,#f77528 100%)",
        }}
      />
      <span className="mt-1.5 block text-[8.5px] leading-none text-quizOutline">{low}</span>
    </span>
  );
}

function CurveArt({ weak, adequate }: { weak: string; adequate: string }) {
  return (
    <span className="relative block w-[94px]" aria-hidden>
      <span className="absolute -top-1 right-[22%] rounded-md bg-quizPrimary px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
        50
      </span>
      <svg viewBox="0 0 96 52" className="mt-3 block w-full">
        <defs>
          {/*
           * SVG gradient ids are global to the document. This page is never
           * rendered alongside /lite-one/ready, but the id is namespaced anyway
           * so the two copies can't collide if that ever changes.
           */}
          <linearGradient id="ltwo-step-curve" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f77528" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f77528" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d="M2 40C16 40 18 10 46 10s30 30 48 30H2Z" fill="url(#ltwo-step-curve)" />
        <path
          d="M2 40C16 40 18 10 46 10s30 30 48 30"
          fill="none"
          stroke="#f77528"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line x1="2" y1="40" x2="94" y2="40" stroke="#d8c2b9" strokeWidth="1.4" />
        <line
          x1="64"
          y1="18"
          x2="64"
          y2="40"
          stroke="#f77528"
          strokeWidth="1.3"
          strokeDasharray="3 2.5"
        />
        <circle cx="64" cy="18" r="2.8" fill="#f77528" />
        <text x="2" y="50" fill="#85736b" fontSize="7.5" fontWeight="600">
          {weak}
        </text>
        <text x="94" y="50" fill="#f77528" fontSize="7.5" fontWeight="700" textAnchor="end">
          {adequate}
        </text>
      </svg>
    </span>
  );
}

function buildSteps(t: LiteEventCopy) {
  return [
    { label: t.ready.steps[0], illustration: <GameArt /> },
    {
      label: t.ready.steps[1],
      illustration: <QuizArt high={t.ready.quizArtHigh} low={t.ready.quizArtLow} />,
    },
    {
      label: t.ready.steps[2],
      illustration: <CurveArt weak={t.ready.curveWeak} adequate={t.ready.curveAdequate} />,
    },
  ];
}

export default function NtuHomecomingReady() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);

  return (
    <>
      <Head>
        <title>{t.ready.headTitle}</title>
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col justify-center overflow-y-auto px-6 py-6">
          <div className="mx-auto w-full max-w-[400px]">
            <div
              className="lite-rise flex items-baseline gap-2.5"
              style={{ animationDelay: "40ms" }}
            >
              <span className="font-display text-[21px] font-medium leading-none text-charcoal sm:text-[23px]">
                {t.ready.inTheNext}
              </span>
              <span className="font-display text-[29px] font-extrabold leading-none text-charcoal sm:text-[32px]">
                {t.ready.duration}
              </span>
            </div>

            <div className="mt-7">
              <StepList steps={buildSteps(t)} />
            </div>

            <div className="lite-rise mt-9 text-center" style={{ animationDelay: "600ms" }}>
              <p className="font-display text-[16px] font-semibold italic text-quizSecondary">
                {t.ready.mostImportantly}
              </p>
              <p className="mt-1 font-display text-[22px] font-extrabold leading-tight text-charcoal sm:text-[24px]">
                {t.ready.learnToImprove}
              </p>
            </div>

            <div
              className="lite-rise mx-auto mt-9 max-w-[320px]"
              style={{ animationDelay: "680ms" }}
            >
              <LiteButton onClick={() => Router.push(`${NTU_HOMECOMING.basePath}/challenge`)}>
                {t.ready.cta}
              </LiteButton>
            </div>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
