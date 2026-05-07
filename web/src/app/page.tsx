import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { AsciiBand } from "@/components/AsciiBand";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { Platforms } from "@/components/Platforms";
import { CTA } from "@/components/CTA";
import { AgentSection } from "@/components/AgentSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-[2] flex flex-col items-center w-full">
        <Hero />
        <AsciiBand />
        <HowItWorks />
        <Features />
        <Platforms />
        <AgentSection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
