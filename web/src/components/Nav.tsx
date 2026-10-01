import Link from "next/link";
import { GithubIcon, XIcon } from "./icons";
import { getDict, type Dict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, type Locale, localePath } from "@/i18n/config";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Nav({ dict, locale = DEFAULT_LOCALE }: { dict?: Dict; locale?: Locale } = {}) {
  const d = dict ?? getDict(locale);
  const t = d.nav;
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-3 sm:pt-4">
      <div className="mx-auto w-full max-w-[1200px] flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-white/80 backdrop-blur-md border border-border overflow-hidden">
        <Link href={localePath(locale, "/")} className="flex shrink-0 items-center gap-2 font-heading font-medium text-[16px] sm:text-[18px]">
          <img src="/brand/logo.svg" alt="dropdat" className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="max-[380px]:hidden">dropdat</span>
        </Link>
        <ul className="hidden md:flex items-center gap-7 text-[14px] text-foreground/80">
          <li><a href="#how-it-works" className="hover:text-foreground transition-colors">{t.howItWorks}</a></li>
          <li><a href="#features" className="hover:text-foreground transition-colors">{t.features}</a></li>
          <li><Link href="/mcp" className="hover:text-foreground transition-colors">{t.mcp}</Link></li>
          <li><Link href="/blog" className="hover:text-foreground transition-colors">{t.blog}</Link></li>
          <li><a href="#platforms" className="hover:text-foreground transition-colors">{t.platforms}</a></li>
        </ul>
        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} label={d.footer.language} />
          <a href="https://github.com/dropdat/" aria-label="GitHub" className="hidden sm:inline-flex items-center justify-center w-9 h-9 text-foreground/70 hover:text-foreground transition-colors">
            <GithubIcon className="w-4 h-4" />
          </a>
          <a href="https://x.com/Dropdat_" aria-label="X" className="hidden sm:inline-flex items-center justify-center w-9 h-9 text-foreground/70 hover:text-foreground transition-colors">
            <XIcon className="w-4 h-4" />
          </a>
          <a
            href="https://capsule.dropdat.app/library"
            className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2 bg-card text-foreground border border-border px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-medium whitespace-nowrap hover:bg-accent transition-colors"
          >
            {t.console}
          </a>
          <a
            href="https://chromewebstore.google.com/detail/pfcnjelpgccnkagaekhdcddpfacighho"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary text-primary-foreground border border-border px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-medium whitespace-nowrap hover:opacity-95 transition-opacity"
          >
            {t.addToChrome}
          </a>
        </div>
      </div>
    </nav>
  );
}
