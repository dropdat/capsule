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

export const metadata = {
  title: "MCP server + semantic recall — dropdat",
  description:
    "Wire dropdat into Claude Code, Cursor, Cline, and Claude Desktop. Recall past AI sessions semantically, save the current one with a single tool call.",
};

const tools = [
  {
    name: "dropdat_recall",
    body:
      "Hybrid semantic + keyword search across every capsule the user has saved. Vector cosine over OpenAI embeddings, fused with BM25 ranking via RRF. The agent can ask in any phrasing — matches surface even when the original capsule used different words.",
  },
  {
    name: "dropdat_read",
    body:
      "Fetch one capsule's full contents (every message, every version) by id. Pair with dropdat_recall to drill into a hit.",
  },
  {
    name: "dropdat_list",
    body:
      "Browse recent capsules, optionally filtered by tag. Use when the user wants to skim, not search.",
  },
  {
    name: "dropdat_capsule",
    body:
      "Save the current conversation as a new capsule. Call when the user says 'remember this' or at the end of a meaningful session.",
  },
  {
    name: "dropdat_autocapsule",
    body:
      "Save the FULL verbatim Claude Code session by reading the on-disk .jsonl transcript — no model reconstruction, every message preserved.",
  },
];

const clients = [
  { name: "Claude Code", note: "Anthropic's terminal coding agent" },
  { name: "Cursor", note: "Editor with native MCP support" },
  { name: "Cline", note: "VS Code autonomous coding agent" },
  { name: "Claude Desktop", note: "Mac & Windows chat app" },
  { name: "Continue", note: "Open-source VS Code / JetBrains extension" },
  { name: "Anything MCP-capable", note: "Stdio transport, standard spec" },
];

const searchBeats = [
  {
    icon: BoltIcon,
    title: "Hybrid retrieval",
    body:
      "Vector cosine + tsvector BM25, fused with Reciprocal Rank Fusion. Catches semantic matches and exact keywords in one query.",
  },
  {
    icon: LayersIcon,
    title: "pgvector + HNSW",
    body:
      "Embeddings live in your own Postgres. HNSW index over 1536-dim vectors keeps recall fast even at hundreds of thousands of capsules.",
  },
  {
    icon: CapsuleIcon,
    title: "Auto-embedded on write",
    body:
      "New capsules and edits embed in the background. No worker queue to operate, no separate vector DB to babysit.",
  },
  {
    icon: LibraryIcon,
    title: "Graceful fallback",
    body:
      "No OPENAI_API_KEY set? Search degrades to BM25 only — your library stays searchable, just less smart.",
  },
];

