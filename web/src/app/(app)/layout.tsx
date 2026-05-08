"use client";
import { useState } from "react";
import { Show, RedirectToSignIn } from "@clerk/react";
import { ThemeProvider } from "@/components/dashboard/ThemeProvider";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
      <Show when="signed-in">
        <ThemeProvider>
          <div className="relative z-[2] flex min-h-screen">
            <Sidebar open={open} onClose={() => setOpen(false)} />
            <main className="flex-1 min-w-0 overflow-x-hidden">
              <MobileTopBar onOpen={() => setOpen(true)} />
              <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </Show>
    </>
  );
}

function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      <button
        onClick={onOpen}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-md transition-colors"
        style={{ color: "var(--sidebar-foreground)" }}
      >
        <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <line x1="2" y1="4" x2="14" y2="4" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <line x1="2" y1="12" x2="14" y2="12" />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <img src="/brand/logo.svg" alt="" className="h-5 w-5" />
        <span className="font-heading text-[15px] font-medium tracking-tight">dropdat</span>
      </div>
      <div className="w-9" />
    </div>
  );
}
