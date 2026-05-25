# SEO Audit — MyDailyTool (mydailytool.com)
**Audited:** 2026-05-25  
**Pages audited:** 198 (1 home + 8 static + 15 category + 4 blog + 168 tool + 2 utility)  
**Tool:** manual analysis of `lib/tools.ts`, `lib/seo.ts`, `lib/posts.ts`, all `app/**/page.tsx`, all `app/blog/**/page.mdx`, and the generated sitemap

---

## Summary Dashboard

| Metric | Count |
|---|---|
| Total pages audited | 198 |
| Pages with title too short (<50 chars rendered) | 190 (all tool pages + 7 static) |
| Pages with title too long (>60 chars rendered) | 4 (all blog posts) |
| Pages with meta description too short (<120 chars) | 158 tool pages + 8 static/cat |
| Pages with meta description too long (>160 chars) | 4 (json-diff, token-counter, llm-schema-validator, curl-to-code) + 3 blog posts |
| Pages missing H1 | 0 — every page has exactly one H1 |
| Pages with multiple H1s | 0 |
| Skipped heading levels (H1→H3 without H2) | 0 (ToolPage always inserts H2 sections before related H2) |
| Images missing alt text | 0 confirmed (no raw `<img>` tags found; Lucide SVG icons need no alt) |
| Duplicate titles | 0 exact duplicates |
| Duplicate meta descriptions | 0 exact duplicates |
| Pages with canonical tag | 198 (set by `buildMetadata` in `lib/seo.ts:19`) |
| Pages with JSON-LD structured data | All tool pages (WebApplication + Breadcrumb + optional FAQ), home (Organization + WebSite), category pages (BreadcrumbList + ItemList), blog posts |
| Sitemap coverage | 254 URLs in `out/sitemap.xml`; redirect slugs correctly excluded |
| robots.txt | Present at `/public/robots.txt`; correct `Allow: /` + Sitemap pointer |
| hreflang | `en` + `x-default` on every page via `buildMetadata` |
| Open Graph / Twitter card | Present on every page via `buildMetadata` |

---

## Architecture Notes (affects all pages)

**SEO metadata is centralized in `lib/seo.ts:buildMetadata()`.** All pages call this function; fixes here propagate everywhere.

**Title format:**
- Home: `MyDailyTool — Free online tools for everyday tasks` (50 chars ✅)
- All other pages: `{short title} | MyDailyTool`

**Root problem with titles:** The `{short title} | MyDailyTool` format produces 50-char minimum only if the short title is at least 37 characters. Nearly every tool and static page falls short. The fix is to use descriptive keyword-rich titles for each page (or adjust the title template).

**Sitemap lastmod:** Tool pages share a single `TOOL_LASTMOD` constant in `scripts/generate-sitemap.mjs:48`. This is correct per ADR-011 but means any content edit requires manually bumping that date.

**No per-tool OG images:** All pages share `/og.png`. Low priority per CLAUDE.md, noted here for completeness.

---

## Per-Page Results

### Static / Layout Pages

---

#### `/` — Home
- **Rendered title:** `MyDailyTool — Free online tools for everyday tasks` (50 chars)
- **Meta description:** 156 chars — `Free, fast, privacy-friendly online tools: calculators, unit converters, developer utilities, text tools, and more. No login, runs entirely in your browser.`
- **H1:** "Every tool you need for the daily web" ✅ (one H1)
- **H2s:** "Popular tools", "Browse by category" ✅
- **Canonical:** `https://mydailytool.com/` ✅
- **JSON-LD:** Organization + WebSite with SearchAction ✅
- **SEO Score: 8/10**

✅ Title length OK (50 chars)  
✅ Description length OK (156 chars)  
✅ Single H1 present  
✅ Canonical set  
✅ OG/Twitter cards present  
✅ JSON-LD Organization + WebSite  
❌ Home title = brand name only; no keyword differentiation from tool pages  
❌ Description doesn't include a CTA ("Try free" / "No login required" is there but buried)

