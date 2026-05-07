import Link from "next/link";
import { GithubIcon, XIcon } from "./icons";

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full">
      <div className="mt-3 mx-3 sm:mt-4 sm:mx-4 w-full max-w-[1200px] flex items-center justify-between gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 backdrop-blur-md border border-border">
        <Link href="/" className="flex items-center gap-2 font-heading font-medium text-[16px] sm:text-[18px]">
          <img src="/brand/logo.svg" alt="" className="w-6 h-6 sm:w-7 sm:h-7" />
          <span>dropdat</span>
        </Link>
        <ul className="hidden md:flex items-center gap-7 text-[14px] text-foreground/80">
          <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
          <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
          <li><a href="#platforms" className="hover:text-foreground transition-colors">Supported AIs</a></li>
        </ul>
        <div className="flex items-center gap-2">
          <a href="https://github.com" aria-label="GitHub" className="hidden sm:inline-flex items-center justify-center w-9 h-9 text-foreground/70 hover:text-foreground transition-colors">
            <GithubIcon className="w-4 h-4" />
          </a>
          <a href="https://x.com" aria-label="X" className="hidden sm:inline-flex items-center justify-center w-9 h-9 text-foreground/70 hover:text-foreground transition-colors">
            <XIcon className="w-4 h-4" />
          </a>
          <a
            href="#download"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary text-primary-foreground border border-border px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-medium whitespace-nowrap hover:opacity-95 transition-opacity"
          >
            Add to Chrome
          </a>
        </div>
      </div>
    </nav>
  );
}
