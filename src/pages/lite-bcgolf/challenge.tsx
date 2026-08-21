import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { AutoPlayDemo } from "src/components/LiteOne/AutoPlayDemo";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import IMAGES from "src/constants/IMAGES.json";
import { preloadImages } from "src/lib/image-cache";

/**
 * Reaction time challenge — the intro that replaces /instruction for this
 * funnel. It explains the task with a board that plays itself, then hands
 * off to the real guided tutorial.
 *
 * The route must not contain a path segment literally named "demo":
 * isDemoPage() in src/utils/helpers.ts matches on that segment and would
 * freeze the countdown and the round advance. This is also why the funnel
 * lives at /lite-worldalzmonth rather than anything with "demo" in it.
 *
 * From here the flow rejoins the shared /symbol-matching routes; which funnel
 * it returns to afterwards is carried by hookReportPath, set on the entry page.
 */
export default function BcGolfChallenge() {
  useEffect(() => {
    // The tutorial and game both need the full 10-symbol set; warm it now
    // while the visitor is reading.
    preloadImages(IMAGES["task-2"], "/images/task-2");
  }, []);

  return (
    <>
      <Head>
        <title>Reaction time challenge | Recog-Lite</title>
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-6">
          <div className="w-full max-w-[440px] text-center">
            <p
              className="lite-rise text-[11px] font-bold uppercase tracking-[0.22em] text-quizPrimary"
              style={{ animationDelay: "20ms" }}
            >
              Step 1 of 3
            </p>
            <h1
              className="lite-rise mt-3 font-display text-[30px] font-extrabold leading-[1.08] text-charcoal sm:text-[34px]"
              style={{ animationDelay: "80ms" }}
            >
              Reaction time challenge
            </h1>
            <p
              className="lite-rise mt-3 text-[14.5px] leading-relaxed text-quizSecondary"
              style={{ animationDelay: "150ms" }}
            >
              How <span className="font-bold text-charcoal">fast</span> does your brain process?
              Match as many symbols to their numbers as you can in 60 seconds.
            </p>

            <div className="lite-rise mt-5" style={{ animationDelay: "230ms" }}>
              <AutoPlayDemo />
            </div>

            <div className="lite-rise mx-auto mt-5 max-w-[320px]" style={{ animationDelay: "320ms" }}>
              <LiteButton onClick={() => Router.push("/symbol-matching/demo")}>
                Start tutorial
              </LiteButton>
            </div>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
