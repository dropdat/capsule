import type { Message } from "../types";

/**
 * Best-effort scraper for sites without a dedicated implementation.
 * Walks the DOM for likely message containers and tags them as
 * user/assistant by simple heuristics. Worse than a tailored scraper,
 * but enough to capture *something* on supported-but-unscraped hosts.
 */
export function scrapeGeneric(): Message[] {
  const seen = new Set<string>();
  const messages: Message[] = [];
  const now = new Date().toISOString();

  const candidates = [
    ...document.querySelectorAll<HTMLElement>(
      [
        '[data-message-author-role]',
        '[data-testid*="message"]',
        '[data-testid*="conversation-turn"]',
        'article[data-testid]',
        '[class*="message"]',
        '[class*="conversation-turn"]',
        '[role="article"]',
      ].join(",")
    ),
  ];

  for (const el of candidates) {
    const text = (el.innerText || el.textContent || "").trim();
    if (!text || text.length < 4) continue;
    if (seen.has(text)) continue;
    seen.add(text);

    const roleAttr =
      el.getAttribute("data-message-author-role") ||
      el.getAttribute("data-author") ||
      el.getAttribute("data-role") ||
      "";
    let role: Message["role"] = "assistant";
    const cls = el.className?.toString().toLowerCase() ?? "";
    if (
      roleAttr.toLowerCase().includes("user") ||
      cls.includes("user") ||
      el.querySelector('[class*="user-message" i]')
    ) {
      role = "user";
    }

    messages.push({ role, content: text, capturedAt: now });
  }

  return messages;
}

export function genericTitle(): string {
  return document.title?.trim() || "Untitled";
}
