import { api } from "./api";
import { capsuleStore } from "./storage";
import { uploadPendingAttachments } from "./attach";
import type { Capsule } from "./types";

/**
 * Two-way sync: pushes pending local capsules to the server, then pulls the
 * server's full capsule list and merges anything missing locally. This lets a
 * freshly-installed extension recover capsules created on another device.
 *
 * Idempotent — server uses client-supplied uuid v7 ids, so retrying a capsule
 * that already landed is safe (treat 2xx and 409 as "synced").
 */
export async function syncOnce(
  getToken: () => Promise<string | null>,
): Promise<{ ok: number; failed: number; pulled: number; quotaExceeded: boolean }> {
  const token = await getToken();
  const pending = await capsuleStore.pendingSync();
  let ok = 0;
  let failed = 0;
  let pulled = 0;
  let quotaExceeded = false;

  for (const c of pending) {
    try {
      await api.createCapsule(token, {
        id: c.id,
        title: c.title,
        summary: c.summary,
        source: c.source,
        sourceUrl: c.sourceUrl,
        messages: c.messages,
        tags: c.tags,
      });
      await capsuleStore.markSynced(c.id);
      ok++;
    } catch (err) {
      const status =
        typeof err === "object" && err && "status" in err
          ? (err as { status: number }).status
          : 0;
      if (status === 409) {
        await capsuleStore.markSynced(c.id);
        ok++;
      } else if (status === 402) {
        // Plan limit reached. Leave capsule pending locally so it can sync
        // once the user upgrades.
        quotaExceeded = true;
        failed++;
      } else {
        console.warn("[dropdat] sync push failed", c.id, err);
        failed++;
      }
    }
  }

  if (token) {
    try {
      const remote = await api.listCapsules(token);
      const local = await capsuleStore.all();
      const localById = new Map(local.map((c) => [c.id, c] as const));
      for (const r of remote) {
        const existing = localById.get(r.id);
        if (existing?.pendingSync) continue;
        if (existing && existing.updatedAt >= r.updatedAt) continue;
        const merged: Capsule = {
          id: r.id,
          userId: r.userId,
          title: r.title,
          summary: r.summary,
          source: r.source,
          sourceUrl: r.sourceUrl,
          messages: r.messages,
          tags: r.tags,
          version: r.version,
          rootId: r.rootId,
          parentId: r.parentId,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          // Preserve local-only fields that the server doesn't know about,
          // otherwise this pull pass wipes a freshly-queued image upload list
          // immediately after the corresponding push succeeds.
          pendingImages: existing?.pendingImages,
        };
        await capsuleStore.put(merged);
        pulled++;
      }
    } catch (err) {
      console.warn("[dropdat] sync pull failed", err);
    }
  }

  // Drain any queued image attachments for capsules that successfully synced.
  // Best-effort; never blocks the rest of sync.
  try {
    await uploadPendingAttachments(getToken);
  } catch (err) {
    console.warn("[dropdat] image attachment upload pass failed", err);
  }

  return { ok, failed, pulled, quotaExceeded };
}
