/**
 * Injects the dropdat capsule button into the chat composer.
 *
 * IMPORTANT — IndexedDB scope: content scripts run in the *page's* origin
 * (chatgpt.com / claude.ai / gemini.google.com). Their indexedDB is NOT
 * shared with the extension's background worker or popup, which run in the
 * extension origin. So we send the capsule to the background worker via
 * `chrome.runtime.sendMessage` and let the worker own all persistence.
 */
import { captureCurrent } from "./capture";
import { newCapsuleId } from "./uuid";
import type { Capsule } from "./types";

const BTN_ID = "dropdat-capsule-btn";

const ICON_NORMAL = `
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="2" y="8" width="20" height="8" rx="4" />
  <path d="M12 8v8" />
</svg>`;
const ICON_LOADING = `
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <circle cx="12" cy="12" r="9" stroke-opacity="0.25" />
  <path d="M21 12a9 9 0 0 1-9 9">
    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
  </path>
</svg>`;
const ICON_OK = `
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
     stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>`;
const ICON_FAIL = `
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
     stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M18 6 6 18M6 6l12 12" />
</svg>`;

export function mountCapsuleButton() {
  injectButton();
  const obs = new MutationObserver(() => {
    if (!document.getElementById(BTN_ID)) injectButton();
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

function injectButton() {
  if (document.getElementById(BTN_ID)) return;

  const btn = makeButton();
  const slot = findComposerSlot();

  if (slot) {
    styleInline(btn);
    slot.before(btn); // capsule lands immediately before the voice/mic button
    console.log("[dropdat] inline-mounted capsule before:", slot);
    return;
  }

  // Debug — log what we found in the composer so we can extend selectors
  const composer = findComposer();
  if (composer) {
    const buttons = [...composer.querySelectorAll("button")].map((b) => ({
      ariaLabel: b.getAttribute("aria-label"),
      testId: b.getAttribute("data-testid"),
      title: b.getAttribute("title"),
    }));
    console.warn("[dropdat] no inline slot found; composer buttons:", buttons);
  } else {
    console.warn("[dropdat] no composer element found at all");
  }

  styleFloating(btn);
  if (composer) {
    const composerRect = composer.getBoundingClientRect();
    btn.style.bottom = `${window.innerHeight - composerRect.top + 8}px`;
    btn.style.right = `${Math.max(20, window.innerWidth - composerRect.right + 8)}px`;
  }
  document.body.appendChild(btn);
}

/**
 * Returns an existing composer-button to anchor before. We prefer the voice
 * (orange) button so the capsule lands between the mic and the voice button.
 * If voice isn't present (e.g. Claude / Gemini), fall back to other anchors
 * so the button still slots inline.
 */
function findComposerSlot(): HTMLElement | null {
  const composer = findComposer();
  if (!composer) return null;

  const voiceCandidates: (HTMLElement | null)[] = [
    composer.querySelector<HTMLElement>('[data-testid="composer-speech-button"]'),
    composer.querySelector<HTMLElement>('button[aria-label*="voice" i]'),
    composer.querySelector<HTMLElement>('button[aria-label*="dictation" i]'),
  ];
  const voice = voiceCandidates.find(Boolean);
  if (voice) return voice;

  const fallbackCandidates: (HTMLElement | null)[] = [
    composer.querySelector<HTMLElement>('button[aria-label*="dictate" i]'),
    composer.querySelector<HTMLElement>('button[aria-label*="microphone" i]'),
    composer.querySelector<HTMLElement>('button[aria-label*="attach" i]'),
    composer.querySelector<HTMLElement>('button[aria-label*="upload" i]'),
  ];
  return fallbackCandidates.find(Boolean) ?? null;
}

function findComposer(): HTMLElement | null {
  // ChatGPT can render multiple <form>s on the page (e.g., search/login forms).
  // The composer is the form that contains the "Add files and more" plus button,
  // which uniquely uses data-testid="composer-plus-btn".
  const plus = document.querySelector<HTMLElement>('[data-testid="composer-plus-btn"]');
  if (plus) {
    const form = plus.closest("form");
    if (form) return form as HTMLElement;
    const div = plus.closest('div[data-testid="composer"]');
    if (div) return div as HTMLElement;
    if (plus.parentElement) return plus.parentElement;
  }

  return (
    document.querySelector<HTMLElement>('form[data-type="unified-composer"]') ??
    document.querySelector<HTMLElement>('div[data-testid="composer"]') ??
    document.querySelector<HTMLElement>("form")
  );
}

function makeButton(): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.id = BTN_ID;
  btn.type = "button";
  btn.title = "Capture chat as dropdat capsule";
  btn.setAttribute("aria-label", "Capture as dropdat capsule");
  btn.innerHTML = ICON_NORMAL;

  const setState = (icon: string, color?: string) => {
    btn.innerHTML = icon;
    if (color) btn.style.background = color;
  };

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    btn.disabled = true;
    setState(ICON_LOADING);
    try {
      await captureAndSave();
      setState(ICON_OK, "#0a8f4a");
    } catch (err) {
      console.error("[dropdat] capture failed", err);
      setState(ICON_FAIL, "#c0392b");
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = ICON_NORMAL;
        btn.style.background = "#0562ef";
      }, 1500);
    }
  });

  return btn;
}

