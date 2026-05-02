"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/tools";

// Category sidebar with collapsible per-category dropdowns. Clicking the entire
// row toggles open/close; a small "View all" link inside the expanded panel
// goes to the category landing page.
export function Sidebar({ activeCategory, activeSlug }: { activeCategory?: string; activeSlug?: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    activeCategory ? { [activeCategory]: true } : {}
  );

  const toggle = (slug: string) => setOpen((s) => ({ ...s, [slug]: !s[slug] }));

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 card p-3">
        <h2 className="text-xs uppercase tracking-wider text-[rgb(var(--fg-muted))] px-2 py-1.5">Categories</h2>
        <ul className="space-y-0.5">
          {CATEGORIES.map((c) => {
            const isActive = c.slug === activeCategory;
            const isOpen = !!open[c.slug];
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => toggle(c.slug)}
                  aria-expanded={isOpen}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition text-left ${
                    isActive
                      ? "bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-medium"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-[rgb(var(--fg))]"
                  }`}
                >
                  <span>
                    {c.name}
                    <span className="ml-2 text-xs opacity-60">{c.tools.length}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <ul className="mt-0.5 mb-1 ml-2 border-l border-[rgb(var(--border))] pl-2 space-y-0.5">
                    {c.tools.map((t) => {
                      const here = t.slug === activeSlug;
                      return (
                        <li key={t.slug}>
                          <Link
                            href={`/tools/${t.slug}/`}
                            className={`block rounded-md px-2 py-1.5 text-xs transition truncate ${
                              here
                                ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-200 font-medium"
                                : "text-[rgb(var(--fg-muted))] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[rgb(var(--fg))]"
                            }`}
                          >
                            {t.title}
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <Link href={`/${c.slug}/`} className="block rounded-md px-2 py-1.5 text-xs text-brand-600 hover:underline">
                        View all {c.name.toLowerCase()} →
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
