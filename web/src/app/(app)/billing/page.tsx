"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/react";

import type { Subscription, Tier } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropdat.app";

type Feature = { label: string; on: boolean };

type Plan = {
  id: Tier;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: Feature[];
  cta: "current" | "subscribe" | "contact";
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$0",
    cadence: "/month",
    tagline: "Essential capsule management for casual users.",
    features: [
      { label: "5 total capsules", on: true },
      { label: "Mobile capture (PWA share-target)", on: true },
      { label: "Versioning", on: false },
      { label: "MCP server access", on: false },
      { label: "File attachments (R2)", on: false },
      { label: "Image capture from chats", on: false },
      { label: "Dynamic context bundles", on: false },
      { label: "Context packs", on: false },
      { label: "Create & join teams", on: false },
      { label: "Similarity graphs", on: false },
      { label: "Share capsules publicly", on: false },
    ],
    cta: "current",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$3",
    cadence: "/month",
    tagline: "Advanced features for solo power users.",
    features: [
      { label: "15 total capsules", on: true },
      { label: "Mobile capture (PWA share-target)", on: true },
      { label: "Versioning", on: true },
      { label: "Create & join teams", on: true },
      { label: "MCP server access", on: false },
      { label: "File attachments (R2)", on: false },
      { label: "Image capture from chats", on: false },
      { label: "Dynamic context bundles", on: false },
      { label: "Context packs", on: false },
      { label: "Similarity graphs", on: false },
      { label: "Share capsules publicly", on: false },
    ],
    cta: "subscribe",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$5",
    cadence: "/month",
    tagline: "MCP, attachments, dynamic context — built for serious knowledge workers.",
    features: [
      { label: "50 total capsules", on: true },
      { label: "Mobile capture (PWA share-target)", on: true },
      { label: "Versioning", on: true },
      { label: "Create & join teams", on: true },
      { label: "MCP server access", on: true },
      { label: "File attachments (R2)", on: true },
      { label: "Image capture from chats", on: true },
      { label: "Dynamic context bundles", on: true },
      { label: "Context packs", on: true },
      { label: "Similarity graphs", on: false },
      { label: "Share capsules publicly", on: false },
    ],
    cta: "subscribe",
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: "$10",
    cadence: "/month",
    tagline: "Maximum collaboration and white-label.",
    features: [
      { label: "Unlimited capsules", on: true },
      { label: "Mobile capture (PWA share-target)", on: true },
      { label: "Versioning", on: true },
      { label: "Create & join teams", on: true },
      { label: "MCP server access", on: true },
      { label: "File attachments (R2)", on: true },
      { label: "Image capture from chats", on: true },
      { label: "Dynamic context bundles", on: true },
      { label: "Context packs", on: true },
      { label: "Similarity graphs", on: true },
      { label: "Share capsules publicly", on: true },
    ],
    cta: "subscribe",
    highlight: true,
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 8.5l3.2 3.2L13 5" />
    </svg>
  );
}
function CrossIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  );
}

type StatusModal =
  | { kind: "success"; tier?: string }
  | { kind: "pending" }
  | { kind: "error"; message: string }
  | { kind: "cancelled" }
  | null;

