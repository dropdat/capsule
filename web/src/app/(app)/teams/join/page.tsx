"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropdat.app";

function JoinInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("t") ?? "";
  const { getToken } = useAuth();
  const [state, setState] = useState<"idle" | "working" | "ok" | "error" | "upgrade">("idle");
  const [error, setError] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);

  const join = useCallback(async () => {
    setState("working");
    setError(null);
    try {
      const authToken = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/teams/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ token }),
      });
      if (res.status === 402) {
        setState("upgrade");
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Join failed (${res.status})`);
      }
      const team: { id: string; name: string } = await res.json();
      setTeamName(team.name);
      setState("ok");
      setTimeout(() => router.push(`/teams/team?id=${team.id}`), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Join failed");
      setState("error");
    }
  }, [getToken, router, token]);

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("Missing invite token.");
      return;
    }
    join();
  }, [token, join]);

  return (
    <section className="mx-auto max-w-md flex flex-col gap-5 py-12">
      <Link href="/teams" className="text-[12px] text-muted-foreground hover:text-foreground">
        ← Teams
      </Link>
      <h1 className="font-heading text-[22px] font-medium">Joining team…</h1>

      {state === "working" && <p className="text-[13.5px] text-muted-foreground">Hold on a sec.</p>}

      {state === "ok" && (
        <p className="text-[13.5px]">
          You're in — welcome to <span className="font-medium">{teamName}</span>. Redirecting…
        </p>
      )}

      {state === "error" && (
        <>
          <p className="text-[13.5px] text-destructive">{error}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={join}
              className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] hover:bg-card"
            >
              Try again
            </button>
            <Link
              href="/teams"
              className="rounded-md bg-card border border-border px-4 py-2 text-[13px] hover:bg-muted"
            >
              Back to teams
            </Link>
          </div>
        </>
      )}

      {state === "upgrade" && (
        <>
          <p className="text-[13.5px] text-muted-foreground">
            Joining a team requires a paid plan. Upgrade to continue.
          </p>
          <div className="flex gap-2">
            <Link
              href="/billing"
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90"
            >
              See plans
            </Link>
            <Link
              href="/teams"
              className="rounded-md bg-card border border-border px-4 py-2 text-[13px] hover:bg-muted"
            >
              Not now
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<section className="py-12 text-[13px] text-muted-foreground">Loading…</section>}>
      <JoinInner />
    </Suspense>
  );
}
