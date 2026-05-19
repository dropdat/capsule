"use client";

import Link from "next/link";
import { useConsoleLocale } from "@/i18n/consoleLocale";

type Section = {
  id: string;
  steps: string[];
  links?: { href: string; label: string }[];
  planKey?: "proAndAbove" | "premiumAndAbove" | "ultimateOnly";
};

// Section structure + steps stay in English. Titles, summaries and plan badges
// are pulled from the active dictionary at render time. Steps are intentionally
// not translated for now — they reference product nouns that change often.
const SECTIONS: Section[] = [
  {
    id: "library",
    steps: [
      "Open Library to see all your capsules sorted by recency.",
      "Type in the search box to full-text filter by title or message text.",
      "Click a capsule to open its detail page — view messages, edit title/tags, copy contents.",
    ],
    links: [{ href: "/library", label: "Open Library" }],
  },
  {
    id: "capture",
    steps: [
      "Install the dropdat extension from the Chrome Web Store.",
      "Sign in once — the extension shares your dashboard session.",
      "On any supported chat (ChatGPT, Claude, Gemini), open the dropdat panel and click Capture.",
      "The capsule appears in Library immediately, with title + summary auto-extracted.",
    ],
  },
  {
    id: "drop",
    steps: [
      "Open a capsule, click Copy as context.",
      "Switch to the destination AI (ChatGPT → Claude, Gemini → ChatGPT, etc.).",
      "Paste. The capsule is formatted as a markdown block — the AI picks up the thread.",
    ],
  },
  {
    id: "versioning",
    steps: [
      "On any capsule, click Edit → make changes → Save creates a new version.",
      "The capsule keeps a rootId + parentId chain so you can trace every fork.",
      "Open the version history menu to jump between revisions.",
    ],
    planKey: "proAndAbove",
  },
  {
    id: "mobile",
    steps: [
      "Android: visit dropdat.app on Chrome and tap Install app. Once installed, the system share-sheet shows dropdat as a target — share any page or text and a quick-capture form opens, pre-filled.",
      'iOS: build a Shortcut with the action "Get Contents of URL" POSTing to https://dropdat.app/api/v1/capsules with Authorization: Bearer <your API key>. Body: { id: UUID, title, source: "mobile", messages: [{role:"user", content: <Shortcut input>, capturedAt: now}] }.',
      "Or open /share directly with ?title=&text=&url= params to land on the quick-capture form pre-filled.",
    ],
    links: [{ href: "/share", label: "Open /share" }],
  },
  {
    id: "links",
    steps: [
      "Open Links and paste any URL.",
      "Optionally drop it into a folder for grouping.",
      "Useful for keeping reference material next to the chats that needed it.",
    ],
    links: [{ href: "/links", label: "Open Links" }],
  },
  {
    id: "packs",
    steps: [
      "Open Packs → Create pack with a name and (optional) goal.",
      "From any capsule's detail page, add it to a pack.",
      "Click Autofill related to grow the pack with similar capsules.",
      "Hit Copy as context to get one ready-to-paste markdown block for any AI.",
    ],
    links: [{ href: "/packs", label: "Open Packs" }],
    planKey: "premiumAndAbove",
  },
  {
    id: "graphs",
    steps: [
      "Library graph: every embedded capsule on a chord/arc ring, edges = cosine similarity.",
      "Per-pack graph: capsules inside one pack with their pairwise similarity links.",
      "Packs overlap graph: each pack as a node, arcs weight by shared-capsule Jaccard overlap.",
      "Hover any node to focus on its neighbours; click to open the underlying capsule or pack.",
    ],
    links: [
      { href: "/library/graph", label: "Library graph" },
      { href: "/packs/graph", label: "Packs overlap" },
    ],
    planKey: "ultimateOnly",
  },
  {
    id: "teams",
    steps: [
      "Open Teams → Create team.",
      "Send the join link to teammates (rotate it from the Teams page if needed).",
      "Capsules created inside a team are visible to every member.",
      "Roles: owner / admin / member. Only owners can delete the team.",
    ],
    links: [{ href: "/teams", label: "Open Teams" }],
    planKey: "proAndAbove",
  },
  {
    id: "share",
    steps: [
      "Open any capsule → toggle Share.",
      "Copy the dropdat.app/s/<token> URL — anyone with it can read (not edit) the capsule.",
      "Toggle off to revoke the link instantly.",
    ],
    planKey: "ultimateOnly",
  },
  {
    id: "mcp",
    steps: [
      "Generate an API key under API Keys — pick scopes (capsule.read at minimum).",
      "Point your agent at the dropdat MCP endpoint with your key.",
      "Use tools like dropdat_recall (semantic search) and dropdat_read (fetch a capsule) inside the agent.",
    ],
    links: [{ href: "/api-keys", label: "API Keys" }],
    planKey: "premiumAndAbove",
  },
  {
    id: "api-keys",
    steps: [
      "Open API Keys → Create key.",
      "Pick scopes — only scopes allowed by your tier are selectable.",
      "Copy the key once on creation; we don't show it again.",
      "Revoke any key from the same page when it's no longer needed.",
    ],
    links: [{ href: "/api-keys", label: "Open API Keys" }],
  },
  {
    id: "billing",
    steps: [
      "Open Billing to compare plans side-by-side.",
      "Click Subscribe to start a checkout — payments handled by dodopayments.",
      "Manage invoices and cancellation from the same page.",
      "Synced limits apply immediately after subscription changes.",
    ],
    links: [{ href: "/billing", label: "Open Billing" }],
  },
];

export default function HelpPage() {
  const { dict } = useConsoleLocale();
  const t = dict.console.help;

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">{t.pageTitle}</h1>
        <p className="text-[13.5px] text-muted-foreground max-w-[640px]">
          {t.pageSub}
        </p>
      </header>

      <nav className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">{t.contents}</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-[13px] hover:text-primary">
                · {t.sectionTitles[s.id] ?? s.id}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <article
            key={s.id}
            id={s.id}
            className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3 scroll-mt-24"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-[16px] font-medium">{t.sectionTitles[s.id] ?? s.id}</h2>
              {s.planKey && (
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground border border-border rounded-md px-2 py-0.5">
                  {t.planLabels[s.planKey]}
                </span>
              )}
            </div>
            <p className="text-[13.5px] text-muted-foreground">{t.sectionSummaries[s.id] ?? ""}</p>
            <ol className="flex flex-col gap-1.5 list-decimal pl-5 text-[13.5px]">
              {s.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {s.links && s.links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {s.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-md bg-secondary border border-border px-3 py-1.5 text-[12.5px] hover:bg-card"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-2">
        <h2 className="font-heading text-[14px] font-medium">{t.stillStuck}</h2>
        <p className="text-[13px] text-muted-foreground">
          {t.stillStuckBody}
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          <Link href="/faq" className="rounded-md bg-secondary border border-border px-3 py-1.5 text-[12.5px] hover:bg-card">
            {t.publicFaq} →
          </Link>
          <Link href="/support" className="rounded-md bg-secondary border border-border px-3 py-1.5 text-[12.5px] hover:bg-card">
            {t.support} →
          </Link>
        </div>
      </div>
    </section>
  );
}
