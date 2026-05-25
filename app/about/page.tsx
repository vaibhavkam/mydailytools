import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { SITE, ALL_TOOLS } from "@/lib/tools";

export const metadata = buildMetadata({
  title: "About MyDailyTool — Free Browser Tools, No Signup",
  description: `MyDailyTool is a free collection of ${ALL_TOOLS.length}+ online tools — calculators, unit converters, developer utilities, and text helpers — built for speed and privacy. No signup, no tracking.`,
  path: "/about/",
});

export default function AboutPage() {
  return (
    <article className="max-w-3xl">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "About" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold">About {SITE.name}</h1>
      <div className="prose-tool mt-4">
        <p>
          {SITE.name} is a free collection of {ALL_TOOLS.length}+ online utilities — calculators,
          unit converters, developer tools, and text helpers — designed to load fast,
          respect your privacy, and work entirely in your browser.
        </p>
        <h2>How it works</h2>
        <p>
          Every tool is implemented as a small client-side widget. Your inputs never
          leave your device. The site itself is a static export served from S3 +
          CloudFront, so there&apos;s no server to log requests, store form data, or
          slow you down.
        </p>
        <h2>Built by one developer</h2>
        <p>
          {SITE.name} is a solo project. I built it because I kept running into slow,
          ad-heavy sites for simple everyday tasks. The site is ad-supported to keep it
          free — ads are non-intrusive and never affect how the tools work.
          Have an idea for a tool? <a href="/contact/" className="text-brand-600 underline">Tell us</a>.
        </p>
        <h2>Open standards</h2>
        <p>
          We use Web Crypto for randomness, the platform Intl APIs for formatting, and
          the standard browser file APIs for any file work — no proprietary extensions.
        </p>
      </div>
    </article>
  );
}
