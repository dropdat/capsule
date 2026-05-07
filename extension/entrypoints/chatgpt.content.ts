import { defineContentScript } from "wxt/utils/define-content-script";
import { mountCapsuleButton } from "../lib/capsule-button";

export default defineContentScript({
  matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
  runAt: "document_idle",
  main() {
    mountCapsuleButton();
  },
});
