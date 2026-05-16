import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ArrowRightIcon, CapsuleIcon, CheckIcon, LayersIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Share context between ChatGPT, Claude, Gemini — cross-AI memory",
  description:
    "Tired of re-pasting context into every AI? dropdat captures any chat as a portable capsule and drops it into any other AI provider, plus exposes it to Claude Code, Cursor, Cline via MCP.",
  alternates: { canonical: "/use-cases/cross-ai-memory" },
  keywords: [
    "share context between ChatGPT and Claude",
    "cross-AI memory",
    "portable AI context",
    "move conversation from ChatGPT to Claude",
    "AI memory across providers",
    "ChatGPT memory alternative",
    "Claude memory",
    "AI conversation export",
  ],
  openGraph: {
    title: "Share context across ChatGPT, Claude, Gemini — dropdat",
    description:
      "Capture any AI chat as a portable capsule. Drop it into any provider. Recall it from any MCP-capable coding agent.",
    url: "https://dropdat.app/use-cases/cross-ai-memory",
    type: "article",
  },
};

const faqs = [
  {
    q: "Can I move a ChatGPT conversation into Claude?",
    a: "Yes. Open ChatGPT, click the dropdat capsule button (added by the extension), then open Claude and drop the same capsule into the composer. Claude receives the full conversation as context.",
  },
  {
    q: "Which AI providers does dropdat support?",
    a: "ChatGPT, Claude, Gemini, Grok, Copilot, and Perplexity are supported by the browser extension. Any MCP-capable client (Claude Code, Cursor, Cline, Claude Desktop) can read the same capsule library through the MCP server.",
  },
  {
    q: "Where is my context stored?",
    a: "In your dropdat library — Postgres + pgvector, backed by an account you own. Capsules sync locally first via IndexedDB, then push to the server. Export at any time.",
  },
  {
    q: "Is it free?",
    a: "Yes for personal use. The browser extension, MCP server, and a dropdat account are all free.",
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
            <span className="text-foreground">Use cases / Cross-AI memory</span>
          </nav>
          <h1 className="font-heading text-[48px] max-md:text-[34px] font-medium tracking-[-0.04em] leading-[105%]">
            Share context between ChatGPT, Claude, Gemini — without copy-paste.
          </h1>
          <p className="mt-5 text-[17px] max-md:text-[15px] text-muted-foreground leading-[1.55] max-w-[760px]">
            Every AI vendor wants to lock your context inside their app. dropdat
            captures any conversation as a portable <em>capsule</em> and lets
            you drop it into any other provider — or recall it from a coding
            agent over MCP.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-7">
            <a
              href="https://chromewebstore.google.com/detail/pfcnjelpgccnkagaekhdcddpfacighho"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-border px-5 py-2.5 text-[15px] font-medium"
            >
              Add the extension
              <ArrowRightIcon className="w-4 h-4" />
            </a>
            <Link
              href="/mcp"
              className="inline-flex items-center gap-2 bg-card text-foreground border border-border px-5 py-2.5 text-[15px] font-medium hover:bg-accent transition-colors"
            >
              MCP server
            </Link>
          </div>
        </section>

        <section className="w-full max-w-[1000px] px-5 sm:px-6 py-12">
          <h2 className="font-heading text-[28px] font-medium mb-6">
            How the capsule travels
          </h2>
          <ol className="flex flex-col gap-4">
            <Card icon={<CapsuleIcon className="w-5 h-5" />} title="1. Capture">
              In any supported AI tab, click the dropdat capsule button. The
              extension reads the on-page DOM, builds a structured capsule
              (every message, role, timestamp), and stores it locally first.
            </Card>
            <Card icon={<LayersIcon className="w-5 h-5" />} title="2. Sync">
              The capsule pushes to your dropdat library. From there it&rsquo;s
              embedded automatically (vector + BM25) and available to every
              other device + every MCP client.
            </Card>
            <Card icon={<ArrowRightIcon className="w-5 h-5" />} title="3. Drop">
              Open Claude, ChatGPT, Gemini — drag the capsule onto the composer
              (or click it in the extension popup). The full context is
              inserted as a single drop, ready to send.
            </Card>
          </ol>
        </section>

        <section className="w-full max-w-[1000px] px-5 sm:px-6 py-12">
          <h2 className="font-heading text-[28px] font-medium mb-6">
            Frequently asked questions
          </h2>
          <div className="flex flex-col divide-y divide-border border border-border">
            {faqs.map((f) => (
              <details key={f.q} className="bg-card px-5 py-4">
                <summary className="cursor-pointer font-heading text-[16px] font-medium flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  {f.q}
                </summary>
                <p className="mt-3 ml-8 text-[15px] text-foreground/90 leading-[1.6]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="w-full max-w-[1000px] px-5 sm:px-6 py-12">
          <h2 className="font-heading text-[24px] font-medium mb-4">
            Related
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            <li><InternalCard href="/use-cases/coding-agent-memory" title="Long-term memory for coding agents" /></li>
            <li><InternalCard href="/mcp/claude-code" title="Claude Code MCP server" /></li>
            <li><InternalCard href="/mcp/cursor" title="Cursor MCP server" /></li>
            <li><InternalCard href="/faq" title="dropdat FAQ" /></li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="bg-card border border-border p-5 flex gap-4">
      <span className="w-10 h-10 bg-accent-soft border border-border flex items-center justify-center text-primary shrink-0">
        {icon}
      </span>
      <div>
        <h3 className="font-heading text-[17px] font-medium">{title}</h3>
        <p className="text-[15px] text-foreground/90 mt-1 leading-[1.55]">{children}</p>
      </div>
    </li>
  );
}

function InternalCard({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="block border border-border bg-card p-4 hover:bg-accent transition-colors text-[15px]">
      {title}
    </Link>
  );
}
