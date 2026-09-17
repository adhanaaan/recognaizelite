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
  GMS_PDP_CONTACT_EMAIL,
  GMS_PRIVACY_POLICY_URL,
  clearLiteSession,
  consentLinkHref,
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
 * The chips that mark a tickbox required or optional.
 *
 * They are not decoration. Art. 22(2) of Indonesia's UU No. 27 Tahun 2022 wants
 * a consent request covering more than one purpose to keep those purposes
 * clearly distinguishable, and a clinician skimming two tickboxes of similar
 * length needs to see at a glance which one the assessment depends on.
 */
function ConsentMark({ children, required }: { children: React.ReactNode; required: boolean }) {
  return (
    <span
      className={[
        "mr-1.5 inline-block rounded-md px-1.5 py-0.5 align-[1px] text-[10px] font-extrabold uppercase tracking-wide",
        required ? "bg-quizPrimary text-white" : "bg-white/25 text-white",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

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
 * And it asks for consent twice. /clinic-signup bundles the processing and the
 * marketing into one compulsory tickbox, which is how a Singapore funnel may
 * ask; UU No. 27 Tahun 2022 does not let one sentence carry both purposes
 * (Art. 22(2), void under Art. 22(3) if it does). So the required tick covers
 * the processing and the transfer out of Indonesia, the optional one covers
 * marketing, and refusing the second changes nothing about the run. The Art. 21
 * notice they refer to sits below the hero — it has to be on the page the
 * consent is given on, and it is, but it is far too long to read over moving
 * footage. All of that copy lives in src/data/clinicSignupIdConsentCopy.ts.
 */
export default function ClinicSignupIdEntry() {
  const { lang, setLang, enabled } = useClinicSignupIdLang();
  const t = clinicSignupIdCopy(lang);
  const c = clinicSignupIdConsentCopy(lang);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  // Two separate pieces of state for two separate purposes, and the marketing
  // one starts false and stays false unless the clinician ticks it — a
  // pre-ticked optional box is not consent under Art. 20.
  const [consentedProcessing, setConsentedProcessing] = React.useState(false);
  const [consentedMarketing, setConsentedMarketing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const policyHref = consentLinkHref(GMS_PRIVACY_POLICY_URL);
  const contactHref = consentLinkHref(GMS_PDP_CONTACT_EMAIL);

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
   * still leaves a name, an email and both consent answers, and those rows are
   * the ones with `score` still NULL. /clinic-signup-id/loading writes the same
   * row again when the result exists, keyed by the same attempt id, and that
   * second write is what sends the mail — `deferEmail` holds it back here, since
   * there is nothing to report yet.
   *
   * Both consents are posted, and `consentMarketing` is posted as false when it
   * was declined rather than omitted: false is an answer the clinician gave and
   * NULL means the question was never put, and a PDP request is answered from
   * the difference. `consentVersion` records which wording they answered, which
   * is what Art. 20(2) asks the controller to be able to show.
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

    if (!consentedProcessing) {
      setError(c.errProcessing);
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
          // The required tick: processing the assessment data, including the
          // transfer out of Indonesia. `consent_analytics` is the column Gray
          // Matter's own processing consent lands in — see migration 022.
          consentAnalytics: consentedProcessing,
          consentMarketing: consentedMarketing,
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

                  {/* Above both ticks, because it qualifies both: answering for
                      somebody else is processing that person's data. */}
                  <p className="mb-2.5 text-[11.5px] leading-[1.5] text-white/85">
                    {c.ownBehalf}
                  </p>

                  <ConsentCheckbox
                    id="clinic-id-consent-processing"
                    checked={consentedProcessing}
                    onChange={(next) => { setConsentedProcessing(next); setError(""); }}
                    size={22}
                  >
                    <span className="block text-[11.5px] font-semibold leading-[1.5] text-white">
                      <ConsentMark required>{c.requiredMark}</ConsentMark>
                      {c.consentProcessing}
                    </span>
                  </ConsentCheckbox>

                  <ConsentCheckbox
                    id="clinic-id-consent-marketing"
                    checked={consentedMarketing}
                    onChange={(next) => { setConsentedMarketing(next); setError(""); }}
                    size={22}
                    className="mt-3"
                  >
                    <span className="block text-[11.5px] leading-[1.5] text-white/85">
                      <ConsentMark required={false}>{c.optionalMark}</ConsentMark>
                      {c.consentMarketing}
                      <span className="mt-1 block text-[11px] italic text-white/70">
                        {c.consentMarketingNote}
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

          {/*
           * The Art. 21 notice the ticks refer to, below the hero rather than
           * inside it. The law wants it given before consent is taken and on
           * the page the consent is given on, and it is — but it runs to a
           * dozen rows, and a dozen rows of legal text over moving footage is
           * both unreadable and the largest thing in the hero. It sits on solid
           * ground under the fold instead, where it can actually be read.
           */}
          <section className="border-t border-quizOutline-variant/60 bg-quizSurface">
            <div className="mx-auto w-full max-w-[560px] px-6 py-6 text-[11px] leading-[1.6] text-quizOutline">
              <h2 className="text-[12.5px] font-bold text-quizSecondary">{c.noticeTitle}</h2>
              <p className="mt-1.5">{c.noticeLead}</p>

              {/* A description list, not paragraphs: each row is one of the
                  things Art. 21(1) names, and the term is what a reader — or a
                  regulator — scans for. */}
              <dl className="mt-3 space-y-2">
                {c.items.map((item) => (
                  <div key={item.term}>
                    <dt className="font-semibold text-quizSecondary">{item.term}</dt>
                    <dd>{item.detail}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="mt-4 text-[11.5px] font-bold text-quizSecondary">{c.rightsTitle}</h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-4">
                {c.rights.map((right) => (
                  <li key={right}>{right}</li>
                ))}
              </ul>

              <p className="mt-3">
                {c.withdrawLead}
                {contactHref && (
                  <>
                    {c.contactLead}
                    <a
                      href={`mailto:${contactHref}`}
                      className="font-semibold text-quizSecondary underline decoration-quizOutline-variant underline-offset-2"
                    >
                      {contactHref}
                    </a>
                    {c.contactTail}
                  </>
                )}
                {c.withdrawTail}
              </p>

              <p className="mt-2">
                {c.policyLead}
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
                {c.policyTail}
              </p>

              <p className="mt-2">{c.processorNote}</p>
              <p className="mt-2">{c.minorsNote}</p>
              {c.languageNote && <p className="mt-2 italic">{c.languageNote}</p>}

              {/* So the version a clinician agreed to is on the screen they
                  agreed on, and not only in the row it is written to. */}
              <p className="mt-3 text-[10px] text-quizOutline/70">
                {c.versionLabel}: {CLINIC_SIGNUP_ID_CONSENT_VERSION}
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
