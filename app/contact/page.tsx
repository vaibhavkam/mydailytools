import { Mail, MessageCircle, Bug, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/tools";

export const metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with the ${SITE.name} team — feedback, bug reports, and tool requests welcome.`,
  path: "/contact/",
});

const REASONS = [
  { icon: Bug, title: "Found a bug?", desc: "Wrong result, broken layout, or anything that doesn't behave like you'd expect." },
  { icon: Sparkles, title: "Have a tool idea?", desc: "Tell me what you wanted to find here and couldn't. Real use cases > generic suggestions." },
  { icon: MessageCircle, title: "Anything else", desc: "Feedback, partnership, press, plain-old hello — all welcome." },
];

export default function ContactPage() {
  const subjectExample = encodeURIComponent("Feedback on MyDailyTools");
  const mailtoLink = `mailto:${SITE.email}?subject=${subjectExample}`;

  return (
    <article className="max-w-2xl">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Contact" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold">Contact us</h1>
      <p className="mt-3 text-[rgb(var(--fg-muted))] leading-relaxed">
        I read every message. The fastest way to reach me is email — your mail client opens with the address pre-filled.
      </p>

      <a
        href={mailtoLink}
        className="mt-6 inline-flex items-center gap-3 rounded-2xl px-6 py-4 bg-brand-gradient text-white font-semibold shadow-glow hover:opacity-95 transition"
      >
        <Mail className="h-5 w-5" />
        Email {SITE.email}
      </a>
      <p className="mt-2 text-xs text-[rgb(var(--fg-muted))]">
        Or copy the address: <code className="font-mono">{SITE.email}</code>
      </p>

      <hr className="my-10 border-[rgb(var(--border))]" />

      <h2 className="text-xl font-semibold">What to write about</h2>
      <div className="mt-4 grid sm:grid-cols-3 gap-3">
        {REASONS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-4">
            <Icon className="h-5 w-5 text-brand-600" />
            <h3 className="mt-2 font-semibold text-sm">{title}</h3>
            <p className="mt-1 text-xs text-[rgb(var(--fg-muted))]">{desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-[rgb(var(--fg-muted))]">
        Privacy: emails go directly to my inbox. I don&apos;t use a CRM, ticketing system, or auto-responders. Replies come from a personal Gmail address — that&apos;s a real person on the other side, not a bot.
      </p>
    </article>
  );
}
