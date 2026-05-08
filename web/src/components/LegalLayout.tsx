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
        <article className="w-full max-w-[760px] px-5 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20">
          <h1 className="font-heading text-[32px] sm:text-[40px] md:text-[48px] leading-[1.1] font-medium text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-[13px] sm:text-[14px] text-muted-foreground">
            Last updated: {updated}
          </p>
          <div className="legal-prose mt-8 sm:mt-10 text-[14.5px] sm:text-[15.5px] leading-[1.7] text-foreground/90 space-y-6 break-words">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
