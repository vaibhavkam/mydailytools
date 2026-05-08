import Link from "next/link";
import { CATEGORIES, ALL_TOOLS, SITE } from "@/lib/tools";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "All Tools",
  description: `Browse all ${ALL_TOOLS.length}+ free online tools at MyDailyTools — calculators, converters, developer utilities, and more.`,
  path: "/tools/",
});

export default function AllToolsPage() {
  const ld = itemListJsonLd(
    ALL_TOOLS.map((t) => ({
      name: t.title,
      url: `${SITE.url}/tools/${t.slug}/`,
      description: t.description,
    }))
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "All tools" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold">All tools</h1>
      <p className="mt-2 text-[rgb(var(--fg-muted))]">Every tool, organized by category. {ALL_TOOLS.length} total.</p>

      <div className="mt-8 space-y-10">
        {CATEGORIES.map((cat) => (
          <section key={cat.slug} aria-labelledby={`cat-${cat.slug}`}>
            <h2 id={`cat-${cat.slug}`} className="text-xl font-semibold">
              <Link href={`/${cat.slug}/`} className="hover:text-brand-600">{cat.name}</Link>
            </h2>
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
