/**
 * Internal linking helpers for SEO.
 *
 * - getRelatedLinks: surfaces semantically related slugs for a page
 * - getBreadcrumbs: builds breadcrumb items from a URL path
 */

import {
  clients,
  competitors,
  getAllProgrammaticItems,
  integrations,
  providers,
  useCases,
} from "./programmaticData";

export interface InternalLink {
  href: string;
  text: string;
  title?: string;
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

/** Static hub pages always available for cross-linking. */
export const hubLinks: InternalLink[] = [
  { href: "/", text: "Home" },
  { href: "/mcp", text: "MCP server" },
  { href: "/faq", text: "FAQ" },
  { href: "/use-cases/cross-ai-memory", text: "Cross-AI memory" },
  { href: "/use-cases/coding-agent-memory", text: "Coding agent memory" },
  { href: "/mcp/claude-code", text: "Claude Code MCP" },
  { href: "/mcp/cursor", text: "Cursor MCP" },
  { href: "/mcp/cline", text: "Cline MCP" },
  { href: "/mcp/claude-desktop", text: "Claude Desktop MCP" },
];

/** Index of every programmatic page, sliced by category for browse pages. */
export function getHubByCategory() {
  const all = getAllProgrammaticItems();
  return {
    clients: all.filter((i) => i.category === "client"),
    providers: all.filter((i) => i.category === "provider"),
    useCases: all.filter((i) => i.category === "use-case"),
    alternatives: all.filter((i) => i.category === "alternative"),
    integrations: all.filter((i) => i.category === "integration"),
    solutions: all.filter((i) => i.category === "solution"),
    guides: all.filter((i) => i.category === "guide"),
    compare: all.filter((i) => i.category === "compare"),
  };
}

export function getRelatedLinks(
  slug: string,
  limit = 6,
): InternalLink[] {
  const all = getAllProgrammaticItems();
  const item = all.find((i) => i.slug === slug);
  if (!item) return [];

  // 1. Author-specified related first
  const seen = new Set<string>([slug]);
  const out: InternalLink[] = [];
  for (const rel of item.related) {
    if (seen.has(rel)) continue;
    const r = all.find((i) => i.slug === rel);
    if (r) {
      out.push({ href: `/seo/${r.slug}`, text: r.h1, title: r.title });
      seen.add(rel);
    }
  }

  // 2. Same-category fill
  for (const sib of all) {
    if (out.length >= limit) break;
    if (seen.has(sib.slug)) continue;
    if (sib.category !== item.category) continue;
    out.push({ href: `/seo/${sib.slug}`, text: sib.h1, title: sib.title });
    seen.add(sib.slug);
  }

  // 3. Adjacent-category fill (clients ↔ use-cases ↔ guides etc.)
  for (const any of all) {
    if (out.length >= limit) break;
    if (seen.has(any.slug)) continue;
    out.push({ href: `/seo/${any.slug}`, text: any.h1, title: any.title });
    seen.add(any.slug);
  }

  return out.slice(0, limit);
}

export function getBreadcrumbs(path: string): BreadcrumbItem[] {
  const parts = path.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ name: "Home", href: "/" }];
  let acc = "";
  for (const p of parts) {
    acc += `/${p}`;
    const pretty = p
      .replace(/-/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
    items.push({ name: pretty, href: acc });
  }
  return items;
}

/** Top-level navigable directories for sitemap + footer mega-menus. */
export const directoryIndex = {
  clients: clients.map((c) => ({
    href: `/seo/clients/${c.slug}`,
    text: c.name,
  })),
  providers: providers.map((p) => ({
    href: `/seo/providers/${p.slug}-memory`,
    text: `${p.name} memory`,
  })),
  useCases: useCases.map((u) => ({
    href: `/seo/use-cases/${u.slug}`,
    text: u.name,
  })),
  alternatives: competitors.map((c) => ({
    href: `/seo/alternatives/${c.slug}`,
    text: `${c.name} alternative`,
  })),
  integrations: integrations.map((i) => ({
    href: `/seo/integrations/${i.slug}`,
    text: i.name,
  })),
};
