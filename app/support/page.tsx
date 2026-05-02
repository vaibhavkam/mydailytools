import { Coffee, Heart, Share2, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { SITE, ALL_TOOLS } from "@/lib/tools";

export const metadata = buildMetadata({
  title: "Support",
  description: `Help keep ${SITE.name} free, fast, and ad-light. Buy me a coffee or share the site with someone who'd find it useful.`,
  path: "/support/",
});

export default function SupportPage() {
  const bmcUrl = `https://buymeacoffee.com/${SITE.bmc}`;

  return (
    <article className="max-w-2xl mx-auto">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Support" }]} />
      <h1 className="mt-3 text-3xl md:text-4xl font-bold">Support {SITE.name}</h1>
      <p className="mt-3 text-[rgb(var(--fg-muted))] leading-relaxed">
        {SITE.name} is built and maintained by one developer in their spare time. {ALL_TOOLS.length} tools, no signups, no tracking on your inputs, hosted entirely on a static CDN. If a tool here saved you time today, a small coffee helps keep the site running and ad-light.
      </p>

      {/* Primary CTA — opens BMC in a new tab. */}
      <div className="mt-8 flex justify-center">
        <a
          href={bmcUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-2xl px-6 py-4 bg-brand-gradient text-white font-semibold shadow-glow hover:opacity-95 transition"
        >
          <Coffee className="h-5 w-5 group-hover:rotate-12 transition" />
          Buy me a coffee
        </a>
      </div>
      <p className="mt-3 text-center text-xs text-[rgb(var(--fg-muted))]">
        Opens <span className="font-mono">buymeacoffee.com/{SITE.bmc}</span> in a new tab.
      </p>

      <hr className="my-10 border-[rgb(var(--border))]" />

      <h2 className="text-xl font-semibold">Other ways to help (all free)</h2>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div className="card p-4">
          <Share2 className="h-5 w-5 text-brand-600" />
          <h3 className="mt-2 font-semibold">Share the site</h3>
          <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">
            Found a tool a friend would use? Send them the direct link. Word of mouth is how small sites grow.
          </p>
        </div>
        <div className="card p-4">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h3 className="mt-2 font-semibold">Suggest a tool</h3>
          <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">
            Missing something useful? <a href="/contact/" className="text-brand-600 underline">Drop a note</a> and I&apos;ll consider building it.
          </p>
        </div>
        <div className="card p-4">
          <Heart className="h-5 w-5 text-brand-600" />
          <h3 className="mt-2 font-semibold">Report a bug</h3>
          <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">
            Wrong result? Confusing label? Edge case I missed? <a href="/contact/" className="text-brand-600 underline">Tell me</a> — fixes go out the same week.
          </p>
        </div>
        <div className="card p-4">
          <Coffee className="h-5 w-5 text-brand-600" />
          <h3 className="mt-2 font-semibold">Star or follow</h3>
          <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">
            If you&apos;re on social, a quick mention helps more than you&apos;d think. {SITE.twitter}.
          </p>
        </div>
      </div>

      <hr className="my-10 border-[rgb(var(--border))]" />

      <h2 className="text-xl font-semibold">What your support pays for</h2>
      <ul className="mt-3 space-y-2 text-sm text-[rgb(var(--fg-muted))]">
        <li>• Domain renewal (~$15/year)</li>
        <li>• AWS hosting (~$1–5/month at current traffic)</li>
        <li>• Time to add new tools, fix bugs, and answer the contact form</li>
        <li>• Keeping the ad load light (no popups, no autoplay video, no interstitials)</li>
      </ul>

      <p className="mt-8 text-sm text-[rgb(var(--fg-muted))]">
        No support is required to use anything on this site — every tool will always be free. Thanks for reading this far.
      </p>

      {/* Optional: Buy Me a Coffee floating widget. Uncomment to enable.
          We default to the lightweight link approach above to keep the site
          fast and tracker-free. The widget loads ~30 KB of JS and sets cookies.

          <Script
            src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
            data-name="bmc-button"
            data-slug={SITE.bmc}
            data-color="#BD5FFF"
            data-emoji=""
            data-font="Arial"
            data-text="Buy me a coffee"
            data-outline-color="#000000"
            data-font-color="#ffffff"
            data-coffee-color="#FFDD00"
            strategy="afterInteractive"
          />
      */}
    </article>
  );
}
