import { CapsuleIcon, ArrowRightIcon } from "./icons";

const platforms = ["GPT", "C", "G", "Px"];

export function HeroVisual() {
  return (
    <div className="relative w-full h-full p-6 flex flex-col items-center justify-center gap-5">
      {/* source chat card */}
      <div className="relative w-full max-w-[320px] bg-card border border-border p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">chatgpt.com</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-4/5 bg-foreground/10" />
          <div className="h-2 w-3/5 bg-foreground/10" />
          <div className="h-2 w-2/3 bg-foreground/10" />
        </div>
        <div className="mt-2 inline-flex self-end items-center gap-1.5 bg-primary text-primary-foreground px-2.5 py-1 text-[11px] font-medium border border-border">
          <CapsuleIcon className="w-3 h-3" />
          Capture capsule
        </div>
      </div>

      {/* capsule pill */}
      <div className="relative bg-primary text-primary-foreground border border-border px-5 py-2.5 flex items-center gap-2 font-mono text-[12px] uppercase tracking-wider shadow-[0_8px_24px_-12px_rgba(5,98,239,0.6)]">
        <CapsuleIcon className="w-4 h-4" />
        capsule.dropdat
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </div>

      {/* destination AIs row */}
      <div className="flex items-center gap-2">
        {platforms.map((p) => (
          <div
            key={p}
            className="w-12 h-12 bg-card border border-border flex items-center justify-center font-mono text-[12px] text-primary"
          >
            {p}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">drop anywhere · resume instantly</p>
    </div>
  );
}
