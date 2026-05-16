import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { POSTS } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog — long-form on AI memory, MCP, and cross-AI workflows",
  description:
    "Practical writing on AI memory, MCP servers, and how to stop losing context every time you switch between ChatGPT, Claude, Gemini, Cursor, and Claude Code.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "dropdat blog — AI memory, MCP, cross-AI workflows",
    description:
      "Practical writing on AI memory, MCP servers, and cross-AI workflows.",
    url: "https://dropdat.app/blog",
    type: "website",
  },
};

const sorted = [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export default function BlogIndex() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="flex flex-col gap-3 border-b border-border pb-8 mb-10">
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            Blog
          </span>
          <h1 className="font-heading text-[34px] sm:text-[42px] font-medium tracking-[-0.02em]">
            Notes on AI memory, MCP, and cross-AI work
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-[640px]">
            Long-form pieces that go past the marketing pages. If you're picking a memory layer,
            setting up a coding agent, or trying to stop re-pasting context all day, start here.
          </p>
        </header>

        <ul className="flex flex-col">
          {sorted.map((p) => (
            <li key={p.slug} className="border-b border-border py-6 first:pt-0">
              <Link
                href={`/blog/${p.slug}`}
                className="group flex flex-col gap-2 hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                  <time dateTime={p.publishedAt}>
                    {new Date(p.publishedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{p.readingMinutes} min read</span>
                </div>
                <h2 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-[-0.01em] group-hover:text-primary transition-colors">
                  {p.title}
                </h2>
                <p className="text-[14.5px] text-muted-foreground">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] uppercase tracking-wide text-muted-foreground border border-border px-2 py-[2px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
