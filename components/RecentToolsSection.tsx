"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useRecentTools } from "@/lib/useRecentTools";

// Renders nothing on the server / first paint. After hydration, if the user has
// recent tools, shows them as a horizontal strip above other homepage content.
export function RecentToolsSection() {
  const recent = useRecentTools();
  if (recent.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-600" /> Recently used
        </h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {recent.slice(0, 5).map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}/`}
            className="card p-3 hover:border-brand-500/40 transition group"
          >
            <div className="text-xs text-brand-600 font-medium">{t.categoryName}</div>
            <h3 className="mt-0.5 text-sm font-semibold group-hover:text-brand-600 truncate">{t.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
