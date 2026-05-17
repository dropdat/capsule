"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ChordGraph, type ChordNode } from "@/components/ChordGraph";
import { useApi, ApiError, type CapsuleGraph, type ContextPack } from "@/lib/api";
import { Paywall } from "@/components/Paywall";

const SOURCE_COLOR: Record<string, string> = {
  chatgpt: "#10a37f",
  claude: "#cc785c",
  gemini: "#4285f4",
};

export default function PackGraphPage() {
  return (
    <Suspense
      fallback={<section className="py-12 text-[13px] text-muted-foreground">Loading…</section>}
    >
      <PackGraphInner />
    </Suspense>
  );
}

function PackGraphInner() {
  const api = useApi();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [pack, setPack] = useState<ContextPack | null>(null);
  const [graph, setGraph] = useState<CapsuleGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<string | null>(null);
  const [selected, setSelected] = useState<(ChordNode & { degree: number }) | null>(null);

  // useApi() returns a fresh function each render; depending on it in a
  // useEffect causes an infinite fetch loop. Pin it in a ref and key the
  // effect on `id` only.
  const apiRef = useRef(api);
  apiRef.current = api;
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, g] = await Promise.all([
          apiRef.current<ContextPack>(`/api/v1/packs/${id}`),
          apiRef.current<CapsuleGraph>(`/api/v1/packs/${id}/graph?k=4`),
        ]);
        if (cancelled) return;
        setPack(p);
        setGraph(g);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 402) {
          setPaywall(e.message);
          return;
        }
        setError(e instanceof Error ? e.message : "Load failed");
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (paywall) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link href={`/packs/pack?id=${id}`} className="text-[12px] text-muted-foreground hover:text-foreground">
            ← {pack?.name ?? "Pack"}
          </Link>
          <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Pack graph</h1>
        </div>
        <Paywall title="Similarity graphs are an Ultimate feature" message={paywall} requiredTier="Ultimate" />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link href={`/packs/pack?id=${id}`} className="text-[12px] text-muted-foreground hover:text-foreground">
          ← {pack?.name ?? "Pack"}
        </Link>
        <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">
          {pack ? `${pack.name} — graph` : "Pack graph"}
        </h1>
        <p className="text-[13.5px] text-muted-foreground">
          Capsules in this pack, connected by similarity.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_260px] gap-4">
        <div className="rounded-lg border border-border bg-card overflow-hidden relative">
          {!graph ? (
            <div className="h-[520px] flex items-center justify-center text-[13px] text-muted-foreground">
              Loading…
            </div>
          ) : graph.nodes.length === 0 ? (
            <div className="h-[520px] flex items-center justify-center text-[13px] text-muted-foreground px-6 text-center">
              No capsules in this pack yet.
            </div>
          ) : (
            <ChordGraph
              nodes={graph.nodes}
              edges={graph.edges}
              sourceColor={SOURCE_COLOR}
              groupOrder={["chatgpt", "claude", "gemini"]}
              onNodeClick={(n) => setSelected(n)}
              selectedId={selected?.id ?? null}
            />
          )}
          {graph && graph.nodes.length > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] text-muted-foreground bg-card/80 backdrop-blur px-3 py-1.5 rounded-md border border-border">
              <span>{graph.nodes.length} capsules · {graph.edges.length} links</span>
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 h-fit lg:sticky lg:top-4">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-heading text-[15px] font-medium leading-tight">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-[12px] text-muted-foreground hover:text-foreground">×</button>
              </div>
              <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                <span
                  style={{ background: SOURCE_COLOR[selected.source] ?? "#6c7080" }}
                  className="h-2.5 w-2.5 rounded-full"
                />
                <span className="capitalize">{selected.source}</span>
                <span>·</span>
                <span>{selected.degree} link(s)</span>
              </div>
              <Link
                href={`/capsule?id=${selected.id}`}
                className="rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium px-3 py-2 text-center hover:opacity-90"
              >
                Open capsule
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-heading text-[14px] font-medium">Pick a capsule</h2>
              <p className="text-[12.5px] text-muted-foreground">
                Hover a node to focus on a capsule and its neighbours.
              </p>
              <div className="flex flex-col gap-1.5 mt-2">
                <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground">Legend</h3>
                {Object.entries(SOURCE_COLOR).map(([k, c]) => (
                  <span key={k} className="inline-flex items-center gap-2 text-[12px]">
                    <span style={{ background: c }} className="h-2.5 w-2.5 rounded-full" />
                    <span className="capitalize">{k}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
