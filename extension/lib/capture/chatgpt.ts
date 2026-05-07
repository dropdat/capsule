import type { Message } from "../types";

/**
 * Scrape the visible message thread from chatgpt.com.
 *
 * ChatGPT's DOM changes often. Try a cascade of selectors, log what we found
 * so failures are debuggable from the console.
 */
export function scrapeChatGPT(): Message[] {
  const now = new Date().toISOString();

  // Strategy 1: every element with data-message-author-role is a message.
  // This attribute has been stable across multiple ChatGPT redesigns.
  const tagged = document.querySelectorAll<HTMLElement>("[data-message-author-role]");
  if (tagged.length > 0) {
    const out: Message[] = [];
    tagged.forEach((el) => {
      const role = (el.getAttribute("data-message-author-role") as Message["role"]) ?? "assistant";
      // Some assistant containers wrap a separate "result-streaming" inner div with the actual text.
      const body =
        el.querySelector<HTMLElement>("[data-message-id]") ??
        el.querySelector<HTMLElement>(".markdown") ??
        el;
      const text = (body.innerText ?? body.textContent ?? "").trim();
      if (text) out.push({ role, content: text, capturedAt: now });
    });
    if (out.length) {
      console.log(`[dropdat] scrapeChatGPT: ${out.length} messages via data-message-author-role`);
      return out;
    }
  }

  // Strategy 2: conversation-turn articles (legacy)
  const turns = document.querySelectorAll<HTMLElement>('article[data-testid^="conversation-turn-"]');
  if (turns.length > 0) {
    const out: Message[] = [];
    turns.forEach((turn) => {
      const roleEl = turn.querySelector<HTMLElement>("[data-message-author-role]");
      const role = (roleEl?.dataset.messageAuthorRole as Message["role"]) ?? "assistant";
      const text = (turn.innerText ?? "").trim();
      if (text) out.push({ role, content: text, capturedAt: now });
    });
    if (out.length) {
      console.log(`[dropdat] scrapeChatGPT: ${out.length} messages via conversation-turn`);
      return out;
    }
  }

  // Strategy 3: any article inside main, alternate roles
  const articles = document.querySelectorAll<HTMLElement>("main article");
  if (articles.length > 0) {
    const now2 = new Date().toISOString();
    const out: Message[] = [];
    articles.forEach((a, i) => {
      const text = (a.innerText ?? "").trim();
      if (!text) return;
      out.push({ role: i % 2 === 0 ? "user" : "assistant", content: text, capturedAt: now2 });
    });
    if (out.length) {
      console.log(`[dropdat] scrapeChatGPT: ${out.length} messages via main article fallback`);
      return out;
    }
  }

  console.warn("[dropdat] scrapeChatGPT: no messages found. Sample DOM:", {
    main: document.querySelector("main")?.outerHTML?.slice(0, 400),
  });
  return [];
}

export function chatgptTitle(): string {
  const docTitle = document.title.replace(/\s*[-—|]\s*ChatGPT\s*$/i, "").trim();
  if (docTitle && docTitle.toLowerCase() !== "chatgpt") return docTitle;
  const first = document.querySelector<HTMLElement>('[data-message-author-role="user"]');
  return ((first?.innerText ?? "Untitled chat").trim()).slice(0, 80);
}
