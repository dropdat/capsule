import type { Metadata } from "next";
import { ClientLanding } from "@/components/seo/ClientLanding";

export const metadata: Metadata = {
  title: "Cursor MCP server — long-term memory for the AI editor",
  description:
    "Wire the open-source @dropdat/mcp server into Cursor and give every chat semantic recall across sessions. Free, local-first, works across ChatGPT, Claude, Gemini conversations too.",
  alternates: { canonical: "/mcp/cursor" },
  openGraph: {
    title: "Cursor MCP server — dropdat",
    description:
      "Long-term, cross-AI memory inside Cursor. Install in a minute via npx @dropdat/mcp.",
    url: "https://dropdat.app/mcp/cursor",
    type: "article",
  },
  keywords: [
    "Cursor MCP",
    "Cursor MCP server",
    "Cursor memory",
    "Cursor semantic search",
    "Cursor long-term memory",
    "Cursor mcp.json",
    "Cursor AI editor memory",
  ],
};

export default function Page() {
  return (
    <ClientLanding
      clientName="Cursor"
      slug="cursor"
      clientBlurb="Cursor's native MCP support means a single config block gives the editor memory across every session and project."
      configLocation="~/.cursor/mcp.json (or Settings → MCP → Add server)"
      installSnippet={`# zero-install
npx -y @dropdat/mcp

# or pin globally
npm install -g @dropdat/mcp`}
      configSnippet={`{
  "mcpServers": {
    "dropdat": {
      "command": "npx",
      "args": ["-y", "@dropdat/mcp"],
      "env": {
        "DROPDAT_API_KEY": "dk_live_xxx",
        "DROPDAT_API_BASE": "https://dropdat.app"
      }
    }
  }
}`}
      verifyHint="Open Cursor settings → MCP. The dropdat server lists five tools. Ask the chat 'Search dropdat for last week's API design notes.'"
      useCases={[
        "“Find the dropdat capsule where we sketched the payment webhook flow.”",
        "“Save the last 50 messages of this Cursor session as a capsule.”",
        "“What did the ChatGPT conversation about Postgres indexes recommend? Check dropdat.”",
        "“Continue from capsule xyz789 — load its full contents into context.”",
      ]}
    />
  );
}
