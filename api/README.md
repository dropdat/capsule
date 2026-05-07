# dropdat API

Go HTTP service backing the dropdat capsule system.

Stack: Go 1.25 · chi · pgx · sqlc · goose · slog · Clerk JWKS auth.

## Quickstart

```bash
cp .env.example .env
# bring up postgres (see ../infra/docker-compose.yml later)
make migrate-up
make run
curl localhost:8080/health
```

## Layout

```
cmd/dropdat/         # entrypoint
internal/
  auth/              # Clerk JWT middleware (added step 4)
  capsule/           # CRUD + versioning handlers/services
  db/
    migrations/      # goose .sql files
    queries/         # sqlc input
    dbgen/           # sqlc generated (gitignored)
  httpx/             # response helpers
Makefile
Dockerfile
```
