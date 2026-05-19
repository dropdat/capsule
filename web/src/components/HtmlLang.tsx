"use client";

import { useEffect } from "react";
import { LOCALE_BCP47, type Locale } from "@/i18n/config";

export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = LOCALE_BCP47[locale];
  }, [locale]);
  return null;
}
