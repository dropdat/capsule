import { useEffect } from "react";
import { useAuth } from "@clerk/chrome-extension";

/**
 * Mirrors the Clerk session JWT into chrome.storage.session so the
 * background worker can attach it to API calls without needing a
 * Clerk instance of its own (Clerk SDK isn't safe to load in MV3 SW).
 *
 * Refreshes every 30s while popup is open.
 */
export function TokenSync() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const push = async () => {
      try {
        const token = isSignedIn ? await getToken() : null;
        if (cancelled) return;
        await chrome.storage.session.set({ clerk_jwt: token ?? null });
      } catch (err) {
        console.warn("[dropdat] token sync failed", err);
      }
    };

    push();
    const id = setInterval(push, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [getToken, isSignedIn]);

  return null;
}
