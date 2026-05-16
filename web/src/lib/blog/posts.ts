// Seed blog posts. Each post is a long-form question-shaped article aimed at
// search queries that programmatic pages tend to miss (head-of-tail informational
// queries). Body uses lightweight Markdown-ish blocks rendered by the post page.

export type PostSection =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "code"; lang?: string; code: string }
  | { kind: "cta"; href: string; label: string };

export type Post = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingMinutes: number;
  tags: string[];
  related: string[]; // other post slugs OR internal route paths
  body: PostSection[];
};

export const POSTS: Post[] = [
  {
    slug: "mem0-alternative",
    title: "Looking for a mem0 alternative? Here's how dropdat compares",
    description:
      "mem0 stores facts for a single agent. dropdat captures whole AI conversations as portable capsules you can drop into ChatGPT, Claude, Cursor, Claude Code — and recall via MCP. Side-by-side comparison.",
    keywords: [
      "mem0 alternative",
      "mem0 vs",
      "ai memory",
      "portable ai memory",
      "mcp memory server",
      "open source ai memory",
    ],
    publishedAt: "2026-05-16",
    readingMinutes: 8,
    tags: ["comparison", "memory"],
    related: ["chatgpt-memory-export", "cursor-mcp-memory", "/mcp", "/use-cases/cross-ai-memory"],
    body: [
      {
        kind: "p",
        text: "If you searched for a mem0 alternative, you probably ran into the same wall most people hit: mem0 stores extracted facts for a single agent runtime. The moment you switch from Cursor to Claude Code, from ChatGPT to Claude, from one project to another, the memory doesn't follow.",
      },
      {
        kind: "p",
        text: "dropdat solves a different shape of the problem. Instead of extracting facts and replaying them inside one agent, it captures whole conversations as portable capsules and exposes them to every AI you use — through a browser extension on the web side and an MCP server on the coding-agent side.",
      },
      { kind: "h2", text: "What dropdat does that mem0 doesn't" },
      {
        kind: "ul",
        items: [
          "Capture the full transcript from ChatGPT, Claude, Gemini, Grok, Copilot, or Perplexity in one click.",
          "Drop that transcript into any other provider — Claude in the morning, ChatGPT at night, Gemini for a long-context task.",
          "Recall capsules from Claude Code, Cursor, Cline, Claude Desktop via the open-source MCP server (npx @dropdat/mcp).",
          "Hybrid search (semantic + keyword) across your full capsule library, not just extracted facts.",
          "Versioned capsules — edit a captured chat and keep the lineage.",
        ],
      },
      { kind: "h2", text: "When mem0 is the right fit" },
      {
        kind: "p",
        text: "If you're building a single LLM application and want a memory layer that extracts facts, embeds them, and replays them at inference time, mem0 is purpose-built for that. It's a library you embed in your own app.",
      },
      { kind: "h2", text: "When dropdat is the right fit" },
      {
        kind: "p",
        text: "If you, the human, work across multiple AI products every day and you keep losing context when you switch — dropdat is built for that. It's a product, not a library. You install the Chrome extension, capture chats with one click, and they're available everywhere.",
      },
      { kind: "h3", text: "A concrete example" },
      {
        kind: "p",
        text: "You debug an issue with Claude. You open Cursor an hour later to fix it. Without dropdat, you re-paste the context. With dropdat, Cursor's MCP-backed agent can recall the Claude conversation directly: `Use dropdat_recall to find the discussion about the migration error from earlier today.`",
      },
      { kind: "h2", text: "Side-by-side" },
      {
        kind: "ul",
        items: [
          "Storage unit — mem0: extracted facts. dropdat: whole conversation capsules.",
          "Audience — mem0: developers embedding memory in their app. dropdat: end users working across AI products.",
          "Capture surface — mem0: API call from inside your agent. dropdat: one-click browser button on the AI provider's UI.",
          "Recall surface — mem0: your own agent. dropdat: any MCP-capable client + a paste-into-composer flow on the web.",
          "Sharing — dropdat ships a public-link share on the Ultimate plan; mem0 stays inside your stack.",
        ],
      },
      { kind: "h2", text: "Try it" },
      {
        kind: "p",
        text: "The fastest way to evaluate: install the extension, capture two or three chats from ChatGPT and Claude, then point Claude Code or Cursor at the dropdat MCP server. You'll feel the difference in 10 minutes.",
      },
      { kind: "cta", href: "https://capsule.dropdat.app/library", label: "Try dropdat free" },
    ],
  },
  {
    slug: "cursor-mcp-memory",
    title: "How to give Cursor real memory with an MCP server",
    description:
      "Cursor doesn't remember anything between sessions. Wire up the dropdat MCP server and Cursor can recall every ChatGPT, Claude, and Gemini chat you've captured. Setup walkthrough + example prompts.",
    keywords: [
      "cursor mcp memory",
      "cursor memory",
      "cursor mcp server",
      "cursor remember context",
      "mcp memory cursor",
      "cursor ai memory",
    ],
    publishedAt: "2026-05-16",
    readingMinutes: 6,
    tags: ["cursor", "mcp"],
    related: ["mem0-alternative", "chatgpt-memory-export", "/mcp/cursor", "/use-cases/coding-agent-memory"],
    body: [
      {
        kind: "p",
        text: "Cursor is fantastic at the edit-and-explain loop, but the agent forgets everything between sessions. You can paste the same project context into chat ten times a day and still rediscover the same gotchas tomorrow.",
      },
      {
        kind: "p",
        text: "The fix is small and concrete: give Cursor an MCP server that owns your long-term memory. dropdat's MCP server lets Cursor read any capsule you've captured from any AI app — across all your projects.",
      },
      { kind: "h2", text: "What you get" },
      {
        kind: "ul",
        items: [
          "dropdat_recall — keyword search over every capsule you've saved.",
          "dropdat_read — pull a specific capsule's full contents into the model's context.",
          "dropdat_list — browse recent capsules by tag.",
          "dropdat_capsule — let the agent save the current conversation back to your library.",
        ],
      },
      { kind: "h2", text: "Setup (60 seconds)" },
      {
        kind: "ol",
        items: [
          "Install the dropdat browser extension and capture at least one chat.",
          "Generate an API key at dropdat.app/api-keys (`dk_live_…`).",
          "In Cursor, open MCP settings and add the dropdat server.",
        ],
      },
      {
        kind: "code",
        lang: "json",
        code: `{
  "mcpServers": {
    "dropdat": {
      "command": "npx",
      "args": ["-y", "@dropdat/mcp"],
      "env": { "DROPDAT_API_KEY": "dk_live_…" }
    }
  }
}`,
      },
      { kind: "h2", text: "Example prompts" },
      {
        kind: "ul",
        items: [
          "“Use dropdat_recall to find the migration discussion from yesterday and apply it to api/internal/db.”",
          "“List my recent capsules tagged 'auth' and summarize the open questions.”",
          "“Pull the full Claude chat about the rate-limit bug — read it with dropdat_read and propose a fix.”",
        ],
      },
      { kind: "h2", text: "Why this works better than @-mentioning files" },
      {
        kind: "p",
        text: "File context tells Cursor *what* the code is. Capsule recall tells Cursor *what you and another AI already decided*. That's a much higher-signal slice of context — and it's the part that usually lives in a Slack message or a ChatGPT tab you closed three days ago.",
      },
      { kind: "cta", href: "/mcp/cursor", label: "See the Cursor setup page" },
    ],
  },
  {
    slug: "chatgpt-memory-export",
    title: "How to export ChatGPT memory (and why you probably want capsules instead)",
    description:
      "ChatGPT's built-in memory is a black box and a one-way street. Here's what you can actually export, what you can't, and why capturing whole chats as capsules is the more useful unit.",
    keywords: [
      "chatgpt memory export",
      "export chatgpt memory",
      "chatgpt memory",
      "chatgpt save conversation",
      "chatgpt context export",
      "chatgpt memory limit",
    ],
    publishedAt: "2026-05-16",
    readingMinutes: 7,
    tags: ["chatgpt", "memory"],
    related: ["mem0-alternative", "cursor-mcp-memory", "/use-cases/cross-ai-memory"],
    body: [
      {
        kind: "p",
        text: "ChatGPT shows you a Memory panel in Settings. You can read entries, delete them, and toggle the whole feature off. What you can't do is export the memory programmatically, sync it across accounts, or hand it to a different model.",
      },
      { kind: "h2", text: "What you can actually export from ChatGPT today" },
      {
        kind: "ul",
        items: [
          "A bulk data export request — emails you a ZIP of all your conversations as JSON within 24 hours. Includes message text but not the inferred 'memory' entries shown in the UI.",
          "Per-chat sharing links — read-only HTML, no structured access.",
          "Manual copy-paste from individual messages.",
        ],
      },
      { kind: "h2", text: "What you can't" },
      {
        kind: "ul",
        items: [
          "Export the bullet-list 'Memory' entries the UI shows — those stay inside OpenAI's system.",
          "Move memory to Claude, Gemini, or any other provider.",
          "Search across all your past chats from outside the ChatGPT web UI.",
        ],
      },
      { kind: "h2", text: "The capsule approach" },
      {
        kind: "p",
        text: "Instead of relying on ChatGPT's inferred memory, capture each chat that matters as a capsule the moment you close it. Capsules are: portable across providers, searchable from outside the AI app, recallable by MCP-aware coding agents, and shareable as public read-only URLs (Ultimate plan).",
      },
      { kind: "h3", text: "Workflow that works" },
      {
        kind: "ol",
        items: [
          "Browser extension installed — capture chat with one click.",
          "Tag the capsule (project, topic) — five seconds.",
          "Tomorrow, recall it from Claude, Cursor, or Claude Code via dropdat_recall.",
        ],
      },
      { kind: "h2", text: "But what about the data export I already have?" },
      {
        kind: "p",
        text: "You can backfill old ChatGPT conversations into dropdat by opening each one in the web UI and clicking the capsule button. The browser extension only sees the live DOM, so the export ZIP itself isn't a one-shot importer (yet) — but every chat you actively re-open becomes a permanent, portable capsule.",
      },
      { kind: "cta", href: "https://chromewebstore.google.com/detail/pfcnjelpgccnkagaekhdcddpfacighho", label: "Get the extension" },
    ],
  },
  {
    slug: "cross-ai-memory-deep-dive",
    title: "Cross-AI memory: a practical pattern for switching between ChatGPT, Claude, and Gemini",
    description:
      "Most knowledge workers use 3+ AI products a day. Here's a concrete capture/recall pattern that stops you re-pasting the same context every time you switch.",
    keywords: [
      "cross ai memory",
      "share context between ai",
      "ai context switching",
      "chatgpt to claude memory",
      "ai conversation portability",
      "ai memory across providers",
    ],
    publishedAt: "2026-05-16",
    readingMinutes: 9,
    tags: ["memory", "workflow"],
    related: ["mem0-alternative", "chatgpt-memory-export", "/use-cases/cross-ai-memory"],
    body: [
      {
        kind: "p",
        text: "Pick a random hour in your workday and count the AI tabs open. Most people land on three or four: ChatGPT for the broad brainstorm, Claude for the careful reasoning, Gemini for long-context document work, and a coding agent like Cursor or Claude Code in the editor. None of them know what the others did.",
      },
      { kind: "h2", text: "The capture-recall pattern" },
      {
        kind: "p",
        text: "The fix is a discipline more than a feature: capture every chat that produced a useful decision, recall it the moment another tool would benefit. Two rules.",
      },
      {
        kind: "ol",
        items: [
          "Capture immediately. The moment you finish a chat that matters, hit the capsule button before closing the tab. Five-second habit.",
          "Recall by intent, not by source. Don't think 'where was that Claude chat?' — think 'I need the rate-limit discussion'. Hybrid search finds it across every provider.",
        ],
      },
      { kind: "h2", text: "What 'matters' means" },
      {
        kind: "ul",
        items: [
          "A decision you'll need to defend later (architecture, tradeoffs, deprecation reasoning).",
          "A debugging session that surfaced a non-obvious root cause.",
          "A first-pass design you'll iterate on across multiple sessions.",
          "Any chat over ~10 turns — the cost of re-creating that context is high.",
        ],
      },
      { kind: "h2", text: "Concrete daily example" },
      {
        kind: "quote",
        text: "Morning: brainstorm new endpoint with ChatGPT → capture. Midday: implement in Cursor → Cursor's agent uses dropdat_recall to pull the morning's chat. Evening: write up the change for the team → Claude reads the capsule, drafts the PR description.",
      },
      { kind: "h2", text: "What stops working without this" },
      {
        kind: "p",
        text: "Without a capture-recall loop, every context switch costs you the same five minutes of re-explaining. Across a day that's an hour of slow tax you don't notice. Across a quarter you've lost a week.",
      },
      { kind: "h2", text: "Tools you need" },
      {
        kind: "ul",
        items: [
          "Browser extension that captures the live DOM of ChatGPT / Claude / Gemini / Grok / Copilot / Perplexity.",
          "Tagging that takes one keystroke (not a modal).",
          "Hybrid search — keyword to find the exact phrase, semantic to find the topic when you've forgotten the phrase.",
          "MCP server so your coding agents can read the same library the browser writes to.",
        ],
      },
      {
        kind: "p",
        text: "dropdat ships all four. Install the extension, capture three chats today, and tomorrow ask Claude Code to recall one. Once you feel that work, the habit takes care of itself.",
      },
      { kind: "cta", href: "https://capsule.dropdat.app/library", label: "Start a capsule library" },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
