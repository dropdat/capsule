import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/sign-in", "/sign-up", "/library", "/api-keys", "/capsule", "/links", "/settings"] },
    ],
    sitemap: "https://dropdat.app/sitemap.xml",
    host: "https://dropdat.app",
  };
}
