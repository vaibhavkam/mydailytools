"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Type = "linear" | "quadratic";

export default function EquationSolver({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [type, setType] = useState<Type>("quadratic");
  const [a, setA] = useState("1"); const [b, setB] = useState("-3"); const [c, setC] = useState("2");

  const r = useMemo(() => {
    const A = parseFloat(a), B = parseFloat(b), C = parseFloat(c);
    if (type === "linear") {
      // ax + b = 0
      if (!Number.isFinite(A) || !Number.isFinite(B)) return null;
      if (A === 0) return { roots: B === 0 ? "All real numbers" : "No solution" };
      return { roots: [-B / A] };
    }
    if (![A, B, C].every(Number.isFinite)) return null;
    if (A === 0) return { roots: B === 0 ? "Degenerate" : [-C / B] };
    const disc = B * B - 4 * A * C;
    if (disc > 0) {
      const s = Math.sqrt(disc);
      return { roots: [(-B + s) / (2 * A), (-B - s) / (2 * A)], disc };
    }
    if (disc === 0) return { roots: [-B / (2 * A)], disc };
    const s = Math.sqrt(-disc);
    return { roots: [`${(-B / (2 * A)).toFixed(6)} + ${(s / (2 * A)).toFixed(6)}i`, `${(-B / (2 * A)).toFixed(6)} − ${(s / (2 * A)).toFixed(6)}i`], disc };
  }, [type, a, b, c]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick linear (ax + b = 0) or quadratic (ax² + bx + c = 0) and enter the coefficients.",
      formula: "Quadratic: x = (−b ± √(b² − 4ac)) / 2a. Discriminant > 0: two real roots. = 0: one (repeated) real root. < 0: two complex conjugate roots.",
      examples: "x² − 3x + 2 = 0 → x = 1, 2. 2x + 6 = 0 → x = −3. x² + 1 = 0 → x = ±i.",
      faq: [{ q: "Cubics or higher?", a: "Not yet — only linear and quadratic. Roots of cubics are messy in closed form." }],
    }}>
      <div className="flex gap-2 mb-4">
        {(["linear", "quadratic"] as Type[]).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${type === t ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{t}</button>
        ))}
      </div>
      {type === "linear" ? (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">a</label><input className="input" value={a} onChange={(e) => setA(e.target.value)} /></div>
          <div><label className="label">b</label><input className="input" value={b} onChange={(e) => setB(e.target.value)} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">a</label><input className="input" value={a} onChange={(e) => setA(e.target.value)} /></div>
          <div><label className="label">b</label><input className="input" value={b} onChange={(e) => setB(e.target.value)} /></div>
          <div><label className="label">c</label><input className="input" value={c} onChange={(e) => setC(e.target.value)} /></div>
        </div>
      )}
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">Roots</div>
        <div className="text-xl font-mono break-all">{
          !r ? "—" : Array.isArray(r.roots) ? r.roots.map((x: any) => typeof x === "number" ? Number(x.toFixed(8)) : x).join(", ") : r.roots
        }</div>
      </div>
    </ToolPage>
  );
}
