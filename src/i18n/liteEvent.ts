import React from "react";
import { setAppLanguage } from "src/lib/translations";
import type { LanguageType } from "src/types";

/**
 * Language switching for the /lite-event funnel.
 *
 * ---------------------------------------------------------------------------
 * THE TOGGLE
 * ---------------------------------------------------------------------------
 * `CHINESE_MALAY` is the on/off switch for the whole feature. Flip it to
 * `false` and /lite-event goes back to being English-only: the picker
 * disappears from the landing page, any language a previous visitor left in
 * localStorage is ignored, and every screen renders the English copy it
 * rendered before this was added. Nothing else needs touching.
 *
 * It is a plain module constant on purpose — a booth operator's build should
 * not depend on an env var being wired up correctly. Change it here, rebuild.
 */
export const CHINESE_MALAY = true;

/** The toggle, as a function, for call sites that read better that way. */
export function chineseMalayEnabled(): boolean {
  return CHINESE_MALAY;
}

/* ------------------------------------------------------------------ langs -- */

export type LiteEventLang = "en" | "zh" | "ms";

export const LITE_EVENT_LANGS: readonly LiteEventLang[] = ["en", "zh", "ms"];

/** What the picker shows. Each label is written in its own language. */
export const LANG_LABELS: Record<LiteEventLang, string> = {
  en: "English",
  zh: "中文",
  ms: "Bahasa Melayu",
};

/**
 * The funnel's own codes mapped onto the app-wide `LanguageType`, which is
 * what the shared /symbol-matching game leg reads through `src/lib/translations`.
 * Selecting a language here therefore carries into the game screens too — see
 * `applyLang` below.
 */
const TO_APP_LANG: Record<LiteEventLang, LanguageType> = {
  en: "ENGLISH",
  zh: "MANDARIN",
  ms: "MALAY",
};

const STORAGE_KEY = "recognaize-levt-lang";

function isLiteEventLang(value: unknown): value is LiteEventLang {
  return value === "en" || value === "zh" || value === "ms";
}

/* ------------------------------------------------------------------ store -- */

/**
 * Module-level state rather than a context provider: the flow is nine separate
 * Next.js routes, so there is no common React tree to hang a provider on. The
 * value survives client-side navigation between them, and localStorage carries
 * it through the shared game leg (which unmounts this entirely) and back.
 *
 * Starts at "en" so the server render and the first client render agree; the
 * stored choice is picked up by `hydrate()` on mount.
 */
let current: LiteEventLang = "en";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getLiteEventLang(): LiteEventLang {
  return CHINESE_MALAY ? current : "en";
}

function readStored(): LiteEventLang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLiteEventLang(stored) ? stored : "en";
  } catch {
    return "en";
  }
}

/** Push the choice into the app-wide language, so the game screens follow. */
function applyLang(lang: LiteEventLang) {
  setAppLanguage(TO_APP_LANG[lang]);
}

/**
 * Adopt the stored choice. Called on mount by every /lite-event screen, which
 * is what makes the language survive a refresh mid-flow and the round trip
 * through /symbol-matching.
 */
export function hydrateLiteEventLang(): LiteEventLang {
  const next = CHINESE_MALAY ? readStored() : "en";
  const changed = next !== current;
  current = next;
  // Always re-apply: the shared game leg's APP_LANG may have been reset to
  // English by another funnel's entry page in the meantime.
  applyLang(next);
  if (changed) emit();
  return next;
}

/** Select a language: persists it, applies it app-wide, re-renders the flow. */
export function setLiteEventLang(lang: LiteEventLang) {
  if (!CHINESE_MALAY) return;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private-mode storage failures are not worth breaking the flow over */
    }
  }
  const changed = lang !== current;
  current = lang;
  applyLang(lang);
  if (changed) emit();
}

/** Clear the choice — used by the other funnels' entry pages if they ever need to. */
export function resetLiteEventLang() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  current = "en";
  emit();
}

/* ------------------------------------------------------------------- hook -- */

/**
 * The language for the screen currently rendering, plus the setter.
 *
 * Every /lite-event screen calls this, so the choice made on the landing page
 * is in force from the first screen to the last one without any of them
 * passing it along.
 */
export function useLiteEventLang(): {
  lang: LiteEventLang;
  setLang: (lang: LiteEventLang) => void;
  enabled: boolean;
} {
  const [lang, setLang] = React.useState<LiteEventLang>(getLiteEventLang);

  React.useEffect(() => {
    const sync = () => setLang(getLiteEventLang());
    listeners.add(sync);
    hydrateLiteEventLang();
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return { lang, setLang: setLiteEventLang, enabled: CHINESE_MALAY };
}
