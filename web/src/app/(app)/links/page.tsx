"use client";

import { useState } from "react";
import useSWR from "swr";
import { useApi, type Folder, type SavedLink } from "@/lib/api";

export default function LinksPage() {
  const api = useApi();
  const [activeFolderId, setActiveFolderId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const {
    data: folders,
    mutate: mutateFolders,
  } = useSWR<Folder[]>("/api/v1/folders", api);

  const linksPath = activeFolderId
    ? `/api/v1/links?folderId=${activeFolderId}`
    : "/api/v1/links";
  const {
    data: links,
    error: linksError,
    isLoading: linksLoading,
    mutate: mutateLinks,
  } = useSWR<SavedLink[]>(linksPath, api);

  const onCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await api<Folder>("/api/v1/folders", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName("");
      await mutateFolders();
      setActiveFolderId(created.id);
    } finally {
      setCreating(false);
    }
  };

  const onMakeDefault = async (id: string) => {
    await api(`/api/v1/folders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isDefault: true }),
    });
    await mutateFolders();
  };

  const onDeleteFolder = async (id: string) => {
    if (!confirm("Delete this folder? Its links will be removed.")) return;
    await api(`/api/v1/folders/${id}`, { method: "DELETE" });
    if (activeFolderId === id) setActiveFolderId("");
    await mutateFolders();
    await mutateLinks();
  };

  const onDeleteLink = async (id: string) => {
    await api(`/api/v1/links/${id}`, { method: "DELETE" });
    await mutateLinks();
  };

  const defaultFolder = folders?.find((f) => f.isDefault);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Links</h1>
        <p className="text-[13.5px] text-muted-foreground max-w-[560px] leading-relaxed">
          Webpages saved from the dropdat extension. New saves land in your default folder
          {defaultFolder ? (
            <> (<strong>{defaultFolder.name}</strong>)</>
          ) : null}
          .
        </p>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className="flex flex-col gap-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Folders
          </div>
          <ul className="flex flex-col gap-1">
            <li>
              <button
                onClick={() => setActiveFolderId("")}
                data-active={activeFolderId === "" || undefined}
                className="sidebar-link w-full text-left flex items-center justify-between rounded-md px-3 py-[7px] text-[13px]"
              >
                <span>All links</span>
                <span className="text-muted-foreground text-[11px]">{links?.length ?? ""}</span>
              </button>
            </li>
            {folders?.map((f) => (
              <li key={f.id} className="group">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveFolderId(f.id)}
                    data-active={activeFolderId === f.id || undefined}
                    className="sidebar-link flex-1 text-left flex items-center justify-between rounded-md px-3 py-[7px] text-[13px]"
                  >
                    <span className="truncate">
                      {f.name}
                      {f.isDefault ? (
                        <span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-primary">
                          default
                        </span>
                      ) : null}
                    </span>
                  </button>
                  {!f.isDefault && (
                    <>
                      <button
                        title="Set as default"
                        onClick={() => onMakeDefault(f.id)}
                        className="opacity-0 group-hover:opacity-100 text-[11px] text-muted-foreground hover:text-foreground px-1"
                      >
                        ★
                      </button>
                      <button
                        title="Delete folder"
                        onClick={() => onDeleteFolder(f.id)}
                        className="opacity-0 group-hover:opacity-100 text-[11px] text-muted-foreground hover:text-destructive px-1"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={onCreateFolder} className="flex gap-2 mt-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New folder…"
              className="flex-1 rounded-md bg-card border border-border px-2 py-1 text-[12.5px] outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="rounded-md bg-primary text-primary-foreground px-3 py-1 text-[12px] font-medium disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </aside>

        <div className="flex flex-col gap-3">
          {linksError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-[13px] text-destructive">
              Failed to load links: {String(linksError)}
            </div>
          )}
          {linksLoading && !links && (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg border border-border bg-card animate-pulse" />
              ))}
            </div>
          )}
          {links && links.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
              <p className="font-heading text-[18px] font-medium">No saved links yet</p>
              <p className="text-[13.5px] text-muted-foreground mt-2 max-w-[420px] mx-auto leading-relaxed">
                Right-click any page in your browser and choose
                <strong> dropdat → Save</strong> to drop it here.
              </p>
            </div>
          )}
          {links && links.length > 0 && (
            <ul className="flex flex-col gap-2">
              {links.map((l) => {
                const folder = folders?.find((f) => f.id === l.folderId);
                return (
                  <li
                    key={l.id}
                    className="group rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-w-0 flex flex-col gap-0.5"
                      >
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          {folder?.name || "—"}
                        </div>
                        <div className="text-[14px] font-medium truncate">
                          {l.title || l.url}
                        </div>
                        <div className="text-[12px] text-muted-foreground truncate">{l.url}</div>
                      </a>
                      <button
                        onClick={() => onDeleteLink(l.id)}
                        className="opacity-0 group-hover:opacity-100 text-[11px] text-muted-foreground hover:text-destructive px-2"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
