import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { eisaiConsentCopy } from "src/data/eisaiConsentCopy";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { EISAI, EISAI_RED, consentLinkHref } from "src/utils/eisai";
import { CLINIC_SIGNUP, stashPartnerConsent } from "src/utils/liteOne";

/**
 * /clinic-signup/consent — the Eisai newsletter sign-up.
 *
 * The one screen in this funnel that /lite-event-template does not have, and
 * the first one after the landing page. Registering for the assessment is
 * registering for Eisai's electronic direct mailers and CME invitations: the
 * sign-up is the condition of the run, not an option offered beside it.
 *
 * That is why there is no tickbox. A consent that gates everything behind it is
 * phrased as a condition of registering — "By registering, you consent…" — and
 * the button is the act it names; a box the visitor could leave empty would
 * offer a choice this screen does not actually give. The clauses above the
 * button are Eisai's own wording, reproduced verbatim; see
 * src/data/eisaiConsentCopy.ts for why they stay English in all three
 * languages, and EISAI_CONSENT_REQUIRED in src/utils/eisai.ts for what would
 * have to change together to make the sign-up optional.
 *
 * It sits *here*, before the game rather than after the lead form, because it
 * is the door into the funnel — the visitor who will not consent should not
 * play a five-minute game first. The consequence is that the consent has to
 * outlive the game and the quiz: `stashPartnerConsent` parks it in the funnel's
 * sessionStorage namespace, and /clinic-signup/results reads it back into the
 * lead payload's `consentPartner`, which /api/save-lead writes to
 * liteevent_leads.consent_partner (migration 019). Nothing is sent from this
 * screen: there is no contact detail to send yet, and a visitor who turns back
 * here leaves nothing behind.
 *
 * The guard on /clinic-signup/ready is what makes the screen unskippable by
 * URL. Nothing else in the funnel reads the consent.
 */

/**
 * The partner's mark, or their name set as type.
 *
 * The file is Eisai's to supply (see public/images/clinic-signup/README.md), so
 * this is the guard /parkway/consent gives IHH's logo, for the same reason: the
 * co-branding reads correctly before the asset lands, and keeps reading
 * correctly if it is ever renamed out from under the page.
 */
function PartnerMark() {
  const [failed, setFailed] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  /**
   * `onError` alone is not enough here. The page is statically rendered, so
   * the browser starts (and finishes) the request for a missing file before
   * React has hydrated and attached the handler — the event fires into
   * nothing and the broken-image glyph stays. A complete image with no
   * intrinsic width is one that already failed, so check for that on mount.
   */
  React.useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <span
        className="font-display text-[20px] font-extrabold leading-none tracking-tight"
        style={{ color: EISAI_RED }}
      >
        {EISAI.logo.alt}
      </span>
    );
  }

  return (
    <img
      ref={imgRef}
      src={EISAI.logo.src}
      alt={EISAI.logo.alt}
      onError={() => setFailed(true)}
      className="h-[32px] w-auto"
    />
  );
}

export default function ClinicSignupConsent() {
  const { lang } = useLiteEventLang();
  const c = eisaiConsentCopy(lang);

  const policyHref = consentLinkHref(EISAI.privacyPolicyUrl);

  /**
   * The button is the consent. It is recorded before the navigation rather
   * than after it, so the answer is already parked when /clinic-signup/ready
   * checks for it.
   */
  const register = () => {
    stashPartnerConsent(true, CLINIC_SIGNUP);
    Router.push(`${CLINIC_SIGNUP.basePath}/ready`);
  };

  return (
    <>
      <Head>
        <title>{c.headTitle}</title>
      </Head>

      {/* showHeader={false}: the lock-up here is the full Gray Matter + NTU
          mark beside Eisai's, rather than the shell's own single-logo header. */}
      <LiteShell scroll showHeader={false} className="px-5 pb-12 sm:px-8">
        <div className="relative mx-auto w-full max-w-[460px] pt-10 sm:pt-14">
          <div
            className="lite-rise flex items-center justify-center gap-3.5"
            style={{ animationDelay: "0ms" }}
          >
            <img
              src="/images/lite-one/logo-gms-ntu.png"
              alt="Gray Matter Solutions — a spin-off from Nanyang Technological University, Singapore"
              className="h-[28px] w-auto sm:h-[32px]"
            />
            <span aria-hidden className="h-7 w-px bg-quizOutline-variant" />
            <PartnerMark />
          </div>

          <h1
            className="lite-rise mt-7 text-center font-display text-[32px] font-extrabold leading-[1.1] text-charcoal sm:text-[38px]"
            style={{ animationDelay: "60ms" }}
          >
            {c.h1}
          </h1>

          <p
            className="lite-rise mx-auto mt-3 max-w-[380px] text-center text-[16px] leading-[1.45] text-charcoal"
            style={{ animationDelay: "120ms" }}
          >
            {c.partnerLead}
            <span className="font-semibold">{EISAI.shortName}</span>
            {c.partnerTail}
          </p>

          <p
            className="lite-rise mx-auto mt-4 max-w-[400px] text-center text-[14.5px] leading-relaxed text-quizSecondary"
            style={{ animationDelay: "160ms" }}
          >
            {c.intro}
          </p>

          <p
            className="lite-rise mt-8 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-quizPrimary"
            style={{ animationDelay: "200ms" }}
          >
            {c.eyebrow}
          </p>

          {/* The compulsory line, set as the statement it is. The accent bar is
              the partner's red: this block is Eisai's, not ours. */}
          <p
            className="lite-rise mt-4 rounded-2xl border-l-[3px] bg-quizSurface-lowest px-5 py-4 font-display text-[16px] font-bold leading-[1.45] text-charcoal"
            style={{ animationDelay: "250ms", borderLeftColor: EISAI_RED }}
          >
            {c.declaration}
          </p>

          <div
            className="lite-rise mt-5 space-y-4 text-[13.5px] leading-[1.65] text-quizSecondary"
            style={{ animationDelay: "300ms" }}
          >
            <p>{c.clauses.ownBehalf}</p>
            <p>
              {c.clauses.dataProtectionLead}
              {policyHref ? (
                <a
                  href={policyHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-charcoal underline underline-offset-2"
                >
                  {c.clauses.policyName}
                </a>
              ) : (
                <span className="font-semibold text-charcoal underline underline-offset-2">
                  {c.clauses.policyName}
                </span>
              )}
              {c.clauses.dataProtectionTail}
            </p>
            <p className="text-[12.5px] leading-[1.6] text-quizOutline">{c.processingNote}</p>
          </div>

          <div className="lite-rise mt-8" style={{ animationDelay: "360ms" }}>
            <LiteButton onClick={register}>{c.cta}</LiteButton>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
