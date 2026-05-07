import { GithubIcon, XIcon } from "./icons";

const cols = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Supported AIs", href: "#platforms" },
      { label: "Download", href: "#download" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Support", href: "/support" },
      { label: "Contact", href: "mailto:support@dropdat.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background relative z-10">
      <div className="w-full max-w-[1200px] mx-auto px-6 py-14 grid lg:grid-cols-[1.2fr_2fr] gap-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-heading font-medium text-[20px]">
            <img src="/brand/logo.svg" alt="" className="w-7 h-7" />
            <span>dropdat</span>
          </div>
          <p className="text-[14px] text-muted-foreground max-w-[320px]">
            Cross-AI memory in one click. Capture, capsule, drop.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <a href="https://github.com" aria-label="GitHub" className="w-9 h-9 inline-flex items-center justify-center border border-border bg-card text-foreground/70 hover:text-foreground transition-colors">
              <GithubIcon className="w-4 h-4" />
            </a>
            <a href="https://x.com" aria-label="X" className="w-9 h-9 inline-flex items-center justify-center border border-border bg-card text-foreground/70 hover:text-foreground transition-colors">
              <XIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
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
        <div className="w-full max-w-[1200px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-muted-foreground">
          <span>© {new Date().getFullYear()} dropdat. All rights reserved.</span>
          <span>Built for the post-stateless era.</span>
        </div>
      </div>
    </footer>
  );
}
