"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import type { ToolContent } from "../ToolPage";

// Generic factor-based converter. Each unit declares its conversion factor to a
// canonical base unit; the converter routes "from" → base → all others.
// Suitable for any linear unit family (everything except temperature).

export type UnitDef = { key: string; label: string; toBase: number };

export default function UnitConverter({
  tool,
  units,
  defaultFrom,
  content,
}: {
  tool: Tool & { categorySlug: string; categoryName: string };
  units: UnitDef[];
  defaultFrom: string;
  content: ToolContent;
}) {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(defaultFrom);

  const results = useMemo(() => {
    const n = parseFloat(value);
    if (!Number.isFinite(n)) return null;
    const fromU = units.find((u) => u.key === from);
    if (!fromU) return null;
    const base = n * fromU.toBase;
    return units.map((u) => ({ ...u, value: base / u.toBase }));
  }, [value, from, units]);

  return (
    <ToolPage tool={tool} content={content}>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3">
        <div><label className="label">Value</label><input inputMode="decimal" className="input" value={value} onChange={(e) => setValue(e.target.value)} /></div>
        <div><label className="label">From</label>
          <select className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
            {units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        {results?.map((r) => (
          <div key={r.key} className={`rounded-xl border px-3 py-2.5 text-sm ${r.key === from ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}>
            <div className="text-xs text-[rgb(var(--fg-muted))]">{r.label}</div>
            <div className="font-mono">{Number(r.value.toPrecision(8))}</div>
          </div>
        ))}
      </div>
    </ToolPage>
  );
}
