import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getHubByCategory } from "@/lib/seo/internalLinks";

export const metadata: Metadata = {
  title: "Browse every dropdat guide — MCP clients, AI providers, alternatives",
  description:
    "Directory of dropdat guides: MCP server install pages for every client, AI memory comparisons, alternatives, integrations, and per-language solutions.",
  alternates: { canonical: "/seo" },
  keywords: [
    "dropdat directory",
    "AI memory guides",
    "MCP server guides",
    "ChatGPT memory alternatives",
    "Claude memory directory",
  ],
};

export default function HubIndex() {
  const hub = getHubByCategory();

  const sections: Array<{ title: string; items: typeof hub.clients }> = [
    { title: "MCP client guides", items: hub.clients },
    { title: "AI provider memory pages", items: hub.providers },
    { title: "Use-cases", items: hub.useCases },
    { title: "Alternatives", items: hub.alternatives },
    { title: "Integrations", items: hub.integrations },
    { title: "Side-by-side comparisons", items: hub.compare },
    { title: "Per-language solutions", items: hub.solutions },
    { title: "Step-by-step guides", items: hub.guides },
  ];

  return (
    <>
      <Nav />
      <main className="relative z-[2] flex flex-col items-center w-full">
        <section className="w-full max-w-[1100px] px-5 sm:px-6 pt-28 sm:pt-36 pb-10">
          <h1 className="font-heading text-[44px] max-md:text-[32px] font-medium tracking-[-0.04em] leading-[105%]">
            Every dropdat guide, in one directory
          </h1>
          <p className="mt-5 text-[17px] text-muted-foreground max-w-[760px] leading-[1.55]">
            Pick your AI client, your AI provider, your use-case, or the tool
            you&rsquo;re comparing against. Each page covers install, config,
            and usage in detail.
          </p>
        </section>

        {sections.map((sec) => (
          <section key={sec.title} className="w-full max-w-[1100px] px-5 sm:px-6 py-8">
            <h2 className="font-heading text-[22px] font-medium mb-4">
              {sec.title}{" "}
              <span className="text-muted-foreground text-[14px] font-normal">
                ({sec.items.length})
              </span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sec.items.map((it) => (
                <Link
                  key={it.slug}
                  href={`/seo/${it.slug}`}
                  className="block border border-border bg-card p-4 hover:bg-accent transition-colors"
                >
                  <span className="block font-heading text-[15px] font-medium">
                    {it.h1}
                  </span>
                  <span className="block text-[13px] text-muted-foreground mt-1 line-clamp-2">
                    {it.description}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
