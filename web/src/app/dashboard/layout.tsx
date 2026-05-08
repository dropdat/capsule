"use client";
import Link from "next/link";
import { Show, UserButton, RedirectToSignIn } from "@clerk/react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
      <Show when="signed-in">
        <div className="relative z-[2] flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-heading text-[16px] font-medium">
                  <img src="/brand/logo.svg" alt="" className="h-6 w-6" />
                  dropdat
                </Link>
                <nav className="flex items-center gap-5 text-[13px] text-foreground/80">
                  <Link href="/dashboard" className="hover:text-foreground transition-colors">Library</Link>
                  <Link href="/dashboard/api-keys" className="hover:text-foreground transition-colors">API Keys</Link>
                  <Link href="/dashboard/settings" className="hover:text-foreground transition-colors">Settings</Link>
                </nav>
              </div>
              <UserButton />
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-10">{children}</main>
        </div>
      </Show>
    </>
  );
}
