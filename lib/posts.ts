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
    slug: "iso-8601-cheat-sheet",
    title: "ISO 8601 Cheat Sheet: Timestamps, Durations, and Intervals You'll Actually Use",
    description: "A practical reference for ISO 8601 — date, time, timezone, durations, and intervals — with copy-pasteable examples for the formats developers actually need.",
    date: "2026-05-03",
    tags: ["dates", "developer", "reference"],
    relatedTools: ["unix-timestamp-converter", "timezone-converter", "date-calculator", "days-between-dates"],
    readingTimeMin: 7,
  },
];

export function findPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

// Sorted newest first — used by the index page.
export const POSTS_BY_DATE = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
