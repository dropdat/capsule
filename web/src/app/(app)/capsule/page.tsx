"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import useSWR from "swr";
import { useApi, type Capsule } from "@/lib/api";
import Link from "next/link";
import { ShareControl } from "@/components/capsule/ShareControl";
import { ShareToTeam } from "@/components/capsule/ShareToTeam";
import { SaveToPack } from "@/components/capsule/SaveToPack";
import { Attachments } from "@/components/capsule/Attachments";
import { RelatedPanel } from "@/components/capsule/RelatedPanel";

function CapsuleDetail() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const api = useApi();

  const { data: capsule, error, isLoading, mutate } = useSWR<Capsule>(
    id ? `/api/v1/capsules/${id}` : null,
    api
  );
  const { data: lineage } = useSWR<Capsule[]>(
    id ? `/api/v1/capsules/${id}/lineage` : null,
    api
  );

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedDyn, setCopiedDyn] = useState(false);
  const [dynBusy, setDynBusy] = useState(false);
  const [dynError, setDynError] = useState<string | null>(null);

  if (!id) return <p className="text-[14px] text-muted-foreground">Missing capsule id.</p>;
  if (error) return <p className="text-[14px] text-destructive">Failed to load: {String(error)}</p>;
  if (isLoading || !capsule) return <p className="text-[14px] text-muted-foreground">Loading…</p>;

  const startEdit = () => {
    setTitle(capsule.title);
    setSummary(capsule.summary);
    setTagsInput(capsule.tags.join(", "));
    setEditing(true);
  };

  const save = async () => {
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    await api(`/api/v1/capsules/${capsule.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, summary, tags }),
    });
    await mutate();
    setEditing(false);
  };

  const remove = async () => {
    if (!confirm("Delete this capsule?")) return;
    await api(`/api/v1/capsules/${capsule.id}`, { method: "DELETE" });
    router.push("/library");
  };

  const copyDynamic = async () => {
    setDynBusy(true);
    setDynError(null);
    try {
      const { markdown } = await api<{ markdown: string }>(`/api/v1/capsules/${capsule.id}/dynamic-context?k=5`);
      await navigator.clipboard.writeText(markdown);
      setCopiedDyn(true);
      setTimeout(() => setCopiedDyn(false), 2000);
    } catch (e) {
      setDynError(e instanceof Error ? e.message : "Dynamic copy failed");
    } finally {
      setDynBusy(false);
    }
  };

  const copyText = async () => {
    const header = `# ${capsule.title}`;
    const meta = `source: ${capsule.source} · v${capsule.version}`;
    const sum = capsule.summary ? `\n\n${capsule.summary}` : "";
    const body = capsule.messages
      .map((m) => `\n\n## ${m.role}\n${m.content}`)
      .join("");

    // Append image attachments as inline markdown — Claude/ChatGPT/Gemini
    // all resolve `![alt](url)` when pasted, so this gets the images into
    // the destination chat alongside the text.
    let attachmentsBlock = "";
    try {
      type AttachmentRow = {
        id: string;
        filename: string;
        contentType: string;
        sizeBytes: number;
      };
      const rows = await api<AttachmentRow[]>(`/api/v1/capsules/${capsule.id}/attachments`);
      const images = (rows ?? []).filter((a) => a.contentType.startsWith("image/"));
      if (images.length > 0) {
        const presigned = await Promise.all(
          images.map(async (a) => {
            try {
              const { url } = await api<{ url: string }>(`/api/v1/attachments/${a.id}/download`);
              return { url, filename: a.filename };
            } catch {
              return null;
            }
          }),
        );
        const live = presigned.filter((x): x is { url: string; filename: string } => x !== null);
        if (live.length > 0) {
          attachmentsBlock =
            `\n\n---\n\n## Attachments\n` +
            live.map((a) => `\n![${a.filename}](${a.url})`).join("");
        }
      }
    } catch {
      // attachments fetch failed — copy text only, don't block the user
    }

    const text = `${header}\n${meta}${sum}${body}${attachmentsBlock}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <article className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link href="/library" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            ← Library
          </Link>
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-heading text-[28px] font-medium tracking-[-0.02em] bg-card border border-border px-2 py-1"
            />
          ) : (
            <h1 className="font-heading text-[28px] font-medium tracking-[-0.02em]">{capsule.title}</h1>
          )}
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">{capsule.source}</span>
            <span>·</span>
            <span>v{capsule.version}</span>
            <span>·</span>
            <span>{new Date(capsule.updatedAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap [&>button]:whitespace-nowrap [&_button]:whitespace-nowrap">
          {editing ? (
            <>
              <button onClick={save} className="rounded-md bg-primary text-primary-foreground border border-border px-4 py-2 text-[13px] font-medium">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] font-medium">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={copyText}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-90"
              >
                {copied ? "Copied ✓" : "Copy capsule"}
              </button>
              <button
                onClick={copyDynamic}
                disabled={dynBusy}
                title="Capsule + top-5 related, as one markdown block"
                className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] font-medium hover:bg-card disabled:opacity-50"
              >
                {copiedDyn ? "Copied ✓" : dynBusy ? "Bundling…" : "Copy dynamic context"}
              </button>
              <button onClick={startEdit} className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] font-medium hover:bg-card">
                Edit
              </button>
              <SaveToPack capsuleId={capsule.id} />
              <ShareControl capsuleId={capsule.id} initialToken={capsule.shareToken} />
              <ShareToTeam capsuleId={capsule.id} />
              <button onClick={remove} className="rounded-md bg-card border border-border px-4 py-2 text-[13px] font-medium text-destructive hover:bg-accent-soft/40">
                Delete
              </button>
            </>
          )}
        </div>
      </header>

      <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="flex flex-col gap-5">
          <div className="border border-border bg-card p-5">
            <h2 className="font-heading text-[14px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-2">Summary</h2>
            {editing ? (
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="w-full bg-background border border-border px-2 py-1 text-[14px]"
              />
            ) : (
              <p className="text-[14px] leading-relaxed">{capsule.summary || <span className="text-muted-foreground">No summary.</span>}</p>
            )}
          </div>

          <div className="border border-border bg-card p-5">
            <h2 className="font-heading text-[14px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">Tags</h2>
            {editing ? (
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="comma, separated, tags"
                className="w-full bg-background border border-border px-2 py-1 text-[14px]"
              />
            ) : capsule.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {capsule.tags.map((t) => (
                  <span key={t} className="text-[12px] px-2 py-0.5 bg-accent-soft border border-border">
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">No tags.</p>
            )}
          </div>

          <div className="border border-border bg-card p-5">
            <h2 className="font-heading text-[14px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Messages ({capsule.messages.length})
            </h2>
            <div className="flex flex-col gap-3">
              {capsule.messages.map((m, i) => (
                <div key={i} className="border border-border p-3">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary mb-1">{m.role}</div>
                  <div className="text-[13px] whitespace-pre-wrap leading-relaxed">{m.content}</div>
                </div>
              ))}
              {capsule.messages.length === 0 && (
                <p className="text-[13px] text-muted-foreground">No messages captured.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <Attachments capsuleId={capsule.id} />
          <RelatedPanel capsuleId={capsule.id} />
          <div className="border border-border bg-card p-5">
            <h2 className="font-heading text-[14px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">Version timeline</h2>
            <ol className="flex flex-col gap-1">
              {(lineage ?? [capsule]).map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/capsule?id=${v.id}`}
                    className={`flex items-center justify-between gap-2 px-2 py-1.5 text-[13px] border ${
                      v.id === capsule.id ? "border-primary bg-accent-soft" : "border-transparent hover:border-border hover:bg-accent-soft/40"
                    }`}
                  >
                    <span className="font-mono text-[11px] text-primary">v{v.version}</span>
                    <span className="flex-1 truncate">{v.title}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="border border-border bg-card p-5">
            <h2 className="font-heading text-[14px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">Source</h2>
            {capsule.sourceUrl ? (
              <a
                href={capsule.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-primary underline-offset-4 hover:underline break-all"
              >
                {capsule.sourceUrl}
              </a>
            ) : (
              <p className="text-[13px] text-muted-foreground">No source URL.</p>
            )}
          </div>
        </aside>
      </section>
    </article>
  );
}

export default function CapsulePage() {
  return (
    <Suspense fallback={<p className="text-[14px] text-muted-foreground">Loading…</p>}>
      <CapsuleDetail />
    </Suspense>
  );
}
