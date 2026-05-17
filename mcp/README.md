# @dropdat/mcp

MCP server for [dropdat](https://dropdat.app). Lets any MCP-capable AI
client (Claude Code, Cursor, Cline, Claude Desktop) recall, read, and
save capsules in your dropdat library.

> **Plan requirement:** MCP access is gated to **Premium plan or higher**.
> Basic / Pro keys can call the REST API but the MCP tools will return
> `402 MCP access requires Premium plan or higher`.

## Tools

| Tool | Purpose |
|------|---------|
| `dropdat_recall`      | Keyword + semantic search across capsules (titles, summaries, message bodies). |
| `dropdat_read`        | Fetch one capsule's full contents by id (optional lineage). |
| `dropdat_list`        | Browse recent capsules, optional tag filter. |
| `dropdat_capsule`     | Save the current conversation slice as a new capsule (model picks the messages). |
| `dropdat_autocapsule` | Save the **full verbatim** Claude Code session by reading the on-disk `.jsonl` transcript. |

`dropdat_recall` uses the hybrid `/capsules/search` endpoint
(vector + BM25 fused via RRF) when the API has `OPENAI_API_KEY` set;
otherwise it degrades to BM25 only.

## Install

No clone, no build — just `npx`.

1. Sign in at <https://dropdat.app>, upgrade to **Premium** (or higher).
2. Open **API Keys** → issue a new key. Token is shown once, shape `dk_live_…`.

## Wire into a client

### Claude Code

```bash
claude mcp add dropdat -s user \
  -e DROPDAT_API_KEY=dk_live_xxx \
  -- npx -y @dropdat/mcp
```

Scope flags: `-s user` (you, every project), `-s local` (this project only),
`-s project` (commits a `.mcp.json` into the repo).

Verify: `claude mcp list` — should show `dropdat: npx -y @dropdat/mcp - ✓ Connected`.
Then restart Claude Code so the tools load.

### Cursor / Cline / Claude Desktop

Add an `mcpServers` entry pointing at the `npx` invocation:

```json
{
  "mcpServers": {
    "dropdat": {
      "command": "npx",
      "args": ["-y", "@dropdat/mcp"],
      "env": {
        "DROPDAT_API_KEY": "dk_live_xxx"
      }
    }
  }
}
```

### Self-hosting the API

Default base is `https://dropdat.app`. Point at your own deployment by
setting `DROPDAT_API_BASE`:

```bash
claude mcp add dropdat -s user \
  -e DROPDAT_API_KEY=dk_live_xxx \
  -e DROPDAT_API_BASE=http://localhost:8080 \
  -- npx -y @dropdat/mcp
```

If your API has `DEV_AUTH_BYPASS=1`, the key is ignored and `DEV_USER_ID`
is assumed. Use a real key against any normal deployment.

## Troubleshooting

- **`DROPDAT_API_KEY not set`** — the server prints this and exits when
  invoked without a key. Set it via your MCP client's `env` block (above)
  or shell-export it before launching.
- **`402 MCP access requires Premium plan or higher`** — upgrade at
  <https://dropdat.app/billing>. Existing keys gain MCP access automatically
  on the next request after the plan change.
- **Tools don't appear in Claude Code** — restart the session after
  `claude mcp add`; the tool list is loaded at startup.
- **Don't run it as a shell REPL.** `npx -y @dropdat/mcp` speaks JSON-RPC
  over stdio. Typing `hi` does nothing — launch it via an MCP client.

## Develop (contributors only)

```bash
git clone https://github.com/dropdat/mcp
cd mcp
npm install
npm run dev   # tsx, no rebuild
npm run build # emit dist/
```

Publish:

```bash
npm version patch  # bumps + git tag
npm publish --access public
```

## Endpoint surface

All against the Go API under `/api/v1`. Every request sends the
`X-Dropdat-Client: mcp` header so the server can enforce the Premium gate.

- `GET    /capsules?q=&tag=&limit=`
- `POST   /capsules/search`
- `GET    /capsules/{id}`
- `GET    /capsules/{id}/lineage`
- `POST   /capsules`

Bearer auth accepts either a Clerk session JWT or a `dk_*` API key. The
MCP server uses the API-key path so it survives long-running agent
sessions without a refresh dance.
