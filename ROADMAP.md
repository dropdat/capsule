# dropdat — Monetization & Product Roadmap

A research-backed plan for turning dropdat from a cross-AI capture tool into a
paid AI memory platform. Living document — update as priorities shift.

---

## 1. Where dropdat sits today

**Product:** one-click capture of any AI chat into a portable **capsule**,
re-droppable into ChatGPT, Claude, Gemini, Copilot, Grok, Perplexity.

**Real moat candidate:** not the capsules themselves (anyone can scrape a
chat) — the *graph between capsules*. Nobody else holds the user's whole
cross-provider corpus, linked.

### Competitive landscape

| Player | Shape | Pricing | Their gap |
|---|---|---|---|
| Mem0 | Memory-as-a-service API | Usage-priced | No end-user UI |
| Letta / MemGPT | Agent memory framework | OSS + cloud | Dev-only |
| Pieces for Developers | Local-first dev context | Freemium → $8–12/mo | Single-machine |
| Rewind / Reflect | Personal memory | $20–30/mo | Single-source capture |
| ChatGPT / Claude / Gemini native memory | Walled per-provider | Bundled | Cannot cross providers |

**Wedge:** the walls between providers. Lean into capture surfaces the
incumbents cannot reach (CLI agents, voice, email, mobile share).

**Threats to watch:** providers shipping cross-device memory sync; Cursor /
Continue rolling their own session memory.

---

## 2. Feature roadmap, ranked by monetization leverage

Tiers: **L1** unlocks the paid plan · **L2** raises retention / ARPU ·
**L3** strategic but secondary.

### A. MCP server for CLI coding agents — **L1**

Refined from the original idea. Expose three distinct MCP tools, not one:

1. `dropdat.recall` — agent queries past capsules mid-session
   ("what did I decide about auth last week?"). This is the day-one wow.
2. `dropdat.capsule` — explicit save tool the model calls when the user
   says *remember this*.
3. `dropdat.autocapsule` — session-end hook emits a capsule + diff summary.
   For Claude Code use a Stop hook; for Cursor / Cline use their session events.

**Why it monetizes:** MCP usage is the natural paid gate. Free = local-only,
N capsules. Pro = cloud sync + unlimited + recall. Team = shared org capsules.

**Build cost:** ~1 week. Go API already exists; MCP server is a thin
stdio/SSE wrapper.

### B. Vector search across capsules — **L1**

README currently lists pgvector as Phase 2. Promote to Phase 1 — it's the
feature that turns the corpus from *archived* into *useful*.

**Stack**
- `pgvector` in existing Postgres (no new infra)
- Embed on write: chunk capsule → `text-embedding-3-small` or Voyage / Cohere
- Hybrid search: BM25 (`tsvector`) + vector cosine, RRF rerank
- Per-user namespace via row-level filter

**Surfaces**
- Dashboard `/library` semantic search bar
- Extension popup quick-search
- MCP `recall` tool (highest leverage)
- API endpoint for power users

**Gate:** vector search = Pro. Free tier = keyword only.

### C. Capsule graph & second-brain links — **L2**

The "connect capsules" idea, with a chosen model rather than free-form.

**Model:** auto-extracted entity + topic edges, manual override.
- On ingest, small Haiku call extracts entities (people, repos, files,
  decisions), topics, and `supersedes` relations.
- Store edges in `capsule_edges (from_id, to_id, kind, weight)`.
- Render force-directed graph in `/library` (react-force-graph).
- "Related capsules" side panel on capsule detail (cheapest UX win).

**Killer feature — context packs:** user picks a goal
("ship the billing migration"); system assembles top-K linked capsules
into one drop-in context block for any AI. *This* is what people pay
$20/month for.

**Gate:** graph + context packs = Pro. Public / shared packs = Team.

### D. Capture-surface expansion — **L2**

Existing surfaces: 6 web providers + extension. Gaps ranked by ROI:

1. **Claude Code / Cursor / Cline / Aider** — via MCP (above). Highest-value users.
2. **Mobile** — iOS Shortcut + Android share-target. No native app required.
3. **Email / Gmail** — SMTP ingest of forwarded mail → capsule.
4. **Voice memos** — Whisper transcription pipeline. Real differentiator.
5. **Firefox / Safari** — table-stakes for prosumer pricing.

### E. Sharing & teams — **L1 for B2B**

- **Shareable capsule links** with read-only public view (Gist-style).
  Free viral channel.
- **Team workspaces** — shared library, RBAC. Per-seat pricing.
- **Capsule comments** — collaboration on AI outputs.

Share links benefit solo users too (showing a teammate a debugging session).
Teams plan is where ARPU jumps from $15 to $25/seat.

### F. Developer / programmatic plane — **L2**

API keys already exist. Lean in:

- Public REST + MCP docs
- Webhooks (`capsule.created`, `capsule.linked`)
- Zapier / n8n / Raycast integrations
- Obsidian + Logseq sync (write capsules as MD into a vault)
- Notion / Linear export

Each integration = one acquisition channel.

### G. Privacy / local-first pitch — **L3 wedge**

- BYO-key for embeddings + LLM-derived metadata
- Self-host bundle (docker-compose already exists — package + sell support)
- E2E encryption: server stores ciphertext, search via client-side
  encrypted embeddings. Hard, but a clear differentiator vs Mem0 / Rewind.

---

## 3. Pricing structure

| Tier | Price | What's in it |
|---|---|---|
| **Free** | $0 | 100 capsules · keyword search · 1 device · local-only extension |
| **Pro** | $12 / mo | Unlimited capsules · vector + graph search · MCP server · all providers · cloud sync · share links |
| **Team** | $20 / seat / mo | Shared workspaces · RBAC · audit log · SSO · priority MCP |
| **Self-host** | $99 / mo or $999 / yr | Single-tenant license · updates · email support |

**Optional developer / API line** (Mem0-style, only if MCP traction is real):
$0.10 per 1k capsule writes · $0.50 per 1k searches.

---

## 4. 8-week execution plan

| Week | Deliverable |
|------|-------------|
| 1–2  | pgvector + hybrid search. Ship to existing users. |
| 3–4  | MCP server (`recall` + `capsule` + `autocapsule`). Launch on r/ClaudeAI, r/cursor, HN. |
| 5    | Capsule graph + related-capsules panel. |
| 6    | Context packs (the demo that sells Pro). |
| 7    | Share links + Stripe + Pro paywall. |
| 8    | Obsidian sync + one more integration. Product Hunt launch. |

**Trio that matters:** vector + MCP + graph. That turns "browser extension"
into "AI memory platform." Everything else is distribution.

---

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Providers ship native cross-device memory | Double down on capture surfaces they cannot reach — CLI agents, voice, email |
| Vector storage / embedding cost at scale | Small embeddings (768d), quantization, archive cold capsules to keyword-only |
| Auto-extracted graph edges are noisy | Ship "low-confidence edge" UX so users curate — doubles as engagement loop |
| MCP spec churn | Pin to current spec, abstract transport behind an interface |

---

## 6. Recommendation

Lead with **MCP + vector recall** — that's the demo that sells the paid tier.
**Graph + context packs** is what retains users past month one. **Sharing +
teams** is what triples ARPU by month six.

Out of scope for this roadmap (revisit later): Stripe billing internals,
pgvector index tuning, MCP transport choice (stdio vs SSE vs HTTP),
self-host license enforcement.
