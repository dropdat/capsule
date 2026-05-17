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
      // Server returns {"error":"..."} — surface just the message so callers
      // don't have to render raw JSON.
      let message = body || res.statusText;
      try {
        const parsed = JSON.parse(body);
        if (parsed && typeof parsed.error === "string") message = parsed.error;
      } catch {
        /* not JSON, keep as-is */
      }
      throw new ApiError(res.status, message);
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

export type CapsuleSource = "chatgpt" | "claude" | "gemini" | "mobile";

export type Capsule = {
  id: string;
  userId: string;
  title: string;
  summary: string;
  source: CapsuleSource;
  sourceUrl: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string; capturedAt: string }>;
  tags: string[];
  version: number;
  rootId: string;
  parentId: string | null;
  shareToken?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Tier = "basic" | "pro" | "premium" | "ultimate" | "enterprise";

export type Subscription = {
  tier: Tier;
  status: string;
  product_id?: string;
  current_period_end?: string;
  capsule_limit: number; // -1 == unlimited
  capsules_used: number;
  scopes: string[];
  has_customer: boolean;
};

export type CheckoutResponse = { link: string };
export type PortalResponse = { link: string };

export type Team = {
  id: string;
  name: string;
  owner_user_id: string;
  join_token?: string;
  join_enabled: boolean;
  my_role?: "owner" | "admin" | "member";
  created_at: string;
  updated_at: string;
};

export type ContextPack = {
  id: string;
  name: string;
  goal: string;
  created_at: string;
  updated_at: string;
};

export type PackItem = {
  capsule_id: string;
  title: string;
  summary: string;
  source: string;
  position: number;
};

export type CapsuleGraph = {
  nodes: { id: string; title: string; source: string }[];
  edges: { from: string; to: string; weight: number }[];
};

export type RelatedCapsule = {
  id: string;
  title: string;
  summary: string;
  source: string;
  similarity: number;
};

export type TeamMember = {
  user_id: string;
  role: "owner" | "admin" | "member";
  name?: string;
  email?: string;
  image_url?: string;
  joined_at: string;
};


