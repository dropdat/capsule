import { defineBackground } from "wxt/utils/define-background";
import { capsuleStore } from "../lib/storage";
import { syncOnce } from "../lib/sync";
import type { Capsule } from "../lib/types";

export default defineBackground(() => {
  console.log("[dropdat] background worker boot");

  /** Listen for capture/sync requests from content scripts and popup. */
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    (async () => {
      switch (msg?.type) {
        case "PING":
          sendResponse({ ok: true, ts: Date.now() });
          return;

        case "SAVE_CAPSULE": {
          try {
            const capsule = msg.capsule as Capsule;
            if (!capsule?.id) {
              sendResponse({ ok: false, error: "missing capsule.id" });
              return;
            }
            await capsuleStore.put(capsule);
            console.log("[dropdat] bg saved capsule", capsule.id);
            // Trigger sync immediately, but report save success regardless
            const token = await getClerkToken();
            const sync = await syncOnce(async () => token).catch((e) => {
              console.warn("[dropdat] sync after save failed:", e);
              return { ok: 0, failed: 1 };
            });
            sendResponse({ ok: true, id: capsule.id, sync });
          } catch (err) {
            console.error("[dropdat] SAVE_CAPSULE error:", err);
            sendResponse({ ok: false, error: String(err) });
          }
          return;
        }

        case "LIST_CAPSULES": {
          try {
            const all = await capsuleStore.all();
            // newest first; trim heavy fields for the picker
            const items = all
              .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
              .map((c) => ({
                id: c.id,
                title: c.title,
                summary: c.summary,
                source: c.source,
                updatedAt: c.updatedAt,
                messages: c.messages,
              }));
            sendResponse({ ok: true, items });
          } catch (err) {
            sendResponse({ ok: false, error: String(err) });
          }
          return;
        }

        case "OPEN_POPUP": {
          try {
            // Modern Chrome (≥127) lets background open the action popup directly.
            const openPopup = (chrome.action as unknown as { openPopup?: () => Promise<void> })
              .openPopup;
            if (openPopup) {
              await openPopup.call(chrome.action);
              sendResponse({ ok: true, mode: "action" });
              return;
            }
          } catch (err) {
            console.warn("[dropdat] action.openPopup failed:", err);
          }
          // Fallback: open the popup HTML in a small detached window.
          try {
            const url = chrome.runtime.getURL("popup.html");
            await chrome.windows.create({
              url,
              type: "popup",
              width: 380,
              height: 540,
              focused: true,
            });
            sendResponse({ ok: true, mode: "window" });
          } catch (err) {
            sendResponse({ ok: false, error: String(err) });
          }
          return;
        }

        case "REQUEST_SYNC": {
          const token = await getClerkToken();
          const result = await syncOnce(async () => token);
          sendResponse({ ok: true, ...result });
          return;
        }

        default:
          sendResponse({ ok: false, error: "unknown message type" });
      }
    })();
    return true; // keep the channel open for async sendResponse
  });

  /** Periodic sync attempt every 60s. */
  chrome.alarms?.create?.("dropdat-sync", { periodInMinutes: 1 });
  chrome.alarms?.onAlarm?.addListener(async (alarm) => {
    if (alarm.name !== "dropdat-sync") return;
    const token = await getClerkToken();
    await syncOnce(async () => token).catch(() => undefined);
  });
});

/**
 * Stub — wired to Clerk in step 8. For now reads from chrome.storage.session
 * if popup put a token there; otherwise null (server in dev mode accepts).
 */
async function getClerkToken(): Promise<string | null> {
  try {
    const got = await chrome.storage.session.get("clerk_jwt");
    return (got.clerk_jwt as string | undefined) ?? null;
  } catch {
    return null;
  }
}
