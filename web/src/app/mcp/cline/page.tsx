import type { Metadata } from "next";
import { ClientLanding } from "@/components/seo/ClientLanding";

export const metadata: Metadata = {
  title: "Cline MCP server — persistent memory for autonomous coding agents",
  description:
    "Give Cline (the VS Code autonomous coding agent) long-term memory and semantic recall with the @dropdat/mcp server. Free, open-source, npm-installable.",
  alternates: { canonical: "/mcp/cline" },
  openGraph: {
    title: "Cline MCP server — dropdat",
    description:
      "Persistent, cross-session memory for the Cline VS Code agent. Install via npx @dropdat/mcp.",
    url: "https://dropdat.app/mcp/cline",
    type: "article",
  },
  keywords: [
    "Cline MCP",
    "Cline MCP server",
    "Cline memory",
    "Cline VS Code agent",
    "Cline long-term memory",
    "Cline dropdat",
    "Cline mcp_settings.json",
  ],
};

export default function Page() {
  return (
    <ClientLanding
      clientName="Cline"
      slug="cline"
      clientBlurb="Cline's autonomous loops burn through context fast — a dropdat capsule per task makes the next run pick up where this one stopped."
      configLocation="VS Code → Cline settings → MCP Servers → cline_mcp_settings.json"
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
      verifyHint="In Cline's MCP panel the dropdat server shows five tools. Ask Cline 'Search dropdat for last week's deploy postmortem.'"
      useCases={[
        "“Before clearing context, save this autonomous run as a dropdat capsule.”",
        "“Recall any prior dropdat capsule about migration 0042.”",
        "“List all capsules tagged ‘perf’ from the last 30 days.”",
        "“Read capsule abc and resume the refactor where you left off.”",
      ]}
    />
  );
}
