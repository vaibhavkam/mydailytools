import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { CATEGORIES, ALL_TOOLS, SITE } from "@/lib/tools";
import { AdSlot } from "@/components/AdSlot";
import { RecentToolsSection } from "@/components/RecentToolsSection";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: SITE.name,
  description: SITE.description,
  path: "/",
  keywords: ["online tools", "free calculators", "unit converter", "developer tools", "text tools"],
});

const FEATURED_SLUGS = [
  "json-formatter",
  "json-diff",
  "regex-tester",
  "url-encoder-decoder",
  "text-diff",
  "list-set-operations",
  "days-between-dates",
  "percentage-calculator",
];

export default function HomePage() {
  const featured = FEATURED_SLUGS
    .map((s) => ALL_TOOLS.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const ld = [organizationJsonLd(), websiteJsonLd()];

  return (
    <>
      {ld.map((blob, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }} />
      ))}
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl py-10 md:py-16 px-6 text-center bg-subtle-grid">
        <div className="absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="absolute inset-0 bg-brand-gradient blur-3xl" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass">
          <Sparkles className="h-3.5 w-3.5" /> {ALL_TOOLS.length}+ free tools, zero signup
        </span>
        <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-balance">
          Every tool you need for the <span className="bg-brand-gradient bg-clip-text text-transparent">daily web</span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-lg text-[rgb(var(--fg-muted))] text-balance">
          Calculators, converters, developer utilities, and text tools — all running locally in your browser. Fast, private, and free.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/tools/" className="btn-primary min-tap">Browse all tools <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-[rgb(var(--fg-muted))]">
          {[
            { icon: Zap, label: "Instant — runs in your browser" },
            { icon: Shield, label: "Private — your data never leaves" },
            { icon: Sparkles, label: "Free forever — no signup" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-brand-600 shrink-0" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURED TOOLS */}
      <section className="mt-8">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl font-semibold">Popular tools</h2>
          <Link href="/tools/" className="text-sm text-brand-600 hover:underline">View all →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t) => (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}/`}
              className="card p-4 hover:border-brand-500/40 hover:shadow-glow transition group"
            >
              <div className="text-xs text-brand-600 font-medium">{t.categoryName}</div>
              <h3 className="mt-1 font-semibold group-hover:text-brand-600">{t.title}</h3>
              <p className="mt-1 text-sm text-[rgb(var(--fg-muted))] line-clamp-2">{t.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <RecentToolsSection />

      <AdSlot slot="header" />

      {/* CATEGORY SHOWCASE */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-5">Browse by category</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}/`}
              className="card p-5 hover:border-brand-500/40 transition group"
            >
              <h3 className="font-semibold group-hover:text-brand-600">{c.name}</h3>
              <p className="text-sm text-[rgb(var(--fg-muted))] mt-1">{c.blurb}</p>
              <div className="mt-3 text-xs text-[rgb(var(--fg-muted))]">{c.tools.length} tools</div>
            </Link>
          ))}
        </div>
      </section>

      <AdSlot slot="footer" />
    </>
  );
}
