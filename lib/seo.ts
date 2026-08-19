import type { Metadata } from "next";
import { SITE } from "./tools";

type BuildMetaArgs = {
  title: string;
  description: string;
  path: string; // absolute path starting with /
  // `keywords` is accepted for call-site compatibility but intentionally NOT
  // emitted as a <meta name="keywords"> tag — Google ignores it and it leaks
  // our targeting to competitors. The per-tool `keywords` array still lives in
  // lib/tools.ts and drives related-tool scoring; it just no longer renders.
  keywords?: string[];
  // Alt text for the OG card. Defaults to the brand name; pass the page/tool
  // name so the single shared og.png is at least labelled per page.
  ogImageAlt?: string;
  // Keep the page out of the index while leaving it reachable and followable.
  // Used for the tool categories we no longer expose to search.
  noindex?: boolean;
};

// Centralized metadata builder so every page gets consistent OG/Twitter/canonical.
export function buildMetadata({ title, description, path, ogImageAlt, noindex = false }: BuildMetaArgs): Metadata {
  const url = `${SITE.url}${path}`;
  const fullTitle = title === SITE.name ? `${SITE.name} — ${SITE.tagline}` : `${title} | ${SITE.name}`;
  const imageAlt = ogImageAlt ?? SITE.name;
  return {
    // Absolute base so any relative OG/canonical URL resolves to the canonical
    // (non-www) host rather than localhost during static export.
    metadataBase: new URL(SITE.url),
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      // English-only today, but declaring hreflang explicitly is a Google signal.
      // x-default points search engines to the English version when no other
      // language matches their user.
      languages: { en: url, "x-default": url },
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title: fullTitle,
      description,
      images: [{ url: `${SITE.url}/og.png`, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${SITE.url}/og.png`],
    },
    robots: noindex
      ? { index: false, follow: true }
      : ({ index: true, follow: true, "max-image-preview": "large" } as any),
  };
}

// JSON-LD SoftwareApplication schema for tool pages (the type Google documents
// for app rich results; WebApplication is a valid subtype but less recognized).
export function toolJsonLd(args: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: args.name,
    description: args.description,
    url: args.url,
    applicationCategory: args.applicationCategory ?? "UtilityApplication",
    operatingSystem: "Any (browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function itemListJsonLd(items: { name: string; url: string; description?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: it.name,
        url: it.url,
        ...(it.description ? { description: it.description } : {}),
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any (browser)",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    })),
  };
}

export function faqJsonLd(qa: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

// Site-wide schemas — emit only on the home page so Google understands the
// brand, logo, and (when search is implemented at the URL level) site search.
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon-512.png`,
    sameAs: [] as string[], // populate with social profile URLs when they exist
    description: SITE.description,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    // The site search lives at /tools/?q= (handled client-side by the command
    // palette). Google's SearchAction expects a URL template; we point at the
    // tools index and let the user use ⌘K from there.
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/tools/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}
