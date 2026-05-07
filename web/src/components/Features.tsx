import { CapsuleIcon, ChromeIcon, LibraryIcon, BoltIcon, LayersIcon, CheckIcon } from "./icons";

const features = [
  {
    icon: CapsuleIcon,
    title: "Cross-AI memory",
    body: "One capsule format works across every major chat AI. No vendor lock-in, no copy-paste tax.",
  },
  {
    icon: ChromeIcon,
    title: "Browser extension",
    body: "Lightweight Chrome extension injects a capsule button right inside chatgpt.com, claude.ai and more.",
  },
  {
    icon: LibraryIcon,
    title: "Capsule library",
    body: "All your captured chats in one searchable library. Tag, summarise, organise — never lose a thread again.",
  },
  {
    icon: BoltIcon,
    title: "Instant resume",
    body: "Drop a capsule into a fresh chat and continue exactly where you left off. Context, code, references — all there.",
  },
  {
    icon: LayersIcon,
    title: "Local-first",
    body: "Capsules live in your browser by default. Sync across devices only if you want — encrypted end to end.",
  },
  {
    icon: CheckIcon,
    title: "Open format",
    body: "Capsules are plain JSON. Export, version-control, share with a teammate — your data, your rules.",
  },
];

export function Features() {
  return (
    <section id="features" className="w-full max-w-[1200px] px-6 py-24">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 text-primary text-[13px] font-medium uppercase tracking-[0.18em]">
          <LayersIcon className="w-3.5 h-3.5" />
          Features
        </span>
        <h2 className="mt-4 font-heading text-[40px] max-md:text-[28px] font-medium tracking-[-0.04em] leading-[120%] text-foreground max-w-[820px] mx-auto">
          Built for the way you actually use AI.
        </h2>
        <p className="mt-4 text-[16px] text-muted-foreground max-w-[640px] mx-auto">
          Every feature exists to remove one friction point in cross-AI workflows.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
        {features.map((f) => (
          <div key={f.title} className="bg-card p-8 flex flex-col gap-4 hover:bg-accent-soft/40 transition-colors">
            <div className="w-10 h-10 bg-accent-soft border border-border flex items-center justify-center text-primary">
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-[20px] font-medium">{f.title}</h3>
            <p className="text-[15px] leading-[1.55] text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
