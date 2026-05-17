import { ImageResponse } from "next/og";

export const alt = "dropdat — Cross-AI memory in one click";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Required for `output: export` — bake once at build time, no runtime route.
export const dynamic = "force-static";

// Matches globals.css: --background #f5f9ff, --primary #0562ef, --foreground #0b1015
export default function OG() {
  const bg = "#f5f9ff";
  const primary = "#0562ef";
  const fg = "#0b1015";
  const muted = "#5b6271";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          display: "flex",
          flexDirection: "column",
          padding: 72,
          position: "relative",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          color: fg,
        }}
      >
        {/* Subtle ambient blue wash on the right, like the homepage gradient. */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -160,
            width: 640,
            height: 640,
            borderRadius: 9999,
            background:
              "radial-gradient(closest-side, rgba(5,98,239,0.18), rgba(5,98,239,0))",
            display: "flex",
          }}
        />

        {/* Vertical guide line — mirrors the homepage flowing-lines treatment. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 36,
            width: 2,
            background:
              "linear-gradient(to bottom, transparent, rgba(5,98,239,0.35), transparent)",
            display: "flex",
          }}
        />

        {/* Brand mark + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: primary,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 40,
              boxShadow: "0 14px 32px rgba(5,98,239,0.25)",
            }}
          >
            d
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 500,
              letterSpacing: -0.3,
              color: fg,
            }}
          >
            dropdat
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 600,
              letterSpacing: -1.8,
              lineHeight: 1.02,
              color: fg,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Cross-AI memory</span>
            <span>
              in <span style={{ color: primary }}>one click</span>.
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: muted,
              maxWidth: 920,
              display: "flex",
            }}
          >
            Capture any ChatGPT, Claude, or Gemini chat as a portable capsule.
            Drop it anywhere. Recall it from your coding agent.
          </div>
        </div>

        {/* Footer chip row */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: muted,
          }}
        >
          <Chip label="ChatGPT" />
          <Chip label="Claude" />
          <Chip label="Gemini" />
          <Chip label="MCP" />
          <div style={{ flex: 1, display: "flex" }} />
          <div style={{ color: primary, fontWeight: 500, display: "flex" }}>dropdat.app</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function Chip({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "8px 18px",
        borderRadius: 999,
        background: "#ffffff",
        border: "1px solid rgba(5,98,239,0.18)",
        color: "#0b1015",
        fontWeight: 500,
        display: "flex",
      }}
    >
      {label}
    </div>
  );
}
