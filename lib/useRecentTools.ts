"use client";

import { useEffect, useState } from "react";
import { ALL_TOOLS } from "./tools";

const KEY = "mdt:recent-tools";
const MAX = 10;

// Push a slug to the front of the recent list. Bounded to MAX entries.
function push(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [slug, ...list.filter((s) => s !== slug)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* localStorage may be disabled — silent fail */ }
}

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// Call from a tool page to log the visit.
export function useTrackToolVisit(slug: string | undefined) {
  useEffect(() => { if (slug) push(slug); }, [slug]);
}

// Read the recent list, hydrated from localStorage. Returns Tool objects.
export function useRecentTools() {
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => {
    setSlugs(read());
    // Refresh when the user comes back to the tab (might have visited tools).
    const onFocus = () => setSlugs(read());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
  return slugs.map((s) => ALL_TOOLS.find((t) => t.slug === s)).filter((t): t is NonNullable<typeof t> => Boolean(t));
}
