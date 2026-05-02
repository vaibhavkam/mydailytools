import Link from "next/link";
import { CATEGORIES, ALL_TOOLS, SITE } from "@/lib/tools";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

// HTML sitemap — a single page listing every tool, organized by category.
// Distinct from /sitemap.xml: this one is for human visitors and reinforces
// internal linking signals to crawlers.
export const metadata = buildMetadata({
  title: "Sitemap",
  description: `Browse every tool available on ${SITE.name}, organized by category.`,
  path: "/sitemap-html/",
});

export default function SitemapHtmlPage() {
  return (
    <article>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Sitemap" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold">Sitemap</h1>
      <p className="mt-2 text-[rgb(var(--fg-muted))]">
        Every tool on {SITE.name} ({ALL_TOOLS.length} total), grouped by category.
        For machine-readable XML, see <Link href="/sitemap.xml" className="text-brand-600 hover:underline">/sitemap.xml</Link>.
      </p>

      <div className="mt-8 space-y-10">
        {CATEGORIES.map((cat) => (
          <section key={cat.slug} aria-labelledby={`cat-${cat.slug}`}>
            <h2 id={`cat-${cat.slug}`} className="text-xl font-semibold">
              <Link href={`/${cat.slug}/`} className="hover:text-brand-600">{cat.name}</Link>
              <span className="ml-2 text-sm font-normal text-[rgb(var(--fg-muted))]">({cat.tools.length})</span>
            </h2>
            <p className="text-sm text-[rgb(var(--fg-muted))] mt-1 mb-3">{cat.blurb}</p>
            <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {cat.tools.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/tools/${t.slug}/`}
                    className="block rounded-lg px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 transition"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-[rgb(var(--border))] text-sm text-[rgb(var(--fg-muted))]">
        Looking for something specific? Press <kbd className="rounded border border-[rgb(var(--border))] px-1.5 py-0.5 text-xs">⌘K</kbd> from anywhere to search.
      </div>
    </article>
  );
}
