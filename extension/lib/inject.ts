import type { Capsule, CapsuleSource } from "./types";

/**
 * Format a capsule as a plain-text payload to drop into a destination chat
 * composer. Kept terse so the model still sees room for the user's actual
 * follow-up question.
 */
export function formatForInjection(c: Capsule): string {
  const lines: string[] = [
    `[dropdat capsule · ${c.title}]`,
    "",
    c.summary && `Summary: ${c.summary}`,
    "",
    "--- Conversation ---",
    ...c.messages.map((m) => `\n${m.role.toUpperCase()}:\n${m.content}`),
    "",
    `[end capsule · v${c.version} · ${c.id.slice(0, 8)}]`,
  ].filter(Boolean) as string[];
  return lines.join("\n");
}

/**
 * Find the chat composer for the current platform and insert text into it.
 * Returns true on success.
 */
export function injectIntoComposer(source: CapsuleSource, text: string): boolean {
  const target = findComposer(source);
  if (!target) return false;

  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    target.value = target.value.slice(0, start) + text + target.value.slice(end);
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.focus();
    return true;
  }

  // contentEditable (most modern composers)
  if ((target as HTMLElement).isContentEditable) {
    target.focus();
    document.execCommand("insertText", false, text);
    return true;
  }

  return false;
}

function findComposer(source: CapsuleSource): HTMLElement | null {
  switch (source) {
    case "chatgpt":
      return (
        document.querySelector<HTMLElement>("#prompt-textarea") ??
        document.querySelector<HTMLElement>('div[contenteditable="true"]')
      );
    case "claude":
      return (
        document.querySelector<HTMLElement>('div[contenteditable="true"]') ??
        document.querySelector<HTMLTextAreaElement>("textarea")
      );
    case "gemini":
      return (
        document.querySelector<HTMLElement>('div[contenteditable="true"]') ??
        document.querySelector<HTMLTextAreaElement>("textarea")
      );
  }
}
