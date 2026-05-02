# MyDailyTools

Free, fast, privacy-friendly online tools — calculators, converters, developer utilities, and text tools. Built with Next.js (static export), Tailwind CSS, and shadcn-style components. Hosted on S3 + CloudFront.

## Quick start

```bash
npm install
cp .env.example .env.local        # optional: AdSense / GA4 / Web3Forms keys
npm run dev                        # http://localhost:3000
npm run build                      # produces /out (deployable static site)
```

## Project layout

```
app/                      # Next.js App Router pages
  layout.tsx              # root layout: header, footer, fonts, AdSense, GA4
  page.tsx                # home
  [category]/             # /math, /converters, etc.
  tools/page.tsx          # all-tools index
  tools/[slug]/page.tsx   # tool detail (resolves to registry or stub)
  about, contact, privacy, terms, not-found
components/
  Header, Footer, Sidebar, Breadcrumbs, ThemeToggle, Logo, AdSlot, ContactForm
  ToolPage.tsx            # standard wrapper for working tools (breadcrumbs, JSON-LD, FAQ, related)
  tools/                  # working tool widgets + dynamic-import registry
lib/
  tools.ts                # central tool/category registry — drives nav, sitemap, search
  seo.ts                  # metadata + JSON-LD helpers
  cn.ts
scripts/
  generate-sitemap.mjs    # postbuild — writes out/sitemap.xml
infra/main.tf             # Terraform: S3 + CloudFront + ACM + Route 53
.github/workflows/deploy.yml
DEPLOY.md                 # AWS deploy guide + post-deploy checklist
```

## Adding a tool

1. Add an entry under the right category in `lib/tools.ts` with `status: "live"`.
2. Create `components/tools/MyNewTool.tsx`. Use the `<ToolPage>` wrapper and pass `content` for the SEO body (howTo, formula, examples, faq).
3. Register it in `components/tools/registry.ts` with a `dynamic(() => import(...))` line.
4. `npm run build` — the page is auto-generated at `/tools/<slug>/`, sitemap entry included.

Tools left as `status: "stub"` in `lib/tools.ts` show a "coming soon" page but still appear in nav, search, and sitemap, so they're crawlable and ready to flip to `live` later.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for AWS setup, Terraform, and the GitHub Actions workflow.
