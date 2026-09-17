import Head from "next/head";
import Link from "next/link";
import React from "react";
import { LiteShell } from "src/components/LiteOne/LiteShell";
import {
  CLINIC_SIGNUP_ID_CONSENT_VERSION,
  clinicSignupIdConsentCopy,
  type ClinicSignupIdConsentCopy,
} from "src/data/clinicSignupIdConsentCopy";
import { useClinicSignupIdLang } from "src/i18n/clinicSignupId";
import {
  CLINIC_SIGNUP_ID,
  GMS_PDP_CONTACT_EMAIL,
  GMS_PRIVACY_POLICY_URL,
  consentLinkHref,
} from "src/utils/liteOne";

/**
 * /clinic-signup-id/privacy — the funnel's Personal Data Protection Notice.
 *
 * Everything Art. 21(1) of Indonesia's UU No. 27 Tahun 2022 has the controller
 * disclose before consent is taken: the lawful basis, the purpose, the types of
 * personal data, the details of the information collected, the period of
 * processing, the retention period, the transfer out of Indonesia, and the
 * Art. 5-13 rights. The landing page used to carry all of it under the hero;
 * it now links here from inside the required tickbox, which is the layered
 * notice the article is normally satisfied by — the tickbox states the purpose
 * it consents to and names this page in the same sentence, and this page holds
 * the detail.
 *
 * ---------------------------------------------------------------------------
 * WHY BOTH LANGUAGES ARE ON THE PAGE AT ONCE
 * ---------------------------------------------------------------------------
 * Every other screen in this funnel renders one language, the one the picker
 * is set to. This one renders both, Indonesian first, because it is the only
 * screen whose words are the agreement rather than a description of it.
 *
 * Indonesian governs (see `languageNote` in the English set, and UU 24/2009 on
 * the language of agreements involving Indonesian parties), so it is not
 * something a clinician should have to find a toggle to reach — and a direct
 * link to this page, from an email or a regulator's file, arrives with no
 * picker state at all. Stacking both means the page reads the same however it
 * is opened.
 *
 * The heading order is fixed for the same reason: Indonesian is not "the other
 * language" here even when the funnel is being read in English.
 */

/** The label above each language's copy of the notice, in that language. */
const LANG_HEADINGS = {
  id: "Bahasa Indonesia",
  en: "English",
} as const;

/**
 * One language's copy of the notice.
 *
 * The markup is the landing page's old block, lifted wholesale: a description
 * list for the Art. 21(1) rows, because each one is a thing the article names
 * and the term is what a reader — or a regulator — scans for, then the rights,
 * then withdrawal, the policy, the processor and the minors note.
 */
function Notice({ c }: { c: ClinicSignupIdConsentCopy }) {
  const policyHref = consentLinkHref(GMS_PRIVACY_POLICY_URL);
  const contactHref = consentLinkHref(GMS_PDP_CONTACT_EMAIL);

  return (
    <div className="text-[13px] leading-[1.7] text-quizOutline">
      <h2 className="font-display text-[19px] font-bold leading-snug text-charcoal">
        {c.noticeTitle}
      </h2>
      <p className="mt-2">{c.noticeLead}</p>

      <dl className="mt-5 space-y-3">
        {c.items.map((item) => (
          <div key={item.term}>
            <dt className="font-semibold text-quizSecondary">{item.term}</dt>
            <dd>{item.detail}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 text-[14px] font-bold text-quizSecondary">{c.rightsTitle}</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        {c.rights.map((right) => (
          <li key={right}>{right}</li>
        ))}
      </ul>

      <p className="mt-5">
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

      <p className="mt-3">
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

      <p className="mt-3">{c.processorNote}</p>
      <p className="mt-3">{c.minorsNote}</p>
      {c.languageNote && <p className="mt-3 italic">{c.languageNote}</p>}
    </div>
  );
}

export default function ClinicSignupIdPrivacy() {
  // Only for the <title> and the way back: the notice itself does not depend on
  // the picker, since both languages are rendered. A clinician who opened this
  // from the Indonesian form gets an Indonesian tab title and back link.
  const { lang } = useClinicSignupIdLang();
  const chrome = clinicSignupIdConsentCopy(lang);

  const ID = clinicSignupIdConsentCopy("id");
  const EN = clinicSignupIdConsentCopy("en");

  return (
    <>
      <Head>
        <title>{chrome.pageTitle}</title>
      </Head>

      <LiteShell scroll>
        <div className="mx-auto w-full max-w-[680px] px-6 py-10">
          <Link
            href={CLINIC_SIGNUP_ID.basePath}
            className="text-[13px] font-semibold text-quizSecondary underline decoration-quizOutline-variant underline-offset-2"
          >
            {chrome.backToSignup}
          </Link>

          <section className="mt-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-quizPrimary">
              {LANG_HEADINGS.id}
            </p>
            <div className="mt-3" lang="id">
              <Notice c={ID} />
            </div>
          </section>

          <hr className="my-10 border-quizOutline-variant/60" />

          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-quizPrimary">
              {LANG_HEADINGS.en}
            </p>
            <div className="mt-3" lang="en">
              <Notice c={EN} />
            </div>
          </section>

          {/* Stated once, under both: it is the same version of the same
              notice, and it is what a row's `consent_version` points back to. */}
          <p className="mt-10 text-[11px] text-quizOutline/70">
            {chrome.versionLabel}: {CLINIC_SIGNUP_ID_CONSENT_VERSION}
          </p>
        </div>
      </LiteShell>
    </>
  );
}
