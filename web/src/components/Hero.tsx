import { ArrowRightIcon, ChromeIcon, CapsuleIcon } from "./icons";
import { HeroVisual } from "./HeroVisual";
import { type Dict } from "@/i18n/dictionaries";

export function Hero({ dict }: { dict: Dict }) {
  const t = dict.hero;
  return (
    <section className="w-full max-w-[1200px] px-5 sm:px-6 pt-28 sm:pt-36 pb-12 sm:pb-16 relative">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 sm:gap-10 items-center">
        <div className="flex flex-col items-start gap-6">
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 bg-accent-soft border border-border px-3 py-1.5 text-[14px] text-foreground/80 hover:text-foreground transition-colors"
          >
            <CapsuleIcon className="w-4 h-4 text-primary" />
            <span>{t.badge}</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </a>

          <h1 className="font-heading text-[58px] max-xl:text-5xl max-md:text-[36px] font-medium tracking-[-0.05em] leading-[110%] text-foreground max-w-[850px]">
            {t.h1Line1}
            <br />
            {t.h1Line2}
          </h1>

          <p className="max-w-[560px] text-[17px] leading-[1.55] text-muted-foreground">
            {t.intro}{" "}
            <span className="text-foreground">{t.introCapsule}</span>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://chromewebstore.google.com/detail/pfcnjelpgccnkagaekhdcddpfacighho"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-border px-5 py-2.5 text-[15px] font-medium hover:opacity-95 transition-opacity"
            >
              <ChromeIcon className="w-4 h-4" />
              {t.addToChrome}
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 bg-secondary text-foreground border border-border px-5 py-2.5 text-[15px] font-medium hover:bg-white transition-colors"
            >
              {t.seeHow}
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center gap-4 pt-3 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t.bullet1}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t.bullet2}
            </span>
          </div>
        </div>

        <div className="relative w-full aspect-square max-w-[440px] justify-self-center lg:justify-self-end">
          <div className="absolute inset-0 bg-accent-soft border border-border" aria-hidden />
          <div className="relative w-full h-full">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
