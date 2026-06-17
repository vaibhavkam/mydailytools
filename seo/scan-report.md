# SEO Data Analysis + Technical Scan — mydailytool.com

**Date:** 2026-06-17 · **Window:** GSC last 28d vs previous 28d; GA4 last 28d
**Inputs:** `seo/mydailytool.com-Performance-on-Search-2026-06-17.xlsx`, `seo/Pages_and_screens_Page_path_and_screen_class.csv`
**Phase-1 script:** `seo/analyze.py` (read-only; re-run with `python3 seo/analyze.py`)

> Note: the brief referenced a `seo-data/` folder. The actual files live in `seo/` (from prior work); I used those. No code was changed in this pass.

---

## A. Data summary

### Site totals (summed across the 66-row GSC Pages sheet; position = impression-weighted)

| Metric | Last 28d | Prev 28d | Δ |
|---|---|---|---|
| Clicks | 4 | 4 | +0 |
| Impressions | 1,350 | 479 | **+871 (+182%)** |
| Avg position | 37.06 | 13.36 | **+23.7 (worse)** |
| Site CTR | 0.30% | 0.84% | −0.54pp |

**Read:** impressions nearly tripled, but clicks are flat at 4 and average position got *worse*. That's the signature of a young site surfacing for many new, deep-ranked queries (pos 50–90) while almost nothing sits in the click zone. The growth is real demand discovery; the problem is **capture**, not exposure. Mobile is far worse than desktop (pos **64.2 mobile** vs **33.2 desktop**, Devices sheet) — a mobile-first-indexing / CWV smell.

### Page tiers (Winning = pos 1–7 + clicks; Promising = pos 8–20 + impr; Dormant = rest)

- **Winning — 1 page:** `/` (19 impr, pos 6.1).
- **Promising — 15 pages:** led by `/blog/iso-8601-cheat-sheet/` (**670 impr, pos 9.5**), then a long tail of 1–7-impression tool pages (`/tools/date-calculator/` 5@10.0, `/tools/json-diff/` 1@10.0, `/tools/qr-code-generator/` 1@8.0, etc.).
- **Dormant — 50 pages:** includes the two highest-demand tool pages, stuck deep: `/tools/capacitance-calculator/` (**298 impr, pos 78**) and `/tools/days-between-dates/` (**121 impr, pos 82**).

### Biggest movers

**Impression gainers (last − prev):** `/blog/iso-8601-cheat-sheet/` +298, `/tools/capacitance-calculator/` +298 (from 0), `/tools/days-between-dates/` +121 (from 0), `/tools/aspect-ratio-calculator/` +24, `/tools/ratio-calculator/` +22.

**Position losers (ranked both periods, position worsened):** `/tools/comma-lines-converter/` 10.0→141.5, `/tools/number-base-converter/` 19.1→76.7, `/tools/weight-converter/` 33.0→88.2, `/tools/black-scholes-calculator/` 7.5→60.0, `/tools/ratio-calculator/` 6.0→57.8, `/tools/timezone-converter/` 7.9→28.7. These dropped out of contention — likely fresh-content reshuffling, but worth watching if it persists.

### Demand-vs-capture gaps (query clusters with impressions but best position > 50)

| Cluster | Queries | Impr | Best pos | Target URL |
|---|---|---|---|---|
| **capacitor / capacitance** | 44 | **274** | 55.5 | `/tools/capacitance-calculator/` (page ranks ~78) |
| **days between dates** | 41 | **100** | 66.0 | `/tools/days-between-dates/` (page ranks ~82) |
| iso 8601 / 24:00 | 23 | 113 | 7.5 | `/blog/iso-8601-cheat-sheet/` (ranks, but 0 clicks) |

Top queries we're missing: `"capacitor calculator"` (26 impr @76), `"parallel capacitor calculator"` (23 @79), `"capacitor parallel calculator"` (20 @83); `"days between"` (16 @76), `"how many days between two dates"` (14 @79). **Demand exists, the pages exist, but they rank on page 5–9.** This is the core opportunity.

### GSC ↔ GA4 disconnect

- **GA4 views, ~0 GSC clicks (non-organic traffic):** `/contact` (13 views), `/tools/json-formatter` (6), `/support` (5), `/design` (5). These are reached via direct/internal navigation, not search — consistent with a site that has near-zero organic clicks yet some referral/direct activity.
- **GSC impressions, no GA4 views (seen, never visited):** `/generators` (7 impr), `/tools/cron-expression-parser` (3), **`https://www.mydailytool.com/tools/due-date-calculator/`** (3 — note the **www** host), `/tools/inductance-calculator` (2). Expected given the deep positions; the www row is a duplicate-host signal (see B-3).

---

## B. Technical findings

