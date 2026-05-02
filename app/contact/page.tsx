import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/tools";
import { ContactForm } from "@/components/ContactForm";

export const metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with the ${SITE.name} team — feedback, bug reports, and tool requests welcome.`,
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <article className="max-w-2xl">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Contact" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold">Contact us</h1>
      <p className="mt-2 text-[rgb(var(--fg-muted))]">
        Feedback, bug reports, or tool ideas — we read every message. You can also email{" "}
        <a className="text-brand-600 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <div className="mt-6 card p-5">
        <ContactForm />
      </div>
    </article>
  );
}
