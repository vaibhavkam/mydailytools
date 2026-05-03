import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { findTool, SITE } from "@/lib/tools";
import { type Post } from "@/lib/posts";
import { breadcrumbJsonLd } from "@/lib/seo";

// Wrapper used by every blog post .mdx page. Renders breadcrumbs, title,
// metadata, a typographic prose container for the MDX content, and a
// "related tools" footer with internal links.
export function BlogPost({ post, children }: { post: Post; children: React.ReactNode }) {
  const url = `${SITE.url}/blog/${post.slug}/`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: { "@type": "Organization", name: SITE.name, url: SITE.url },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url, logo: { "@type": "ImageObject", url: `${SITE.url}/icon-512.png` } },
      mainEntityOfPage: url,
    },
    breadcrumbJsonLd([
      { name: "Home", url: SITE.url + "/" },
      { name: "Blog", url: `${SITE.url}/blog/` },
      { name: post.title, url },
    ]),
  ];

  const related = post.relatedTools.map(findTool).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <article className="max-w-3xl">
      {ld.map((blob, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }} />
      ))}

      <Breadcrumbs items={[
        { name: "Home", href: "/" },
        { name: "Blog", href: "/blog/" },
        { name: post.title },
      ]} />

      <header className="mt-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">{post.title}</h1>
        <div className="mt-3 flex items-center gap-4 text-sm text-[rgb(var(--fg-muted))]">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.readingTimeMin} min read</span>
        </div>
      </header>

      <div className="mt-8 prose-blog">
        {children}
      </div>

      {related.length > 0 && (
        <section className="mt-16 pt-8 border-t border-[rgb(var(--border))]">
          <h2 className="text-xl font-semibold mb-3">Related tools</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.map((t) => (
              <li key={t.slug}>
                <Link href={`/tools/${t.slug}/`} className="card p-3 block hover:border-brand-500/40 transition">
                  <div className="text-xs text-brand-600 font-medium">{t.categoryName}</div>
                  <div className="mt-0.5 font-semibold text-sm">{t.title}</div>
                  <div className="mt-1 text-xs text-[rgb(var(--fg-muted))] line-clamp-2">{t.description}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
