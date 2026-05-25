"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES, ALL_TOOLS } from "@/lib/tools";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function AllToolsPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return CATEGORIES;
    return CATEGORIES.map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.includes(q))
      ),
    })).filter((cat) => cat.tools.length > 0);
  }, [q]);

  const matchCount = filtered.reduce((n, c) => n + c.tools.length, 0);

  return (
    <>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "All tools" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold">All tools</h1>
      <p className="mt-2 text-[rgb(var(--fg-muted))]">
        {q ? `${matchCount} result${matchCount !== 1 ? "s" : ""} for "${query}"` : `${ALL_TOOLS.length} tools across ${CATEGORIES.length} categories.`}
      </p>

      {/* Search */}
      <div className="mt-5 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--fg-muted))]" />
        <input
          type="search"
          placeholder="Search tools…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-9 pr-9 w-full"
          autoFocus={false}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg))]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-[rgb(var(--fg-muted))]">No tools match &ldquo;{query}&rdquo;.</p>
      )}

      <div className="mt-8 space-y-10">
        {filtered.map((cat) => (
          <section key={cat.slug} aria-labelledby={`cat-${cat.slug}`}>
            <div className="flex items-baseline gap-2">
              <h2 id={`cat-${cat.slug}`} className="text-xl font-semibold">
                <Link href={`/${cat.slug}/`} className="hover:text-brand-600">{cat.name}</Link>
              </h2>
              <span className="text-sm text-[rgb(var(--fg-muted))]">{cat.tools.length} tools</span>
            </div>
            <p className="text-sm text-[rgb(var(--fg-muted))] mb-3">{cat.blurb}</p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {cat.tools.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/tools/${t.slug}/`}
                    className="card p-3 block hover:border-brand-500/40 transition"
                  >
                    <div className="font-medium text-sm flex items-center gap-2">
                      {t.title}
                      {t.status === "stub" && (
                        <span className="text-[10px] uppercase tracking-wide text-[rgb(var(--fg-muted))]">Soon</span>
                      )}
                    </div>
                    <div className="text-xs text-[rgb(var(--fg-muted))] line-clamp-1">{t.description}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
