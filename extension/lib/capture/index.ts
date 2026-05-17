import type { Message, CapsuleSource, ImageRef } from "../types";
import { scrapeChatGPT, chatgptTitle } from "./chatgpt";
import { scrapeClaude, claudeTitle } from "./claude";
import { scrapeGemini, geminiTitle } from "./gemini";
import { scrapeGeneric, genericTitle } from "./generic";
import { collectImages } from "./images";

/**
 * Picks the right scraper based on the current host. Centralises the
 * per-platform "what counts as a message" logic so the injected button can
 * stay platform-agnostic.
 *
 * Also collects every meaningful <img> in the active chat region — the
 * background uploads these as capsule attachments after sync.
 */
export function captureCurrent(): { source: CapsuleSource; title: string; messages: Message[]; images: ImageRef[] } | null {
  const host = location.hostname;
  let base: { source: CapsuleSource; title: string; messages: Message[] } | null = null;
  if (host.endsWith("chatgpt.com") || host.endsWith("chat.openai.com")) {
    base = { source: "chatgpt", title: chatgptTitle(), messages: scrapeChatGPT() };
  } else if (host.endsWith("claude.ai")) {
    base = { source: "claude", title: claudeTitle(), messages: scrapeClaude() };
  } else if (host.endsWith("gemini.google.com")) {
    base = { source: "gemini", title: geminiTitle(), messages: scrapeGemini() };
  } else {
    const source = detectGenericSource(host);
    if (source) {
      base = { source, title: genericTitle(), messages: scrapeGeneric() };
    }
  }
  if (!base) return null;
  // Image scrape — main is the chat region on every supported provider.
  const root = document.querySelector<HTMLElement>("main") ?? document.body;
  const images = collectImages(root).slice(0, 20); // hard cap per capsule
  return { ...base, images };
}

function detectGenericSource(host: string): CapsuleSource | null {
  if (host.endsWith("grok.com") || host.endsWith("x.ai")) return "grok";
  if (host.endsWith("copilot.microsoft.com")) return "copilot";
  if (host.endsWith("perplexity.ai")) return "perplexity";
  return null;
}
