import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, findCategory, SITE } from "@/lib/tools";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Sidebar } from "@/components/Sidebar";
import { AdSlot } from "@/components/AdSlot";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

// Pre-generate one route per category (output: "export" requires this).
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const cat = findCategory(params.category);
  if (!cat) return {};
  return buildMetadata({
    title: `${cat.name} Tools`,
    description: `${cat.blurb} ${cat.tools.length} free ${cat.name.toLowerCase()} tools at ${SITE.name}.`,
    path: `/${cat.slug}/`,
    keywords: [cat.name.toLowerCase(), ...cat.tools.slice(0, 5).flatMap((t) => t.keywords)],
  });
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = findCategory(params.category);
  if (!cat) notFound();

  const ld = breadcrumbJsonLd([
    { name: "Home", url: SITE.url + "/" },
    { name: cat.name, url: `${SITE.url}/${cat.slug}/` },
  ]);

  return (
    <div className="flex gap-8">
      <Sidebar activeCategory={cat.slug} />
      <div className="flex-1 min-w-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: cat.name }]} />
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">{cat.name} Tools</h1>
        <p className="mt-2 text-[rgb(var(--fg-muted))]">{cat.blurb}</p>

        <AdSlot slot="header" />

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cat.tools.map((t) => (
            <li key={t.slug}>
              <Link href={`/tools/${t.slug}/`} className="card p-4 block hover:border-brand-500/40 hover:shadow-glow transition group">
                <h2 className="font-semibold group-hover:text-brand-600">{t.title}</h2>
                <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">{t.description}</p>
                {t.status === "stub" && (
                  <span className="inline-block mt-2 text-[10px] uppercase tracking-wide text-amber-600">Coming soon</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
