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
  let uploaded = 0;
  let failed = 0;
  for (const capsule of queued) {
    const remaining: ImageRef[] = [];
    let attachmentsDisabled = false;
    for (const img of capsule.pendingImages ?? []) {
      if (attachmentsDisabled) {
        remaining.push(img);
        continue;
      }
      try {
        const blob = await fetchImage(img.url);
        if (!blob) {
          // Couldn't fetch (CORS, 404, expired) — drop, no point retrying.
          continue;
        }
        const filename = guessFilename(img.url, blob.type, img.alt);
        const init = await api.initAttachment(token, capsule.id, {
          filename,
          contentType: blob.type || "application/octet-stream",
          sizeBytes: blob.size,
        });
        const put = await fetch(init.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": blob.type || "application/octet-stream" },
          body: blob,
        });
        if (!put.ok) throw new Error(`PUT ${put.status}`);
        await api.commitAttachment(token, capsule.id, init.id);
        uploaded++;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 402 || err.status === 503)) {
          // Plan disallows attachments, or storage is offline. Drop the
          // whole queue for this capsule — they're not coming back.
          attachmentsDisabled = true;
          remaining.length = 0;
          break;
        }
        console.warn("[dropdat] image upload failed", img.url, err);
        remaining.push(img);
        failed++;
      }
    }
    if (remaining.length === 0) {
      await capsuleStore.clearPendingImages(capsule.id);
    } else {
      // Persist the trimmed queue for the next sync tick.
      await capsuleStore.put({ ...capsule, pendingImages: remaining });
    }
  }
  return { uploaded, failed };
}

async function fetchImage(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size === 0) return null;
    if (blob.size > 50 * 1024 * 1024) return null; // server caps at 50MB
    return blob;
  } catch {
    return null;
  }
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
