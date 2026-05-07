import { api } from "./api";
import { capsuleStore } from "./storage";

/**
 * Drains the pending-sync queue once. Idempotent — server uses client-supplied
 * uuid v7 ids, so re-trying a capsule that already landed is safe (server returns
 * conflict; we treat any 2xx OR 409 as "synced").
 */
export async function syncOnce(getToken: () => Promise<string | null>): Promise<{ ok: number; failed: number }> {
  const pending = await capsuleStore.pendingSync();
  if (pending.length === 0) return { ok: 0, failed: 0 };

  const token = await getToken();
  let ok = 0;
  let failed = 0;

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
      // Treat 409 (already exists) as success — idempotent retry
      if (typeof err === "object" && err && "status" in err && (err as { status: number }).status === 409) {
        await capsuleStore.markSynced(c.id);
        ok++;
      } else {
        console.warn("[dropdat] sync failed", c.id, err);
        failed++;
      }
    }
  }
  return { ok, failed };
}
