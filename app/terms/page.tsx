import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/tools";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: `Terms of service for ${SITE.name}.`,
  path: "/terms/",
});

export default function TermsPage() {
  return (
    <article className="max-w-3xl prose-tool">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Terms" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold !mb-2">Terms of Service</h1>
      <p className="text-sm text-[rgb(var(--fg-muted))]">Last updated: 2026-05-25</p>

      <h2>1. Acceptance</h2>
      <p>By using {SITE.name}, you agree to these terms.</p>

      <h2>2. Use of the service</h2>
      <p>The site is provided for personal and commercial use, free of charge. You may not redistribute the source code as your own product or scrape the site at a scale that disrupts service for others.</p>

      <h2>3. No warranty</h2>
      <p>
        The tools are provided “as is” without warranty of any kind. While we make
        every effort to ensure accuracy, calculations should be independently
        verified for high-stakes decisions (medical, legal, financial).
      </p>

      <h2>4. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {SITE.name} shall not be liable for
        any indirect, incidental, or consequential damages arising from use of the
        service.
      </p>

      <h2>5. Third-party services</h2>
      <p>
        We use Google AdSense, Google Analytics, and Web3Forms. Their respective
        terms apply to data they handle.
      </p>

      <h2>6. Governing law</h2>
      <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of India.</p>

      <h2>7. Changes</h2>
      <p>We may revise these terms; the “Last updated” date will reflect changes.</p>
    </article>
  );
}
