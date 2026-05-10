import { getApiKey } from "./auth";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "https://dropdat.app";

export interface Folder {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  userId: string;
  folderId: string;
  url: string;
  title: string;
  note: string;
  faviconUrl: string;
  createdAt: string;
  updatedAt: string;
}

async function authed(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getApiKey();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

export const folderApi = {
  async list(): Promise<Folder[]> {
    const res = await authed("/api/v1/folders");
    if (!res.ok) throw new Error(`folders list ${res.status}`);
    return res.json();
  },
  async create(name: string, isDefault = false): Promise<Folder> {
    const res = await authed("/api/v1/folders", {
      method: "POST",
      body: JSON.stringify({ name, isDefault }),
    });
    if (!res.ok) throw new Error(`folders create ${res.status}`);
    return res.json();
  },
};

export const linkApi = {
  async create(input: { url: string; title?: string; note?: string; folderId?: string; faviconUrl?: string }): Promise<Link> {
    const res = await authed("/api/v1/links", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`links create ${res.status}`);
    return res.json();
  },
  async list(folderId?: string): Promise<Link[]> {
    const qs = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
    const res = await authed(`/api/v1/links${qs}`);
    if (!res.ok) throw new Error(`links list ${res.status}`);
    return res.json();
  },
  async remove(id: string): Promise<void> {
    const res = await authed(`/api/v1/links/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error(`links delete ${res.status}`);
  },
};

const PREF_KEY = "dropdat_default_folder_id";

export async function getPreferredFolderId(): Promise<string | null> {
  const got = await chrome.storage.local.get(PREF_KEY);
  return (got[PREF_KEY] as string | undefined) ?? null;
}

export async function setPreferredFolderId(id: string | null): Promise<void> {
  if (!id) {
    await chrome.storage.local.remove(PREF_KEY);
    return;
  }
  await chrome.storage.local.set({ [PREF_KEY]: id });
}
