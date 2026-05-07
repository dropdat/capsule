export function FlowingLines() {
  return (
    <div
      id="flowing-lines"
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* 1200px column guides — vertical edges */}
      <div className="w-full h-full max-w-[1200px] mx-auto flex justify-between overflow-hidden border-x border-border/40">
        <div className="w-[2px] h-full flex flex-col items-center overflow-hidden">
          <div className="w-[2px] flowing-line" />
        </div>
        <div className="w-[2px] h-full flex flex-col items-center overflow-hidden">
          <div className="w-[2px] flowing-line" style={{ animationDelay: "-3.5s" }} />
        </div>
      </div>
    </div>
  );
}
