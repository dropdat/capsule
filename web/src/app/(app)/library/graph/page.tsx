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
  fx?: number;
  fy?: number;
  x?: number;
  y?: number;
};
type GraphLink = { source: string; target: string; value: number };

const SOURCE_COLOR: Record<string, string> = {
  chatgpt: "#10a37f",
  claude: "#cc785c",
  gemini: "#4285f4",
};

export default function GraphPage() {
  const api = useApi();
  const router = useRouter();
  const [graph, setGraph] = useState<CapsuleGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  const load = useCallback(async () => {
    setError(null);
    try {
      const g = await api<CapsuleGraph>("/api/v1/capsules/graph?nodes=200&k=3");
      setGraph(g);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  // Track container size so the graph fills the page width.
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: r.width, h: Math.max(420, window.innerHeight - 240) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const data = useMemo(() => {
    if (!graph) return { nodes: [], links: [] };
    return {
      nodes: graph.nodes.map((n) => ({ ...n })),
      links: graph.edges.map((e) => ({
        source: e.from,
        target: e.to,
        value: e.weight,
      })),
    };
  }, [graph]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/library" className="text-[12px] text-muted-foreground hover:text-foreground">
            ← Library
          </Link>
          <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Capsule graph</h1>
          <p className="text-[13.5px] text-muted-foreground">
            Each capsule is a node; edges connect capsules with similar content. Click any node to open it.
          </p>
        </div>
        {graph && (
          <span className="text-[12px] text-muted-foreground">
            {graph.nodes.length} nodes · {graph.edges.length} edges
          </span>
        )}
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        className="rounded-lg border border-border bg-card overflow-hidden"
        style={{ height: dims.h }}
      >
        {!graph ? (
          <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground">
            Loading graph…
          </div>
        ) : graph.nodes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground px-6 text-center">
            No embedded capsules yet. Capsules become nodes once they're embedded —
            this happens automatically a few seconds after capture.
          </div>
        ) : (
          <ForceGraph2D
            graphData={data}
            width={dims.w}
            height={dims.h}
            nodeRelSize={5}
            linkWidth={(l: GraphLink) => Math.max(0.6, l.value * 2)}
            linkColor={() => "rgba(120,120,120,0.35)"}
            nodeColor={(n: GraphNode) => SOURCE_COLOR[n.source] ?? "#6c7080"}
            nodeLabel={(n: GraphNode) => n.title}
            // Settle quickly and stay still.
            warmupTicks={60}
            cooldownTicks={50}
            cooldownTime={2000}
            d3AlphaDecay={0.05}
            d3VelocityDecay={0.6}
            enableNodeDrag={true}
            onEngineStop={() => {
              // Freeze every node where the simulation parked it so the
              // graph stops re-jittering after layout settles.
              for (const n of data.nodes as GraphNode[]) {
                if (n.x != null) n.fx = n.x;
                if (n.y != null) n.fy = n.y;
              }
            }}
            onNodeDragEnd={(n: GraphNode) => {
              // Pin a dragged node where the user dropped it.
              n.fx = n.x;
              n.fy = n.y;
            }}
            onNodeClick={(n: GraphNode) => router.push(`/capsule?id=${n.id}`)}
          />
        )}
      </div>

      <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
        {Object.entries(SOURCE_COLOR).map(([k, c]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span style={{ background: c }} className="h-2.5 w-2.5 rounded-full inline-block" />
            <span className="capitalize">{k}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
