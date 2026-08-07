import React from "react";

/**
 * Reveals a section the first time it scrolls into view, then stops
 * observing. Used to stagger the long report page instead of animating
 * everything on load.
 *
 * Falls back to "always visible" when IntersectionObserver is missing or
 * the visitor has asked for reduced motion, so nothing can end up stuck
 * invisible.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(rootMargin = "-60px") {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);

    // Safety net: content that is hidden until observed must never be able to
    // stay hidden. If nothing has fired by now, just show it.
    const failsafe = setTimeout(() => {
      setInView(true);
      observer.disconnect();
    }, 2500);

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, [rootMargin]);

  return { ref, inView };
}

/** Section wrapper that fades and lifts in on first view. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  return React.createElement(
    "section",
    {
      ref,
      id,
      className: [className, inView ? "lite-rise" : "opacity-0"].join(" "),
      style: inView ? { animationDelay: `${delay}ms` } : undefined,
    },
    children
  );
}
