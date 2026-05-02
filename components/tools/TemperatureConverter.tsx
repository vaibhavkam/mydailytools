"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Unit = "C" | "F" | "K";

const labels: Record<Unit, string> = { C: "Celsius (°C)", F: "Fahrenheit (°F)", K: "Kelvin (K)" };

function toCelsius(value: number, from: Unit) {
  if (from === "C") return value;
  if (from === "F") return ((value - 32) * 5) / 9;
  return value - 273.15;
}
function fromCelsius(c: number, to: Unit) {
  if (to === "C") return c;
  if (to === "F") return (c * 9) / 5 + 32;
  return c + 273.15;
}

export default function TemperatureConverter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState<Unit>("C");

  const results = useMemo(() => {
    const n = parseFloat(value);
    if (Number.isNaN(n)) return null;
    const c = toCelsius(n, from);
    return (Object.keys(labels) as Unit[]).map((u) => ({ u, label: labels[u], value: fromCelsius(c, u) }));
  }, [value, from]);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Enter any temperature, pick the input unit, and the other two units update instantly. Supports Celsius, Fahrenheit, and Kelvin — the three units used in 99%+ of everyday and scientific contexts.",
        formula: "C → F: F = C × 9/5 + 32. F → C: C = (F − 32) × 5/9. C → K: K = C + 273.15. K is an absolute scale starting at absolute zero (−273.15 °C).",
        examples: "0 °C = 32 °F = 273.15 K (water freezes). 100 °C = 212 °F = 373.15 K (water boils at sea level). −40° is the same number in C and F — they cross there.",
        faq: [
          { q: "Why does Kelvin not use a degree symbol?", a: "Kelvin is an SI base unit (like the metre or kilogram), not a degree scale. The convention since 1967 is to write '300 K', not '300 °K'." },
          { q: "Is Rankine supported?", a: "Not yet. File a request if you need it — Rankine is rare outside U.S. engineering contexts." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <div>
            <label className="label" htmlFor="t-val">Value</label>
            <input id="t-val" inputMode="decimal" className="input" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="t-from">Unit</label>
            <select id="t-from" className="input" value={from} onChange={(e) => setFrom(e.target.value as Unit)}>
              {(Object.keys(labels) as Unit[]).map((u) => <option key={u} value={u}>{labels[u]}</option>)}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {results?.map((r) => (
            <div key={r.u} className={`rounded-xl border px-3 py-3 text-center ${r.u === from ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}>
              <div className="text-xs text-[rgb(var(--fg-muted))]">{r.label}</div>
              <div className="text-xl font-semibold tabular-nums">{Number(r.value.toFixed(4))}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
