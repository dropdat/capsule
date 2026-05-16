/**
 * Server-rendered JSON-LD schema components.
 * All emit a <script type="application/ld+json"> tag — no client JS.
 */

interface BreadcrumbProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ArticleProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
}

export function ArticleSchema(props: ArticleProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.title,
    description: props.description,
    url: props.url,
    image: props.image ?? "https://dropdat.app/seo/og.png",
    datePublished: props.datePublished,
    dateModified: props.dateModified ?? props.datePublished,
    author: { "@type": "Organization", name: "dropdat", url: "https://dropdat.app" },
    publisher: {
      "@type": "Organization",
      name: "dropdat",
      logo: { "@type": "ImageObject", url: "https://dropdat.app/brand/logo.svg" },
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface SoftwareProps {
  name: string;
  url: string;
  description: string;
  category?: string;
}

export function SoftwareSchema({ name, url, description, category }: SoftwareProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    operatingSystem: "macOS, Windows, Linux",
    applicationCategory: category ?? "DeveloperApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url,
    description,
    sameAs: [
      "https://github.com/dropdat/mcp",
      "https://www.npmjs.com/package/@dropdat/mcp",
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface FaqProps {
  faqs: { q: string; a: string }[];
}

export function FAQSchema({ faqs }: FaqProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
