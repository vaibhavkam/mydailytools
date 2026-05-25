# MyDailyTool

A static website hosting **168 free online tools** — calculators, converters, developer utilities, and text helpers — at [mydailytool.com](https://mydailytool.com).

Built with Next.js 14 (App Router, static export), TypeScript, Tailwind CSS. Deployed on AWS S3 + CloudFront.

---

## Quick start

```bash
# Prerequisites: Node 20+ and npm
nvm use 20                                        # if you use nvm
npm install                                       # ~30 seconds, public registry
npm run dev                                       # http://localhost:3000
```

To produce the deployable static site:

```bash
npm run build                                     # outputs /out (~10 MB, 449 files)
```

That's it. No backend, no database, no API keys required to run locally. The `prebuild` step fetches live currency rates from Frankfurter; if you have no network it falls back to baked-in static rates.

---

## Documentation

For anything beyond running it locally:

| Doc | What's inside |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Code layout, data flow, key patterns |
| [docs/INFRA.md](docs/INFRA.md) | AWS deployment, DNS, CI/CD, monitoring (with diagrams) |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to add a tool, edit the registry, commit conventions |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | Operations: "site is down — what do I check?" |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decision records — why we chose what we chose |
| [DEPLOY.md](DEPLOY.md) | Step-by-step AWS deploy walkthrough (CLI commands) |

Read **ARCHITECTURE** first. **CONTRIBUTING** is the most-asked question.

---

## What's where

```
app/                   Next.js routes (pages)
  [category]/          Category landing pages: /math/, /developer/, etc.
  blog/                Blog posts (MDX)
  tools/[slug]/        Per-tool pages
components/
  tools/               Interactive tool widgets (one component per tool)
  *.tsx                Header, Footer, Sidebar, ToolPage wrapper, etc.
lib/
  tools.ts             Single source of truth: 168 tools across 14 categories
  posts.ts             Blog post registry
  locale.ts            User locale + currency formatting hook
  rates.json           Currency exchange rates (refreshed daily by prebuild)
  seo.ts               JSON-LD schema helpers
infra/main.tf          Terraform alternative for the AWS deploy
scripts/
  fetch-rates.mjs      Pre-build hook: fetches live FX rates from Frankfurter
  generate-sitemap.mjs Post-build hook: generates sitemap.xml
  generate-icons.mjs   Manual: regenerates favicon + OG image PNGs from SVGs
public/                Static assets (favicon, OG image, robots.txt, etc.)
.github/workflows/     GitHub Actions: auto-deploy on push, daily rate refresh
```

---

## Common tasks

| Task | How |
| --- | --- |
| Add a new tool | See [CONTRIBUTING.md](docs/CONTRIBUTING.md) → "Adding a tool" |
| Edit a tool's name/description | Edit `lib/tools.ts`, push |
| Refresh currency rates manually | `npm run build` (prebuild fetches them) |
| Regenerate favicons/OG image | `node scripts/generate-icons.mjs` |
| Deploy a code change | Push to `main` — GitHub Actions auto-deploys |

---

## Tech stack

- **Framework**: Next.js 14, App Router, `output: "export"` (static)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + CSS variables for theming
- **Icons**: lucide-react
- **Hosting**: AWS S3 (origin) + CloudFront (CDN, all edge regions)
- **DNS**: AWS Route 53
- **Email**: ImprovMX (forwards `*@mydailytool.com` to Gmail)
- **Analytics**: Google Analytics 4
- **Currency rates**: Frankfurter API (free, ECB reference rates)
- **Tool-specific libs**: jose (JWT), node-forge (X.509), qrcode, jsbarcode, marked, cronstrue, sql-formatter, zxcvbn

---

## Repo / project links

- **Live site**: https://mydailytool.com
- **Repo**: https://github.com/vaibhavkam/mydailytools (private)
- **Search Console**: verified for `mydailytool.com`
- **GA4 property**: `G-4MB75MYFSR`
- **Buy Me a Coffee**: [buymeacoffee.com/vaibhav.kamble](https://buymeacoffee.com/vaibhav.kamble)

---

## License

Not currently licensed for redistribution. If you want to fork or reuse, open an issue first.
