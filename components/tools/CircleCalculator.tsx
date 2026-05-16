"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Field = "radius" | "diameter" | "circumference" | "area";

export default function CircleCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [field, setField] = useState<Field>("radius");
  const [v, setV] = useState("5");
  const r = useMemo(() => {
    const x = parseFloat(v);
    if (!Number.isFinite(x) || x < 0) return null;
    let radius: number;
    if (field === "radius") radius = x;
    else if (field === "diameter") radius = x / 2;
    else if (field === "circumference") radius = x / (2 * Math.PI);
    else radius = Math.sqrt(x / Math.PI);
    return {
      radius, diameter: radius * 2,
      circumference: 2 * Math.PI * radius,
      area: Math.PI * radius * radius,
    };
  }, [v, field]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter any one of radius, diameter, circumference, or area — the other three compute instantly.",
      formula: "C = 2πr. A = πr². d = 2r. r = √(A/π) when starting from area.",
      examples: "Radius 5 → diameter 10, circumference 31.416, area 78.54.",
      faq: [
        { q: "What is the relationship between radius and diameter?", a: "Diameter is exactly twice the radius. If you know one, you know the other. Radius is the distance from the center to the edge; diameter is the full width through the center." },
        { q: "How is circumference calculated from radius?", a: "Circumference = 2πr, where π ≈ 3.14159. For a circle with radius 5, the circumference is 2 × π × 5 ≈ 31.416." },
        { q: "How do I find the radius if I only know the area?", a: "Rearrange A = πr² to get r = √(A / π). Select 'area' as your input and type the area — the calculator does this automatically." },
        { q: "What units does this calculator use?", a: "The calculator is unit-agnostic. If you enter the radius in centimeters, the area comes out in cm² and the circumference in cm. Just be consistent with your inputs." },
      ],
    }}>
      <div className="flex flex-wrap gap-2 mb-3">
        {(["radius", "diameter", "circumference", "area"] as Field[]).map((f) => (
          <button key={f} onClick={() => setField(f)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${field === f ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{f}</button>
        ))}
      </div>
      <input className="input" value={v} onChange={(e) => setV(e.target.value)} />
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[["Radius", r.radius], ["Diameter", r.diameter], ["Circumference", r.circumference], ["Area", r.area]].map(([l, x]) => (
            <div key={l as string} className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">{l as string}</div><div className="text-lg font-semibold tabular-nums">{Number((x as number).toFixed(6))}</div></div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
