"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { useApi, type RelatedCapsule } from "@/lib/api";

export function RelatedPanel({ capsuleId }: { capsuleId: string }) {
  const api = useApi();
  const [items, setItems] = useState<RelatedCapsule[] | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api<RelatedCapsule[]>(`/api/v1/capsules/${capsuleId}/related`);
      setItems(r ?? []);
    } catch {
      setItems([]);
    }
  }, [api, capsuleId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!items) {
    return (
      <div className="border border-border bg-card p-4">
        <h2 className="font-heading text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Related
        </h2>
        <p className="text-[12px] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-border bg-card p-4">
        <h2 className="font-heading text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Related
        </h2>
        <p className="text-[12px] text-muted-foreground">
          Nothing similar yet. Capture more chats and they'll surface here.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card p-4">
      <h2 className="font-heading text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Related
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((r) => (
          <li key={r.id}>
            <Link
              href={`/capsule?id=${r.id}`}
              className="block hover:bg-muted/40 rounded p-2 -mx-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium truncate flex-1">{r.title}</span>
                <span className="text-[10.5px] font-mono text-muted-foreground shrink-0">
                  {(r.similarity * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                {r.source}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
