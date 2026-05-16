import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import {
  ArrowRightIcon,
  CheckIcon,
  BoltIcon,
} from "@/components/icons";
import {
  Breadcrumbs,
  InternalLinksGrid,
} from "@/components/seo/InternalLinks";
import {
  ArticleSchema,
  BreadcrumbSchema,
  SoftwareSchema,
} from "@/components/seo/Schema";
import {
  getAllProgrammaticItems,
  getAllProgrammaticSlugs,
  getProgrammaticItemBySlug,
} from "@/lib/seo/programmaticData";
import {
  getBreadcrumbs,
  getRelatedLinks,
} from "@/lib/seo/internalLinks";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllProgrammaticSlugs().map((s) => ({ slug: s.split("/") }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getProgrammaticItemBySlug(slug.join("/"));
  if (!item) {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }
  const url = `https://dropdat.app/seo/${item.slug}`;
  return {
    title: item.title,
    description: item.description,
    keywords: item.keywords,
    alternates: { canonical: `/seo/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.description,
      url,
      type: "article",
      siteName: "dropdat",
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ProgrammaticSEOPage({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug.join("/");
  const item = getProgrammaticItemBySlug(slugStr);
  if (!item) notFound();

  const url = `https://dropdat.app/seo/${item.slug}`;
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "SEO", href: "/seo" },
    ...getBreadcrumbs(`/${item.slug}`).slice(1),
  ];
  const breadcrumbSchemaItems = breadcrumbItems.map((b) => ({
    name: b.name,
    url: b.href.startsWith("http") ? b.href : `https://dropdat.app${b.href}`,
  }));
  const related = getRelatedLinks(item.slug, 9).map((l) => ({
    ...l,
    // Author-related slugs may point at native /mcp/* or /use-cases/* routes.
    // Keep those as-is; otherwise map to /seo/<slug>.
    href:
      l.href.startsWith("/mcp") || l.href.startsWith("/use-cases")
        ? l.href
        : l.href,
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <ArticleSchema
        title={item.title}
        description={item.description}
        url={url}
        datePublished={item.updatedAt}
      />
      {(item.category === "client" || item.category === "alternative") && (
        <SoftwareSchema
          name={item.h1}
          url={url}
          description={item.description}
        />
      )}

      <Nav />
      <main className="relative z-[2] flex flex-col items-center w-full">
        {/* Hero */}
        <section className="w-full max-w-[1000px] px-5 sm:px-6 pt-28 sm:pt-36 pb-10">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="font-heading text-[44px] max-md:text-[32px] font-medium tracking-[-0.04em] leading-[105%]">
            {item.h1}
          </h1>
          <p className="mt-5 text-[17px] max-md:text-[15px] text-muted-foreground leading-[1.55] max-w-[760px]">
            {item.intro}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-7">
            <a
              href="https://capsule.dropdat.app/sign-up"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-border px-5 py-2.5 text-[15px] font-medium"
            >
              Get started free
              <ArrowRightIcon className="w-4 h-4" />
            </a>
            <Link
              href="/mcp"
              className="inline-flex items-center gap-2 bg-card text-foreground border border-border px-5 py-2.5 text-[15px] font-medium hover:bg-accent transition-colors"
            >
              MCP server →
            </Link>
          </div>
        </section>

        {/* Bullets */}
        <section className="w-full max-w-[1000px] px-5 sm:px-6 py-10">
          <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
            {item.bullets.map((b) => (
              <div key={b} className="bg-card p-5 flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-[15px] text-foreground/90 leading-[1.55]">
                  {b}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Install hint (only for client / guide / solution categories) */}
        {(item.category === "client" ||
          item.category === "guide" ||
          item.category === "solution") && (
          <section className="w-full max-w-[1000px] px-5 sm:px-6 py-10">
            <h2 className="font-heading text-[24px] font-medium mb-4 flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-primary" /> Install
            </h2>
            <pre className="font-mono text-[13px] leading-[1.6] bg-background border border-border p-4 overflow-x-auto">
              {`# zero-install — runs the latest version on demand
npx -y @dropdat/mcp

# or pin a global install
npm install -g @dropdat/mcp`}
            </pre>
            <p className="mt-3 text-[14px] text-muted-foreground">
              Issue an API key at{" "}
              <a
                href="https://capsule.dropdat.app/api-keys"
                className="underline text-foreground"
              >
                capsule.dropdat.app/api-keys
              </a>{" "}
              and pass it as <code className="font-mono">DROPDAT_API_KEY</code>.
              See the{" "}
              <Link
                href="/mcp"
                className="underline text-foreground"
              >
                MCP hub
              </Link>{" "}
              for per-client config.
            </p>
          </section>
        )}

        {/* Related */}
        <section className="w-full max-w-[1000px] px-5 sm:px-6 py-10">
          <InternalLinksGrid title="Related" links={related} />
        </section>

        {/* CTA */}
        <section className="w-full max-w-[1000px] px-5 sm:px-6 pb-20 sm:pb-24">
          <div className="bg-primary-deep relative overflow-hidden border border-border p-10 md:p-14 text-center">
            <div className="relative z-10 flex flex-col items-center gap-5">
              <h2 className="font-heading text-[28px] max-md:text-[22px] font-medium tracking-[-0.04em] leading-[110%] text-white max-w-[720px]">
                {item.h1.replace(/—.*$/, "").trim()} — try dropdat free.
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="https://capsule.dropdat.app/sign-up"
                  className="inline-flex items-center gap-2 bg-white text-foreground border border-white/20 px-5 py-2.5 text-[15px] font-medium hover:opacity-95 transition-opacity"
                >
                  Create an account
                </a>
                <Link
                  href="/mcp"
                  className="inline-flex items-center gap-2 bg-transparent text-white border border-white/40 px-5 py-2.5 text-[15px] font-medium hover:bg-white/10 transition-colors"
                >
                  Browse MCP guides
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Surface the total page count at build time (helpful for sitemap sanity)
export const dynamicParams = false;

// Disable runtime fetch caching for static export consistency
export const revalidate = false;

void getAllProgrammaticItems;
