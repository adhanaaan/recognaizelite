import Head from "next/head";
import Router from "next/router";
import React from "react";
import { ConsentCheckbox } from "src/components/LiteOne/ConsentCheckbox";
import { LiteButton, LiteShell } from "src/components/LiteOne/LiteShell";
import { parkwayConsentCopy } from "src/data/parkwayConsentCopy";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import {
  IHH,
  IHH_NAVY,
  IHH_YELLOW,
  PARTNER_CONSENT_REQUIRED,
  consentLinkHref,
} from "src/utils/parkway";
import {
  PARKWAY,
  clearPendingLead,
  readPendingLead,
  readStashedReport,
  severityKey,
  stashLiteProfile,
} from "src/utils/liteOne";

/**
 * /parkway/consent — "Before we send".
 *
 * The one screen in this funnel that /lite-event-template does not have, and
 * the last one before the report. Parkway Shenton is part of IHH Healthcare
 * Singapore, and the personal data this funnel collects is theirs to hold
 * under the PDPA, so their consent is asked for in their own words before
 * anything leaves the browser.
 *
 * It sits *here*, after the lead form rather than before it, for one reason:
 * /api/save-lead is what writes the row and mails the visitor their result
 * (see EMAIL_CLINICS in src/server/liteLeadEmail.ts). Nothing is sent until
 * this screen's button is pressed. The form parked its payload with
 * `stashPendingLead`; this screen adds the consent, posts it, and only then
 * moves on to /parkway/loading. A visitor who closes the tab here leaves no
 * row and no mail behind.
 *
 * The clauses are reproduced verbatim and are English in all three languages —
 * see the note at the top of src/data/parkwayConsentCopy.ts.
 */

/**
 * The partner's mark, or their name set as type.
 *
 * The file is IHH's to supply (see public/images/parkway/README.md), so this
 * is the same guard SiteThumb gives the site photographs on the report: the
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
        className="font-display text-[16px] font-extrabold leading-none tracking-tight"
        style={{ color: IHH_NAVY }}
      >
        {IHH.logo.alt}
      </span>
    );
  }

  return (
    <img
      ref={imgRef}
      src={IHH.logo.src}
      alt={IHH.logo.alt}
      onError={() => setFailed(true)}
      className="h-[36px] w-auto"
    />
  );
}

/**
 * The navy-and-yellow corners.
 *
 * Every other screen in the funnel sits on the warm-cream gradient with two
 * drifting blur circles; this one is the partner's, and the design marks that
 * with IHH's two brand colours sweeping past the opposite corners.
 *
 * Drawn as arcs that hug their corner rather than shapes that fill a box, and
 * positioned `absolute` rather than `fixed`: these are the corners of the
 * page, as the design has them, so the lower one belongs under the button
 * instead of following the reader up the clauses. Each box is inset to its own
 * corner and clips its own overflow, so neither one can lengthen the scroll.
 *
 * They pass close to the lock-up at the top and the button at the bottom on
 * the narrowest phones — that is the design — which is why the content column
 * starts as far down as it does.
 */
