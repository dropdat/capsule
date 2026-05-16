import type { Metadata } from "next";
import { ClientLanding } from "@/components/seo/ClientLanding";

export const metadata: Metadata = {
  title: "Claude Desktop MCP server — long-term memory for Anthropic's app",
  description:
    "Wire @dropdat/mcp into Claude Desktop (Mac & Windows) for cross-session memory and semantic recall. Share the same capsule library with Claude Code, Cursor, Cline.",
  alternates: { canonical: "/mcp/claude-desktop" },
  openGraph: {
    title: "Claude Desktop MCP server — dropdat",
    description:
      "Long-term memory for Anthropic's Mac & Windows app via @dropdat/mcp.",
    url: "https://dropdat.app/mcp/claude-desktop",
    type: "article",
  },
  keywords: [
    "Claude Desktop MCP",
    "Claude Desktop memory",
    "Claude Desktop MCP server",
    "claude_desktop_config.json",
    "Claude Mac app memory",
    "Claude Desktop long-term memory",
  ],
};

export default function Page() {
  return (
    <ClientLanding
      clientName="Claude Desktop"
      slug="claude-desktop"
      clientBlurb="Anthropic's chat app supports MCP via a single JSON config file. Drop dropdat in once and every Desktop conversation can recall your capsules."
      configLocation="~/Library/Application Support/Claude/claude_desktop_config.json (macOS) or %APPDATA%/Claude/claude_desktop_config.json (Windows)"
      installSnippet={`# Claude Desktop launches the server itself via npx — no manual install needed.
# Optionally pin a global copy:
npm install -g @dropdat/mcp`}
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
      verifyHint="Restart Claude Desktop. Click the hammer icon in the chat input — the dropdat tools (recall, read, list, capsule, autocapsule) appear in the list."
      useCases={[
        "“Recall the dropdat capsule from my ChatGPT session about React Server Components.”",
        "“Save this Claude Desktop chat as a capsule named ‘onboarding plan’.”",
        "“List my last 10 dropdat capsules.”",
        "“Read capsule abc123 and continue the discussion.”",
      ]}
    />
  );
}
