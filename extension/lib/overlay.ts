/**
 * In-page overlays (toast + modal dialog) shown by content scripts when the
 * user takes an action the extension can't fulfill. Lives in the page origin
 * (no shadow DOM, but isolated by `dropdat-` class names + inline styles to
 * survive host-site CSS).
 */

const Z = 2147483600; // sit above most site UIs

export function showToast(text: string, kind: "info" | "error" = "info"): void {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: String(Z),
    maxWidth: "320px",
    padding: "10px 14px",
    borderRadius: "8px",
    background: kind === "error" ? "#1a0a0a" : "#0b1015",
    color: "#fff",
    border: `1px solid ${kind === "error" ? "#9b1c1c" : "#1f2937"}`,
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    font: "500 13px/1.4 ui-sans-serif, system-ui, sans-serif",
    opacity: "0",
    transform: "translateY(8px)",
    transition: "opacity .18s ease, transform .18s ease",
  } satisfies Partial<CSSStyleDeclaration>);
  document.documentElement.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 250);
  }, 3200);
}

export type DialogAction = {
  label: string;
  href?: string;
  primary?: boolean;
};

/**
 * Modal with a title, body, and 1+ action buttons. Returns the chosen label,
 * or null if the user dismissed it.
 */
export function showDialog(opts: {
  title: string;
  body: string;
  actions: DialogAction[];
}): Promise<string | null> {
  return new Promise((resolve) => {
    const root = document.createElement("div");
    Object.assign(root.style, {
      position: "fixed",
      inset: "0",
      zIndex: String(Z),
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      font: "400 14px/1.5 ui-sans-serif, system-ui, sans-serif",
      color: "#0b1015",
    } satisfies Partial<CSSStyleDeclaration>);

    const card = document.createElement("div");
    Object.assign(card.style, {
      width: "min(440px, 100%)",
      background: "#fff",
      borderRadius: "12px",
      padding: "22px 22px 18px",
      boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    } satisfies Partial<CSSStyleDeclaration>);

    const h = document.createElement("div");
    h.textContent = opts.title;
    Object.assign(h.style, {
      font: "600 17px/1.3 ui-sans-serif, system-ui, sans-serif",
      marginBottom: "8px",
    } satisfies Partial<CSSStyleDeclaration>);

    const p = document.createElement("div");
    p.textContent = opts.body;
    Object.assign(p.style, {
      color: "#3a4250",
      marginBottom: "18px",
      whiteSpace: "pre-wrap",
    } satisfies Partial<CSSStyleDeclaration>);

    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      gap: "8px",
      justifyContent: "flex-end",
    } satisfies Partial<CSSStyleDeclaration>);

    const close = (val: string | null) => {
      root.remove();
      resolve(val);
    };

    opts.actions.forEach((a) => {
      const b = document.createElement(a.href ? "a" : "button");
      b.textContent = a.label;
      if (a.href && b instanceof HTMLAnchorElement) {
        b.href = a.href;
        b.target = "_blank";
        b.rel = "noopener noreferrer";
      }
      Object.assign(b.style, {
        padding: "8px 14px",
        borderRadius: "8px",
        border: a.primary ? "1px solid #0562ef" : "1px solid #d8dde5",
        background: a.primary ? "#0562ef" : "#fff",
        color: a.primary ? "#fff" : "#0b1015",
        font: "600 13px/1 ui-sans-serif, system-ui, sans-serif",
        cursor: "pointer",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
      } satisfies Partial<CSSStyleDeclaration>);
      b.addEventListener("click", () => close(a.label));
      row.appendChild(b);
    });

    card.appendChild(h);
    card.appendChild(p);
    card.appendChild(row);
    root.appendChild(card);
    root.addEventListener("click", (e) => {
      if (e.target === root) close(null);
    });
    document.documentElement.appendChild(root);
  });
}
