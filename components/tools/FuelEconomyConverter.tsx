"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

// Fuel economy is inverse-proportional, not linear, so we can't use the generic
// factor-based UnitConverter. We canonicalize through L/100km.

type Unit = "l100" | "kml" | "mpgUS" | "mpgUK";

function toL100(v: number, u: Unit): number {
  switch (u) {
    case "l100": return v;
    case "kml": return 100 / v;
    case "mpgUS": return 235.214583 / v;
    case "mpgUK": return 282.480936 / v;
  }
}
function fromL100(l100: number, u: Unit): number {
  switch (u) {
    case "l100": return l100;
    case "kml": return 100 / l100;
    case "mpgUS": return 235.214583 / l100;
    case "mpgUK": return 282.480936 / l100;
  }
}

const labels: Record<Unit, string> = {
  l100: "L/100 km",
  kml: "km/L",
  mpgUS: "MPG (US)",
  mpgUK: "MPG (Imperial)",
};

export default function FuelEconomyConverter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [value, setValue] = useState("30");
  const [from, setFrom] = useState<Unit>("mpgUS");
  const results = useMemo(() => {
    const n = parseFloat(value);
    if (!Number.isFinite(n) || n <= 0) return null;
    const l100 = toL100(n, from);
    return (Object.keys(labels) as Unit[]).map((u) => ({ u, label: labels[u], value: fromL100(l100, u) }));
  }, [value, from]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick MPG, km/L, or L/100km, enter a value, and the rest convert simultaneously.",
      formula: "L/100km = 100 / (km/L) = 235.21 / MPG (US) = 282.48 / MPG (UK). Lower L/100km is better — it's how much fuel you burn per fixed distance.",
      examples: "30 MPG (US) ≈ 7.84 L/100km ≈ 12.75 km/L. 5 L/100km ≈ 47 MPG (US).",
      faq: [{ q: "Why MPG and L/100km are not linearly related?", a: "Fuel-per-distance and distance-per-fuel are reciprocals. Doubling MPG doesn't halve L/100km perfectly past zero." }],
    }}>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3">
        <div><label className="label">Value</label><input className="input" value={value} onChange={(e) => setValue(e.target.value)} /></div>
        <div><label className="label">Unit</label>
          <select className="input" value={from} onChange={(e) => setFrom(e.target.value as Unit)}>
            {(Object.keys(labels) as Unit[]).map((u) => <option key={u} value={u}>{labels[u]}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        {results?.map((r) => (
          <div key={r.u} className={`rounded-xl border px-3 py-2.5 text-sm ${r.u === from ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}>
            <div className="text-xs text-[rgb(var(--fg-muted))]">{r.label}</div>
            <div className="font-mono">{Number(r.value.toPrecision(6))}</div>
          </div>
        ))}
      </div>
    </ToolPage>
  );
}
