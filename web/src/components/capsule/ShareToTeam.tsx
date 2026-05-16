"use client";

import { useCallback, useEffect, useState } from "react";

import { useApi, type Team } from "@/lib/api";

type Props = {
  capsuleId: string;
};

export function ShareToTeam({ capsuleId }: Props) {
  const api = useApi();
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const t = await api<Team[]>("/api/v1/teams");
      setTeams(t);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load teams");
      setTeams([]);
    }
  }, [api]);

  useEffect(() => {
    if (open && !teams) load();
  }, [open, teams, load]);

  const assign = async (teamId: string) => {
    setBusy(teamId);
    setErr(null);
    try {
      await api(`/api/v1/capsules/${capsuleId}/team`, {
        method: "POST",
        body: JSON.stringify({ team_id: teamId }),
      });
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Share failed");
    } finally {
      setBusy(null);
    }
  };

  const unshare = async () => {
    setBusy("unshare");
    try {
      await api(`/api/v1/capsules/${capsuleId}/team`, {
        method: "POST",
        body: JSON.stringify({ team_id: "" }),
      });
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unshare failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-secondary border border-border px-4 py-2 text-[13px] font-medium hover:bg-card"
      >
        Share to team
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-[18px] font-medium mb-2">Share to a team</h2>
            <p className="text-[13.5px] text-muted-foreground mb-4">
              Members of the team you pick will be able to read this capsule.
            </p>

            {err && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive mb-3">
                {err}
              </div>
            )}

            {!teams ? (
              <p className="text-[13px] text-muted-foreground">Loading teams…</p>
            ) : teams.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                You don't belong to any teams yet. Create one on the Teams page first.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto">
                {teams.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => assign(t.id)}
                      disabled={busy === t.id}
                      className="w-full flex items-center justify-between text-left rounded-md border border-border bg-card px-3 py-2 hover:bg-muted disabled:opacity-50"
                    >
                      <span className="text-[13.5px] font-medium">{t.name}</span>
                      <span className="text-[11.5px] uppercase tracking-wide text-muted-foreground">
                        {t.my_role}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-between gap-2 mt-5">
              <button
                type="button"
                onClick={unshare}
                disabled={busy === "unshare"}
                className="text-[12.5px] underline text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {busy === "unshare" ? "Removing…" : "Remove from team"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-card border border-border px-4 py-2 text-[13px] hover:bg-muted"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
