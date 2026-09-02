import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { InternshipForm } from "@/components/InternshipForm";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Internship application",
  description: "Apply for a full-time unpaid internship with dropdat.",
  alternates: { canonical: "/internship" },
};

export default function InternshipPage() {
  return (
    <>
      <Nav />
      <main className="relative z-[2] min-h-screen">
        <article className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
          <p className="font-mono text-[12px] text-muted-foreground">dropdat / opportunities</p>
          <h1 className="mt-7 max-w-[760px] font-heading text-[42px] font-medium leading-[1.05] tracking-[-0.05em] sm:text-[62px]">
            Join the team building memory for AI.
          </h1>
          <p className="mt-6 max-w-[650px] text-[16px] leading-7 text-muted-foreground">
            Tell us a little about yourself and share your resume. We are looking for
            curious builders who want to learn by shipping.
          </p>
          <InternshipForm />
        </article>
      </main>
      <Footer />
    </>
  );
}
