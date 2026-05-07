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
<svg width="30" height="30" viewBox="0 0 1917 1742" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block">
  <path d="M1025.72 327.519L459.94 1082.21C368.618 1204.02 392.9 1374.6 514.175 1463.21C635.449 1551.82 807.792 1524.9 899.113 1403.08L1464.9 648.395C1556.22 526.582 1531.93 356.003 1410.66 267.396C1289.39 178.789 1117.04 205.707 1025.72 327.519Z" fill="url(#dd_pg0)"/>
  <path d="M1174.82 1035.33L891.144 1413.71C799.539 1535.91 627.857 1562.72 506.206 1473.84C384.555 1384.95 360.366 1215.03 451.971 1092.84L733.551 717.242" fill="url(#dd_pg1)"/>
  <path d="M735.709 713.872L1170.39 1041.91" stroke="white" stroke-width="59"/>
  <path opacity="0.759" d="M1413.96 466.491L1103.18 881.039C1094.37 892.78 1096.72 909.222 1108.4 917.762C1120.09 926.302 1136.7 923.708 1145.51 911.967L1456.29 497.419C1465.09 485.678 1462.75 469.237 1451.06 460.696C1439.37 452.156 1422.76 454.75 1413.96 466.491Z" fill="white"/>
  <defs>
    <linearGradient id="dd_pg0" x1="393.684" y1="1240.99" x2="762.267" y2="1518.53" gradientUnits="userSpaceOnUse"><stop stop-color="#26BCFF"/><stop offset="0.668" stop-color="#358BB1"/><stop offset="1" stop-color="#3687AC"/></linearGradient>
    <linearGradient id="dd_pg1" x1="511.131" y1="1013.93" x2="946.288" y2="1340.16" gradientUnits="userSpaceOnUse"><stop stop-color="#26BCFF"/><stop offset="0.668" stop-color="#62AECF"/><stop offset="1" stop-color="#167BA8"/></linearGradient>
  </defs>
