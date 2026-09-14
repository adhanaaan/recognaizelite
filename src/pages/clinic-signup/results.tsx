import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { ConsentCheckbox } from "src/components/LiteOne/ConsentCheckbox";
import { SectionBadge } from "src/components/LiteOne/SectionBadge";
import { clinicSignupConsentCopy } from "src/data/clinicSignupConsentCopy";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import { computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import { useResultStore } from "src/stores/useResultStore";
import {
  CLINIC_SIGNUP,
  QUIZ_AGE_TO_LITE,
  fetchLiteReport,
  readAttribution,
  GMS_PRIVACY_POLICY_URL,
  consentLinkHref,
  readOrCreateAttemptId,
  readStashedQuizResult,
  readTask2Score,
  recordLiteAttempt,
  stashLiteProfile,
  stashReport,
} from "src/utils/liteOne";
import type { DomainReport } from "src/types/report";

/**
 * /clinic-signup — the clinic copy of this /lite-event-template screen.
 *
 * The flow is /lite-event-template's, page for page; what this funnel adds is
 * the compulsory consent on /clinic-signup/results, where the clinician gives
 * the email address it applies to. See CLINIC_SIGNUP in src/utils/liteOne.ts.
 *
 * The consent is one required tickbox between the email field and the button —
 * the same place /parkway puts its pair, and the right place for it: it is
 * consent to be emailed, and this is the screen where the address is given.
 * The form refuses to submit without it, which is what "compulsory" means here
 * in practice; the wording says so too. See src/data/clinicSignupConsentCopy.ts
 * for whose consent this is (ours, not Eisai's) and why it is worded the way it
 * is.
 *
 * It posts as `consentMarketing`, which /api/save-lead writes to
 * liteevent_leads.consent_marketing (migration 019) — the column for "may we
 * send this person email", which is exactly the question asked. The column is
 * NULL for a funnel that never asks, false for one that asked and was declined,
 * and on this funnel's rows it is true or the row does not exist at all.
 */

const SEVERITY_TO_KEY: Record<string, string> = {
  Low: "low",
  Medium: "moderate",
  High: "high",
};

const inputClass =
  "w-full rounded-xl border border-quizOutline-variant bg-quizSurface-lowest px-4 py-3.5 text-[15px] text-charcoal placeholder-quizOutline outline-none transition-colors focus:border-quizPrimary";

export default function ClinicSignupResults() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const c = clinicSignupConsentCopy(lang);
  const { result } = useResultStore();
  const quizAnswers = useQuestionnaireStore((s) => s.answers);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [consented, setConsented] = React.useState(false);
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const policyHref = consentLinkHref(GMS_PRIVACY_POLICY_URL);

  const reportRef = React.useRef<DomainReport | null>(null);
  const attemptIdRef = React.useRef<string>("");

  React.useEffect(() => {
    if (!result || Object.keys(result).length === 0) return;
    const score = readTask2Score(result);
    if (score === null) return;

    let cancelled = false;
    attemptIdRef.current = readOrCreateAttemptId(CLINIC_SIGNUP);

    fetchLiteReport(result, CLINIC_SIGNUP)
      .then((report) => {
        if (cancelled) return;
        reportRef.current = report;
        stashReport(report, CLINIC_SIGNUP);
        return recordLiteAttempt({
          attemptId: attemptIdRef.current,
          score,
          percentile: Math.round(report.percentile),
          severity: SEVERITY_TO_KEY[report.severity] ?? null,
        }, CLINIC_SIGNUP);
      })
      .catch(() => {
        if (cancelled) return;
        return recordLiteAttempt({
          attemptId: attemptIdRef.current,
          score,
          percentile: null,
          severity: null,
        }, CLINIC_SIGNUP);
      });

    return () => { cancelled = true; };
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!consented) {
      setError(t.results.errConsent);
      return;
    }

    setSubmitting(true);
    setError("");

    const report = reportRef.current;
    const { utm, referrer } = readAttribution(CLINIC_SIGNUP);

    const hasQuizAnswers = Object.keys(quizAnswers).length > 0;
    const brainScore = hasQuizAnswers
      ? computeScore(quizAnswers)
      : readStashedQuizResult(CLINIC_SIGNUP);

    const quizAge = typeof quizAnswers.age === "string" ? quizAnswers.age : null;
    const ageRange = quizAge ? QUIZ_AGE_TO_LITE[quizAge] ?? null : null;
    const gender = typeof quizAnswers.sex === "string"
      ? (quizAnswers.sex === "female" ? "female" : quizAnswers.sex === "male" ? "male" : null)
      : null;

    try {
      const res = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic: CLINIC_SIGNUP.clinic,
          attemptId: attemptIdRef.current || readOrCreateAttemptId(CLINIC_SIGNUP),
          name: trimmedName,
          email: trimmedEmail,
          ageRange,
          gender,
          score: readTask2Score(result),
          percentile: report ? Math.round(report.percentile) : null,
          severity: report ? SEVERITY_TO_KEY[report.severity] ?? null : null,
          quizAnswers: hasQuizAnswers ? quizAnswers : null,
          brainHealthScore: brainScore ? brainScore.total : null,
          riskScore: brainScore ? brainScore.riskScore : null,
          symptomScore: brainScore ? brainScore.symptomScore : null,
          band: brainScore ? brainScore.band : null,
          persona: brainScore ? brainScore.persona : null,
          utm,
          referrer,
          // Always true by the time this runs — the submit above returns early
          // otherwise — but sent from the state rather than hard-coded, so the
          // row records what was actually ticked.
          consentMarketing: consented,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t.results.errSave);
      }
      // quizAge rides along for the report page: the optimizer/senior split is
      // made on the raw quiz band, not the shifted leads-table bucket.
      stashLiteProfile({
        name: trimmedName,
        email: trimmedEmail,
        ageRange: ageRange ?? "",
        gender: gender ?? "",
        score: readTask2Score(result),
        quizAge,
      }, CLINIC_SIGNUP);
      Router.push(`${CLINIC_SIGNUP.basePath}/loading`);
    } catch (err) {
      setError((err as Error).message || t.results.errSave);
      setSubmitting(false);
    }
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

            {/* The consent, between the last field and the button, where the
                design places it. One box, required: the heading names what is
                being confirmed and the two lines under it are what the tick
                agrees to. `space-y-4` is too much air around a block this
                tall, so it sets its own rhythm. */}
            <div className="pt-1">
              <p className="mb-2 text-[12px] font-bold leading-snug text-charcoal">
                {c.heading}
              </p>
              <ConsentCheckbox
                id="clinic-consent"
                checked={consented}
                onChange={(next) => { setConsented(next); setError(""); }}
              >
                <span className="block space-y-1.5 text-[12.5px] leading-[1.55] text-quizSecondary">
                  <span className="block">{c.ownBehalf}</span>
                  {/* The compulsory half, set in the body colour: it is the
                      sentence a clinician is likeliest to skim, and the one
                      the submit actually turns on. */}
                  <span className="block font-semibold text-charcoal">{c.consent}</span>
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

            {/* The fine print the tick refers to, under the button rather than
                inside the label: a clinician should be able to read the whole
                agreement, but not have to scroll past it to reach the form's
                only control. It replaces the shared one-line privacy note,
                which says less than this funnel has to. */}
            <div className="space-y-2.5 pt-1 text-[11.5px] leading-relaxed text-quizOutline">
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
          </form>
        </div>
      </LiteShell>
    </>
  );
}
