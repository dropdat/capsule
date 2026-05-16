/**
 * Programmatic SEO data generator for dropdat.
 *
 * Produces deterministic slugs targeting MCP, AI-memory, capsule, and
 * cross-AI workflow queries. Combinations are filtered to credible
 * intent-bearing pages (we don't generate junk like "ruby + ChatGPT memory").
 */

export type ProgrammaticItem = {
  slug: string;
  title: string;
  description: string;
  category:
    | "client"
    | "provider"
    | "use-case"
    | "alternative"
    | "integration"
    | "language"
    | "solution"
    | "guide"
    | "compare";
  keywords: string[];
  h1: string;
  intro: string;
  /** Up to 5 short bullet selling points specific to this page. */
  bullets: string[];
  /** Suggested related slugs for cross-linking. */
  related: string[];
  updatedAt: string;
};

export const clients = [
  { slug: "claude-code", name: "Claude Code", blurb: "Anthropic's terminal coding agent" },
  { slug: "cursor", name: "Cursor", blurb: "AI-native code editor" },
  { slug: "cline", name: "Cline", blurb: "Autonomous VS Code coding agent" },
  { slug: "claude-desktop", name: "Claude Desktop", blurb: "Anthropic's chat app for Mac & Windows" },
  { slug: "continue", name: "Continue", blurb: "Open-source VS Code & JetBrains AI extension" },
  { slug: "windsurf", name: "Windsurf", blurb: "Codeium's agentic editor" },
  { slug: "zed", name: "Zed", blurb: "Collaborative code editor with agent panel" },
  { slug: "copilot-chat", name: "GitHub Copilot Chat", blurb: "GitHub's AI assistant" },
  { slug: "void", name: "Void", blurb: "Open-source Cursor alternative" },
] as const;

export const providers = [
  { slug: "chatgpt", name: "ChatGPT" },
  { slug: "claude", name: "Claude" },
  { slug: "gemini", name: "Gemini" },
  { slug: "grok", name: "Grok" },
  { slug: "copilot", name: "Microsoft Copilot" },
  { slug: "perplexity", name: "Perplexity" },
  { slug: "mistral", name: "Mistral" },
  { slug: "deepseek", name: "DeepSeek" },
  { slug: "llama", name: "Llama" },
] as const;

export const useCases = [
  { slug: "cross-ai-memory", name: "Cross-AI memory" },
  { slug: "coding-agent-memory", name: "Coding agent memory" },
  { slug: "chat-history", name: "AI chat history" },
  { slug: "prompt-library", name: "Prompt library" },
  { slug: "session-recovery", name: "Session recovery" },
  { slug: "context-handoff", name: "Context handoff" },
  { slug: "conversation-search", name: "Conversation search" },
  { slug: "ai-bookmarks", name: "AI bookmarks" },
  { slug: "knowledge-base", name: "Personal knowledge base" },
  { slug: "ai-notes", name: "AI notes" },
] as const;

export const competitors = [
  { slug: "mem0", name: "Mem0" },
  { slug: "langmem", name: "LangMem" },
  { slug: "zep", name: "Zep" },
  { slug: "letta", name: "Letta" },
  { slug: "redis-memory", name: "Redis-based AI memory" },
  { slug: "langchain-memory", name: "LangChain memory" },
  { slug: "openai-memory", name: "OpenAI memory" },
  { slug: "claude-projects", name: "Claude Projects" },
  { slug: "chatgpt-memory", name: "ChatGPT memory" },
  { slug: "supermemory", name: "Supermemory" },
  { slug: "contextly", name: "Contextly" },
  { slug: "recall-ai", name: "Recall.ai" },
  { slug: "motorhead", name: "Motörhead" },
  { slug: "papr", name: "Papr Memory" },
] as const;

export const languages = [
  { slug: "typescript", name: "TypeScript" },
  { slug: "python", name: "Python" },
  { slug: "go", name: "Go" },
  { slug: "rust", name: "Rust" },
  { slug: "java", name: "Java" },
  { slug: "javascript", name: "JavaScript" },
  { slug: "ruby", name: "Ruby" },
  { slug: "php", name: "PHP" },
  { slug: "swift", name: "Swift" },
  { slug: "kotlin", name: "Kotlin" },
] as const;

