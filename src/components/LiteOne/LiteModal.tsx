import React from "react";
import { createPortal } from "react-dom";

/**
 * The popup the report uses for "How to improve?".
 *
 * src/components/Modal.tsx is a blocking overlay with no close affordance,
 * so this adds what a real dialog needs: Escape, backdrop click, a close
 * button, body scroll lock, and focus returned to whatever opened it.
 */
export function LiteModal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<Element | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Move focus into the dialog so screen readers and keyboards land here.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const host = document.getElementById("__next");
  if (!host) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-charcoal/35 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="lite-rise max-h-[88dvh] w-full max-w-[460px] overflow-y-auto rounded-t-3xl border border-quizOutline-variant bg-quizSurface-lowest p-5 font-jakarta shadow-float outline-none sm:rounded-3xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[21px] font-extrabold leading-tight text-charcoal">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-quizSecondary">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-quizOutline transition-colors hover:bg-quizSurface-low hover:text-charcoal"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>,
    host
  );
}
