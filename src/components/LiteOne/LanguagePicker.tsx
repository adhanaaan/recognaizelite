import React from "react";
import {
  LANG_LABELS,
  LITE_EVENT_LANGS,
  type LiteEventLang,
} from "src/i18n/liteEvent";

/**
 * The three-way language switch at the top of /lite-event's landing page.
 *
 * Renders nothing when `CHINESE_MALAY` is off — the caller passes `enabled`
 * straight through from `useLiteEventLang()`, so flipping that one constant
 * takes the control off the page rather than leaving a dead single-option pill.
 *
 * It sits on the hero video, so it uses the same translucent glass plate as
 * `HeroPill`; the selected segment goes solid white so the current language is
 * readable at arm's length across a booth table.
 */
export function LanguagePicker({
  lang,
  onChange,
  enabled,
  label,
}: {
  lang: LiteEventLang;
  onChange: (lang: LiteEventLang) => void;
  enabled: boolean;
  /** Screen-reader label for the group, in the language currently showing. */
  label: string;
}) {
  if (!enabled) return null;

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/[0.12] p-1 backdrop-blur-[10px]"
    >
      {LITE_EVENT_LANGS.map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            lang={code === "zh" ? "zh-Hans" : code === "ms" ? "ms" : "en"}
            aria-pressed={active}
            onClick={() => onChange(code)}
            className={[
              "rounded-full px-3.5 py-1.5 text-[12.5px] font-bold leading-none transition-colors sm:text-[13px]",
              active
                ? "bg-white text-charcoal shadow-[0_2px_10px_rgba(0,0,0,0.18)]"
                : "text-white/85 hover:text-white",
            ].join(" ")}
          >
            {LANG_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
