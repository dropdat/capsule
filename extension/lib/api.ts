import type { Capsule, CreateCapsuleInput } from "./types";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, body || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  base: API_BASE,
  createCapsule: (token: string | null, input: CreateCapsuleInput) =>
    request<ServerCapsule>("/api/v1/capsules", {
      method: "POST",
      body: JSON.stringify(input),
      token,
    }),
  listCapsules: (token: string | null) =>
    request<ServerCapsule[]>("/api/v1/capsules", { token }),
  getMe: (token: string | null) =>
    request<{ userId: string }>("/api/v1/me", { token }),
};

/** Server returns snake_case; convert when needed. */
export interface ServerCapsule {
  id: string;
  userId: string;
  title: string;
  summary: string;
  source: Capsule["source"];
  sourceUrl: string;
  messages: Capsule["messages"];
  tags: string[];
  version: number;
  rootId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}
