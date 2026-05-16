"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/react";

import type { Capsule, Team, TeamMember } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropdat.app";

export default function TeamDetailPage() {
  return (
    <Suspense
      fallback={<section className="py-12 text-[13px] text-muted-foreground">Loading…</section>}
    >
      <TeamDetail />
    </Suspense>
  );
}

function TeamDetail() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const authedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const token = await getToken();
      const headers = new Headers(init?.headers);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      return fetch(`${API_BASE}${path}`, { ...init, headers });
    },
    [getToken]
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const [tRes, mRes, cRes] = await Promise.all([
        authedFetch(`/api/v1/teams/${id}`),
        authedFetch(`/api/v1/teams/${id}/members`),
        authedFetch(`/api/v1/teams/${id}/capsules`),
      ]);
      if (!tRes.ok) throw new Error(tRes.status === 403 ? "You are not a member of this team." : `Load failed (${tRes.status})`);
      setTeam(await tRes.json());
      if (mRes.ok) setMembers((await mRes.json()) ?? []);
      if (cRes.ok) setCapsules((await cRes.json()) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [authedFetch, id]);

  useEffect(() => {
    load();
  }, [load]);

  const joinURL = useMemo(() => {
    if (!team?.join_token) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://capsule.dropdat.app";
    return `${origin}/teams/join?t=${team.join_token}`;
  }, [team]);

  const copyLink = async () => {
    if (!joinURL) return;
    try {
      await navigator.clipboard.writeText(joinURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const rotate = async () => {
    setBusy("rotate");
    try {
      const res = await authedFetch(`/api/v1/teams/${id}/rotate-link`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rotate failed");
    } finally {
      setBusy(null);
    }
  };

  const setRole = async (target: string, role: "admin" | "member") => {
    setBusy(`role-${target}`);
    try {
      const res = await authedFetch(`/api/v1/teams/${id}/members/${encodeURIComponent(target)}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (target: string) => {
    if (!confirm(target === user?.id ? "Leave this team?" : "Remove this member?")) return;
    setBusy(`remove-${target}`);
    try {
      const res = await authedFetch(`/api/v1/teams/${id}/members/${encodeURIComponent(target)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      if (target === user?.id) {
        router.push("/teams");
        return;
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setBusy(null);
    }
  };

  const deleteTeam = async () => {
    setBusy("delete");
    setConfirmDelete(false);
    try {
      const res = await authedFetch(`/api/v1/teams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      router.push("/teams");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  const isOwner = team?.my_role === "owner";
  const isManager = team?.my_role === "owner" || team?.my_role === "admin";

  if (!team) {
    return (
      <section className="flex flex-col gap-4">
        <Link href="/teams" className="text-[12px] text-muted-foreground hover:text-foreground">
          ← Teams
        </Link>
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        ) : (
          <div className="text-[13px] text-muted-foreground">Loading…</div>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link href="/teams" className="text-[12px] text-muted-foreground hover:text-foreground">
          ← Teams
        </Link>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">{team.name}</h1>
          <span className="text-[12px] text-muted-foreground capitalize">{team.my_role}</span>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {joinURL && isManager && (
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[14px] font-medium">Invite link</h2>
            <div className="flex items-center gap-3 text-[12.5px]">
              <button onClick={rotate} disabled={busy === "rotate"} className="underline text-muted-foreground hover:text-foreground disabled:opacity-50">
                {busy === "rotate" ? "Rotating…" : "Rotate"}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={joinURL}
              className="flex-1 bg-card border border-border px-3 py-2 text-[12.5px] font-mono rounded-md"
            />
            <button
              type="button"
              onClick={copyLink}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[12.5px] font-medium hover:opacity-90"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Anyone with this link can join. Rotating invalidates the old link immediately.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-heading text-[14px] font-medium">Members ({members.length})</h2>
        </div>
        <ul>
          {members.map((m) => (
            <li
              key={m.user_id}
              className="border-t border-border first:border-t-0 px-5 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[13.5px] font-mono truncate">{m.user_id}</span>
                <span className="text-[12px] text-muted-foreground capitalize">{m.role}</span>
              </div>
              <div className="flex items-center gap-2">
                {isManager && m.role !== "owner" && m.user_id !== user?.id && (
                  <>
                    {m.role === "member" ? (
                      <button
                        type="button"
                        onClick={() => setRole(m.user_id, "admin")}
                        disabled={busy === `role-${m.user_id}`}
                        className="text-[12px] underline text-muted-foreground hover:text-foreground"
                      >
                        Make admin
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRole(m.user_id, "member")}
                        disabled={busy === `role-${m.user_id}`}
                        className="text-[12px] underline text-muted-foreground hover:text-foreground"
                      >
                        Demote
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(m.user_id)}
                      disabled={busy === `remove-${m.user_id}`}
                      className="text-[12px] underline text-destructive hover:opacity-80"
                    >
                      Remove
                    </button>
                  </>
                )}
                {m.user_id === user?.id && m.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() => remove(m.user_id)}
                    className="text-[12px] underline text-destructive hover:opacity-80"
                  >
                    Leave
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-heading text-[14px] font-medium">Team capsules ({capsules.length})</h2>
        </div>
        {capsules.length === 0 ? (
          <div className="px-5 py-8 text-[13px] text-muted-foreground text-center">
            No capsules shared with this team yet. From any capsule, click <span className="font-medium">Share to team</span>.
          </div>
        ) : (
          <ul>
            {capsules.map((c) => (
              <li key={c.id} className="border-t border-border first:border-t-0">
                <Link
                  href={`/capsule?id=${c.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13.5px] font-medium truncate">{c.title}</span>
                    <span className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{c.source}</span>
                  </div>
                  <span className="text-[12px] text-muted-foreground">
                    {new Date(c.updated_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isOwner && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy === "delete"}
            className="text-[12.5px] underline text-destructive hover:opacity-80"
          >
            Delete team
          </button>
        </div>
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-[18px] font-medium mb-2">Delete this team?</h2>
            <p className="text-[13.5px] text-muted-foreground mb-5">
              All members lose access immediately. Shared capsules and folders go back to being
              owner-only. This can't be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-md bg-card border border-border px-4 py-2 text-[13px] hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteTeam}
                className="rounded-md bg-destructive text-white px-4 py-2 text-[13px] font-medium hover:opacity-90"
              >
                Delete team
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
