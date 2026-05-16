"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/react";

import type { Team } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropdat.app";

export default function TeamsPage() {
  const { getToken } = useAuth();
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

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
      const res = await authedFetch("/api/v1/teams");
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      setTeams((await res.json()) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setTeams([]);
    }
  }, [authedFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await authedFetch("/api/v1/teams", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.status === 402) {
        setUpgradeOpen(true);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      setName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Teams</h1>
        <p className="text-[13.5px] text-muted-foreground">
          Share capsules and folders with collaborators via a private join link.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New team name"
          className="flex-1 bg-card border border-border px-3 py-2 text-[13.5px] rounded-md"
        />
        <button
          type="button"
          onClick={create}
          disabled={busy || !name.trim()}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create team"}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <h2 className="font-heading text-[14px] font-medium">Your teams</h2>
          {teams && <span className="text-[12px] text-muted-foreground">{teams.length} total</span>}
        </div>
        {!teams ? (
          <div className="px-5 py-6 text-[13px] text-muted-foreground">Loading…</div>
        ) : teams.length === 0 ? (
          <div className="px-5 py-8 text-[13px] text-muted-foreground text-center">
            You don't belong to any teams yet. Create one above or open a join link.
          </div>
        ) : (
          <ul>
            {teams.map((t) => (
              <li key={t.id} className="border-t border-border first:border-t-0">
                <Link
                  href={`/teams/team?id=${t.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium">{t.name}</span>
                    <span className="text-[12px] text-muted-foreground">
                      {t.my_role === "owner" ? "Owner" : t.my_role === "admin" ? "Admin" : "Member"}
                    </span>
                  </div>
                  <span className="text-[12px] text-muted-foreground">
                    Updated {new Date(t.updated_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {upgradeOpen && (
        <UpgradeDialog onClose={() => setUpgradeOpen(false)} />
      )}
    </section>
  );
}

function UpgradeDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-heading text-[18px] font-medium mb-2">Teams need a paid plan</h2>
        <p className="text-[13.5px] text-muted-foreground mb-5">
          Creating or joining a team is available on Pro and above. Upgrade your plan to start
          collaborating.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-card border border-border px-4 py-2 text-[13px] hover:bg-muted"
          >
            Not now
          </button>
          <Link
            href="/billing"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90"
          >
            See plans
          </Link>
        </div>
      </div>
    </div>
  );
}
