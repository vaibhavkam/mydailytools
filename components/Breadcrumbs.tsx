import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { name: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[rgb(var(--fg-muted))]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {it.href && !last ? (
                <Link href={it.href} className="hover:text-brand-600">{it.name}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-[rgb(var(--fg))] font-medium" : ""}>
                  {it.name}
                </span>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
