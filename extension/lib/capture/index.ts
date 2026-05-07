import type { Message, CapsuleSource } from "../types";
import { scrapeChatGPT, chatgptTitle } from "./chatgpt";
import { scrapeClaude, claudeTitle } from "./claude";
import { scrapeGemini, geminiTitle } from "./gemini";
import { scrapeGeneric, genericTitle } from "./generic";

/**
 * Picks the right scraper based on the current host. Centralises the
 * per-platform "what counts as a message" logic so the injected button can
 * stay platform-agnostic.
 */
export function captureCurrent(): { source: CapsuleSource; title: string; messages: Message[] } | null {
  const host = location.hostname;
  if (host.endsWith("chatgpt.com") || host.endsWith("chat.openai.com")) {
    return { source: "chatgpt", title: chatgptTitle(), messages: scrapeChatGPT() };
  }
  if (host.endsWith("claude.ai")) {
    return { source: "claude", title: claudeTitle(), messages: scrapeClaude() };
  }
  if (host.endsWith("gemini.google.com")) {
    return { source: "gemini", title: geminiTitle(), messages: scrapeGemini() };
  }
  const source = detectGenericSource(host);
  if (source) {
    return { source, title: genericTitle(), messages: scrapeGeneric() };
  }
  return null;
}

function detectGenericSource(host: string): CapsuleSource | null {
  if (host.endsWith("grok.com") || host.endsWith("x.ai")) return "grok";
  if (host.endsWith("copilot.microsoft.com")) return "copilot";
  if (host.endsWith("perplexity.ai")) return "perplexity";
  return null;
}
