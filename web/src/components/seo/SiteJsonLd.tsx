/**
 * Site-wide JSON-LD. Rendered once in the root layout so every page exposes
 * Organization, WebSite (with sitelinks SearchAction), and SoftwareApplication
 * to crawlers. No client JS.
 */

const SITE = "https://dropdat.app";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "dropdat",
  url: SITE,
  logo: {
    "@type": "ImageObject",
    url: `${SITE}/brand/logo.svg`,
    width: 512,
    height: 512,
  },
  description:
    "dropdat builds portable cross-AI memory. Capture any ChatGPT, Claude, or Gemini chat as a capsule and drop it into any other AI or coding agent.",
  sameAs: [
    "https://github.com/dropdat",
    "https://www.npmjs.com/package/@dropdat/mcp",
    "https://x.com/dropdat",
  ],
  areaServed: [
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "Canada" },
    { "@type": "Country", name: "United Kingdom" },
    { "@type": "Country", name: "Ireland" },
    { "@type": "Country", name: "Germany" },
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Spain" },
    { "@type": "Country", name: "Italy" },
    { "@type": "Country", name: "Netherlands" },
    { "@type": "Country", name: "Japan" },
    { "@type": "Country", name: "Australia" },
  ],
  knowsLanguage: ["en", "ja", "de", "fr", "es", "it", "nl"],
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: "dropdat",
  description: "Cross-AI memory in one click.",
  publisher: { "@id": `${SITE}/#organization` },
  inLanguage: ["en-US", "en-CA", "en-GB", "ja-JP", "de-DE", "fr-FR", "es-ES", "it-IT", "nl-NL"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE}/library?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const software = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE}/#software`,
  name: "dropdat",
  url: SITE,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Windows, Linux, iOS, Android, Web",
  description:
    "Capture any AI chat as a portable capsule. Drop it into ChatGPT, Claude, Gemini, Claude Code, Cursor, or Cline and resume instantly.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", category: "Free" },
    { "@type": "Offer", name: "Pro (monthly)", price: "5", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro (annual)", price: "30", priceCurrency: "USD" },
  ],
  publisher: { "@id": `${SITE}/#organization` },
};

export function SiteJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [organization, website, software],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
