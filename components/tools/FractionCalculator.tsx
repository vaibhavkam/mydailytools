"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

function gcd(a: number, b: number): number { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
function simplify(n: number, d: number) { const g = gcd(n, d) || 1; return [n / g, d / g] as const; }

export default function FractionCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [a, setA] = useState({ n: "1", d: "2" });
  const [b, setB] = useState({ n: "1", d: "3" });
  const [op, setOp] = useState<"+" | "-" | "*" | "/">("+");

  const r = useMemo(() => {
    const an = parseInt(a.n), ad = parseInt(a.d), bn = parseInt(b.n), bd = parseInt(b.d);
    if (![an, ad, bn, bd].every(Number.isFinite) || ad === 0 || bd === 0) return null;
    let n: number, d: number;
    switch (op) {
      case "+": n = an * bd + bn * ad; d = ad * bd; break;
      case "-": n = an * bd - bn * ad; d = ad * bd; break;
      case "*": n = an * bn; d = ad * bd; break;
      case "/": n = an * bd; d = ad * bn; break;
    }
    if (d === 0) return null;
    if (d < 0) { n = -n; d = -d; }
    const [sn, sd] = simplify(n, d);
    return { n: sn, d: sd, decimal: sn / sd };
  }, [a, b, op]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter two fractions and an operation. The result is automatically reduced to lowest terms and shown as both a fraction and a decimal.",
      formula: "Add/subtract: cross-multiply numerators by the other denominator, common denominator = product. Multiply: multiply across. Divide: multiply by the reciprocal. Simplify by dividing both numerator and denominator by their GCD.",
      examples: "1/2 + 1/3 = 5/6. 3/4 × 2/3 = 1/2. 5/8 ÷ 1/4 = 5/2.",
      faq: [{ q: "Negative fractions?", a: "Put the minus sign on the numerator. The result will normalize sign onto the numerator." }],
    }}>
      <div className="grid gap-3 items-center" style={{ gridTemplateColumns: "1fr auto 1fr auto" }}>
        <div className="grid grid-cols-2 gap-1">
          <input className="input text-center" value={a.n} onChange={(e) => setA({ ...a, n: e.target.value })} aria-label="Fraction A numerator" />
          <input className="input text-center" value={a.d} onChange={(e) => setA({ ...a, d: e.target.value })} aria-label="Fraction A denominator" />
        </div>
        <select className="input !w-auto" value={op} onChange={(e) => setOp(e.target.value as any)} aria-label="Operation">
          <option>+</option><option>-</option><option>*</option><option>/</option>
        </select>
        <div className="grid grid-cols-2 gap-1">
          <input className="input text-center" value={b.n} onChange={(e) => setB({ ...b, n: e.target.value })} aria-label="Fraction B numerator" />
          <input className="input text-center" value={b.d} onChange={(e) => setB({ ...b, d: e.target.value })} aria-label="Fraction B denominator" />
        </div>
        <span className="font-bold">=</span>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-3xl font-bold tabular-nums">{r ? `${r.n}/${r.d}` : "—"}</div>
        <div className="text-sm text-[rgb(var(--fg-muted))] mt-1">{r ? `≈ ${r.decimal.toFixed(6)}` : ""}</div>
      </div>
    </ToolPage>
  );
}
