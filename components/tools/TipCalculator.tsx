"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { useLocale } from "@/lib/locale";

export default function TipCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [bill, setBill] = useState("60");
  const [pct, setPct] = useState(18);
  const [people, setPeople] = useState(2);

  const r = useMemo(() => {
    const b = parseFloat(bill);
    if (!b || people < 1) return null;
    const tip = (b * pct) / 100;
    const total = b + tip;
    return { tip, total, perPerson: total / people, tipPerPerson: tip / people };
  }, [bill, pct, people]);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Enter the pre-tax bill, choose a tip percentage, and split among any number of people. Use the quick presets or drag the slider for fine-grained adjustment.",
        formula: "Tip = bill × (tip% ÷ 100). Total = bill + tip. Per person = total ÷ people.",
        examples: "A 60 bill with 18% tip totals 70.80 — split between 2 people, that's 35.40 each.",
        faq: [
          { q: "Tip on pre-tax or post-tax?", a: "Either is acceptable. Pre-tax (what we use here) is slightly more common in the U.S. service industry." },
          { q: "Standard U.S. tip?", a: "15% is standard for adequate service, 18–20% for good service, 20%+ for exceptional. Bartenders typically get $1–2 per drink." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="bill">Bill total ({sym})</label>
            <input id="bill" inputMode="decimal" className="input" value={bill} onChange={(e) => setBill(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="people">People</label>
            <input id="people" inputMode="numeric" className="input" value={people} min={1} onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label !mb-0" htmlFor="pct">Tip: {pct}%</label>
            <div className="flex gap-1">
              {[10, 15, 18, 20, 25].map((p) => (
                <button key={p} onClick={() => setPct(p)} className={`text-xs px-2 py-1 rounded-md ${pct === p ? "bg-brand-600 text-white" : "btn-ghost"}`}>{p}%</button>
              ))}
            </div>
          </div>
          <input id="pct" type="range" min={0} max={40} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="w-full mt-2 accent-brand-600" />
        </div>

        {r && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-live="polite">
            {[
              { label: "Tip", value: fmt(r.tip) },
              { label: "Total", value: fmt(r.total) },
              { label: "Tip / person", value: fmt(r.tipPerPerson) },
              { label: "Total / person", value: fmt(r.perPerson) },
            ].map((t) => (
              <div key={t.label} className="rounded-xl border border-[rgb(var(--border))] p-3 text-center">
                <div className="text-xs text-[rgb(var(--fg-muted))]">{t.label}</div>
                <div className="text-lg font-semibold tabular-nums">{t.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPage>
  );
}
