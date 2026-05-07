import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "dropdat",
    description: "Capture any AI chat as a portable capsule. Drop it anywhere.",
    version: "0.1.0",
    permissions: ["storage", "activeTab", "scripting", "cookies"],
    host_permissions: [
      "https://chatgpt.com/*",
      "https://chat.openai.com/*",
      "https://claude.ai/*",
      "https://gemini.google.com/*",
      "http://localhost:3000/*",
      "https://*.clerk.accounts.dev/*",
      "https://clerk.accounts.dev/*",
    ],
    action: {
      default_title: "dropdat — capsule library",
    },
  },
  srcDir: ".",
});
