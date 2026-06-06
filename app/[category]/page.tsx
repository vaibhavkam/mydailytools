import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, findCategory, SITE } from "@/lib/tools";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Sidebar } from "@/components/Sidebar";
import { AdSlot } from "@/components/AdSlot";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

// Pre-generate one route per category (output: "export" requires this).
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

// Per-category SEO overrides — richer titles and full-length descriptions.
// The generic template produces titles that are too short and descriptions
// that fall well below the 150-char target, so each category gets its own copy.
// `description` is a function of the live tool count so the number in the
// SERP snippet never drifts from reality (ALL_TOOLS / cat.tools.length is the
// single source of truth — never hardcode counts). `n` is cat.tools.length.
const CATEGORY_SEO: Record<string, { title: string; description: (n: number) => string }> = {
  developer: {
    title: "Free Developer Tools Online",
    description: (n) => `${SITE.name} has ${n} free tools for web developers — JSON formatter and validator, JWT decoder, regex tester, SQL formatter, Base64 encoder, URL parser, and more. No signup, runs in your browser.`,
  },
  text: {
    title: "Free Text & String Tools Online",
    description: (n) => `${SITE.name} has ${n} free text tools — word counter, case converter, find & replace, sort lines, remove duplicates, text diff, lorem ipsum generator, and more. No signup needed.`,
  },
  list: {
    title: "Free Online List Tools — Sort, Filter & Compare",
    description: (n) => `${SITE.name} has ${n} free list tools — set operations (union, intersection, difference), list filter, column picker, prefix/suffix wrapper, JSON array converter, and more. No signup.`,
  },
  datetime: {
    title: "Free Date & Time Tools Online",
    description: (n) => `${SITE.name} has ${n} free date and time tools — Unix timestamp converter, timezone converter, age calculator, days between dates, date calculator, countdown timer, and more. No signup.`,
  },
  math: {
    title: "Free Online Math Calculators",
    description: (n) => `${SITE.name} has ${n} free math calculators — percentage, average, fraction, standard deviation, logarithm, matrix, equation solver, and more. All run in your browser with no signup.`,
  },
  converters: {
    title: "Free Online Unit Converters",
    description: (n) => `${SITE.name} has ${n} free unit converters — length, weight, temperature, volume, speed, energy, currency, data storage, and more. Instant results, no signup, works in any browser.`,
  },
  "number-conversion": {
    title: "Free Number & Base Conversion Tools",
    description: (n) => `${SITE.name} has ${n} free number converters — binary to decimal, hex to decimal, octal, ASCII, Roman numerals, BCD, and any-base converter. Instant results, no signup required.`,
  },
  generators: {
    title: "Free Online Generators — Passwords, QR Codes & More",
    description: (n) => `${SITE.name} has ${n} free generators — strong password generator, UUID/GUID generator, QR code generator, barcode, random number, dice roller, and random color palette. No signup.`,
  },
  design: {
    title: "Free CSS & Design Tools Online",
    description: (n) => `${SITE.name} has ${n} free design tools — CSS gradient generator, box shadow generator, WCAG contrast checker, border radius, type scale, PX↔REM converter, and more. No signup.`,
  },
  network: {
    title: "Free Network & Security Tools Online",
    description: (n) => `${SITE.name} has ${n} free network and security tools — IP/CIDR subnet calculator, password strength checker, hash generator (MD5, SHA-256), SSL certificate decoder, and more. No signup.`,
  },
  finance: {
    title: "Free Personal Finance Calculators Online",
    description: (n) => `${SITE.name} has ${n} free finance calculators — mortgage, loan amortization, compound interest, salary, sales tax, discount, ROI, inflation, and more. No signup, runs in your browser.`,
  },
  investing: {
    title: "Free Investing & Corporate Finance Calculators",
    description: (n) => `${SITE.name} has ${n} free investing calculators — NPV & IRR, WACC, CAPM, bond pricing & YTM, Black-Scholes options pricing, and Sharpe ratio. No signup, runs in your browser.`,
  },
  marketing: {
    title: "Free Marketing & SEO Tools Online",
    description: (n) => `${SITE.name} has ${n} free marketing tools — SERP snippet preview, UTM link builder, CPM/CPC/CTR calculator, ROAS calculator, A/B test significance, conversion rate, and LTV/CAC.`,
  },
  health: {
    title: "Free Health & Medical Calculators Online",
    description: (n) => `${SITE.name} has ${n} free medical calculators — BMI, eGFR, creatinine clearance, MELD score, CHA₂DS₂-VASc, Wells PE score, pediatric dosing, IV drip rate, and more. No signup.`,
  },
  electrical: {
    title: "Free Electrical & Electronics Calculators",
    description: (n) => `${SITE.name} has ${n} free electrical calculators — Ohm's law, watts to amps, voltage divider, resistor color code, capacitance, decibel, AWG wire size, and more. No signup.`,
  },
  pdf: {
    title: "Free PDF Tools Online — Merge, Split, Convert & More",
    description: (n) => `${SITE.name} has ${n} free PDF tools — merge PDFs, split by page range, convert to images, images to PDF, rotate pages, compress, and view metadata. No upload, runs in your browser.`,
  },
};

export function generateMetadata({ params }: { params: { category: string } }) {
  const cat = findCategory(params.category);
  if (!cat) return {};
  const seo = CATEGORY_SEO[cat.slug];
  return buildMetadata({
    title: seo?.title ?? `${cat.name} Tools`,
    description: seo?.description?.(cat.tools.length) ?? `${cat.blurb} ${cat.tools.length} free ${cat.name.toLowerCase()} tools at ${SITE.name}.`,
    path: `/${cat.slug}/`,
    keywords: [cat.name.toLowerCase(), ...cat.tools.slice(0, 5).flatMap((t) => t.keywords)],
    ogImageAlt: seo?.title ?? `${cat.name} Tools`,
  });
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = findCategory(params.category);
  if (!cat) notFound();

  const ld = [
    breadcrumbJsonLd([
      { name: "Home", url: SITE.url + "/" },
      { name: cat.name, url: `${SITE.url}/${cat.slug}/` },
    ]),
    itemListJsonLd(
      cat.tools.map((t) => ({
        name: t.title,
        url: `${SITE.url}/tools/${t.slug}/`,
        description: t.description,
      }))
    ),
  ];

  return (
    <div className="flex gap-8">
      <Sidebar activeCategory={cat.slug} />
      <div className="flex-1 min-w-0">
        {ld.map((blob, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }} />
        ))}
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
