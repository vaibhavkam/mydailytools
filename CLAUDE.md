# CLAUDE.md

Context for Claude Code (and similar AI dev tools) working in this repo.
This is **collaboration context** — preferences, things tried and abandoned,
gotchas — not project documentation. For project docs, read in this order:

1. [README.md](README.md) — quick orientation
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — code-level design
3. [docs/INFRA.md](docs/INFRA.md) — AWS topology, resource IDs
4. [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — how to add/edit/remove tools
5. [docs/RUNBOOK.md](docs/RUNBOOK.md) — incident response
6. [docs/DECISIONS.md](docs/DECISIONS.md) — ADRs

---

## Project at a glance

- **MyDailyTools** — static site of 168 free online tools at https://mydailytool.com
- Owner: Vaibhav Kamble (personal project, not Intuit)
- AWS account: `314138869784` (personal; Intuit account is separate, never deploy to it)
- GitHub repo: https://github.com/vaibhavkam/mydailytools (private)
- Stack: Next.js 14 App Router, TypeScript, Tailwind, static export to S3 + CloudFront

---

## Brand vs. domain naming

- **Brand**: "MyDailyTools" (plural) — used in all visible UI text, headings, OG cards, page titles
- **Domain**: `mydailytool.com` (singular) — because the plural was unavailable
- **Folder + repo + npm package**: `mydailytools` (plural) — internal labels, no SEO impact
- **Email**: `hello@mydailytool.com` (forwards via ImprovMX to `mydailytool.kamble@gmail.com`)

If you need to add new domain references, use singular. Brand text stays plural.

---

## Working preferences

How Vaibhav likes to collaborate:

- **Be honest about tradeoffs**, especially before destructive ops or before recommending a feature. Push back when something is overkill.
- **One sentence updates** during execution; don't narrate every step.
- **Match scope to request.** A bug fix doesn't need a refactor. A "stop" means stop, not "wrap up first."
- **Prefer editing existing files over creating new ones.** Especially in `lib/tools.ts`, `components/tools/registry.ts`, and the tool-component files.
- **Confirm before risky actions**: deleting AWS resources, force-pushing, modifying CI in ways that could break deploys, opening PRs.
- **Build green before declaring "done."** Run `npm run build` after non-trivial changes; don't trust local dev mode alone.
- **Commit messages**: short subject (50–72 chars, imperative mood, sentence case), body explains *why*. Don't sign as Claude. Use `git -c commit.gpgsign=false commit -m ...` to skip GPG.

When in doubt, **ask one clarifying question** rather than guess.

---

## Environment quirks

### `GITHUB_TOKEN` collision

Vaibhav's shell has `GITHUB_TOKEN` exported (Intuit setup) which breaks `gh` CLI for personal GitHub. Always prefix `gh` commands with `unset GITHUB_TOKEN`:

```bash
unset GITHUB_TOKEN && gh ...
```

Or suggest the alias `alias mygh='env -u GITHUB_TOKEN gh'` if doing many.

### Two npm registries

The dev machine's `~/.npmrc` points at Intuit's private npm registry. The repo has a project-level `.npmrc` pinning the public registry — **don't remove it**. If the lockfile ever shows `intuit.com` URLs, regenerate from public registry (see ADR-008).

### Node via nvm

Vaibhav uses nvm. Bare terminals don't have `node`/`npm` on PATH. The pattern:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 18
```

Node 18 or 20 both work. CI runs Node 20.

### AWS CLI

System `aws` is at `/usr/local/bin/aws`, doesn't depend on nvm. AWS account verified via:

```bash
aws sts get-caller-identity
# Should show Arn: arn:aws:iam::314138869784:user/mydailytool-deployer
```

If account differs, stop and ask — never deploy to the wrong account.

---

## Important infra IDs (memorize these)

| Resource | Value |
|---|---|
| AWS account | `314138869784` |
| S3 bucket | `mydailytool.com` (us-east-1) |
| CloudFront distribution | `E2XXH01ZE4SICS` |
| CloudFront domain | `d3l6mdjszodgcz.cloudfront.net` |
| CloudFront Function | `mydailytool-rewrite` |
| OAC | `E2NP89M7BAG2EU` |
| ACM cert | `arn:aws:acm:us-east-1:314138869784:certificate/3fe25fd4-afe4-48d8-83b6-ad7bf9c56b24` |
| Route 53 hosted zone | `Z103251236216CH9RQVL3` |
| IAM deploy role | `arn:aws:iam::314138869784:role/mydailytool-github-deploy` |
| GA4 measurement ID | `G-4MB75MYFSR` |
| Web3Forms key | `2062b21d-b510-4db5-b1f9-8b769e0094f8` |
| BMC username | `vaibhav.kamble` |

The IDs above are also referenced in `docs/INFRA.md` and the GitHub Actions secrets.

---

## Carve-outs from upstream advisories

- **Next.js RSC CVEs (CVE-2025-55183 / 55184 / 67779)** don't affect this site. Both advisories require a running Next.js process serving HTTP requests; we deploy with `output: "export"` (ADR-001), so the only thing in production is static HTML on CloudFront. There is no Next.js runtime in prod to attack. The deprecation warning from `npm warn deprecated next@14.2.5` will keep showing in CI logs — accept the noise rather than chasing a non-issue. If/when we ever drop static export, revisit this and upgrade to the latest 14.2.x patch.

## Things tried and abandoned

Don't re-pitch these unless circumstances change:

- **`quicktype-core` for JSON-to-TS** — replaced with hand-rolled inferrer (ADR-004). Caused 8-min CI hangs.
- **Cloudflare for DNS + Email Routing** — abandoned mid-migration because Cloudflare's auto-import broke ALIAS records and the migration risk wasn't worth it. Use ImprovMX instead.
- **Bing Webmaster Tools** — `bing.com/webmasters` wouldn't load on Vaibhav's machine. Skipped; not worth the effort for ~3% of search traffic.
- **AdSense application** — code is wired (slots reserved, script conditional), but **don't apply yet**. Premature applications get rejected with a 30-day cooldown. Wait for organic traffic in Search Console first (target: 4+ weeks post-deploy).
- **Per-tool OG images at build time** — overkill until traffic justifies it. Single OG image (`/public/og.png`) is fine for now.
- **A massive blog dump** — Google penalizes AI-generated content patterns. Realistic pace is 1 post/week max, edited by hand. First post (`/blog/iso-8601-cheat-sheet/`) is live; ~5 more should be data-driven (target queries that show in Search Console after a few weeks).
- **Image tools (color picker, resizer, format converter)** — explicitly skipped per Vaibhav. Don't suggest building these.
- **Image-to-Base64 lives in Web & Developer**, not Image category. The Image category is empty by design.
- **Custom logo** — Vaibhav reviewed 22 alternatives and kept the original wrench-spark mark. Don't suggest redesigns.

---

## Things deferred (legitimate work, not now)

These are valid future tasks. Don't build them unless explicitly asked:

- **CloudWatch billing alarm** — would warn of runaway AWS spend. ~10 min to set up.
- **Tests** — none exist. See ADR-005 for the rationale; would add when there's a team or shared state.
- **Cookie consent banner** — needed only when AdSense ships personalized ads in EEA/UK. AdSense's own Funding Choices CMP handles this automatically post-approval.
- **More blog posts** — wait for Search Console data (4+ weeks) before targeting queries. Don't write speculatively.
- **`infra/main.tf` Terraform sync** — file exists but is stale (live infra was provisioned via raw CLI). Either reconcile it or delete; don't half-maintain.
- **Custom 404 redirects** for old slugs beyond what's in `SLUG_REDIRECTS` — only add when actually breaking inbound links.
- **More currencies in `lib/rates.json`** — Frankfurter covers 30; static fallbacks add ~20 more. Crypto and exotics don't auto-refresh; that's intentional.

---

## Conversational shortcuts

Repeated patterns from past sessions:

- **"go"** or **"do all"** = proceed with the recommendation just made
- **"call it for today"** = stop here, summarize, push pending commits
- **"stuck?"** = Vaibhav is asking if Claude is hung; respond with status, don't apologize
- **Single screenshots** with no prose = "look at this, what's wrong"
- **Pasting AWS CLI output** = expect Claude to interpret the JSON, not request the same data again

---

## Failure modes to recognize fast

- **`Exit handler never called` in CI** → almost always private-registry contamination in lockfile (ADR-008). Don't waste time on `--ignore-scripts` workarounds.
- **`Could not assume role` in OIDC step** → trust policy ref mismatch. Common when running from a non-`main` branch.
- **CSS not loading on `localhost:3000`** → stale `?v=` cache in dev mode. Fix: kill dev server, `rm -rf .next`, restart.
- **Tool URL 404s on production** → CloudFront Function detached or distribution not yet `Deployed`. See RUNBOOK.md.
- **Sitemap or build script can't find slugs** → `lib/tools.ts` likely got corrupted by a regex find/replace. Open it, look for malformed syntax near the top.
- **Tool pages stuck on "Crawled - currently not indexed" in Search Console** → almost always `TOOL_LASTMOD` in `scripts/generate-sitemap.mjs` wasn't bumped after a content edit, so Google thinks nothing changed and skips recrawl. See ADR-011.
- **`/tools/[slug]` bundle suddenly balloons by 1MB+ after adding a tool** → the new tool component has a `import { ... } from "heavy-package"` at the top. Even with `dynamic()` in the registry, the heavy package gets promoted into a shared chunk loaded by every tool page. Fix: load it inside the component via `useEffect` + `await import(...)`. See `components/tools/TokenCounter.tsx` for the pattern.

---

## Style nits to remember

- **Use `useLocale().fmtCurrency`** for any money output. Never hardcode `$` or `currency: "USD"`.
- **Use `currencySymbol` for input labels** like `Price ({sym})`. Don't hardcode `($)`.
- **Examples in tool content should be currency-neutral** — write "100" not "$100".
- **Tool widgets get a `<ToolPage>` wrapper** for SEO content. Don't render bare widgets.
- **Tailwind classes only.** No CSS modules, no styled-components.
- **`lib/tools.ts` order = visible order.** When asked to reorder, edit the array order in place; don't add a separate `displayOrder` field.
- **Tool `description` is a SERP snippet, not a caption.** Write 120–160 chars with a concrete use case, not a one-liner. Cover spelling variants ("time zone" + "timezone") in `keywords`. After bumping descriptions, bump `TOOL_LASTMOD` (ADR-011).
- **FAQ content on tool pages.** Every `<ToolPage>` should pass `content.faq` with at least 2–3 Q&As. FAQs generate FAQ rich results in Google and anchor long-tail queries. Thin FAQs (1 entry) are almost as bad as none — the structured data fires but there's nothing useful for Google to show.
- **Blog post titles ≤ 50 chars, descriptions ≤ 160 chars.** Same SERP constraints as tool pages. `lib/posts.ts` is the source; titles are used for both the `<title>` tag and the on-page H1. Long titles get truncated in SERPs.

## SEO constraints to maintain

These were audited 2026-05-25 and fixed. Don't regress them:

- **Category pages (`app/[category]/page.tsx`)** use a `CATEGORY_SEO` lookup for per-category titles and descriptions. When adding a new category to `lib/tools.ts`, add a matching entry to `CATEGORY_SEO` in that file — the generic template (`${cat.name} Tools`) produces titles that are too short and descriptions that are too sparse.
- **Tool descriptions in `lib/tools.ts`** must be 120–160 chars. One-liners ("Add or remove sales tax.") are not acceptable — Google auto-generates its own snippet from the page body instead, defeating keyword targeting.
- **`/sitemap-html/` is noindexed** (`robots: { index: false }` in `app/sitemap-html/page.tsx`). Keep it that way — it's a utility page with no unique content.
- **`TOOL_LASTMOD` in `scripts/generate-sitemap.mjs`** must be bumped whenever tool descriptions, FAQs, or how-to content changes. Google won't recrawl if the date is stale.

---

## When to update this file

Append a section when:
- A new failure mode hits in CI / production and is non-obvious
- A new "tried and abandoned" pattern emerges (especially mid-task pivots)
- A working preference is stated explicitly ("from now on, X")
- A new piece of infrastructure is added with non-trivial config

Don't update for:
- Routine fixes
- Things already documented in `docs/`
- One-off conversational details

Keep this file under ~250 lines. If it bloats, prune older "abandoned" items that aren't worth re-litigating.

---

Last updated: 2026-05-25