💡 **Recommendations:**
1. The home page metadata calls `buildMetadata({ title: SITE.name, ... })` from both `app/layout.tsx` and `app/page.tsx` — remove the duplicate export from `layout.tsx` or make it a fallback only; having two `metadata` exports for the root route is redundant.
2. Add "168+ free tools" to the title: `MyDailyTool — 168+ Free Online Tools` (44 chars; still on the short side — aim for 55+).
3. The `keywords` array on the home page (`app/page.tsx:12`) is good; ensure those 5 terms also appear in the H1 or a subheading.

---

#### `/tools/` — All Tools Index
- **Rendered title:** `All Tools | MyDailyTool` (23 chars — ❌ short)
- **Meta description:** 106 chars — ❌ short
- **H1:** "All tools" ✅
- **H2s:** One per category (15 total) ✅
- **SEO Score: 5/10**

✅ Canonical set  
✅ ItemList JSON-LD ✅  
❌ Title 23 chars — far below 50  
❌ Description 106 chars — below 120 target  
❌ Title keyword: "All Tools" is generic — no target query ("free online tools", "tool directory")  

💡 **Recommendations:**
1. Title → `"Free Online Tools Directory | MyDailyTool"` (42 chars — still short but better)
2. Description → `"Browse all 168+ free online tools — calculators, converters, developer utilities, text tools, and more. No signup required. Works in your browser."` (147 chars ✅)
3. Consider adding a short introductory paragraph (`<p>`) between the H1 and the category list to give the page more indexable body content.

---

#### `/about/` — About
- **Rendered title:** `About | MyDailyTool` (19 chars — ❌ short)
- **Meta description:** 54 chars — ❌ very short
- **H1:** "About MyDailyTool" ✅
- **H2s:** "How it works", "Who builds it", "Open standards" ✅
- **SEO Score: 4/10**

