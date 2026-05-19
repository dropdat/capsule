"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_LABELS, type Locale, DEFAULT_LOCALE } from "@/i18n/config";

function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && (LOCALES as readonly string[]).includes(parts[0]) && parts[0] !== DEFAULT_LOCALE) {
    return "/" + parts.slice(1).join("/");
  }
  return pathname || "/";
}

export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    const base = stripLocale(pathname || "/");
    const target = next === DEFAULT_LOCALE ? base : `/${next}${base === "/" ? "" : base}`;
    startTransition(() => router.push(target));
  }

  return (
    <label className="inline-flex items-center gap-1 text-[12px] text-foreground/70" aria-label={label}>
      <span className="sr-only">{label}</span>
      <select
        value={locale}
        onChange={onChange}
        disabled={isPending}
        className="bg-transparent border border-border px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
        ))}
      </select>
    </label>
  );
}
