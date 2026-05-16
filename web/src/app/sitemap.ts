import type { MetadataRoute } from "next";
import { getAllProgrammaticItems } from "@/lib/seo/programmaticData";

export const dynamic = "force-static";

const SITE = "https://dropdat.app";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/mcp", changeFrequency: "weekly", priority: 0.95 },
  { path: "/mcp/claude-code", changeFrequency: "weekly", priority: 0.9 },
  { path: "/mcp/cursor", changeFrequency: "weekly", priority: 0.9 },
  { path: "/mcp/cline", changeFrequency: "weekly", priority: 0.9 },
  { path: "/mcp/claude-desktop", changeFrequency: "weekly", priority: 0.9 },
  { path: "/use-cases/cross-ai-memory", changeFrequency: "monthly", priority: 0.85 },
  { path: "/use-cases/coding-agent-memory", changeFrequency: "monthly", priority: 0.85 },
  { path: "/seo", changeFrequency: "weekly", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.8 },
  { path: "/support", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const items = getAllProgrammaticItems();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const programmaticEntries: MetadataRoute.Sitemap = items.map((it) => ({
    url: `${SITE}/seo/${it.slug}`,
    lastModified: new Date(it.updatedAt),
    changeFrequency:
      it.category === "client" || it.category === "use-case"
        ? "weekly"
        : "monthly",
    priority:
      it.category === "client"
        ? 0.8
        : it.category === "use-case" || it.category === "alternative"
        ? 0.75
        : it.category === "provider" || it.category === "integration"
        ? 0.7
        : it.category === "compare"
        ? 0.65
        : 0.55,
  }));

  return [...staticEntries, ...programmaticEntries];
}
