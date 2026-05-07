"use client";
import { useEffect, useRef } from "react";

/**
 * Renders a "+" cross silhouette out of monospace digits on a canvas,
 * with subtle digit-cycling animation. Mirrors the supermemory.ai
 * `ascii-logo-canvas` decorative glyphs scattered around section headings.
 */
export function AsciiGlyph({
  width = 160,
  height = 80,
  digit = "9",
  color = "#0562ef",
  flip = false,
  className = "",
  speed = 1,
}: {
  width?: number;
  height?: number;
  digit?: string;
  color?: string;
  flip?: boolean;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cellW = 8;
    const cellH = 11;
    const fontPx = 11;
    const cols = Math.floor(width / cellW);
    const rows = Math.floor(height / cellH);

    // Stadium / capsule silhouette: 1 if cell center lies inside rounded rect
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const halfW = cols / 2;
    const halfH = rows / 2;
    const radius = halfH; // pure stadium — flat top/bottom + circular caps
    const flatHalfW = Math.max(0, halfW - radius);
    const inStadium = (c: number, r: number) => {
      const dx = Math.abs(c - cx);
      const dy = Math.abs(r - cy);
      if (dy > radius) return false;
      if (dx <= flatHalfW) return true;
      const ex = dx - flatHalfW;
      return Math.sqrt(ex * ex + dy * dy) <= radius;
    };

    let raf = 0;
    let running = true;

    const draw = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontPx}px "DM Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      const tt = t * 0.001 * speed;
      // Whizzing sweep: bright comet position (0..1) racing across the capsule
      const sweep = (tt * 0.6) % 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!inStadium(c, r)) continue;
          const dx = Math.abs(c - cx);
          const dy = Math.abs(r - cy);
          let edgeDist: number;
          if (dx <= flatHalfW) {
            edgeDist = radius - dy;
          } else {
            const ex = dx - flatHalfW;
            edgeDist = radius - Math.sqrt(ex * ex + dy * dy);
          }
          const t01 = Math.min(1, edgeDist / radius); // 0 = edge, 1 = center

          // Horizontal whiz position (0..1 left→right)
          const xn = c / Math.max(1, cols - 1);
          // Distance from sweep head, with trailing tail
          let trail = xn - sweep;
          // Wrap so the head re-enters from the left
          if (trail > 0) trail -= 1;
          // trail in (-1..0]; closer to 0 = brighter
          const tailLen = 0.32;
          const sweepGain = trail > -tailLen ? Math.pow(1 + trail / tailLen, 2.2) : 0;

          // Vertical shimmer + rim falloff baseline
          const baseWave = 0.5 + 0.5 * Math.sin(tt * 2.4 + t01 * 4 + r * 0.6);
          const baseA = (0.45 + 0.45 * (1 - t01)) * (0.5 + 0.5 * baseWave);

          // Combined alpha — sweep punches brightness up where the comet passes
          const a = Math.min(1, baseA * 0.55 + sweepGain * 0.95);

          // Digit cycles faster on the sweep so it visually "whizzes"
          const seed = (c * 1103515245 + r * 12345) ^ Math.floor(tt * (6 + sweepGain * 30));
          const ch = digit !== "_" ? digit : String.fromCharCode(48 + (Math.abs(seed) % 10));
          ctx.fillStyle = hexToRgba(color, Math.max(0.08, a));
          ctx.fillText(ch, c * cellW + cellW / 2, r * cellH);
        }
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [width, height, digit, color, speed]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={`block ${className}`}
      style={{
        width,
        height,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    />
  );
}

function hexToRgba(hex: string, a: number) {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}
