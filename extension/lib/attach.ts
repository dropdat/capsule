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
  if (!token) {
    console.warn("[dropdat] image upload pass skipped — no API key set");
    return { uploaded: 0, failed: 0 };
  }
  const queued = await capsuleStore.pendingImageUploads();
  console.log(`[dropdat] image upload pass — eligible capsules: ${queued.length}`);
  if (queued.length === 0) return { uploaded: 0, failed: 0 };
  console.log(
    `[dropdat] image upload pass: ${queued.length} capsule(s) with pending images`,
    queued.map((c) => ({ id: c.id, n: c.pendingImages?.length ?? 0 })),
  );
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
        if (!blob) {
          console.warn("[dropdat] fetchImage returned null (CORS/404/expired/too-large)", img.url);
          continue; // dead URL — drop, no retry
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
        if (!put.ok) {
          const body = await put.text().catch(() => "");
          throw new Error(`R2 PUT ${put.status}: ${body.slice(0, 200)}`);
        }
        await api.commitAttachment(token, capsule.id, init.id);
        console.log(`[dropdat] uploaded image ${filename} (${blob.size}B) → capsule ${capsule.id}`);
        uploaded++;
      } catch (err) {
        if (err instanceof ApiError && err.status === 402) {
          console.warn(
            `[dropdat] attachments paywall (402) for capsule ${capsule.id} — dropping image queue; upgrade plan to enable`,
          );
          stopThisCapsule = "paywall";
          remaining.length = 0;
          break;
        }
        if (err instanceof ApiError && err.status === 503) {
          console.warn(
            "[dropdat] attachments storage unavailable (503) — R2 env not configured on server; will retry next tick",
          );
          stopThisCapsule = "transient";
          remaining.push(img);
          continue;
        }
        console.warn("[dropdat] image upload failed (will retry)", img.url, err);
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
  console.log(`[dropdat] image upload pass done — uploaded=${uploaded} failed=${failed}`);
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
