# dropdat extension

Chrome MV3 extension built with WXT + React.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

WXT opens Chrome with the unpacked extension auto-loaded. Navigate to
ChatGPT — you should see the **● capsule** pill in the lower-right.

## Layout

```
entrypoints/
  background.ts          service worker — sync queue, periodic alarm
  popup/                 toolbar UI (React)
  chatgpt.content.ts     injects capsule button into chatgpt.com
  (claude.content.ts, gemini.content.ts come step 9)

lib/
  api.ts                 typed fetch to Go API
  storage.ts             IndexedDB capsule store
  sync.ts                offline → online sync queue
  uuid.ts                uuid v7 generator
  capture/chatgpt.ts     DOM scraper for chatgpt.com
  types.ts               shared Capsule shape
```

## Build for store

```bash
npm run build       # .output/chrome-mv3
npm run zip         # distributable zip
```
