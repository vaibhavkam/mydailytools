"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { ALL_TOOLS, CATEGORIES } from "@/lib/tools";
import { useRecentTools } from "@/lib/useRecentTools";

type Item =
  | { kind: "tool"; slug: string; title: string; categoryName: string; categorySlug: string; keywords: string[]; description: string }
  | { kind: "category"; slug: string; title: string };

const ALL_ITEMS: Item[] = [
  ...ALL_TOOLS.map((t) => ({
    kind: "tool" as const,
    slug: t.slug,
    title: t.title,
    categoryName: t.categoryName,
    categorySlug: t.categorySlug,
    keywords: t.keywords,
    description: t.description,
  })),
  ...CATEGORIES.map((c) => ({ kind: "category" as const, slug: c.slug, title: c.name })),
];

// Lightweight fuzzy match: substring on lowercased title/keywords/category.
// Score: prefix match in title > word match in title > match in keywords > match in category.
function score(item: Item, q: string): number {
  if (!q) return 0;
  const ql = q.toLowerCase();
  const title = item.title.toLowerCase();
  if (title.startsWith(ql)) return 100;
  if (title.split(/\s+/).some((w) => w.startsWith(ql))) return 80;
  if (title.includes(ql)) return 60;
  if (item.kind === "tool") {
    if (item.keywords.some((k) => k.toLowerCase().includes(ql))) return 40;
    if (item.categoryName.toLowerCase().includes(ql)) return 30;
    if (item.description.toLowerCase().includes(ql)) return 20;
  }
  return 0;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const recent = useRecentTools();

  // Reset on open / close.
  useEffect(() => {
    if (open) {
      setQ(""); setActive(0);
      // Focus the input after the modal mounts.
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const matches = useMemo(() => {
    if (!q) return [];
    return ALL_ITEMS
      .map((item) => ({ item, s: score(item, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 25)
      .map((x) => x.item);
  }, [q]);

  // Items currently shown — matches if searching, otherwise recent + suggestions.
  const shown: Item[] = useMemo(() => {
    if (q) return matches;
    if (recent.length) return recent.map((t) => ({ kind: "tool", slug: t.slug, title: t.title, categoryName: t.categoryName, categorySlug: t.categorySlug, keywords: t.keywords, description: t.description } satisfies Item));
    // Fallback: a curated handful when there's no recent.
    const featured = ["json-to-typescript", "percentage-calculator", "regex-tester", "wcag-contrast-checker", "uuid-generator", "qr-code-generator"];
    return featured.map((s) => ALL_ITEMS.find((i) => i.kind === "tool" && i.slug === s)).filter((i): i is Item => Boolean(i));
  }, [q, matches, recent]);

  useEffect(() => { setActive(0); }, [q]);

  function go(item: Item) {
    onClose();
    const path = item.kind === "tool" ? `/tools/${item.slug}/` : `/${item.slug}/`;
    router.push(path);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" role="dialog" aria-modal="true" aria-label="Search tools">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgb(var(--border))]">
          <Search className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, shown.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
              else if (e.key === "Enter" && shown[active]) { e.preventDefault(); go(shown[active]); }
              else if (e.key === "Escape") onClose();
            }}
            placeholder="Search tools, categories, or keywords…"
            className="flex-1 bg-transparent border-0 outline-none text-base placeholder:text-[rgb(var(--fg-muted))]"
          />
          <button onClick={onClose} aria-label="Close" className="btn-ghost min-tap">
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="max-h-[60vh] overflow-auto py-1" role="listbox">
          {!q && recent.length > 0 && (
            <li className="px-4 py-1.5 text-xs uppercase tracking-wider text-[rgb(var(--fg-muted))] flex items-center gap-1.5"><Clock className="h-3 w-3" /> Recently used</li>
          )}
          {!q && recent.length === 0 && (
            <li className="px-4 py-1.5 text-xs uppercase tracking-wider text-[rgb(var(--fg-muted))]">Suggestions</li>
          )}
          {shown.length === 0 && q && (
            <li className="px-4 py-8 text-center text-sm text-[rgb(var(--fg-muted))]">No matches for &ldquo;{q}&rdquo;</li>
          )}
          {shown.map((item, i) => (
            <li key={`${item.kind}-${item.slug}`}>
              <button
                role="option"
                aria-selected={i === active}
                onClick={() => go(item)}
                onMouseEnter={() => setActive(i)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 ${i === active ? "bg-brand-50 dark:bg-brand-950/40" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.title}</div>
                  {item.kind === "tool" && (
                    <div className="text-xs text-[rgb(var(--fg-muted))] truncate">{item.categoryName} · {item.description}</div>
                  )}
                  {item.kind === "category" && (
                    <div className="text-xs text-[rgb(var(--fg-muted))]">Category</div>
                  )}
                </div>
                <ArrowRight className="h-3.5 w-3.5 opacity-50 shrink-0" />
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-[rgb(var(--border))] px-4 py-2 text-[10px] text-[rgb(var(--fg-muted))] flex justify-between">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{ALL_TOOLS.length} tools</span>
        </div>
      </div>
    </div>
  );
}

// A small button that opens the palette and registers Cmd/Ctrl-K and "/" as
// global shortcuts. Use anywhere in the app; safe to mount once in the header.
export function CommandPaletteTrigger({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search tools (Cmd+K)"
        className={`min-tap btn-ghost ${className}`}
      >
        <Search className="h-4 w-4" />
        <kbd className="hidden md:inline-flex ml-1 text-[10px] px-1.5 py-0.5 rounded border border-[rgb(var(--border))] text-[rgb(var(--fg-muted))]">⌘K</kbd>
      </button>
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}
