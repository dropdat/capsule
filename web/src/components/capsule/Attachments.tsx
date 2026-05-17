"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useApi, ApiError } from "@/lib/api";

type Attachment = {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

type InitResponse = {
  id: string;
  uploadUrl: string;
  expiresIn: number;
};

function formatSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function Attachments({ capsuleId }: { capsuleId: string }) {
  const api = useApi();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const rows = await api<Attachment[]>(`/api/v1/capsules/${capsuleId}/attachments`);
      setItems(rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [api, capsuleId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setError("File too large (max 50 MB).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const init = await api<InitResponse>(`/api/v1/capsules/${capsuleId}/attachments`, {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      });
      const put = await fetch(init.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      await api(`/api/v1/capsules/${capsuleId}/attachments/${init.id}/commit`, { method: "POST" });
      await refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) {
        setUpgrade(true);
      } else {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const download = async (id: string) => {
    try {
      const { url, filename } = await api<{ url: string; filename: string }>(
        `/api/v1/attachments/${id}/download`
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this attachment? This can't be undone.")) return;
    try {
      await api(`/api/v1/attachments/${id}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-[14px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Attachments
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-md bg-secondary border border-border px-3 py-1.5 text-[12.5px] hover:bg-card disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
      </div>

      {error && (
        <p className="text-[12px] text-destructive mb-2">{error}</p>
      )}

      {items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No attachments yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
            >
              <button
                onClick={() => download(a.id)}
                className="flex-1 text-left text-[13px] truncate hover:text-primary"
                title={a.filename}
              >
                {a.filename}
              </button>
              <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                {formatSize(a.sizeBytes)}
              </span>
              <button
                onClick={() => remove(a.id)}
                className="text-[11.5px] text-destructive hover:opacity-80"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {upgrade && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setUpgrade(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-[18px] font-medium mb-2">Attachments need a paid plan</h2>
            <p className="text-[13.5px] text-muted-foreground mb-5">
              Uploading files to a capsule is a Premium feature. Upgrade to start attaching.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setUpgrade(false)} className="rounded-md bg-card border border-border px-4 py-2 text-[13px] hover:bg-muted">
                Not now
              </button>
              <a href="/billing" className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90">
                See plans
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
