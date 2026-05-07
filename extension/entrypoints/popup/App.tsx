import { useEffect, useState } from "react";
import { Show, SignInButton, UserButton } from "@clerk/chrome-extension";
import { capsuleStore } from "../../lib/storage";
import { formatForInjection } from "../../lib/inject";
import type { Capsule } from "../../lib/types";

const sourceLabel: Record<Capsule["source"], string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
};

const HAS_CLERK = !!(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined);

export function App() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string>("");

  const refresh = async () => {
    const all = await capsuleStore.all();
    all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setCapsules(all);
  };

  useEffect(() => {
    refresh();
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

  const pendingCount = capsules.filter((c) => c.pendingSync).length;

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img src="/icon/32.png" alt="" width={20} height={20} />
          dropdat
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {HAS_CLERK && <AuthArea />}
          <button className="btn secondary" onClick={triggerSync} disabled={syncing}>
            {syncing ? "Syncing…" : "Sync"}
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
            title="Drag onto a chat composer to inject"
          >
            <div className="meta">
              <span>{sourceLabel[c.source]}</span>
              <span>v{c.version}{c.pendingSync ? " · pending" : ""}</span>
            </div>
            <div className="title">{c.title}</div>
          </div>
        ))}
      </div>

      <footer className="footer">
        <span>{pendingCount > 0 ? `${pendingCount} pending` : `${capsules.length} capsules`}</span>
        <a
          href={`${(import.meta.env.VITE_DASHBOARD_URL as string | undefined) ?? "http://localhost:3000"}/app`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--primary)", textDecoration: "none" }}
        >
          Open dashboard →
        </a>
      </footer>
      {status && (
        <div style={{ position: "absolute", bottom: 48, left: 16, right: 16, fontSize: 12, color: "var(--muted)" }}>
          {status}
        </div>
      )}
    </div>
  );
}

/** Sign-in / user button area — only mounted when Clerk is configured. */
function AuthArea() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="btn">Sign in</button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
