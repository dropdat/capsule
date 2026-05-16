"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropdat.app";

type Message = { role: string; content: string; capturedAt?: string };
type SharedCapsule = {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  messages: Message[];
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
};

function SharedView() {
  const params = useSearchParams();
  const token = params.get("t") ?? "";
  const [data, setData] = useState<SharedCapsule | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErr("Missing share token.");
      return;
    }
    fetch(`${API_BASE}/api/v1/public/capsules/share/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            res.status === 404 ? "Capsule not found or link revoked." : "Failed to load."
          );
        return res.json();
      })
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [token]);

  if (err) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center flex flex-col gap-3">
          <h1 className="font-heading text-[22px] font-medium">Link unavailable</h1>
          <p className="text-[14px] text-muted-foreground">{err}</p>
          <a href="https://dropdat.app" className="text-[13px] underline">
            Visit dropdat
          </a>
        </div>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-[13px] text-muted-foreground">
        Loading…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-border pb-5">
        <a href="https://dropdat.app" className="text-[12px] text-muted-foreground hover:text-foreground">
          ← dropdat
        </a>
        <h1 className="font-heading text-[28px] font-medium tracking-[-0.02em]">{data.title}</h1>
        <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">{data.source}</span>
          <span>·</span>
          <span>v{data.version}</span>
          <span>·</span>
          <span>{new Date(data.updatedAt).toLocaleDateString()}</span>
        </div>
      </header>

      {data.summary && (
        <section className="border border-border bg-card p-5">
          <h2 className="font-heading text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Summary
          </h2>
          <p className="text-[14px] whitespace-pre-wrap">{data.summary}</p>
        </section>
      )}

      <section className="flex flex-col gap-4">
        {data.messages.map((m, i) => (
          <div key={i} className="border border-border bg-card p-4">
            <div className="text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              {m.role}
            </div>
            <div className="text-[14px] whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </section>

      <footer className="text-[12px] text-muted-foreground border-t border-border pt-4">
        Shared via{" "}
        <a href="https://dropdat.app" className="underline">
          dropdat
        </a>
        .
      </footer>
    </main>
  );
}

export default function SharedPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-6 text-[13px] text-muted-foreground">
          Loading…
        </main>
      }
    >
      <SharedView />
    </Suspense>
  );
}
