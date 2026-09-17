import React from "react";

/**
 * The language switch at the top of a funnel's landing page.
 *
 * Renders nothing when the funnel's toggle is off — the caller passes `enabled`
 * straight through from its language hook, so flipping that one constant takes
 * the control off the page rather than leaving a dead single-option pill.
 *
 * It is generic over the language code because the funnels do not offer the
 * same set: /lite-event and its family offer English, 中文 and Bahasa Melayu
 * (`LITE_EVENT_LANGS`, `LANG_LABELS`), while /clinic-signup-id offers English
 * and Bahasa Indonesia (`CLINIC_SIGNUP_ID_LANGS`,
 * `CLINIC_SIGNUP_ID_LANG_LABELS`). The caller passes its own set and labels;
 * this component only draws them.
 *
 * It sits on the hero video, so it uses the same translucent glass plate as
 * `HeroPill`; the selected segment goes solid white so the current language is
 * readable at arm's length across a booth table.
 */

/**
 * BCP 47 tags for the `lang` attribute on each button, so a screen reader
 * announces "Bahasa Indonesia" in Indonesian rather than in English. A code
 * with no entry is used as-is, which is correct for any plain two-letter tag.
 */
const HTML_LANG: Record<string, string> = {
  zh: "zh-Hans",
};

export function LanguagePicker<L extends string>({
  lang,
  onChange,
  enabled,
  label,
  langs,
  labels,
}: {
  lang: L;
  onChange: (lang: L) => void;
  enabled: boolean;
  /** Screen-reader label for the group, in the language currently showing. */
  label: string;
  /** The codes to offer, in the order they should appear. */
  langs: readonly L[];
  /** What each code is called, each written in its own language. */
  labels: Record<L, string>;
}) {
  if (!enabled) return null;

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/[0.12] p-1 backdrop-blur-[10px]"
    >
      {langs.map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            lang={HTML_LANG[code] ?? code}
            aria-pressed={active}
            onClick={() => onChange(code)}
            className={[
              "rounded-full px-3.5 py-1.5 text-[12.5px] font-bold leading-none transition-colors sm:text-[13px]",
              active
                ? "bg-white text-charcoal shadow-[0_2px_10px_rgba(0,0,0,0.18)]"
                : "text-white/85 hover:text-white",
            ].join(" ")}
          >
            {labels[code]}
          </button>
        );
      })}
    </div>
  );
}
