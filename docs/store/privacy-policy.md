# dropdat — Privacy Policy

_Last updated: 2026-05-08_

dropdat ("we", "the extension") helps you capture AI chat conversations from
supported sites and reuse that context across other chats. This policy explains
what the extension reads, what it stores, and where data goes.

## What we read

When you click the dropdat capsule button on a supported chat site
(ChatGPT / OpenAI, Claude, Gemini, Grok, Microsoft Copilot, Perplexity), the
extension reads the visible messages from the active conversation in order to
build a "capsule." Reading happens **only when you click Generate**. We do not
read pages passively, and we do not read pages outside the supported chat
hosts listed in the manifest.

## What we store

Each capsule contains:

- A title (extracted from the page),
- The user/assistant message text from that conversation,
- The source host (e.g., `chatgpt`, `claude`),
- The page URL,
- Timestamps and a local id.

Capsules are written to the browser's local IndexedDB inside the extension's
own origin. Nothing is sent anywhere unless you sign in.

## What we sync (optional, account-only)

If you sign in via Clerk and configure a dashboard URL, capsules are uploaded
to your dropdat account on our backend so that you can access them on the web
dashboard. The backend stores capsules under your authenticated user id.
You can delete capsules from the dashboard at any time.

If you do not sign in, **no data leaves your browser.**

## Cookies and authentication

The extension uses Chrome's `cookies` permission solely to read your Clerk
session cookie from `*.clerk.accounts.dev` so that the popup can authenticate
to the dropdat backend on your behalf. We do not read cookies from any other
origin and we do not transmit cookies to any third party.

## Third parties

- **Clerk** is used for authentication. Clerk's own policy governs how it
  handles your account email and session. See https://clerk.com/legal/privacy.
- **The dropdat backend** stores your capsules under your account.
- We do not use analytics, advertising trackers, or external telemetry.

## Permissions, briefly

- `storage`, `activeTab`, `scripting` — needed to mount the capsule button
  inside chat composers and persist capsules locally.
- `cookies` — Clerk session token only.
- Host permissions — limited to the specific chat sites we support and Clerk
  domains.

## Data deletion

- Local: open the extension popup, drop a capsule's row → delete (or clear
  the extension's site data via Chrome's extension management UI).
- Synced: delete from the dashboard, or contact us via the support email
  listed on the Chrome Web Store listing.

## Changes

If this policy changes materially, the extension's "Last updated" date will
change and we will note the change in the dashboard.

## Contact

Email: support@dropdat.example  ← replace with your real address before
publishing.
