export function BlueBand() {
  return (
    <section className="w-full bg-primary-deep relative overflow-hidden flex items-center justify-center py-20">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.12), transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[1100px] px-6 text-center">
        <h2 className="font-heading text-[40px] max-md:text-[26px] font-medium tracking-[-0.03em] leading-[120%] text-white">
          One click. Any AI. Same memory.
        </h2>
        <p className="mt-3 text-white/80 text-[16px] max-w-[720px] mx-auto">
          Stop pasting context between tools. Capture once, drop anywhere.
        </p>
      </div>
    </section>
  );
}
