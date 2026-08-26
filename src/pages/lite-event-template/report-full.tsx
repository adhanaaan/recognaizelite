import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteShell } from "src/components/LiteOne/LiteShell";
import { OfferCard } from "src/components/LiteOne/OfferCard";
import { Reveal } from "src/components/LiteOne/useInView";
import { UPSELL } from "src/data/liteOneContent";
import { useLiteEventLang } from "src/i18n/liteEvent";
import { liteEventCopy } from "src/i18n/liteEventCopy";
import { LITE_EVENT_TEMPLATE } from "src/utils/liteOne";

/**
 * /lite-event-template — the template copy of this /lite-event screen.
 *
 * The template funnel is where flow changes are trialled before they are
 * folded back into /lite-event, so this file starts as a page-for-page copy
 * and only diverges where a change is being tried out. See LITE_EVENT_TEMPLATE
 * in src/utils/liteOne.ts for what the two funnels share and what they don't.
 */

const sectionClass =
  "rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-5 shadow-card sm:p-6";

const CheckGlyph = (
  <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0 text-quizPrimary" aria-hidden>
    <path
      d="M3 8.5l3 3 7-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Report page two — the upsell, reached from the "Claim now" button on
 * /lite-event/report. A copy of /lite-one/report-full with this funnel's
 * routes; the offer card is shared through OfferCard, and the wording comes
 * from this funnel's own copy set so it follows the language the visitor
 * picked. `UPSELL.paperUrl` is the only thing still read from the shared
 * content module — it is a link, not copy.
 *
 * Deliberately readable without a finished run: everything here is product copy
 * plus the voucher, so a direct hit or a refresh renders fine rather than
 * needing the session data page one holds.
 */
export default function LiteEventTemplateReportFull() {
  const { lang } = useLiteEventLang();
  const t = liteEventCopy(lang);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [pubmedOk, setPubmedOk] = React.useState(true);

  const offerLabels = {
    eyebrow: t.offer.eyebrow,
    title: t.offer.title,
    window: t.offer.window,
    productName: t.offer.productName,
    productSub: t.offer.productSub,
    domains: t.offer.domains,
    normalPrice: t.offer.normalPrice,
    discountLabel: t.offer.discountLabel,
    total: t.offer.total,
    claimCode: t.offer.claimCode,
    preparing: t.offer.preparing,
    download: t.offer.download,
    redeemNote: t.offer.redeemNote,
  };

  return (
    <>
      <Head>
        <title>{t.reportFull.headTitle}</title>
      </Head>

      <LiteShell scroll className="px-5 pb-16 sm:px-8">
        <div className="relative mx-auto w-full max-w-[520px] space-y-5 pt-6">
          <Reveal>
            <button
              type="button"
              onClick={() => Router.push(`${LITE_EVENT_TEMPLATE.basePath}/report`)}
              className="text-[13px] font-semibold text-quizSecondary transition-colors hover:text-charcoal"
            >
              {t.reportFull.back}
            </button>

            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-quizPrimary">
              {t.reportFull.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-[27px] font-extrabold leading-[1.12] text-charcoal sm:text-[31px]">
              {t.reportFull.heading}
            </h1>

            <a
              href={UPSELL.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2.5 rounded-xl border border-quizOutline-variant bg-quizSurface-low px-4 py-3 transition-colors hover:border-quizPrimary"
            >
              {pubmedOk && (
                <img
                  src="/images/lite-one/logo-pubmed.svg"
                  alt="PubMed"
                  onError={() => setPubmedOk(false)}
                  className="h-5 w-auto shrink-0 object-contain"
                />
              )}
              <span className="text-[13.5px] font-medium leading-snug text-charcoal">
                {t.reportFull.paperNote}
              </span>
              <span aria-hidden className="ml-auto shrink-0 text-quizPrimary">
                →
              </span>
            </a>
          </Reveal>

          {/* What the assessment is, and what's in it. */}
          <Reveal className={sectionClass}>
            <div className="flex items-center gap-3">
              <img
                src="/images/lite-one/logo-gray-matter.svg"
                alt=""
                aria-hidden
                className="h-11 w-auto shrink-0 object-contain"
              />
              <div className="min-w-0">
                <p className="text-[14.5px] font-bold text-charcoal">{t.reportFull.offerName}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-quizSecondary">
                  {t.reportFull.offerNote}
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-quizOutline-variant pt-5">
              {t.reportFull.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  {CheckGlyph}
                  <span className="text-[13.5px] font-medium leading-snug text-charcoal">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* The offer, moved here from page one. */}
          <Reveal delay={40}>
            <OfferCard labels={offerLabels} />
          </Reveal>

          <Reveal className="space-y-2">
            {t.reportFull.faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq.q} className="overflow-hidden rounded-xl bg-quizSurface-container">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-[14px] font-semibold text-charcoal"
                  >
                    <span>{faq.q}</span>
                    <span aria-hidden className="shrink-0 text-quizPrimary">
                      {open ? "–" : "+"}
                    </span>
                  </button>
                  {open && (
                    <p className="px-5 pb-4 text-[13px] leading-relaxed text-quizSecondary">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </Reveal>

          <Reveal className="pb-4 pt-2 text-center">
            <p className="text-[11px] leading-relaxed text-quizOutline">
              {t.reportFull.disclaimer}
            </p>
          </Reveal>
        </div>
      </LiteShell>
    </>
  );
}
