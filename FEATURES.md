# dropdat — Features

Living index of shipped features. Updated each session when new features land.

## Web (Next.js dashboard + marketing)

- Marketing landing page
- `/mcp` feature page — MCP server + semantic recall walkthrough,
  install steps, supported clients
- Privacy, Terms, Support static pages
- Clerk-powered Sign-in / Sign-up flows
- Authenticated dashboard shell (`(app)` route group)
  - **Library** — browse saved capsules
  - **Capsule** — view / edit a single capsule
  - **Links** — saved link manager
  - **API Keys** — issue & revoke personal API keys
  - **Settings** — account settings
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
- API key issuance & verification
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
- IndexedDB offline storage with later sync
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
- Per-user API keys for programmatic access
