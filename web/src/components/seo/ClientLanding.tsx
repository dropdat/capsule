import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import {
  ArrowRightIcon,
  BoltIcon,
  CapsuleIcon,
  CheckIcon,
  LayersIcon,
  LibraryIcon,
} from "@/components/icons";

export interface ClientLandingProps {
  /** Display name of the client, e.g. "Claude Code" */
  clientName: string;
  /** Slug used in URLs / IDs, e.g. "claude-code" */
  slug: string;
  /** Short one-liner describing the client */
  clientBlurb: string;
  /** Where the MCP config lives in this client (path or instruction) */
  configLocation: string;
  /** Install snippet (CLI one-liner or note) — pre-formatted text */
  installSnippet: string;
  /** Config JSON snippet — pre-formatted text */
  configSnippet: string;
  /** "claude mcp", "Cursor settings", etc. */
  verifyHint: string;
  /** 3–5 specific use-case bullets aimed at this client */
  useCases: string[];
}

const features = [
  {
    icon: BoltIcon,
    title: "Hybrid semantic recall",
    body:
      "Vector cosine + BM25 fused with RRF. Asks in any phrasing, finds capsules that used different words.",
  },
  {
    icon: LayersIcon,
    title: "Five MCP tools",
    body:
      "dropdat_recall, dropdat_read, dropdat_list, dropdat_capsule, dropdat_autocapsule — all the surface an agent needs.",
  },
  {
    icon: CapsuleIcon,
    title: "Cross-AI capsules",
    body:
      "The same capsule library is reachable from Claude Code, Cursor, Cline, Claude Desktop, ChatGPT, Claude, Gemini.",
  },
  {
    icon: LibraryIcon,
    title: "Owned data",
    body:
      "Capsules live in your dropdat library. Postgres + pgvector. Export anytime.",
  },
];

