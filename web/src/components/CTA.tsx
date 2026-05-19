import { ChromeIcon, ArrowRightIcon } from "./icons";
import { type Dict } from "@/i18n/dictionaries";

export function CTA({ dict }: { dict: Dict }) {
  const t = dict.cta;
  return (
    <section id="download" className="w-full max-w-[1200px] px-5 sm:px-6 pb-20 sm:pb-24">
      <div className="bg-primary-deep relative overflow-hidden border border-border p-12 md:p-16 text-center">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <h2 className="font-heading text-[42px] max-md:text-[28px] font-medium tracking-[-0.04em] leading-[110%] text-white max-w-[720px]">
            {t.h2}
          </h2>
          <p className="text-white/80 text-[16px] max-w-[560px]">
            {t.sub}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="https://chromewebstore.google.com/detail/pfcnjelpgccnkagaekhdcddpfacighho"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-foreground border border-white/20 px-5 py-2.5 text-[15px] font-medium hover:opacity-95 transition-opacity"
            >
              <ChromeIcon className="w-4 h-4" />
              {t.addToChrome}
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 bg-transparent text-white border border-white/40 px-5 py-2.5 text-[15px] font-medium hover:bg-white/10 transition-colors"
            >
              {t.seeAction}
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