export const integrations = [
  { slug: "github", name: "GitHub" },
  { slug: "vscode", name: "VS Code" },
  { slug: "jetbrains", name: "JetBrains IDEs" },
  { slug: "raycast", name: "Raycast" },
  { slug: "slack", name: "Slack" },
  { slug: "discord", name: "Discord" },
  { slug: "notion", name: "Notion" },
  { slug: "linear", name: "Linear" },
  { slug: "obsidian", name: "Obsidian" },
  { slug: "zapier", name: "Zapier" },
] as const;

const BASE_DATE = new Date("2026-01-01").getTime();
const DAY_MS = 86400000;
let counter = 0;
const stamp = () => new Date(BASE_DATE + counter++ * DAY_MS).toISOString();

const cap = (s: string) =>
  s
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

function pushItem(
  out: ProgrammaticItem[],
  item: Omit<ProgrammaticItem, "updatedAt">,
) {
  out.push({ ...item, updatedAt: stamp() });
}

let cachedItems: ProgrammaticItem[] | null = null;
let cachedBySlug: Map<string, ProgrammaticItem> | null = null;

export function getAllProgrammaticItems(): ProgrammaticItem[] {
  if (cachedItems) return cachedItems;
  const out: ProgrammaticItem[] = [];
  counter = 0;

  // 1. Per-MCP-client pages (live under /seo/clients/<slug>; native /mcp/<slug>
  //    pages exist for the top four and take priority via canonical there)
  for (const c of clients) {
    pushItem(out, {
      slug: `clients/${c.slug}`,
      title: `${c.name} MCP server — long-term AI memory & semantic recall`,
      description: `Wire @dropdat/mcp into ${c.name} for cross-session memory. Recall past conversations, save the current one, share context with other MCP clients.`,
      category: "client",
      keywords: [
        `${c.slug} mcp`,
        `${c.slug} mcp server`,
        `${c.slug} memory`,
        `${c.slug} long term memory`,
        `${c.name} dropdat`,
        `${c.slug} semantic recall`,
      ],
      h1: `dropdat MCP server for ${c.name}`,
      intro: `${c.name} (${c.blurb}) gains persistent, cross-session memory the moment you wire in @dropdat/mcp. Recall any past conversation, save the current one, and share the same capsule library with every other MCP-capable agent.`,
      bullets: [
        `Standard MCP stdio transport — no fork, no proxy`,
        `Five tools: dropdat_recall, dropdat_read, dropdat_list, dropdat_capsule, dropdat_autocapsule`,
        `Hybrid semantic + keyword search (pgvector + BM25)`,
        `Free, open-source, MIT-licensed npm package`,
        `Capsules sync with the dropdat browser extension and other clients`,
      ],
      related: [
        "use-cases/coding-agent-memory",
        "use-cases/cross-ai-memory",
        "alternatives/mem0",
        "alternatives/chatgpt-memory",
      ],
    });
  }

  // 2. Provider memory pages — "ChatGPT memory", "Claude memory" intent
  for (const p of providers) {
    pushItem(out, {
      slug: `providers/${p.slug}-memory`,
      title: `${p.name} memory — capture, recall, drop into any other AI`,
      description: `Tired of ${p.name} forgetting? dropdat captures every ${p.name} conversation as a portable capsule, drops it into Claude / ChatGPT / Gemini, and exposes it to every MCP client.`,
      category: "provider",
      keywords: [
        `${p.slug} memory`,
        `${p.slug} chat history`,
        `${p.slug} memory alternative`,
        `export ${p.slug} conversations`,
        `${p.slug} long term memory`,
      ],
      h1: `${p.name} memory you actually own`,
      intro: `${p.name}'s built-in memory only works inside ${p.name}. dropdat captures any ${p.name} conversation as a structured capsule, stores it in your own library, and lets you drop it into other AIs or recall it from coding agents over MCP.`,
      bullets: [
        `One-click capture from the ${p.name} web UI via the dropdat extension`,
        `Capsules carry every message, role, and timestamp verbatim`,
        `Drop a ${p.name} capsule into Claude, Gemini, Grok, Copilot, or Perplexity`,
        `Recall the same capsule from Claude Code, Cursor, Cline via MCP`,
        `Local-first storage; sync to your dropdat library on your terms`,
      ],
      related: [
        "use-cases/cross-ai-memory",
        "use-cases/chat-history",
        "alternatives/chatgpt-memory",
        "alternatives/claude-projects",
      ],
    });
  }

  // 3. Use-case explainer pages
  for (const u of useCases) {
    pushItem(out, {
      slug: `use-cases/${u.slug}`,
      title: `${u.name} with dropdat — capsules across every AI`,
      description: `How to use dropdat for ${u.name.toLowerCase()}: capture, capsule, drop. Works across ChatGPT, Claude, Gemini, plus every MCP-capable coding agent.`,
      category: "use-case",
      keywords: [
        u.slug,
        `${u.slug} ai`,
        `${u.slug} mcp`,
        `dropdat ${u.slug}`,
        `${u.name.toLowerCase()}`,
      ],
      h1: `${u.name}`,
      intro: `dropdat treats ${u.name.toLowerCase()} as a first-class workflow. Capsules are versioned, embedded, searchable, and reachable from every AI client you already use — no copy-paste, no vendor lock-in.`,
      bullets: [
        `Capture from any supported AI in one click`,
        `Hybrid semantic + BM25 recall over your entire library`,
        `MCP tool surface lets coding agents do the recall themselves`,
        `Local-first sync — capsules survive offline`,
        `Export anytime; your data lives in Postgres + pgvector`,
      ],
      related: [
        "use-cases/cross-ai-memory",
        "use-cases/coding-agent-memory",
        "clients/claude-code",
        "clients/cursor",
      ],
    });
  }

  // 4. Alternative / competitor pages
  for (const cmp of competitors) {
    pushItem(out, {
      slug: `alternatives/${cmp.slug}`,
      title: `dropdat vs ${cmp.name} — open-source AI memory alternative`,
      description: `Looking for a ${cmp.name} alternative? dropdat is free, open-source, MCP-native, and works across ChatGPT, Claude, Gemini plus Claude Code, Cursor, Cline, Claude Desktop.`,
      category: "alternative",
      keywords: [
        `${cmp.slug} alternative`,
        `${cmp.slug} vs dropdat`,
        `open source ${cmp.slug}`,
        `${cmp.name} alternative`,
      ],
      h1: `The open-source ${cmp.name} alternative`,
      intro: `${cmp.name} solves a slice of AI memory. dropdat covers the same slice plus cross-provider capture (ChatGPT, Claude, Gemini), an MCP server for every coding agent, and a browser extension — all open-source and free for personal use.`,
      bullets: [
        `Free tier covers personal use; no per-seat pricing`,
        `MCP server published on npm as @dropdat/mcp`,
        `Browser extension captures from six AI providers`,
        `Hybrid semantic + keyword search out of the box`,
        `Your data, your Postgres — export at any time`,
      ],
      related: [
        "use-cases/coding-agent-memory",
        "use-cases/cross-ai-memory",
        "clients/claude-code",
        "clients/cursor",
      ],
    });
  }

  // 5. Integration pages — "dropdat for <tool>"
  for (const i of integrations) {
    pushItem(out, {
      slug: `integrations/${i.slug}`,
      title: `dropdat for ${i.name} — AI memory you can reach from ${i.name}`,
      description: `Connect dropdat capsules to your ${i.name} workflow. Capture AI conversations, recall them where your work already lives.`,
      category: "integration",
      keywords: [
        `${i.slug} ai memory`,
        `${i.slug} dropdat`,
        `${i.name} chatgpt memory`,
        `${i.name} claude memory`,
      ],
      h1: `dropdat × ${i.name}`,
      intro: `Capture AI conversations into dropdat capsules; recall them from any MCP-capable agent embedded in ${i.name}. The capsule library is shared across every dropdat surface — extension, MCP server, and dashboard.`,
      bullets: [
        `Same capsules, reachable from ${i.name}-side tools`,
        `MCP-native — works wherever your ${i.name} workflow runs`,
        `Semantic recall finds relevant capsules in seconds`,
        `Open API for custom ${i.name} automations`,
      ],
      related: [
        "use-cases/cross-ai-memory",
        "use-cases/coding-agent-memory",
        "clients/claude-code",
        "clients/cursor",
      ],
    });
  }

  // 6. solutions/<client>-for-<language>
  for (const c of clients) {
    for (const l of languages) {
      pushItem(out, {
        slug: `solutions/${c.slug}-for-${l.slug}`,
        title: `${c.name} memory for ${l.name} developers — dropdat MCP`,
        description: `Give ${c.name} long-term memory for your ${l.name} projects. Save sessions as capsules, recall by meaning, share with other AI clients.`,
        category: "solution",
        keywords: [
          `${c.slug} ${l.slug}`,
          `${c.name} ${l.name}`,
          `${c.slug} memory ${l.slug}`,
          `${l.slug} ai memory`,
        ],
        h1: `${c.name} memory for ${l.name} developers`,
        intro: `Working in ${l.name} with ${c.name}? Sessions vanish on /clear. dropdat captures the transcript, embeds it, and serves it back via MCP so the next ${c.name} run picks up where the last left off — across your whole ${l.name} project.`,
        bullets: [
          `Five MCP tools, ${l.name}-friendly examples`,
          `Capsules survive editor restarts and context clears`,
          `Recall by meaning, not just keyword match`,
          `Works alongside ${c.name}'s native ${l.name} features`,
        ],
        related: [
          `clients/${c.slug}`,
          "use-cases/coding-agent-memory",
          "use-cases/session-recovery",
        ],
      });
    }
  }

  // 7. guides/<client>-<use-case>
  for (const c of clients) {
    for (const u of useCases) {
      pushItem(out, {
        slug: `guides/${c.slug}-${u.slug}`,
        title: `${u.name} in ${c.name} — step-by-step dropdat guide`,
        description: `How to set up ${u.name.toLowerCase()} in ${c.name} using the dropdat MCP server. Install, configure, verify, and use in under five minutes.`,
        category: "guide",
        keywords: [
          `${c.slug} ${u.slug}`,
          `${c.name} ${u.name}`,
          `${c.slug} ${u.slug} guide`,
          `${u.slug} ${c.slug} tutorial`,
        ],
        h1: `${u.name} in ${c.name}`,
        intro: `This guide wires the dropdat MCP server into ${c.name} and walks through ${u.name.toLowerCase()} end-to-end — install, configure, verify with /mcp, and start using the five dropdat tools.`,
        bullets: [
          `Install @dropdat/mcp via npx or global npm install`,
          `Configure ${c.name} with the dropdat MCP server`,
          `Issue a dropdat API key (capsule.dropdat.app/api-keys)`,
          `Verify the connection inside ${c.name}`,
          `Use ${u.name.toLowerCase()} in your daily workflow`,
        ],
        related: [
          `clients/${c.slug}`,
          `use-cases/${u.slug}`,
          "use-cases/coding-agent-memory",
        ],
      });
    }
  }

  // 8. compare/dropdat-vs-<competitor>
  for (const cmp of competitors) {
    pushItem(out, {
      slug: `compare/dropdat-vs-${cmp.slug}`,
      title: `dropdat vs ${cmp.name} — feature comparison & switching guide`,
      description: `Side-by-side comparison of dropdat and ${cmp.name}. Pricing, supported AI providers, MCP support, semantic recall, data ownership.`,
      category: "compare",
      keywords: [
        `dropdat vs ${cmp.slug}`,
        `${cmp.slug} comparison`,
        `${cmp.name} alternative`,
        `${cmp.slug} pricing`,
      ],
      h1: `dropdat vs ${cmp.name}`,
      intro: `Both tools tackle AI memory, but the surface area differs. dropdat ships an MCP server, a browser extension that captures from six AI providers, and a hosted dashboard — all free for personal use and open-source where it counts.`,
      bullets: [
        `Free for personal use vs ${cmp.name}'s pricing`,
        `MCP server on npm vs ${cmp.name}'s SDK shape`,
        `Captures from ChatGPT, Claude, Gemini, Grok, Copilot, Perplexity`,
        `Hybrid semantic + BM25 search via pgvector`,
        `Your Postgres, exportable at any time`,
      ],
      related: [
        `alternatives/${cmp.slug}`,
        "use-cases/coding-agent-memory",
        "clients/claude-code",
      ],
    });
  }

  cachedItems = out;
  cachedBySlug = new Map(out.map((i) => [i.slug, i]));
  return out;
}

export function getProgrammaticItemBySlug(
  slug: string,
): ProgrammaticItem | undefined {
  if (!cachedBySlug) getAllProgrammaticItems();
  return cachedBySlug!.get(slug);
}

export function getAllProgrammaticSlugs(): string[] {
  return getAllProgrammaticItems().map((i) => i.slug);
}

export function getItemsByCategory(
  category: ProgrammaticItem["category"],
): ProgrammaticItem[] {
  return getAllProgrammaticItems().filter((i) => i.category === category);
}

export { cap };
