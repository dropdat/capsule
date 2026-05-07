import type { Message } from "../types";

/**
 * Scrape the visible message thread from claude.ai.
 *
 * Claude wraps each message in a div with data-test-render-count or
 * a stable container `[data-testid="user-message"]` / `[data-is-streaming]`.
 * Fallback walks `main [class*="font-claude-message"]` and assumes alternating roles.
 */
export function scrapeClaude(): Message[] {
  const now = new Date().toISOString();
  const out: Message[] = [];

  // Primary selectors
  const userMsgs = document.querySelectorAll<HTMLElement>('[data-testid="user-message"]');
  const asstMsgs = document.querySelectorAll<HTMLElement>('[data-is-streaming], div.font-claude-message, [class*="font-claude-message"]');

  if (userMsgs.length || asstMsgs.length) {
    const all: Array<{ el: HTMLElement; role: Message["role"] }> = [];
    userMsgs.forEach((el) => all.push({ el, role: "user" }));
    asstMsgs.forEach((el) => all.push({ el, role: "assistant" }));
    all.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    all.forEach(({ el, role }) => {
      const text = (el.innerText ?? "").trim();
      if (text) out.push({ role, content: text, capturedAt: now });
    });
    if (out.length) return out;
  }

  return scrapeFallback(now);
}

function scrapeFallback(now: string): Message[] {
  const blocks = document.querySelectorAll<HTMLElement>("main div.group, main article");
  const out: Message[] = [];
  blocks.forEach((b, i) => {
    const text = (b.innerText ?? "").trim();
    if (!text) return;
    out.push({ role: i % 2 === 0 ? "user" : "assistant", content: text, capturedAt: now });
  });
  return out;
}

export function claudeTitle(): string {
  const t = document.title.replace(/\s*[-—|]\s*Claude\s*$/i, "").trim();
  if (t && t.toLowerCase() !== "claude") return t;
  const first = document.querySelector<HTMLElement>('[data-testid="user-message"]');
  return (first?.innerText ?? "Untitled chat").slice(0, 80);
}
