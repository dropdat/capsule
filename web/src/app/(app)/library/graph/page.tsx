"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useApi, type CapsuleGraph } from "@/lib/api";

// react-force-graph-2d pulls in canvas + d3-force; it has to render
// client-side. SSR off so static export doesn't try to evaluate it.
const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((m) => m.default),
  { ssr: false }
);

type GraphNode = {
  id: string;
  title: string;
  source: string;
  degree?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};
type GraphLink = {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
};

const SOURCE_COLOR: Record<string, string> = {
  chatgpt: "#10a37f",
  claude: "#cc785c",
  gemini: "#4285f4",
};

export default function GraphPage() {
  const api = useApi();
  const router = useRouter();
  const fgRef = useRef<unknown>(null); // ForceGraph instance ref
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [graph, setGraph] = useState<CapsuleGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [hovered, setHovered] = useState<GraphNode | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const g = await api<CapsuleGraph>("/api/v1/capsules/graph?nodes=300&k=4");
      setGraph(g);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: r.width, h: Math.max(480, window.innerHeight - 240) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Build d3-shaped data + per-node degree, applying filters.
  const { data, neighbours } = useMemo(() => {
    if (!graph) return { data: { nodes: [], links: [] }, neighbours: new Map<string, Set<string>>() };
    const lower = search.trim().toLowerCase();
    const matchNode = (n: { id: string; title: string; source: string }) => {
      if (sourceFilter !== "all" && n.source !== sourceFilter) return false;
      if (lower && !n.title.toLowerCase().includes(lower)) return false;
      return true;
    };
    const nodeMap = new Map<string, GraphNode>();
    for (const n of graph.nodes) {
      if (matchNode(n)) nodeMap.set(n.id, { ...n, degree: 0 });
    }
    const links: GraphLink[] = [];
    const neigh = new Map<string, Set<string>>();
    for (const e of graph.edges) {
      const a = nodeMap.get(e.from);
      const b = nodeMap.get(e.to);
      if (!a || !b) continue;
      a.degree = (a.degree ?? 0) + 1;
      b.degree = (b.degree ?? 0) + 1;
      links.push({ source: e.from, target: e.to, value: e.weight });
      if (!neigh.has(e.from)) neigh.set(e.from, new Set());
      if (!neigh.has(e.to)) neigh.set(e.to, new Set());
      neigh.get(e.from)!.add(e.to);
      neigh.get(e.to)!.add(e.from);
    }
    return { data: { nodes: Array.from(nodeMap.values()), links }, neighbours: neigh };
  }, [graph, sourceFilter, search]);

  const isFaded = (nodeId: string) => {
    if (!hovered) return false;
    if (hovered.id === nodeId) return false;
    return !neighbours.get(hovered.id)?.has(nodeId);
  };

  const isLinkActive = (l: GraphLink) => {
    if (!hovered) return false;
    const s = typeof l.source === "string" ? l.source : l.source.id;
    const t = typeof l.target === "string" ? l.target : l.target.id;
    return s === hovered.id || t === hovered.id;
  };

  const stop = useCallback(() => {
    // Pin nodes + halt the animation loop entirely.
    for (const n of data.nodes as GraphNode[]) {
      if (n.x != null) n.fx = n.x;
      if (n.y != null) n.fy = n.y;
    }
    const fg = fgRef.current as { pauseAnimation?: () => void } | null;
    fg?.pauseAnimation?.();
  }, [data.nodes]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/library" className="text-[12px] text-muted-foreground hover:text-foreground">
            ← Library
          </Link>
          <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Capsule graph</h1>
          <p className="text-[13.5px] text-muted-foreground">
            Each capsule is a node; edges connect similar capsules. Hover to highlight, click to open.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title…"
            className="rounded-md bg-card border border-border px-3 py-2 text-[13px] w-52"
          />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
            className="rounded-md bg-card border border-border px-3 py-2 text-[13px]"
          >
            <option value="all">All sources</option>
            {Object.keys(SOURCE_COLOR).map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_260px] gap-4">
        <div
          ref={containerRef}
          className="rounded-lg border border-border bg-card overflow-hidden relative"
          style={{ height: dims.h }}
        >
          {!graph ? (
            <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground">
              Loading graph…
            </div>
          ) : data.nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground px-6 text-center">
              {graph.nodes.length === 0
                ? "No embedded capsules yet."
                : "No matches for the current filter."}
            </div>
          ) : (
            <ForceGraph2D
              ref={fgRef as never}
              graphData={data}
              width={dims.w - 2}
              height={dims.h - 2}
              backgroundColor="transparent"
              nodeRelSize={4}
              nodeVal={(n: GraphNode) => 1 + Math.min(8, (n.degree ?? 0))}
              nodeLabel={(n: GraphNode) =>
                `${n.title}\n${n.source} · ${n.degree ?? 0} link(s)`
              }
              linkWidth={(l: GraphLink) =>
                isLinkActive(l) ? 2.4 : Math.max(0.5, l.value * 1.8)
              }
              linkColor={(l: GraphLink) =>
                isLinkActive(l) ? "rgba(5,98,239,0.8)" : "rgba(120,120,120,0.18)"
              }
              nodeCanvasObjectMode={() => "after"}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const n = node as GraphNode;
                const r = 4 + Math.min(8, (n.degree ?? 0)) * 0.6;
                const color = SOURCE_COLOR[n.source] ?? "#6c7080";
                const faded = isFaded(n.id);
                const sel = selected?.id === n.id;

                // node disc
                ctx.beginPath();
                ctx.arc(n.x!, n.y!, r, 0, 2 * Math.PI);
                ctx.fillStyle = faded ? color + "33" : color;
                ctx.fill();
                if (sel || hovered?.id === n.id) {
                  ctx.lineWidth = 1.5 / globalScale;
                  ctx.strokeStyle = "#0562ef";
                  ctx.stroke();
                }

                // label
                if (globalScale > 0.6 || sel || hovered?.id === n.id) {
                  const label = n.title.length > 30 ? n.title.slice(0, 30) + "…" : n.title;
                  const fontSize = Math.max(8, 11 / globalScale);
                  ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "top";
                  ctx.fillStyle = faded ? "rgba(140,140,140,0.5)" : "currentColor";
                  ctx.fillText(label, n.x!, n.y! + r + 2);
                }
              }}
              warmupTicks={80}
              cooldownTicks={60}
              cooldownTime={2500}
              d3AlphaDecay={0.05}
              d3VelocityDecay={0.6}
              enableNodeDrag={true}
              onEngineStop={stop}
              onNodeDragEnd={(n) => {
                const node = n as GraphNode;
                node.fx = node.x;
                node.fy = node.y;
              }}
              onNodeHover={(n) => setHovered((n as GraphNode) ?? null)}
              onNodeClick={(n) => {
                const node = n as GraphNode;
                setSelected(node);
                // double-click navigates
              }}
              onBackgroundClick={() => setSelected(null)}
            />
          )}

          {graph && (
            <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] text-muted-foreground bg-card/80 backdrop-blur px-3 py-1.5 rounded-md border border-border">
              <span>{data.nodes.length} nodes · {data.links.length} edges</span>
            </div>
          )}
        </div>

        {/* detail sidebar */}
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
                <span>{selected.degree ?? 0} link(s)</span>
              </div>
              <Link
                href={`/capsule?id=${selected.id}`}
                className="rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium px-3 py-2 text-center hover:opacity-90"
              >
                Open capsule
              </Link>
              {neighbours.get(selected.id) && neighbours.get(selected.id)!.size > 0 && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground">Connected to</h3>
                  <ul className="flex flex-col gap-1">
                    {Array.from(neighbours.get(selected.id)!).slice(0, 8).map((nid) => {
                      const n = (data.nodes as GraphNode[]).find((x) => x.id === nid);
                      if (!n) return null;
                      return (
                        <li key={nid}>
                          <button
                            onClick={() => setSelected(n)}
                            className="w-full text-left text-[12.5px] hover:text-primary truncate"
                          >
                            · {n.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="font-heading text-[14px] font-medium">Pick a node</h2>
              <p className="text-[12.5px] text-muted-foreground">
                Hover to highlight a capsule and its neighbours. Click to see details + jump in.
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
              {graph && (
                <div className="text-[11.5px] text-muted-foreground mt-2">
                  Node size scales with neighbour count. Edge thickness scales with similarity.
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
