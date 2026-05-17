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
npm run build           # .output/chrome-mv3
npm run zip             # Chrome distributable zip

npm run build:firefox   # .output/firefox-mv3
npm run zip:firefox     # Firefox/AMO distributable zip
```

### Safari (macOS only)

WXT has no Safari target, but Safari accepts a converted Chrome MV3 bundle:

```bash
npm run build           # produces .output/chrome-mv3
xcrun safari-web-extension-converter .output/chrome-mv3 \
  --project-location ./safari --app-name dropdat --bundle-identifier app.dropdat.safari
open ./safari/dropdat/dropdat.xcodeproj  # build & sign in Xcode
```

You need a paid Apple Developer account to distribute. For local testing
toggle `Develop → Allow Unsigned Extensions` in Safari.
