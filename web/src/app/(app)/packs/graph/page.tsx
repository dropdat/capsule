"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { ChordGraph, type ChordNode } from "@/components/ChordGraph";
import { useApi, type CapsuleGraph } from "@/lib/api";

const SOURCE_COLOR: Record<string, string> = { pack: "#0562ef" };

export default function PacksOverviewGraphPage() {
  const api = useApi();
  const [graph, setGraph] = useState<CapsuleGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<(ChordNode & { degree: number }) | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const g = await api<CapsuleGraph>("/api/v1/packs/graph");
      setGraph(g);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link href="/packs" className="text-[12px] text-muted-foreground hover:text-foreground">
          ← Packs
        </Link>
        <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Packs overlap</h1>
        <p className="text-[13.5px] text-muted-foreground">
          Each pack is a node; arcs weight by shared capsules (Jaccard overlap).
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
              No packs yet — create one to see overlap.
            </div>
          ) : (
            <ChordGraph
              nodes={graph.nodes}
              edges={graph.edges}
              sourceColor={SOURCE_COLOR}
              onNodeClick={(n) => setSelected(n)}
              selectedId={selected?.id ?? null}
            />
          )}
          {graph && graph.nodes.length > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] text-muted-foreground bg-card/80 backdrop-blur px-3 py-1.5 rounded-md border border-border">
              <span>{graph.nodes.length} packs · {graph.edges.length} overlaps</span>
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
              <div className="text-[11.5px] text-muted-foreground">{selected.degree} overlap(s)</div>
              <Link
                href={`/packs/pack?id=${selected.id}`}
                className="rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium px-3 py-2 text-center hover:opacity-90"
              >
                Open pack
              </Link>
              <Link
                href={`/packs/pack/graph?id=${selected.id}`}
                className="rounded-md bg-secondary border border-border text-[12.5px] px-3 py-2 text-center hover:bg-card"
              >
                Pack graph
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-heading text-[14px] font-medium">Pick a pack</h2>
              <p className="text-[12.5px] text-muted-foreground">
                Hover a node to highlight packs that share capsules. Click for actions.
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-2">
                Arc thickness ~ overlap ratio. Node size ~ number of packs overlapped with.
              </p>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
