# Architecture Decision Records

Non-obvious technical decisions made during the project, with the *why*. Each ADR explains a choice that's not self-evident from the code, so future maintainers don't have to reverse-engineer it.

Format: numbered, dated, with status. Add new ones at the bottom.

---

## ADR-001 — Static export over server-side rendering

**Date**: 2026-05-02 · **Status**: accepted · **Context**: project setup

### Decision

The site uses Next.js's `output: "export"` mode, producing only static HTML/CSS/JS files. No Node server runs in production; CloudFront serves the files directly from S3.

### Why

- **Cost**: A static site on CloudFront costs $0.50–$2/month at low traffic. An equivalent SSR setup (Vercel, Lambda, ECS) would be 10–50× that.
- **Performance**: HTML is pre-rendered at build time and cached at every CloudFront edge POP. Time-to-first-byte is dominated by the speed of light to the nearest edge, not server response time.
- **Reliability**: Nothing to crash, scale, or patch. The site has 100% uptime by default — only DNS, S3, or CloudFront would have to fail to take it down.
- **Simplicity**: No deploy pipeline complexity, no rollback strategy, no env-specific configuration.

### Tradeoff

We can't do anything that requires per-request server logic: auth, real-time API calls without a key visible to clients, large dynamic content. Every "feature" must be expressible as build-time data baked into HTML, or browser-side JavaScript.

If a future requirement breaks this — for instance, "authenticated user dashboards with saved presets" — the architecture would need to fundamentally change. That should require explicit discussion, not be adopted incrementally.

---

## ADR-002 — Tool registry as the single source of truth

**Date**: 2026-05-02 · **Status**: accepted

### Decision

`lib/tools.ts` is the canonical place where tool metadata lives. Categories, tool order, slugs, titles, descriptions, keywords, and live/stub status are all there. Every other system (navigation, sitemap, search, breadcrumbs, related-tools, redirects) reads from this file.

### Why

The first version of the site had separate files for "navigation config," "sitemap data," and tool components. Renaming a tool required edits in 4+ places. Inevitable drift: tool name on the page didn't match the link text in the footer, etc.

Centralizing prevents this entirely. The tradeoff (one big file) is fine because the data is small (~300 lines for 168 tools) and editing it doesn't require knowledge of the rendering layer.

### Tradeoff

The file is the largest single source file. If the inventory grows to 1,000+ tools, splitting by category would help. We're well below that threshold; not a concern yet.

---

## ADR-003 — Per-tool dynamic imports keep the shared bundle tiny

**Date**: 2026-05-02 · **Status**: accepted

### Decision

`components/tools/registry.ts` maps each tool slug to a `dynamic(() => import(...))` call. Each tool's React component is its own JavaScript chunk, loaded only when a user visits that tool's page.

### Why

Tool widgets vary wildly in size (3 KB to 200 KB depending on libraries). If all 168 tools were in the shared bundle, the home page would download ~1 MB of JS for tools the user might never click into.

With dynamic imports, the shared first-load JS is **~88 KB**, which renders the home page, header, footer, and command palette. Each tool page additionally loads only its own widget chunk.

### Verified by

`npm run build` output shows shared chunks ~88 KB and per-tool route bundles ranging from 3 KB to ~200 KB.

---

## ADR-004 — `quicktype-core` removed in favor of a hand-rolled inferrer

**Date**: 2026-05-03 · **Status**: accepted

### Decision

The JSON-to-TypeScript tool originally used `quicktype-core` (the same engine behind quicktype.io). It was replaced with a ~200-line hand-rolled type inferrer in `components/tools/JsonToTypescript.tsx`.

### Why

`quicktype-core` is an 80-MB dependency tree with native bindings. It was triggering "npm error: Exit handler never called" failures on GitHub Actions runners during install (~8 minute hangs). It was also significantly inflating the route bundle for the JSON-to-TS page (~700 KB).

