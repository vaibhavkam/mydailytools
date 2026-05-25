import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/tools";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE.name} — what data we do (and don't) collect.`,
  path: "/privacy/",
});

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl prose-tool">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Privacy" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold !mb-2">Privacy Policy</h1>
      <p className="text-sm text-[rgb(var(--fg-muted))]">Last updated: 2026-05-25</p>

      <h2>1. Summary</h2>
      <p>
        {SITE.name} ({SITE.domain}) is a static website. The tools you use on this site
        run entirely in your browser. We do not collect, store, or transmit the inputs
        you provide to any tool.
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li><strong>Anonymous analytics</strong>: if enabled, Google Analytics 4 collects pageviews, country, browser, and device type. IP addresses are anonymized.</li>
        <li><strong>Contact form</strong>: name, email, and message you submit are sent via Web3Forms to our inbox. We retain these only as long as needed to respond.</li>
        <li><strong>Server logs</strong>: CloudFront retains standard access logs (URL, status code, IP) for a short period for security and abuse prevention.</li>
      </ul>

      <h2>3. Cookies & similar technologies</h2>
      <p>
        We use a single first-party preference (theme mode) stored in localStorage. We
        also serve Google AdSense ads, which set cookies for ad personalization and
        frequency capping per Google&apos;s policies. You can opt out at{" "}
        <a className="text-brand-600 underline" href="https://adssettings.google.com">adssettings.google.com</a>.
      </p>

      <h2>4. Advertising (Google AdSense)</h2>
      <p>
        Third-party vendors, including Google, may use cookies to serve ads based on
        your prior visits to this and other websites. Google&apos;s use of advertising
        cookies enables it and its partners to serve ads based on your visits.
      </p>

      <h2>5. Your rights (GDPR, CCPA)</h2>
      <p>
        EU/UK residents have the right to access, rectify, and erase personal data and
        to object to processing. California residents may request disclosure of
        information collected and ask us not to sell personal information. To exercise
        these rights, email <a className="text-brand-600 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>6. Children</h2>
      <p>
        {SITE.name} is not directed to children under 13 (or 16 in the EEA). We do not
        knowingly collect personal information from children.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update this policy. Material changes will be reflected in the “Last
        updated” date above.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions? Email <a className="text-brand-600 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </article>
  );
}