function PartnerCorners() {
  return (
    <>
      {/* Yellow wedge in the corner itself, navy band sweeping outside it.
          The viewBox is 1:1 with the box, so the radii below are CSS pixels at
          the phone size: 115 is the furthest the band reaches into the page,
          which is what the content column's top padding is set to clear. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[120px] w-[120px] overflow-hidden sm:h-[150px] sm:w-[150px]"
      >
        <svg viewBox="0 0 120 120" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M5 0A115 115 0 0 0 120 115V75A75 75 0 0 1 45 0Z"
            fill={IHH_NAVY}
          />
          <path d="M55 0A65 65 0 0 0 120 65V0Z" fill={IHH_YELLOW} />
        </svg>
      </div>

      {/* The bottom corner inverts the two colours, as the design does. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[110px] w-[110px] overflow-hidden sm:h-[140px] sm:w-[140px]"
      >
        <svg viewBox="0 0 110 110" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M0 2A108 108 0 0 1 108 110H80A80 80 0 0 0 0 30Z"
            fill={IHH_YELLOW}
          />
          <path d="M0 40A70 70 0 0 1 70 110H0Z" fill={IHH_NAVY} />
        </svg>
      </div>
    </>
  );
}

export default function ParkwayConsent() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const c = parkwayConsentCopy(lang);

  const [agreed, setAgreed] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  /**
   * Nothing to consent to if there is no lead waiting — a direct hit on this
   * URL, or a reload after the POST already went through and cleared the
   * stash. Send those back to the form rather than showing a dead button.
   */
  React.useEffect(() => {
    if (!readPendingLead(PARKWAY)) {
      Router.replace(`${PARKWAY.basePath}/results`);
    }
  }, []);

  const noticeHref = consentLinkHref(IHH.dataProtectionNoticeUrl);

  const handleContinue = async () => {
    if (saving) return;

    if (PARTNER_CONSENT_REQUIRED && !agreed) {
      setError(c.errConsent);
      return;
    }

    const pending = readPendingLead(PARKWAY);
    if (!pending) {
      Router.replace(`${PARKWAY.basePath}/results`);
      return;
    }

    setSaving(true);
    setError("");

    // The form may have submitted before its report fetch landed, leaving
    // these two null. The report is stashed by then in almost every case, so
    // fill them in rather than saving a row that is missing them.
    const report = readStashedReport(PARKWAY);
    const payload = {
      ...pending.payload,
      percentile:
        pending.payload.percentile ??
        (report ? Math.round(report.percentile) : null),
      severity: pending.payload.severity ?? severityKey(report?.severity),
      consentPartner: agreed,
    };

    try {
      const res = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t.results.errSave);
      }
      stashLiteProfile(pending.profile, PARKWAY);
      // Cleared on success only: a failed POST leaves the lead parked so the
      // button can be pressed again without retyping anything.
      clearPendingLead(PARKWAY);
      Router.push(`${PARKWAY.basePath}/loading`);
    } catch (err) {
      setError((err as Error).message || t.results.errSave);
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>{c.headTitle}</title>
      </Head>

      {/* showHeader={false}: the design's lock-up here is the full Gray Matter
          + NTU mark beside IHH's, with no divider between them, rather than
          the shell's own single-logo header. */}
      <LiteShell scroll showHeader={false} className="px-5 pb-12 sm:px-8">
        <PartnerCorners />

        <div className="relative mx-auto w-full max-w-[460px] pt-[96px] sm:pt-[104px]">
          {/* The full Gray Matter + NTU mark, which the design uses here rather
              than the short one the other screens' header carries. Sized to
              keep the pair clear of the corner sweep on a narrow phone. */}
          <div
            className="lite-rise flex items-center justify-center gap-3.5"
            style={{ animationDelay: "0ms" }}
          >
            <img
              src="/images/lite-one/logo-gms-ntu.png"
              alt="Gray Matter Solutions — a spin-off from Nanyang Technological University, Singapore"
              className="h-[28px] w-auto sm:h-[32px]"
            />
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
            <span className="font-semibold">{IHH.name}</span>
            {c.partnerTail}
          </p>

          <p
            className="lite-rise mt-7 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-quizPrimary"
            style={{ animationDelay: "180ms" }}
          >
            {c.eyebrow}
          </p>

          <div className="lite-rise mt-5" style={{ animationDelay: "240ms" }}>
            <ConsentCheckbox
              id="pkw-consent-partner"
              checked={agreed}
              onChange={(next) => { setAgreed(next); setError(""); }}
              size={30}
            >
              {/* One tickbox for the three clauses, as the partner's form is
                  written. The box aligns to the first line, so the label
                  carries all three paragraphs. */}
              <div className="space-y-4 text-[13.5px] leading-[1.65] text-charcoal">
                <p>
                  {c.clauses.treatmentLead}
                  {noticeHref ? (
                    <a
                      href={noticeHref}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold underline underline-offset-2"
                      // The label wraps the whole block, so without this a tap
                      // on the notice would tick the box on the way out.
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.clauses.noticeName}
                    </a>
                  ) : (
                    <span className="font-semibold underline underline-offset-2">
                      {c.clauses.noticeName}
                    </span>
                  )}
                  {c.clauses.treatmentTail}
                </p>
                <p>{c.clauses.marketing}</p>
                <p>{c.clauses.dnc}</p>
              </div>
            </ConsentCheckbox>
          </div>

          <p
            className="lite-rise mt-7 text-[13px] leading-[1.6] text-quizSecondary"
            style={{ animationDelay: "300ms" }}
          >
            {c.withdrawal}
            <a
              href={`mailto:${IHH.dpoEmail}`}
              className="font-semibold text-charcoal underline underline-offset-2"
            >
              {IHH.dpoEmail}
            </a>
          </p>

          {error && (
            <p role="alert" className="mt-5 text-[13px] font-medium text-quizError">
              {error}
            </p>
          )}

          <div className="lite-rise mt-8" style={{ animationDelay: "360ms" }}>
            <LiteButton onClick={handleContinue} disabled={saving}>
              {saving ? t.results.saving : c.cta}
            </LiteButton>
          </div>
        </div>
      </LiteShell>
    </>
  );
}
