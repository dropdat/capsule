import { defineContentScript } from "wxt/utils/define-content-script";
import { mountCapsuleButton } from "../lib/capsule-button";

export default defineContentScript({
  matches: ["https://www.perplexity.ai/*", "https://perplexity.ai/*"],
  runAt: "document_idle",
  main() {
    mountCapsuleButton();
  },
});
