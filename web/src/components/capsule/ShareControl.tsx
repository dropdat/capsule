"use client";

import { useState } from "react";
import Link from "next/link";

import { useApi, ApiError } from "@/lib/api";

type Props = {
  capsuleId: string;
  initialToken?: string | null;
  onChange?: (token: string | null) => void;
};

export function ShareControl({ capsuleId, initialToken, onChange }: Props) {
  const api = useApi();
  const [token, setToken] = useState<string | null>(initialToken ?? null);
  const [busy, setBusy] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareURL = token
    ? `${typeof window !== "undefined" ? window.location.origin : "https://dropdat.app"}/s/${token}`
    : null;

  const share = async () => {
    setBusy(true);
    setError(null);
    try {
      const { share_token } = await api<{ share_token: string }>(
        `/api/v1/capsules/${capsuleId}/share`,
        { method: "POST" }
      );
      setToken(share_token);
      onChange?.(share_token);
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) {
        setUpgradeOpen(true);
      } else {
        setError(e instanceof Error ? e.message : "Failed to share");
      }
    } finally {
      setBusy(false);
    }
  };

  const unshare = async () => {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/v1/capsules/${capsuleId}/share`, { method: "DELETE" });
      setToken(null);
      onChange?.(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to unshare");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!shareURL) return;
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {token ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-md bg-secondary border border-border px-3 py-2 text-[12.5px] font-medium hover:bg-card max-w-[260px] truncate"
            title={shareURL ?? ""}
          >
            {copied ? "Copied ✓" : shareURL}
          </button>
          <button
            type="button"
            onClick={unshare}
            disabled={busy}
            className="rounded-md bg-card border border-border px-3 py-2 text-[12.5px] font-medium text-destructive hover:bg-accent-soft/40 disabled:opacity-50"
          >
            Unshare
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={share}
          disabled={busy}
          className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] font-medium hover:bg-card disabled:opacity-50"
        >
          {busy ? "Sharing…" : "Share"}
        </button>
      )}
      {error && <span className="text-[12px] text-destructive">{error}</span>}

      {upgradeOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setUpgradeOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-[18px] font-medium mb-2">Sharing is an Ultimate feature</h2>
            <p className="text-[13.5px] text-muted-foreground mb-5">
              Public share links are available on the Ultimate plan. Upgrade to publish a
              read-only URL for any capsule.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUpgradeOpen(false)}
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
      )}
    </>
  );
}
