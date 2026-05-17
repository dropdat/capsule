import { api, ApiError } from "./api";
import { capsuleStore } from "./storage";
import type { ImageRef } from "./types";

/**
 * Uploads queued chat images as capsule attachments.
 *
 * Runs in the background service worker, which inherits the user's cookies
 * for chatgpt.com / claude.ai / gemini.google.com via host_permissions, so
 * signed/cookie-gated image URLs fetch successfully here even when the
 * extension popup or another tab can't.
 *
 * Per-attachment failures are silent — the URL stays on pendingImages and the
 * next sync tick retries. 402 responses (plan disallows attachments) clear
 * the queue for that capsule so we don't hammer the API for nothing.
 */
export async function uploadPendingAttachments(
  getToken: () => Promise<string | null>,
): Promise<{ uploaded: number; failed: number }> {
  const token = await getToken();
  if (!token) return { uploaded: 0, failed: 0 };
  const queued = await capsuleStore.pendingImageUploads();
  if (queued.length === 0) return { uploaded: 0, failed: 0 };
  let uploaded = 0;
  let failed = 0;
  for (const capsule of queued) {
    const remaining: ImageRef[] = [];
    let stopThisCapsule: "paywall" | "transient" | null = null;
    for (const img of capsule.pendingImages ?? []) {
      if (stopThisCapsule === "transient") {
        // Keep remaining queue intact for next tick — server might be back.
        remaining.push(img);
        continue;
      }
      try {
        const blob = await fetchImage(img.url);
        if (!blob) continue; // dead URL — drop, no retry
        const filename = guessFilename(img.url, blob.type, img.alt);
        await api.directUploadAttachment(token, capsule.id, blob, filename);
        uploaded++;
      } catch (err) {
        if (err instanceof ApiError && err.status === 402) {
          // Plan disallows attachments — drop the queue for this capsule.
          stopThisCapsule = "paywall";
          remaining.length = 0;
          break;
        }
        if (err instanceof ApiError && err.status === 503) {
          // Storage not configured server-side — keep the queue, retry next tick.
          stopThisCapsule = "transient";
          remaining.push(img);
          continue;
        }
        remaining.push(img);
        failed++;
      }
    }
    if (remaining.length === 0) {
      await capsuleStore.clearPendingImages(capsule.id);
    } else {
      await capsuleStore.put({ ...capsule, pendingImages: remaining });
    }
  }
  return { uploaded, failed };
}

async function fetchImage(url: string): Promise<Blob | null> {
  // Try without credentials first — most chat image URLs are signed and don't
  // need cookies. Falling back with credentials catches edge cases where the
  // image is behind a session cookie.
  for (const mode of ["omit", "include"] as const) {
    try {
      const res = await fetch(url, { credentials: mode });
      if (!res.ok) continue;
      const blob = await res.blob();
      if (blob.size === 0) continue;
      if (blob.size > 50 * 1024 * 1024) return null; // server caps at 50MB
      return blob;
    } catch {
      // try next mode
    }
  }
  return null;
}

function guessFilename(url: string, mime: string, alt?: string): string {
  const ext = mime.split("/")[1]?.split(";")[0] ?? "bin";
  if (alt && alt.length < 64) {
    const safe = alt.replace(/[^\w. -]+/g, "_").trim() || "image";
    return `${safe}.${ext}`;
  }
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
    if (last && last.length < 80 && /\.[a-z0-9]+$/i.test(last)) return last;
  } catch {
    // ignore
  }
  return `image-${Date.now()}.${ext}`;
}
