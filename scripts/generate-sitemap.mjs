// Generates /out/sitemap.xml after `next build` (output: "export").
// Reads the tool registry directly from the compiled .ts source.
//
// To run manually: node scripts/generate-sitemap.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Lightweight parse: extract slugs from lib/tools.ts. Avoids needing a TS runtime.
function readSlugs() {
  const src = readFileSync(resolve(root, "lib/tools.ts"), "utf8");
  // Slice off the SLUG_REDIRECTS block — those are old-slug → canonical pairs we
  // don't want in the sitemap (they emit redirect pages, not real content).
  const cutoff = src.indexOf("SLUG_REDIRECTS");
  const head = cutoff > 0 ? src.slice(0, cutoff) : src;
  const toolSlugs = [...head.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
  // Category slugs are the slugs at the top of each Category object.
  // Extract by scanning for the pattern of `{ slug: "x", name: "..."`
  // followed by `tools:` (not `description:`).
  const catSlugs = [...head.matchAll(/{\s*slug:\s*"([a-z0-9-]+)",\s*name:[^}]*tools:/gs)].map((m) => m[1]);
  return { toolSlugs: [...new Set(toolSlugs.filter((s) => !catSlugs.includes(s)))], catSlugs };
}

const { toolSlugs, catSlugs } = readSlugs();

const SITE = "https://mydailytools.com";
const today = new Date().toISOString().slice(0, 10);

const staticPaths = ["/", "/tools/", "/about/", "/contact/", "/support/", "/sitemap-html/", "/privacy/", "/terms/"];
const urls = [
  ...staticPaths.map((p) => ({ loc: SITE + p, priority: p === "/" ? 1.0 : 0.7 })),
  ...catSlugs.map((s) => ({ loc: `${SITE}/${s}/`, priority: 0.8 })),
  ...toolSlugs.map((s) => ({ loc: `${SITE}/tools/${s}/`, priority: 0.6 })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const outDir = resolve(root, "out");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "sitemap.xml"), xml);
console.log(`Wrote ${urls.length} URLs to out/sitemap.xml`);
