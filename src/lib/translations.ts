import { APP_LANG, hydrateAppLanguageFromStorage } from "src/constants";
import { LanguageType } from "src/types";
import * as locales from "../locales";

type LocaleType = typeof locales;
type LocaleTypeKey = keyof LocaleType;

function createLocaleProxy<T extends Record<string, Record<string, string>>>(locale: T, language: string) {
  return new Proxy({} as Record<keyof T, string>, {
    get: (_, prop) => {
      if (prop in locale) {
        return locale[prop as keyof T][language];
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