</svg>`;

const ICON_GENERATE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0562ef" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`;
const ICON_DROP = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0562ef" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12"/><path d="m6 12 6 6 6-6"/><path d="M5 20h14"/></svg>`;
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
  attachRuntimeListener();
  injectButton();
  const obs = new MutationObserver(() => {
    const existing = document.getElementById(BTN_ID);
    if (!existing) {
      injectButton();
      return;
    }
    // Promote a floating fallback into the composer once the slot appears.
    if (existing.dataset.dropdatMode === "floating") {
      const slot = findComposerSlot();
      if (slot && !slot.el.parentElement?.contains(existing)) {
        styleInline(existing as HTMLButtonElement);
        existing.dataset.dropdatMode = "inline";
        if (slot.placement === "after") slot.el.after(existing);
        else slot.el.before(existing);
        console.log(`[dropdat] promoted floating capsule to inline ${slot.placement}:`, slot.el);
      }
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

let runtimeListenerAttached = false;
function attachRuntimeListener() {
  if (runtimeListenerAttached) return;
  runtimeListenerAttached = true;
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "DROP_CAPSULE" && msg.capsule) {
      dropCapsule(msg.capsule as CapsuleListItem)
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, error: String(err) }));
      return true;
    }
    return undefined;
  });
}

function injectButton() {
  if (document.getElementById(BTN_ID)) return;

  const btn = makeButton();
  const slot = findComposerSlot();

  if (slot) {
    styleInline(btn);
    btn.dataset.dropdatMode = "inline";
    if (slot.placement === "after") slot.el.after(btn);
    else slot.el.before(btn);
    console.log(`[dropdat] inline-mounted capsule ${slot.placement}:`, slot.el);
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
  btn.dataset.dropdatMode = "floating";
  if (composer) {
    const composerRect = composer.getBoundingClientRect();
    btn.style.bottom = `${window.innerHeight - composerRect.top + 8}px`;
    btn.style.right = `${Math.max(20, window.innerWidth - composerRect.right + 8)}px`;
  }
  document.body.appendChild(btn);
}

type Slot = { el: HTMLElement; placement: "before" | "after" };

/**
 * Per-site overrides. Generic logic places the capsule wrong on a few sites
 * because the voice button sits inside a fixed-width or flow-controlling
 * wrapper. For those, we anchor against a different element entirely.
 */
function siteSpecificSlot(): Slot | null {
  const host = location.hostname;

  if (host.endsWith("claude.ai")) {
    const voice = document.querySelector<HTMLElement>(
      'button[aria-label="Use voice mode"], button[aria-label*="voice" i]'
    );
    if (!voice) return null;
    // Voice sits in a w-8 fixed-width wrapper; insert capsule BEFORE that
    // wrapper so it lands in the flex row, to the left of voice.
    let wrapper: HTMLElement | null = voice.parentElement;
    for (let i = 0; i < 4 && wrapper; i++, wrapper = wrapper.parentElement) {
      const cls = wrapper.className?.toString() || "";
      if (/\bw-8\b/.test(cls)) return { el: wrapper, placement: "before" };
    }
    return { el: voice, placement: "before" };
  }

  if (host.endsWith("copilot.microsoft.com")) {
    const audio = document.querySelector<HTMLElement>('[data-testid="audio-call-button"]');
    if (audio) return { el: audio, placement: "before" };
    return null;
  }

  return null;
}

/**
 * Locates an anchor button inside the composer to slot the capsule next to.
 * Prefers placing AFTER a voice/dictation button (capsule sits to the right
 * of voice). If only a send/submit button exists, places BEFORE it so the
 * capsule still ends up inside the composer's right cluster.
 */
function findComposerSlot(): Slot | null {
  const override = siteSpecificSlot();
  if (override) return override;

  const composer = findComposer();
  if (!composer) return null;

  const afterAnchors = [
    '[data-testid="composer-speech-button"]',
    'button[aria-label*="voice" i]',
    'button[aria-label*="dictat" i]',
    'button[aria-label*="microphone" i]',
    'button[aria-label*="speak" i]',
    'button[aria-label*="audio" i]',
    'button[data-testid*="voice" i]',
    'button[data-testid*="mic" i]',
  ];
  for (const sel of afterAnchors) {
    const el = composer.querySelector<HTMLElement>(sel);
    if (el) return { el, placement: "after" };
  }

  const beforeAnchors = [
    'button[aria-label*="send" i]',
    'button[aria-label*="submit" i]',
    'button[data-testid*="send" i]',
    'button[type="submit"]',
  ];
  for (const sel of beforeAnchors) {
    const el = composer.querySelector<HTMLElement>(sel);
    if (el) return { el, placement: "before" };
  }

  // Last resort: append next to the last button in the composer
  const buttons = composer.querySelectorAll<HTMLElement>("button");
  if (buttons.length) return { el: buttons[buttons.length - 1], placement: "after" };
  return null;
}

function findComposer(): HTMLElement | null {
  // ChatGPT-specific fast path
  const plus = document.querySelector<HTMLElement>('[data-testid="composer-plus-btn"]');
  if (plus) {
    const form = plus.closest("form");
    if (form) return form as HTMLElement;
    const div = plus.closest('div[data-testid="composer"]');
    if (div) return div as HTMLElement;
    if (plus.parentElement) return plus.parentElement;
  }

  // Generic: find the largest visible input (textarea/contenteditable),
  // then climb to a parent that contains multiple buttons — that's the composer.
  const inputs = [
    ...document.querySelectorAll<HTMLElement>(
      'textarea, [contenteditable="true"], [contenteditable=""], [role="textbox"]'
    ),
  ].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 200 && r.height > 20 && el.offsetParent !== null;
  });
  inputs.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width);

  for (const input of inputs) {
    let el: HTMLElement | null = input.parentElement;
    for (let i = 0; i < 12 && el; i++, el = el.parentElement) {
      const btnCount = el.querySelectorAll("button").length;
      if (btnCount >= 2) return el;
    }
  }

  // Final fallback: any composer-named container or first form
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
  btn.setAttribute("aria-label", "dropdat");
  btn.innerHTML = ICON_NORMAL;

  const setState = (icon: string, color?: string) => {
    btn.innerHTML = icon;
    if (color) btn.style.background = color;
  };
  const resetIcon = () => {
    btn.innerHTML = ICON_NORMAL;
    btn.style.background = "transparent";
  };

  const runDrop = async () => {
    btn.disabled = true;
    setState(ICON_LOADING, "#0562ef");
    btn.style.color = "#fff";
    try {
      await captureAndSave();
      setState(ICON_OK, "#0a8f4a");
    } catch (err) {
      console.error("[dropdat] capture failed", err);
      setState(ICON_FAIL, "#c0392b");
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.style.color = "";
        resetIcon();
      }, 1500);
    }
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (btn.disabled) return;
    toggleMenu(btn, runDrop);
  });

  btn.title = "Use dropdat";
  return btn;
}

const MENU_ID = "dropdat-capsule-menu";

function toggleMenu(btn: HTMLButtonElement, runGenerate: () => Promise<void>) {
  const existing = document.getElementById(MENU_ID);
  if (existing) {
    existing.remove();
    return;
  }
  const menu = document.createElement("div");
  menu.id = MENU_ID;
  Object.assign(menu.style, {
    position: "fixed",
    background: "#ffffff",
    color: "#0b1015",
    border: "1px solid #c5dbf2",
    borderRadius: "0",
    padding: "6px",
    minWidth: "180px",
    fontFamily: "inherit",
    fontSize: "14px",
    boxShadow: "0 12px 32px rgba(11,16,21,0.12)",
    zIndex: "2147483647",
  } satisfies Partial<CSSStyleDeclaration>);

  const itemStyle: Partial<CSSStyleDeclaration> = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "10px 12px",
    background: "transparent",
    color: "#0b1015",
    border: "none",
    borderRadius: "0",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
    textAlign: "left",
  };
  const mkItem = (icon: string, label: string, onClick: () => void) => {
    const b = document.createElement("button");
    b.type = "button";
    Object.assign(b.style, itemStyle);
    b.innerHTML = `${icon}<span style="font-weight:600">${label}</span>`;
    b.addEventListener("mouseenter", () => (b.style.background = "#ddebff"));
    b.addEventListener("mouseleave", () => (b.style.background = "transparent"));
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.remove();
      onClick();
    });
    return b;
  };

  menu.appendChild(
    mkItem(ICON_GENERATE, "Generate", () => {
      runGenerate();
    })
  );
  menu.appendChild(
    mkItem(ICON_DROP, "Drop", () => {
      chrome.runtime
        .sendMessage({ type: "OPEN_POPUP" })
        .catch((err) => console.warn("[dropdat] open popup failed:", err));
    })
  );

  document.body.appendChild(menu);
  positionMenuLike(menu, btn);

  const onDoc = (ev: MouseEvent) => {
    if (!menu.contains(ev.target as Node) && ev.target !== btn && !btn.contains(ev.target as Node)) {
      menu.remove();
      document.removeEventListener("mousedown", onDoc, true);
      document.removeEventListener("keydown", onKey, true);
    }
  };
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      menu.remove();
      document.removeEventListener("mousedown", onDoc, true);
      document.removeEventListener("keydown", onKey, true);
    }
  };
  document.addEventListener("mousedown", onDoc, true);
  document.addEventListener("keydown", onKey, true);
}

function positionMenuLike(menu: HTMLElement, btn: HTMLElement) {
  const r = btn.getBoundingClientRect();
  const mr = menu.getBoundingClientRect();
  const gap = 10;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  let top = r.top - mr.height - gap;
  if (top < 8) top = r.bottom + gap;
  top = Math.max(8, Math.min(top, vh - mr.height - 8));
  let left = r.right - mr.width;
  left = Math.max(8, Math.min(left, vw - mr.width - 8));
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
}

function styleInline(btn: HTMLButtonElement) {
  Object.assign(btn.style, {
    position: "relative",
    top: "",
    right: "",
    bottom: "",
    left: "",
    zIndex: "",
    width: "40px",
    height: "40px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    margin: "0 4px",
    background: "transparent",
    color: "#0562ef",
    border: "none",
    borderRadius: "9999px",
    cursor: "pointer",
    boxShadow: "none",
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
    background: "#ffffff",
    color: "#0562ef",
    border: "1px solid #d8dde5",
    borderRadius: "9999px",
    cursor: "pointer",
    boxShadow: "0 6px 16px -4px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.10)",
    transition: "transform 120ms ease, background 120ms ease, box-shadow 120ms ease",
  } satisfies Partial<CSSStyleDeclaration>);
  hoverScale(btn);
}

function hoverScale(btn: HTMLButtonElement) {
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.08)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
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

type CapsuleListItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  updatedAt: string;
  messages: Array<{ role: string; content: string }>;
};

async function dropCapsule(item: CapsuleListItem) {
  const preamble = `Adding Context of Capsule: ${item.title || "Untitled"}`;
  const body = (item.messages || []).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  const text = body ? `${preamble}\n\n${body}` : preamble;

  const target = findComposerInput();
  if (!target) {
    console.warn("[dropdat] no composer input found to drop capsule");
    return;
  }
  setComposerText(target, text);
  // Give the host app a tick to enable its send button after the input event.
  await new Promise((r) => setTimeout(r, 120));
  clickSend();
}

function setComposerText(target: HTMLElement, text: string) {
  if (target instanceof HTMLTextAreaElement) {
    target.focus();
    target.value = text;
    target.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  target.focus();
  // Select all existing content, then replace via insertText so React/Lexical/Slate-backed
  // editors register the change as a real edit (and the send button activates).
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(target);
  sel?.removeAllRanges();
  sel?.addRange(range);
  const ok = document.execCommand("insertText", false, text);
  if (!ok) {
    target.textContent = text;
    target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
  }
}

function clickSend(): boolean {
  const candidates = [
    '[data-testid="send-button"]',
    '[data-testid="composer-send-button"]',
    'button[aria-label*="send message" i]:not([disabled])',
    'button[aria-label*="send" i]:not([disabled])',
    'button[aria-label*="submit" i]:not([disabled])',
    'button[type="submit"]:not([disabled])',
  ];
  for (const sel of candidates) {
    const btn = document.querySelector<HTMLButtonElement>(sel);
    if (btn && btn.offsetParent !== null) {
      btn.click();
      return true;
    }
  }
  // Last resort: simulate Enter on the composer input.
  const target = findComposerInput();
  if (target) {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true })
    );
    return true;
  }
  return false;
}

function findComposerInput(): HTMLElement | null {
  const composer = findComposer();
  const scope: ParentNode = composer ?? document;
  const inputs = [
    ...scope.querySelectorAll<HTMLElement>(
      'textarea, [contenteditable="true"], [role="textbox"]'
    ),
  ].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 200 && r.height > 20 && el.offsetParent !== null;
  });
  inputs.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width);
  return inputs[0] ?? null;
}

