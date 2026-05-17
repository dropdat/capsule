import Link from "next/link";

type Props = {
  title?: string;
  message?: string;
  requiredTier?: string;
};

export function Paywall({
  title = "Upgrade required",
  message,
  requiredTier = "Ultimate",
}: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-8 flex flex-col items-center text-center gap-3 max-w-[520px] mx-auto">
      <div className="h-12 w-12 rounded-full bg-accent-soft border border-border flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>
      <h2 className="font-heading text-[18px] font-medium">{title}</h2>
      <p className="text-[13.5px] text-muted-foreground">
        {message ?? `This feature is part of the ${requiredTier} plan.`}
      </p>
      <Link
        href="/billing"
        className="mt-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium hover:opacity-90"
      >
        See plans
      </Link>
    </div>
  );
}
