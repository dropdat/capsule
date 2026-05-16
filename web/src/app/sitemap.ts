import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE = "https://dropdat.app";

const routes = [
  "",
  "/mcp",
  "/mcp/claude-code",
  "/mcp/cursor",
  "/mcp/cline",
  "/mcp/claude-desktop",
  "/use-cases/cross-ai-memory",
  "/use-cases/coding-agent-memory",
  "/faq",
  "/support",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/mcp" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/mcp" ? 0.9 : 0.7,
  }));
}
