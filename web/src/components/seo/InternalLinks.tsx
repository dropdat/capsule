import Link from "next/link";
import type { BreadcrumbItem, InternalLink } from "@/lib/seo/internalLinks";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground mb-4">
      {items.map((it, idx) => {
        const last = idx === items.length - 1;
        return (
          <span key={it.href}>
            {last ? (
              <span className="text-foreground">{it.name}</span>
            ) : (
              <Link href={it.href} className="hover:text-foreground transition-colors">
                {it.name}
              </Link>
            )}
            {!last && <span className="mx-2">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

export function InternalLinksGrid({
  title,
  links,
}: {
  title?: string;
  links: InternalLink[];
}) {
  if (links.length === 0) return null;
  return (
    <section className="w-full">
      {title && (
        <h2 className="font-heading text-[24px] font-medium mb-4">{title}</h2>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            title={l.title}
            className="block border border-border bg-card p-4 hover:bg-accent transition-colors text-[14px]"
          >
            {l.text}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function InternalLinksInline({
  links,
}: {
  links: InternalLink[];
}) {
  return (
    <p className="text-[14px] text-muted-foreground leading-[1.7]">
      Related:{" "}
      {links.map((l, idx) => (
        <span key={l.href}>
          <Link href={l.href} className="underline hover:text-foreground transition-colors">
            {l.text}
          </Link>
          {idx < links.length - 1 ? ", " : "."}
        </span>
      ))}
    </p>
  );
}
