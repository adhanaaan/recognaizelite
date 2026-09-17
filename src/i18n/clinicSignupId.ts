import React from "react";
import { setAppLanguage } from "src/lib/translations";
import type { LanguageType } from "src/types";

/**
 * Language switching for the /clinic-signup-id funnel — the Indonesian clinic
 * funnel.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS NOT src/i18n/liteEvent.ts
 * ---------------------------------------------------------------------------
 * The /lite-event family offers English, 中文 and Bahasa Melayu; this funnel
 * offers English and Bahasa Indonesia and nothing else. That is not a variation
 * on the same picker, it is a different set, and widening `LiteEventLang` to
 * hold "id" would have forced an Indonesian entry into every copy map the other
 * funnels own — Parkway's consent, Parkway's report, the shared question banks —
 * none of which will ever render it.
 *
 * So the store is its own, with its own key. A clinician who picked 中文 on a
 * /lite-event link in the same browser gets English here rather than a language
 * this funnel does not translate, and picking Bahasa Indonesia here cannot
 * follow them back to a funnel that has no Indonesian copy.
 *
 * Everything else is liteEvent.ts's shape, deliberately: the two read the same
 * because they do the same job.
 *
 * ---------------------------------------------------------------------------
 * THE TOGGLE
 * ---------------------------------------------------------------------------
 * `BAHASA_INDONESIA` is the on/off switch for the whole feature. Flip it to
 * `false` and /clinic-signup-id goes English-only: the picker disappears from
 * the landing page, any language a previous visitor left in localStorage is
 * ignored, and every screen renders English. Nothing else needs touching.
 *
 * It is a plain module constant on purpose — a clinic's build should not depend
 * on an env var being wired up correctly. Change it here, rebuild.
 */
export const BAHASA_INDONESIA = true;

/* ------------------------------------------------------------------ langs -- */

export type ClinicSignupIdLang = "en" | "id";

export const CLINIC_SIGNUP_ID_LANGS: readonly ClinicSignupIdLang[] = ["en", "id"];

/** What the picker shows. Each label is written in its own language. */
export const CLINIC_SIGNUP_ID_LANG_LABELS: Record<ClinicSignupIdLang, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

/**
 * The funnel's own codes mapped onto the app-wide `LanguageType`, which is what
 * the shared /symbol-matching game leg reads through `src/lib/translations`.
 *
 * "BAHASA" is that enum's Indonesian slot — the locale JSONs under src/locales
 * carry Indonesian in it ("Kecepatan Pemrosesan", "bagian atas layar"), as
 * distinct from their "MALAY" slot. Selecting Bahasa Indonesia here therefore
 * carries into the game screens too; see `applyLang` below.
 */
const TO_APP_LANG: Record<ClinicSignupIdLang, LanguageType> = {
  en: "ENGLISH",
  id: "BAHASA",
};

const STORAGE_KEY = "recognaize-csid-lang";

function isClinicSignupIdLang(value: unknown): value is ClinicSignupIdLang {
  return value === "en" || value === "id";
}

/* ------------------------------------------------------------------ store -- */

/**
 * Module-level state rather than a context provider: the flow is eight separate
 * Next.js routes, so there is no common React tree to hang a provider on. The
 * value survives client-side navigation between them, and localStorage carries
 * it through the shared game leg (which unmounts this entirely) and back.
 *
 * Starts at "en" so the server render and the first client render agree; the
 * stored choice is picked up by `hydrate()` on mount.
 */
let current: ClinicSignupIdLang = "en";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getClinicSignupIdLang(): ClinicSignupIdLang {
  return BAHASA_INDONESIA ? current : "en";
}

function readStored(): ClinicSignupIdLang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isClinicSignupIdLang(stored) ? stored : "en";
  } catch {
    return "en";
  }
}

/** Push the choice into the app-wide language, so the game screens follow. */
function applyLang(lang: ClinicSignupIdLang) {
  setAppLanguage(TO_APP_LANG[lang]);
}

/**
 * Adopt the stored choice. Called on mount by every /clinic-signup-id screen,
 * which is what makes the language survive a refresh mid-flow and the round
 * trip through /symbol-matching.
 */
export function hydrateClinicSignupIdLang(): ClinicSignupIdLang {
  const next = BAHASA_INDONESIA ? readStored() : "en";
  const changed = next !== current;
  current = next;
  // Always re-apply: the shared game leg's APP_LANG may have been reset to
  // English — or set to Mandarin or Malay — by another funnel's entry page in
  // the meantime.
  applyLang(next);
  if (changed) emit();
  return next;
}

/** Select a language: persists it, applies it app-wide, re-renders the flow. */
export function setClinicSignupIdLang(lang: ClinicSignupIdLang) {
  if (!BAHASA_INDONESIA) return;
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

/** Clear the choice — for an entry page that needs to start from English. */
export function resetClinicSignupIdLang() {
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
 * Every /clinic-signup-id screen calls this, so the choice made on the landing
 * page is in force from the first screen to the last one without any of them
 * passing it along.
 */
export function useClinicSignupIdLang(): {
  lang: ClinicSignupIdLang;
  setLang: (lang: ClinicSignupIdLang) => void;
  enabled: boolean;
} {
  const [lang, setLang] = React.useState<ClinicSignupIdLang>(getClinicSignupIdLang);

  React.useEffect(() => {
    const sync = () => setLang(getClinicSignupIdLang());
    listeners.add(sync);
    hydrateClinicSignupIdLang();
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return { lang, setLang: setClinicSignupIdLang, enabled: BAHASA_INDONESIA };
}
