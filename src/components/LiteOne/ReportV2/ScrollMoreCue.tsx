import { motion, useReducedMotion } from "framer-motion";
import React from "react";
import { useScrollerRef } from "./motion";

/**
 * Floating "more results below" cue, for viewports too short to show the
 * hero's own scroll cue.
 *
 * The report's first panel is a full-height snap section: the rank headline
 * and the age-band card fill it, and the chevrons that tell the reader there
 * is more sit underneath them. On a phone or a portrait iPad there is room for
 * all of it. Turn an iPad on its side at a booth and the panel is barely
 * taller than the card — the chevrons fall past the fold, the section clips
 * them, and the bell curve reads as the whole report. Several readers stopped
 * there.
 *
 * Rather than guess at the orientations and window heights where that happens,
 * this watches the real cue: while the reader is still on the hero and the
 * in-flow cue is not actually on screen, a pill floats at the bottom of the
 * viewport saying the same thing. Tapping it scrolls on. Where the in-flow cue
 * is visible — every portrait device — this renders nothing, so the layout the
 * design intends is untouched.
 *
 * `inlineCueRef` is the in-flow cue in the hero; `scroller` comes from
 * ScrollerContext, because the page scrolls inside its own container rather
 * than the window (a window-rooted observer would never fire).
 */
export function ScrollMoreCue({
  inlineCueRef,
  label,
  gradient,
}: {
  inlineCueRef: React.RefObject<HTMLElement>;
  label: string;
  gradient: string;
}) {
  const scroller = useScrollerRef();
  const reduced = useReducedMotion();
  // Assume the in-flow cue is visible until the observer says otherwise, so
  // the pill never flashes on a viewport that did not need it.
  const [inlineVisible, setInlineVisible] = React.useState(true);
  const [moved, setMoved] = React.useState(false);

  React.useEffect(() => {
    const root = scroller?.current;
    const el = inlineCueRef.current;
    if (!root || !el || typeof IntersectionObserver === "undefined") return;
    // The cue is only doing its job if it is fully on screen; a chevron half
    // cut off by the fold is what the reader missed in the first place.
    const observer = new IntersectionObserver(
      ([entry]) => setInlineVisible(entry.intersectionRatio > 0.99),
      { root, threshold: [0, 0.99, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scroller, inlineCueRef]);

  // Once the reader has scrolled at all they know the page moves, so the pill
  // has said its piece and gets out of the way.
  React.useEffect(() => {
    const root = scroller?.current;
    if (!root) return;
    const onScroll = () => setMoved(root.scrollTop > 24);
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [scroller]);

  const scrollOn = () => {
    const root = scroller?.current;
    if (!root) return;
    root.scrollTo({
      top: root.scrollTop + root.clientHeight,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  if (inlineVisible || moved) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-12"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* On the viewports that get this pill there is no spare room for it, so
          it necessarily sits over the last line of the hero card. The scrim
          makes that read as a layer rather than a collision. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(255,248,243,0.96) 38%, rgba(255,248,243,0) 100%)",
        }}
      />
      <button
        type="button"
        onClick={scrollOn}
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#F2DDCE] bg-white/92 py-2 pl-4 pr-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#B4653C] shadow-[0_14px_30px_-14px_rgba(90,40,10,0.5)] backdrop-blur-sm transition-transform active:scale-[0.97]"
      >
        {label}
        <motion.span
          aria-hidden
          className="grid size-[22px] place-items-center rounded-full text-white"
          style={{ background: gradient }}
          animate={reduced ? undefined : { y: [0, 3, 0] }}
          transition={
            reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <svg
            viewBox="0 0 24 24"
            className="size-[14px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.span>
      </button>
    </motion.div>
  );
}
