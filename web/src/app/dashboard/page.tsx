"use client";
import Link from "next/link";
import useSWR from "swr";
import { useApi, type Capsule } from "@/lib/api";
import { CapsuleCard } from "@/components/CapsuleCard";
import { useState } from "react";

export default function LibraryPage() {
  const api = useApi();
  const [query, setQuery] = useState("");

  const path = query
    ? `/api/v1/capsules?q=${encodeURIComponent(query)}`
    : "/api/v1/capsules";

  const { data, error, isLoading, mutate } = useSWR<Capsule[]>(path, api);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[28px] font-medium tracking-[-0.02em]">Your capsules</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Captured AI conversations, ready to drop anywhere.
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or summary…"
          className="w-72 max-w-full bg-card border border-border px-3 py-2 text-[14px] focus:outline-none focus:border-primary"
        />
      </div>

      {error && (
        <div className="border border-border bg-card p-5 text-[13px] text-destructive">
          Failed to load capsules: {String(error)}
          <button
            onClick={() => mutate()}
            className="ml-3 underline-offset-4 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && !data && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 border border-border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState />
      )}

      {data && data.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((c) => (
            <CapsuleCard key={c.id} capsule={c} />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="border border-border bg-card p-12 text-center">
      <p className="font-heading text-[18px] font-medium">No capsules yet</p>
      <p className="text-[14px] text-muted-foreground mt-2">
        Install the dropdat extension and click the capsule icon inside any supported AI chat.
      </p>
      <Link
        href="/dashboard/settings"
        className="mt-5 inline-flex items-center gap-2 bg-primary text-primary-foreground border border-border px-5 py-2 text-[14px] font-medium hover:opacity-95 transition-opacity"
      >
        Install extension
      </Link>
    </div>
  );
}
