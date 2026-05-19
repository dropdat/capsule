import type { Metadata } from "next";
import { LOCALES, LOCALE_BCP47, LOCALE_OG, type Locale, DEFAULT_LOCALE, localePath } from "./config";
import { getDict } from "./dictionaries";

const SITE = "https://dropdat.app";

export function buildLocaleAlternates(path: string = "/"): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of LOCALES) {
    out[LOCALE_BCP47[l]] = `${SITE}${localePath(l, path)}`;
  }
  out["x-default"] = `${SITE}${localePath(DEFAULT_LOCALE, path)}`;
  return out;
}

export function localeMetadata(locale: Locale, path: string = "/"): Metadata {
  const dict = getDict(locale);
  const canonical = `${SITE}${localePath(locale, path)}`;
  const alternateOg = (LOCALES.filter((l) => l !== locale) as Locale[]).map((l) => LOCALE_OG[l]);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical,
      languages: buildLocaleAlternates(path),
    },
    openGraph: {
      type: "website",
      siteName: "dropdat",
      url: canonical,
      locale: LOCALE_OG[locale],
      alternateLocale: alternateOg,
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
    },
  };
}
