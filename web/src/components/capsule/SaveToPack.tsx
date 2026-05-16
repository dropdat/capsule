"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { useApi, ApiError, type ContextPack } from "@/lib/api";

export function SaveToPack({ capsuleId }: { capsuleId: string }) {
  const api = useApi();
  const [open, setOpen] = useState(false);
  const [packs, setPacks] = useState<ContextPack[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [upgrade, setUpgrade] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = await api<ContextPack[]>("/api/v1/packs");
      setPacks(p ?? []);
    } catch {
      setPacks([]);
    }
  }, [api]);

  useEffect(() => {
    if (open && !packs) load();
  }, [open, packs, load]);

  const addTo = async (packId: string) => {
    setBusy(packId);
    setErr(null);
    try {
      await api(`/api/v1/packs/${packId}/items`, {
        method: "POST",
        body: JSON.stringify({ capsule_id: capsuleId }),
      });
      setCreated(packId);
      setTimeout(() => setOpen(false), 1000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  };

  const createAndAdd = async () => {
    if (!newName.trim()) return;
    setBusy("create");
    setErr(null);
    try {
      const p = await api<ContextPack>("/api/v1/packs", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim() }),
      });
      await api(`/api/v1/packs/${p.id}/items`, {
        method: "POST",
        body: JSON.stringify({ capsule_id: capsuleId }),
      });
      setNewName("");
      setCreated(p.id);
      setTimeout(() => setOpen(false), 1000);
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) {
        setUpgrade(true);
      } else {
        setErr(e instanceof Error ? e.message : "Create failed");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] font-medium hover:bg-card"
      >
        Save to pack
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-[18px] font-medium mb-3">Save to context pack</h2>

            {err && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive mb-3">
                {err}
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New pack name"
                className="flex-1 bg-card border border-border px-3 py-2 text-[13px] rounded-md"
              />
              <button
                type="button"
                onClick={createAndAdd}
                disabled={busy === "create" || !newName.trim()}
                className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-[12.5px] font-medium hover:opacity-90 disabled:opacity-50"
              >
                {busy === "create" ? "Saving…" : "Create + add"}
              </button>
            </div>

            <div className="text-[11.5px] uppercase tracking-wide text-muted-foreground mb-2">
              Or add to existing
            </div>

            {!packs ? (
              <p className="text-[13px] text-muted-foreground">Loading…</p>
            ) : packs.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No packs yet.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
                {packs.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => addTo(p.id)}
                      disabled={busy === p.id}
                      className="w-full text-left rounded-md border border-border bg-card px-3 py-2 hover:bg-muted disabled:opacity-50 flex items-center justify-between"
                    >
                      <span className="text-[13px] font-medium">{p.name}</span>
                      {created === p.id && <span className="text-[12px] text-emerald-600">Added ✓</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md bg-card border border-border px-4 py-2 text-[13px] hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {upgrade && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setUpgrade(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-[18px] font-medium mb-2">Context packs are a Pro feature</h2>
            <p className="text-[13.5px] text-muted-foreground mb-5">
              Bundling capsules into drop-in context blocks is available on the Pro plan.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setUpgrade(false)} className="rounded-md bg-card border border-border px-4 py-2 text-[13px] hover:bg-muted">
                Not now
              </button>
              <Link href="/billing" className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90">
                See plans
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
