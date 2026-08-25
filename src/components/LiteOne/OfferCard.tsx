import React from "react";
import { OFFER } from "src/data/liteOneContent";

const money = (n: number) => `${OFFER.currency}${n.toFixed(2)}`;

/**
 * The card's words, so /lite-event can render it in Chinese or Malay. Every
 * field defaults to the English original, so the other funnels pass nothing and
 * render exactly as before.
 *
 * The downloadable voucher deliberately stays English whatever this says: it is
 * a front-desk artifact rather than a screen, and the SVG is rasterised through
 * a canvas against Helvetica/Arial, which has no CJK coverage — translated text
 * would come out as tofu boxes on the visitor's only redeemable copy.
 */
export type OfferCardLabels = {
  eyebrow: string;
  title: string;
  window: string;
  productName: string;
  productSub: string;
  domains: readonly string[];
  normalPrice: string;
  discountLabel: string;
  total: string;
  claimCode: string;
  preparing: string;
  download: string;
  redeemNote: string;
};

const DEFAULT_LABELS: OfferCardLabels = {
  eyebrow: OFFER.eyebrow,
  title: OFFER.title,
  window: OFFER.window,
  productName: OFFER.productName,
  productSub: OFFER.productSub,
  domains: OFFER.domains,
  normalPrice: "Normal price",
  discountLabel: "Alzheimer's Month discount",
  total: "Total",
  claimCode: "Your claim code:",
  preparing: "Preparing…",
  download: "Download proof",
  redeemNote: OFFER.redeemNote,
};

/** Short, readable, non-guessable-enough claim reference. */
function makeClaimCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `RLZ-${body.slice(0, 3)}-${body.slice(3)}`;
}

/**
 * The downloadable voucher, built as an SVG string and rasterised through a
 * canvas so the visitor gets a PNG they can show at a front desk. If the
 * browser blocks the canvas step, the SVG itself is downloaded instead —
 * either way something lands, with no extra dependency.
 */
function voucherSvg(code: string, issued: string) {
  const line = (label: string, value: string, y: number, bold = false) => `
    <text x="60" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#7d5747">${label}</text>
    <text x="900" y="${y}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="${bold ? 700 : 400}" fill="${bold ? "#2d2d2d" : "#7d5747"}">${value}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="620" viewBox="0 0 960 620">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff4ee"/>
      <stop offset="100%" stop-color="#fbe7de"/>
    </linearGradient>
  </defs>
  <rect width="960" height="620" fill="url(#bg)"/>
  <rect x="24" y="24" width="912" height="572" rx="28" fill="#ffffff" stroke="#d8c2b9" stroke-width="2"/>

  <rect x="60" y="60" width="270" height="40" rx="20" fill="#f77528"/>
  <text x="195" y="87" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="2" fill="#ffffff">SPECIAL OFFER</text>

  <text x="60" y="160" font-family="Helvetica, Arial, sans-serif" font-size="46" font-weight="700" fill="#2d2d2d">${OFFER.title}</text>
  <text x="60" y="198" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#7d5747">${OFFER.window}</text>

  <line x1="60" y1="234" x2="900" y2="234" stroke="#e6d6cd" stroke-width="2"/>

  <text x="60" y="282" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#2d2d2d">${OFFER.productName}</text>
  <text x="60" y="316" font-family="Helvetica, Arial, sans-serif" font-size="23" fill="#85736b">${OFFER.domains.join(" · ")}</text>

  ${line("Normal price", money(OFFER.normalPrice), 376)}
  ${line("Alzheimer's Month discount", `-${money(OFFER.discount)}`, 418)}
  <line x1="60" y1="446" x2="900" y2="446" stroke="#e6d6cd" stroke-width="2"/>
  ${line("Total", money(OFFER.total), 492, true)}

  <rect x="60" y="522" width="380" height="52" rx="14" fill="#fff1eb" stroke="#f77528" stroke-width="2"/>
  <text x="250" y="556" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="2" fill="#b8480f">${code}</text>

  <text x="900" y="544" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="19" fill="#85736b">Issued ${issued}</text>
  <text x="900" y="570" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="19" fill="#85736b">BrainScan by Gray Matter Solutions</text>
</svg>`;
}

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function OfferCard({ id, labels }: { id?: string; labels?: OfferCardLabels }) {
  const l = labels ?? DEFAULT_LABELS;
  const [code, setCode] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);

    const claim = code ?? makeClaimCode();
    setCode(claim);

    const issued = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const svg = voucherSvg(claim, issued);
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    try {
      const png = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1920;
          canvas.height = 1240;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("no 2d context"));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png");
        };
        img.onerror = () => reject(new Error("svg decode failed"));
        img.src = svgUrl;
      });

      const url = URL.createObjectURL(png);
      download(url, `brainscan-offer-${claim}.png`);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      // Canvas path blocked (older Safari, strict CSP) — the SVG is still a
      // perfectly showable file.
      download(svgUrl, `brainscan-offer-${claim}.svg`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      id={id}
      className="relative overflow-hidden rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest shadow-card"
    >
      <span
        aria-hidden
        className="lite-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-quizPrimary/10 to-transparent"
      />

      <div className="relative p-5 sm:p-6">
        <span className="inline-block rounded-full bg-quizPrimary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          {l.eyebrow}
        </span>
        <h3 className="mt-3 font-display text-[26px] font-extrabold leading-[1.1] text-charcoal">
          {l.title}
        </h3>
        <p className="mt-1 text-[13.5px] font-semibold text-quizSecondary">{l.window}</p>

        <div className="mt-5 rounded-xl border border-quizOutline-variant bg-quizSurface-low p-4">
          <p className="text-[14.5px] font-bold text-charcoal">{l.productName}</p>
          <p className="mt-0.5 text-[12px] text-quizOutline">{l.productSub}</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-quizSecondary">
            {l.domains.join(" · ")}
          </p>

          <dl className="mt-4 space-y-2 border-t border-quizOutline-variant pt-3 text-[13.5px]">
            <div className="flex justify-between">
              <dt className="text-quizSecondary">{l.normalPrice}</dt>
              <dd className="text-quizSecondary">{money(OFFER.normalPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-quizPrimary">{l.discountLabel}</dt>
              <dd className="font-semibold text-quizPrimary">−{money(OFFER.discount)}</dd>
            </div>
            <div className="flex justify-between border-t border-quizOutline-variant pt-2.5">
              <dt className="font-bold text-charcoal">{l.total}</dt>
              <dd className="font-display text-[19px] font-extrabold text-charcoal">
                {money(OFFER.total)}
              </dd>
            </div>
          </dl>
        </div>

        {code && (
          <p className="mt-3 text-center text-[12px] text-quizOutline">
            {l.claimCode} <span className="font-bold tracking-wider text-quizPrimary">{code}</span>
          </p>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="mt-4 w-full rounded-full bg-quizPrimary px-6 py-3.5 text-[15px] font-bold text-quizPrimary-on shadow-card transition-all hover:brightness-105 hover:shadow-float active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? l.preparing : l.download}
        </button>
        <p className="mt-2.5 text-center text-[11.5px] text-quizOutline">{l.redeemNote}</p>
      </div>
    </div>
  );
}
