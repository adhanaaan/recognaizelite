import { LanguageType } from "src/types";

export const isServer = typeof window === "undefined";
export const __prod__ = process.env.NODE_ENV === "production";

const APP_LANG_KEY = "APP_LANG";
const DEFAULT_APP_LANG: LanguageType = "ENGLISH";
const SUPPORTED_LANGUAGES: LanguageType[] = ["ENGLISH", "BAHASA", "MANDARIN", "MALAY", "TAGALOG", "MALAYALAM"];

export let APP_LANG: LanguageType = DEFAULT_APP_LANG;

function isLanguageType(value: string | null): value is LanguageType {
  return Boolean(value) && SUPPORTED_LANGUAGES.includes(value as LanguageType);
}

export function readStoredAppLanguage(): LanguageType {
  if (isServer) {
    return DEFAULT_APP_LANG;
  }

  try {
    const stored = window.localStorage.getItem(APP_LANG_KEY);
    return isLanguageType(stored) ? stored : DEFAULT_APP_LANG;
  } catch {
    return DEFAULT_APP_LANG;
  }
}

export function hydrateAppLanguageFromStorage(): boolean {
  const nextLanguage = readStoredAppLanguage();
  const hasChanged = APP_LANG !== nextLanguage;
  APP_LANG = nextLanguage;
  return hasChanged;
}