### B-1. `<title>` / H1 — **[template-wide] [CTR/snippet]** — healthy
Tool pages: `app/tools/[slug]/page.tsx` → `generateMetadata` → `buildMetadata` (`lib/seo.ts:20`) emits `"{tool.title} | MyDailyTool"`; H1 is `{tool.title}` (`components/ToolPage.tsx:71`). Titles/H1s are unique because `tool.title` is unique in `lib/tools.ts`. Category titles come from the `CATEGORY_SEO` map (`app/[category]/page.tsx:20`), all 16 categories covered — no generic fallback fires. Blog H1/title = `post.title` (`components/BlogPost.tsx`). **Cluster cross-check passes:** `/tools/capacitance-calculator/` title is now `"Capacitor Calculator — Series & Parallel Capacitance"` (`lib/tools.ts:396`), aligned with the head term `"capacitor calculator"`. No duplicate/generic titles found.

### B-2. Meta description — **[template-wide] [CTR/snippet]** — present everywhere
`buildMetadata` always emits `description` (`lib/seo.ts:24`). Tool descriptions are per-tool (`lib/tools.ts`), category descriptions are per-category functions of live tool count (`app/[category]/page.tsx:21+`), blog from `post.description`. No missing or templated-identical descriptions.

### B-3. Canonical + www/non-www — **[template-wide] [crawl/index]** — **the www leak is infra, not code**
Canonicals are correct and non-www: `buildMetadata` sets `canonical: ${SITE.url}${path}` with `SITE.url = https://mydailytool.com` (`lib/tools.ts:433`, `lib/seo.ts:20-27`). `public/robots.txt` and the generated `out/sitemap.xml` are **100% non-www** (219/219 URLs). No `www.mydailytool.com` self-links exist in source (the only `www.` hits are `googletagmanager.com` and the sitemap XML namespace).
**Where www leaks:** `infra/main.tf` configures the CloudFront distribution with **both** apex and www as aliases (`infra/main.tf:77`), a www Route 53 A-record (`infra/main.tf:163`), and an ACM SAN for www (`infra/main.tf:41`) — but `viewer_protocol_policy` is only `redirect-to-https` (`:92,:104`), **there is no host-based www→non-www 301**. So `www.mydailytool.com` serves a full duplicate of the site. GSC confirms it: `https://www.mydailytool.com/tools/due-date-calculator/` is indexed at pos 88.7. Non-www canonicals mitigate but don't replace a 301. ⚠️ `infra/main.tf` is flagged stale in CLAUDE.md (live infra was built via CLI + the `mydailytool-rewrite` CloudFront Function), so the redirect may belong in that function — **cannot verify the live function from the repo.**
**`mydailytools.store`:** **no reference anywhere in the codebase** (checked `lib/ app/ components/ scripts/ public/`). If it appears in GSC it's an external party scraping/mirroring content, not something to fix in-repo — candidate for a disavow / DMCA, not a code change.

### B-4. Structured data — **[template-wide] [crawl/index]** — broad coverage
- Tool pages emit `WebApplication` + `BreadcrumbList`, plus `FAQPage` when `content.faq` is present (`components/ToolPage.tsx:48-54`, helpers in `lib/seo.ts`). Note the type is **`WebApplication`**, not `SoftwareApplication` (`lib/seo.ts:toolJsonLd`) — valid, but `SoftwareApplication` is the type Google documents for app rich results; worth considering.
- Category pages emit `BreadcrumbList` + `ItemList` (`app/[category]/page.tsx:104-115`).
- Blog emits `BlogPosting` + `BreadcrumbList` (`components/BlogPost.tsx`), plus `FAQPage` on the ISO-8601 post (added this session).
- Home emits `Organization` + `WebSite` (with SearchAction) (`app/page.tsx:31`).
**No template is missing JSON-LD.** Static legal pages (`/privacy/`, `/terms/`, `/about/`, `/contact/`) carry only the default metadata — acceptable.

### B-5. Internal linking — **[template-wide] [ranking]** — good within silos, weak blog↔tool
- Tool → category hub via breadcrumb (`components/ToolPage.tsx:65`) and → up to 6 related **same-category** tools (`:38-41,:114`). ✓
- Category → each tool (`app/[category]/page.tsx`). ✓
- Blog → related tools (`components/BlogPost.tsx`); date/time tools → ISO-8601 post via the gated "Related reading" block (`components/ToolPage.tsx`, this session). ✓
- **Gap:** tool→blog linking exists **only** for the datetime category. The capacitor cluster — our #1 demand gap — has a directly relevant post (`/blog/capacitors-series-parallel/`, `lib/posts.ts`) that is **not** linked from `/tools/capacitance-calculator/`, and the tool isn't in that post's `relatedTools`. Same pattern for regex/json/llm posts vs their tools. Cross-silo blog↔tool links are the cheapest ranking lever here.
- No true orphans (every tool is reachable from its category hub and the sidebar), but deep tool pages get only category-sibling links — little topical authority flows to them.

