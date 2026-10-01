import { GithubIcon, XIcon } from "./icons";
import { getDict, type Dict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Footer({ dict, locale = DEFAULT_LOCALE }: { dict?: Dict; locale?: Locale } = {}) {
  const d = dict ?? getDict(locale);
  const t = d.footer;
  const cols = [
    {
      title: t.productCol,
      links: [
        { label: t.productLinks.howItWorks, href: "#how-it-works" },
        { label: t.productLinks.features, href: "#features" },
        { label: t.productLinks.mcp, href: "/mcp" },
        { label: t.productLinks.blog, href: "/blog" },
        { label: t.productLinks.faq, href: "/faq" },
        { label: t.productLinks.download, href: "https://chromewebstore.google.com/detail/pfcnjelpgccnkagaekhdcddpfacighho" },
        { label: "Internships", href: "/internship" },
      ],
    },
    {
      title: t.mcpCol,
      links: [
        { label: "Claude Code", href: "/mcp/claude-code" },
        { label: "Cursor", href: "/mcp/cursor" },
        { label: "Cline", href: "/mcp/cline" },
        { label: "Claude Desktop", href: "/mcp/claude-desktop" },
        { label: "GitHub", href: "https://github.com/dropdat/" },
      ],
    },
    {
      title: t.useCol,
      links: [
        { label: t.useLinks.crossAi, href: "/use-cases/cross-ai-memory" },
        { label: t.useLinks.coding, href: "/use-cases/coding-agent-memory" },
        { label: t.useLinks.support, href: "/support" },
        { label: t.useLinks.contact, href: "mailto:support@dropdat.app" },
        { label: d.console.profile.requestFeature, href: `mailto:support@dropdat.app?subject=${encodeURIComponent(d.console.profile.featureSubject)}` },
      ],
    },
    {
      title: t.legalCol,
      links: [
        { label: t.legalLinks.privacy, href: "/privacy" },
        { label: t.legalLinks.terms, href: "/terms" },
      ],
    },
  ];
  return (
    <footer className="w-full border-t border-border bg-background relative z-10">
      <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-6 py-12 sm:py-14 grid lg:grid-cols-[1.2fr_2fr] gap-8 sm:gap-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-heading font-medium text-[20px]">
            <img src="/brand/logo.svg" alt="dropdat" className="w-7 h-7" />
            <span>dropdat</span>
          </div>
          <p className="text-[14px] text-muted-foreground max-w-[320px]">
            {t.tagline}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <a href="https://github.com/dropdat/" aria-label="GitHub" className="w-9 h-9 inline-flex items-center justify-center border border-border bg-card text-foreground/70 hover:text-foreground transition-colors">
              <GithubIcon className="w-4 h-4" />
            </a>
            <a href="https://x.com/Dropdat_" aria-label="X" className="w-9 h-9 inline-flex items-center justify-center border border-border bg-card text-foreground/70 hover:text-foreground transition-colors">
              <XIcon className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-3">
            <LocaleSwitcher locale={locale} label={t.language} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-heading text-[14px] font-medium text-foreground/90 mb-4 uppercase tracking-[0.12em]">
                {c.title}
              </h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-muted-foreground">
          <span>© {new Date().getFullYear()} dropdat. {t.rights}</span>
          <span>{t.builtFor}</span>
        </div>
      </div>
    </footer>
  );
}
