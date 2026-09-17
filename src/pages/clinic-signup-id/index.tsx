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
import {
  CLINIC_SIGNUP_ID_CONSENT_VERSION,
  clinicSignupIdConsentCopy,
} from "src/data/clinicSignupIdConsentCopy";
import {
  CLINIC_SIGNUP_ID_LANGS,
  CLINIC_SIGNUP_ID_LANG_LABELS,
  useClinicSignupIdLang,
} from "src/i18n/clinicSignupId";
import { clinicSignupIdCopy } from "src/i18n/clinicSignupIdCopy";
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
  CLINIC_SIGNUP_ID,
  clearLiteSession,
  readAttribution,
  readOrCreateAttemptId,
  stashLiteProfile,
} from "src/utils/liteOne";

/**
 * /clinic-signup-id — the Indonesian clinic copy of this /clinic-signup screen.
 *
 * The flow is /clinic-signup's: the name, the email and the consents are taken
 * here, on the landing page, and the lead row is opened before the game rather
 * than after it. See CLINIC_SIGNUP_ID in src/utils/liteOne.ts.
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

/** The hero's fields. Solid white, because they sit on moving footage. */
const fieldClass =
  "w-full rounded-xl border border-white/70 bg-white px-4 py-3 text-[15px] text-charcoal placeholder-quizOutline shadow-sm outline-none transition-colors focus:border-quizPrimary";

/**
 * /clinic-signup-id — entry. The Indonesian clinic funnel's landing page.
 *
 * /clinic-signup's landing, which is /lite-event-template's with the lead form
 * pulled forward onto it. The hero, language picker and trust band are the
 * template's; the CTA takes the name, the email and the consents first, and
 * opens the lead row before the game.
 *
 * That is the point of this funnel: the email is captured by default. A
 * clinician who tries the assessment and wanders off after the first screen has
 * still left a contactable row behind, which is not true of a funnel that asks
 * at the end. The cost is a heavier hero, and it is worth it.
 *
 * There is no /clinic-signup-id/results as a result — the quiz hands straight
 * to /clinic-signup-id/loading, which completes the row this page opened.
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
 * ---------------------------------------------------------------------------
 * WHAT THIS SCREEN DOES THAT /clinic-signup DOES NOT
 * ---------------------------------------------------------------------------
 * It runs in English or Bahasa Indonesia, and in no other language: the picker
 * at the top of the hero sets the language for every screen from here to the
 * report, out of this funnel's own store rather than the /lite-event family's —
 * see src/i18n/clinicSignupId.ts, including the one constant that turns the
 * whole thing off. The app-wide language (which the shared /symbol-matching leg
 * reads) is set by `useClinicSignupIdLang` on mount, and Bahasa Indonesia maps
 * to that enum's "BAHASA" slot, so the game screens follow too.
 *
 * And its consent is written to Indonesia's law rather than Singapore's. The
 * shape is /clinic-signup's — one compulsory tickbox, the same two lines in it,
 * no run without it — but the sentence inside names every purpose it covers:
 * the processing, the transfer out of the Republic of Indonesia, and the mail.
 * See src/data/clinicSignupIdConsentCopy.ts, which is candid about what asking
 * once rather than twice costs under Art. 22(2).
 *
 * The Art. 21 notice that tick refers to lives on /clinic-signup-id/privacy,
 * linked from inside the tickbox itself. It used to sit on this page in full —
 * a dozen rows of legal text, the largest thing here and the least read — and
 * then as a summary paragraph under the hero, which was the same problem
 * smaller. What is left is the shape the disclosure actually wants: the
 * sentence being consented to names the notice and links it.
 */
