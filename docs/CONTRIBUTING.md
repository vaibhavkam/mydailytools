# Contributing

Practical guide for adding, editing, and maintaining tools. This is the most-used doc in the project. Read [ARCHITECTURE.md](ARCHITECTURE.md) for the underlying design.

## Adding a tool

A tool is a self-contained interactive widget plus an entry in the registry. Three steps.

### Step 1 — Add the entry to `lib/tools.ts`

Inside the appropriate category's `tools: [...]` array, add an object:

```ts
{
  slug: "your-new-tool",                    // URL: /tools/your-new-tool/
  title: "Your New Tool",                   // Visible <h1> and link text
  description: "120–155 char description.", // <meta description> and tool-card subtitle
  keywords: ["primary keyword", "secondary keyword"],
  status: "live",                           // "live" or "stub"
}
```

Place it where it logically belongs in the category's order. The order in the file is the visible order on category pages.

The `description` field gets used verbatim as the `<meta description>` Google shows in search results, so write it for the SERP, not just for the card. Aim for **120–155 characters**, mention a concrete use case (DST-aware, supports negative numbers, no sign-up, etc.) so searchers have a reason to click, and cover common spelling variants in `keywords` if the term has more than one form (e.g. "time zone" vs "timezone", "color" vs "colour"). One-line "Convert X to Y." descriptions rank but don't get clicked.

