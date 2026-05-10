import { useEffect, useState } from "react";
import { capsuleStore } from "../../lib/storage";
import { formatForInjection } from "../../lib/inject";
import { clearApiKey, getApiKey, setApiKey, verifyApiKey } from "../../lib/auth";
import {
  type Folder,
  type Link,
  getPreferredFolderId,
  setPreferredFolderId,
} from "../../lib/folders";
import type { Capsule } from "../../lib/types";

const sourceLabel: Record<Capsule["source"], string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  grok: "Grok",
  copilot: "Copilot",
  perplexity: "Perplexity",
  other: "Other",
};

const DASHBOARD_URL =
  (import.meta.env.VITE_DASHBOARD_URL as string | undefined) ?? "https://dropdat.app";

type Tab = "capsules" | "links";

export function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [tab, setTab] = useState<Tab>("capsules");
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string>("");

  const refresh = async () => {
    const all = await capsuleStore.all();
    all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setCapsules(all);
  };

  useEffect(() => {
    (async () => {
      const key = await getApiKey();
      setSignedIn(!!key);
      setAuthChecked(true);
      await refresh();
    })();
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setStatus("Syncing…");
    try {
      const res = await chrome.runtime.sendMessage({ type: "REQUEST_SYNC" });
      setStatus(`Synced ${res?.ok ?? 0} · failed ${res?.failed ?? 0}`);
      await refresh();
    } catch (err) {
      setStatus(`Sync error: ${String(err)}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const onDragStart = (e: React.DragEvent, c: Capsule) => {
    e.dataTransfer.setData("text/plain", formatForInjection(c));
    e.dataTransfer.effectAllowed = "copy";
  };

  const dropToActiveTab = async (c: Capsule) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setStatus("No active tab to drop into.");
        return;
      }
      await chrome.tabs.sendMessage(tab.id, {
        type: "DROP_CAPSULE",
        capsule: {
          id: c.id,
          title: c.title,
          summary: c.summary,
          source: c.source,
          updatedAt: c.updatedAt,
          messages: c.messages,
        },
      });
      window.close();
    } catch (err) {
      setStatus(`Drop failed: ${String(err)}`);
    }
  };

  const signOut = async () => {
    await clearApiKey();
    setSignedIn(false);
  };

  const pendingCount = capsules.filter((c) => c.pendingSync).length;

  if (!authChecked) {
    return (
      <div className="app">
        <div className="empty">Loading…</div>
      </div>
    );
  }

  if (!signedIn) {
    return <SignInScreen onSignedIn={() => setSignedIn(true)} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img src="/icon/32.png" alt="" width={20} height={20} />
          dropdat
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn secondary" onClick={triggerSync} disabled={syncing}>
            {syncing ? "Syncing…" : "Sync"}
          </button>
          <button className="btn secondary" onClick={signOut} title="Remove API key">
            Sign out
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${tab === "capsules" ? "active" : ""}`}
          onClick={() => setTab("capsules")}
        >
          Capsules
        </button>
        <button
          className={`tab ${tab === "links" ? "active" : ""}`}
          onClick={() => setTab("links")}
        >
          Links
        </button>
      </div>

      {tab === "capsules" ? (
        <div className="list">
          {capsules.length === 0 && (
            <div className="empty">
              No capsules yet.
              <br />
              Open ChatGPT, Claude or Gemini and click the
              <br />
              <strong>● capsule</strong> button to capture a chat.
            </div>
          )}
          {capsules.map((c) => (
            <div
              key={c.id}
              className={`capsule ${c.pendingSync ? "pending" : ""}`}
              draggable
              onDragStart={(e) => onDragStart(e, c)}
              onClick={() => dropToActiveTab(c)}
              title="Click to drop into the active chat — or drag onto the composer"
              style={{ cursor: "pointer" }}
            >
              <div className="meta">
                <span>{sourceLabel[c.source]}</span>
                <span>
                  v{c.version}
                  {c.pendingSync ? " · pending" : ""}
                </span>
              </div>
              <div className="title">{c.title}</div>
            </div>
          ))}
        </div>
      ) : (
        <LinksPane onStatus={setStatus} />
      )}

      <footer className="footer">
        <span>
          {tab === "capsules"
            ? pendingCount > 0
              ? `${pendingCount} pending`
              : `${capsules.length} capsules`
            : "saved links"}
        </span>
        <a
          href={`${DASHBOARD_URL}/`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--primary)", textDecoration: "none" }}
        >
          Open dashboard →
        </a>
      </footer>
      {status && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 16,
            right: 16,
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}

function LinksPane({ onStatus }: { onStatus: (s: string) => void }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string>("");
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadFolders = async () => {
    const res = await chrome.runtime.sendMessage({ type: "LIST_FOLDERS" });
    if (!res?.ok) {
      onStatus(`Folders error: ${res?.error || "unknown"}`);
      return [] as Folder[];
    }
    return res.items as Folder[];
  };

  const loadLinks = async (folderId?: string) => {
    const res = await chrome.runtime.sendMessage({ type: "LIST_LINKS", folderId });
    if (!res?.ok) {
      onStatus(`Links error: ${res?.error || "unknown"}`);
      return [] as Link[];
    }
    return res.items as Link[];
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const fs = await loadFolders();
      setFolders(fs);
      const pref = (await getPreferredFolderId()) || fs.find((f) => f.isDefault)?.id || "";
      setActiveFolderId(pref);
      const ls = await loadLinks(pref || undefined);
      setLinks(ls);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPickFolder = async (id: string) => {
    setActiveFolderId(id);
    await setPreferredFolderId(id || null);
    setLoading(true);
    setLinks(await loadLinks(id || undefined));
    setLoading(false);
  };

  const onCreate = async () => {
    const name = window.prompt("New folder name?");
    if (!name) return;
    setBusy(true);
    const res = await chrome.runtime.sendMessage({ type: "CREATE_FOLDER", name });
    setBusy(false);
    if (!res?.ok) {
      onStatus(`Create failed: ${res?.error || "unknown"}`);
      return;
    }
    const fs = await loadFolders();
    setFolders(fs);
    onPickFolder((res.folder as Folder).id);
  };

  const onSaveCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
      onStatus("No active tab.");
      return;
    }
    setBusy(true);
    const res = await chrome.runtime.sendMessage({
      type: "SAVE_LINK",
      url: tab.url,
      title: tab.title || tab.url,
      faviconUrl: tab.favIconUrl || "",
      folderId: activeFolderId || undefined,
    });
    setBusy(false);
    if (!res?.ok) {
      onStatus(`Save failed: ${res?.error || "unknown"}`);
      return;
    }
    setLinks(await loadLinks(activeFolderId || undefined));
  };

  return (
    <>
      <div className="folder-bar">
        <span style={{ color: "var(--muted)" }}>Folder</span>
        <select value={activeFolderId} onChange={(e) => onPickFolder(e.target.value)}>
          <option value="">All</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
              {f.isDefault ? " (default)" : ""}
            </option>
          ))}
        </select>
        <button className="btn secondary" onClick={onCreate} disabled={busy}>
          +
        </button>
        <button className="btn" onClick={onSaveCurrentTab} disabled={busy}>
          Save tab
        </button>
      </div>

      <div className="list">
        {loading && <div className="empty">Loading…</div>}
        {!loading && links.length === 0 && (
          <div className="empty">
            No saved links yet.
            <br />
            Right-click any page or link → <strong>dropdat</strong> → Save.
          </div>
        )}
        {!loading &&
          links.map((l) => {
            const folder = folders.find((f) => f.id === l.folderId);
            return (
              <a
                key={l.id}
                className="link-row"
                href={l.url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="folder">{folder?.name || "—"}</span>
                <span className="title">{l.title || l.url}</span>
                <span className="url">{l.url}</span>
              </a>
            );
          })}
      </div>
    </>
  );
}

function SignInScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError("Paste an API key to continue.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyApiKey(trimmed);
      await setApiKey(trimmed);
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid API key");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app" style={{ padding: 16 }}>
      <header className="header" style={{ borderBottom: "none", marginBottom: 8 }}>
        <div className="brand">
          <img src="/icon/32.png" alt="" width={20} height={20} />
          dropdat
        </div>
      </header>

      <div style={{ padding: "12px 4px", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
          Sign in by pasting an API key from your dropdat dashboard. The key is stored locally in
          this browser only.
        </p>

        <input
          type="password"
          autoFocus
          placeholder="dk_live_…"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          style={{
            padding: "10px 12px",
            border: "1px solid var(--border, #c5dbf2)",
            background: "#fff",
            color: "#0b1015",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
          }}
        />

        <button className="btn" onClick={submit} disabled={busy}>
          {busy ? "Verifying…" : "Sign in"}
        </button>

        {error && (
          <div style={{ fontSize: 12, color: "#c0392b", padding: "4px 0" }}>{error}</div>
        )}

        <a
          href={`${DASHBOARD_URL}/api-keys`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}
        >
          Generate an API key →
        </a>
      </div>
    </div>
  );
}