function styleInline(btn: HTMLButtonElement) {
  Object.assign(btn.style, {
    position: "relative",
    width: "36px",
    height: "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    margin: "0 4px",
    background: "#0562ef",
    color: "#fff",
    border: "none",
    borderRadius: "9999px",
    cursor: "pointer",
    boxShadow: "0 2px 6px -2px rgba(5,98,239,0.55)",
    transition: "transform 120ms ease, background 120ms ease",
    flex: "none",
    verticalAlign: "middle",
  } satisfies Partial<CSSStyleDeclaration>);
  hoverScale(btn);
}

function styleFloating(btn: HTMLButtonElement) {
  Object.assign(btn.style, {
    position: "fixed",
    right: "20px",
    bottom: "120px",
    zIndex: "2147483647",
    width: "40px",
    height: "40px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    background: "#0562ef",
    color: "#fff",
    border: "none",
    borderRadius: "9999px",
    cursor: "pointer",
    boxShadow: "0 6px 16px -4px rgba(5,98,239,0.55), 0 2px 4px rgba(0,0,0,0.12)",
    transition: "transform 120ms ease, background 120ms ease, box-shadow 120ms ease",
  } satisfies Partial<CSSStyleDeclaration>);
  hoverScale(btn);
}

function hoverScale(btn: HTMLButtonElement) {
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.08)";
    btn.style.background = "#0a6bf5";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
    btn.style.background = "#0562ef";
  });
}

async function captureAndSave() {
  const captured = captureCurrent();
  if (!captured || captured.messages.length === 0) {
    throw new Error("no messages found on this page");
  }
  console.log(`[dropdat] captured ${captured.messages.length} messages from ${captured.source}`);

  const id = newCapsuleId();
  const now = new Date().toISOString();
  const capsule: Capsule = {
    id,
    userId: "",
    title: captured.title,
    summary: captured.messages[0]?.content.slice(0, 180) ?? "",
    source: captured.source,
    sourceUrl: location.href,
    messages: captured.messages,
    tags: [],
    version: 1,
    rootId: id,
    parentId: null,
    createdAt: now,
    updatedAt: now,
    pendingSync: true,
  };

  // Send to background — it owns the extension-origin IndexedDB.
  let resp: unknown;
  try {
    resp = await chrome.runtime.sendMessage({ type: "SAVE_CAPSULE", capsule });
  } catch (err) {
    console.error("[dropdat] sendMessage SAVE_CAPSULE failed:", err);
    throw err;
  }
  console.log(`[dropdat] background saved capsule ${id}:`, resp);

  if (resp && typeof resp === "object" && "ok" in resp && (resp as { ok: boolean }).ok === false) {
    throw new Error(`background rejected capsule: ${JSON.stringify(resp)}`);
  }
}
