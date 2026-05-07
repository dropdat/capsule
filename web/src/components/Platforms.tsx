import {
  ChatGPTMark,
  ClaudeMark,
  GeminiMark,
  PerplexityMark,
  CopilotMark,
  GrokMark,
  MistralMark,
  DeepSeekMark,
} from "./brands";

const platforms = [
  { name: "ChatGPT", Icon: ChatGPTMark, tint: "#10a37f" },
  { name: "Claude", Icon: ClaudeMark, tint: "#d97757" },
  { name: "Gemini", Icon: GeminiMark, tint: "#4285f4" },
  { name: "Perplexity", Icon: PerplexityMark, tint: "#20808d" },
  { name: "Copilot", Icon: CopilotMark, tint: "#0078d4" },
  { name: "Grok", Icon: GrokMark, tint: "#0b1015" },
  { name: "Mistral", Icon: MistralMark, tint: "#fa520f" },
  { name: "DeepSeek", Icon: DeepSeekMark, tint: "#4d6bfe" },
];

export function Platforms() {
  return (
    <section id="platforms" className="w-full max-w-[1200px] px-6 py-24">
      <div className="text-center mb-12">
        <span className="text-primary text-[13px] font-medium uppercase tracking-[0.18em]">
          Supported AIs
        </span>
        <h2 className="mt-4 font-heading text-[36px] max-md:text-[26px] font-medium tracking-[-0.04em] leading-[120%] max-w-[760px] mx-auto">
          Works everywhere your conversations live.
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-border border border-border">
        {platforms.map(({ name, Icon, tint }) => (
          <div
            key={name}
            className="bg-card aspect-[5/3] flex flex-col items-center justify-center gap-2.5 group hover:bg-accent-soft/40 transition-colors"
          >
            <div
              className="w-11 h-11 border border-border bg-accent-soft/60 flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ color: tint }}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[13px] text-foreground/80">{name}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        More platforms added every month — request one on{" "}
        <a href="https://github.com" className="text-primary underline-offset-4 hover:underline">
          GitHub
        </a>
        .
      </p>
    </section>
  );
}
