import { useEffect, useState } from "react";
import { capsuleStore } from "../../lib/storage";
import { formatForInjection } from "../../lib/inject";
import { clearApiKey, getApiKey, setApiKey, verifyApiKey } from "../../lib/auth";
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

export function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
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

      <footer className="footer">
        <span>{pendingCount > 0 ? `${pendingCount} pending` : `${capsules.length} capsules`}</span>
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
