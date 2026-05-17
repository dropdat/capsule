import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "dropdat",
    description: "Capture any AI chat as a portable capsule. Drop it anywhere.",
    version: "0.3.0",
    ...(process.env.EXT_KEY ? { key: process.env.EXT_KEY } : {}),
    permissions: ["storage", "activeTab", "contextMenus", "notifications"],
    host_permissions: [
      "https://chatgpt.com/*",
      "https://chat.openai.com/*",
      "https://claude.ai/*",
      "https://gemini.google.com/*",
      "https://grok.com/*",
      "https://copilot.microsoft.com/*",
      "https://www.perplexity.ai/*",
      "https://perplexity.ai/*",
      "https://dropdat.app/*",
      "https://*.dropdat.app/*",
      "https://*.clerk.accounts.dev/*",
      "https://clerk.accounts.dev/*",
    ],
    action: {
      default_title: "dropdat — capsule library",
    },
    // Firefox requires an extension id under browser_specific_settings.gecko
    // for AMO submission and signed updates. Falls back to a dev id locally
    // so `wxt -b firefox` works without env.
    browser_specific_settings: {
      gecko: {
        id: process.env.FIREFOX_EXT_ID ?? "dropdat@dropdat.app",
        strict_min_version: "115.0",
      },
    },
  },
  srcDir: ".",
});
