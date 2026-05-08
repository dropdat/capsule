/**
 * Simple API-key auth for the extension.
 * The user generates a key in the dropdat.app dashboard and pastes it here.
 * The key is stored in chrome.storage.local and attached as a Bearer token
 * on every backend request.
 */

const STORAGE_KEY = "dropdat_api_key";
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "https://dropdat.app";

export type AuthState =
  | { status: "signed_out" }
  | { status: "signed_in"; apiKey: string; userId: string };

export async function getApiKey(): Promise<string | null> {
  try {
    const got = await chrome.storage.local.get(STORAGE_KEY);
    return (got[STORAGE_KEY] as string | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function setApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: key });
}

export async function clearApiKey(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}

export async function getAuthState(): Promise<AuthState> {
  const apiKey = await getApiKey();
  if (!apiKey) return { status: "signed_out" };
  try {
    const userId = await verifyApiKey(apiKey);
    return { status: "signed_in", apiKey, userId };
  } catch {
    return { status: "signed_out" };
  }
}

/**
 * Validates the API key against /api/v1/me. Throws on invalid key.
 */
export async function verifyApiKey(apiKey: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/v1/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(res.status === 401 ? "Invalid API key" : `Validation failed (${res.status})`);
  }
  const body = (await res.json().catch(() => ({}))) as { userId?: string; user_id?: string };
  return body.userId || body.user_id || "";
}