export default function ClinicSignupIdEntry() {
  const { lang, setLang, enabled } = useClinicSignupIdLang();
  const t = clinicSignupIdCopy(lang);
  const c = clinicSignupIdConsentCopy(lang);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  // Starts false and stays false unless the clinician ticks it — a pre-ticked
  // box is not consent under Art. 20, whatever it says.
  const [consented, setConsented] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  useEffect(() => {
    setHookClinic(CLINIC_SIGNUP_ID.hookClinic);
    setHookEntryPath(CLINIC_SIGNUP_ID.basePath);
    setHookReportPath(`${CLINIC_SIGNUP_ID.basePath}/game-complete`);
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
    // Wipes the previous run's attempt id along with its report and profile.
    // It matters more here than on the other funnels: this page opens a lead
    // row keyed by that attempt id, so a second clinician on the same iPad
    // would otherwise overwrite the first one's name, email and consents
    // instead of getting a row of their own.
    clearLiteSession(CLINIC_SIGNUP_ID);
  }, []);

  /**
   * Opens the lead row, then starts the run.
   *
   * The row is written here rather than at the end so the address is captured
   * whether or not the clinician finishes: a walk-away after the first screen
   * still leaves a name, an email and the consent, and those rows are the ones
   * with `score` still NULL. /clinic-signup-id/loading writes the same row again
   * when the result exists, keyed by the same attempt id, and that second write
   * is what sends the mail — `deferEmail` holds it back here, since there is
   * nothing to report yet.
   *
   * The one tick fills both consent columns, because it carries both purposes.
   * `consentVersion` records which wording it was — Art. 20(2) puts the burden
   * of proving a consent on the controller, and "a box was ticked" is not proof
   * of what it said.
   *
   * A failed save keeps the clinician on this screen with their typing intact,
   * rather than starting a run whose result has nowhere to go.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t.results.errName);
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t.results.errEmail);
      return;
    }

    if (!consented) {
      setError(c.errConsent);
      return;
    }

    setSaving(true);
    setError("");

    const { utm, referrer } = readAttribution(CLINIC_SIGNUP_ID);
    const attemptId = readOrCreateAttemptId(CLINIC_SIGNUP_ID);

    try {
      const res = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic: CLINIC_SIGNUP_ID.clinic,
          attemptId,
          name: trimmedName,
          email: trimmedEmail,
          // One tick, both columns. It carries the processing (including the
          // transfer out of Indonesia) and the marketing together, so both are
          // true on every row this funnel writes, the way /clinic-signup's are
          // — see migration 023.
          consentAnalytics: consented,
          consentMarketing: consented,
          consentVersion: CLINIC_SIGNUP_ID_CONSENT_VERSION,
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
    // row; what the run needs from here is the name the report greets.
    stashLiteProfile({
      name: trimmedName,
      email: trimmedEmail,
      ageRange: "",
      gender: "",
      score: null,
    }, CLINIC_SIGNUP_ID);

    Router.push(`${CLINIC_SIGNUP_ID.basePath}/ready`);
  };

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

              {/* The language switch sits between the subheadline and the form:
                  the visitor reads what this is, picks their language, then
                  fills it in — which matters more here than on the funnels that
                  only start a run from this screen, because what they are
                  agreeing to is on it. The wrapper is gated on `enabled` too,
                  not just the picker — an empty div would still leave its
                  `mt-7` gap. */}
              {enabled && (
                <div className="lite-rise mt-7" style={{ animationDelay: "240ms" }}>
                  <LanguagePicker
                    lang={lang}
                    onChange={setLang}
                    enabled={enabled}
                    label={t.picker.label}
                    langs={CLINIC_SIGNUP_ID_LANGS}
                    labels={CLINIC_SIGNUP_ID_LANG_LABELS}
                  />
                </div>
              )}

              {/* The sign-up, in the slot the CTA used to have to itself.
                  Solid white fields rather than translucent ones: they sit on
                  a moving video, and a tinted input over changing footage is
                  unreadable half the time. */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="lite-rise mt-7 w-full max-w-[340px] text-left"
                style={{ animationDelay: "280ms" }}
              >
                <input
                  id="clinic-id-name"
                  type="text"
                  autoComplete="name"
                  aria-label={t.results.nameLabel}
                  placeholder={t.results.namePlaceholder}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className={fieldClass}
                />
                <input
                  id="clinic-id-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  aria-label={t.results.emailLabel}
                  placeholder={t.results.emailPlaceholder}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className={`${fieldClass} mt-2.5`}
                />

                <div className="mt-4">
                  <p className="mb-2 text-[12px] font-bold leading-snug text-white">
                    {c.heading}
                  </p>
                  <ConsentCheckbox
                    id="clinic-id-consent"
                    checked={consented}
                    onChange={(next) => { setConsented(next); setError(""); }}
                    size={22}
                  >
                    <span className="block space-y-1 text-[11.5px] leading-[1.5] text-white/85">
                      <span className="block">{c.ownBehalf}</span>
                      {/* The compulsory half, set brighter: it is the sentence
                          a clinician is likeliest to skim, and the one the
                          submit actually turns on. */}
                      <span className="block font-semibold text-white">
                        {c.consentLead}
                        {/*
                         * The notice, linked from inside the sentence that
                         * consents to it.
                         *
                         * New tab, because the name and email above are React
                         * state and this is the worst possible moment to throw
                         * away what someone typed. `stopPropagation` because
                         * the link sits inside the tickbox's own <label>: the
                         * HTML spec already says a label must not forward
                         * activation from an interactive descendant, but a
                         * stray tick here would be a consent nobody gave,
                         * which is not a thing to leave to browser agreement.
                         */}
                        <a
                          href={`${CLINIC_SIGNUP_ID.basePath}/privacy`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="underline decoration-white/60 underline-offset-2 hover:decoration-white"
                        >
                          {c.noticeLinkLabel}
                        </a>
                        {c.consentTail}
                      </span>
                    </span>
                  </ConsentCheckbox>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg bg-black/45 px-3 py-2 text-[12.5px] font-semibold text-white"
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
