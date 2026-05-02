"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

// =====================================================================
// Paper Size Converter
// =====================================================================
const PAPER_SIZES: { name: string; mm: [number, number]; series: string }[] = [
  // ISO A series
  { name: "A0", mm: [841, 1189], series: "ISO" },
  { name: "A1", mm: [594, 841], series: "ISO" },
  { name: "A2", mm: [420, 594], series: "ISO" },
  { name: "A3", mm: [297, 420], series: "ISO" },
  { name: "A4", mm: [210, 297], series: "ISO" },
  { name: "A5", mm: [148, 210], series: "ISO" },
  { name: "A6", mm: [105, 148], series: "ISO" },
  { name: "A7", mm: [74, 105], series: "ISO" },
  { name: "A8", mm: [52, 74], series: "ISO" },
  // ISO B series
  { name: "B4", mm: [250, 353], series: "ISO" },
  { name: "B5", mm: [176, 250], series: "ISO" },
  // North American
  { name: "Letter", mm: [215.9, 279.4], series: "US" },
  { name: "Legal", mm: [215.9, 355.6], series: "US" },
  { name: "Tabloid (Ledger)", mm: [279.4, 431.8], series: "US" },
  { name: "Executive", mm: [184.2, 266.7], series: "US" },
  { name: "Half Letter", mm: [139.7, 215.9], series: "US" },
  // Photo / postcard
  { name: "Postcard (4×6 in)", mm: [101.6, 152.4], series: "Photo" },
  { name: "Photo 5×7", mm: [127, 177.8], series: "Photo" },
  { name: "Photo 8×10", mm: [203.2, 254], series: "Photo" },
];

export function PaperSize({ tool }: Props) {
  const [name, setName] = useState("A4");
  const sel = PAPER_SIZES.find((p) => p.name === name) ?? PAPER_SIZES[4];
  const [w, h] = sel.mm;
  const inToMm = 25.4;
  const ptToMm = 25.4 / 72; // 1 pt = 1/72 in
  const wIn = w / inToMm, hIn = h / inToMm;
  const wPt = w / ptToMm,  hPt = h / ptToMm;
  const wPx = wPt * (96 / 72), hPx = hPt * (96 / 72); // assumed 96 dpi
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a standard paper size; dimensions appear in millimetres, inches, points (PostScript / PDF), and pixels at 96 DPI.",
      formula: "ISO A series follows √2 ratio: each next size halves the larger dimension. A0 = 1 m². Inches → mm × 25.4. Points → in × 72.",
      examples: "A4 = 210 × 297 mm = 8.27 × 11.69 in = 595 × 842 pt. US Letter = 8.5 × 11 in = 215.9 × 279.4 mm.",
      faq: [{ q: "Why is A4 not the same as Letter?", a: "Different historical standards — ISO A4 originated from a German DIN proposal in 1922 (1 m² area, √2 ratio); US Letter has murkier origins, possibly from a 17th-century Dutch papermaking convention." }],
    }}>
      <label className="label">Paper size</label>
      <select className="input" value={name} onChange={(e) => setName(e.target.value)}>
        {["ISO", "US", "Photo"].map((series) => (
          <optgroup key={series} label={series === "ISO" ? "ISO 216 (international)" : series === "US" ? "North American" : "Photo & postcard"}>
            {PAPER_SIZES.filter((p) => p.series === series).map((p) => <option key={p.name}>{p.name}</option>)}
          </optgroup>
        ))}
      </select>
      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Millimetres</div><div className="text-lg font-semibold tabular-nums">{w.toFixed(1)} × {h.toFixed(1)} mm</div></div>
        <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Inches</div><div className="text-lg font-semibold tabular-nums">{wIn.toFixed(2)} × {hIn.toFixed(2)} in</div></div>
        <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Points (1/72&quot;)</div><div className="text-lg font-semibold tabular-nums">{Math.round(wPt)} × {Math.round(hPt)} pt</div></div>
        <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Pixels @ 96 DPI</div><div className="text-lg font-semibold tabular-nums">{Math.round(wPx)} × {Math.round(hPx)} px</div></div>
      </div>
    </ToolPage>
  );
}

