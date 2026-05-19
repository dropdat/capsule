#!/usr/bin/env node
/**
 * IndexNow deploy ping. Fetches the production sitemap, extracts every URL,
 * and submits the batch to Bing/Yandex/Naver/Seznam via IndexNow.
 *
 * Usage:
 *   node scripts/indexnow.mjs
 *   node scripts/indexnow.mjs https://staging.dropdat.app
 *   INDEXNOW_KEY=... node scripts/indexnow.mjs
 *
 * Run after every production deploy. Safe to re-run (IndexNow is idempotent).
 */

const HOST = "dropdat.app";
const KEY = process.env.INDEXNOW_KEY ?? "e026c0a89ecbf87724b568c0027a209f";
const SITE = process.argv[2] ?? `https://${HOST}`;
const ENDPOINTS = [
  "https://api.indexnow.org/IndexNow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
  "https://searchadvisor.naver.com/indexnow",
];

function extractUrls(xml) {
  const urls = new Set();
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const u = m[1].trim();
    if (u.startsWith(`https://${HOST}`)) urls.add(u);
  }
  return [...urls];
}

async function main() {
  const sitemapUrl = `${SITE}/sitemap.xml`;
  console.log(`fetching ${sitemapUrl}`);
  const res = await fetch(sitemapUrl);
  if (!res.ok) {
    console.error(`sitemap fetch failed: ${res.status}`);
    process.exit(1);
  }
  const xml = await res.text();
  const urls = extractUrls(xml);
  console.log(`found ${urls.length} URLs`);
  if (urls.length === 0) {
    console.error("no URLs extracted — aborting");
    process.exit(1);
  }
  if (urls.length > 10000) {
    console.error(`IndexNow limit is 10,000 URLs/batch; got ${urls.length}`);
    process.exit(1);
  }

  // Verify key file is reachable before we ask indexers to look for it.
  const keyUrl = `https://${HOST}/${KEY}.txt`;
  const keyRes = await fetch(keyUrl);
  if (!keyRes.ok) {
    console.error(`key file not reachable at ${keyUrl} (status ${keyRes.status}) — IndexNow will reject the batch. Deploy the public/<key>.txt file first.`);
    process.exit(1);
  }

  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: keyUrl,
    urlList: urls,
  });

  let failed = 0;
  for (const endpoint of ENDPOINTS) {
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body,
      });
      const txt = await r.text().catch(() => "");
      const status = r.status;
      const ok = r.ok;
      console.log(`${ok ? "✓" : "✗"} ${endpoint} → ${status} ${txt.slice(0, 120)}`);
      if (!ok) failed += 1;
    } catch (e) {
      console.error(`✗ ${endpoint} → ${e?.message ?? e}`);
      failed += 1;
    }
  }
  process.exit(failed === ENDPOINTS.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