After bumping or rewriting descriptions on existing tools, also bump `TOOL_LASTMOD` in `scripts/generate-sitemap.mjs` so Google knows to recrawl. See [ADR-011](DECISIONS.md#adr-011--sitemap-lastmod-tracks-content-date-not-build-date).

### Step 2 — Create the React component

For a small, single-purpose tool, create a new file:

```
components/tools/YourNewTool.tsx
```

```tsx
"use client";

import { useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function YourNewTool({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState("");

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "How users should interact with this tool. 1–2 sentences.",
        formula: "The math/logic behind it. Make it educational; this is good for SEO.",
        examples: "A concrete example. Use neutral numbers (no currency symbols — locale handles those).",
        faq: [
          { q: "Common question?", a: "Direct answer." },
          { q: "Edge case?", a: "What happens." },
        ],
      }}
    >
      {/* Your interactive UI here */}
      <div className="grid gap-3">
        <label className="label">Input</label>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
          {/* Your output */}
        </div>
      </div>
    </ToolPage>
  );
}
```

For tools that share a category and aren't huge, prefer adding to an existing topical file like `components/tools/finance.tsx` to keep file count manageable. The convention:
- Heavy or unique tool → its own file with `default export`
- Small tool that fits with others → named export in a topical file

### Step 3 — Register it

Edit `components/tools/registry.ts` and add a line:

```ts
"your-new-tool": dynamic(() => import("./YourNewTool")),

// or for a named export from a topical file:
"your-new-tool": dynamic(() => import("./finance").then((m) => ({ default: m.YourNewTool }))),
```

The slug here must match the slug in `lib/tools.ts` exactly.

### That's it

`git add . && git commit -m "Add Your New Tool" && git push`

GitHub Actions will:
- Build the static site (the new tool gets its own pre-rendered `out/tools/your-new-tool/index.html`)
- Add the URL to `sitemap.xml`
- Sync to S3, invalidate CloudFront

~2 minutes later, the tool is live with full SEO content and structured data, accessible at `https://mydailytool.com/tools/your-new-tool/`.

## Common edits

### Renaming a tool

If only the **title or description** changes: edit `lib/tools.ts`, push. Done.

If the **slug** changes (which means the URL changes):

1. Pick a new slug in `lib/tools.ts`.
2. **Add the old slug to `SLUG_REDIRECTS`** (same file) pointing at the new slug. This emits a redirect page so existing inbound links don't 404.
3. Update the registry key in `components/tools/registry.ts`.
4. Push.

### Removing a tool

1. Delete the entry from `lib/tools.ts`.
2. **Add the slug to `SLUG_REDIRECTS`**, pointing at a related tool (or the home page).
3. Remove the registry entry in `components/tools/registry.ts`.
4. Optionally: delete the component file (or leave it — it's just dead code, harmless).
5. Push.

### Reordering tools within a category

Just rearrange the entries in `lib/tools.ts`. The order in the file = the order on the category page.

### Reordering categories

Same — rearrange the top-level entries in `CATEGORIES`. This affects:
- Header nav (first 6 categories shown)
- Footer (first 6)
- All-tools index page
- Sidebar accordion order

Order is by usage frequency; "daily-use" first, niche/specialist last.

### Adding a category

Add a new entry to `CATEGORIES` in `lib/tools.ts` with `slug`, `name`, `blurb`, `icon` (a [lucide-react](https://lucide.dev) icon name), and an empty `tools: []` to start.

The next build will generate `/your-category/index.html` automatically.

### Adding a converter (X → Y)

Converters between two data formats must be **two-way and dual-URL**. A single widget converts both ways; we expose it at two distinct URLs so each direction can rank for its own search query (`json to xml`, `xml to json`). One URL fighting for two queries gets out-ranked by sites that have dedicated pages.

For format conversions in the JSON / YAML / CSV / XML family, the infrastructure is already built:

1. Add `parse*` / `to*` to `lib/data-formats.ts` if the format is new.
2. Add two entries in `lib/tools.ts` — one per direction (`a-to-b` and `b-to-a`). Each gets its own title, meta description, and keywords. Don't share copy between them — that triggers Google's duplicate-content de-ranking.
3. Add both slugs to `SLUG_DIRECTION` in `components/tools/DataFormatConverter.tsx` mapping each to `{ from, to }`.
4. Add per-slug `howTo` / `formula` / `examples` / `faq` to `CONTENT_BY_SLUG` in the same file — distinct framing per direction.
5. Register both slugs in `components/tools/registry.ts` pointing at `DataFormatConverter`.

For non-format converters (unit converters, encoders, etc.), the same two-way / dual-URL principle applies, but the widget needs to handle both directions internally. The component reads `tool.slug` to decide the default orientation.

### Adding a redirect for a moved/deleted slug

Edit `SLUG_REDIRECTS` in `lib/tools.ts`:

```ts
export const SLUG_REDIRECTS: Record<string, string> = {
  "old-slug": "new-canonical-slug",
  // ...
};
```

The `app/tools/[slug]/page.tsx` handler reads this and emits a redirect HTML page. Old URLs keep working.

## Adding a blog post

1. Create a folder: `app/blog/your-post-slug/`
2. Inside, create `page.mdx` (see `app/blog/iso-8601-cheat-sheet/page.mdx` for the template — it imports `BlogPost` and `findPost`)
3. Add the metadata entry to `lib/posts.ts`
4. Push.

Sitemap auto-includes it. Footer doesn't need editing — `/blog/` index lists all posts.

### Writing for the SERP

Don't write speculatively. Wait for Search Console to show ~50+ impressions on related queries before writing a post — those queries tell you what people are actually searching for and which phrasing to use.

When you do write, match search intent literally:

- Use H2/H3 headings that contain the user's question **word-for-word**. Google often pulls a matching heading as the snippet, and a snippet that mirrors the query gets 3–5× the CTR of a generic one.
- Cover common variants and edge cases the original post glosses over. "Is `24:00` valid in ISO 8601?" is searched far more than "ISO 8601 time format" — answer the specific question with its own heading, not buried in a paragraph.
- Don't pad. A 6-line section answering one specific question outranks a 30-line section that touches the topic vaguely.

## Coding conventions

### TypeScript

- Strict mode is on. Don't disable it.
- Avoid `any`. If you must, comment why.
- Type imports: `import type { ... }`.

### Styling

- Tailwind classes only. No CSS modules, no styled-components.
- Use the predefined component classes when they fit: `card`, `btn-primary`, `btn-ghost`, `input`, `label`, `min-tap` (for 44px touch targets), `prose-tool` (for tool-page long-form content), `prose-blog` (for blog posts).
- Brand colors: `bg-brand-gradient` for primary CTAs; `text-brand-600` / `bg-brand-50` for secondary accents.
- Dark mode: classes prefixed `dark:` automatically respect the toggle. Test both.

### Locale / currency

If your tool deals with money, use the `useLocale` hook:

```tsx
import { useLocale } from "@/lib/locale";

const { fmtCurrency: fmt, currencySymbol } = useLocale();
const sym = currencySymbol();

// In labels: <label>Price ({sym})</label>
// In output: {fmt(amount)}  // returns "$1,234.56" or "₹1,234.56" depending on locale
```

Never hardcode a `$` or `currency: "USD"` in a label or output. Use the hook.

### Number formatting

Other Intl formatting (large numbers, dates, percentages) — also use `useLocale().fmtNumber(n, opts)` or `fmtDate(d, opts)` so users see numbers in their locale's convention.

### Comments

- Don't comment what; comment why or how.
- Tool components don't need a header comment — the registry entry is the description.
- Math should explain its formula in the code (tool users won't see this; future devs will).

### Imports

- Path alias: `@/lib/...`, `@/components/...`. Never relative imports across three or more levels.
- Group: external imports → `@/...` imports → relative imports → CSS imports. Blank line between groups.

## Commit conventions

Loose, no enforcement. I use:

```
Subject: 50–72 chars, imperative mood, sentence case
empty line
Body: what changed and why; wrap at 72 chars; bullets if multiple things
```

Example:

```
Add JSON ↔ TOML converter

Pure JS implementation; no new deps. Wired into Developer Tools
category between yaml-to-json and xml-formatter.
```

For trivial changes (typo fixes, doc tweaks), a one-liner is fine.

## Pull requests

If a future contributor adds the `develop`/`feature` branch flow, the OIDC trust policy needs updating to allow PR previews. The current setup deploys only from `main`. Don't merge to main until you've at least:

1. Run `npm run build` locally — it must succeed
2. Visited the affected pages in `npm run dev` and confirmed they look right
3. (Optional but recommended) Mobile-tested via DevTools responsive mode

There are no automated tests yet (see [DECISIONS.md](DECISIONS.md) #5 on that).

## What not to do

- **Don't add a backend.** The static-export model depends on no server. If you genuinely need server logic, propose it explicitly and discuss whether it's worth the architectural change.
- **Don't add new heavyweight dependencies casually.** Each one is downloaded by every build, possibly bundled into a route, and is a maintenance liability. Prefer hand-rolling small utilities (see how we replaced quicktype-core with ~200 lines of inferrer code).
- **Don't break the registry-as-truth pattern.** Don't put a tool's metadata anywhere except `lib/tools.ts`.
- **Don't ship a tool that requires API keys.** If it does, the build will fail without env vars. We've kept the site deployable from a fresh clone with zero secrets needed.
- **Don't commit `.env.local` or any file with real secrets.** `.gitignore` covers `.env*.local`. Double-check before committing.

## When in doubt

Skim an existing tool that does something similar to what you're adding. The codebase has 168 examples; one of them is probably close.
