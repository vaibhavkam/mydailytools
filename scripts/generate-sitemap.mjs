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

function readPosts() {
  // Extract slug + date pairs from lib/posts.ts so each post gets its actual
  // publication date as lastmod rather than the build date.
  const src = readFileSync(resolve(root, "lib/posts.ts"), "utf8");
  const slugs = [...src.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
  const dates = [...src.matchAll(/date:\s*"(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]);
  return slugs.map((slug, i) => ({ slug, date: dates[i] ?? today }));
}

const { toolSlugs, catSlugs } = readSlugs();
const posts = readPosts();

const SITE = "https://mydailytool.com";
const today = new Date().toISOString().slice(0, 10);

// Static pages use the build date as lastmod because they change with every deploy.
// Category pages are also build-time artifacts — their content changes when tools are
// added, so build date is appropriate.
// Tool pages share a frozen lastmod that you bump on content changes (FAQs, descriptions,
// examples) but not on code-only changes. See ADR-011.
const TOOL_LASTMOD = "2026-06-17";

// sitemap-html is noindex — intentionally excluded from the sitemap.
const staticPaths = ["/", "/tools/", "/blog/", "/about/", "/contact/", "/support/", "/privacy/", "/terms/"];
const urls = [
  ...staticPaths.map((p) => ({ loc: SITE + p, lastmod: today, priority: p === "/" ? 1.0 : 0.7 })),
  ...catSlugs.map((s) => ({ loc: `${SITE}/${s}/`, lastmod: today, priority: 0.8 })),
  ...toolSlugs.map((s) => ({ loc: `${SITE}/tools/${s}/`, lastmod: TOOL_LASTMOD, priority: 0.6 })),
  ...posts.map(({ slug, date }) => ({ loc: `${SITE}/blog/${slug}/`, lastmod: date, priority: 0.8 })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
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
