import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/tools";
import { POSTS_BY_DATE } from "@/lib/posts";

export const metadata = buildMetadata({
  title: "Blog",
  description: `Practical articles on developer tools, web standards, and the math behind everyday calculators — from the team building ${SITE.name}.`,
  path: "/blog/",
});

export default function BlogIndexPage() {
  return (
    <article className="max-w-3xl">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Blog" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold">Blog</h1>
      <p className="mt-2 text-[rgb(var(--fg-muted))]">
        Notes from building {SITE.name}. Mostly practical references for developers, designers, and anyone who needs a calculator that doesn&apos;t lie.
      </p>

      {POSTS_BY_DATE.length === 0 ? (
        <p className="mt-10 text-[rgb(var(--fg-muted))]">No posts yet — first one is on the way.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {POSTS_BY_DATE.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}/`} className="card p-5 block hover:border-brand-500/40 hover:shadow-glow transition group">
                <div className="flex items-center gap-3 text-xs text-[rgb(var(--fg-muted))]">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.readingTimeMin} min read</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold group-hover:text-brand-600">{p.title}</h2>
                <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">{p.description}</p>
                {p.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[10px] uppercase tracking-wider rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[rgb(var(--fg-muted))]">{t}</span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
