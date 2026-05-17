"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useApi } from "@/lib/api";

type Stats = {
  totalUsers: number;
  liveUsers: number;
  active24h: number;
  totalCapsules: number;
  totalPacks: number;
  totalAttachments: number;
  attachmentBytes: number;
  bannedUsers: number;
  tiers: { tier: string; users: number }[];
};

type UserRow = {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  tier: string;
  subscriptionStatus: string;
  capsuleCount: number;
  lastSeenAt: string;
  lastPath: string;
  requestCount: number;
  banned: boolean;
  bannedReason: string;
};

type UserCapsule = {
  id: string;
  title: string;
  summary: string;
  source: string;
  updatedAt: string;
  createdAt: string;
  version: number;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!t) return "—";
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function AdminPage() {
  const api = useApi();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [userCapsules, setUserCapsules] = useState<UserCapsule[]>([]);
  const [capsulesLoading, setCapsulesLoading] = useState(false);

  // Background polls would flash "Failed to fetch" on every transient hiccup.
  // We only surface errors after two consecutive failures, and clear them on
  // the next success. Initial loads still report immediately.
  const statsFails = useRef(0);
  const usersFails = useRef(0);

  const loadStats = useCallback(
    async (silent = false) => {
      try {
        const s = await api<Stats>("/api/v1/admin/stats");
        setStats(s);
        statsFails.current = 0;
        setError(null);
      } catch (e) {
        statsFails.current += 1;
        if (!silent || statsFails.current >= 2) {
          setError(e instanceof Error ? e.message : "Stats load failed");
        }
      }
    },
    [api],
  );

  const loadUsers = useCallback(
    async (silent = false) => {
      try {
        const u = await api<UserRow[]>("/api/v1/admin/users?limit=300");
        setUsers(u ?? []);
        usersFails.current = 0;
        setError(null);
      } catch (e) {
        usersFails.current += 1;
        if (!silent || usersFails.current >= 2) {
          setError(e instanceof Error ? e.message : "Users load failed");
        }
      }
    },
    [api],
  );

  const openUser = useCallback(
    async (u: UserRow) => {
      setSelectedUser(u);
      setUserCapsules([]);
      setCapsulesLoading(true);
      try {
        const cs = await api<UserCapsule[]>(
          `/api/v1/admin/users/${encodeURIComponent(u.userId)}/capsules`,
        );
        setUserCapsules(cs ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Capsules load failed");
      } finally {
        setCapsulesLoading(false);
      }
    },
    [api],
  );

  useEffect(() => {
    api<{ admin: boolean }>("/api/v1/admin/me")
      .then((r) => setAllowed(r.admin))
      .catch(() => setAllowed(false));
  }, [api]);

  useEffect(() => {
    if (allowed) {
      loadStats(false);
      loadUsers(false);
      const t = setInterval(() => {
        loadStats(true);
        loadUsers(true);
      }, 15000);
      return () => clearInterval(t);
    }
  }, [allowed, loadStats, loadUsers]);

  const ban = async (userId: string) => {
    const reason = prompt("Ban reason (visible to the user on every request):");
    if (reason == null) return;
    try {
      await api(`/api/v1/admin/users/${encodeURIComponent(userId)}/ban`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      await loadUsers();
      await loadStats();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ban failed");
    }
  };

  const unban = async (userId: string) => {
    if (!confirm(`Unban ${userId}?`)) return;
    try {
      await api(`/api/v1/admin/users/${encodeURIComponent(userId)}/unban`, { method: "POST" });
      await loadUsers();
      await loadStats();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unban failed");
    }
  };

  if (allowed === null) {
    return <p className="text-[13px] text-muted-foreground">Checking admin access…</p>;
  }
  if (!allowed) {
    return (
      <section className="flex flex-col gap-2">
        <h1 className="font-heading text-[22px] font-medium tracking-tight">Admin</h1>
        <p className="text-[13.5px] text-muted-foreground">
          Your account isn&rsquo;t in <code className="font-mono text-[12px]">ADMIN_USER_IDS</code>.
        </p>
      </section>
    );
  }

  const filtered = users.filter((u) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      u.userId.toLowerCase().includes(q) ||
      u.tier.toLowerCase().includes(q) ||
      u.lastPath.toLowerCase().includes(q)
    );
  });

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Admin</h1>
        <p className="text-[13.5px] text-muted-foreground">
          Operational dashboard. Stats auto-refresh every 15s.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* Stat tiles */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Tile label="Live (5m)" value={String(stats.liveUsers)} accent />
          <Tile label="Active 24h" value={String(stats.active24h)} />
          <Tile label="Total users" value={String(stats.totalUsers)} />
          <Tile label="Banned" value={String(stats.bannedUsers)} />
          <Tile label="Capsules" value={String(stats.totalCapsules)} />
          <Tile label="Packs" value={String(stats.totalPacks)} />
          <Tile label="Attachments" value={String(stats.totalAttachments)} />
          <Tile label="Storage" value={formatBytes(stats.attachmentBytes)} />
        </div>
      )}

      {/* Tier breakdown */}
      {stats && stats.tiers.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-[14px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Subscriptions
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.tiers.map((t) => (
              <span
                key={t.tier}
                className="text-[12.5px] rounded-md border border-border bg-background px-3 py-1.5"
              >
                <span className="font-medium capitalize">{t.tier}</span>
                <span className="text-muted-foreground"> · {String(t.users)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* User capsules drawer */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex justify-end"
          onClick={() => setSelectedUser(null)}
        >
          <aside
            className="h-full w-full max-w-[520px] bg-card border-l border-border overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sticky top-0 bg-card border-b border-border px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {selectedUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedUser.avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full flex-none"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-muted flex-none" />
                )}
                <div className="min-w-0">
                  <div className="font-heading text-[15px] truncate">
                    {selectedUser.displayName}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate">
                    {selectedUser.userId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[12px] text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </header>

            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Capsules · {userCapsules.length}
              </div>
              {capsulesLoading ? (
                <p className="text-[13px] text-muted-foreground">Loading…</p>
              ) : userCapsules.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No capsules.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {userCapsules.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-md border border-border bg-background px-3 py-2"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium text-[13px] truncate">
                          {c.title || "Untitled"}
                        </span>
                        <span className="text-[10.5px] text-muted-foreground flex-none">
                          v{c.version} · {c.source} · {relativeTime(c.updatedAt)}
                        </span>
                      </div>
                      {c.summary && (
                        <p className="text-[11.5px] text-muted-foreground line-clamp-2">
                          {c.summary}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between gap-3">
          <h2 className="font-heading text-[14px] font-medium">Users · {filtered.length}</h2>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by id, tier, path…"
            className="rounded-md bg-background border border-border px-3 py-1.5 text-[12.5px] w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[12.5px]">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 font-medium">User</th>
                <th className="px-5 py-2.5 font-medium">Tier</th>
                <th className="px-5 py-2.5 font-medium">Capsules</th>
                <th className="px-5 py-2.5 font-medium">Requests</th>
                <th className="px-5 py-2.5 font-medium">Last seen</th>
                <th className="px-5 py-2.5 font-medium">Last path</th>
                <th className="px-5 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.userId}
                  className="border-t border-border/60 cursor-pointer hover:bg-accent-soft/40"
                  onClick={() => openUser(u)}
                >
                  <td className="px-5 py-2 max-w-[280px]" title={`${u.userId}${u.email ? ` · ${u.email}` : ""}`}>
                    {u.banned && (
                      <span className="inline-block mr-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-destructive/15 text-destructive">
                        banned
                      </span>
                    )}
                    <div className="flex items-center gap-2 min-w-0">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="w-5 h-5 rounded-full flex-none"
                        />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-muted flex-none" />
                      )}
                      <span className="truncate text-[12.5px]">{u.displayName}</span>
                    </div>
                    {u.email && (
                      <span className="block text-[10.5px] text-muted-foreground truncate">
                        {u.email}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-2 capitalize">{u.tier}</td>
                  <td className="px-5 py-2">{u.capsuleCount}</td>
                  <td className="px-5 py-2">{u.requestCount}</td>
                  <td className="px-5 py-2 text-muted-foreground" title={u.lastSeenAt}>
                    {relativeTime(u.lastSeenAt)}
                  </td>
                  <td className="px-5 py-2 font-mono text-[11px] text-muted-foreground truncate max-w-[260px]" title={u.lastPath}>
                    {u.lastPath || "—"}
                  </td>
                  <td className="px-5 py-2 text-right">
                    {u.banned ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unban(u.userId);
                        }}
                        className="text-[12px] text-primary hover:opacity-80"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          ban(u.userId);
                        }}
                        className="text-[12px] text-destructive hover:opacity-80"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-border p-4 flex flex-col gap-1 ${
        accent ? "bg-accent-soft" : "bg-card"
      }`}
    >
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-heading text-[22px] font-medium">{value}</span>
    </div>
  );
}