The hand-rolled inferrer covers ~95% of real-world inputs (objects, arrays, primitives, nullable fields, simple unions, nested types). The remaining 5% (advanced features like quicktype's name-collision resolution, schema generation, multiple language outputs) we don't need.

### Tradeoff

The output isn't as polished as quicktype.io's. For a casual JSON-to-TS conversion, it's good enough. If a user pastes a complex schema and gets imperfect output, that's an acceptable failure mode.

### See also

The `next.config.mjs` had a webpack workaround (`NormalModuleReplacementPlugin` for `node:fs` imports) that was only there for quicktype. Removed in the same commit.

---

## ADR-005 — No automated test suite

**Date**: 2026-05-02 · **Status**: accepted, with reservations

### Decision

The project has no unit tests, no integration tests, no e2e tests. Quality assurance is done by:

1. TypeScript strict mode (catches most type errors at build time)
2. ESLint (catches obvious mistakes)
3. `npm run build` succeeding (verifies all routes render)
4. Manual smoke testing in the browser for changed tools

### Why

Realistic. At solo-developer scale, the marginal value of writing tests for math-pure utility functions is low. A bug in the Mortgage Calculator's amortization formula would be caught the first time someone uses it; the cost of that bug is "user sees wrong number once," not "production database corrupted."

The 168 tools are independent, idempotent, browser-only, and have no shared state. The blast radius of any one tool being wrong is just that tool.

### When this changes

If we ever:
- Add a backend with shared state
- Hand off the project to a team
- Have a tool whose wrongness has real consequences (medical dosing already exists; we mitigate with disclaimers, not tests)

…then we revisit. Until then, "no tests" is a deliberate choice, not negligence.

### Pragmatic recommendation

If a future contributor wants to start a test culture, the highest-value first targets are:

- The math in `finance-pro.tsx` (NPV, IRR, Black-Scholes — these have wrong-answer footguns)
- The locale and currency formatting in `lib/locale.ts`
- The cron expression parser (edge cases around timezone, DST)
- `lib/posts.ts` and `lib/tools.ts` registry consistency (no duplicate slugs, no orphan registry entries)

Use Vitest (zero-config, plays nice with Next.js) and write tests as you fix bugs, not all upfront.

---

## ADR-006 — CloudFront Function for directory-style URLs

**Date**: 2026-05-02 · **Status**: accepted

### Decision

A CloudFront Function (`mydailytool-rewrite`) is attached to the distribution as a viewer-request handler. It rewrites:
- `/foo/` → `/foo/index.html`
- `/foo` (no extension) → `/foo/index.html`

### Why

S3 only auto-serves `index.html` for "directory" paths when the bucket is configured for **static website hosting**, which uses a public REST endpoint and a different security model.

We chose **OAC (Origin Access Control)** — bucket is fully private; only CloudFront can read. OAC requires the REST API endpoint, which doesn't auto-serve `index.html`.

Without the function, every tool URL would return 403 (which CloudFront converts to 404 via the custom error page).

### Alternatives considered

- **Static-website-hosted bucket**: simpler but means the bucket is public. We'd lose defense-in-depth.
- **Lambda@Edge**: more powerful but slower (cold starts) and more expensive.
- **Different URL scheme** (no trailing slash, real `.html` files): would work but breaks user expectations and several Next.js conventions.

CloudFront Functions are ~$0.10 per million invocations — effectively free at our traffic.

---

## ADR-007 — Daily build-time rates with optional in-browser refresh

**Date**: 2026-05-02 · **Status**: accepted

### Decision

Currency rates are fetched from Frankfurter at build time and baked into `lib/rates.json`. A daily GitHub Actions cron (02:30 UTC) re-runs the build, picking up the latest ECB rates. Users can also click a "Refresh" button on the Currency Converter page, which fetches Frankfurter directly from their browser.

### Why

True "live" rates would require an authenticated API service running between the user and the rate provider — not compatible with the static-export model. Build-time rates are accurate as-of-yesterday at worst, which is fine for non-trading use cases.

The "Refresh" button gives users who care a way to opt into truly current rates without us paying for a server.

### Tradeoff

Crypto rates (BTC, ETH) and ~18 exotic currencies (PKR, NGN, etc.) aren't covered by Frankfurter. They use static fallbacks that don't auto-refresh. Acceptable; users wanting live crypto rates should use a real exchange.

---

## ADR-008 — Public npm registry pinned via project `.npmrc`

**Date**: 2026-05-03 · **Status**: accepted

### Decision

The repo includes a `.npmrc` file that explicitly sets `registry=https://registry.npmjs.org/`.

### Why

A previous CI failure was traced to `package-lock.json` containing references to a private corporate npm registry (`registry.npmjs.intuit.com`). The original developer's `~/.npmrc` had pointed npm there during local install, and the lockfile recorded those URLs as the canonical source for every package.

GitHub Actions runners can't reach the private registry, so every install timed out after ~8 minutes.

The project-level `.npmrc` overrides any developer-level config and ensures everyone (including CI) installs from the public registry. The lockfile was then regenerated from public sources.

### Side effect

If a future contributor genuinely needs a private package, they need to use a different config mechanism (e.g., `.npmrc.local` not committed). The project repo only acknowledges the public registry.

---

## ADR-009 — Locale formatting client-side, not server-side

**Date**: 2026-05-02 · **Status**: accepted

### Decision

The site is served as one identical HTML file globally. A user's locale (and currency, date format, number format) is detected and applied entirely in the browser after hydration via the `useLocale()` hook.

### Why

Server-side locale detection would require:
- Either dynamic SSR (against ADR-001), or
- Generating one HTML version per locale at build time (12 locales × 168 tools × 14 categories = ~30,000 pre-rendered pages)

Both are massively more complex than the actual benefit. The client-side approach has a small downside (a 100ms flash of US-default formatting on first paint for non-US users), but no other meaningful drawback.

### Tradeoff

SEO crawlers always see US English. We accept this — international users still discover the site via Google in their region; the locale is a UX convenience, not a content differentiator.

---

## ADR-010 — Buy Me a Coffee instead of self-hosted Stripe

**Date**: 2026-05-02 · **Status**: accepted

### Decision

The "Support" page links to a Buy Me a Coffee profile. No self-hosted donation flow.

### Why

BMC handles payment processing, recurring subscriptions, currency conversion, fraud, and tax reporting. Building any of that for a free site that may receive $5/month in donations would be absurd.

BMC takes 5% of donations + standard payment processing fees. At our scale, that's negligible.

### Tradeoff

Users have to leave the site to donate. Acceptable; their flow is clear and the page primes them with a friendly explanation.

---

## How to add a new ADR

1. Bump the number (next: ADR-011)
2. Use the same template (Date, Status, Context, Decision, Why, Tradeoff)
3. Append to this file
4. Reference from code with a comment: `// See ADR-011`

ADRs are append-only. If a decision is reversed, write a new ADR that explains why, link both, and mark the old one as **superseded**.
