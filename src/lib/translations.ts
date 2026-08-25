import { APP_LANG, APP_LANG_KEY, hydrateAppLanguageFromStorage } from "src/constants";
import { LanguageType } from "src/types";
import * as locales from "../locales";

type LocaleType = typeof locales;
type LocaleTypeKey = keyof LocaleType;

function createLocaleProxy<T extends Record<string, Record<string, string>>>(locale: T, language: string) {
  return new Proxy({} as Record<keyof T, string>, {
    get: (_, prop) => {
      if (prop in locale) {
        const entry = locale[prop as keyof T];
        // A locale file can carry a key with no translation for a language yet
        // (several still have empty TAGALOG / MALAYALAM / BAHASA slots). Falling
        // back to English keeps a partly-translated screen readable instead of
        // rendering a blank line where the label should be.
        return entry[language] || entry.ENGLISH || String(prop);
      }
      return String(prop);
    },
  });
}

export function generateTranslations(language: LanguageType) {
  return Object.keys(locales).reduce(
    (acc, curr) => {
      acc[curr as LocaleTypeKey] = createLocaleProxy(locales[curr as LocaleTypeKey], language) as any;
      return acc;
    },
    {} as {
      [K in LocaleTypeKey]: { [P in keyof LocaleType[K]]: string };
    }
  );
}

export let t = generateTranslations(APP_LANG);

export function syncTranslations(language: LanguageType = APP_LANG) {
  t = generateTranslations(language);
}

export function hydrateTranslationsFromStorage() {
  const languageChanged = hydrateAppLanguageFromStorage();
  if (languageChanged) {
    syncTranslations(APP_LANG);
  }
  return languageChanged;
}

// Persist a language choice and apply it immediately: writes localStorage,
// re-hydrates the APP_LANG module variable, and regenerates `t`. Entry routes
// call this on mount so the language travels through the shared game flow via
// localStorage (the Mandarin /sjmcmandarin route sets MANDARIN; every English
// entry route resets to ENGLISH to prevent the persisted value from leaking).
export function setAppLanguage(language: LanguageType) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(APP_LANG_KEY, language);
    } catch {
      /* ignore storage failures */
    }
  }
  hydrateAppLanguageFromStorage();
  syncTranslations(APP_LANG);
}
