import type { ImageRef } from "../types";

/** Pulls every <img> inside `root` whose src looks like a real chat image
 *  (skips emoji sprites, blank pixels, tiny icons). Returns unique URLs. */
export function collectImages(root: HTMLElement): ImageRef[] {
  const out: ImageRef[] = [];
  const seen = new Set<string>();
  const imgs = root.querySelectorAll<HTMLImageElement>("img");
  imgs.forEach((img) => {
    let url = img.currentSrc || img.src;
    if (!url) return;
    // Skip inline data: URIs of tiny things (alpha pixels, spinners).
    if (url.startsWith("data:") && url.length < 500) return;
    // Skip provider chrome (avatars often have tiny natural dimensions).
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (w > 0 && h > 0 && (w < 48 || h < 48)) return;
    // Normalise srcset → currentSrc already does this, but trim hash/fragment.
    try {
      const u = new URL(url, location.href);
      url = u.toString();
    } catch {
      // leave as-is if it's not a parseable URL
    }
    if (seen.has(url)) return;
    seen.add(url);
    out.push({ url, alt: img.alt || undefined });
  });
  return out;
}