// =====================================================================
// Shoe Size Converter
// =====================================================================
// Mappings derived from the Brannock + EU Mondopoint correspondence,
// rounded to typical retail sizes. Source: WikiData & retailer charts.
type ShoeRow = { us: number; uk: number; eu: number; cm: number };
const SHOE_MEN: ShoeRow[] = [
  { us: 6,  uk: 5.5, eu: 39,    cm: 24.0 },
  { us: 7,  uk: 6.5, eu: 40,    cm: 24.7 },
  { us: 8,  uk: 7.5, eu: 41,    cm: 25.4 },
  { us: 9,  uk: 8.5, eu: 42,    cm: 26.0 },
  { us: 10, uk: 9.5, eu: 43,    cm: 26.7 },
  { us: 11, uk: 10.5,eu: 44,    cm: 27.3 },
  { us: 12, uk: 11.5,eu: 45,    cm: 28.0 },
  { us: 13, uk: 12.5,eu: 46,    cm: 28.6 },
  { us: 14, uk: 13.5,eu: 47,    cm: 29.4 },
];
const SHOE_WOMEN: ShoeRow[] = [
  { us: 5,  uk: 3,   eu: 35.5, cm: 22.0 },
  { us: 6,  uk: 4,   eu: 36.5, cm: 22.5 },
  { us: 7,  uk: 5,   eu: 37.5, cm: 23.5 },
  { us: 8,  uk: 6,   eu: 38.5, cm: 24.0 },
  { us: 9,  uk: 7,   eu: 39.5, cm: 25.0 },
  { us: 10, uk: 8,   eu: 40.5, cm: 26.0 },
  { us: 11, uk: 9,   eu: 41.5, cm: 27.0 },
];

