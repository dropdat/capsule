import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { POSTS, getPost, type Post, type PostSection } from "@/lib/blog/posts";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://dropdat.app/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    keywords: post.keywords.join(", "),
    mainEntityOfPage: `https://dropdat.app/blog/${post.slug}`,
    author: { "@type": "Organization", name: "dropdat" },
    publisher: {
      "@type": "Organization",
      name: "dropdat",
      url: "https://dropdat.app",
    },
  };

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />

        <Link href="/blog" className="text-[12px] text-muted-foreground hover:text-foreground">
          ← Blog
        </Link>

        <header className="flex flex-col gap-3 pt-4 pb-8 border-b border-border mb-8">
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h1 className="font-heading text-[32px] sm:text-[40px] font-medium tracking-[-0.02em] leading-[1.15]">
            {post.title}
          </h1>
          <p className="text-[16px] text-muted-foreground">{post.description}</p>
        </header>

        <article className="prose-block flex flex-col gap-5 text-[15.5px] leading-[1.75]">
          {post.body.map((s, i) => (
            <Section key={i} section={s} />
          ))}
        </article>

        {post.related.length > 0 && (
          <aside className="mt-12 pt-6 border-t border-border">
            <h2 className="font-heading text-[14px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Related
            </h2>
            <ul className="flex flex-col gap-2">
              {post.related.map((r) => {
                const isPost = !r.startsWith("/");
                const href = isPost ? `/blog/${r}` : r;
                const label = isPost ? getPost(r)?.title ?? r : r;
                return (
                  <li key={r}>
                    <Link
                      href={href}
                      className="text-[14.5px] hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
      </main>
      <Footer />
    </>
  );
}

function Section({ section }: { section: PostSection }) {
  switch (section.kind) {
    case "p":
      return <p>{section.text}</p>;
    case "h2":
      return (
        <h2 className="font-heading text-[22px] sm:text-[26px] font-medium tracking-[-0.01em] mt-4">
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-heading text-[17px] sm:text-[19px] font-medium tracking-[-0.01em] mt-3">
          {section.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          {section.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-5 flex flex-col gap-1.5">
          {section.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground">
          {section.text}
        </blockquote>
      );
    case "code":
      return (
        <pre className="bg-card border border-border p-4 overflow-x-auto text-[13px] leading-relaxed">
          <code>{section.code}</code>
        </pre>
      );
    case "cta":
      return (
        <p>
          <Link
            href={section.href}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2 text-[14px] font-medium hover:opacity-90 no-underline"
          >
            {section.label} →
          </Link>
        </p>
      );
  }
}

export const dynamicParams = false;