export default function McpPage() {
  return (
    <>
      <Nav />
      <main className="relative z-[2] flex flex-col items-center w-full">
        {/* Hero */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 pt-28 sm:pt-36 pb-12 sm:pb-16">
          <div className="flex flex-col items-center text-center gap-6">
            <span className="inline-flex items-center gap-2 text-primary text-[13px] font-medium uppercase tracking-[0.18em]">
              <BoltIcon className="w-3.5 h-3.5" />
              MCP + Semantic Recall
            </span>
            <h1 className="font-heading text-[48px] max-md:text-[34px] font-medium tracking-[-0.04em] leading-[105%] text-foreground max-w-[860px]">
              Your AI memory, inside every coding agent you already use.
            </h1>
            <p className="text-[17px] max-md:text-[15px] text-muted-foreground max-w-[680px] leading-[1.55]">
              dropdat now ships an MCP server. Wire it into Claude Code, Cursor,
              Cline, or Claude Desktop — and every session can recall, read, and
              save capsules across providers without copy-pasting context.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="#install"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-border px-5 py-2.5 text-[15px] font-medium hover:opacity-95 transition-opacity"
              >
                Install the MCP server
                <ArrowRightIcon className="w-4 h-4" />
              </a>
              <a
                href="https://capsule.dropdat.app/library"
                className="inline-flex items-center gap-2 bg-card text-foreground border border-border px-5 py-2.5 text-[15px] font-medium hover:bg-accent transition-colors"
              >
                Get an API key
              </a>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 py-12 sm:py-16">
          <div className="mb-10">
            <h2 className="font-heading text-[32px] max-md:text-[24px] font-medium tracking-[-0.03em] leading-[120%]">
              Five tools. One library.
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-[640px]">
              The MCP server exposes exactly the surface an agent needs — and
              nothing it doesn't.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
            {tools.map((t) => (
              <div key={t.name} className="bg-card p-7 flex flex-col gap-3">
                <code className="font-mono text-[14px] text-primary">
                  {t.name}
                </code>
                <p className="text-[15px] leading-[1.6] text-foreground/90">
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Semantic search */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 py-12 sm:py-16">
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 text-primary text-[13px] font-medium uppercase tracking-[0.18em]">
              <LayersIcon className="w-3.5 h-3.5" />
              Powered by hybrid search
            </span>
            <h2 className="mt-4 font-heading text-[32px] max-md:text-[24px] font-medium tracking-[-0.03em] leading-[120%]">
              Recall by meaning, not just by word.
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-[640px]">
              Every capsule is embedded automatically on save. When an agent
              calls <code className="font-mono text-foreground">dropdat_recall</code>,
              the query embeds, runs vector + BM25 in one SQL pass, and returns
              ranked hits — even if the wording is entirely different.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {searchBeats.map((s) => (
              <div key={s.title} className="bg-card p-6 flex flex-col gap-3">
                <div className="w-10 h-10 bg-accent-soft border border-border flex items-center justify-center text-primary">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-[17px] font-medium">
                  {s.title}
                </h3>
                <p className="text-[14px] leading-[1.55] text-muted-foreground">
                  {s.body}
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
              Install in under a minute.
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-[640px]">
              One npm package, one config block, any MCP-capable client.
              Source on{" "}
              <a
                href="https://github.com/dropdat/mcp"
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              .
            </p>
          </div>

          <ol className="flex flex-col gap-5">
            <Step
              n={1}
              title="Issue an API key"
              body={
                <>
                  Open the{" "}
                  <a href="https://capsule.dropdat.app/api-keys" className="underline">
                    API Keys
                  </a>{" "}
                  page in your dashboard and create a key. Tokens are shown
                  once and look like <code className="font-mono">dk_live_…</code>.
                </>
              }
            />
            <Step
              n={2}
              title="Install from npm"
              body={
                <pre className="font-mono text-[13px] leading-[1.6] bg-background border border-border p-4 overflow-x-auto">
{`# zero-install — runs the latest version on demand
npx -y @dropdat/mcp

# or pin a global install
npm install -g @dropdat/mcp`}
                </pre>
              }
            />
            <Step
              n={3}
              title="Wire it into your client"
              body={
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground">
                      Claude Code (one-liner)
                    </span>
                    <pre className="font-mono text-[13px] leading-[1.6] bg-background border border-border p-4 overflow-x-auto">
{`claude mcp add dropdat \\
  --env DROPDAT_API_KEY=dk_live_xxx \\
  --env DROPDAT_API_BASE=https://api.dropdat.app \\
  -- npx -y @dropdat/mcp`}
                    </pre>
                    <span className="text-[13px] text-muted-foreground">
                      Then{" "}
                      <code className="font-mono text-foreground">
                        /mcp
                      </code>{" "}
                      inside Claude Code lists the new server and its five
                      tools.
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground">
                      Cursor, Cline, Claude Desktop, Continue
                    </span>
                    <pre className="font-mono text-[13px] leading-[1.6] bg-background border border-border p-4 overflow-x-auto">
{`{
  "mcpServers": {
    "dropdat": {
      "command": "npx",
      "args": ["-y", "@dropdat/mcp"],
      "env": {
        "DROPDAT_API_KEY": "dk_live_xxx",
        "DROPDAT_API_BASE": "https://api.dropdat.app"
      }
    }
  }
}`}
                    </pre>
                    <span className="text-[13px] text-muted-foreground">
                      Drop into the client&rsquo;s MCP config file (e.g.{" "}
                      <code className="font-mono text-foreground">
                        ~/.cursor/mcp.json
                      </code>{" "}
                      or{" "}
                      <code className="font-mono text-foreground">
                        claude_desktop_config.json
                      </code>
                      ) and restart the client.
                    </span>
                  </div>
                </div>
              }
            />
            <Step
              n={4}
              title="Talk to it"
              body={
                <ul className="flex flex-col gap-2 text-[15px] text-foreground/90">
                  <li>“What did we decide about auth last week? Check dropdat.”</li>
                  <li>“Save this conversation as a dropdat capsule titled ‘billing migration notes’.”</li>
                  <li>“List my recent dropdat capsules tagged ‘refactor’.”</li>
                </ul>
              }
            />
          </ol>
        </section>

        {/* Clients */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 py-12 sm:py-16">
          <div className="mb-10">
            <h2 className="font-heading text-[32px] max-md:text-[24px] font-medium tracking-[-0.03em] leading-[120%]">
              Works with the agents you already run.
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-[640px]">
              Standard MCP stdio transport. No fork, no proxy, no special build.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {clients.map((c) => (
              <div key={c.name} className="bg-card p-6 flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-heading text-[16px] font-medium">
                    {c.name}
                  </h3>
                  <p className="text-[14px] text-muted-foreground mt-1">
                    {c.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="w-full max-w-[1200px] px-5 sm:px-6 pb-20 sm:pb-24">
          <div className="bg-primary-deep relative overflow-hidden border border-border p-10 md:p-14 text-center">
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15), transparent 50%)",
              }}
              aria-hidden
            />
            <div className="relative z-10 flex flex-col items-center gap-5">
              <h2 className="font-heading text-[36px] max-md:text-[26px] font-medium tracking-[-0.04em] leading-[110%] text-white max-w-[720px]">
                Stop pasting context. Start recalling it.
              </h2>
              <p className="text-white/80 text-[15px] max-w-[560px]">
                The MCP server is open and free with any dropdat account.
                Semantic recall ships on every tier.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="https://capsule.dropdat.app/sign-up"
                  className="inline-flex items-center gap-2 bg-white text-foreground border border-white/20 px-5 py-2.5 text-[15px] font-medium hover:opacity-95 transition-opacity"
                >
                  Create an account
                </a>
                <a
                  href="https://capsule.dropdat.app/api-keys"
                  className="inline-flex items-center gap-2 bg-transparent text-white border border-white/40 px-5 py-2.5 text-[15px] font-medium hover:bg-white/10 transition-colors"
                >
                  Get an API key
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

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
