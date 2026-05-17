"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ChordNode = { id: string; title: string; source: string };
export type ChordEdge = { from: string; to: string; weight: number };

type Props = {
  nodes: ChordNode[];
  edges: ChordEdge[];
  sourceColor: Record<string, string>;
  height?: number; // override container height
  onNodeClick?: (n: ChordNode & { degree: number }) => void;
  selectedId?: string | null;
  groupOrder?: string[]; // ordering for nodes by source group
};

// Labels and edges inherit foreground via currentColor — the parent CSS
// already sets `color: var(--foreground)`, so light/dark just works. We used
// to read --foreground from documentElement which always returned the light
// value because the .dark class lives on an inner wrapper, not on <html>.

type LaidOutNode = ChordNode & {
  degree: number;
  angle: number;
  x: number;
  y: number;
};

export function ChordGraph({
  nodes,
  edges,
  sourceColor,
  height,
  onNodeClick,
  selectedId,
  groupOrder,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 520 });
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        const h = height ?? Math.max(480, window.innerHeight - 240);
        setDims({ w: r.width, h });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [height]);

  const { laid, byId, neighbours, cx, cy, radius } = useMemo(() => {
    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const radius = Math.max(120, Math.min(dims.w, dims.h) / 2 - 110);
    if (nodes.length === 0) {
      return {
        laid: [] as LaidOutNode[],
        byId: new Map<string, LaidOutNode>(),
        neighbours: new Map<string, Set<string>>(),
        cx,
        cy,
        radius,
      };
    }
    const order = groupOrder ?? [];
    const sorted = [...nodes].sort((a, b) => {
      const sa = order.indexOf(a.source);
      const sb = order.indexOf(b.source);
      if (sa !== sb) return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb);
      return a.title.localeCompare(b.title);
    });
    const n = sorted.length;
    const laid: LaidOutNode[] = sorted.map((node, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        ...node,
        degree: 0,
        angle,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });
    const byId = new Map(laid.map((n) => [n.id, n]));
    const neigh = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!byId.has(e.from) || !byId.has(e.to)) continue;
      byId.get(e.from)!.degree++;
      byId.get(e.to)!.degree++;
      if (!neigh.has(e.from)) neigh.set(e.from, new Set());
      if (!neigh.has(e.to)) neigh.set(e.to, new Set());
      neigh.get(e.from)!.add(e.to);
      neigh.get(e.to)!.add(e.from);
    }
    return { laid, byId, neighbours: neigh, cx, cy, radius };
  }, [nodes, edges, dims, groupOrder]);

  const isActiveNode = (id: string) => {
    if (!hovered) return true;
    if (hovered === id) return true;
    return neighbours.get(hovered)?.has(id) ?? false;
  };
  const isActiveLink = (from: string, to: string) => {
    if (!hovered) return false;
    return from === hovered || to === hovered;
  };

  return (
    <div
      ref={containerRef}
      className="w-full text-foreground"
      style={{ height: dims.h }}
    >
      {nodes.length === 0 ? null : (
        <svg width={dims.w} height={dims.h} style={{ display: "block", color: "currentColor" }}>
          <g>
            {edges.map((e, i) => {
              const a = byId.get(e.from);
              const b = byId.get(e.to);
              if (!a || !b) return null;
              const active = isActiveLink(e.from, e.to);
              const dimmed = hovered && !active;
              const mx = cx + (a.x + b.x - 2 * cx) * 0.15;
              const my = cy + (a.y + b.y - 2 * cy) * 0.15;
              return (
                <path
                  key={i}
                  d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                  fill="none"
                  stroke={active ? "#0562ef" : "currentColor"}
                  strokeOpacity={dimmed ? 0.06 : active ? 0.9 : Math.min(0.5, 0.15 + e.weight * 0.5)}
                  strokeWidth={active ? 1.8 : Math.max(0.5, e.weight * 1.4)}
                />
              );
            })}
          </g>
          <g>
            {laid.map((n) => {
              const r = 4 + Math.min(8, n.degree) * 0.6;
              const color = sourceColor[n.source] ?? "#6c7080";
              const active = isActiveNode(n.id);
              const sel = selectedId === n.id;
              const labelR = radius + 12;
              const lx = cx + Math.cos(n.angle) * labelR;
              const ly = cy + Math.sin(n.angle) * labelR;
              const onRight = Math.cos(n.angle) >= 0;
              const anchor = onRight ? "start" : "end";
              const label = n.title.length > 28 ? n.title.slice(0, 28) + "…" : n.title;
              return (
                <g
                  key={n.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onNodeClick?.(n);
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
                    fill="currentColor"
                    opacity={active ? 1 : 0.4}
                    style={{
                      pointerEvents: "none",
                      fontFamily: "ui-sans-serif, system-ui, sans-serif",
                    }}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
}
