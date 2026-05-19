"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SignOutButton, useAuth, useUser } from "@clerk/react";

import type { Subscription } from "@/lib/api";
import { useConsoleLocale } from "@/i18n/consoleLocale";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropdat.app";

const TIER_LABEL: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
  ultimate: "Ultimate",
  enterprise: "Enterprise",
};

export function ProfileMenu() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { locale, setLocale, dict } = useConsoleLocale();
  const t = dict.console.profile;
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<Subscription | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/billing/subscription`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) setSub(await res.json());
    } catch {
      // silent — menu still renders without sub data
    }
  }, [getToken]);

  useEffect(() => {
    if (open && !sub) load();
  }, [open, sub, load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const email = user?.primaryEmailAddress?.emailAddress;
  const initials =
    (user?.firstName?.[0] ?? email?.[0] ?? "?").toUpperCase();
  const tierLabel = sub ? TIER_LABEL[sub.tier] ?? sub.tier : "—";
  const usage = sub
    ? sub.capsule_limit < 0
      ? `${sub.capsules_used} ${t.capsulesUnlimited}`
      : `${sub.capsules_used} / ${sub.capsule_limit}`
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.openMenu}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90"
      >
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-12 left-0 z-[60] w-[260px] rounded-lg border border-border bg-card shadow-lg overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border">
            <div className="text-[13px] font-medium truncate">{user?.fullName ?? email ?? t.account}</div>
            {email && <div className="text-[12px] text-muted-foreground truncate">{email}</div>}
          </div>

          <div className="px-4 py-3 border-b border-border flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] uppercase tracking-wide text-muted-foreground">{t.plan}</span>
              <span className="text-[12.5px] font-medium">{tierLabel}</span>
            </div>
            {sub && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] uppercase tracking-wide text-muted-foreground">{t.usage}</span>
                <span className="text-[12px]">{usage}</span>
              </div>
            )}
            {sub?.status && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] uppercase tracking-wide text-muted-foreground">{t.status}</span>
                <span className="text-[12px] capitalize">{sub.status}</span>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-b border-border flex items-center justify-between gap-2">
            <span className="text-[11.5px] uppercase tracking-wide text-muted-foreground">{t.language}</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="bg-card text-foreground border border-border px-1.5 py-0.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              aria-label={t.language}
            >
              {LOCALES.map((l) => (
                <option
                  key={l}
                  value={l}
                  style={{ background: "var(--card)", color: "var(--foreground)" }}
                >
                  {LOCALE_LABELS[l]}
                </option>
              ))}
            </select>
          </div>

          <div className="px-4 py-2 text-[11.5px] text-muted-foreground border-b border-border">
            {t.invoicesNote}
          </div>

          <nav className="py-1.5">
            <Link
              href="/billing"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-[13px] hover:bg-muted"
            >
              {t.plansBilling}
            </Link>
            {sub?.has_customer && sub.tier !== "basic" && sub.status !== "cancelled" && (
              <Link
                href="/billing"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-[13px] hover:bg-muted text-destructive"
              >
                {t.cancelPlan}
              </Link>
            )}
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-[13px] hover:bg-muted"
            >
              {t.settings}
            </Link>
            <SignOutButton>
              <button
                type="button"
                className="block w-full text-left px-4 py-2 text-[13px] hover:bg-muted text-destructive"
              >
                {t.signOut}
              </button>
            </SignOutButton>
          </nav>
        </div>
      )}
    </div>
  );
}
