"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropdat.app";

type APIKey = {
  id: string;
  name: string;
  prefix: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
};

type CreateResponse = APIKey & { token: string };

export default function APIKeysPage() {
  const { getToken } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<CreateResponse | null>(null);

  const authedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const token = await getToken();
      const headers = new Headers(init?.headers);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return fetch(`${API_BASE}${path}`, { ...init, headers, credentials: "include" });
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
  }, [refresh]);

  const create = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await authedFetch("/api/v1/api_keys", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() || "Extension" }),
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
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-heading text-[28px] font-medium tracking-tight">API Keys</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Generate a key to sign into the dropdat browser extension. Keys are tied to your account.
        </p>
      </header>

      <section className="border border-border bg-card p-5">
        <h2 className="font-heading text-[16px] font-medium mb-3">Create new key</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Name (e.g. My laptop)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-input bg-background px-3 py-2 text-[14px] outline-none focus:border-primary"
          />
          <button
            onClick={create}
            disabled={creating}
            className="border border-primary bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground hover:opacity-95 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Generate key"}
          </button>
        </div>

        {justCreated && (
          <div className="mt-4 border border-primary/30 bg-accent-soft p-4">
            <p className="text-[13px] font-medium">
              Copy this key now — you won&rsquo;t be able to see it again.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 break-all border border-input bg-background px-3 py-2 font-mono text-[12px]">
                {justCreated.token}
              </code>
              <button
                onClick={() => copy(justCreated.token)}
                className="border border-border bg-background px-3 py-2 text-[12px] font-medium hover:bg-accent-soft"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setJustCreated(null)}
              className="mt-2 text-[12px] text-muted-foreground hover:text-foreground"
            >
              I&rsquo;ve saved it, dismiss →
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-[13px] text-destructive">{error}</p>}
      </section>

      <section>
        <h2 className="font-heading text-[16px] font-medium mb-3">
          Your keys {!loading && `(${live.length})`}
        </h2>
        {loading ? (
          <p className="text-[13px] text-muted-foreground">Loading…</p>
        ) : live.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No keys yet.</p>
        ) : (
          <div className="overflow-hidden border border-border">
            <table className="w-full text-[13px]">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Prefix</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                  <th className="px-4 py-2 font-medium">Last used</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {live.map((k) => (
                  <tr key={k.id} className="border-t border-border">
                    <td className="px-4 py-2">{k.name}</td>
                    <td className="px-4 py-2 font-mono text-[12px]">{k.prefix}…</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => revoke(k.id)}
                        className="text-[12px] text-destructive hover:underline"
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
