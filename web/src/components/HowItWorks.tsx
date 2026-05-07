import { CapsuleIcon, ArrowRightIcon, BoltIcon } from "./icons";

const steps = [
  {
    num: "01",
    title: "Click the capsule",
    body: "A capsule icon appears in every supported AI chat. One click captures the full conversation — messages, code blocks, attachments.",
  },
  {
    num: "02",
    title: "Save as a capsule",
    body: "dropdat compresses the chat into a portable capsule and stores it in your local library. Tag it, summarise it, search it later.",
  },
  {
    num: "03",
    title: "Drop into any AI",
    body: "Open ChatGPT, Claude, Gemini, Perplexity — drop the capsule and resume the conversation right where it left off.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full max-w-[1200px] px-5 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 text-primary text-[13px] font-medium uppercase tracking-[0.18em]">
          <BoltIcon className="w-3.5 h-3.5" />
          How it works
        </span>
        <h2 className="mt-4 font-heading text-[40px] max-md:text-[28px] font-medium tracking-[-0.04em] leading-[120%] text-foreground max-w-[760px] mx-auto">
          Capture once. Drop anywhere. Resume instantly.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
        {steps.map((s, i) => (
          <div key={s.num} className="bg-card p-8 flex flex-col gap-5 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] text-primary">{s.num}</span>
              <CapsuleIcon className="w-5 h-5 text-foreground/40" />
            </div>
            <h3 className="font-heading text-[22px] font-medium leading-tight">{s.title}</h3>
            <p className="text-[15px] leading-[1.6] text-muted-foreground">{s.body}</p>
            {i < steps.length - 1 && (
              <ArrowRightIcon className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-border bg-background z-10" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
