import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "dropdat",
    description: "Capture any AI chat as a portable capsule. Drop it anywhere.",
    version: "0.1.1",
    ...(process.env.EXT_KEY ? { key: process.env.EXT_KEY } : {}),
    permissions: ["storage", "activeTab", "cookies"],
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
  },
  srcDir: ".",
});
