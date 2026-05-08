"use client";
import { useUser } from "@clerk/react";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-heading text-[28px] font-medium tracking-[-0.02em]">Settings</h1>

      <div className="border border-border bg-card p-6 space-y-3">
        <h2 className="font-heading text-[18px] font-medium">Account</h2>
        <dl className="text-[14px] grid grid-cols-[120px_1fr] gap-y-2">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{user?.primaryEmailAddress?.emailAddress ?? "—"}</dd>
          <dt className="text-muted-foreground">User ID</dt>
          <dd className="font-mono text-[12px]">{user?.id ?? "—"}</dd>
        </dl>
      </div>

      <div className="border border-border bg-card p-6 space-y-3">
        <h2 className="font-heading text-[18px] font-medium">Browser extension</h2>
        <p className="text-[14px] text-muted-foreground">
          Install the dropdat Chrome extension. After install, sign in once from the toolbar popup using
          the same account you&apos;re signed into here.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-border px-5 py-2 text-[14px] font-medium hover:opacity-95 transition-opacity"
        >
          Add to Chrome
        </a>
      </div>
    </section>
  );
}
