# Project rules for Claude

## FEATURES.md is the canonical feature index

`FEATURES.md` at the repo root lists every user-facing feature in dropdat
(web dashboard, API, extension, infra, auth).

**Rule:** if during a session you ship, scaffold, or wire up any new
user-facing feature — a new page, route, endpoint, dashboard tab,
extension provider, capture surface, auth flow, infra capability —
you MUST update `FEATURES.md` in the same session, before the user
ends it.

When to update:
- New web route under `web/src/app/**`
- New handler/service under `api/internal/**`
- New extension entrypoint or provider content script
- New auth method, billing surface, integration, or infra component
- Removal of any of the above (delete the corresponding bullet)

How to update:
- Add the feature under the matching section (Web / API / Extension /
  Infrastructure / Auth & Security).
- One bullet, present tense, user-visible language. No PR numbers,
  no commit hashes, no dates.
- If a whole new section is needed, add it and keep ordering stable.

Before you end a session (final assistant turn, wrap-up summary,
or any "all done" message), re-check the diff: if any feature-shaped
change was made and `FEATURES.md` was not touched, update it now.

Do not update `FEATURES.md` for pure bug fixes, refactors, style
tweaks, copy edits, or dependency bumps.
