# Chrome Web Store — Permission Justifications

Paste these into the corresponding fields in the Chrome Web Store developer
console when submitting. Keep each under ~1000 characters; reviewers reject
vague answers.

---

## Single purpose description

dropdat captures conversations from supported AI chat sites (ChatGPT, Claude,
Gemini, Grok, Microsoft Copilot, Perplexity) into reusable "capsules" so users
can carry context between chats. The single purpose is: read the visible chat
on the active page when the user clicks the capsule button, save it locally,
and (optionally) inject a saved capsule back into a chat composer.

---

## `storage` justification

Capsules and per-user settings are persisted in the extension's IndexedDB so
they survive browser restarts. No `storage` data is sent off-device unless
the user explicitly signs in for sync.

---

## `activeTab` justification

Used to read messages from the chat the user is currently on, only at the
moment they click the dropdat capture button. We do not run on tabs the user
hasn't interacted with, and we do not modify other tabs.

---

## `scripting` justification

The extension mounts a UI element (capsule button) inside the composer of the
active chat tab and inserts text into the composer when the user picks a
capsule to drop. Both actions require executing scripts in the chat page.

---

## `cookies` justification

We read the Clerk session cookie from `clerk.accounts.dev` (and its
subdomains) so that the popup can authenticate the user to the dropdat backend
when they sign in. No other cookies are read, and cookies are never sent to
third parties.

---

## Host permissions

- `https://chatgpt.com/*`, `https://chat.openai.com/*`, `https://claude.ai/*`,
  `https://gemini.google.com/*`, `https://grok.com/*`,
  `https://copilot.microsoft.com/*`, `https://www.perplexity.ai/*`,
  `https://perplexity.ai/*` — required because the extension's core feature is
  reading the user's chat on these specific hosts and mounting a button
  inside their composer. Each host has its own DOM structure that the
  content script targets directly.
- `https://*.clerk.accounts.dev/*`, `https://clerk.accounts.dev/*` — required
  to read the Clerk session cookie for authenticated sync (see `cookies`
  justification).

The extension does not request any broad host pattern (no `<all_urls>`,
no wildcard top-level domains).

---

## Remote code

The extension does not load remote code, evaluated scripts, or remote modules.
All JavaScript shipped is bundled at build time. Network requests are limited
to the dropdat backend (capsule sync) and Clerk (authentication).

---

## Data usage disclosure

Select these checkboxes in the developer console:

- [x] Authentication information — Clerk session cookie.
- [x] User activity — chat content the user explicitly captures.
- [x] Personally identifiable information — capsule content may contain text
      the user typed; we treat it as user-owned.
- [ ] Health information — none.
- [ ] Financial information — none.
- [ ] Personal communications — capsules may contain conversation text; this
      is captured and stored on user action only.
- [ ] Location — none.
- [ ] Web history — none.

Confirm:
- [x] I do not sell or transfer user data to third parties beyond approved use cases.
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.
