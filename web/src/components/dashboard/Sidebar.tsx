"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/react";
import { useTheme } from "./ThemeProvider";
import { ProfileMenu } from "./ProfileMenu";
import { useConsoleLocale } from "@/i18n/consoleLocale";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropdat.app";

export function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname() || "/library";
  const { getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { dict } = useConsoleLocale();
  const s = dict.console.sidebar;
  const NAV = [
    { href: "/library", label: s.library, icon: LibraryIcon },
    { href: "/library/graph", label: s.graph, icon: GraphIcon },
    { href: "/links", label: s.links, icon: LinkIcon },
    { href: "/packs", label: s.packs, icon: PacksIcon },
    { href: "/teams", label: s.teams, icon: TeamsIcon },
    { href: "/api-keys", label: s.apiKeys, icon: KeyIcon },
    { href: "/billing", label: s.billing, icon: BillingIcon },
    { href: "/help", label: s.help, icon: HelpIcon },
    { href: "/settings", label: s.settings, icon: SettingsIcon },
  ];
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/v1/admin/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const j = (await res.json()) as { admin: boolean };
        if (!cancelled) setIsAdmin(!!j.admin);
      } catch {
        /* ignore — non-admins shouldn't see anything */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const nav = isAdmin
    ? [...NAV, { href: "/admin", label: s.admin, icon: AdminIcon }]
    : NAV;

  return (
    <>
      {/* mobile backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-[240px] shrink-0 flex-col border-r transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          background: "var(--sidebar)",
          color: "var(--sidebar-foreground)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        <div
          className="flex items-center justify-between gap-2 px-5 py-4 border-b"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <a
            href="https://dropdat.app"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <img src="/brand/logo.svg" alt="" className="h-6 w-6" />
            <span className="font-heading text-[16px] font-medium tracking-tight">dropdat</span>
          </a>
          <button
            onClick={onClose}
            aria-label={s.closeMenu}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-md"
            style={{ color: "var(--sidebar-muted)" }}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
              <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/library" ? pathname === "/library" || pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                data-active={active || undefined}
                onClick={onClose}
                className="sidebar-link flex items-center gap-3 rounded-md px-3 py-[7px] text-[13px] transition-colors"
              >
                <Icon className="h-[15px] w-[15px]" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className="border-t px-3 py-3 flex items-center justify-between"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <ProfileMenu />
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { dict } = useConsoleLocale();
  return (
    <button
      onClick={toggle}
      aria-label={dict.console.sidebar.themeLight}
      className="flex h-8 w-8 items-center justify-center transition-colors"
      style={{ color: "var(--sidebar-muted)" }}
      title={theme === "dark" ? dict.console.sidebar.themeLight : dict.console.sidebar.themeDark}
    >
      {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    </button>
  );
}

type IconProps = { className?: string };

function LibraryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="2.5" width="12" height="11" />
      <line x1="2" y1="6" x2="14" y2="6" />
      <line x1="6" y1="2.5" x2="6" y2="13.5" />
    </svg>
  );
}

function LinkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M7 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1" />
      <path d="M9 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1" />
    </svg>
  );
}

function KeyIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="5" cy="11" r="2.5" />
      <line x1="6.7" y1="9.3" x2="14" y2="2" />
      <line x1="11" y1="5" x2="13" y2="7" />
    </svg>
  );
}

function GraphIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="4" cy="4" r="1.6" />
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="11" cy="11.5" r="1.6" />
      <line x1="5" y1="5" x2="11" y2="5" />
      <line x1="4.5" y1="5.5" x2="5" y2="11" />
      <line x1="6" y1="11.5" x2="11" y2="11.5" />
      <line x1="11.5" y1="6" x2="11" y2="11" />
    </svg>
  );
}

function PacksIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="3" width="12" height="3" rx="0.5" />
      <rect x="2" y="7" width="12" height="3" rx="0.5" />
      <rect x="2" y="11" width="12" height="2" rx="0.5" />
    </svg>
  );
}

function TeamsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="5.5" cy="6.5" r="2" />
      <circle cx="11" cy="6.5" r="2" />
      <path d="M2 13c.5-2 2-3 3.5-3s3 1 3.5 3" />
      <path d="M8.5 13c.5-2 1.8-3 3-3s2.5 1 3 3" />
    </svg>
  );
}

function BillingIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
      <line x1="1.5" y1="6.5" x2="14.5" y2="6.5" />
      <line x1="4" y1="10" x2="7" y2="10" />
    </svg>
  );
}

function AdminIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M8 1.5l5.5 2v4c0 3.5-2.4 6.2-5.5 7C4.9 13.7 2.5 11 2.5 7.5v-4L8 1.5z" />
      <path d="M5.5 8l2 2 3-4" />
    </svg>
  );
}

function HelpIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M6 6.2c.2-1.1 1.1-1.7 2.1-1.7 1.2 0 2 .8 2 1.8 0 .9-.6 1.3-1.3 1.7-.6.4-.9.7-.9 1.4" />
      <circle cx="8" cy="11.6" r="0.5" fill="currentColor" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4" />
    </svg>
  );
}

function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3" />
    </svg>
  );
}

function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" />
    </svg>
  );
}
