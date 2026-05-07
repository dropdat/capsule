# dropdat

Cross-AI memory in one click. Browser extension captures any AI chat as a portable
**capsule**. Drop it into ChatGPT, Claude or Gemini to resume the conversation
elsewhere.

## Monorepo layout

```
backend/
├── web/         Next.js — marketing site + dashboard (static export)
├── api/         Go HTTP API — capsule CRUD + versioning + JWT auth
├── extension/   Chrome MV3 extension (WXT + React) — capture & inject
└── infra/      Caddyfile + docker-compose + deploy.sh
```

## Quick start (one terminal each)

```bash
# 1. Postgres
cd infra && docker compose up -d postgres

# 2. API
cd ../api
cp .env.example .env
# edit .env: set DEV_AUTH_BYPASS=1 for local-only, or fill CLERK_JWKS_URL/CLERK_ISSUER
make migrate-up
make run

# 3. Dashboard
cd ../web
cp .env.local.example .env.local
# fill NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (or skip — static pages work without)
npm install
npm run dev      # http://localhost:3000

# 4. Extension
cd ../extension
cp .env.example .env
npm install
npm run dev      # auto-loads unpacked extension into Chrome
```

## Production deploy (single VPS)

```bash
cd infra
cp .env.example .env
# fill DOMAIN, CLERK_JWKS_URL, CLERK_ISSUER
REMOTE=user@vps.example.com REMOTE_PATH=/opt/dropdat ./deploy.sh
```

Caddy terminates TLS, proxies `/api/*` to the Go service, serves `web/out` for
everything else.

## Architecture

```
                        Caddy :443
                         │
            ┌────────────┴───────────┐
            │                        │
       /api/*                       /*
            │                        │
       Go :8080                  static
            │                   web/out/
            ▼
       Postgres
```

Capsule format = JSON. Server uses client-supplied uuid v7 ids so the
extension can write capsules to IndexedDB offline and sync later
without conflict.

## Tech

| Layer       | Stack                                                  |
|-------------|--------------------------------------------------------|
| Marketing   | Next.js 16 + Tailwind v4 + shadcn-style tokens         |
| Dashboard   | Next.js client routes + SWR + @clerk/react             |
| API         | Go 1.25 + chi + pgx + sqlc + goose + slog              |
| Auth        | Clerk (JWKS verified server-side)                      |
| Extension   | WXT + React + IndexedDB + @clerk/chrome-extension      |
| Infra       | Caddy + Postgres 16 + Docker Compose                   |

## Out of scope (Phase 2+)

Teams, MCP server for Cursor/Antigravity, Gmail capture, attachments,
pgvector semantic search, dynamic context, Stripe billing, Firefox build.
