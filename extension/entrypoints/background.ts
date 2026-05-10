import { defineBackground } from "wxt/utils/define-background";
import { capsuleStore } from "../lib/storage";
import { syncOnce } from "../lib/sync";
import { getApiKey as readApiKey } from "../lib/auth";
import { folderApi, getPreferredFolderId, linkApi } from "../lib/folders";
import type { Capsule } from "../lib/types";

const MENU_ROOT_FLAT = "dropdat-save";
const MENU_ROOT_PARENT = "dropdat-root";
const MENU_FOLDER_PREFIX = "dropdat-folder:";

const CONTEXTS: chrome.contextMenus.ContextType[] = ["page", "link", "selection"];

async function registerContextMenus() {
  if (!chrome.contextMenus?.create) return;
  await new Promise<void>((resolve) => chrome.contextMenus.removeAll(() => resolve()));

  // Try to enumerate folders. If we can — show a submenu of folder names.
  // Otherwise (signed out or API error) — show a single flat item that
  // saves to the default folder (the API auto-creates "links" if missing).
  const apiKey = await readApiKey();
  let folders: Awaited<ReturnType<typeof folderApi.list>> = [];
  if (apiKey) {
    try {
      folders = await folderApi.list();
    } catch (err) {
      console.warn("[dropdat] context-menu folder list failed:", err);
    }
  }

  if (folders.length <= 1) {
    chrome.contextMenus.create({
      id: MENU_ROOT_FLAT,
      title: "dropdat",
      contexts: CONTEXTS,
    });
    return;
  }

  chrome.contextMenus.create({
    id: MENU_ROOT_PARENT,
    title: "dropdat",
    contexts: CONTEXTS,
  });
  // Sort: default first, then alphabetical.
  const sorted = [...folders].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const f of sorted) {
    chrome.contextMenus.create({
      id: `${MENU_FOLDER_PREFIX}${f.id}`,
      parentId: MENU_ROOT_PARENT,
      title: f.isDefault ? `${f.name}  ★` : f.name,
      contexts: CONTEXTS,
    });
  }
}

async function notify(title: string, message: string) {
  try {
    if (!chrome.notifications?.create) return;
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icon/128.png"),
      title,
      message,
    });
  } catch {
    /* ignore */
  }
}

async function saveLinkFromContext(
  info: chrome.contextMenus.OnClickData,
  tab: chrome.tabs.Tab | undefined,
  folderId: string | undefined
) {
  const apiKey = await readApiKey();
  if (!apiKey) {
    await notify("dropdat", "Sign in via the extension popup first.");
    return;
  }
  let url = "";
  let title = "";
  if (info.linkUrl) {
    url = info.linkUrl;
    title = info.selectionText || tab?.title || info.linkUrl;
  } else if (info.selectionText) {
    const sel = info.selectionText.trim();
    const match = sel.match(/https?:\/\/\S+/);
    if (match) {
      url = match[0];
      title = sel;
    } else {
      url = info.pageUrl || tab?.url || "";
      title = tab?.title || url;
    }
  } else {
    url = info.pageUrl || tab?.url || "";
    title = tab?.title || url;
  }
  if (!url) {
    await notify("dropdat", "Nothing to save.");
    return;
  }
  try {
    const resolvedFolderId = folderId || (await getPreferredFolderId()) || undefined;
    const link = await linkApi.create({
      url,
      title,
      folderId: resolvedFolderId,
      faviconUrl: tab?.favIconUrl || "",
    });
    await notify("Saved to dropdat", link.title || link.url);
  } catch (err) {
    console.error("[dropdat] save link failed", err);
    await notify("dropdat", `Save failed: ${String(err)}`);
  }
}

export default defineBackground(() => {
  console.log("[dropdat] background worker boot");

  void registerContextMenus();
  chrome.runtime.onInstalled?.addListener(() => {
    void registerContextMenus();
  });
  chrome.runtime.onStartup?.addListener(() => {
    void registerContextMenus();
  });
  chrome.storage?.onChanged?.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.dropdat_api_key) void registerContextMenus();
  });

  chrome.contextMenus?.onClicked?.addListener((info, tab) => {
    const id = String(info.menuItemId);
    if (id === MENU_ROOT_FLAT) {
      void saveLinkFromContext(info, tab, undefined);
      return;
    }
    if (id.startsWith(MENU_FOLDER_PREFIX)) {
      const folderId = id.slice(MENU_FOLDER_PREFIX.length);
      void saveLinkFromContext(info, tab, folderId);
    }
  });

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
            const token = await getApiKey();
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

        case "SAVE_LINK": {
          try {
            const link = await linkApi.create({
              url: msg.url,
              title: msg.title,
              note: msg.note,
              folderId: msg.folderId || (await getPreferredFolderId()) || undefined,
              faviconUrl: msg.faviconUrl,
            });
            sendResponse({ ok: true, link });
          } catch (err) {
            sendResponse({ ok: false, error: String(err) });
          }
          return;
        }

        case "LIST_LINKS": {
          try {
            const items = await linkApi.list(msg.folderId);
            sendResponse({ ok: true, items });
          } catch (err) {
            sendResponse({ ok: false, error: String(err) });
          }
          return;
        }

        case "LIST_FOLDERS": {
          try {
            const items = await folderApi.list();
            sendResponse({ ok: true, items });
          } catch (err) {
            sendResponse({ ok: false, error: String(err) });
          }
          return;
        }

        case "CREATE_FOLDER": {
          try {
            const folder = await folderApi.create(msg.name, !!msg.isDefault);
            void registerContextMenus();
            sendResponse({ ok: true, folder });
          } catch (err) {
            sendResponse({ ok: false, error: String(err) });
          }
          return;
        }

        case "REFRESH_CONTEXT_MENUS": {
          await registerContextMenus();
          sendResponse({ ok: true });
          return;
        }

        case "REQUEST_SYNC": {
          const token = await getApiKey();
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
    const token = await getApiKey();
    await syncOnce(async () => token).catch(() => undefined);
  });
});

async function getApiKey(): Promise<string | null> {
  return readApiKey();
}
