"use client";
import { useEffect, useRef } from "react";

/**
 * Animated ASCII-digit band. Draws:
 *  - Background field of digits with rolling sine-wave intensity.
 *  - Three concentric capsule (stadium) outlines rendered as bright
 *    digits sitting inside that same field — no SVG overlay.
 */
export function AsciiBand() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const cellW = isMobile ? 14 : 12;
    const cellH = isMobile ? 20 : 18;
    const fontPx = isMobile ? 11 : 12;

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    /** Distance from a point to a stadium (rounded rect) outline.
     *  Negative = inside. Returns absolute distance to nearest edge. */
    const stadiumDist = (
      px: number,
      py: number,
      cx: number,
      cy: number,
      halfW: number,
      halfH: number
    ) => {
      const r = halfH;
      const flatHalf = Math.max(0, halfW - r);
      const dx = Math.abs(px - cx);
      const dy = Math.abs(py - cy);
      const ex = Math.max(0, dx - flatHalf);
      return Math.sqrt(ex * ex + dy * dy) - r;
    };

    const draw = (t: number) => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0763ee";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontPx}px "DM Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";

      const cols = Math.ceil(w / cellW);
      const rows = Math.ceil(h / cellH);
      const cx = w / 2;
      const cy = h / 2;
      const tt = t * 0.00018;

      // 3 concentric capsule rims (outer → inner)
      const outerHalfW = w * 0.22;
      const outerHalfH = h * 0.40;
      const rims = [
        { hw: outerHalfW,        hh: outerHalfH,        thick: 6 },
        { hw: outerHalfW * 0.78, hh: outerHalfH * 0.74, thick: 5 },
        { hw: outerHalfW * 0.58, hh: outerHalfH * 0.50, thick: 4 },
      ];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellW;
          const y = r * cellH;
          const px = x + cellW / 2;
          const py = y + cellH / 2;

          // Is this cell on/near any rim?
          let rimAlpha = 0;
          for (const rim of rims) {
            const d = Math.abs(stadiumDist(px, py, cx, cy, rim.hw, rim.hh));
            if (d < rim.thick) {
              rimAlpha = Math.max(rimAlpha, 1 - d / rim.thick);
            }
          }
          // Inside innermost rim → leave dark (very faint chars)
          const insideInner = stadiumDist(px, py, cx, cy, rims[2].hw, rims[2].hh) < -2;

          // Background wave field
          const wave =
            0.5 +
            0.5 * Math.sin(c * 0.18 + tt * 6 + Math.sin(r * 0.15 + tt * 4) * 1.4);
          const vfall = 1 - Math.abs(y / h - 0.5) * 0.6;
          // Radial fade so the centre stays uncluttered around the logo.
          const ndx = (px - cx) / (w * 0.5);
          const ndy = (py - cy) / (h * 0.5);
          const radial = Math.min(1, Math.sqrt(ndx * ndx + ndy * ndy));
          const centreClear = Math.max(0, Math.min(1, (radial - 0.18) / 0.32));
          const bgIntensity = Math.max(0, Math.min(1, wave * vfall * centreClear));

          let alpha: number;
          if (rimAlpha > 0) {
            alpha = 0.32 + rimAlpha * 0.55;
          } else if (insideInner) {
            alpha = 0.02 + bgIntensity * 0.04;
          } else {
            alpha = 0.04 + bgIntensity * 0.42;
          }

          // Stable per-cell digit, slow time evolution
          const seed = (c * 374761393 + r * 668265263) ^ Math.floor(tt * 12);
          const digit = Math.abs(seed) % 10;

          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.fillText(digit.toString(), x, y);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <section className="w-full bg-primary-deep relative overflow-hidden flex items-center justify-center h-[260px] sm:h-[320px] md:h-[360px]">
      <div className="w-full relative h-full">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
          <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
            <img
              src="/brand/logo.svg"
              alt=""
              className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            />
            <span className="font-heading text-white text-[18px] sm:text-[20px] font-medium tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              dropdat
            </span>
            <span className="font-mono text-white/85 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
              one click · any AI · same memory
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
