import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="relative z-[2] w-full flex justify-center">
        <article className="w-full max-w-[760px] px-6 pt-32 pb-20">
          <h1 className="font-heading text-[40px] sm:text-[48px] leading-[1.05] font-medium text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Last updated: {updated}
          </p>
          <div className="legal-prose mt-10 text-[15.5px] leading-[1.7] text-foreground/90 space-y-6">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