export function ClientLanding(props: ClientLandingProps) {
  const {
    clientName,
    slug,
    clientBlurb,
    configLocation,
    installSnippet,
    configSnippet,
    verifyHint,
    useCases,
  } = props;

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `Install the dropdat MCP server in ${clientName}`,
    description: `Step-by-step guide to wire @dropdat/mcp into ${clientName} so any conversation can recall and save dropdat capsules.`,
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Issue a dropdat API key",
        text: "Sign in at capsule.dropdat.app, open API Keys, create a token (shape dk_live_…).",
        url: "https://capsule.dropdat.app/api-keys",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: `Install @dropdat/mcp`,
        text: installSnippet,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: `Wire it into ${clientName}`,
        text: `Add the MCP server config to ${configLocation}.`,
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Verify",
        text: verifyHint,
      },
    ],
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `dropdat MCP server for ${clientName}`,
    operatingSystem: "macOS, Windows, Linux",
    applicationCategory: "DeveloperApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: `https://dropdat.app/mcp/${slug}`,
    sameAs: [
      "https://github.com/dropdat/mcp",
      "https://www.npmjs.com/package/@dropdat/mcp",
    ],
    description: `MCP server that gives ${clientName} long-term, semantic recall over your dropdat capsule library.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <Nav />
      <main className="relative z-[2] flex flex-col items-center w-full">
        {/* Hero */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 pt-28 sm:pt-36 pb-12 sm:pb-16">
          <div className="flex flex-col items-center text-center gap-6">
            <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
              <Link href="/mcp" className="hover:text-foreground transition-colors">
                MCP
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{clientName}</span>
            </nav>
            <h1 className="font-heading text-[48px] max-md:text-[34px] font-medium tracking-[-0.04em] leading-[105%] text-foreground max-w-[860px]">
              dropdat MCP server for {clientName}
            </h1>
            <p className="text-[17px] max-md:text-[15px] text-muted-foreground max-w-[680px] leading-[1.55]">
              Give {clientName} long-term, cross-session memory. Recall past
              conversations, save the current one, drop context into any AI
              client — all from inside {clientName}.{" "}
              <span className="text-foreground">{clientBlurb}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="#install"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-border px-5 py-2.5 text-[15px] font-medium hover:opacity-95 transition-opacity"
              >
                Install in {clientName}
                <ArrowRightIcon className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/dropdat/mcp"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-card text-foreground border border-border px-5 py-2.5 text-[15px] font-medium hover:bg-accent transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {features.map((f) => (
              <div key={f.title} className="bg-card p-6 flex flex-col gap-3">
                <div className="w-10 h-10 bg-accent-soft border border-border flex items-center justify-center text-primary">
                  <f.icon className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-[17px] font-medium">
                  {f.title}
                </h2>
                <p className="text-[14px] leading-[1.55] text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Install */}
        <section
          id="install"
          className="w-full max-w-[1200px] px-5 sm:px-6 py-12 sm:py-16"
        >
          <div className="mb-10">
            <h2 className="font-heading text-[32px] max-md:text-[24px] font-medium tracking-[-0.03em] leading-[120%]">
              Install in {clientName}
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-[640px]">
              Two steps. Under a minute. No fork, no proxy.
            </p>
          </div>

          <ol className="flex flex-col gap-5">
            <Step
              n={1}
              title="Get a dropdat API key"
              body={
                <p>
                  Sign in at{" "}
                  <a
                    href="https://capsule.dropdat.app/api-keys"
                    className="underline"
                  >
                    capsule.dropdat.app/api-keys
                  </a>{" "}
                  and create a token (shape{" "}
                  <code className="font-mono">dk_live_…</code>).
                </p>
              }
            />
            <Step
              n={2}
              title={`Install @dropdat/mcp`}
              body={
                <pre className="font-mono text-[13px] leading-[1.6] bg-background border border-border p-4 overflow-x-auto">
                  {installSnippet}
                </pre>
              }
            />
            <Step
              n={3}
              title={`Drop config into ${configLocation}`}
              body={
                <pre className="font-mono text-[13px] leading-[1.6] bg-background border border-border p-4 overflow-x-auto">
                  {configSnippet}
                </pre>
              }
            />
            <Step
              n={4}
              title="Verify"
              body={<p>{verifyHint}</p>}
            />
          </ol>
        </section>

        {/* Use cases */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 py-12 sm:py-16">
          <div className="mb-8">
            <h2 className="font-heading text-[32px] max-md:text-[24px] font-medium tracking-[-0.03em] leading-[120%]">
              What you can ask {clientName} now
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-[640px]">
              Once wired in, any of these prompts route through dropdat tools.
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-px bg-border border border-border">
            {useCases.map((uc) => (
              <li key={uc} className="bg-card p-5 flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-[15px] text-foreground/90 leading-[1.55]">
                  {uc}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Internal links */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 py-12 sm:py-16">
          <h2 className="font-heading text-[24px] font-medium mb-6">
            Related guides
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RELATED.filter((r) => r.slug !== slug).map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="border border-border bg-card p-5 hover:bg-accent transition-colors"
              >
                <span className="block font-heading text-[16px] font-medium">
                  {r.label}
                </span>
                <span className="block text-[13px] text-muted-foreground mt-1">
                  {r.blurb}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 pb-20 sm:pb-24">
          <div className="bg-primary-deep relative overflow-hidden border border-border p-10 md:p-14 text-center">
            <div className="relative z-10 flex flex-col items-center gap-5">
              <h2 className="font-heading text-[32px] max-md:text-[24px] font-medium tracking-[-0.04em] leading-[110%] text-white max-w-[720px]">
                Wire {clientName} into your dropdat library.
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="https://capsule.dropdat.app/sign-up"
                  className="inline-flex items-center gap-2 bg-white text-foreground border border-white/20 px-5 py-2.5 text-[15px] font-medium hover:opacity-95 transition-opacity"
                >
                  Create a free account
                </a>
                <Link
                  href="/mcp"
                  className="inline-flex items-center gap-2 bg-transparent text-white border border-white/40 px-5 py-2.5 text-[15px] font-medium hover:bg-white/10 transition-colors"
                >
                  Compare all MCP clients
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const RELATED = [
  { slug: "claude-code", href: "/mcp/claude-code", label: "Claude Code MCP", blurb: "One-liner install for Anthropic's terminal coding agent." },
  { slug: "cursor", href: "/mcp/cursor", label: "Cursor MCP", blurb: "Add dropdat memory to Cursor's MCP panel." },
  { slug: "cline", href: "/mcp/cline", label: "Cline MCP", blurb: "Long-term memory for the autonomous VS Code agent." },
  { slug: "claude-desktop", href: "/mcp/claude-desktop", label: "Claude Desktop MCP", blurb: "Wire dropdat into Anthropic's Mac/Windows app." },
  { slug: "cross-ai-memory", href: "/use-cases/cross-ai-memory", label: "Share context between ChatGPT and Claude", blurb: "How dropdat capsules travel across providers." },
  { slug: "coding-agent-memory", href: "/use-cases/coding-agent-memory", label: "Long-term memory for coding agents", blurb: "Make every AI session pick up where the last left off." },
];

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="bg-card border border-border p-6 flex gap-5">
      <span className="font-mono text-[13px] text-primary w-7 h-7 inline-flex items-center justify-center bg-accent-soft border border-border shrink-0">
        {String(n).padStart(2, "0")}
      </span>
      <div className="flex flex-col gap-3 min-w-0 flex-1">
        <h3 className="font-heading text-[18px] font-medium">{title}</h3>
        <div className="text-[15px] text-foreground/90 leading-[1.6]">
          {body}
        </div>
      </div>
    </li>
  );
}
