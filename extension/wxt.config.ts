import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    version: "0.4.1",
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
      // Image CDNs — needed so the service worker can fetch chat images and
      // re-upload them as capsule attachments. Without these, signed/cookie-
      // gated image URLs fail with CORS or 401 in the background context.
      "https://images.openai.com/*",
      "https://files.oaiusercontent.com/*",
      "https://cdn.oaistatic.com/*",
      "https://*.anthropic.com/*",
      "https://files.claude.ai/*",
      "https://lh3.googleusercontent.com/*",
      "https://lh4.googleusercontent.com/*",
      "https://lh5.googleusercontent.com/*",
      "https://lh6.googleusercontent.com/*",
      "https://*.gstatic.com/*",
      "https://*.googleusercontent.com/*",
    ],
    action: {
      default_title: "__MSG_actionTitle__",
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
