import type { Message } from "../types";

/**
 * Scrape the visible message thread from gemini.google.com.
 *
 * Gemini's DOM uses Angular component tags. User turns live under
 * `user-query` and model turns under `model-response`. Both expose
 * a text container with the rendered conversation content.
 */
export function scrapeGemini(): Message[] {
  const now = new Date().toISOString();
  const out: Message[] = [];

  const userTurns = document.querySelectorAll<HTMLElement>("user-query .query-text, user-query");
  const modelTurns = document.querySelectorAll<HTMLElement>("model-response .markdown, model-response message-content, model-response");

  if (userTurns.length || modelTurns.length) {
    const all: Array<{ el: HTMLElement; role: Message["role"] }> = [];
    userTurns.forEach((el) => all.push({ el, role: "user" }));
    modelTurns.forEach((el) => all.push({ el, role: "assistant" }));
    all.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const seen = new Set<HTMLElement>();
    all.forEach(({ el, role }) => {
      // Skip nested duplicates: if a parent we already captured contains this el
      for (const s of seen) if (s.contains(el) || el.contains(s)) return;
      seen.add(el);
      const text = (el.innerText ?? "").trim();
      if (text) out.push({ role, content: text, capturedAt: now });
    });
    if (out.length) return out;
  }

  return scrapeFallback(now);
}

function scrapeFallback(now: string): Message[] {
  const blocks = document.querySelectorAll<HTMLElement>('chat-window div[class*="conversation"] div[class*="container"]');
  const out: Message[] = [];
  blocks.forEach((b, i) => {
    const text = (b.innerText ?? "").trim();
    if (!text) return;
    out.push({ role: i % 2 === 0 ? "user" : "assistant", content: text, capturedAt: now });
  });
  return out;
}

export function geminiTitle(): string {
  const t = document.title.replace(/\s*[-—|]\s*Gemini\s*$/i, "").trim();
  if (t && t.toLowerCase() !== "gemini") return t;
  const first = document.querySelector<HTMLElement>("user-query");
  return (first?.innerText ?? "Untitled chat").slice(0, 80);
}
