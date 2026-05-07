import { defineContentScript } from "wxt/utils/define-content-script";
import { mountCapsuleButton } from "../lib/capsule-button";

export default defineContentScript({
  matches: ["https://copilot.microsoft.com/*"],
  runAt: "document_idle",
  main() {
    mountCapsuleButton();
  },
});
