// Blog post registry — single source of truth for metadata. The actual prose
// lives in app/blog/<slug>/page.mdx. Each post should:
//   1. Have an entry here with frontmatter-style fields
//   2. Have a corresponding app/blog/<slug>/page.mdx file with the prose
//   3. Link to at least one related tool (drives internal cross-traffic)

export type Post = {
  slug: string;          // url path: /blog/<slug>/
  title: string;         // <h1> + <title>
  description: string;   // <meta description> + index card subtitle (≤160 chars)
  date: string;          // ISO 8601 yyyy-mm-dd; sort order
  tags: string[];        // for grouping / filtering on the index later
  relatedTools: string[]; // tool slugs to surface at the bottom of each post
  readingTimeMin: number; // estimated, shown on cards
};

export const POSTS: Post[] = [
  {
    slug: "capacitors-series-parallel",
    title: "Capacitors in Series vs Parallel: Formulas & Calculator",
    description: "Learn how series and parallel capacitors work, when to use each, and how to calculate total capacitance — with formulas, worked examples, and an RC time constant explainer.",
    date: "2026-06-02",
    tags: ["electronics", "capacitor", "circuit", "reference", "electrical"],
    relatedTools: ["capacitance-calculator", "ohms-law-calculator", "power-calculator"],
    readingTimeMin: 7,
  },
  {
    slug: "llm-token-counting-guide",
    title: "LLM Token Counting: GPT, Claude, Llama & Gemini Explained",
    description: "A practical guide to LLM tokens — how they work, why each model counts differently, real cost calculations at scale, and how to count tokens before sending a request.",
    date: "2026-05-22",
    tags: ["llm", "ai", "tokens", "developer", "reference"],
    relatedTools: ["token-counter", "llm-schema-validator", "json-formatter"],
    readingTimeMin: 9,
  },
  {
    slug: "regex-cheat-sheet",
    title: "Regex Cheat Sheet: Patterns Every Dev Should Know",
    description: "A practical regex reference — character classes, quantifiers, anchors, groups, and lookaheads — with ready-to-use patterns for emails, URLs, dates, and more.",
    date: "2026-05-08",
    tags: ["regex", "developer", "reference"],
    relatedTools: ["regex-tester", "find-and-replace", "url-encoder-decoder", "json-formatter"],
    readingTimeMin: 8,
  },
  {
    slug: "json-formatting-guide",
    title: "JSON Formatting Guide: Pretty-Print & Validate Like a Pro",
    description: "Everything you need to know about JSON formatting — indentation rules, minification for production, common validation errors, and how to convert between JSON and other formats.",
    date: "2026-05-06",
    tags: ["json", "developer", "reference"],
    relatedTools: ["json-formatter", "json-to-csv", "yaml-to-json", "json-to-typescript"],
    readingTimeMin: 6,
  },
  {
    slug: "iso-8601-cheat-sheet",
    title: "ISO 8601 Cheat Sheet: Is 24:00 a Valid Time?",
    description: "Is 24:00 valid in ISO 8601? Is 18:00? When 00:00 means start vs end of day — quick answers plus a full cheat sheet for dates, times, offsets, and durations.",
    date: "2026-05-03",
    tags: ["dates", "developer", "reference", "iso 8601", "timestamp"],
    relatedTools: ["unix-timestamp-converter", "timezone-converter", "date-calculator", "days-between-dates", "week-number", "age-calculator", "time-converter"],
    readingTimeMin: 7,
  },
];

export function findPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

// Reverse index: given a tool slug, return the posts that list it in
// `relatedTools`. Used to render a "Related reading" block on tool pages so
// every tool with a relevant post links to it (not just date/time tools).
export function findPostsForTool(toolSlug: string) {
  return POSTS.filter((p) => p.relatedTools.includes(toolSlug));
}

// Sorted newest first — used by the index page.
export const POSTS_BY_DATE = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
