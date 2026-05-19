import { CapsuleIcon, ChromeIcon, LibraryIcon, BoltIcon, LayersIcon, CheckIcon } from "./icons";
import { type Dict } from "@/i18n/dictionaries";

export function Features({ dict }: { dict: Dict }) {
  const t = dict.features;
  const features = [
    { icon: CapsuleIcon, title: t.f1Title, body: t.f1Body },
    { icon: ChromeIcon, title: t.f2Title, body: t.f2Body },
    { icon: LibraryIcon, title: t.f3Title, body: t.f3Body },
    { icon: BoltIcon, title: t.f4Title, body: t.f4Body },
    { icon: LayersIcon, title: t.f5Title, body: t.f5Body },
    { icon: CheckIcon, title: t.f6Title, body: t.f6Body },
  ];
  return (
    <section id="features" className="w-full max-w-[1200px] px-5 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 text-primary text-[13px] font-medium uppercase tracking-[0.18em]">
          <LayersIcon className="w-3.5 h-3.5" />
          {t.eyebrow}
        </span>
        <h2 className="mt-4 font-heading text-[40px] max-md:text-[28px] font-medium tracking-[-0.04em] leading-[120%] text-foreground max-w-[820px] mx-auto">
          {t.h2}
        </h2>
        <p className="mt-4 text-[16px] text-muted-foreground max-w-[640px] mx-auto">
          {t.sub}
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
