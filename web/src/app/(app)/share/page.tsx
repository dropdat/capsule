"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useApi, type Capsule } from "@/lib/api";

export default function SharePage() {
  return (
    <Suspense
      fallback={<section className="py-12 text-[13px] text-muted-foreground">Loading…</section>}
    >
      <Share />
    </Suspense>
  );
}

function Share() {
  const api = useApi();
  const params = useSearchParams();
  const router = useRouter();

  // Web Share Target (Android) and iOS Shortcut both pass shared content as
  // GET params: title, text, url. Any subset may be present.
  const initialTitle = params.get("title") ?? "";
  const initialText = params.get("text") ?? "";
  const initialUrl = params.get("url") ?? "";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Capsule | null>(null);

  // Hydrate once from query params.
  useEffect(() => {
    setTitle(initialTitle || (initialText ? initialText.slice(0, 60) : initialUrl || "Shared note"));
    setBody(initialText);
    setUrl(initialUrl);
  }, [initialTitle, initialText, initialUrl]);

  const empty = useMemo(() => !title.trim() && !body.trim() && !url.trim(), [title, body, url]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const id = crypto.randomUUID();
      const messages = body.trim()
        ? [
            {
              role: "user",
              content: body.trim(),
              capturedAt: new Date().toISOString(),
            },
          ]
        : [];
      const created = await api<Capsule>("/api/v1/capsules", {
        method: "POST",
        body: JSON.stringify({
          id,
          title: title.trim() || "Shared note",
          summary: body.slice(0, 280),
          source: "mobile",
          sourceUrl: url.trim(),
          messages,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      setSaved(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (saved) {
    return (
      <section className="flex flex-col gap-4 max-w-[640px]">
        <h1 className="font-heading text-[22px] font-medium tracking-tight">Capsule saved</h1>
        <p className="text-[13.5px] text-muted-foreground">Stored as &ldquo;{saved.title}&rdquo;.</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/capsule?id=${saved.id}`}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90"
          >
            Open capsule
          </Link>
          <button
            onClick={() => router.replace("/share")}
            className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] hover:bg-card"
          >
            Save another
          </button>
          <Link
            href="/library"
            className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] hover:bg-card"
          >
            Library
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5 max-w-[640px]">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-[22px] font-medium tracking-tight">Quick capture</h1>
        <p className="text-[13.5px] text-muted-foreground">
          Shared content lands here from your phone or the dropdat browser action. Tweak and save.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <label className="flex flex-col gap-1.5 text-[12.5px]">
        <span className="text-muted-foreground">Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-[14px]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-[12.5px]">
        <span className="text-muted-foreground">Text</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="rounded-md border border-input bg-background px-3 py-2 text-[14px] font-mono"
          placeholder="The chat snippet, note, or thought you want to keep."
        />
      </label>

      <label className="flex flex-col gap-1.5 text-[12.5px]">
        <span className="text-muted-foreground">Source URL (optional)</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-[14px]"
          placeholder="https://…"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-[12.5px]">
        <span className="text-muted-foreground">Tags (comma separated)</span>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-[14px]"
          placeholder="mobile, idea"
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={busy || empty}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13.5px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save capsule"}
        </button>
        <Link href="/library" className="text-[12.5px] text-muted-foreground hover:text-foreground">
          Cancel
        </Link>
      </div>
    </section>
  );
}