### B-6. sitemap.xml + robots.txt — **[template-wide] [crawl/index]** — clean
`scripts/generate-sitemap.mjs` writes 219 URLs, all non-www, covering static pages, 16 categories, 190 tools, and posts. `public/robots.txt` is `Allow: /` with a non-www `Sitemap:` line. No tool page is noindexed (only `/sitemap-html/` is `index:false`, intentional, and it's excluded from the sitemap). `TOOL_LASTMOD = 2026-06-17` (`scripts/generate-sitemap.mjs:48`) is current. No blocked/duplicated tool URLs.

### B-7. CWV / privacy — **[template-wide] [CWV/privacy]**
- **Third-party scripts are non-blocking:** AdSense and GA4 both load `async` + `strategy="afterInteractive"` and are conditional (`app/layout.tsx:64-81`); GA4 sets `anonymize_ip`. No render-blocking JS in `<head>`.
- **Large first-load JS:** the last build reports `/tools/[slug]` at **779 kB route / 895 kB First Load JS** (vs 87.7 kB shared). That's heavy for every tool page and is a plausible driver of the **mobile pos 64 vs desktop 33** gap. Worth profiling whether a heavy dependency is being promoted into the shared chunk (the failure mode documented in CLAUDE.md).
- **USP nuance — outbound network calls (no upload, but third-party):** `components/tools/CurrencyConverter.tsx:54` fetches live rates from `api.frankfurter.dev` (has a static fallback in `lib/rates.json`); `components/tools/TokenCounter.tsx:138` fetches a model list from `openrouter.ai`. Neither uploads user data, so the "nothing you enter leaves your browser" claim holds — but these are third-party calls worth knowing about. (The `fetch(...)` strings in `components/tools/CurlToCode.tsx` are generated **output code**, not runtime calls — not a risk.)

---

## C. Top 5 fixes, ranked by ICE

ICE = Impact / Confidence / Ease, each 1–10 (higher = better); Score = mean.

### 1. Recover the ISO-8601 post's wasted page-1 traffic — Score **7.7** (I8 / C6 / E9)
**[single-page] [CTR/snippet]** · `lib/posts.ts` (title/description for `iso-8601-cheat-sheet`)
670 impressions at pos 9.5 with **0 clicks** (the single biggest impression source on the site). Rewrite the `<title>`/description to directly answer the high-impression queries it already surfaces for — `"is 24:00 a valid time"`, `"18:00"`, `"24:00 meaning"` — and push for the top of page 1. Even a 2% CTR ≈ 13 clicks/mo vs 0 today. The FAQ/JSON-LD added this session should help; pair it with a snippet rewrite. *Caveat:* some of these are zero-click informational queries, hence Confidence 6.

### 2. Lift the capacitor calculator off page 8 — Score **7.0** (I8 / C6 / E7)
**[single-page] [ranking]** · `/tools/capacitance-calculator/`, `lib/posts.ts`, `components/tools/electrical.tsx`
274 cluster impressions, page stuck at pos ~78. Title is already optimized (B-1); the lever now is **authority + relevance**: bidirectionally link `/tools/capacitance-calculator/` ↔ `/blog/capacitors-series-parallel/` (add the tool to that post's `relatedTools` and add a contextual in-tool link), and deepen on-page content for "series vs parallel capacitor calculator". Highest commercial-intent gap on the site.

### 3. Add a www→non-www 301 to kill the duplicate host — Score **6.3** (I6 / C8 / E5)
**[template-wide] [crawl/index]** · CloudFront Function `mydailytool-rewrite` (live infra; `infra/main.tf` is stale)
`www.mydailytool.com` serves a full duplicate (confirmed: www `due-date-calculator` indexed at pos 88.7). Canonicals mitigate but a host 301 is the durable fix and consolidates all signals to the apex. Ease is 5 because it's an infra change that can't be validated from the repo and `main.tf` doesn't reflect live config.

### 4. Strengthen days-between-dates ranking — Score **6.3** (I6 / C6 / E7)
**[single-page] [ranking]** · `/tools/days-between-dates/`, `components/tools/` date tool
100 cluster impressions, page at pos ~82, for high-intent queries (`"how many days between two dates"`). The ISO-8601 inbound link added this session is a start; add more topical internal links (from `date-calculator`, the datetime hub copy) and expand on-page content/FAQ around "how many days between two dates / business days".

### 5. Trim `/tools/[slug]` first-load JS for mobile CWV — Score **5.0** (I6 / C5 / E4)
**[template-wide] [CWV/privacy]** · `components/tools/registry.ts`, tool component imports
895 kB First Load JS per tool page likely hurts mobile, where rankings (pos 64) badly trail desktop (pos 33). Profile the shared chunk for a heavy dependency promoted out of a `dynamic()` import (the documented CLAUDE.md failure mode) and lazy-load it. Lower confidence/ease because the ranking link is correlational and the fix needs bundle investigation first.

---

*Generated by analysis only — no code changed. Re-run data with `python3 seo/analyze.py`.*
