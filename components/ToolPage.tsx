import Link from "next/link";
import { ALL_TOOLS, findCategory, SITE, type Tool } from "@/lib/tools";
import { AdSlot } from "./AdSlot";
import { Breadcrumbs } from "./Breadcrumbs";
import { Sidebar } from "./Sidebar";
import { RecentTracker } from "./RecentTracker";
import { breadcrumbJsonLd, faqJsonLd, toolJsonLd } from "@/lib/seo";

export type ToolContent = {
  howTo?: string;
  formula?: string;
  examples?: string;
  faq?: { q: string; a: string }[];
};

// Standard wrapper used by every working tool page. Renders breadcrumbs, the
// interactive component, ads, related tools, SEO long-form content, and JSON-LD.
export function ToolPage({
  tool,
  children,
  content,
}: {
  tool: Tool & { categorySlug: string; categoryName: string };
  children: React.ReactNode; // the interactive widget
  content?: ToolContent;
}) {
  const cat = findCategory(tool.categorySlug)!;
  const url = `${SITE.url}/tools/${tool.slug}/`;

  // Score candidate tools by keyword-word overlap so semantically close tools
  // appear first (e.g. JSON Formatter → JSON↔CSV before Color Picker).
  const toolWords = new Set(tool.keywords.join(" ").toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const scoreRelevance = (t: Tool) =>
    t.keywords.join(" ").toLowerCase().split(/\s+/).filter(w => toolWords.has(w)).length;

  const related = [...cat.tools]
    .filter((t) => t.slug !== tool.slug)
    .sort((a, b) => scoreRelevance(b) - scoreRelevance(a))
    .slice(0, 6);

  // Developer-category tools are DeveloperApplication; everything else stays
  // the generic UtilityApplication default.
  const appCategory = cat.slug === "developer" ? "DeveloperApplication" : undefined;

  const jsonLd = [
    toolJsonLd({ name: tool.title, description: tool.description, url, applicationCategory: appCategory }),
    breadcrumbJsonLd([
      { name: "Home", url: SITE.url + "/" },
      { name: cat.name, url: `${SITE.url}/${cat.slug}/` },
      { name: tool.title, url },
    ]),
    ...(content?.faq?.length ? [faqJsonLd(content.faq)] : []),
  ];

  return (
    <div className="flex gap-8">
      <Sidebar activeCategory={cat.slug} activeSlug={tool.slug} />
      <article className="flex-1 min-w-0">
        <RecentTracker slug={tool.slug} />
        {jsonLd.map((ld, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        ))}

        <Breadcrumbs items={[
          { name: "Home", href: "/" },
          { name: cat.name, href: `/${cat.slug}/` },
          { name: tool.title },
        ]} />

        <header className="mt-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{tool.title}</h1>
          <p className="mt-2 text-[rgb(var(--fg-muted))]">{tool.description}</p>
        </header>

        <section className="mt-6 card p-5 md:p-6">{children}</section>

        <AdSlot slot="in-content" />

        {content && (
          <section className="prose-tool mt-8 max-w-none">
            {content.howTo && (
              <>
                <h2>How to use the {tool.title.toLowerCase()}</h2>
                <p>{content.howTo}</p>
              </>
            )}
            {content.formula && (
              <>
                <h2>Formula & explanation</h2>
                <p>{content.formula}</p>
              </>
            )}
            {content.examples && (
              <>
                <h2>Examples</h2>
                <p>{content.examples}</p>
              </>
            )}
            {content.faq && content.faq.length > 0 && (
              <>
                <h2>Frequently asked questions</h2>
                <dl className="space-y-4">
                  {content.faq.map((qa) => (
                    <div key={qa.q}>
                      <dt className="font-semibold text-[rgb(var(--fg))]">{qa.q}</dt>
                      <dd className="text-[rgb(var(--fg-muted))]">{qa.a}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-3">Related {cat.name.toLowerCase()} tools</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/tools/${r.slug}/`} className="card p-3 block hover:border-brand-500/40 transition">
                  <div className="font-medium text-sm">{r.title}</div>
                  <div className="text-xs text-[rgb(var(--fg-muted))] line-clamp-1">{r.description}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}

export function StubTool({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  return (
    <ToolPage tool={tool}>
      <div className="text-center py-10">
        <div className="text-3xl">🚧</div>
        <h2 className="mt-2 text-lg font-semibold">This tool is on the way</h2>
        <p className="mt-1 text-[rgb(var(--fg-muted))] max-w-md mx-auto">
          We&apos;re polishing this one. In the meantime, browse other {tool.categoryName.toLowerCase()} tools.
        </p>
      </div>
    </ToolPage>
  );
}

export function getRelatedToolList() {
  return ALL_TOOLS;
}
