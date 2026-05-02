"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Coffee } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPaletteTrigger } from "./CommandPalette";
import { LocalePicker } from "./LocalePicker";
import { CATEGORIES } from "@/lib/tools";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="container flex items-center justify-between h-16">
        <Logo />
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {CATEGORIES.slice(0, 6).map((c) => (
            <Link key={c.slug} href={`/${c.slug}/`} className="btn-ghost">
              {c.name}
            </Link>
          ))}
          <Link href="/tools/" className="btn-ghost">All tools</Link>
        </nav>
        <div className="flex items-center gap-1">
          <CommandPaletteTrigger className="hidden sm:inline-flex" />
          <LocalePicker className="hidden sm:inline-flex" />
          <Link
            href="/support/"
            aria-label="Support MyDailyTools — buy me a coffee"
            className="min-tap inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white bg-brand-gradient shadow-glow hover:opacity-90 transition"
          >
            <Coffee className="h-4 w-4" />
            <span className="hidden md:inline">Support</span>
          </Link>
          <ThemeToggle />
          <button
            className="md:hidden btn-ghost min-tap"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))]">
          <div className="container py-3 grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/${c.slug}/`} className="btn-ghost" onClick={() => setOpen(false)}>
                {c.name}
              </Link>
            ))}
            <Link href="/tools/" className="btn-ghost col-span-2" onClick={() => setOpen(false)}>All tools</Link>
          </div>
        </div>
      )}
    </header>
  );
}
