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
import {
  PARKWAY_SHENTON,
  GMS_PRIVACY_POLICY_URL,
  clearLiteSession,
  consentLinkHref,
  readAttribution,
  readOrCreateAttemptId,
  stashLiteProfile,
} from "src/utils/liteOne";
import { IHH, PARTNER_CONSENT_REQUIRED } from "src/utils/parkway";

/**
 * /parkwayshenton — the Parkway Shenton copy of this /clinic-signup screen.
 *
 * The flow is /clinic-signup's: the name, the email and the consents are taken
 * here, on the landing page, and the lead row is opened before the game rather
 * than after it. There is no lead form after the quiz and no consent screen
 * before the result — /parkway has both, and this funnel folds both questions
 * into this one hero. See PARKWAY_SHENTON in src/utils/liteOne.ts.
 *
 * What this page adds to /clinic-signup's is the partner. Gray Matter
 * Solutions' consent is unchanged and is the first tickbox; IHH Healthcare
 * Singapore's three clauses are the second, verbatim and in English whichever
 * language the picker is set to (see src/data/parkwayConsentCopy.ts for why).
 * Both are required, and both are recorded — `consentMarketing` and
 * `consentPartner`, which land in separate columns.
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
 * /parkwayshenton — entry. The Parkway Shenton funnel's landing page.
 *
 * /clinic-signup's landing, which is /lite-event-template's with the lead form
 * pulled forward onto it. The hero, language picker and trust band are the
 * template's; where that funnel's CTA simply starts the run, this one takes the
 * name, the email and both compulsory consents first, and opens the lead row
 * before the game.
 *
 * That is the point of this funnel: the email is captured by default. A
 * visitor who tries the assessment and wanders off after the first screen
 * has still left a contactable row behind, which is not true of a funnel that
 * asks at the end. The cost is a heavier hero — heavier here than on
 * /clinic-signup, since the partner's three clauses sit in it too — and it is
 * worth it.
 *
 * There is no /parkwayshenton/results as a result, and no /parkwayshenton/
 * consent either: both questions /parkway spreads across two screens are asked
 * on this one, and the quiz hands straight to /parkwayshenton/loading, which
 * completes the row this page opened.
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
export default function ParkwayShentonEntry() {
  const { lang, setLang, enabled } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const consent = parkwayShentonConsentCopy(lang);
  const c = consent.gms;
  const pk = consent.partner;

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [consented, setConsented] = React.useState(false);
  const [partnerConsented, setPartnerConsented] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const policyHref = consentLinkHref(GMS_PRIVACY_POLICY_URL);
  const noticeHref = consentLinkHref(IHH.dataProtectionNoticeUrl);

  useEffect(() => {
    setHookClinic(PARKWAY_SHENTON.hookClinic);
    setHookEntryPath(PARKWAY_SHENTON.basePath);
    setHookReportPath(`${PARKWAY_SHENTON.basePath}/game-complete`);
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    resetQuestionnaire();
    // Wipes the previous run's attempt id along with its report and profile.
    // It matters more here than on the other funnels: this page opens a lead
    // row keyed by that attempt id, so the next patient handed the same iPad
    // would otherwise overwrite the previous one's name, email and consents
    // instead of getting a row of their own.
    clearLiteSession(PARKWAY_SHENTON);
  }, []);

  /**
   * Opens the lead row, then starts the run.
   *
   * The row is written here rather than at the end so the address is captured
   * whether or not the visitor finishes: a walk-away after the first screen
   * still leaves a name, an email and both consents behind, and those rows are
   * the ones with `score` still NULL. /parkwayshenton/loading writes the same
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
      setError(t.results.errConsent);
      return;
    }

    if (PARTNER_CONSENT_REQUIRED && !partnerConsented) {
      setError(pk.errConsent);
      return;
    }

    setSaving(true);
    setError("");

    const { utm, referrer } = readAttribution(PARKWAY_SHENTON);
    const attemptId = readOrCreateAttemptId(PARKWAY_SHENTON);

    try {
      const res = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic: PARKWAY_SHENTON.clinic,
          attemptId,
          name: trimmedName,
          email: trimmedEmail,
          consentMarketing: consented,
          // The partner's own, in the column a PDPA request is answered from.
          // Sent even when it is false: this page put the question, so "read it
          // and declined" is a different fact from "never asked".
          consentPartner: partnerConsented,
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
    }, PARKWAY_SHENTON);

    Router.push(`${PARKWAY_SHENTON.basePath}/ready`);
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
                  id="pkws-name"
                  type="text"
                  autoComplete="name"
                  aria-label={t.results.nameLabel}
                  placeholder={t.results.namePlaceholder}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className={fieldClass}
                />
                <input
                  id="pkws-email"
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
                    id="pkws-consent-gms"
                    checked={consented}
                    onChange={(next) => { setConsented(next); setError(""); }}
                    size={22}
                  >
                    <span className="block space-y-1 text-[11.5px] leading-[1.5] text-white/85">
                      <span className="block">{c.ownBehalf}</span>
                      {/* The compulsory half, set brighter: it is the sentence
                          a visitor is likeliest to skim, and the one the
                          submit actually turns on. */}
                      <span className="block font-semibold text-white">{c.consent}</span>
                    </span>
                  </ConsentCheckbox>
                </div>

                {/* The partner's consent, asked separately because it is a
                    separate agreement with a separate holder — /parkway gives
                    it a screen of its own; this funnel has no such screen, so
                    it is asked here.

                    Set on a solid white panel rather than over the footage
                    like the block above it: that one is two short lines, this
                    one is three clauses of legal text, and nobody reads three
                    paragraphs of 11px type over moving video. Same reasoning
                    as the fields. */}
                <div className="mt-4">
                  <p className="mb-2 text-[12px] font-bold leading-snug text-white">
                    {pk.eyebrow}
                  </p>
                  <div className="rounded-xl bg-white px-3.5 py-3 shadow-sm">
                    <ConsentCheckbox
                      id="pkws-consent-partner"
                      checked={partnerConsented}
                      onChange={(next) => { setPartnerConsented(next); setError(""); }}
                      size={22}
                    >
                      {/* One tickbox for the three clauses, as the partner's
                          own form is written. */}
                      <span className="block space-y-2 text-[11.5px] leading-[1.5] text-charcoal">
                        <span className="block">
                          {pk.clauses.treatmentLead}
                          {noticeHref ? (
                            <a
                              href={noticeHref}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold underline underline-offset-2"
                              // The label wraps the whole block, so without
                              // this a tap on the notice would tick the box on
                              // the way out.
                              onClick={(e) => e.stopPropagation()}
                            >
                              {pk.clauses.noticeName}
                            </a>
                          ) : (
                            <span className="font-semibold underline underline-offset-2">
                              {pk.clauses.noticeName}
                            </span>
                          )}
                          {pk.clauses.treatmentTail}
                        </span>
                        <span className="block">{pk.clauses.marketing}</span>
                        <span className="block">{pk.clauses.dnc}</span>
                      </span>
                    </ConsentCheckbox>
                  </div>
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
              {/* The partner's withdrawal note. Below the fold with the rest of
                  the fine print for the reason given there — it is what the
                  tick above refers to, not part of what it agrees to, and the
                  DPO's address is a link worth being able to read. */}
              <p>
                {pk.withdrawal}
                <a
                  href={`mailto:${IHH.dpoEmail}`}
                  className="font-semibold text-quizSecondary underline decoration-quizOutline-variant underline-offset-2"
                >
                  {IHH.dpoEmail}
                </a>
              </p>
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
