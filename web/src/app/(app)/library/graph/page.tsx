"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { useApi, ApiError, type CapsuleGraph } from "@/lib/api";
import { Paywall } from "@/components/Paywall";

type GraphNode = {
  id: string;
  title: string;
  source: string;
  degree: number;
  angle: number; // radians on the circle
  x: number;
  y: number;
};
type GraphLink = {
  from: string;
  to: string;
  value: number;
};

const SOURCE_COLOR: Record<string, string> = {
  chatgpt: "#10a37f",
  claude: "#cc785c",
  gemini: "#4285f4",
};

const SOURCE_ORDER = ["chatgpt", "claude", "gemini"];

export default function GraphPage() {
  const api = useApi();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [graph, setGraph] = useState<CapsuleGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState({ fg: "#0b1015", fgMuted: "rgba(140,140,140,0.6)" });

  useEffect(() => {
    const findDarkRoot = () => {
      // Dark mode class lives on an inner wrapper (ThemeProvider), not on
      // <html>, so read --foreground from the nearest element that resolves
      // the correct value. Falls back to <html> if the wrapper isn't found.
      const node = containerRef.current?.closest("[data-dashboard]") ?? document.documentElement;
      return node as Element;
    };
    const update = () => {
      if (typeof window === "undefined") return;
      const cs = getComputedStyle(findDarkRoot());
      const fg = cs.getPropertyValue("--foreground").trim() || cs.color || "#0b1015";
      setTheme({ fg, fgMuted: fg + "99" });
    };
    update();
    const root = findDarkRoot();
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const [paywall, setPaywall] = useState<string | null>(null);
  // useApi() returns a fresh function each render; depending on it in a
  // useEffect causes an infinite fetch loop. Pin it in a ref and run once.
  const apiRef = useRef(api);
  apiRef.current = api;
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const g = await apiRef.current<CapsuleGraph>("/api/v1/capsules/graph?nodes=300&k=4");
        if (!cancelled) setGraph(g);
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
  }, []);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: r.width, h: Math.max(520, window.innerHeight - 240) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Place nodes on a circle, grouped by source. Compute neighbours map.
  const { nodes, links, byId, neighbours, cx, cy, radius } = useMemo(() => {
    const empty = {
      nodes: [] as GraphNode[],
      links: [] as GraphLink[],
      byId: new Map<string, GraphNode>(),
      neighbours: new Map<string, Set<string>>(),
      cx: dims.w / 2,
      cy: dims.h / 2,
      radius: 0,
    };
    if (!graph) return empty;

    const lower = search.trim().toLowerCase();
    const matchNode = (n: { id: string; title: string; source: string }) => {
      if (sourceFilter !== "all" && n.source !== sourceFilter) return false;
      if (lower && !n.title.toLowerCase().includes(lower)) return false;
      return true;
    };

    const kept = graph.nodes.filter(matchNode);
    if (kept.length === 0) return empty;

    // Group by source, then within group by title for stable layout.
    kept.sort((a, b) => {
      const sa = SOURCE_ORDER.indexOf(a.source);
      const sb = SOURCE_ORDER.indexOf(b.source);
      if (sa !== sb) return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb);
      return a.title.localeCompare(b.title);
    });

    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const r = Math.max(120, Math.min(dims.w, dims.h) / 2 - 110);
    const n = kept.length;
    const built: GraphNode[] = kept.map((node, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2; // start at top
      return {
        id: node.id,
        title: node.title,
        source: node.source,
        degree: 0,
        angle,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      };
    });
    const byId = new Map(built.map((n) => [n.id, n]));

    const links: GraphLink[] = [];
    const neigh = new Map<string, Set<string>>();
    for (const e of graph.edges) {
      if (!byId.has(e.from) || !byId.has(e.to)) continue;
      links.push({ from: e.from, to: e.to, value: e.weight });
      byId.get(e.from)!.degree++;
      byId.get(e.to)!.degree++;
      if (!neigh.has(e.from)) neigh.set(e.from, new Set());
      if (!neigh.has(e.to)) neigh.set(e.to, new Set());
      neigh.get(e.from)!.add(e.to);
      neigh.get(e.to)!.add(e.from);
    }
    return { nodes: built, links, byId, neighbours: neigh, cx, cy, radius: r };
  }, [graph, sourceFilter, search, dims]);

  const isActiveNode = (id: string) => {
    if (!hovered) return true;
    if (hovered === id) return true;
    return neighbours.get(hovered)?.has(id) ?? false;
  };
  const isActiveLink = (l: GraphLink) => {
    if (!hovered) return false;
    return l.from === hovered || l.to === hovered;
  };

  if (paywall) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link href="/library" className="text-[12px] text-muted-foreground hover:text-foreground">
            ← Library
          </Link>
          <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Capsule graph</h1>
        </div>
        <Paywall title="Similarity graphs are an Ultimate feature" message={paywall} requiredTier="Ultimate" />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/library" className="text-[12px] text-muted-foreground hover:text-foreground">
            ← Library
          </Link>
          <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Capsule graph</h1>
          <p className="text-[13.5px] text-muted-foreground">
            Capsules on a ring, grouped by source. Arcs connect similar ones — hover a node to focus.
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
          ) : nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground px-6 text-center">
              {graph.nodes.length === 0
                ? "No embedded capsules yet."
                : "No matches for the current filter."}
            </div>
          ) : (
            <svg
              width={dims.w}
              height={dims.h}
              onClick={() => setSelected(null)}
              style={{ display: "block" }}
            >
              {/* edges: quadratic Bezier through the centre for a chord look */}
              <g>
                {links.map((l, i) => {
                  const a = byId.get(l.from)!;
                  const b = byId.get(l.to)!;
                  const active = isActiveLink(l);
                  const dimmed = hovered && !active;
                  // Curve toward centre — tighter for nodes closer together.
                  const mx = cx + (a.x + b.x - 2 * cx) * 0.15;
                  const my = cy + (a.y + b.y - 2 * cy) * 0.15;
                  return (
                    <path
                      key={i}
                      d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                      fill="none"
                      stroke={active ? "#0562ef" : "rgba(120,120,120,0.35)"}
                      strokeOpacity={dimmed ? 0.08 : active ? 0.9 : Math.min(0.6, 0.2 + l.value * 0.6)}
                      strokeWidth={active ? 1.8 : Math.max(0.5, l.value * 1.4)}
                    />
                  );
                })}
              </g>

              {/* nodes + labels */}
              <g>
                {nodes.map((n) => {
                  const r = 4 + Math.min(8, n.degree) * 0.6;
                  const color = SOURCE_COLOR[n.source] ?? "#6c7080";
                  const active = isActiveNode(n.id);
                  const sel = selected?.id === n.id;
                  const labelR = radius + 12;
                  const lx = cx + Math.cos(n.angle) * labelR;
                  const ly = cy + Math.sin(n.angle) * labelR;
                  // Always horizontal — anchor based on which half we're on.
                  const onRight = Math.cos(n.angle) >= 0;
                  const anchor = onRight ? "start" : "end";
                  const label = n.title.length > 28 ? n.title.slice(0, 28) + "…" : n.title;
                  return (
                    <g
                      key={n.id}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHovered(n.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(n);
                      }}
                    >
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={r}
                        fill={color}
                        opacity={active ? 1 : 0.25}
                        stroke={sel || hovered === n.id ? "#0562ef" : "none"}
                        strokeWidth={1.5}
                      />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor={anchor}
                        dominantBaseline="middle"
                        fontSize={11}
                        fill={active ? theme.fg : theme.fgMuted}
                        style={{ pointerEvents: "none", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {graph && nodes.length > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] text-muted-foreground bg-card/80 backdrop-blur px-3 py-1.5 rounded-md border border-border">
              <span>{nodes.length} nodes · {links.length} edges</span>
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
                <span>{selected.degree} link(s)</span>
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
                      const n = byId.get(nid);
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
                Hover to focus on a capsule and its neighbours. Click to see details + jump in.
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
                  Node size scales with neighbour count. Arc thickness scales with similarity.
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
