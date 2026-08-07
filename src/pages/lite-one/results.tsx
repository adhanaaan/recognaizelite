import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { useResultStore } from "src/stores/useResultStore";
import { AGE_RANGES } from "src/utils/supabase";
import {
  AGE_LABELS,
  GENDER_OPTIONS,
  LITE_CLINIC,
  fetchLiteReport,
  readAttribution,
  readTask2Score,
  stashLiteProfile,
  stashReport,
  validateOptionalPhone,
} from "src/utils/liteOne";
import type { DomainReport } from "src/types/report";

const SEVERITY_TO_KEY: Record<string, string> = {
  Low: "low",
  Medium: "moderate",
  High: "high",
};

/** Segmented chip used for both Age and Gender. */
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-xl border px-2 py-3 text-[13px] font-semibold leading-tight transition-all",
        active
          ? "border-quizPrimary bg-quizPrimary text-quizPrimary-on shadow-card"
          : "border-quizOutline-variant bg-quizSurface-lowest text-quizSecondary hover:bg-quizSurface-low",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

const inputClass =
  "w-full rounded-xl border border-quizOutline-variant bg-quizSurface-lowest px-4 py-3.5 text-[15px] text-charcoal placeholder-quizOutline outline-none transition-colors focus:border-quizPrimary";

export default function LiteOneResults() {
  const { result } = useResultStore();

  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [ageRange, setAgeRange] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Fetched up front so the payload carries the score and the report page
  // paints without a second round-trip.
  const reportRef = React.useRef<DomainReport | null>(null);

  React.useEffect(() => {
    if (!result || Object.keys(result).length === 0) return;
    if (readTask2Score(result) === null) return;
    let cancelled = false;
    fetchLiteReport(result)
      .then((report) => {
        if (cancelled) return;
        reportRef.current = report;
        stashReport(report);
      })
      .catch(() => {
        // Non-fatal: the report page will retry. The lead still saves.
      });
    return () => {
      cancelled = true;
    };
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    const phoneCheck = validateOptionalPhone(phone);
    if (!phoneCheck.ok) {
      setError(phoneCheck.error);
      return;
    }
    if (!ageRange) {
      setError("Please choose your age range — it's what your score is compared against.");
      return;
    }
    if (!gender) {
      setError("Please choose an option for gender.");
      return;
    }

    setSubmitting(true);
    setError("");

    const report = reportRef.current;
    const { utm, referrer } = readAttribution();

    try {
      const res = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic: LITE_CLINIC,
          email: trimmedEmail,
          whatsapp: phoneCheck.value,
          ageRange,
          gender,
          score: readTask2Score(result),
          percentile: report ? Math.round(report.percentile) : null,
          severity: report ? SEVERITY_TO_KEY[report.severity] ?? null : null,
          utm,
          referrer,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "We couldn't save that. Please try again.");
      }
      // A repeat submit comes back { success: true, duplicate: true } — still
      // a success as far as the visitor is concerned.
      stashLiteProfile({ email: trimmedEmail, ageRange, gender, score: readTask2Score(result) });
      Router.push("/lite-one/report");
    } catch (err) {
      setError((err as Error).message || "We couldn't save that. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Where should we send your results? | ReCOGnAIze Lite</title>
      </Head>

      <LiteShell scroll className="px-5 pb-12 sm:px-8">
        <div className="relative mx-auto w-full max-w-[440px] pt-8">
          <p className="lite-rise text-[11px] font-bold uppercase tracking-[0.22em] text-quizPrimary">
            Your results
          </p>
          <h1
            className="lite-rise mt-3 font-display text-[30px] font-extrabold leading-[1.1] text-charcoal sm:text-[34px]"
            style={{ animationDelay: "60ms" }}
          >
            Where should we send your results?
          </h1>
          <p
            className="lite-rise mt-4 text-[14.5px] leading-relaxed text-quizSecondary"
            style={{ animationDelay: "120ms" }}
          >
            Your score is ready. Add an email and we&apos;ll send the full profile and what to do
            about it. We only use it to send your results.
          </p>

          <form
            onSubmit={handleSubmit}
            className="lite-rise mt-7 space-y-4"
            style={{ animationDelay: "180ms" }}
            noValidate
          >
            <div>
              <label htmlFor="lite-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-quizOutline">
                Email
              </label>
              <input
                id="lite-email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="lite-phone" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-quizOutline">
                WhatsApp <span className="font-semibold normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="lite-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+65 1234 5678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                className={inputClass}
              />
            </div>

            <fieldset>
              <legend className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-quizOutline">
                Age
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {AGE_RANGES.map((age) => (
                  <Chip
                    key={age}
                    label={AGE_LABELS[age] ?? age}
                    active={ageRange === age}
                    onClick={() => {
                      setAgeRange(age);
                      setError("");
                    }}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-quizOutline">
                Gender
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <Chip
                    key={g.value}
                    label={g.label}
                    active={gender === g.value}
                    onClick={() => {
                      setGender(g.value);
                      setError("");
                    }}
                  />
                ))}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="text-[13px] font-medium text-quizError">
                {error}
              </p>
            )}

            <LiteButton type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Get my results"}
            </LiteButton>

            <p className="text-center text-[11.5px] leading-relaxed text-quizOutline">
              We compare your score against people in your age band. No spam, and you can
              unsubscribe from any email.
            </p>
          </form>
        </div>
      </LiteShell>
    </>
  );
}
