import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { AsciiBand } from "@/components/AsciiBand";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { Platforms } from "@/components/Platforms";
import { CTA } from "@/components/CTA";
import { AgentSection } from "@/components/AgentSection";
import { Footer } from "@/components/Footer";
import { HtmlLang } from "@/components/HtmlLang";
import { type Dict } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";

export function MarketingHome({ dict, locale }: { dict: Dict; locale: Locale }) {
  return (
    <>
      <HtmlLang locale={locale} />
      <Nav dict={dict} locale={locale} />
      <main className="relative z-[2] flex flex-col items-center w-full">
        <Hero dict={dict} />
        <AsciiBand />
        <HowItWorks dict={dict} />
        <Features dict={dict} />
        <Platforms dict={dict} />
        <AgentSection dict={dict} />
        <CTA dict={dict} />
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
