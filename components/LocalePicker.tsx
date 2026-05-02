"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { useLocale, LOCALES } from "@/lib/locale";

// Small dropdown next to the theme toggle. Sets the user's locale + default
// currency for every tool that displays money or formatted numbers.
export function LocalePicker({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Choose locale and currency"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="min-tap btn-ghost"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden md:inline ml-1 text-xs">{locale.id}</span>
      </button>
      {open && (
        <div role="listbox" className="absolute right-0 z-30 mt-2 w-64 max-h-[60vh] overflow-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] shadow-glow p-1">
          {LOCALES.map((opt) => {
            const active = opt.id === locale.id;
            return (
              <button
                key={opt.id}
                role="option"
                aria-selected={active}
                onClick={() => { setLocale(opt); setOpen(false); }}
                className={`w-full text-left rounded-lg px-2.5 py-2 text-sm flex items-center gap-2 ${active ? "bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              >
                <span className="flex-1 truncate">{opt.label}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
