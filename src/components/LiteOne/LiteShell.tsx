import Head from "next/head";
import React from "react";

/**
 * The one surface every /lite-one screen sits on: the warm cream gradient plus
 * two slowly drifting blur circles, matching /demo's ScreenShell so the whole
 * funnel reads as a single continuous page.
 *
 * `scroll` switches from a locked 100dvh viewport (the short hook screens) to
 * a normally scrolling document (the report), including the #__next overflow
 * unlock that the other long report pages do by hand.
 */
export function LiteShell({
  children,
  scroll = false,
  className = "",
  showHeader = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  showHeader?: boolean;
}) {
  React.useEffect(() => {
    if (!scroll) return;
    // globals.css pins html/body/#__next to 100dvh with overflow hidden for the
    // game screens. Long-form lite pages opt out for their lifetime.
    const next = document.getElementById("__next");
    const prev = {
      html: document.documentElement.style.cssText,
      body: document.body.style.cssText,
      next: next?.style.cssText ?? "",
    };
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    if (next) {
      next.style.overflow = "auto";
      next.style.height = "auto";
    }
    return () => {
      document.documentElement.style.cssText = prev.html;
      document.body.style.cssText = prev.body;
      if (next) next.style.cssText = prev.next;
    };
  }, [scroll]);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#fff4ee" />
      </Head>
      <main
        className={[
          "relative w-full overflow-x-hidden bg-gradient-to-b from-[#fff4ee] via-quizSurface to-quizSurface-container font-jakarta",
          scroll ? "min-h-[100dvh] overflow-y-auto" : "h-[100dvh] flex flex-col overflow-hidden",
          className,
        ].join(" ")}
      >
        <div
          aria-hidden
          className={[
            "pointer-events-none -right-20 -top-24 h-72 w-72 rounded-full bg-quizPrimary/15 blur-3xl lite-drift-a",
            scroll ? "fixed" : "absolute",
          ].join(" ")}
        />
        <div
          aria-hidden
          className={[
            "pointer-events-none -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#ffb37a]/25 blur-3xl lite-drift-b",
            scroll ? "fixed" : "absolute",
          ].join(" ")}
        />

        {showHeader && (
          <header className="relative shrink-0 pt-7 sm:pt-9">
            <div className="flex justify-center px-6">
              <img
                src="/images/lite-one/logo-gray-matter.svg"
                alt="Gray Matter Solutions"
                className="h-[30px] w-auto"
              />
            </div>
          </header>
        )}

        {children}
      </main>
    </>
  );
}

/** Shared CTA pill. The shimmer sweep is decorative and reduce-motion aware. */
export function LiteButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  if (variant === "ghost") {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={[
          "w-full rounded-full border border-quizOutline-variant bg-quizSurface-lowest px-8 py-4 text-[15px] font-bold text-quizSecondary",
          "transition-all hover:bg-quizSurface-low active:scale-[0.98] disabled:opacity-60",
          className,
        ].join(" ")}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "relative w-full overflow-hidden rounded-full bg-quizPrimary px-8 py-4 text-[16px] font-bold tracking-wide text-quizPrimary-on shadow-card",
        "transition-all hover:brightness-105 hover:shadow-float active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden
        className="lite-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <span className="relative">{children}</span>
    </button>
  );
}
