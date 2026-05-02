import type { Metadata } from "next";
import { SITE } from "./tools";

type BuildMetaArgs = {
  title: string;
  description: string;
  path: string; // absolute path starting with /
  keywords?: string[];
};

// Centralized metadata builder so every page gets consistent OG/Twitter/canonical.
export function buildMetadata({ title, description, path, keywords }: BuildMetaArgs): Metadata {
  const url = `${SITE.url}${path}`;
  const fullTitle = title === SITE.name ? `${SITE.name} — ${SITE.tagline}` : `${title} | ${SITE.name}`;
  return {
    title: fullTitle,
    description,
    keywords,
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
      images: [{ url: `${SITE.url}/og.png`, width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${SITE.url}/og.png`],
    },
    robots: { index: true, follow: true, "max-image-preview": "large" } as any,
  };
}

// JSON-LD WebApplication schema for tool pages.
export function toolJsonLd(args: { name: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: args.name,
    description: args.description,
    url: args.url,
    applicationCategory: "UtilityApplication",
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