export function ShoeSize({ tool }: Props) {
  const [gender, setGender] = useState<"men" | "women">("men");
  const [system, setSystem] = useState<"us" | "uk" | "eu" | "cm">("us");
  const [val, setVal] = useState("9");
  const table = gender === "men" ? SHOE_MEN : SHOE_WOMEN;
  const row = useMemo(() => {
    const v = parseFloat(val);
    if (!Number.isFinite(v)) return null;
    // Pick the row with the closest value in the chosen system.
    return table.reduce((best, cur) => Math.abs(cur[system] - v) < Math.abs(best[system] - v) ? cur : best, table[0]);
  }, [val, system, table]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick gender and the system you know your size in (US, UK, EU, or foot length in cm). The other systems show in the result.",
      formula: "Sizes don't have a clean linear formula; we use industry-standard correspondence tables rounded to typical retail sizes.",
      examples: "US men's 9 ≈ UK 8.5, EU 42, foot ~26 cm. US women's 8 ≈ UK 6, EU 38.5.",
      faq: [{ q: "Half sizes?", a: "Some manufacturers carry half sizes; others round up. Try both if you're between sizes." }, { q: "Children's sizes?", a: "Not yet — we cover adult only. Children's sizing diverges substantially by manufacturer." }],
    }}>
      <div className="flex gap-2 mb-3">
        {(["men", "women"] as const).map((g) => (
          <button key={g} onClick={() => setGender(g)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${gender === g ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{g}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Size</label><input className="input" value={val} onChange={(e) => setVal(e.target.value)} /></div>
        <div><label className="label">In system</label>
          <select className="input" value={system} onChange={(e) => setSystem(e.target.value as any)}>
            <option value="us">US</option><option value="uk">UK</option><option value="eu">EU</option><option value="cm">cm (foot length)</option>
          </select>
        </div>
      </div>
      {row && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className={`rounded-xl border p-3 text-center ${system === "us" ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}><div className="text-xs text-[rgb(var(--fg-muted))]">US</div><div className="text-lg font-semibold">{row.us}</div></div>
          <div className={`rounded-xl border p-3 text-center ${system === "uk" ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}><div className="text-xs text-[rgb(var(--fg-muted))]">UK</div><div className="text-lg font-semibold">{row.uk}</div></div>
          <div className={`rounded-xl border p-3 text-center ${system === "eu" ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}><div className="text-xs text-[rgb(var(--fg-muted))]">EU</div><div className="text-lg font-semibold">{row.eu}</div></div>
          <div className={`rounded-xl border p-3 text-center ${system === "cm" ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}><div className="text-xs text-[rgb(var(--fg-muted))]">Foot length</div><div className="text-lg font-semibold">{row.cm} cm</div></div>
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// Clothing Size Converter
// =====================================================================
type ClothingRow = { us: string; uk: string; eu: number; au: string };
const CLOTHING_WOMEN: ClothingRow[] = [
  { us: "0",  uk: "4",  eu: 32, au: "4"  },
  { us: "2",  uk: "6",  eu: 34, au: "6"  },
  { us: "4",  uk: "8",  eu: 36, au: "8"  },
  { us: "6",  uk: "10", eu: 38, au: "10" },
  { us: "8",  uk: "12", eu: 40, au: "12" },
  { us: "10", uk: "14", eu: 42, au: "14" },
  { us: "12", uk: "16", eu: 44, au: "16" },
  { us: "14", uk: "18", eu: 46, au: "18" },
  { us: "16", uk: "20", eu: 48, au: "20" },
];
const CLOTHING_MEN: ClothingRow[] = [
  { us: "XS / 34",  uk: "XS / 34",  eu: 44, au: "XS" },
  { us: "S / 36",   uk: "S / 36",   eu: 46, au: "S"  },
  { us: "M / 38",   uk: "M / 38",   eu: 48, au: "M"  },
  { us: "L / 40",   uk: "L / 40",   eu: 50, au: "L"  },
  { us: "XL / 42",  uk: "XL / 42",  eu: 52, au: "XL" },
  { us: "XXL / 44", uk: "XXL / 44", eu: 54, au: "XXL"},
];

export function ClothingSize({ tool }: Props) {
  const [gender, setGender] = useState<"women" | "men">("women");
  const [val, setVal] = useState("8");
  const [system, setSystem] = useState<"us" | "uk" | "eu" | "au">("us");
  const table = gender === "women" ? CLOTHING_WOMEN : CLOTHING_MEN;
  const row = useMemo(() => {
    if (!val) return null;
    const v = val.trim().toLowerCase();
    return table.find((r) => String(r[system]).toLowerCase() === v) ?? null;
  }, [val, system, table]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick women's or men's, then enter the size you know in the system you know. We look up the equivalent in the other systems.",
      formula: "Tabular lookup. Note: clothing sizing is far less standardized than shoe sizing — vanity sizing (especially in US women's wear) means a 'size 8' can differ by a couple of inches across brands.",
      examples: "US women's 8 = UK 12 = EU 40 = AU 12. Men's M = EU 48 = chest 38\".",
      faq: [{ q: "Are these sizes accurate?", a: "They're standard tables, but actual fit varies by brand. When in doubt, check the brand's own size chart." }],
    }}>
      <div className="flex gap-2 mb-3">
        {(["women", "men"] as const).map((g) => (
          <button key={g} onClick={() => { setGender(g); setVal(g === "women" ? "8" : "M / 38"); }} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${gender === g ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{g}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Size</label><input className="input" value={val} onChange={(e) => setVal(e.target.value)} /></div>
        <div><label className="label">In system</label>
          <select className="input" value={system} onChange={(e) => setSystem(e.target.value as any)}>
            <option value="us">US</option><option value="uk">UK</option><option value="eu">EU</option><option value="au">AU</option>
          </select>
        </div>
      </div>
      {row ? (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className={`rounded-xl border p-3 text-center ${system === "us" ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}><div className="text-xs text-[rgb(var(--fg-muted))]">US</div><div className="text-lg font-semibold">{row.us}</div></div>
          <div className={`rounded-xl border p-3 text-center ${system === "uk" ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}><div className="text-xs text-[rgb(var(--fg-muted))]">UK</div><div className="text-lg font-semibold">{row.uk}</div></div>
          <div className={`rounded-xl border p-3 text-center ${system === "eu" ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}><div className="text-xs text-[rgb(var(--fg-muted))]">EU</div><div className="text-lg font-semibold">{row.eu}</div></div>
          <div className={`rounded-xl border p-3 text-center ${system === "au" ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}><div className="text-xs text-[rgb(var(--fg-muted))]">AU</div><div className="text-lg font-semibold">{row.au}</div></div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[rgb(var(--fg-muted))]">No exact match — pick a value from a standard size chart.</p>
      )}
    </ToolPage>
  );
}
