import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "dropdat",
    short_name: "dropdat",
    description: "Capture any AI chat as a portable capsule. Drop it anywhere.",
    start_url: "/library",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0562ef",
    icons: [
      { src: "/seo/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    // Android-installed PWA shows dropdat in the system share-sheet. Shared
    // payloads land at /share as query params, where the user reviews + saves.
    share_target: {
      action: "/share",
      method: "GET",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  } satisfies MetadataRoute.Manifest;
}
