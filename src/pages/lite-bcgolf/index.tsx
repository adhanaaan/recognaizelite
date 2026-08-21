import Head from "next/head";
import Router from "next/router";
import { useEffect, useState } from "react";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import {
  ABOUT,
  EVENT,
  HERO,
  PRIVACY_NOTE,
  PRODUCT,
  SCOPE_NOTE,
  TODAY,
} from "src/data/liteBcGolfContent";
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
 * Reached by QR code at a registration desk or a gala table. A guest holding a
 * drink needs four things fast: who we are, what this is, how long it takes,
 * and where to tap.
 *
 * The first version of this page led with the event and never named ReCOGnAIze
 * or Gray Matter Solutions anywhere in the visible copy — only in the browser
 * tab. That inverted the point of attending: the event is the room, not the
 * product. The lock-up, the product name and a plain "what ReCOGnAIze is"
 * section now come first, with the event as the line underneath.
 *
 * Still absent, deliberately: Business China's mark, any claim of partnership,
 * and the Guest of Honour. See the note in src/data/liteBcGolfContent.ts.
 *
 * resetTaskProgress() matters more here than anywhere else — this link gets
 * opened repeatedly on the same handful of devices when a phone or iPad is
 * passed around, and without the reset the second guest lands on the first
 * guest's completion screen.
 */
export default function BcGolfEntry() {
  const [logoOk, setLogoOk] = useState(true);
  const [researchLogoOk, setResearchLogoOk] = useState(true);

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
        <title>{PRODUCT.name} — brain health check | {EVENT.shortName}</title>
        <meta
          name="description"
          content="ReCOGnAIze is a clinically validated cognitive assessment from Gray Matter Solutions, built at the Dementia Research Centre, LKCMedicine, NTU Singapore. Try a three-minute extract."
        />
        <meta name="theme-color" content="#fff8f6" />
        {/* A QR-code destination, not something meant to be shared or indexed. */}
        <meta name="robots" content="noindex" />
      </Head>

      <LiteShell scroll showHeader={false} className="px-6 pb-16 sm:px-8">
        <div className="relative mx-auto w-full max-w-[480px] pt-9">
          {/* Us, first. */}
          {logoOk && (
            <img
              src={PRODUCT.logoSrc}
              alt={PRODUCT.logoAlt}
              onError={() => setLogoOk(false)}
              className="lite-rise h-9 w-auto object-contain"
              style={{ animationDelay: "20ms" }}
            />
          )}

          <p
            className="lite-rise mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-quizPrimary"
            style={{ animationDelay: "60ms" }}
          >
            {HERO.eyebrow}
          </p>

          <h1
            className="lite-rise mt-3 font-display text-[30px] font-bold leading-[1.14] text-charcoal sm:text-[35px]"
            style={{ animationDelay: "110ms" }}
          >
            {HERO.heading}
          </h1>

          <p
            className="lite-rise mt-4 text-[14.5px] leading-relaxed text-quizSecondary"
            style={{ animationDelay: "170ms" }}
          >
            {HERO.standfirst}
          </p>

          <div className="lite-rise mt-7" style={{ animationDelay: "230ms" }}>
            <LiteButton onClick={start}>{HERO.cta}</LiteButton>
            <p className="mt-3 text-center text-[12px] leading-snug text-quizOutline">
              {HERO.timeNote}
            </p>
          </div>

          {/* The event, as context under the fold-line rather than the headline. */}
          <p
            className="lite-rise mt-6 text-center text-[11.5px] leading-snug text-quizOutline"
            style={{ animationDelay: "280ms" }}
          >
            {HERO.eventLine}
            <br />
            {EVENT.date} · {EVENT.venue}
          </p>

          {/* What ReCOGnAIze is, for a guest who has never heard of us —
              which is most of the room. */}
          <div
            className="lite-rise mt-10 rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-5 sm:p-6"
            style={{ animationDelay: "340ms" }}
          >
            <h2 className="font-display text-[19px] font-bold leading-tight text-charcoal">
              {ABOUT.heading}
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-quizSecondary">{ABOUT.body}</p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {ABOUT.domains.map((d) => (
                <li
                  key={d}
                  className="rounded-full border border-quizOutline-variant bg-quizSurface-low px-3 py-1 text-[11.5px] font-semibold text-charcoal"
                >
                  {d}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-3 border-t border-quizOutline-variant pt-4">
              {researchLogoOk && (
                <img
                  src={PRODUCT.researchLogoSrc}
                  alt={PRODUCT.researchLogoAlt}
                  onError={() => setResearchLogoOk(false)}
                  className="h-8 w-auto shrink-0 object-contain"
                />
              )}
              <p className="text-[11.5px] leading-snug text-quizSecondary">
                {ABOUT.evidence}{" "}
                <a
                  href={ABOUT.paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-quizPrimary underline underline-offset-2"
                >
                  Read the paper
                </a>
              </p>
            </div>
          </div>

          {/* What the next three minutes consist of. */}
          <div className="lite-rise mt-8" style={{ animationDelay: "400ms" }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-quizOutline">
              Today
            </p>
            <ol className="mt-4 space-y-4">
              {TODAY.map((step, i) => (
                <li key={step.label} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 font-display text-[13px] font-extrabold tabular-nums text-quizPrimary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold leading-snug text-charcoal">
                      {step.label}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-quizSecondary">
                      {step.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div
            className="lite-rise mt-8 space-y-2.5 border-t border-quizOutline-variant pt-6"
            style={{ animationDelay: "460ms" }}
          >
            <p className="text-[12.5px] leading-relaxed text-quizSecondary">{SCOPE_NOTE}</p>
            <p className="text-[12.5px] leading-relaxed text-quizSecondary">{PRIVACY_NOTE}</p>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
