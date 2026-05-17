import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "FAQ — dropdat, capsules, MCP server, semantic recall",
  description:
    "Answers to common questions about dropdat: what a capsule is, how cross-AI memory works, MCP setup, pricing, privacy, supported clients.",
  alternates: { canonical: "/faq" },
  keywords: [
    "dropdat FAQ",
    "what is a dropdat capsule",
    "MCP server FAQ",
    "ChatGPT memory FAQ",
    "Claude memory FAQ",
    "AI memory privacy",
    "dropdat pricing",
  ],
};

const faqs = [
  {
    q: "What is dropdat?",
    a: "A browser extension and MCP server that captures any AI conversation as a portable capsule. Drop the capsule into another AI to resume the chat; recall it from any MCP-capable coding agent over a tool surface.",
  },
  {
    q: "What is a capsule?",
    a: "A structured snapshot of an AI conversation: every message, role, timestamp, plus tags and a title. Capsules have version history (rootId + parentId chain) so you can fork, edit, and trace lineage.",
  },
  {
    q: "Which AI providers does the extension support?",
    a: "ChatGPT, Claude, Gemini, Grok, Copilot, and Perplexity. Capture works via per-provider content scripts that read the on-page DOM directly.",
  },
  {
    q: "Which MCP clients can use dropdat?",
    a: "Anything that speaks the standard MCP stdio transport: Claude Code, Cursor, Cline, Claude Desktop, Continue, plus any custom client.",
  },
  {
    q: "How do I install the MCP server?",
    a: "`npx -y @dropdat/mcp` runs the latest version on demand, or `npm install -g @dropdat/mcp` pins it. Configure your client with the DROPDAT_API_KEY env var.",
  },
  {
    q: "Is it free?",
    a: "Yes for personal use. The extension, MCP server, and a dropdat account are free. The MCP source lives at github.com/dropdat/mcp under MIT.",
  },
  {
    q: "Where is my data stored?",
    a: "In your dropdat library — Postgres + pgvector. Capsules are local-first via IndexedDB and sync to the server in the background. Export anytime.",
  },
  {
    q: "How does semantic recall work?",
    a: "Capsules are embedded with OpenAI on save. Queries embed and run against pgvector cosine similarity, then fuse with BM25 keyword ranking via Reciprocal Rank Fusion.",
  },
  {
    q: "Can I self-host?",
    a: "The MCP server is open source. The API/backend is currently hosted at dropdat.app; self-host instructions will be published as the API stabilises.",
  },
  {
    q: "How do I cancel my plan?",
    a: "Open Billing in the dashboard and hit Cancel plan. The cancellation takes effect at the end of your current billing period — you keep access until then.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — we refund any plan as long as you haven't used a paid feature after purchase. Contact support from the dashboard with your account email and we'll process it.",
  },
];

const jsonLd = {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main className="relative z-[2] flex flex-col items-center w-full">
        <section className="w-full max-w-[860px] px-5 sm:px-6 pt-28 sm:pt-36 pb-10">
          <h1 className="font-heading text-[44px] max-md:text-[32px] font-medium tracking-[-0.04em] leading-[105%]">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-[16px] text-muted-foreground leading-[1.55]">
            Quick answers about capsules, the MCP server, supported clients,
            data storage, and pricing.
          </p>
        </section>

        <section className="w-full max-w-[860px] px-5 sm:px-6 pb-16">
          <div className="flex flex-col divide-y divide-border border border-border bg-card">
            {faqs.map((f) => (
              <details key={f.q} className="px-5 py-4">
                <summary className="cursor-pointer font-heading text-[16px] font-medium">
                  {f.q}
                </summary>
                <p className="mt-3 text-[15px] text-foreground/90 leading-[1.6]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 text-[14px] text-muted-foreground">
            Didn&rsquo;t find what you need?{" "}
            <Link href="/support" className="underline text-foreground">
              Reach out
            </Link>{" "}
            or browse the{" "}
            <Link href="/mcp" className="underline text-foreground">
              MCP docs
            </Link>
            .
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
