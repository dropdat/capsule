"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

/**
 * Soft client-side redirect to the visitor's best matching locale.
 *
 * Only runs once per visitor — sets a localStorage flag so search-engine
 * indexing of `/` is preserved and the user can always switch back via the
 * locale switcher without being redirected again.
 *
 * Drop this on the English root page only; locale pages skip this entirely.
 */
const STORAGE_KEY = "dropdat:locale:auto";

function detectFromNavigator(): Locale | null {
  if (typeof navigator === "undefined") return null;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of langs) {
    if (!raw) continue;
    const short = raw.slice(0, 2).toLowerCase();
    if ((LOCALES as readonly string[]).includes(short)) return short as Locale;
  }
  return null;
}

export function AutoLocaleRedirect() {
  const router = useRouter();
  useEffect(() => {
    try {
      // Honor explicit opt-outs and prior choices.
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (url.searchParams.get("lang") === "en") {
        window.localStorage.setItem(STORAGE_KEY, "en");
        return;
      }
      if (window.localStorage.getItem(STORAGE_KEY)) return;
      const detected = detectFromNavigator();
      window.localStorage.setItem(STORAGE_KEY, detected ?? DEFAULT_LOCALE);
      if (!detected || detected === DEFAULT_LOCALE) return;
      router.replace(`/${detected}`);
    } catch {
      // localStorage may be unavailable; fail silently.
    }
  }, [router]);
  return null;
}
