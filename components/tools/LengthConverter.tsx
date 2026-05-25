"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

// Conversion factors to meters (the canonical base unit).
const UNITS: Record<string, { label: string; toMeter: number }> = {
  mm: { label: "Millimeters (mm)", toMeter: 0.001 },
  cm: { label: "Centimeters (cm)", toMeter: 0.01 },
  m: { label: "Meters (m)", toMeter: 1 },
  km: { label: "Kilometers (km)", toMeter: 1000 },
  in: { label: "Inches (in)", toMeter: 0.0254 },
  ft: { label: "Feet (ft)", toMeter: 0.3048 },
  yd: { label: "Yards (yd)", toMeter: 0.9144 },
  mi: { label: "Miles (mi)", toMeter: 1609.344 },
  nmi: { label: "Nautical miles", toMeter: 1852 },
};

export default function LengthConverter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState("m");

  const results = useMemo(() => {
    const n = parseFloat(value);
    if (Number.isNaN(n)) return null;
    const meters = n * UNITS[from].toMeter;
    return Object.entries(UNITS).map(([k, u]) => ({ key: k, label: u.label, value: meters / u.toMeter }));
  }, [value, from]);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo:
          "Enter a value, pick the unit it represents, and every other unit updates simultaneously. Useful for travel, construction, or anywhere you need to convert between metric and imperial.",
        formula:
          "All units convert through meters as the base. Each unit has a constant factor (e.g., 1 ft = 0.3048 m). Conversions are exact for SI units and use the international yard/foot agreement of 1959.",
        examples:
          "100 m = 328.084 ft = 109.361 yd = 0.0621 mi. 1 mile = 1609.344 m = 1.609 km. 1 inch = 25.4 mm exactly.",
        faq: [
          { q: "How many feet are in a meter?", a: "1 meter = 3.28084 feet. Conversely, 1 foot = 0.3048 meters exactly — this has been the international definition since 1959." },
          { q: "How many kilometers are in a mile?", a: "1 mile = 1.60934 km. A quick mental approximation: multiply miles by 1.6 to get km, or divide km by 1.6 to get miles." },
          { q: "What's a nautical mile?", a: "1 nautical mile = 1852 meters exactly. It corresponds to 1 arcminute of latitude and is used in maritime and aviation navigation." },
          { q: "Why is the value not exactly equal when I round-trip?", a: "Floating-point arithmetic introduces tiny rounding errors. We display 6 significant digits; the underlying value may vary in the last few decimal places." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <div>
            <label className="label" htmlFor="lc-val">Value</label>
            <input id="lc-val" inputMode="decimal" className="input" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="lc-from">From</label>
            <select id="lc-from" className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
              {Object.entries(UNITS).map(([k, u]) => <option key={k} value={k}>{u.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {results?.map((r) => (
            <div key={r.key} className={`rounded-xl border px-3 py-2.5 text-sm ${r.key === from ? "border-brand-500/60 bg-brand-50 dark:bg-brand-950/40" : "border-[rgb(var(--border))]"}`}>
              <div className="text-xs text-[rgb(var(--fg-muted))]">{r.label}</div>
              <div className="font-mono">{Number(r.value.toPrecision(8))}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
