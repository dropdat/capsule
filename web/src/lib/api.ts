"use client";
import { useAuth } from "@clerk/react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * useApi — returns a typed fetch helper that injects the Clerk session token.
 * Usage:
 *   const api = useApi();
 *   const capsules = await api<Capsule[]>("/api/v1/capsules");
 */
export function useApi() {
  const { getToken } = useAuth();

  return async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getToken();
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${BASE}${path}`, { ...init, headers });
    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(res.status, body || res.statusText);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  };
}

export type Folder = {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SavedLink = {
  id: string;
  userId: string;
  folderId: string;
  url: string;
  title: string;
  note: string;
  faviconUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type CapsuleSource = "chatgpt" | "claude" | "gemini";

export type Capsule = {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  source: CapsuleSource;
  source_url: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string; capturedAt: string }>;
  tags: string[];
  version: number;
  root_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};
