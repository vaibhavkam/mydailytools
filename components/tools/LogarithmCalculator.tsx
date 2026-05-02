"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function LogarithmCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [x, setX] = useState("1000");
  const [base, setBase] = useState("10");
  const r = useMemo(() => {
    const a = parseFloat(x), b = parseFloat(base);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0 || b === 1) return null;
    return Math.log(a) / Math.log(b);
  }, [x, base]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter the value and the logarithm base. Common bases: 10 (log), e (ln ≈ 2.71828), 2 (used in CS for entropy).",
      formula: "log_b(x) = ln(x) ÷ ln(b). Defined only for x > 0 and b > 0, b ≠ 1.",
      examples: "log₁₀(1000) = 3. ln(e) = 1. log₂(8) = 3.",
      faq: [{ q: "Why can't base be 1?", a: "log_1(x) is undefined — 1 to any power is 1, so it can't equal x except when x = 1." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label" htmlFor="lx">Value (x)</label><input id="lx" className="input" value={x} onChange={(e) => setX(e.target.value)} /></div>
        <div><label className="label" htmlFor="lb">Base (b)</label>
          <input id="lb" className="input" value={base} onChange={(e) => setBase(e.target.value)} list="logbases" />
          <datalist id="logbases"><option value="10" /><option value="2.718281828459045">e</option><option value="2" /></datalist>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">log<sub>{base}</sub>({x})</div>
        <div className="text-3xl font-bold tabular-nums">{r != null ? Number(r.toFixed(10)) : "—"}</div>
      </div>
    </ToolPage>
  );
}
