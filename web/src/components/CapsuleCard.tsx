"use client";
import Link from "next/link";
import type { Capsule } from "@/lib/api";

const sourceLabel: Record<Capsule["source"], string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  mobile: "Mobile",
};

export function CapsuleCard({ capsule }: { capsule: Capsule }) {
  const updated = new Date(capsule.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/capsule?id=${capsule.id}`}
      className="group flex flex-col gap-3 border border-border bg-card p-5 hover:bg-accent-soft/40 transition-colors"
    >
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        <span>{sourceLabel[capsule.source]}</span>
        <span>v{capsule.version}</span>
      </div>
      <h3 className="font-heading text-[18px] font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
        {capsule.title}
      </h3>
      {capsule.summary && (
        <p className="text-[13px] leading-[1.5] text-muted-foreground line-clamp-3">
          {capsule.summary}
        </p>
      )}
      {capsule.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {capsule.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 bg-accent-soft border border-border text-foreground/80">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="text-[11px] text-muted-foreground mt-auto pt-2">
        Updated {updated}
      </div>
    </Link>
  );
}
