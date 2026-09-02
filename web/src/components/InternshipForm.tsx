"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function InternshipForm() {
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    const form = event.currentTarget;
    const body = new FormData(form);
    try {
      const response = await fetch(`${API_BASE}/api/v1/internship-applications`, {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not submit application");
      setMessage(data.message || "Application received. We will be in touch.");
      form.reset();
      setFileName("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Application notes</p>
        <h2 className="mt-3 font-heading text-[28px] font-medium tracking-[-0.025em]">
          Build with us.
        </h2>
        <p className="mt-4 max-w-[340px] text-[14px] leading-7 text-muted-foreground">
          This is a full-time, unpaid internship. You may need to pay for any AI usage
          required while working on assigned projects.
        </p>
        <div className="mt-7 border-l-2 border-primary pl-5 text-[13px] leading-6 text-muted-foreground">
          We review applications directly and use the details only for internship
          selection and communication.
        </div>
      </div>

      <div className="box-corners relative border border-border bg-card p-5 sm:p-8">
        <span className="corner-bl" />
        <span className="corner-br" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Full name" name="name" placeholder="Your name" />
          <Input label="College / university" name="college" placeholder="College name" />
          <Input label="Branch / specialization" name="branch" placeholder="e.g. CSE" />
          <Input label="CGPA" name="cgpa" placeholder="e.g. 8.4" />
        </div>

        <label className="mt-5 block text-[13px] text-muted-foreground">
          Resume <span className="text-primary">(PDF, DOC, or DOCX · max 5 MB)</span>
          <span className="mt-2 flex cursor-pointer items-center justify-between gap-3 border border-border bg-background px-3 py-3 text-[14px] text-foreground hover:border-primary">
            <span className="truncate">{fileName || "Choose a file"}</span>
            <span className="flex-none border border-border bg-card px-2.5 py-1 text-[12px] text-foreground">Browse</span>
            <input
              required
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
            />
          </span>
        </label>

        <label className="mt-6 flex items-start gap-3 text-[13px] leading-6 text-muted-foreground">
          <input required name="unpaidAcknowledged" value="true" type="checkbox" className="mt-1 accent-primary" />
          <span>
            I understand this internship is unpaid and that I may have to pay for AI usage
            while working on the project.
          </span>
        </label>

        {error && <p className="mt-5 border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">{error}</p>}
        {message && <p className="mt-5 border border-primary/30 bg-accent-soft px-3 py-2 text-[13px] text-foreground">{message}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex w-full items-center justify-center border border-border bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}

function Input({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="block text-[13px] text-muted-foreground">
      {label}
      <input
        required
        name={name}
        placeholder={placeholder}
        className="mt-2 block w-full border border-border bg-background px-3 py-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </label>
  );
}
