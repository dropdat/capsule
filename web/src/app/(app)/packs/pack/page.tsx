"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useApi, type ContextPack, type PackItem, type Subscription } from "@/lib/api";

export default function PackDetailPage() {
  return (
    <Suspense
      fallback={<section className="py-12 text-[13px] text-muted-foreground">Loading…</section>}
    >
      <PackDetail />
    </Suspense>
  );
}

function PackDetail() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id") ?? "";
  const api = useApi();

  const [pack, setPack] = useState<ContextPack | null>(null);
  const [items, setItems] = useState<PackItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [editing, setEditing] = useState(false);
  const [renderedCopied, setRenderedCopied] = useState(false);
  const [tier, setTier] = useState<Subscription["tier"] | null>(null);
  const canGraph = tier === "ultimate" || tier === "enterprise";

  useEffect(() => {
    api<Subscription>("/api/v1/billing/subscription")
      .then((s) => setTier(s.tier))
      .catch(() => setTier("basic"));
  }, [api]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, its] = await Promise.all([
        api<ContextPack>(`/api/v1/packs/${id}`),
        api<PackItem[]>(`/api/v1/packs/${id}/items`),
      ]);
      setPack(p);
      setItems(its ?? []);
      setName(p.name);
      setGoal(p.goal);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [api, id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  const save = async () => {
    setBusy("save");
    try {
      const p = await api<ContextPack>(`/api/v1/packs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, goal }),
      });
      setPack(p);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this pack?")) return;
    setBusy("delete");
    try {
      await api(`/api/v1/packs/${id}`, { method: "DELETE" });
      router.push("/packs");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setBusy(null);
    }
  };

  const removeItem = async (capsuleID: string) => {
    setBusy(`item-${capsuleID}`);
    try {
      await api(`/api/v1/packs/${id}/items/${capsuleID}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setBusy(null);
    }
  };

  const autofill = async (seedID?: string) => {
    if (items.length === 0) {
      setError("Add at least one capsule first — autofill needs a seed.");
      return;
    }
    const seed = seedID ?? items[0].capsule_id;
    setBusy("autofill");
    setError(null);
    try {
      const { added } = await api<{ added: number }>(`/api/v1/packs/${id}/autofill`, {
        method: "POST",
        body: JSON.stringify({ seed_capsule_id: seed, limit: 8 }),
      });
      await load();
      if (added === 0) {
        setError("No new related capsules found — try a different seed or capture more chats.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("embedding")) {
        setError(
          "That capsule has no embedding yet, so we can't find similar ones. " +
            "Embeddings need OPENAI_API_KEY on the API — check with the admin, " +
            "or try a different seed capsule from the dropdown."
        );
      } else {
        setError(msg || "Autofill failed");
      }
    } finally {
      setBusy(null);
    }
  };

  const copyRendered = async () => {
    setBusy("render");
    try {
      const { markdown } = await api<{ markdown: string }>(`/api/v1/packs/${id}/render`);
      await navigator.clipboard.writeText(markdown);
      setRenderedCopied(true);
      setTimeout(() => setRenderedCopied(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Render failed");
    } finally {
      setBusy(null);
    }
  };

  if (!pack) {
    return (
      <section className="flex flex-col gap-4">
        <Link href="/packs" className="text-[12px] text-muted-foreground hover:text-foreground">
          ← Packs
        </Link>
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
            {error}
          </div>
        ) : (
          <div className="text-[13px] text-muted-foreground">Loading…</div>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link href="/packs" className="text-[12px] text-muted-foreground hover:text-foreground">
          ← Packs
        </Link>
        <div className="flex items-center justify-between gap-4">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-heading text-[22px] sm:text-[26px] font-medium bg-card border border-border px-2 py-1 flex-1"
            />
          ) : (
            <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">{pack.name}</h1>
          )}
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={save} disabled={busy === "save"} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium">
                  {busy === "save" ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setName(pack.name); setGoal(pack.goal); }} className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px]">
                  Cancel
                </button>
              </>
            ) : (
              <>
                {items.length > 1 ? (
                  <select
                    disabled={busy === "autofill"}
                    onChange={(e) => {
                      if (e.target.value) autofill(e.target.value);
                      e.currentTarget.selectedIndex = 0;
                    }}
                    className="rounded-md bg-secondary border border-border px-3 py-2 text-[13px] font-medium hover:bg-card disabled:opacity-50"
                    title="Pick a seed capsule to autofill from"
                  >
                    <option value="">
                      {busy === "autofill" ? "Filling…" : "Autofill from…"}
                    </option>
                    {items.map((it) => (
                      <option key={it.capsule_id} value={it.capsule_id}>
                        {it.title.slice(0, 40)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => autofill()}
                    disabled={busy === "autofill" || items.length === 0}
                    title={items.length === 0 ? "Add a seed capsule first" : "Add capsules similar to the first item"}
                    className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] font-medium hover:bg-card disabled:opacity-50"
                  >
                    {busy === "autofill" ? "Filling…" : "Autofill related"}
                  </button>
                )}
                <button onClick={copyRendered} disabled={busy === "render"} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90 disabled:opacity-50">
                  {renderedCopied ? "Copied ✓" : busy === "render" ? "Rendering…" : "Copy as context"}
                </button>
                {canGraph && (
                  <Link
                    href={`/packs/pack/graph?id=${id}`}
                    className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px]"
                  >
                    View graph
                  </Link>
                )}
                <button onClick={() => setEditing(true)} className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px]">
                  Edit
                </button>
                <button onClick={remove} disabled={busy === "delete"} className="rounded-md bg-card border border-border px-4 py-2 text-[13px] text-destructive">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
        {editing ? (
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Goal"
            className="text-[13.5px] bg-card border border-border px-3 py-2 rounded-md"
          />
        ) : (
          pack.goal && <p className="text-[13.5px] text-muted-foreground">{pack.goal}</p>
        )}
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-heading text-[14px] font-medium">Capsules in this pack ({items.length})</h2>
        </div>
        {items.length === 0 ? (
          <div className="px-5 py-8 text-[13px] text-muted-foreground text-center">
            No capsules yet. Open any capsule and click <span className="font-medium">Save to pack</span>.
          </div>
        ) : (
          <ul>
            {items.map((it, i) => (
              <li key={it.capsule_id} className="border-t border-border first:border-t-0 px-5 py-3 flex items-center justify-between gap-3">
                <Link href={`/capsule?id=${it.capsule_id}`} className="flex flex-col min-w-0 flex-1 hover:opacity-80">
                  <span className="text-[13.5px] font-medium truncate">
                    {i + 1}. {it.title}
                  </span>
                  <span className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {it.source}
                  </span>
                </Link>
                <button
                  onClick={() => removeItem(it.capsule_id)}
                  disabled={busy === `item-${it.capsule_id}`}
                  className="text-[12px] underline text-destructive hover:opacity-80 disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
