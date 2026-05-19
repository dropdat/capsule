import { ArrowRightIcon } from "./icons";
import { AsciiGlyph } from "./AsciiGlyph";
import { type Dict } from "@/i18n/dictionaries";

const glyphs = [
  { w: 170, h: 80, digit: "9", top: "30px",  left: "40px"   },
  { w: 200, h: 90, digit: "x", top: "20px",  right: "40px",  flip: true },
  { w: 140, h: 70, digit: "e", top: "260px", left: "180px", flip: true },
  { w: 150, h: 75, digit: "e", top: "60px",  left: "560px"  },
  { w: 170, h: 80, digit: "3", top: "270px", left: "780px"  },
  { w: 180, h: 85, digit: "9", top: "240px", right: "140px", flip: true },
];

export function AgentSection({ dict }: { dict: Dict }) {
  const t = dict.agent;
  return (
    <section className="w-full max-w-[1200px] relative flex items-center justify-center px-5 sm:px-6 overflow-hidden" style={{ minHeight: 480 }}>
      {glyphs.map((g, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{ top: g.top, left: g.left, right: g.right }}
          aria-hidden
        >
          <AsciiGlyph width={g.w} height={g.h} digit={g.digit} flip={g.flip} speed={0.6 + i * 0.1} />
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-7 text-center py-20">
        <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] font-medium tracking-[-0.03em] leading-[1.05] max-w-[1100px]">
          {t.h2Pre} <span className="text-primary">{t.h2Brand}</span>
        </h2>
        <a
          href="#download"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-border px-6 py-3 text-[15px] font-medium hover:opacity-95 transition-opacity"
        >
          {t.cta}
          <ArrowRightIcon className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
