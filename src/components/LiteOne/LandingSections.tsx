import React from "react";
import {
  LANDING_FOOTER_COLS,
  LANDING_GET,
  LANDING_RISK_CUES,
  LANDING_STATS,
  LANDING_STEPS,
  TESTIMONIALS,
} from "src/data/liteOneContent";
import { Reveal } from "./useInView";

/**
 * The scrolling landing page below the hero, ported from b2cfunnel's short
 * homepage (`public/landing/index.html`). That page is hand-written HTML with
 * an inline stylesheet, so everything here is a re-expression of it in the
 * Clinical Empathy Tailwind tokens rather than a copied file.
 */

/**
 * b2cfunnel's `--maxw` / `.wrap`, which every section shares, plus the narrower
 * measure its prose sections use. Two separate constants rather than one plus
 * an override: two arbitrary `max-w-*` utilities on the same element resolve by
 * stylesheet order, not attribute order, so the winner would be a coin flip.
 */
const WRAP = "mx-auto w-full max-w-[1080px] px-6";
const WRAP_NARROW = "mx-auto w-full max-w-[760px] px-6";

/** b2cfunnel's `.section` rhythm (72px), which Tailwind's scale has no step for. */
const SECTION_Y = "py-14 sm:py-[72px]";
const SECTION_B = "pb-14 sm:pb-[72px]";

/** `src` carries its own extension — the credibility marks aren't all PNGs. */
export type PressLogo = { src: string; alt: string; h: number };

/* ------------------------------------------------------------------ hero -- */

/**
 * Full-bleed video hero. The poster paints first, a two-stop scrim keeps the
 * white copy legible over whatever frame is showing, and the bottom fade hands
 * off to the cream page beneath.
 *
 * `autoPlay muted playsInline` is not enough on its own — several mobile
 * browsers ignore the attribute — so playback is also kicked from the media
 * events, on tab re-focus, and on the visitor's first interaction.
 */
export function HeroVideo({ children }: { children: React.ReactNode }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const tryPlay = () => {
      const played = video.play();
      // Autoplay rejection is expected and handled by the interaction kick
      // below; an unhandled rejection would just noise up the console.
      if (played?.catch) played.catch(() => {});
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay, { once: true });
    video.addEventListener("loadeddata", tryPlay, { once: true });

    const onVisibility = () => {
      if (!document.hidden) tryPlay();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const events = ["touchstart", "click", "scroll", "keydown"] as const;
    const kick = () => {
      tryPlay();
      events.forEach((event) => window.removeEventListener(event, kick));
    };
    events.forEach((event) =>
      window.addEventListener(event, kick, { once: true, passive: true })
    );

    return () => {
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      document.removeEventListener("visibilitychange", onVisibility);
      events.forEach((event) => window.removeEventListener(event, kick));
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-[86vh] items-center justify-center overflow-hidden bg-[#241710] text-center">
      <video
        ref={videoRef}
        className="absolute inset-0 -z-10 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/lite-one/hero-poster.jpg"
      >
        <source src="/videos/lite-one/hero.mp4" type="video/mp4" />
      </video>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[rgba(15,10,5,0.55)] to-[rgba(15,10,5,0.74)]"
      />
      {/* Extra shade at the very top. The lock-up sits on the video rather than
          in a band of its own, and the first video frames are bright enough to
          swallow it without this. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-[rgba(10,6,3,0.62)] to-transparent"
      />

      {/* Parkway Shenton + Gray Matter, floating on the video rather than in a
          band of their own. Both marks are dark-inked and one is a filled
          shape, so knocking them out to white turns them into blobs — they keep
          their real colours and sit on a light frosted plate instead. */}
      <div className="absolute inset-x-0 top-0 z-20 flex justify-center px-5 pt-5 sm:pt-6">
        <div className="flex items-center gap-5 rounded-2xl border border-white/50 bg-white/80 px-5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-md sm:gap-7">
          <img
            src="/images/lite-one/logo-parkway-shenton.png"
            alt="Parkway Shenton"
            className="h-[20px] w-auto sm:h-[22px]"
          />
          <span aria-hidden className="h-7 w-px bg-charcoal/15" />
          <img
            src="/images/lite-one/logo-gray-matter.png"
            alt="Gray Matter Solutions"
            className="h-[27px] w-auto sm:h-[30px]"
          />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-quizSurface-container"
      />
      <div className={`relative z-20 ${WRAP_NARROW} py-20`}>{children}</div>
    </section>
  );
}

/**
 * The hero's credibility pill — b2cfunnel's `.hero .pill`. Translucent rather
 * than the solid white `SectionBadge`, so it sits on the video instead of
 * punching a hole in it. The brain mark deliberately keeps its orange.
 */
export function HeroPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm sm:text-[13px]">
      <img src="/images/lite-one/logo-gms-mark.png" alt="" aria-hidden className="h-[18px] w-auto" />
      {children}
    </span>
  );
}