❌ Title 19 chars  
❌ Description 54 chars (Google won't show this; it will auto-generate a snippet)  
❌ No target keyword in title or description  

💡 **Recommendations:**
1. Title → `"About MyDailyTool — Free Browser Tools, No Signup"` (50 chars ✅)
2. Description → `"MyDailyTool is a free collection of 168+ online tools — calculators, converters, and utilities — built for speed and privacy. No signup, no tracking."` (151 chars ✅)
3. Low-priority page for SEO; focus efforts on tool and category pages first.

---

#### `/blog/` — Blog Index
- **Rendered title:** `Blog | MyDailyTool` (18 chars — ❌ short)
- **Meta description:** 132 chars — ❌ below 150 target
- **H1:** "Blog" ✅
- **H2s:** Post titles rendered as `<h2>` in the list ✅
- **SEO Score: 5/10**

❌ Title 18 chars  
❌ Description 132 chars  
❌ H1 "Blog" is not descriptive  

💡 **Recommendations:**
1. Title → `"Developer Tool Blog & References | MyDailyTool"` (47 chars — close; try `"Web Dev References & Tool Guides | MyDailyTool"`)
2. Description → expand to 150+ chars; add "regex, JSON, ISO 8601, LLM tokens" to signal article topics.
3. H1 → `"Blog — Developer References & Tool Guides"` (more descriptive than just "Blog").

---

#### `/contact/` — Contact
- **Rendered title:** `Contact | MyDailyTool` (21 chars — ❌ short)
- **Meta description:** 90 chars — ❌ short
- **SEO Score: 4/10** (utility page; low SEO priority)

💡 Title → `"Contact MyDailyTool — Feedback & Tool Requests"` (47 chars); description → expand to 150 chars.

---

#### `/privacy/` — Privacy Policy
- **Rendered title:** `Privacy Policy | MyDailyTool` (28 chars — ❌ short)
- **Meta description:** 69 chars — ❌ very short
- **SEO Score: 3/10** (utility page; Google de-prioritises privacy pages in search)

💡 No urgent fixes needed — this page should not rank for competitive queries. Acceptable as-is.

---

#### `/terms/` — Terms of Service
- **Rendered title:** `Terms of Service | MyDailyTool` (30 chars — ❌ short)
- **Meta description:** `"Terms of service for MyDailyTool."` — 33 chars — ❌ critically short
- **SEO Score: 2/10** (utility page)

💡 Lowest SEO priority on the site; fine to leave as-is.

---

#### `/support/` — Support
- **Rendered title:** `Support | MyDailyTool` (21 chars — ❌ short)
- **Meta description:** 116 chars — ❌ short
- **SEO Score: 4/10**

💡 Title → `"Support MyDailyTool — Buy Me a Coffee"` (38 chars). Low commercial SEO intent; not a priority.

---

### Blog Posts

---

#### `/blog/iso-8601-cheat-sheet/`
- **Rendered title:** `ISO 8601 Cheat Sheet: Dates, Times, 24:00, Durations, and Intervals | MyDailyTool` (81 chars — ❌ too long)
- **Meta description:** 160 chars ✅
- **H1:** "ISO 8601 Cheat Sheet: Dates, Times, 24:00, Durations, and Intervals" (from `<BlogPost>` component) ✅
- **Body headings:** H2s present (## The basic date format, ## Adding a time, etc.) ✅
- **SEO Score: 7/10**

✅ Description at exactly 160 chars  
✅ Rich body content (~1,500 words) ✅  
✅ Internal links to `/tools/unix-timestamp-converter/` and `/tools/date-calculator/` ✅  
❌ Title 81 chars — exceeds 60-char limit; Google will truncate  

💡 **Recommendations:**
1. Shorten title: `"ISO 8601 Cheat Sheet: Dates, Times & Intervals"` (48 chars — verify the BlogPost component uses `post.title` for the `<title>` tag and the `<h1>`; if so, keep H1 long and set a separate `titleOverride` for the meta title, or split the post title from the SEO title). Current architecture uses `post.title` directly for both.
2. Consider adding the date `(2026)` to the SEO title to signal freshness: `"ISO 8601 Date & Time Format Cheat Sheet (2026)"` (47 chars ✅).
3. Add a FAQ section (Q: "What is ISO 8601?", Q: "How do I write UTC time in ISO 8601?") to trigger FAQ rich results. The `BlogPost` component doesn't currently render FAQs with JSON-LD.

---

#### `/blog/json-formatting-guide/`
- **Rendered title:** `JSON Formatting Guide: Pretty-Print, Minify, and Validate Like a Pro | MyDailyTool` (82 chars — ❌ too long)
- **Meta description:** 176 chars — ❌ too long (truncated by Google at ~160)
- **SEO Score: 6/10**

❌ Title 82 chars  
❌ Description 176 chars  

💡 Title → `"JSON Formatting Guide: Pretty-Print & Validate"` (47 chars). Description → trim to ≤160: `"Everything you need to know about JSON formatting — indentation rules, minification for production, common validation errors, and format conversions."` (149 chars ✅).

---

#### `/blog/llm-token-counting-guide/`
- **Rendered title:** `Token Counting Across LLM APIs: GPT, Claude, Llama, and Gemini Explained | MyDailyTool` (86 chars — ❌ too long)
- **Meta description:** 187 chars — ❌ too long
- **SEO Score: 6/10**

❌ Title 86 chars  
❌ Description 187 chars  

💡 Title → `"LLM Token Counting: GPT, Claude, Llama & Gemini"` (48 chars ✅). Description → trim to: `"A practical guide to LLM tokens — how they work, why each model counts differently, real cost calculations, and how to count tokens before sending a request."` (157 chars ✅).

---

#### `/blog/regex-cheat-sheet/`
- **Rendered title:** `Regex Cheat Sheet: Patterns Every Developer Should Know | MyDailyTool` (69 chars — ❌ too long)
- **Meta description:** 175 chars — ❌ too long
- **SEO Score: 6/10**

❌ Title 69 chars  
❌ Description 175 chars  

💡 Title → `"Regex Cheat Sheet: Patterns Every Dev Should Know"` (50 chars ✅). Description → trim to: `"A practical regex reference — character classes, quantifiers, anchors, groups, and lookaheads — with ready-to-use patterns for emails, URLs, dates, and more."` (157 chars ✅).

---

### Category Pages (15 pages)

All 15 category pages share the same metadata generation pattern (`app/[category]/page.tsx:17–22`):
```
title: `${cat.name} Tools | MyDailyTool`
description: `${cat.blurb} ${cat.tools.length} free ${cat.name.toLowerCase()} tools at ${SITE.name}.`
```

**All 15 category titles are too short** (range: 24–49 chars). The template produces consistently under-optimized titles. **This is the highest-priority fix location** since category pages are the primary SEO landing pages.

| Category | Title (chars) | Desc (chars) | Score |
|---|---|---|---|
| `/developer/` | 35 ❌ | 78 ❌ | 5/10 |
| `/text/` | 33 ❌ | 87 ❌ | 5/10 |
| `/list/` | 30 ❌ | 102 ❌ | 5/10 — also "List Tools Tools" is redundant |
| `/datetime/` | 31 ❌ | 76 ❌ | 5/10 |
| `/math/` | 24 ❌ | 78 ❌ | 5/10 |
| `/converters/` | 35 ❌ | 109 ❌ | 5/10 — "Unit Converters Tools" is redundant |
| `/number-conversion/` | 33 ❌ | 83 ❌ | 5/10 |
| `/generators/` | 30 ❌ | 75 ❌ | 5/10 — "Generators Tools" is redundant |
| `/design/` | 32 ❌ | 89 ❌ | 5/10 |
| `/network/` | 38 ❌ | 106 ❌ | 5/10 |
| `/finance/` | 36 ❌ | 98 ❌ | 5/10 |
| `/investing/` | 49 ❌ | 123 ❌ | 5/10 |
| `/marketing/` | 35 ❌ | 95 ❌ | 5/10 |
| `/health/` | 36 ❌ | 101 ❌ | 5/10 |
| `/electrical/` | 44 ❌ | 106 ❌ | 5/10 |

**Systemic issue with the current template:**
- `${cat.name} Tools` creates redundant text: "List Tools Tools", "Generators Tools", "Unit Converters Tools"
- Descriptions fall 40–80 chars short of the 150-char target

**Fix:** Add per-category `seoTitle` and `seoDescription` fields to each Category object in `lib/tools.ts`, or override via a lookup in `app/[category]/page.tsx`. Example for `/developer/`:

```
title: "Free Web & Developer Tools Online | MyDailyTool"          (48 chars ✅)
desc:  "36 free tools for web developers — JSON formatter, JWT decoder, regex tester, SQL formatter, Base64, URL encoder, and more. No signup, runs in your browser." (158 chars ✅)
```

---

### Tool Pages — Grouped Analysis

**168 tool pages.** All share the same title template (`{tool.title} | MyDailyTool`) and use `tool.description` as the meta description. The root issues are:

1. **All 168 titles are short** (range: 23–43 chars; target 50–60). The `buildMetadata` template adds ` | MyDailyTool` (14 chars), so even a 40-char tool title only yields a 54-char full title. However: nearly all tool titles are under 36 chars, producing full titles of 23–49 chars.

2. **158 of 168 descriptions are under 120 chars** — 87 tools have descriptions under 60 chars (effectively just a phrase, not a paragraph).

The highest-impact fix is expanding short descriptions for the highest-traffic tool pages. The following are prioritized by estimated search volume (based on keyword competitiveness and category importance):

---

#### Critical Description Fixes (≤60 chars — essentially blank for SEO)

These descriptions are so short Google will auto-generate its own snippet from the page body, defeating any keyword targeting:

| Slug | Current description (chars) | Priority |
|---|---|---|
| `pressure-converter` | "Pa, bar, psi, atm." (18) | Medium |
| `fuel-economy-converter` | "MPG, L/100km, km/L." (19) | Medium |
| `speed-converter` | "mph, km/h, knots, m/s." (22) | Medium |
| `stopwatch` | "Web stopwatch with laps." (24) | Low |
| `frequency-converter` | "Hz, kHz, MHz, GHz, RPM." (23) | Low |
| `power-converter` | "Watts, horsepower, kW." (22) | Medium |
| `energy-converter` | "Joules, calories, kWh, BTU." (27) | Medium |
| `logarithm-calculator` | "log, ln, and log to any base." (29) | High |
| `angle-converter` | "Degrees, radians, gradians." (27) | Low |
| `bcd-converter` | "Decimal to binary-coded decimal." (32) | Low |
| `htaccess-generator` | "Common Apache .htaccess snippets." (33) | Low |
| `sales-tax-calculator` | "Add or remove sales tax." (24) | High |
| `inflation-calculator` | "Buying power across years." (26) | Medium |
| `discount-calculator` | "Final price after percent off." (30) | High |
| `ohms-law-calculator` | "Solve V = IR for any unknown." (29) | Medium |
| `inductance-calculator` | "Inductor reactance and energy." (30) | Low |
| `week-number` | "ISO week number for any date." (29) | Low |
| `unix-timestamp-converter` | "Epoch to date and date to epoch." (32) | High |
| `antilog-calculator` | "Inverse log calculator for any base." (36) | Low |

---

#### High-Traffic Tool Pages — Detailed Audit (Top 20 by estimated search demand)

---

##### `/tools/percentage-calculator/`
- **Title:** `Percentage Calculator | MyDailyTool` (35 chars ❌)
- **Description:** "Calculate percentages, percent change, and percent of a number instantly." (73 chars ❌)
- **H1:** "Percentage Calculator" ✅
- **Keywords:** percentage calculator, percent of number, percent change ✅
- **SEO Score: 5/10**

❌ Title 35 chars  
❌ Description 73 chars  

💡 Title → `"Percentage Calculator — Percent of Number & Change"` (51 chars ✅)
💡 Description → `"Calculate what percent of a number is, find percent change, and reverse-calculate any percentage. Free online percentage calculator — no signup, instant results."` (162 — trim 2 chars)

---

##### `/tools/json-formatter/`
- **Title:** `JSON Formatter | MyDailyTool` (28 chars ❌)
- **Description:** "Pretty-print, minify, and validate JSON. Detects syntax errors with line numbers and supports nested structures of any depth." (124 chars — marginal)
- **Keywords:** json formatter, json validator, json beautifier, json prettifier ✅
- **SEO Score: 6/10**

❌ Title 28 chars  
⚠️ Description 124 chars (just above 120 threshold but below optimal 150+)  

💡 Title → `"JSON Formatter & Validator — Pretty Print Online"` (49 chars ✅)
💡 Description → append: `"...of any depth. Paste JSON to format, validate, or minify instantly in your browser."` → 160 chars

---

##### `/tools/password-generator/`
- **Title:** `Password Generator | MyDailyTool` (32 chars ❌)
- **Description:** "Strong, customizable passwords with strength meter." (51 chars ❌)
- **SEO Score: 4/10**

💡 Title → `"Password Generator — Strong & Secure Passwords"` (47 chars)
💡 Description → `"Generate strong, random passwords with custom length, uppercase, lowercase, numbers, and symbols. Built-in strength meter. Free, runs in your browser — nothing is stored."` (170 — trim)

---

##### `/tools/word-counter/`
- **Title:** `Word & Text Counter | MyDailyTool` (33 chars ❌)
- **Description:** "Count words, characters, lines, sentences, and reading time." (60 chars ❌)
- **SEO Score: 4/10**

💡 Title → `"Word Counter & Character Count Tool Online"` (43 chars — add site name → 57 chars ✅)
💡 Description → `"Count words, characters, sentences, paragraphs, and estimate reading time. Paste or type any text — results update instantly. Free word counter, no login."` (155 chars ✅)

---

##### `/tools/unix-timestamp-converter/`
- **Title:** `Unix Timestamp Converter | MyDailyTool` (38 chars ❌)
- **Description:** "Epoch to date and date to epoch." (32 chars ❌ — critically short)
- **Keywords:** unix timestamp converter ✅ (only 1 keyword — too sparse)
- **SEO Score: 3/10**

💡 Title → `"Unix Timestamp Converter — Epoch to Date Online"` (47 chars + ` | MyDailyTool` = 61 — trim 1)
💡 Description → `"Convert Unix epoch timestamps to human-readable dates and back. Supports seconds and milliseconds. Works in any timezone — instant results, no signup."` (150 chars ✅)
💡 Add keywords: `"epoch converter", "timestamp to date", "milliseconds to date"`

---

##### `/tools/qr-code-generator/`
- **Title:** `QR Code Generator | MyDailyTool` (31 chars ❌)
- **Description:** "Generate QR codes for URLs, text, or contact cards." (51 chars ❌)
- **SEO Score: 4/10**

💡 Title → `"Free QR Code Generator — URLs, Text & Contacts"` (47 chars + `| MyDailyTool` = 61 — trim to `"Free QR Code Generator Online | MyDailyTool"` = 44 chars — still short)
💡 Description → `"Create QR codes for URLs, plain text, phone numbers, or contact cards (vCard). Download as PNG. Free QR code generator — no signup, no watermark."` (146 chars ✅)

---

##### `/tools/length-converter/`
- **Title:** `Length Converter | MyDailyTool` (30 chars ❌)
- **Description:** "Convert meters, feet, miles, kilometers, inches, and more." (58 chars ❌)
- **SEO Score: 4/10**

💡 Title → `"Length Converter — Meters, Feet, Miles, Inches"` (46 chars + `| MyDailyTool` = 60 chars ✅)
💡 Description → `"Convert length between meters, feet, miles, kilometers, inches, centimeters, and more. Free online length converter — instant results, no signup required."` (155 chars ✅)

---

##### `/tools/currency-converter/`
- **Title:** `Currency Converter | MyDailyTool` (32 chars ❌)
- **Description:** "Live exchange rates between major world currencies." (51 chars ❌)
- **SEO Score: 4/10**

💡 Title → `"Currency Converter — Live Exchange Rates Online"` (47 chars + `| MyDailyTool` = 61 — trim to 60)
💡 Description → `"Convert between 30+ world currencies using live exchange rates. Free online currency converter — no signup, updates daily from the European Central Bank."` (153 chars ✅)

---

##### `/tools/bmi-calculator/`
- **Title:** `BMI Calculator | MyDailyTool` (28 chars ❌)
- **Description:** "Body mass index in metric and imperial." (39 chars ❌)
- **SEO Score: 3/10**

💡 Title → `"BMI Calculator — Body Mass Index (Metric & Imperial)"` (52 chars + `| MyDailyTool` = 66 — trim)
         → `"BMI Calculator — Metric & Imperial | MyDailyTool"` (49 chars ✅)
💡 Description → `"Calculate your Body Mass Index (BMI) in metric (kg/cm) or imperial (lbs/inches). Instantly see your BMI category — underweight, normal, overweight, or obese."` (158 chars ✅)

---

##### `/tools/mortgage-calculator/`
- **Title:** `Mortgage Calculator | MyDailyTool` (33 chars ❌)
- **Description:** "PITI, amortization, and payoff schedule." (40 chars ❌)
- **SEO Score: 3/10**

💡 Title → `"Mortgage Calculator — Monthly Payment & Amortization"` (52 chars + `| MyDailyTool` = 66 — trim to `"Mortgage Payment Calculator | MyDailyTool"` = 41 — still short; aim for: `"Mortgage Calculator — PITI & Amortization"` (41 chars + 14 = 55 ✅))
💡 Description → `"Calculate your monthly mortgage payment including principal, interest, taxes, and insurance (PITI). View full amortization schedule and payoff timeline."` (151 chars ✅)

---

#### Tools with Over-Length Descriptions (>160 chars)

These 4 tool descriptions will be truncated by Google. The content is good — just needs a trim:

| Slug | Current chars | Fix |
|---|---|---|
| `json-diff` | 168 | Trim: remove "Great for diffing API responses and config files." → 119 chars — actually too short now; rework ending |
| `token-counter` | 178 | Trim last sentence "Runs in your browser." and shorten model list |
| `llm-schema-validator` | 173 | Trim "Find vendor-specific incompatibilities before you ship." to "Catch vendor-specific schema errors before shipping." |
| `curl-to-code` | 172 | Trim: "Paste a curl command, get equivalent code in JavaScript (fetch/axios), Python (requests), or Go. Handles headers, JSON bodies, basic auth, and form data." (153 chars ✅) |

---

### Utility Pages

#### `/sitemap-html/`
This page is in the sitemap (priority 0.7) but is a utility page with no SEO metadata set independently — it inherits the root layout's title. **Should be excluded from the sitemap** or given `robots: { index: false }` since it duplicates sitemap content.

---

## Site-Wide Recommendations

### Top 10 Highest-Impact Fixes

**Ranked by traffic × effort:**

1. **Fix all 15 category page descriptions** (`app/[category]/page.tsx:17–22`)  
   All 15 are 75–123 chars short of the 150-char target. Add a `seoDescription` field to each `Category` object in `lib/tools.ts` (analogous to how `blurb` works). **Est. impact: HIGH** — category pages are the primary entry point for organic search on intent-broad queries like "free json tools" or "online math calculators".

2. **Fix all 15 category page titles** (`app/[category]/page.tsx:17`)  
   The `${cat.name} Tools` template is redundant for 3 categories ("List Tools Tools", "Generators Tools", "Unit Converters Tools") and universally too short. Add a `seoTitle` field or rewrite the template. **Est. impact: HIGH**.

3. **Expand descriptions for the top 30 high-traffic tool pages**  
   Focus on tools with descriptions under 80 chars and high-volume keywords: `unix-timestamp-converter` (32 chars), `sales-tax-calculator` (24 chars), `discount-calculator` (30 chars), `password-generator` (51 chars), `qr-code-generator` (51 chars), `word-counter` (60 chars), `bmi-calculator` (39 chars), `mortgage-calculator` (40 chars), `currency-converter` (51 chars), `compound-interest-calculator` (40 chars).  
   **Est. impact: HIGH** — short descriptions cause Google to auto-generate snippets, often pulling unhelpful text from the widget area.

4. **Trim blog post titles and descriptions to fit 60/160 char limits**  
   All 4 blog posts exceed 60-char title limit; 3 of 4 exceed 160-char description limit. These are already high-quality content pages — fixing truncation is a quick win. Edit `lib/posts.ts` title/description fields. **Est. impact: MEDIUM-HIGH**.

5. **Add keywords to sparse tool definitions**  
   Several high-volume tools have only 1 keyword: `unix-timestamp-converter` ("unix timestamp converter"), `countdown-timer` ("countdown timer"), `stopwatch` ("online stopwatch"). Add spelling variants and intent variants. For example, unix-timestamp-converter should also include: "epoch converter", "epoch to date", "timestamp to date", "unix time". **Est. impact: MEDIUM**.

6. **Exclude `/sitemap-html/` from sitemap or add `noindex`**  
   This utility page has no unique content and wastes crawl budget. Add `robots: { index: false }` to `app/sitemap-html/page.tsx`. **Est. impact: LOW-MEDIUM** (crawl budget efficiency).

7. **Add FAQ structured data to top tool pages**  
   `ToolPage.tsx` already supports `content.faq` with JSON-LD. Verify that the top 20 highest-traffic tools (percentage-calculator, json-formatter, password-generator, bmi-calculator, etc.) have FAQ content populated. Tools without FAQs miss out on FAQ rich results. **Est. impact: MEDIUM**.

8. **Add `sameAs` to the Organization JSON-LD**  
   `lib/seo.ts:114` has `sameAs: []` (empty). Once the site has social profiles, add them. Even a GitHub URL or Buy Me a Coffee URL signals legitimacy. **Est. impact: LOW-MEDIUM**.

9. **Home page: add keyword-rich H2 for "Developer Tools" cluster**  
   The home page has H2s "Popular tools" and "Browse by category" — neither contains keyword targets. Rename or add subheadings that include "free online tools", "calculator", "converter". This strengthens semantic signals for the home page's target queries. **Est. impact: MEDIUM**.

10. **Add internal links from blog posts to relevant category pages (not just tool pages)**  
    Current blog posts link to individual tool pages (e.g., `/tools/unix-timestamp-converter/`). Also link to category pages (e.g., `/datetime/`) to pass link equity to the category hubs. **Est. impact: MEDIUM**.

---

### Quick Wins (Easy Fixes, High Impact)

| Fix | Location | Effort | Impact |
|---|---|---|---|
| Trim 4 blog post titles to <60 chars | `lib/posts.ts` titles | 5 min | High |
| Trim 3 blog post descriptions to <160 chars | `lib/posts.ts` descriptions | 5 min | High |
| Expand `unix-timestamp-converter` description (32→150 chars) | `lib/tools.ts:143` | 5 min | High |
| Expand `sales-tax-calculator` description | `lib/tools.ts:306` | 5 min | High |
| Expand `discount-calculator` description | `lib/tools.ts:307` | 5 min | High |
| Expand `password-generator` description | `lib/tools.ts:244` | 5 min | High |
| Add `robots: { index: false }` to `/sitemap-html/` | `app/sitemap-html/page.tsx` | 2 min | Medium |
| Fix "List Tools Tools" title bug in category template | `app/[category]/page.tsx:17` | 2 min | Medium |
| Fix "Generators Tools" and "Unit Converters Tools" redundancy | `app/[category]/page.tsx:17` | 2 min | Medium |
| Add `sameAs` to Organization JSON-LD | `lib/seo.ts:114` | 5 min | Low |

---

### Longer-Term Improvements

1. **Per-tool OG images** — Already noted as deferred in CLAUDE.md. When traffic justifies it, use Next.js `opengraph-image.tsx` convention to generate tool-specific OG cards. High-CTR benefit for social shares.

2. **Structured `HowTo` schema for calculator tools** — For tools like `bmi-calculator`, `mortgage-calculator`, `percentage-calculator`, add `HowTo` JSON-LD that Google can render as a rich result. This requires adding step-by-step `howTo` content via `ToolPage`'s `content` prop (which already renders it — just not all tools have it populated).

3. **SearchAction implementation** — The `WebSite` JSON-LD on the home page already declares a `SearchAction` pointing to `/tools/?q={search_term_string}`. Verify that the command palette (`⌘K`) or a visible search input on `/tools/` responds to this `?q=` parameter so Google Sitelinks search actually works.

4. **Blog content cadence** — CLAUDE.md already notes 1 post/week max. Target high-intent comparison queries identified in Search Console after 4+ weeks, e.g., "json vs yaml", "epoch vs unix timestamp", "apr vs ear". These align with existing tool categories and bridge search intent to tool usage.

5. **Core Web Vitals monitoring** — Static export to CloudFront is inherently fast, but adding a CrUX field data check via Search Console after each major deploy ensures no regressions in LCP or CLS (especially from the `<AdSlot>` components which conditionally inject scripts).

---

### Keyword Gap Opportunities

Based on tool categories present vs. search queries not explicitly targeted:

| Opportunity | Gap | Where to address |
|---|---|---|
| "online calculator" (high volume, generic) | Not in any title/description | Home page title or `/math/` category |
| "free unit converter" | Not in `/converters/` description | Category SEO description |
| "json to csv online" | Only partially in `json-to-csv` keywords | Expand description |
| "epoch time" | Missing variant in `unix-timestamp-converter` | Add to keywords |
| "base64 decode online" | `base64-encoder-decoder` description is 51 chars | Expand description |
| "hex to decimal converter" | Present in keywords but description is 40 chars | Expand description |
| "compound interest formula" | Missing from `compound-interest-calculator` | Add to keywords/description |
| "CIDR to IP range" | Partially covered by `cidr-calculator` | Add to keywords |
| "CSS box shadow" | Present in `box-shadow-generator` keywords | Decent — description 70 chars, expand |
| "TypeScript interface generator" | `json-to-typescript` description is 48 chars | Major opportunity — very specific query |

---

## Files to Edit (Priority Order)

1. **`lib/posts.ts`** — Shorten all 4 post titles and 3 descriptions
2. **`lib/tools.ts`** — Expand ~30 tool descriptions; add `seoTitle`/`seoDescription` fields to Category objects (or handle in step 3)
3. **`app/[category]/page.tsx:14–23`** — Rewrite `generateMetadata` to use richer titles/descriptions per category
4. **`app/tools/page.tsx:6–10`** — Expand All Tools page title + description  
5. **`app/about/page.tsx:5–9`** — Expand title + description
6. **`app/blog/page.tsx:8–12`** — Expand title + description
7. **`app/sitemap-html/page.tsx`** — Add `export const metadata = { robots: { index: false } }`
8. **`lib/seo.ts:114`** — Add `sameAs` URLs to Organization JSON-LD
9. **`scripts/generate-sitemap.mjs:50`** — Exclude `/sitemap-html/` from sitemap
