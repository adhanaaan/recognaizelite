import Head from "next/head";
import Router from "next/router";
import React from "react";
import { ConsentCheckbox } from "src/components/LiteOne/ConsentCheckbox";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { SectionBadge } from "src/components/LiteOne/SectionBadge";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import { computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import { useResultStore } from "src/stores/useResultStore";
import {
  PARKWAY,
  QUIZ_AGE_TO_LITE,
  fetchLiteReport,
  readAttribution,
  readOrCreateAttemptId,
  readStashedQuizResult,
  readTask2Score,
  recordLiteAttempt,
  severityKey,
  stashPendingLead,
  stashReport,
} from "src/utils/liteOne";
import { GMS_PRIVACY_POLICY_URL, consentLinkHref } from "src/utils/parkway";
import type { DomainReport } from "src/types/report";

/**
 * /parkway — the Parkway Shenton copy of this /lite-event-template screen.
 *
 * The flow is /lite-event-template's, page for page, save for two additions
 * this screen and the next one make: the two consent tickboxes below the email
 * field, and the partner consent screen that now stands between this form and
 * the report. What the partner funnel changes after that is the report itself,
 * whose conversion path books a consultation at a Parkway Shenton site instead
 * of selling the online assessment. See PARKWAY in src/utils/liteOne.ts for
 * what the two funnels share and what they don't.
 *
 * Submitting no longer saves. /api/save-lead is what mails the visitor their
 * result (see EMAIL_CLINICS in src/server/liteLeadEmail.ts), and the partner's
 * consent is asked for before anything is sent — so this screen validates,
 * parks the payload it has assembled with `stashPendingLead`, and hands off to
 * /parkway/consent, which posts it. A visitor who backs out there leaves no
 * row and no mail behind.
 */

const inputClass =
  "w-full rounded-xl border border-quizOutline-variant bg-quizSurface-lowest px-4 py-3.5 text-[15px] text-charcoal placeholder-quizOutline outline-none transition-colors focus:border-quizPrimary";

export default function ParkwayResults() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const { result } = useResultStore();
  const quizAnswers = useQuestionnaireStore((s) => s.answers);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [consentAnalytics, setConsentAnalytics] = React.useState(false);
  const [consentMarketing, setConsentMarketing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  /** Null until the policy URL is set, which renders its name unlinked. */
  const policyHref = consentLinkHref(GMS_PRIVACY_POLICY_URL);

  const reportRef = React.useRef<DomainReport | null>(null);
  const attemptIdRef = React.useRef<string>("");

  React.useEffect(() => {
    if (!result || Object.keys(result).length === 0) return;
    const score = readTask2Score(result);
    if (score === null) return;

    let cancelled = false;
    attemptIdRef.current = readOrCreateAttemptId(PARKWAY);

    fetchLiteReport(result, PARKWAY)
      .then((report) => {
        if (cancelled) return;
        reportRef.current = report;
        stashReport(report, PARKWAY);
        return recordLiteAttempt({
          attemptId: attemptIdRef.current,
          score,
          percentile: Math.round(report.percentile),
          severity: severityKey(report.severity),
        }, PARKWAY);
      })
      .catch(() => {
        if (cancelled) return;
        return recordLiteAttempt({
          attemptId: attemptIdRef.current,
          score,
          percentile: null,
          severity: null,
        }, PARKWAY);
      });

    return () => { cancelled = true; };
  }, [result]);

  /**
   * Validates, then hands the lead to the consent screen rather than saving
   * it. The payload is assembled here because this is where the zustand
   * stores it is derived from are still populated; the screen after this one
   * only has to add the partner's consent and post it.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

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

    if (!consentAnalytics) {
      setError(t.results.errConsent);
      return;
    }

    setSubmitting(true);
    setError("");

    const report = reportRef.current;
    const { utm, referrer } = readAttribution(PARKWAY);

    const hasQuizAnswers = Object.keys(quizAnswers).length > 0;
    const brainScore = hasQuizAnswers
      ? computeScore(quizAnswers)
      : readStashedQuizResult(PARKWAY);

    const quizAge = typeof quizAnswers.age === "string" ? quizAnswers.age : null;
    const ageRange = quizAge ? QUIZ_AGE_TO_LITE[quizAge] ?? null : null;
    const gender = typeof quizAnswers.sex === "string"
      ? (quizAnswers.sex === "female" ? "female" : quizAnswers.sex === "male" ? "male" : null)
      : null;

    stashPendingLead({
      payload: {
        clinic: PARKWAY.clinic,
        attemptId: attemptIdRef.current || readOrCreateAttemptId(PARKWAY),
        name: trimmedName,
        email: trimmedEmail,
        ageRange,
        gender,
        score: readTask2Score(result),
        // Null if the report fetch this screen started on mount hasn't landed
        // yet. The consent screen fills both in from the stashed report before
        // it posts, so a fast typist still gets a complete row.
        percentile: report ? Math.round(report.percentile) : null,
        severity: report ? severityKey(report.severity) : null,
        quizAnswers: hasQuizAnswers ? quizAnswers : null,
        brainHealthScore: brainScore ? brainScore.total : null,
        riskScore: brainScore ? brainScore.riskScore : null,
        symptomScore: brainScore ? brainScore.symptomScore : null,
        band: brainScore ? brainScore.band : null,
        persona: brainScore ? brainScore.persona : null,
        utm,
        referrer,
        consentAnalytics: true,
        consentMarketing,
        // Set by the consent screen, which is the only place it is asked for.
        consentPartner: false,
      },
      // quizAge rides along for the report page: the optimizer/senior split is
      // made on the raw quiz band, not the shifted leads-table bucket.
      profile: {
        name: trimmedName,
        email: trimmedEmail,
        ageRange: ageRange ?? "",
        gender: gender ?? "",
        score: readTask2Score(result),
        quizAge,
      },
    }, PARKWAY);

    Router.push(`${PARKWAY.basePath}/consent`);
  };

  return (
    <>
      <Head>
        <title>{t.results.headTitle}</title>
      </Head>

      <LiteShell scroll className="px-5 pb-12 sm:px-8">
        <div className="relative mx-auto w-full max-w-[440px] pt-8">
          <div className="lite-rise" style={{ animationDelay: "0ms" }}>
            <SectionBadge label={t.results.badge} />
          </div>

          <h1
            className="lite-rise mt-5 font-display text-[30px] font-extrabold leading-[1.1] text-charcoal sm:text-[34px]"
            style={{ animationDelay: "60ms" }}
          >
            {t.results.h1}
          </h1>
          <p
            className="lite-rise mt-4 text-[14.5px] leading-relaxed text-quizSecondary"
            style={{ animationDelay: "120ms" }}
          >
            {t.results.sub}
          </p>

          <form
            onSubmit={handleSubmit}
            className="lite-rise mt-7 space-y-4"
            style={{ animationDelay: "180ms" }}
            noValidate
          >
            <div>
              <label
                htmlFor="ltwo-name"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-quizOutline"
              >
                {t.results.nameLabel}
              </label>
              <input
                id="ltwo-name"
                type="text"
                autoComplete="name"
                placeholder={t.results.namePlaceholder}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="ltwo-email"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-quizOutline"
              >
                {t.results.emailLabel}
              </label>
              <input
                id="ltwo-email"
                type="email"
                autoComplete="email"
                placeholder={t.results.emailPlaceholder}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={inputClass}
              />
            </div>

            {/* The two consents, between the last field and the button, the
                way the design places them. `space-y-4` is too much air for
                two stacked tickboxes, so this pair sets its own rhythm. */}
            <div className="space-y-3 pt-1">
              <ConsentCheckbox
                id="pkw-consent-analytics"
                checked={consentAnalytics}
                onChange={(next) => { setConsentAnalytics(next); setError(""); }}
              >
                <span className="block text-[12.5px] leading-[1.55] text-quizSecondary">
                  <strong className="font-bold text-charcoal">
                    {t.results.consentRequiredMark}
                  </strong>
                  {t.results.consentAnalyticsLead}
                  {policyHref ? (
                    <a
                      href={policyHref}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-charcoal underline decoration-quizOutline-variant underline-offset-2"
                      // The label wraps this whole line, so a tap on the link
                      // would toggle the box as well without this.
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t.results.consentPolicy}
                    </a>
                  ) : (
                    <span className="font-semibold text-charcoal underline decoration-quizOutline-variant underline-offset-2">
                      {t.results.consentPolicy}
                    </span>
                  )}
                  {t.results.consentAnalyticsTail}
                </span>
              </ConsentCheckbox>

              <ConsentCheckbox
                id="pkw-consent-marketing"
                checked={consentMarketing}
                onChange={setConsentMarketing}
              >
                <span className="block text-[12.5px] leading-[1.55] text-quizSecondary">
                  {t.results.consentMarketing}
                </span>
              </ConsentCheckbox>
            </div>

            {error && (
              <p role="alert" className="text-[13px] font-medium text-quizError">
                {error}
              </p>
            )}

            <LiteButton type="submit" disabled={submitting}>
              {submitting ? t.results.saving : t.results.submit}
            </LiteButton>

            <p className="text-center text-[11.5px] leading-relaxed text-quizOutline">
              {t.results.privacy}
            </p>
          </form>
        </div>
      </LiteShell>
    </>
  );
}