/**
 * "As featured in" — b2cfunnel's `.hero-marquee` from full.html: a frosted
 * panel inside the hero rather than a separate band below it.
 *
 * b2cfunnel knocks these logos out to white. Ours can't take that treatment —
 * CNA's mark is a filled disc that flattens into a plain white circle — so the
 * plate is light and the logos keep their own colours.
 */
export function HeroFeaturedIn({ logos }: { logos: readonly PressLogo[] }) {
  const half = [...logos, ...logos];
  const track = [...half, ...half];

  return (
    <div className="mx-auto mt-5 w-full max-w-[720px] rounded-2xl border border-white/50 bg-white/80 px-2 pb-4 pt-4 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <p className="flex items-center justify-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.22em] text-quizSecondary">
        <span aria-hidden className="h-px w-[22px] bg-charcoal/25" />
        As featured in
        <span aria-hidden className="h-px w-[22px] bg-charcoal/25" />
      </p>
      <div
        className="lite-marquee-track relative mt-3.5 overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)",
          WebkitMaskImage: "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)",
        }}
      >
        <div className="lite-marquee flex w-max items-center gap-12">
          {track.map((logo, i) => (
            <img
              key={`${logo.src}-${i}`}
              src={`/images/lite-one/${logo.src}`}
              alt={i < logos.length ? logo.alt : ""}
              aria-hidden={i >= logos.length}
              style={{ height: logo.h }}
              className="w-auto shrink-0 opacity-90"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ trust band -- */

export function TrustBand() {
  return (
    <section className="border-b border-quizOutline-variant/60 bg-quizSurface-container">
      <div className={`${WRAP} flex items-center justify-center gap-3 py-4 text-center`}>
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-quizPrimary" aria-hidden>
          <path
            d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 12l2.5 2.5 4.5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-[13px] font-semibold text-charcoal sm:text-[14.5px]">
          Based on the <span className="font-extrabold text-quizPrimary">2024 Lancet Commission</span>{" "}
          risk model and the{" "}
          <span className="font-extrabold text-quizPrimary">CAIDE dementia risk score</span>.
        </p>
      </div>
    </section>
  );
}


/* --------------------------------------------------------------- problem -- */

/** One leader line: label, rule, node. The node always sits nearest the face. */
function Cue({ label, side }: { label: string; side: "left" | "right" }) {
  return (
    <div
      className={[
        "flex items-center gap-2 sm:gap-3",
        // Mobile stacks all five cues in one right-aligned column beside the
        // face. From sm the fan splits and the right-hand group mirrors.
        "justify-end",
        side === "right" ? "sm:flex-row-reverse" : "",
      ].join(" ")}
    >
      <span className="whitespace-nowrap text-[12px] font-bold leading-tight text-charcoal sm:text-[15.5px]">
        {label}
      </span>
      <span aria-hidden className="h-[1.5px] w-[26px] shrink-0 bg-charcoal/20 sm:w-[66px]" />
      <span
        aria-hidden
        className="size-[8px] shrink-0 rounded-full bg-quizPrimary ring-[3px] ring-quizPrimary/15 sm:size-[9px] sm:ring-4"
      />
    </div>
  );
}

export function ProblemSection() {
  return (
    <Reveal className={`bg-gradient-to-b from-[#fdeee7] to-[#f7d8c6] ${SECTION_Y}`}>
      <div className={`${WRAP_NARROW} text-center`}>
        <h2 className="font-display text-[28px] font-extrabold leading-tight text-charcoal sm:text-[40px]">
          Cognitive decline starts from 40.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-quizSecondary sm:text-[18px]">
          By the time you start experiencing signs of forgetfulness or early dementia, the window to
          act has usually narrowed.
        </p>

        <div
          className="relative mt-10 pr-[116px] sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-8 sm:pr-0"
          aria-label="Risk factors that affect brain health"
        >
          <div className="flex flex-col gap-4 sm:gap-7">
            {LANDING_RISK_CUES.left.map((label) => (
              <Cue key={label} label={label} side="left" />
            ))}
          </div>

          <img
            src="/images/lite-one/problem-face.png"
            alt="A man rubbing his eyes at a laptop"
            className="absolute right-0 top-1/2 w-[104px] -translate-y-1/2 sm:static sm:w-[260px] sm:translate-y-0"
          />

          <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:gap-7">
            {LANDING_RISK_CUES.right.map((label) => (
              <Cue key={label} label={label} side="right" />
            ))}
          </div>
        </div>

        <p className="mt-10 text-[15px] leading-relaxed text-quizSecondary sm:text-[18px]">
          Many changes detected early can be addressed through lifestyle adjustments, targeted
          cognitive training, and nutritional support.
        </p>
        <p className="mt-4 font-display text-[18px] font-bold text-quizPrimary sm:text-[20px]">
          Knowing gives you options.
        </p>
      </div>
    </Reveal>
  );
}

/* ----------------------------------------------------------------- stats -- */

export function StatsSection() {
  return (
    <Reveal className={SECTION_Y}>
      <div className={`${WRAP} grid grid-cols-3 gap-2 sm:gap-4`}>
        {LANDING_STATS.map((stat) => (
          <div
            key={stat.figure}
            className="rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-3.5 shadow-card sm:p-6"
          >
            <p className="font-display text-[clamp(22px,6vw,42px)] font-extrabold leading-none text-quizPrimary">
              {stat.figure}
            </p>
            <p className="mt-2 text-[clamp(11px,2.7vw,13.5px)] font-semibold leading-snug text-charcoal">
              {stat.label}
            </p>
            <p className="mt-2 text-[clamp(9.5px,2.3vw,12.5px)] leading-snug text-quizOutline">
              {stat.source}
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* --------------------------------------------------------- science strip -- */

export function ScienceBand() {
  return (
    <section className="bg-gradient-to-br from-quizPrimary to-[#ffab57] py-6">
      <div className={`${WRAP} flex flex-col items-center gap-3.5`}>
        <span className="text-center text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-white sm:text-[12.5px]">
          Based on validated clinical research
        </span>
        <div className="flex items-center justify-center gap-5 sm:gap-8">
          {/* Tinted to flat white so both marks read on the orange band. */}
          <img
            src="/images/lite-one/logo-gms-ntu.png"
            alt="Gray Matter Solutions, a spin-off from NTU Singapore"
            className="h-6 w-auto brightness-0 invert sm:h-[34px]"
          />
          <img
            src="/images/lite-one/logo-pubmed.svg"
            alt="PubMed"
            className="h-[17px] w-auto brightness-0 invert sm:h-6"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- how it works -- */

export function HowItWorks() {
  return (
    <Reveal className={SECTION_Y}>
      <div className={WRAP}>
        <h2 className="text-center font-display text-[28px] font-extrabold leading-tight text-charcoal sm:text-[36px]">
          How it works
        </h2>

        <ol className="relative mx-auto mt-10 max-w-[620px]">
          {/* Connector behind the numbered dots, inset by half a dot so it
              starts and ends at their centres. */}
          <span
            aria-hidden
            className="absolute left-[26px] top-6 bottom-6 w-[3px] -translate-x-1/2 rounded-full bg-quizPrimary/25"
          />
          {LANDING_STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative grid grid-cols-[52px_1fr] items-start gap-5 pb-7 last:pb-0"
            >
              <span className="relative z-10 grid size-[52px] place-items-center rounded-full border-[5px] border-quizSurface bg-quizPrimary font-display text-[19px] font-extrabold text-white shadow-card">
                {i + 1}
              </span>
              <div className="rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-5 shadow-card">
                <h3 className="font-display text-[17px] font-extrabold text-charcoal sm:text-[18px]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-quizSecondary sm:text-[14.5px]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}

/* -------------------------------------------------------- what you get -- */

export function WhatYouGet({ onStart }: { onStart: () => void }) {
  return (
    <Reveal className={SECTION_B}>
      <div className={WRAP}>
        <div
          className="relative mx-auto max-w-[760px] overflow-hidden rounded-[28px] border border-white/25 p-8 text-center shadow-float sm:p-14"
          style={{
            background:
              "radial-gradient(105% 90% at 82% -8%, rgba(255,208,156,.72), transparent 58%), radial-gradient(85% 75% at 8% 112%, rgba(255,128,64,.55), transparent 62%), linear-gradient(155deg, #ffb35f 0%, #f77528 48%, #df5a16 100%)",
          }}
        >
          <h2 className="font-display text-[24px] font-extrabold leading-tight text-white sm:text-[34px]">
            3 minutes today is a smart place to start.
          </h2>

          <ul className="mx-auto mt-6 flex max-w-[460px] flex-col gap-3.5 text-left">
            {LANDING_GET.map((item) => (
              <li key={item} className="flex gap-3 text-[14.5px] text-white/95 sm:text-[16px]">
                <span aria-hidden className="font-extrabold text-white">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onStart}
            className="mt-8 rounded-full bg-white px-8 py-3.5 text-[15px] font-bold text-quizPrimary shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float active:scale-[0.98]"
          >
            Take the free quiz →
          </button>
        </div>
      </div>
    </Reveal>
  );
}

/* ---------------------------------------------------------- social proof -- */

/**
 * b2cfunnel pairs these quotes with placeholder "video review" tiles whose
 * play buttons aren't wired to anything, so only the real quotes are ported.
 */
export function SocialProof() {
  return (
    <Reveal className={SECTION_B}>
      <div className={WRAP}>
        <h2 className="text-center font-display text-[28px] font-extrabold leading-tight text-charcoal sm:text-[36px]">
          What people are saying
        </h2>
        <p className="mt-3 flex items-center justify-center gap-2.5 text-[14px] text-quizSecondary">
          <span aria-hidden className="tracking-[2px] text-[#00b67a]">
            ★★★★★
          </span>
          <span className="font-bold text-charcoal">Excellent</span> 4.8 out of 5
        </p>

        <div className="lite-rail -mx-6 mt-8 flex gap-4 overflow-x-auto px-6 pb-3">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="flex w-[264px] shrink-0 flex-col justify-center rounded-[20px] bg-quizSurface-container px-6 py-8 text-center sm:w-[300px]"
            >
              <span aria-hidden className="tracking-[2px] text-charcoal">
                ★★★★★
              </span>
              <h3 className="mt-4 font-display text-[19px] font-extrabold text-charcoal">
                {t.headline}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-quizSecondary">“{t.quote}”</p>
              <p className="mt-5 text-[13px] font-semibold text-charcoal">
                {t.name} · {t.age}
              </p>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* --------------------------------------------------------- clinic teaser -- */

/**
 * A short pointer at the paid assessment. The full commerce pitch lives on
 * /lite-one/report-full, so this stays a teaser rather than repeating it.
 */
export function AssessmentTeaser({ onStart }: { onStart: () => void }) {
  return (
    <Reveal className={SECTION_B}>
      <div className={WRAP}>
        <div className="mx-auto max-w-[760px] overflow-hidden rounded-3xl border border-quizOutline-variant bg-quizSurface-lowest shadow-card sm:flex sm:items-center">
          <div className="p-6 sm:flex-1 sm:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-quizPrimary">
              ReCOGnAIze full assessment
            </p>
            <h3 className="mt-2 font-display text-[21px] font-extrabold leading-tight text-charcoal sm:text-[23px]">
              Go deeper across all four cognitive domains.
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-quizSecondary">
              Clinically-validated neuroscientific games measure processing speed, memory, attention
              and executive function, with a full in-depth report and recommendations.
            </p>
          </div>
          <div className="border-t border-quizOutline-variant bg-quizSurface-low p-6 text-center sm:w-[240px] sm:shrink-0 sm:border-l sm:border-t-0 sm:p-8">
            <p className="text-[12.5px] font-semibold text-quizSecondary">
              Start with the free check
            </p>
            <button
              type="button"
              onClick={onStart}
              className="mt-3 w-full rounded-full bg-quizPrimary px-5 py-3 text-[14px] font-bold text-quizPrimary-on shadow-card transition-all hover:brightness-105 active:scale-[0.98]"
            >
              Get started for free
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ---------------------------------------------------------------- footer -- */

const FOOTER_LOGOS = [
  { src: "logo-gms-ntu.png", alt: "NTU Singapore" },
  { src: "logo-lkc-drc.png", alt: "LKCMedicine Dementia Research Centre" },
  { src: "press-st.png", alt: "The Straits Times" },
  { src: "press-cna.png", alt: "CNA" },
  { src: "press-alzheimers.png", alt: "Alzheimer's Association" },
  { src: "logo-pubmed.svg", alt: "PubMed" },
];

export function LandingFooter() {
  return (
    // `relative` matters: LiteShell's ambient blobs are `fixed`, so as the only
    // positioned elements they would otherwise paint over this dark panel and
    // wash it out to a muddy brown.
    <footer className="relative bg-[#241710] py-12 text-[#d9cdba]">
      <div className={WRAP}>
        <div className="flex items-center gap-2.5">
          <img
            src="/images/lite-one/logo-gray-matter.png"
            alt="Gray Matter Solutions"
            className="h-7 w-auto brightness-0 invert"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6">
          {FOOTER_LOGOS.map((logo) => (
            <img
              key={logo.src}
              src={`/images/lite-one/${logo.src}`}
              alt={logo.alt}
              className="h-6 w-auto opacity-55 brightness-0 invert"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-7 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
                {col.title}
              </h4>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#a99a86]">{col.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-7 border-t border-white/10 pt-5 text-[11.5px] leading-relaxed text-[#a99a86]">
          © 2026 Gray Matter Solutions. A spin-off from Nanyang Technological University, Singapore.
        </p>
      </div>
    </footer>
  );
}
