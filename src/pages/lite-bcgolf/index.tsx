import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { EVENT, HERO, PRIVACY_NOTE, SCOPE_NOTE } from "src/data/liteBcGolfContent";
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
import { LITE_BCGOLF } from "src/utils/liteOne";

/**
 * Business China Fundraising Golf Tournament — entry.
 *
 * Reached by QR code at a registration desk or a gala table, which sets the
 * design brief: a guest holding a drink needs to know in one glance where they
 * are, what this is, and how long it takes. So the page is one screen — badge,
 * headline, provenance, button — with the detail below the fold for whoever
 * wants it.
 *
 * The consumer hero this was copied from opens on a video with "You tracked
 * everything. What about your brain?" and a press-logo rail. Both are cut: a
 * video is the wrong thing to autoplay in a function room, and at someone
 * else's fundraiser the restrained version is the one that reflects well on
 * the host.
 *
 * We name the event and not its Guest of Honour. See the note in
 * src/data/liteBcGolfContent.ts — the invitation names a sitting Minister for
 * Health, and his name here would read as an endorsement we do not have.
 *
 * resetTaskProgress() matters more here than anywhere else: this link will be
 * opened repeatedly on the same handful of devices if anyone passes a phone or
 * iPad around, and without the reset the second guest lands on the first
 * guest's completion screen.
 */
export default function BcGolfEntry() {
  useEffect(() => {
    setAppLanguage("ENGLISH");
    setHookClinic(LITE_BCGOLF.hookClinic);
    setHookEntryPath(LITE_BCGOLF.basePath);
    setHookReportPath(`${LITE_BCGOLF.basePath}/game-complete`);
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
  }, []);

  const start = () => Router.push(`${LITE_BCGOLF.basePath}/ready`);

  return (
    <>
      <Head>
        <title>Brain Health Check | {EVENT.shortName}</title>
        <meta
          name="description"
          content="A three-minute cognitive assessment, at the Business China Fundraising Golf Tournament. Developed and validated at the Dementia Research Centre, LKCMedicine, NTU Singapore."
        />
        <meta name="theme-color" content="#fff8f6" />
        {/* No OG image: this is a QR-code destination, not something shared. */}
        <meta name="robots" content="noindex" />
      </Head>

      <LiteShell scroll className="px-6 pb-14 sm:px-8">
        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col justify-center py-10">
          {/* Where you are. First thing a guest needs to confirm. */}
          <div className="lite-rise" style={{ animationDelay: "20ms" }}>
            <span className="inline-flex items-center rounded-full border border-quizOutline-variant bg-quizSurface-lowest px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-quizSecondary">
              {HERO.eyebrow}
            </span>
          </div>

          <h1
            className="lite-rise mt-6 font-display text-[29px] font-bold leading-[1.16] text-charcoal sm:text-[34px]"
            style={{ animationDelay: "90ms" }}
          >
            {HERO.heading}
          </h1>

          <p
            className="lite-rise mt-5 text-[14.5px] leading-relaxed text-quizSecondary"
            style={{ animationDelay: "150ms" }}
          >
            {HERO.standfirst}
          </p>

          <div className="lite-rise mt-8" style={{ animationDelay: "220ms" }}>
            <LiteButton onClick={start}>{HERO.cta}</LiteButton>
            <p className="mt-3 text-center text-[12px] leading-snug text-quizOutline">
              {HERO.timeNote}
            </p>
          </div>

          {/* Below the button: what it measures, and what happens to their
              details. A guest at someone else's fundraiser is entitled to both
              before they hand over an email. */}
          <div
            className="lite-rise mt-10 space-y-3 border-t border-quizOutline-variant pt-6"
            style={{ animationDelay: "300ms" }}
          >
            <p className="text-[12.5px] leading-relaxed text-quizSecondary">{SCOPE_NOTE}</p>
            <p className="text-[12.5px] leading-relaxed text-quizSecondary">{PRIVACY_NOTE}</p>
            <p className="pt-1 text-[11.5px] leading-relaxed text-quizOutline">
              {EVENT.date} · {EVENT.venue}
            </p>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
