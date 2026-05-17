"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropdat.app";

type APIKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
};

type CreateResponse = APIKey & { token: string };

type Subscription = {
  tier: string;
  scopes: string[];
};

const SCOPE_LABEL: Record<string, string> = {
  "capsules:read": "Read capsules",
  "capsules:write": "Write capsules",
  mcp: "MCP server access",
  attachments: "Attachments",
  dynamic_context: "Dynamic context",
  versioning: "Versioning",
  teams: "Teams",
  "teams:create": "Create teams",
  share: "Public sharing",
};

export default function APIKeysPage() {
  const { getToken } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<CreateResponse | null>(null);
  const [allowedScopes, setAllowedScopes] = useState<string[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());

  const authedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const token = await getToken();
      const headers = new Headers(init?.headers);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return fetch(`${API_BASE}${path}`, { ...init, headers });
    },
    [getToken]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch("/api/v1/api_keys");
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      setKeys(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [authedFetch]);

  useEffect(() => {
    refresh();
    (async () => {
      try {
        const res = await authedFetch("/api/v1/billing/subscription");
        if (!res.ok) return;
        const sub: Subscription = await res.json();
        setAllowedScopes(sub.scopes ?? []);
        setSelectedScopes(new Set(sub.scopes ?? []));
      } catch {
        // non-fatal — user can still create a key, server defaults to all
      }
    })();
  }, [refresh, authedFetch]);

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  };

  const create = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await authedFetch("/api/v1/api_keys", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim() || "Extension",
          scopes: Array.from(selectedScopes),
        }),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      const created: CreateResponse = await res.json();
      setJustCreated(created);
      setName("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this key? Any extension using it will be signed out.")) return;
    setError(null);
    try {
      const res = await authedFetch(`/api/v1/api_keys/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`Revoke failed (${res.status})`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke");
    }
  };

  const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => {});

  const live = keys.filter((k) => !k.revoked_at);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">API Keys</h1>
        <p className="text-[13.5px] text-muted-foreground max-w-[640px] leading-relaxed">
          Generate a personal key to sign the dropdat browser extension into your account.
          Keys are shown once at creation — store them somewhere safe.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-heading text-[14px] font-medium">Create new key</h2>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            dk_live_…
          </span>
        </div>
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Name (e.g. My laptop)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-[13.5px] outline-none transition-colors focus:border-primary"
            />
            <button
              onClick={create}
              disabled={creating || selectedScopes.size === 0}
              className="rounded-md bg-primary px-4 py-2 text-[13.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {creating ? "Creating…" : "Generate key"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] uppercase tracking-wide text-muted-foreground">
                Scopes — only the ones your current plan allows are listed
              </p>
              {allowedScopes.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedScopes((prev) =>
                      prev.size === allowedScopes.length ? new Set() : new Set(allowedScopes)
                    )
                  }
                  className="text-[11.5px] text-muted-foreground hover:text-foreground"
                >
                  {selectedScopes.size === allowedScopes.length ? "Clear all" : "Select all"}
                </button>
              )}
            </div>
            {allowedScopes.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">
                Loading available scopes… (If this persists, your plan grants no API scopes.)
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {allowedScopes.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedScopes.has(s)}
                      onChange={() => toggleScope(s)}
                    />
                    <span>{SCOPE_LABEL[s] ?? s}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {justCreated && (
          <div className="mx-5 mb-5 rounded-md border border-primary/30 bg-accent-soft p-4">
            <p className="text-[13px] font-medium">
              Copy this key now — you won&rsquo;t be able to see it again.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 break-all rounded-md border border-input bg-background px-3 py-2 font-mono text-[12px]">
                {justCreated.token}
              </code>
              <button
                onClick={() => copy(justCreated.token)}
                className="rounded-md border border-border bg-background px-3 py-2 text-[12px] font-medium transition-colors hover:bg-muted"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setJustCreated(null)}
              className="mt-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              I&rsquo;ve saved it, dismiss →
            </button>
          </div>
        )}

        {error && (
          <p className="mx-5 mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
            {error}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-[14px] font-medium">Your keys</h2>
          <span className="text-[12px] text-muted-foreground">
            {loading ? "…" : `${live.length} active`}
          </span>
        </div>

        {loading ? (
          <div className="rounded-lg border border-border bg-card px-5 py-8 text-[13px] text-muted-foreground">
            Loading…
          </div>
        ) : live.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 px-5 py-10 text-center">
            <p className="text-[13.5px] text-muted-foreground">No keys yet.</p>
            <p className="mt-1 text-[12px] text-muted-foreground/70">
              Generate one above to sign into the extension.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Prefix</th>
                  <th className="px-5 py-3 font-medium">Scopes</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">Last used</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {live.map((k, i) => (
                  <tr
                    key={k.id}
                    className={i > 0 ? "border-t border-border/60" : undefined}
                  >
                    <td className="px-5 py-3 font-medium">{k.name}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">
                      {k.prefix}…
                    </td>
                    <td className="px-5 py-3 text-[11.5px] text-muted-foreground">
                      {k.scopes && k.scopes.length > 0
                        ? k.scopes.map((s) => SCOPE_LABEL[s] ?? s).join(", ")
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => revoke(k.id)}
                        className="text-[12px] text-destructive transition-opacity hover:opacity-80"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
