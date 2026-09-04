import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { AutoPlayDemo } from "src/components/LiteOne/AutoPlayDemo";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import IMAGES from "src/constants/IMAGES.json";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import { preloadImages } from "src/lib/image-cache";

/**
 * /lite-event/ntuhomecoming — the NTU Homecoming copy of this /lite-event-template screen.
 *
 * The event link for NTU Homecoming: /lite-event-template taken page for page,
 * the report's CTA trial included, so a guest sees exactly what the template
 * shows. Nothing here diverges; what is this event's alone is the campaign its
 * rows carry. See NTU_HOMECOMING in src/utils/liteOne.ts.
 */

/**
 * Reaction time challenge — the intro that replaces /instruction for this
 * funnel. It explains the task with a board that plays itself, then hands
 * off to the real guided tutorial.
 *
 * The route must not contain a path segment literally named "demo":
 * isDemoPage() in src/utils/helpers.ts matches on that segment and would
 * freeze the countdown and the round advance.
 *
 * From here the flow rejoins the shared /symbol-matching routes; which funnel
 * it returns to afterwards is carried by hookReportPath, set on the entry page.
 * The language travels the same way — through APP_LANG, which the tutorial and
 * game screens read via src/lib/translations.
 */
export default function NtuHomecomingChallenge() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);

  useEffect(() => {
    // The tutorial and game both need the full 10-symbol set; warm it now
    // while the visitor is reading.
    preloadImages(IMAGES["task-2"], "/images/task-2");
  }, []);

  return (
    <>
      <Head>
        <title>{t.challenge.headTitle}</title>
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-6">
          <div className="w-full max-w-[440px] text-center">
            <p
              className="lite-rise text-[11px] font-bold uppercase tracking-[0.22em] text-quizPrimary"
              style={{ animationDelay: "20ms" }}
            >
              {t.challenge.step}
            </p>
            <h1
              className="lite-rise mt-3 font-display text-[30px] font-extrabold leading-[1.08] text-charcoal sm:text-[34px]"
              style={{ animationDelay: "80ms" }}
            >
              {t.challenge.h1}
            </h1>
            <p
              className="lite-rise mt-3 text-[14.5px] leading-relaxed text-quizSecondary"
              style={{ animationDelay: "150ms" }}
            >
              {t.challenge.bodyLead}
              <span className="font-bold text-charcoal">{t.challenge.bodyEmph}</span>
              {t.challenge.bodyTail}
            </p>

            <div className="lite-rise mt-5" style={{ animationDelay: "230ms" }}>
              <AutoPlayDemo label={t.challenge.demoBadge} />
            </div>

            <div className="lite-rise mx-auto mt-5 max-w-[320px]" style={{ animationDelay: "320ms" }}>
              <LiteButton onClick={() => Router.push("/symbol-matching/demo")}>
                {t.challenge.cta}
              </LiteButton>
            </div>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
