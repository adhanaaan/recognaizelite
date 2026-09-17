import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteShell } from "src/components/LiteOne/LiteShell";
import { useClinicSignupIdLang } from "src/i18n/clinicSignupId";
import { clinicSignupIdCopy } from "src/i18n/clinicSignupIdCopy";
import { computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import { useResultStore } from "src/stores/useResultStore";
import {
  CLINIC_SIGNUP_ID,
  QUIZ_AGE_TO_LITE,
  fetchLiteReport,
  readAttribution,
  readLiteProfile,
  readOrCreateAttemptId,
  readStashedQuizResult,
  readStashedReport,
  readTask2Score,
  severityKey,
  stashLiteProfile,
  stashReport,
} from "src/utils/liteOne";
import type { DomainReport } from "src/types/report";

/**
 * /clinic-signup-id — the Indonesian clinic copy of this /clinic-signup screen.
 *
 * The flow is /clinic-signup's, which is /lite-event-template's less one
 * screen: this funnel takes the name, email and consents on its landing page,
 * so there is no lead form after the quiz and the quiz hands straight here.
 * See CLINIC_SIGNUP_ID in src/utils/liteOne.ts.
 *
 * That makes this the screen that finishes the lead. The landing opened the
 * row before the game with the contact details and the consent; this one writes
 * the same row again — same attempt id — with the score, the percentile and the
 * quiz, and that second write is what mails the clinician their result. The
 * template does all of this on its results screen; the work is the same, it has
 * just moved to where the numbers now arrive.
 *
 * It is a single POST on mount, alongside the report fetch the screen already
 * made, and the crumbs run for their five beats either way: a save that fails
 * must not strand a clinician who has finished the assessment in front of a
 * spinner. The row it would have completed keeps the details the landing saved.
 */

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Suspense crumbs, ported from b2cfunnel's AnalysingScreen
 * (`src/components/screens/AnalysingScreen.tsx`) along with its 1300ms beat.
 * The lines themselves live in the copy set; only the count and the beat are
 * fixed here, and every language carries the same five, so the screen holds
 * for the same time whichever one is showing.
 */
const CRUMB_MS = 1300;

const CRUMB_COUNT = 5;

/** The crumbs have to finish before the report page replaces this one. */
const MIN_VISIBLE_MS = CRUMB_MS * CRUMB_COUNT;

export default function ClinicSignupIdLoading() {
  const { lang } = useClinicSignupIdLang();
  const t = clinicSignupIdCopy(lang);
  const { result } = useResultStore();
  const quizAnswers = useQuestionnaireStore((s) => s.answers);
  const [name, setName] = React.useState("");
  const [crumb, setCrumb] = React.useState(0);

  React.useEffect(() => {
    const profile = readLiteProfile(CLINIC_SIGNUP_ID);
    if (profile?.name) setName(profile.name);
  }, []);

  // Advance the crumb line, then hold on the last one — navigation is driven by
  // the effect below, not by the end of this cycle.
  React.useEffect(() => {
    if (crumb >= CRUMB_COUNT - 1) return;
    const timer = setTimeout(() => setCrumb((i) => i + 1), CRUMB_MS);
    return () => clearTimeout(timer);
  }, [crumb]);

  /**
   * Completes the row the landing opened, then moves on.
   *
   * The two are one effect because the save has to wait for the report: the
   * percentile and severity in the lead row — and in the email that row
   * triggers — come out of it. The template's results screen fetched the report
   * on mount and this screen only re-used the stash; with that screen gone, the
   * fetch happens here, the save follows it, and the crumbs run their five
   * beats alongside both.
   *
   * `saved` guards the double-mount React's StrictMode does in development;
   * nothing else re-runs this.
   */
  const saved = React.useRef(false);
  React.useEffect(() => {
    if (saved.current) return;
    saved.current = true;

    let cancelled = false;
    const go = () => {
      if (!cancelled) Router.replace(`${CLINIC_SIGNUP_ID.basePath}/report`);
    };

    const profile = readLiteProfile(CLINIC_SIGNUP_ID);
    const score = readTask2Score(result);

    /**
     * Writes the run's numbers onto the row the landing opened, under the same
     * attempt id. This is the write that mails the clinician their result —
     * the landing's carried `deferEmail`.
     *
     * Skipped without a profile: a direct hit on this URL or a wiped session
     * has no row to complete, and inventing one from an empty form would write
     * a lead with no contact details.
     */
    const completeLead = async (report: DomainReport | null) => {
      if (!profile?.email) return;

      const hasQuizAnswers = Object.keys(quizAnswers).length > 0;
      const brainScore = hasQuizAnswers
        ? computeScore(quizAnswers)
        : readStashedQuizResult(CLINIC_SIGNUP_ID);

      const quizAge = typeof quizAnswers.age === "string" ? quizAnswers.age : null;
      const ageRange = quizAge ? QUIZ_AGE_TO_LITE[quizAge] ?? null : null;
      const gender = typeof quizAnswers.sex === "string"
        ? (quizAnswers.sex === "female" ? "female" : quizAnswers.sex === "male" ? "male" : null)
        : null;
      const { utm, referrer } = readAttribution(CLINIC_SIGNUP_ID);

      // Topped up for the report screens, which greet the clinician by name,
      // print the score, and split their copy on the raw quiz age band.
      stashLiteProfile({
        ...profile,
        ageRange: ageRange ?? "",
        gender: gender ?? "",
        score,
        quizAge,
      }, CLINIC_SIGNUP_ID);

      try {
        await fetch("/api/save-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinic: CLINIC_SIGNUP_ID.clinic,
            attemptId: readOrCreateAttemptId(CLINIC_SIGNUP_ID),
            name: profile.name,
            email: profile.email,
            ageRange,
            gender,
            score,
            percentile: report ? Math.round(report.percentile) : null,
            severity: severityKey(report?.severity),
            quizAnswers: hasQuizAnswers ? quizAnswers : null,
            brainHealthScore: brainScore ? brainScore.total : null,
            riskScore: brainScore ? brainScore.riskScore : null,
            symptomScore: brainScore ? brainScore.symptomScore : null,
            band: brainScore ? brainScore.band : null,
            persona: brainScore ? brainScore.persona : null,
            /*
             * No consent fields on this write, unlike /clinic-signup's, which
             * re-asserts its single compulsory tickbox here.
             *
             * This funnel's marketing consent is optional, so there is no value
             * to re-assert: the landing page knows what the clinician ticked and
             * this screen does not, and writing a `true` it has not been told
             * would record a consent that was never given. Nor may it send only
             * the required one — /api/save-lead writes all three consent columns
             * together once any of them arrives, so a lone `consentAnalytics`
             * would blank the marketing answer the landing page recorded.
             *
             * Leaving them out entirely is also the honest thing for
             * `consent_at`: the consent was given on the landing page, before
             * the game, and that is the moment the column should hold. The row
             * always carries them by the time this runs — the landing page
             * refuses to start the run if its write fails.
             */
            utm,
            referrer,
          }),
        });
      } catch {
        // Offline or blocked. The landing's row still carries the name, the
        // email and the consent; only the result is missing from it, and the
        // clinician still gets their report on screen.
      }
    };

    /**
     * The report, then the save, then the report screen once the crumbs have
     * had their run. Every failure path still calls `go`: a clinician who has
     * finished the assessment must never be left on a spinner because a write
     * failed.
     */
    const stashed = readStashedReport(CLINIC_SIGNUP_ID);
    const reportReady: Promise<DomainReport | null> = stashed
      ? Promise.resolve(stashed)
      : !result || Object.keys(result).length === 0
        ? Promise.resolve(null)
        : fetchLiteReport(result, CLINIC_SIGNUP_ID)
            .then((report) => {
              stashReport(report, CLINIC_SIGNUP_ID);
              return report;
            })
            // The report page re-fetches and shows its own error state, so a
            // failure here still saves the lead and moves the visitor on.
            .catch(() => null);

    Promise.all([reportReady.then(completeLead), delay(MIN_VISIBLE_MS)]).then(go, go);

    return () => {
      cancelled = true;
    };
  }, [result]);

  const greeting = name ? t.loading.greetingNamed(name) : t.loading.greeting;

  return (
    <>
      <Head>
        <title>{t.loading.headTitle}</title>
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div
            className="size-14 animate-spin rounded-full border-4 border-quizSurface-high border-t-quizPrimary"
            role="status"
            aria-label={t.loading.spinnerLabel}
          />

          <p
            className="lite-rise mt-8 max-w-[320px] font-display text-[24px] font-extrabold leading-[1.2] text-charcoal sm:text-[28px]"
            style={{ animationDelay: "80ms" }}
          >
            {greeting}
          </p>

          <p
            key={crumb}
            className="lite-crumb mt-4 min-h-[3rem] max-w-[320px] text-[14px] leading-relaxed text-quizSecondary"
          >
            {t.loading.crumbs[crumb]}
          </p>
        </div>
      </LiteShell>
    </>
  );
}
