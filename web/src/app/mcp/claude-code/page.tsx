import type { Metadata } from "next";
import { ClientLanding } from "@/components/seo/ClientLanding";

export const metadata: Metadata = {
  title: "Claude Code MCP server — cross-session memory & semantic recall",
  description:
    "Add long-term, semantic memory to Claude Code with the open-source @dropdat/mcp server. One-liner install. Recall past conversations, save the current one, share context with Cursor, Cline, Claude Desktop.",
  alternates: { canonical: "/mcp/claude-code" },
  openGraph: {
    title: "Claude Code MCP server — dropdat",
    description:
      "One-liner install. Long-term memory and semantic recall for Anthropic's terminal coding agent.",
    url: "https://dropdat.app/mcp/claude-code",
    type: "article",
  },
  keywords: [
    "Claude Code MCP",
    "Claude Code memory",
    "claude mcp add",
    "Claude Code semantic recall",
    "MCP server Claude Code",
    "Anthropic Claude Code memory",
    "Claude Code dropdat",
  ],
};

export default function Page() {
  return (
    <ClientLanding
      clientName="Claude Code"
      slug="claude-code"
      clientBlurb="Built for Anthropic's terminal coding agent — works from any project directory and survives across sessions."
      configLocation="~/.claude/mcp.json (or project .mcp.json)"
      installSnippet={`claude mcp add dropdat \\
  --env DROPDAT_API_KEY=dk_live_xxx \\
  --env DROPDAT_API_BASE=https://api.dropdat.app \\
  -- npx -y @dropdat/mcp`}
      configSnippet={`{
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
      verifyHint="Run /mcp inside Claude Code — the dropdat server appears with all five tools (dropdat_recall, dropdat_read, dropdat_list, dropdat_capsule, dropdat_autocapsule)."
      useCases={[
        "“Recall what we decided about the auth migration last week.”",
        "“Save this entire session as a capsule titled ‘billing refactor’.”",
        "“List recent dropdat capsules tagged ‘incident’.”",
        "“Read capsule abc123 in full and continue from there.”",
        "“Capture every message verbatim with dropdat_autocapsule before I /clear.”",
      ]}
    />
  );
}
