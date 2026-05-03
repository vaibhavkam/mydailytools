import Link from "next/link";
import { CATEGORIES, SITE } from "@/lib/tools";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[rgb(var(--border))]">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-[rgb(var(--fg-muted))]">{SITE.tagline}. Free, fast, no account required.</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
          {CATEGORIES.slice(0, 6).map((c) => (
            <div key={c.slug}>
              <h3 className="font-semibold mb-2">{c.name}</h3>
              <ul className="space-y-1.5">
                {c.tools.slice(0, 4).map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}/`} className="text-[rgb(var(--fg-muted))] hover:text-brand-600">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-sm">
          <h3 className="font-semibold mb-2">Company</h3>
          <ul className="space-y-1.5">
            <li><Link href="/blog/" className="text-[rgb(var(--fg-muted))] hover:text-brand-600">Blog</Link></li>
            <li><Link href="/about/" className="text-[rgb(var(--fg-muted))] hover:text-brand-600">About</Link></li>
            <li><Link href="/contact/" className="text-[rgb(var(--fg-muted))] hover:text-brand-600">Contact</Link></li>
            <li><Link href="/support/" className="text-[rgb(var(--fg-muted))] hover:text-brand-600 inline-flex items-center gap-1">☕ Support</Link></li>
            <li><Link href="/sitemap-html/" className="text-[rgb(var(--fg-muted))] hover:text-brand-600">Sitemap</Link></li>
            <li><Link href="/privacy/" className="text-[rgb(var(--fg-muted))] hover:text-brand-600">Privacy</Link></li>
            <li><Link href="/terms/" className="text-[rgb(var(--fg-muted))] hover:text-brand-600">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[rgb(var(--border))]">
        <div className="container py-5 text-xs text-[rgb(var(--fg-muted))] flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>Made with care for the open web.</span>
        </div>
      </div>
    </footer>
  );
}
