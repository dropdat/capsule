"use client";
import { useUser } from "@clerk/react";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[26px] font-medium tracking-tight">Settings</h1>
        <p className="text-[13.5px] text-muted-foreground">Account and extension management.</p>
      </header>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-heading text-[14px] font-medium">Account</h2>
        </div>
        <dl className="px-5 py-5 text-[13.5px] grid grid-cols-[120px_1fr] gap-y-3">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{user?.primaryEmailAddress?.emailAddress ?? "—"}</dd>
          <dt className="text-muted-foreground">User ID</dt>
          <dd className="font-mono text-[12px] text-muted-foreground">{user?.id ?? "—"}</dd>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-heading text-[14px] font-medium">Browser extension</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <p className="text-[13.5px] text-muted-foreground leading-relaxed max-w-[560px]">
            Install the dropdat Chrome extension. After install, generate an API key on the
            <span className="text-foreground"> API Keys </span> page and paste it into the extension
            popup to sign in.
          </p>
          <a
            href="#"
            className="self-start rounded-md bg-primary text-primary-foreground px-5 py-2 text-[13.5px] font-medium transition-opacity hover:opacity-90"
          >
            Add to Chrome
          </a>
        </div>
      </div>
    </section>
  );
}
