import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { SectionBadge } from "src/components/LiteOne/SectionBadge";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import { computeScore } from "src/lib/brainHealthScoring";
import { useQuestionnaireStore } from "src/stores/useQuestionnaireStore";
import { useResultStore } from "src/stores/useResultStore";
import {
  LITE_EVENT,
  QUIZ_AGE_TO_LITE,
  fetchLiteReport,
  readAttribution,
  readOrCreateAttemptId,
  readStashedQuizResult,
  readTask2Score,
  recordLiteAttempt,
  stashLiteProfile,
  stashReport,
} from "src/utils/liteOne";
import type { DomainReport } from "src/types/report";

const SEVERITY_TO_KEY: Record<string, string> = {
  Low: "low",
  Medium: "moderate",
  High: "high",
};

const inputClass =
  "w-full rounded-xl border border-quizOutline-variant bg-quizSurface-lowest px-4 py-3.5 text-[15px] text-charcoal placeholder-quizOutline outline-none transition-colors focus:border-quizPrimary";

export default function LiteEventResults() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const { result } = useResultStore();
  const quizAnswers = useQuestionnaireStore((s) => s.answers);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const reportRef = React.useRef<DomainReport | null>(null);
  const attemptIdRef = React.useRef<string>("");

  React.useEffect(() => {
    if (!result || Object.keys(result).length === 0) return;
    const score = readTask2Score(result);
    if (score === null) return;

    let cancelled = false;
    attemptIdRef.current = readOrCreateAttemptId(LITE_EVENT);

    fetchLiteReport(result, LITE_EVENT)
      .then((report) => {
        if (cancelled) return;
        reportRef.current = report;
        stashReport(report, LITE_EVENT);
        return recordLiteAttempt({
          attemptId: attemptIdRef.current,
          score,
          percentile: Math.round(report.percentile),
          severity: SEVERITY_TO_KEY[report.severity] ?? null,
        }, LITE_EVENT);
      })
      .catch(() => {
        if (cancelled) return;
        return recordLiteAttempt({
          attemptId: attemptIdRef.current,
          score,
          percentile: null,
          severity: null,
        }, LITE_EVENT);
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

    setSubmitting(true);
    setError("");

    const report = reportRef.current;
    const { utm, referrer } = readAttribution(LITE_EVENT);

    const hasQuizAnswers = Object.keys(quizAnswers).length > 0;
    const brainScore = hasQuizAnswers
      ? computeScore(quizAnswers)
      : readStashedQuizResult(LITE_EVENT);

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
          clinic: LITE_EVENT.clinic,
          attemptId: attemptIdRef.current || readOrCreateAttemptId(LITE_EVENT),
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
      }, LITE_EVENT);
      Router.push(`${LITE_EVENT.basePath}/loading`);
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
