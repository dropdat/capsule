export const LOCALES = ["en", "ja", "de", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};

export const LOCALE_BCP47: Record<Locale, string> = {
  en: "en-US",
  ja: "ja-JP",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
};

export const LOCALE_OG: Record<Locale, string> = {
  en: "en_US",
  ja: "ja_JP",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
};

export function localePath(locale: Locale, path: string = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === "/" ? "" : clean}`;
}
