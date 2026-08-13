import React from "react";

/**
 * The hero and the trust line directly under it — currently the entire
 * /lite-one landing page, kept above the fold on purpose. b2cfunnel's longer
 * proof sections (stats, how-it-works, testimonials, footer) that used to
 * follow are cut, not just unrendered — see git history for that version.
 */

/**
 * b2cfunnel's `--maxw` / `.wrap`, which every section shares, plus the narrower
 * measure the hero uses for its own copy. Two separate constants rather than
 * one plus an override: two arbitrary `max-w-*` utilities on the same element
 * resolve by stylesheet order, not attribute order, so the winner would be a
 * coin flip.
 */
const WRAP = "mx-auto w-full max-w-[1080px] px-6";
const WRAP_NARROW = "mx-auto w-full max-w-[760px] px-6";

/** `src` carries its own extension — the credibility marks aren't all PNGs. */
export type PressLogo = { src: string; alt: string; h: number };

/**
 * Two plate recipes for panels floating on the hero video.
 *
 * GLASS is the barely-there translucent pill (matches b2cfunnel's `.hero .pill`).
 * It only carries the tiny orange GMS brain mark, which is visible against a
 * scrim.
 *
 * PLATE is the opaque white surface for the lock-up and the featured-in bar.
 * Brand marks have to be identifiable — dark-inked wordmarks on translucent
 * glass ghost out, and knocking them to white loses the brand colours. So we
 * give them a proper white plate and place them at their designed colours.
 */
const GLASS = "border border-white/25 bg-white/[0.12] backdrop-blur-[10px]";
const PLATE = "bg-white shadow-[0_8px_28px_rgba(0,0,0,0.22)]";

/* ------------------------------------------------------------------ hero -- */

/**
 * Full-bleed video hero. The poster paints first, a two-stop scrim keeps the
 * white copy legible over whatever frame is showing, and the bottom fade hands
 * off to the cream page beneath.
 *
 * Sized by `flex-1` rather than a fixed height, so the caller's flex column
 * decides how tall it is — the landing page uses that to make the hero fill
 * exactly what the trust band below it doesn't need.
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
    <section className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-[#241710] text-center">
      {/* `src` on the video rather than a nested <source> child: React's
          hydration re-parenting of children was aborting the in-flight range
          request (loadstart → ERR_ABORTED at ~236ms), so the video never got
          past readyState 0. Placing the URL directly on the video attribute
          skips that reconciliation step and lets the range request complete. */}
      <video
        ref={videoRef}
        className="absolute inset-0 -z-10 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/lite-one/hero-poster.jpg"
        src="/videos/lite-one/hero.mp4"
      />
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

      {/* Gray Matter logo floating on the video on a white plate. */}
      <div className="absolute inset-x-0 top-0 z-20 flex justify-center px-5 pt-5 sm:pt-6">
        <div
          className={`flex items-center rounded-2xl px-5 py-2.5 ${PLATE}`}
        >
          <img
            src="/images/lite-one/logo-gray-matter.svg"
            alt="Gray Matter Solutions"
            className="h-[28px] w-auto sm:h-[32px]"
          />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-quizSurface-container"
      />
      {/*
       * `flex-1 flex-col` lets `HeroContent` spread its three groups — the
       * pill, the headline stack, the featured-in bar — across the whole hero.
       * The `py` values clear the lock-up above (~52px) and the cream fade
       * below (h-24 = 96px), so the top group sits just under the lock-up and
       * the featured-in panel lands just above the fade instead of behind it.
       */}
      <div
        className={`relative z-20 flex flex-1 flex-col justify-between ${WRAP_NARROW} pb-28 pt-24`}
      >
        {children}
      </div>
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
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-semibold text-white sm:text-[13px] ${GLASS}`}
    >
      <img src="/images/lite-one/logo-gms-mark.png" alt="" aria-hidden className="h-[18px] w-auto" />
      {children}
    </span>
  );
}

/**
 * "As featured in" — b2cfunnel's `.hero-marquee` from full.html: a panel
 * inside the hero rather than a separate band below it. White plate so the
 * dark-inked press marks stay legible in their designed colours.
 */
export function HeroFeaturedIn({ logos }: { logos: readonly PressLogo[] }) {
  const half = [...logos, ...logos];
  const track = [...half, ...half];

  return (
    <div className={`mx-auto w-full max-w-[720px] rounded-2xl px-2 pb-4 pt-4 ${PLATE}`}>
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
              className="w-auto shrink-0"
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

