import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ArrowRightIcon, BoltIcon, CapsuleIcon, CheckIcon, LayersIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Long-term memory for AI coding agents — Claude Code, Cursor, Cline",
  description:
    "Stop losing context when you /clear. dropdat gives Claude Code, Cursor, Cline, and Claude Desktop persistent semantic memory through one MCP server.",
  alternates: { canonical: "/use-cases/coding-agent-memory" },
  keywords: [
    "long-term memory for coding agents",
    "Claude Code memory",
    "Cursor long-term memory",
    "Cline memory",
    "AI agent memory MCP",
    "persistent memory Claude Code",
    "save Claude Code session",
    "resume AI coding session",
  ],
  openGraph: {
    title: "Long-term memory for coding agents — dropdat",
    description:
      "One MCP server. Persistent, semantic memory across Claude Code, Cursor, Cline, Claude Desktop.",
    url: "https://dropdat.app/use-cases/coding-agent-memory",
    type: "article",
  },
};

const faqs = [
  {
    q: "Why do coding agents lose memory?",
    a: "Models have a finite context window. Once a session ends — /clear, /compact, IDE restart — the in-memory transcript is gone unless something external stored it. MCP gives agents a tool surface; dropdat is the backend that surface talks to.",
  },
  {
    q: "How is this different from project-level CLAUDE.md files?",
    a: "CLAUDE.md is static, hand-curated, and loads on every run. dropdat capsules are dynamic, searchable, and shared across all your agents — Claude Code can recall a capsule that Cursor saved last week.",
  },
  {
    q: "Does dropdat_autocapsule grab the whole session verbatim?",
    a: "Yes. It reads Claude Code's on-disk .jsonl transcript directly, so the capsule is byte-perfect — every message, every tool call, every system reminder.",
  },
  {
    q: "What does semantic recall mean here?",
    a: "Queries embed via OpenAI, run against pgvector cosine similarity, and fuse with BM25 keyword ranking. Ask 'how did we handle the rate-limit retry?' and matches surface even if the original capsule used different words.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Nav />
      <main className="relative z-[2] flex flex-col items-center w-full">
        <section className="w-full max-w-[1000px] px-5 sm:px-6 pt-28 sm:pt-36 pb-10">
          <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Use cases / Coding agent memory</span>
          </nav>
          <h1 className="font-heading text-[48px] max-md:text-[34px] font-medium tracking-[-0.04em] leading-[105%]">
            Long-term memory for your coding agents.
          </h1>
          <p className="mt-5 text-[17px] max-md:text-[15px] text-muted-foreground leading-[1.55] max-w-[760px]">
            Claude Code, Cursor, and Cline forget everything the moment you{" "}
            <code className="font-mono text-foreground">/clear</code>. dropdat
            keeps the transcript, indexes it, and serves it back to the next
            session through one MCP tool surface — shared across every agent
            you use.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-7">
            <Link
              href="/mcp"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-border px-5 py-2.5 text-[15px] font-medium"
            >
              See the MCP server
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/dropdat/mcp"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-card text-foreground border border-border px-5 py-2.5 text-[15px] font-medium hover:bg-accent transition-colors"
            >
              GitHub
            </a>
          </div>
        </section>

        <section className="w-full max-w-[1000px] px-5 sm:px-6 py-12">
          <h2 className="font-heading text-[28px] font-medium mb-6">
            The MCP surface
          </h2>
          <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
            <Cell icon={<BoltIcon className="w-5 h-5" />} name="dropdat_recall">
              Hybrid semantic + keyword search. Pulls the right capsules even
              when the agent asks in totally different language.
            </Cell>
            <Cell icon={<LayersIcon className="w-5 h-5" />} name="dropdat_read">
              Fetch one capsule&rsquo;s full contents — every message, every
              version, optional lineage.
            </Cell>
            <Cell icon={<CapsuleIcon className="w-5 h-5" />} name="dropdat_list">
              Browse recent capsules, optionally filtered by tag.
            </Cell>
            <Cell icon={<CheckIcon className="w-5 h-5" />} name="dropdat_capsule">
              Save the current conversation slice as a new capsule.
            </Cell>
            <Cell icon={<CheckIcon className="w-5 h-5" />} name="dropdat_autocapsule">
              Save the full verbatim Claude Code session by reading the on-disk
              <code className="font-mono"> .jsonl</code> transcript.
            </Cell>
          </div>
        </section>

        <section className="w-full max-w-[1000px] px-5 sm:px-6 py-12">
          <h2 className="font-heading text-[28px] font-medium mb-6">
            Install in your agent
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            <li><InternalCard href="/mcp/claude-code" title="Claude Code → one-liner install" /></li>
            <li><InternalCard href="/mcp/cursor" title="Cursor → mcp.json config" /></li>
            <li><InternalCard href="/mcp/cline" title="Cline → cline_mcp_settings.json" /></li>
            <li><InternalCard href="/mcp/claude-desktop" title="Claude Desktop → claude_desktop_config.json" /></li>
          </ul>
        </section>

        <section className="w-full max-w-[1000px] px-5 sm:px-6 py-12">
          <h2 className="font-heading text-[28px] font-medium mb-6">FAQ</h2>
          <div className="flex flex-col divide-y divide-border border border-border">
            {faqs.map((f) => (
              <details key={f.q} className="bg-card px-5 py-4">
                <summary className="cursor-pointer font-heading text-[16px] font-medium flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  {f.q}
                </summary>
                <p className="mt-3 ml-8 text-[15px] text-foreground/90 leading-[1.6]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Cell({ icon, name, children }: { icon: React.ReactNode; name: string; children: React.ReactNode }) {
  return (
    <div className="bg-card p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <code className="font-mono text-[14px]">{name}</code>
      </div>
      <p className="text-[14px] text-foreground/90 leading-[1.55]">{children}</p>
    </div>
  );
}

function InternalCard({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="block border border-border bg-card p-4 hover:bg-accent transition-colors text-[15px]">
      {title}
    </Link>
  );
}