export default function BillingPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [statusModal, setStatusModal] = useState<StatusModal>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const authedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const token = await getToken();
      const headers = new Headers(init?.headers);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return fetch(`${API_BASE}${path}`, { ...init, headers });
    },
    [getToken]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch("/api/v1/billing/subscription");
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      setSub(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }, [authedFetch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Handle redirects back from the dodopayments hosted checkout. The URL
  // looks like /billing?status=completed&subscription_id=sub_… on success
  // (we set the return URL) or status=failed on cancel.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const status = url.searchParams.get("status");
    const subscriptionId = url.searchParams.get("subscription_id");
    if (!status) return;

    // Strip the query params so a refresh doesn't re-trigger this branch.
    const clean = window.location.pathname;
    window.history.replaceState({}, "", clean);

    if (status === "completed" && subscriptionId) {
      setStatusModal({ kind: "pending" });
      (async () => {
        try {
          const res = await authedFetch("/api/v1/billing/sync", {
            method: "POST",
            body: JSON.stringify({ subscription_id: subscriptionId }),
          });
          if (!res.ok) throw new Error(await res.text());
          const synced: Subscription = await res.json();
          setSub(synced);
          setStatusModal({ kind: "success", tier: synced.tier });
        } catch (e) {
          setStatusModal({
            kind: "error",
            message:
              e instanceof Error
                ? e.message
                : "We couldn't confirm your subscription. Please refresh in a moment.",
          });
        }
      })();
    } else if (status === "completed") {
      setStatusModal({ kind: "pending" });
    } else {
      setStatusModal({
        kind: "error",
        message: "Payment was not completed. No charge was made.",
      });
    }
  }, [authedFetch]);

  const currentTier: Tier = sub?.tier ?? "basic";

  const subscribe = async (plan: Tier) => {
    setBusy(plan);
    setError(null);
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      const res = await authedFetch("/api/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan, billing_interval: interval, email }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Checkout failed (${res.status})`);
      }
      const data: { link: string } = await res.json();
      window.location.href = data.link;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBusy(null);
    }
  };

  const cancelSubscription = async () => {
    setBusy("cancel");
    setError(null);
    setConfirmCancel(false);
    try {
      const res = await authedFetch("/api/v1/billing/cancel", { method: "POST" });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Cancel failed (${res.status})`);
      }
      const updated: Subscription = await res.json();
      setSub(updated);
      setStatusModal({ kind: "cancelled" });
    } catch (e) {
      setStatusModal({
        kind: "error",
        message: e instanceof Error ? e.message : "Cancel failed",
      });
    } finally {
      setBusy(null);
    }
  };

  const refreshFromDodo = async () => {
    setBusy("resync");
    setError(null);
    try {
      const email = user?.primaryEmailAddress?.emailAddress ?? "";
      const res = await authedFetch("/api/v1/billing/sync", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSub(await res.json());
      } else if (res.status === 404) {
        await refresh();
        setStatusModal({
          kind: "error",
          message:
            "No subscription was found for your email at the payment processor. If you just paid, give it a minute and try again.",
        });
      } else {
        await refresh();
      }
    } catch {
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const usage = useMemo(() => {
    if (!sub) return null;
    if (sub.capsule_limit < 0) return `${sub.capsules_used} capsules used (unlimited)`;
    return `${sub.capsules_used} of ${sub.capsule_limit} capsules used`;
  }, [sub]);

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-tight">Billing</h1>
        <p className="text-[13.5px] text-muted-foreground">
          Pick the plan that fits how you work. Cancel or change any time.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <h2 className="font-heading text-[14px] font-medium">Current plan</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refreshFromDodo}
              disabled={busy === "resync"}
              className="text-[12.5px] underline text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {busy === "resync" ? "Syncing…" : "Refresh"}
            </button>
            {sub?.has_customer && sub.tier !== "basic" && sub.status !== "cancelled" && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                disabled={busy === "cancel"}
                className="text-[12.5px] underline text-destructive hover:opacity-80 disabled:opacity-50"
              >
                {busy === "cancel" ? "Cancelling…" : "Cancel plan"}
              </button>
            )}
          </div>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-y-3 text-[13.5px]">
          <div>
            <div className="text-muted-foreground text-[12px] uppercase tracking-wide">Tier</div>
            <div className="font-medium capitalize">{loading ? "…" : currentTier}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[12px] uppercase tracking-wide">Status</div>
            <div className="font-medium capitalize">{loading ? "…" : sub?.status ?? "inactive"}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[12px] uppercase tracking-wide">Usage</div>
            <div className="font-medium">{loading ? "…" : usage}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[12.5px] text-muted-foreground">Billing</span>
        <div className="inline-flex rounded-md border border-border overflow-hidden text-[12.5px]">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={`px-3 py-1 ${interval === "monthly" ? "bg-primary text-primary-foreground" : "bg-card"}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("annual")}
            className={`px-3 py-1 border-l border-border ${interval === "annual" ? "bg-primary text-primary-foreground" : "bg-card"}`}
          >
            Annual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map((p) => {
          const isCurrent = currentTier === p.id;
          const canSubscribe = p.cta === "subscribe" && !isCurrent;
          return (
            <div
              key={p.id}
              className={`relative rounded-lg border bg-card p-5 flex flex-col gap-4 ${
                p.highlight ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-border"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-2 left-5 rounded-full bg-primary text-primary-foreground text-[11px] px-2 py-[2px]">
                  Most popular
                </span>
              )}
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-[16px] font-medium">{p.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-[28px] font-medium">{p.price}</span>
                  <span className="text-[12px] text-muted-foreground">{p.cadence}</span>
                </div>
                <p className="text-[12.5px] text-muted-foreground">{p.tagline}</p>
              </div>
              <ul className="flex flex-col gap-1.5 text-[13px]">
                {p.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    {f.on ? (
                      <CheckIcon className="mt-[3px] h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <CrossIcon className="mt-[3px] h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                    )}
                    <span className={f.on ? "" : "text-muted-foreground line-through decoration-muted-foreground/40"}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-md border border-border bg-card text-[13px] py-2 text-muted-foreground"
                  >
                    Current plan
                  </button>
                ) : canSubscribe ? (
                  <button
                    type="button"
                    onClick={() => subscribe(p.id)}
                    disabled={busy === p.id}
                    className="w-full rounded-md bg-primary text-primary-foreground text-[13px] py-2 font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {busy === p.id ? "Redirecting…" : `Upgrade to ${p.name}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => subscribe(p.id)}
                    disabled={busy === p.id}
                    className="w-full rounded-md border border-border text-[13px] py-2 hover:bg-muted disabled:opacity-50"
                  >
                    Subscribe
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div className="rounded-lg border border-dashed border-border bg-card p-5 flex flex-col gap-4 xl:col-span-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-heading text-[16px] font-medium">Enterprise</h3>
              <p className="text-[12.5px] text-muted-foreground">
                Custom capsule limits, white-labeling, on-premise, dedicated support, SLA.
              </p>
            </div>
            <a
              href="mailto:hello@dropdat.app?subject=Enterprise%20inquiry"
              className="rounded-md bg-foreground text-background text-[13px] py-2 px-4 font-medium"
            >
              Contact sales
            </a>
          </div>
        </div>
      </div>

      {statusModal && (
        <Modal onClose={() => setStatusModal(null)}>
          {statusModal.kind === "pending" && (
            <ModalBody
              title="Confirming your payment…"
              body="Hang tight — we're syncing with the payment processor. This usually takes a few seconds."
              actions={[{ label: "OK", onClick: () => setStatusModal(null), primary: true }]}
            />
          )}
          {statusModal.kind === "success" && (
            <ModalBody
              title="You're upgraded 🎉"
              body={`Welcome to ${(statusModal.tier ?? "your new").toString().replace(/^./, (c) => c.toUpperCase())}. Your subscription is active and the new limits apply right away. An invoice has been emailed to you.`}
              actions={[{ label: "Got it", onClick: () => setStatusModal(null), primary: true }]}
            />
          )}
          {statusModal.kind === "cancelled" && (
            <ModalBody
              title="Subscription cancelled"
              body="Your plan won't renew. You keep access until the end of the current billing period."
              actions={[{ label: "OK", onClick: () => setStatusModal(null), primary: true }]}
            />
          )}
          {statusModal.kind === "error" && (
            <ModalBody
              title="Something went wrong"
              body={statusModal.message}
              actions={[
                { label: "Close", onClick: () => setStatusModal(null) },
                { label: "Refresh now", onClick: refreshFromDodo, primary: true },
              ]}
            />
          )}
        </Modal>
      )}

      {confirmCancel && (
        <Modal onClose={() => setConfirmCancel(false)}>
          <ModalBody
            title="Cancel subscription?"
            body="Recurring payments will stop. You'll keep your current plan until the end of the billing period, then drop to Basic."
            actions={[
              { label: "Keep plan", onClick: () => setConfirmCancel(false) },
              {
                label: busy === "cancel" ? "Cancelling…" : "Yes, cancel",
                onClick: cancelSubscription,
                primary: true,
                destructive: true,
                disabled: busy === "cancel",
              },
            ]}
          />
        </Modal>
      )}
    </section>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
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
        {children}
      </div>
    </div>
  );
}

function ModalBody({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    primary?: boolean;
    destructive?: boolean;
    disabled?: boolean;
  }>;
}) {
  return (
    <>
      <h2 className="font-heading text-[18px] font-medium mb-2">{title}</h2>
      <p className="text-[13.5px] text-muted-foreground mb-5 whitespace-pre-wrap">{body}</p>
      <div className="flex justify-end gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            disabled={a.disabled}
            className={
              a.primary
                ? a.destructive
                  ? "rounded-md bg-destructive text-white px-4 py-2 text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
                  : "rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
                : "rounded-md bg-card border border-border px-4 py-2 text-[13px] hover:bg-muted disabled:opacity-50"
            }
          >
            {a.label}
          </button>
        ))}
      </div>
    </>
  );
}
