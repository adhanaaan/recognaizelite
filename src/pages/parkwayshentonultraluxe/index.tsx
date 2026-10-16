import Head from "next/head";
import Router from "next/router";
import React, { useEffect } from "react";
import { ConsentCheckbox } from "src/components/LiteOne/ConsentCheckbox";
import {
  HeroFeaturedIn,
  HeroPill,
  HeroVideo,
  TrustBand,
  type PressLogo,
} from "src/components/LiteOne/LandingSections";
import { LanguagePicker } from "src/components/LiteOne/LanguagePicker";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { parkwayShentonConsentCopy } from "src/data/parkwayShentonConsentCopy";
import {
  LANG_LABELS,
  LITE_EVENT_LANGS,
  useLiteEventLang,
} from "src/i18n/liteEvent";
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
import {
  PARKWAY_SHENTON_ULTRALUXE,
  GMS_PRIVACY_POLICY_URL,
  clearLiteSession,
  consentLinkHref,
  readAttribution,
  readOrCreateAttemptId,
  stashLiteProfile,
} from "src/utils/liteOne";

/**
 * /parkwayshentonultraluxe — a copy of this /parkwayshenton screen (see
 * PARKWAY_SHENTON_ULTRALUXE in src/utils/liteOne.ts for what differs), which is
 * itself the Parkway Shenton copy of this /clinic-signup screen.
 *
 * The flow is /clinic-signup's: the email and the consent are taken here, on
 * the landing page, and the lead row is opened before the game rather
 * than after it. There is no lead form after the quiz and no consent screen
 * before the result — /parkway has both, and this funnel folds both questions
 * into this one hero. See PARKWAY_SHENTON_ULTRALUXE in src/utils/liteOne.ts.
 *
 * What it takes out of /parkwayshenton's is the name field and IHH Healthcare
 * Singapore's consent. Gray Matter Solutions' consent is the one tickbox left,
 * in /parkwayshenton's wording (src/data/parkwayShentonConsentCopy.ts), and it
 * is required. It is recorded as `consentMarketing`; `consentPartner` is never
 * sent, so that column reads NULL ("never asked").
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

/** The sign-up's fields — /lite-event/results' inputs, on the cream under the hero. */
const fieldClass =
  "w-full rounded-xl border border-quizOutline-variant bg-quizSurface-lowest px-4 py-3 text-[15px] text-charcoal placeholder-quizOutline outline-none transition-colors focus:border-quizPrimary";

