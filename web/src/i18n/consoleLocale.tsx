"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, LOCALES, LOCALE_BCP47, type Locale } from "./config";
import { getDict, type Dict } from "./dictionaries";

const STORAGE_KEY = "dropdat:console:locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dict: Dict;
};

const ConsoleLocaleContext = createContext<Ctx | null>(null);

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (LOCALES as readonly string[]).includes(stored)) return stored as Locale;
  const nav = window.navigator.language?.slice(0, 2).toLowerCase();
  if (nav && (LOCALES as readonly string[]).includes(nav)) return nav as Locale;
  return DEFAULT_LOCALE;
}

export function ConsoleLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from storage / navigator after mount so SSR + initial paint stay stable.
  useEffect(() => {
    const initial = detectInitialLocale();
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = LOCALE_BCP47[locale];
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // storage may be disabled; ignore
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ locale, setLocale, dict: getDict(locale) }),
    [locale, setLocale]
  );

  return (
    <ConsoleLocaleContext.Provider value={value}>{children}</ConsoleLocaleContext.Provider>
  );
}

export function useConsoleLocale(): Ctx {
  const ctx = useContext(ConsoleLocaleContext);
  if (!ctx) {
    // Safe fallback so consumers outside the provider still get usable defaults.
    return { locale: DEFAULT_LOCALE, setLocale: () => {}, dict: getDict(DEFAULT_LOCALE) };
  }
  return ctx;
}
