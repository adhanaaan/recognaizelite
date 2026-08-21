import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import React from "react";

/**
 * Motion primitives for /lite-one/report-v2.
 *
 * The page scrolls inside its own snap container instead of the window (see
 * the page file for why), which means every in-view observer on it must use
 * that container as its root — a window-rooted observer never fires because
 * the window itself is pinned by globals.css. ScrollerContext carries the
 * container ref so sections and charts don't thread it by hand.
 */

export const ScrollerContext = React.createContext<React.RefObject<HTMLDivElement> | null>(
  null
);

export function useScrollerRef() {
  return React.useContext(ScrollerContext);
}

/** Shared easing: the funnel's `.lite-rise` curve. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  shown: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

export const stagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

/**
 * Group that plays its `rise`/`pop` children once, when ~35% of it has
 * scrolled into the snap container.
 */
export function Cascade({
  children,
  className = "",
  amount = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  const scroller = useScrollerRef();
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount, root: scroller ?? undefined }}
    >
      {children}
    </motion.div>
  );
}

/**
 * One snap panel: fills at least a screen, snaps its top edge into place.
 * `backdrop` renders behind the centered column at full section width —
 * gradients, photos and parallax decorations go there.
 */
export function SnapSection({
  id,
  children,
  className = "",
  snapAlways = false,
  innerClassName = "",
  backdrop,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  snapAlways?: boolean;
  innerClassName?: string;
  backdrop?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-snap-section
      className={[
        "relative flex min-h-[100dvh] snap-start flex-col justify-center overflow-hidden px-5 pb-16 pt-24 sm:px-8",
        snapAlways ? "snap-always" : "",
        className,
      ].join(" ")}
    >
      {backdrop}
      <div className={`relative mx-auto w-full max-w-[560px] ${innerClassName}`}>{children}</div>
    </section>
  );
}

/** Lora accent — the serif voice the design mixes into headlines. */
export function Serif({
  children,
  italic = true,
  className = "",
}: {
  children: React.ReactNode;
  italic?: boolean;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
        fontStyle: italic ? "italic" : "normal",
        fontWeight: 500,
        letterSpacing: "0",
      }}
    >
      {children}
    </span>
  );
}

/** Small uppercase section opener. */
export function EyebrowV2({
  children,
  tone = "warm",
}: {
  children: React.ReactNode;
  tone?: "warm" | "light";
}) {
  return (
    <motion.p
      variants={rise}
      className={[
        "text-[10.5px] font-extrabold uppercase tracking-[0.24em]",
        tone === "light" ? "text-white/55" : "text-[#B4653C]",
      ].join(" ")}
    >
      {children}
    </motion.p>
  );
}

/**
 * Number that counts up the first time it appears. Screen readers get the
 * final value immediately; the ticking copy is hidden from them because
 * mid-animation values are noise.
 */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  duration = 1.2,
  className = "",
  style,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const scroller = useScrollerRef();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.6,
    root: scroller ?? undefined,
  });
  // Server-rendered HTML shows the final value (reduced-motion state is only
  // knowable on the client, and diverging here breaks hydration); the count
  // runs once, the first time the number scrolls into view.
  const [shown, setShown] = React.useState(value);
  const playedRef = React.useRef(false);

  React.useEffect(() => {
    if (!inView) return;
    if (reduced || playedRef.current) {
      playedRef.current = true;
      setShown(value);
      return;
    }
    playedRef.current = true;
    const controls = animate(0, value, {
      duration,
      ease: "circOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      <span aria-hidden>
        {prefix}
        {shown}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {value}
        {suffix}
      </span>
    </span>
  );
}

/**
 * Apple-style dot rail: one dot per snap section, the active one stretches
 * into a gradient pill. Tracks whichever section covers the middle of the
 * snap container, so over-tall sections stay active while scrolling inside
 * them.
 */
export function SectionDots({
  sections,
  gradient,
}: {
  sections: Array<{ id: string; label: string }>;
  gradient: string;
}) {
  const scroller = useScrollerRef();
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(sections[0]?.id ?? "");

  React.useEffect(() => {
    const root = scroller?.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A thin band across the middle of the container: exactly one section
      // matches at a time, tall sections included.
      { root, rootMargin: "-49% 0px -49% 0px", threshold: 0 }
    );
    for (const { id } of sections) {
      const el = root.querySelector(`#${id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [scroller, sections]);

  const jump = (id: string) => {
    const el = scroller?.current?.querySelector(`#${id}`);
    el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <nav
      aria-label="Report sections"
      className="fixed right-2.5 top-1/2 z-50 -translate-y-1/2 max-[380px]:hidden"
    >
      <ul className="flex flex-col items-center gap-2.5">
        {sections.map(({ id, label }) => {
          const current = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                aria-label={label}
                aria-current={current ? "true" : undefined}
                onClick={() => jump(id)}
                className="grid h-[14px] w-[14px] place-items-center"
              >
                <span
                  className="block w-[6px] rounded-full transition-all duration-300 ease-out"
                  style={{
                    height: current ? 20 : 6,
                    background: current ? gradient : "#E3C4B0",
                  }}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