/**
 * /parkwayshentonultraluxe — entry. The landing page.
 *
 * /clinic-signup's landing, which is /lite-event-template's with the lead form
 * pulled forward onto it. The hero, language picker and trust band are the
 * template's; where that funnel's CTA simply starts the run, this one takes the
 * email and the compulsory consent first, and opens the lead row
 * before the game.
 *
 * That is the point of this funnel: the email is captured by default. A
 * visitor who tries the assessment and wanders off after the first screen
 * has still left a contactable row behind, which is not true of a funnel that
 * asks at the end. The cost is a heavier hero, and it is worth it.
 *
 * There is no /parkwayshentonultraluxe/results as a result, and no consent
 * screen either: the quiz hands straight to /parkwayshentonultraluxe/loading,
 * which completes the row this page opened.
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
export default function ParkwayShentonUltraluxeEntry() {
  const { lang, setLang, enabled } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const consent = parkwayShentonConsentCopy(lang);
  const c = consent.gms;

  const [email, setEmail] = React.useState("");
  const [consented, setConsented] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const policyHref = consentLinkHref(GMS_PRIVACY_POLICY_URL);

  useEffect(() => {
    setHookClinic(PARKWAY_SHENTON_ULTRALUXE.hookClinic);
    setHookEntryPath(PARKWAY_SHENTON_ULTRALUXE.basePath);
    setHookReportPath(`${PARKWAY_SHENTON_ULTRALUXE.basePath}/game-complete`);
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
    // Wipes the previous run's attempt id along with its report and profile.
    // It matters more here than on the other funnels: this page opens a lead
    // row keyed by that attempt id, so the next patient handed the same iPad
    // would otherwise overwrite the previous one's email and consent
    // instead of getting a row of their own.
    clearLiteSession(PARKWAY_SHENTON_ULTRALUXE);
  }, []);

  /**
   * Opens the lead row, then starts the run.
   *
   * The row is written here rather than at the end so the address is captured
   * whether or not the visitor finishes: a walk-away after the first screen
   * still leaves an email and the consent behind, and those rows are the ones
   * with `score` still NULL. /parkwayshentonultraluxe/loading writes the same
   * row again when the result exists, keyed by the same attempt id, and that
   * second write is what sends the mail — `deferEmail` holds it back here,
   * since there is nothing to report yet.
   *
   * A failed save keeps the visitor on this screen with their typing intact,
   * rather than starting a run whose result has nowhere to go.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t.results.errEmail);
      return;
    }

    if (!consented) {
      setError(t.results.errConsent);
      return;
    }

    setSaving(true);
    setError("");

    const { utm, referrer } = readAttribution(PARKWAY_SHENTON_ULTRALUXE);
    const attemptId = readOrCreateAttemptId(PARKWAY_SHENTON_ULTRALUXE);

    try {
      const res = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic: PARKWAY_SHENTON_ULTRALUXE.clinic,
          attemptId,
          email: trimmedEmail,
          consentMarketing: consented,
          // No consentPartner: this funnel never asks IHH's consent, so the
          // column stays NULL ("never asked") rather than reading as declined.
          utm,
          referrer,
          deferEmail: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t.results.errSave);
      }
    } catch (err) {
      setError((err as Error).message || t.results.errSave);
      setSaving(false);
      return;
    }

    // Score and quiz age are filled in later, by the screen that completes the
    // row. No name is asked, so the report uses its un-named lines.
    stashLiteProfile({
      name: "",
      email: trimmedEmail,
      ageRange: "",
      gender: "",
      score: null,
    }, PARKWAY_SHENTON_ULTRALUXE);

    Router.push(`${PARKWAY_SHENTON_ULTRALUXE.basePath}/ready`);
  };

  /**
   * The sign-up, rendered in one of two places. On a phone it sits under the
   * video on the cream, as the design has it. On desktop the video fills the
   * whole first screen, so the form goes onto it, straight under the language
   * picker, and is still filled in above the fold. Both copies share one set
   * of state; only one is ever displayed (the other is `display: none`, so it
   * is neither focusable nor submitted), and `idSuffix` keeps their ids — and
   * the labels tied to them — apart. `onVideo` swaps the dark-on-cream text
   * for white.
   */
  const renderForm = (onVideo: boolean, idSuffix: string, className = "") => (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`lite-rise mx-auto w-full max-w-[340px] text-left ${className}`}
      style={{ animationDelay: "280ms" }}
    >
      <input
        id={`pkwsul-email${idSuffix}`}
        type="email"
        autoComplete="email"
        inputMode="email"
        aria-label={t.results.emailLabel}
        placeholder={t.results.emailPlaceholder}
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(""); }}
        className={fieldClass}
      />

      <div className="mt-4">
        <p className={`mb-2 text-[12px] font-bold leading-snug ${onVideo ? "text-white" : "text-charcoal"}`}>
          {c.heading}
        </p>
        <ConsentCheckbox
          id={`pkwsul-consent-gms${idSuffix}`}
          checked={consented}
          onChange={(next) => { setConsented(next); setError(""); }}
          size={22}
        >
          <span className={`block space-y-1 text-[11.5px] leading-[1.5] ${onVideo ? "text-white/90" : "text-charcoal/80"}`}>
            <span className="block">{c.ownBehalf}</span>
            {/* The compulsory half, set darker: it is the sentence
                a visitor is likeliest to skim, and the one the
                submit actually turns on. */}
            <span className={`block font-semibold ${onVideo ? "text-white" : "text-charcoal"}`}>{c.consent}</span>
          </span>
        </ConsentCheckbox>
      </div>

      {/* The press marks between the consent and the button, as the
          design places them: the last word before the visitor starts. */}
      <div className="mt-4">
        <HeroFeaturedIn logos={PRESS} label={t.landing.featuredIn} />
      </div>

      {/* Right above the button that raised it. */}
      {error && (
        <p
        role="alert"
        className={
          onVideo
            ? "mt-4 rounded-lg bg-black/40 px-3 py-2 text-[12.5px] font-semibold text-white"
            : "mt-4 text-[13px] font-medium text-quizError"
        }
      >
          {error}
        </p>
      )}

      <div className="mt-4">
        <LiteButton type="submit" disabled={saving}>
          {saving ? t.results.saving : t.landing.cta}
        </LiteButton>
      </div>
    </form>
  );

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
         * The video ends under the language picker and fades into the cream
         * the sign-up sits on, as on the other funnels. On a phone the hero
         * has no fixed height of its own — `flex flex-col` here plus `flex-1`
         * on HeroVideo lets it grow into any space the sections below leave
         * on a very tall viewport, and otherwise it is exactly as tall as its
         * content. On desktop the wrapper holds it to at least the full
         * viewport, so the video is the whole first screen, and the sign-up
         * sits on it under the picker rather than on the cream below.
         */}
        <div className="flex min-h-[100dvh] flex-col">
          <div className="flex flex-1 flex-col lg:min-h-[100dvh]">
            <HeroVideo whiteLogo>
              {/*
               * Two groups. On a phone HeroVideo's `justify-between` spreads
               * them: the credibility pill near the top under the lock-up, and
               * the headline stack under it, down to the language picker. On
               * desktop the full-height video would push them to opposite ends
               * of the screen, so the wrapper stops being `contents` there and
               * centres them together instead.
               */}
              <div className="contents lg:my-auto lg:flex lg:flex-col lg:items-center lg:gap-8">
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

                  {/* The language switch is the last thing on the video: the
                      visitor reads what this is, picks their language, then fills
                      in the sign-up below. The wrapper is gated on `enabled` too,
                      not just the picker — an empty div would still leave its
                      `mt-7` gap at the foot of the hero once the toggle is off. */}
                  {enabled && (
                    <div className="lite-rise mt-7" style={{ animationDelay: "240ms" }}>
                      <LanguagePicker
                        lang={lang}
                        onChange={setLang}
                        enabled={enabled}
                        label={t.picker.label}
                        langs={LITE_EVENT_LANGS}
                        labels={LANG_LABELS}
                      />
                    </div>
                  )}

                  {/* Desktop only: the sign-up on the video, under the
                      picker. See renderForm. */}
                  {renderForm(true, "-lg", "mt-8 hidden lg:block")}
                </div>
              </div>
            </HeroVideo>
          </div>

          {/* Phone and tablet: the sign-up under the video rather than on it,
              on the same cream as the hero's bottom fade so the two run
              together. On desktop it is on the video instead. */}
          <section className="bg-quizSurface-container px-6 pb-8 lg:hidden">
              {renderForm(false, "")}
          </section>

          {/* The fine print the tick refers to, below the hero rather than
              inside it. It has to be on the page the consent is given on, and
              it is — but six lines of legal text over moving footage is both
              unreadable and the largest thing in the hero, so it sits on solid
              ground under the fold instead, where it can actually be read. */}
          <section className="border-t border-quizOutline-variant/60 bg-quizSurface">
            <div className="mx-auto w-full max-w-[560px] space-y-2 px-6 py-5 text-[11px] leading-[1.6] text-quizOutline">
              <p>
                {c.dataProtectionLead}
                {policyHref ? (
                  <a
                    href={policyHref}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-quizSecondary underline decoration-quizOutline-variant underline-offset-2"
                  >
                    {c.policyName}
                  </a>
                ) : (
                  <span className="font-semibold text-quizSecondary underline decoration-quizOutline-variant underline-offset-2">
                    {c.policyName}
                  </span>
                )}
                {c.dataProtectionTail}
              </p>
              <p>{c.processingNote}</p>
            </div>
          </section>

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
