"use client";
import { Show, RedirectToSignIn } from "@clerk/react";
import { ThemeProvider } from "@/components/dashboard/ThemeProvider";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
      <Show when="signed-in">
        <ThemeProvider>
          <div className="relative z-[2] flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden">
              <div className="mx-auto w-full max-w-[1200px] px-8 py-10">{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </Show>
    </>
  );
}
