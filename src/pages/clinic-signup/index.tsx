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
import { LanguagePicker } from "src/components/LiteOne/LanguagePicker";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { resetQuestionnaire } from "src/stores/useQuestionnaireStore";
import {
  setAssessmentMode,
  setHookClinic,
  setHookEntryPath,
  setHookReportPath,
} from "src/utils/assessment";
import { CLINIC_SIGNUP, clearPartnerConsent } from "src/utils/liteOne";

/**
 * /clinic-signup — the clinic copy of this /lite-event-template screen.
 *
 * The flow is /lite-event-template's, page for page; what this funnel adds is
 * the Eisai newsletter consent, which /clinic-signup/consent takes before the
 * run begins. See CLINIC_SIGNUP in src/utils/liteOne.ts.
 */

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
 * /clinic-signup — entry. The clinic funnel's landing page.
 *
 * /lite-event-template's landing, page for page: same hero, same language
 * picker, same trust band. What differs is where the button goes. Every other
 * funnel in this family starts the run from here; this one hands off to
 * /clinic-signup/consent first, where the visitor signs up to Eisai's EDMs and
 * CME invitations. That sign-up is the condition of the run — see
 * EISAI_CONSENT_REQUIRED in src/utils/eisai.ts — so the landing is the page
 * that states what this is and the consent screen is the door.
 *
 * `clearPartnerConsent` on mount is the counterpart of that: at a booth the
 * iPad comes back to this screen for the next person, and the previous
 * visitor's consent must stop counting the moment it does. It sits here rather
 * than in `clearLiteSession` because this is the screen that marks a new
 * visitor; the rest of the run only ever reads the answer.
 *
 * Like the template, it mails the result: the funnel's clinic is "liteevent",
 * which EMAIL_CLINICS maps to the event template — see
 * src/server/liteLeadEmail.ts.
 *
 * hookClinic is "LiteEvent", which isLiteOneMode() also matches, so the shared
 * Symbol Matching components render in the same orange Clinical Empathy
 * palette. hookReportPath is what actually splits the funnels after the game:
 * it points the post-game hand-off at this funnel's game-complete screen.
 *
 * resetTaskProgress() matters: without it a visitor who already finished a run
 * lands on the celebration screen instead of the game.
 *
 * Unlike its siblings this funnel can run in Chinese or Malay: the picker at
 * the top of the hero sets the language for every screen from here to the
 * report. See src/i18n/liteEvent.ts — including the one constant that turns the
 * whole thing off. The app-wide language (which the shared /symbol-matching
 * leg reads) is set by `useLiteEventLang` on mount, which is why this page no
 * longer calls setAppLanguage("ENGLISH") the way the other entries do.
 */
export default function ClinicSignupEntry() {
  const { lang, setLang, enabled } = useLiteEventLang();
  const t = liteEventCopy(lang);

  useEffect(() => {
    setHookClinic(CLINIC_SIGNUP.hookClinic);
    setHookEntryPath(CLINIC_SIGNUP.basePath);
    setHookReportPath(`${CLINIC_SIGNUP.basePath}/game-complete`);
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
    clearPartnerConsent(CLINIC_SIGNUP);
  }, []);

  const start = () => Router.push(`${CLINIC_SIGNUP.basePath}/consent`);

  return (
    <>
      <Head>
        <title>{t.landing.headTitle}</title>
        <meta name="description" content={t.landing.metaDescription} />
        <meta property="og:title" content={t.landing.ogTitle} />
        <meta property="og:description" content={t.landing.ogDescription} />
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
             * Three groups, spread by HeroVideo's `justify-between`: the
             * credibility pill near the top under the lock-up, the headline
             * stack in the middle, and the featured-in bar at the bottom above
             * the cream fade.
             */}
            <div className="lite-rise" style={{ animationDelay: "40ms" }}>
              <HeroPill>{t.landing.pill}</HeroPill>
            </div>

            <div className="flex flex-col items-center">
              <h1
                className="lite-rise font-display text-[30px] leading-[1.16] text-white sm:text-[46px]"
                style={{ animationDelay: "110ms" }}
              >
                <span className="font-medium">{t.landing.heroLine1Lead}</span>
                <span className="font-medium italic">{t.landing.heroLine1Emph}</span>
                <br />
                <span className="font-extrabold">{t.landing.heroLine2Lead}</span>
                <span className="font-extrabold italic">{t.landing.heroLine2Emph}</span>
                <span className="font-extrabold">{t.landing.heroLine2Tail}</span>
              </h1>

              <p
                className="lite-rise mt-6 max-w-[420px] font-display text-[17px] font-bold leading-snug text-white/95 sm:text-[19px]"
                style={{ animationDelay: "200ms" }}
              >
                {t.landing.heroSub}
              </p>

              {/* The language switch sits between the subheadline and the CTA:
                  the visitor reads what this is, picks their language, then
                  starts. The wrapper is gated on `enabled` too, not just the
                  picker — an empty div would still leave its `mt-7` gap above
                  the CTA once the toggle is off. */}
              {enabled && (
                <div className="lite-rise mt-7" style={{ animationDelay: "240ms" }}>
                  <LanguagePicker
                    lang={lang}
                    onChange={setLang}
                    enabled={enabled}
                    label={t.picker.label}
                  />
                </div>
              )}

              <div
                className="lite-rise mt-8 w-full max-w-[320px]"
                style={{ animationDelay: "280ms" }}
              >
                <LiteButton onClick={start}>{t.landing.cta}</LiteButton>
              </div>
            </div>

            <div className="lite-rise" style={{ animationDelay: "360ms" }}>
              <HeroFeaturedIn logos={PRESS} label={t.landing.featuredIn} />
            </div>
          </HeroVideo>

          <TrustBand
            lead={t.landing.trustLead}
            strong1={t.landing.trustStrong1}
            mid={t.landing.trustMid}
            strong2={t.landing.trustStrong2}
            tail={t.landing.trustTail}
          />
        </div>
      </LiteShell>
    </>
  );
}
