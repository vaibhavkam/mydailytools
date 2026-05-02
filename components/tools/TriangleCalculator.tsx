"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function TriangleCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [a, setA] = useState("3"); const [b, setB] = useState("4"); const [c, setC] = useState("5");
  const r = useMemo(() => {
    const x = parseFloat(a), y = parseFloat(b), z = parseFloat(c);
    if (![x, y, z].every((v) => v > 0)) return null;
    if (x + y <= z || x + z <= y || y + z <= x) return { error: "Not a valid triangle (triangle inequality)" };
    const s = (x + y + z) / 2;
    const area = Math.sqrt(s * (s - x) * (s - y) * (s - z));
    const A = Math.acos((y * y + z * z - x * x) / (2 * y * z));
    const B = Math.acos((x * x + z * z - y * y) / (2 * x * z));
    const C = Math.PI - A - B;
    return { area, perimeter: x + y + z, A: A * 180 / Math.PI, B: B * 180 / Math.PI, C: C * 180 / Math.PI };
  }, [a, b, c]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter three side lengths. We compute area, perimeter, and the three interior angles.",
      formula: "Area: Heron's formula, A = √(s(s−a)(s−b)(s−c)) where s = (a+b+c)/2. Angles: law of cosines, e.g. cos(A) = (b² + c² − a²) / (2bc).",
      examples: "Sides 3, 4, 5 → area 6, angles 36.87°, 53.13°, 90° (right triangle).",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">a</label><input className="input" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <div><label className="label">b</label><input className="input" value={b} onChange={(e) => setB(e.target.value)} /></div>
        <div><label className="label">c</label><input className="input" value={c} onChange={(e) => setC(e.target.value)} /></div>
      </div>
      {r && ("error" in r ? <p className="mt-3 text-sm text-red-600">{r.error}</p> : (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[["Area", r.area], ["Perimeter", r.perimeter], ["∠A", r.A.toFixed(3) + "°"], ["∠B", r.B.toFixed(3) + "°"], ["∠C", r.C.toFixed(3) + "°"]].map(([l, v]) => (
            <div key={l as string} className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">{l as string}</div><div className="text-lg font-semibold tabular-nums">{typeof v === "number" ? Number(v.toFixed(4)) : v as string}</div></div>
          ))}
        </div>
      ))}
    </ToolPage>
  );
}
