# dropdat — Features

Living index of shipped features. Updated each session when new features land.

## Web (Next.js dashboard + marketing)

- Marketing landing page
- `/mcp` feature page — MCP server + semantic recall walkthrough,
  install steps, supported clients
- `/blog` — long-form posts with JSON-LD Article schema, related-post graph, in sitemap
- Privacy, Terms, Support static pages
- Clerk-powered Sign-in / Sign-up flows
- Authenticated dashboard shell (`(app)` route group)
  - **Library** — browse saved capsules
  - **Capsule** — view / edit a single capsule
  - **Links** — saved link manager
  - **API Keys** — issue & revoke personal API keys (scopes derived from current plan)
  - **Billing** — plan picker (Basic / Pro / Premium / Ultimate + Enterprise contact) with per-feature check/cross matrix, monthly/annual toggle, current-plan + usage card, Cancel-plan + Refresh-from-payment-processor
  - **Teams** — create teams, public join-link with rotate, member roster with owner/admin/member roles, team capsule library, delete team
  - **Settings** — account settings
- Profile menu (sidebar) — shows current plan, status, capsule usage, manage-billing portal link, and "invoices emailed automatically" hint
- Capsule public sharing — Ultimate-tier toggle on any capsule generates a read-only `dropdat.app/s/<token>` URL; lower tiers get an in-app upgrade dialog
- Sidebar pinned (no longer scrolls with content)
- Folder organization for capsules
- Mobile-safe layout (no horizontal overflow)
- Dashboard logo links back to homepage

## API (Go + chi + pgx + sqlc)

- Capsule CRUD with versioning
- Hybrid semantic + keyword search (`POST /capsules/search`) — pgvector
  HNSW cosine + Postgres `tsvector` ranking, fused via RRF
- Auto-embedding of new capsules (and version edits) via OpenAI
  `text-embedding-3-small`; graceful BM25 fallback when key absent
- Backfill command (`make embed-backfill`) for existing capsules
- Folder CRUD (group capsules)
- Link CRUD (saved AI-chat links)
- API key issuance & verification (scoped: `capsules:*`, `mcp`, `attachments`, `dynamic_context`, `versioning`, `teams`)
- Subscription tiers (basic / pro / premium / ultimate / enterprise) backed by dodopayments
  - `GET /billing/subscription` — current tier, status, capsule usage, scopes
  - `POST /billing/checkout` — hosted dodopayments checkout session for a plan
  - `GET /billing/portal` — dodopayments customer portal link
  - `POST /webhooks/dodopayments` — HMAC-verified webhook upserting subscription state from `subscription.active|renewed|cancelled|expired|failed|paused`
- Per-tier capsule limits enforced on create (`402 Payment Required` when exceeded): Basic 5, Pro 15, Premium 50, Ultimate unlimited
- Capsule sharing — `POST /capsules/{id}/share` (Ultimate-gated, `402` otherwise), `DELETE /capsules/{id}/share`, public unauthenticated `GET /public/capsules/share/{token}`
- Teams (paid-plan only, `402` for Basic) — `POST /teams`, `POST /teams/join {token}`, `GET /teams`, `GET /teams/{id}`, `PATCH /teams/{id}`, `DELETE /teams/{id}`, `POST /teams/{id}/rotate-link`, roster `GET/PATCH/DELETE /teams/{id}/members[/{user_id}]`, team library `GET /teams/{id}/capsules` and `/folders`, share capsules/folders via `POST /capsules/{id}/team` and `/folders/{id}/team`
- Clerk JWT auth (JWKS verified server-side)
- DEV_AUTH_BYPASS for local development
- Client-supplied UUIDv7 ids for offline-first sync
- Goose migrations, slog structured logging

## Browser Extension (WXT + React, Chrome MV3)

- One-click capture of AI chat sessions as portable capsules
- Provider content scripts:
  - ChatGPT
  - Claude
  - Gemini
  - Copilot
  - Grok
  - Perplexity
- Save-link feature (capture chat URL without full capsule)
- Popup UI for capsule list / actions
- IndexedDB offline storage with two-way sync (pulls remote capsules so a freshly-installed extension recovers prior captures)
- In-page dialogs:
  - "No chat detected" when the user clicks capsule on an empty page
  - "Capsule saved locally — sync blocked" upgrade dialog when the server returns `402` (plan limit). Capsule stays pending and syncs after upgrade.
- Clerk auth inside extension (`@clerk/chrome-extension`)

## MCP Server (for AI coding agents)

- Stdio MCP server in `mcp/` — wires dropdat into Claude Code, Cursor,
  Cline, Claude Desktop, and any other MCP-capable client
- `dropdat_recall` — keyword search across the user's capsule library
- `dropdat_read` — fetch a capsule's full contents (and optional lineage)
- `dropdat_list` — browse recent capsules with optional tag filter
- `dropdat_capsule` — save the current conversation as a new capsule
- `dropdat_autocapsule` — save the full verbatim Claude Code session by
  reading its `.jsonl` transcript directly (no model context limits)
- Auth via `dk_*` API key (env `DROPDAT_API_KEY`)

## Infrastructure

- Single-VPS deploy via `infra/deploy.sh`
- Caddy reverse proxy with automatic TLS
- Postgres 16 via Docker Compose
- Static export of Next.js served by Caddy
- `/api/*` proxied to Go service on :8080

## Auth & Security

- Clerk authentication across web + extension
- Server-side JWKS verification on API
- Per-user API keys for programmatic access (scopes clamped to subscription tier)
