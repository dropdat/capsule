export type CapsuleSource = "chatgpt" | "claude" | "gemini";

export type Role = "user" | "assistant" | "system";

export interface Message {
  role: Role;
  content: string;
  capturedAt: string; // ISO
}

/** Local-first capsule shape (server uses snake_case in JSON; we keep camel locally). */
export interface Capsule {
  id: string;
  userId: string;
  title: string;
  summary: string;
  source: CapsuleSource;
  sourceUrl: string;
  messages: Message[];
  tags: string[];
  version: number;
  rootId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Local-only: present until successfully synced to server. */
  pendingSync?: boolean;
}

export interface CreateCapsuleInput {
  id: string;
  title: string;
  summary: string;
  source: CapsuleSource;
  sourceUrl: string;
  messages: Message[];
  tags: string[];
}
