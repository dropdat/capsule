"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { useApi, ApiError, type ContextPack, type Subscription } from "@/lib/api";

export default function PacksPage() {
  const api = useApi();
  const [packs, setPacks] = useState<ContextPack[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [tier, setTier] = useState<Subscription["tier"] | null>(null);
  const canGraph = tier === "ultimate" || tier === "enterprise";

  const load = useCallback(async () => {
    try {
      const data = await api<ContextPack[]>("/api/v1/packs");
      setPacks(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoaded(true);
    }
  }, [api]);

  useEffect(() => {
    load();
    api<Subscription>("/api/v1/billing/subscription")
      .then((s) => setTier(s.tier))
      .catch(() => setTier("basic"));
  }, [load, api]);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api<ContextPack>("/api/v1/packs", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), goal: goal.trim() }),
      });
      setName("");
      setGoal("");
      await load();
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) {
        setUpgrade(true);
      } else {
        setError(e instanceof Error ? e.message : "Create failed");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Context packs</h1>
          <p className="text-[13.5px] text-muted-foreground max-w-[640px]">
            Bundle related capsules into one drop-in context block. Pick a goal, add the capsules,
            copy the rendered markdown into any AI app.
          </p>
        </div>
        {canGraph && (
          <Link
            href="/packs/graph"
            className="rounded-md bg-secondary border border-border px-3 py-2 text-[13px] hover:bg-card"
          >
            View overlap graph
          </Link>
        )}
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
        <h2 className="font-heading text-[14px] font-medium">New pack</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pack name (e.g. Ship the billing migration)"
          className="bg-card border border-border px-3 py-2 text-[13.5px] rounded-md"
        />
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Goal (optional) — what you're trying to do"
          className="bg-card border border-border px-3 py-2 text-[13.5px] rounded-md"
        />
        <div>
          <button
            type="button"
            onClick={create}
            disabled={busy || !name.trim()}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create pack"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <h2 className="font-heading text-[14px] font-medium">Your packs</h2>
          <span className="text-[12px] text-muted-foreground">{packs.length} total</span>
        </div>
        {!loaded ? (
          <div className="px-5 py-6 text-[13px] text-muted-foreground">Loading…</div>
        ) : packs.length === 0 ? (
          <div className="px-5 py-8 text-[13px] text-muted-foreground text-center">
            No packs yet. Create one above, then add capsules from any capsule page.
          </div>
        ) : (
          <ul>
            {packs.map((p) => (
              <li key={p.id} className="border-t border-border first:border-t-0">
                <Link
                  href={`/packs/pack?id=${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/40"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-medium truncate">{p.name}</span>
                    {p.goal && (
                      <span className="text-[12px] text-muted-foreground truncate">{p.goal}</span>
                    )}
                  </div>
                  <span className="text-[12px] text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

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
            <h2 className="font-heading text-[18px] font-medium mb-2">Context packs need a paid plan</h2>
            <p className="text-[13.5px] text-muted-foreground mb-5">
              Bundling capsules into ready-to-paste context is a Pro feature. Upgrade to start
              shipping packs.
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
    </section>
  );
}
