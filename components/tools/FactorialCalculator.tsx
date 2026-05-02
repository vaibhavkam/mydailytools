"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

function factorial(n: number): bigint {
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r;
}

export default function FactorialCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [n, setN] = useState("12");
  const r = useMemo(() => {
    const x = parseInt(n);
    if (!Number.isFinite(x) || x < 0 || x > 1000) return null;
    return factorial(x).toString();
  }, [n]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter a non-negative integer. We compute n! using bigint arithmetic so even 100! returns the exact value (158 digits).",
      formula: "n! = n × (n−1) × … × 2 × 1, with 0! defined as 1.",
      examples: "5! = 120. 10! = 3,628,800. 20! ≈ 2.43 × 10¹⁸.",
      faq: [{ q: "Maximum n?", a: "We cap at 1000 to keep the page responsive — larger values are computable but the result becomes thousands of digits." }],
    }}>
      <label className="label" htmlFor="fn">n</label>
      <input id="fn" className="input" inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} />
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">{n}!</div>
        <div className="text-lg font-mono tabular-nums break-all">{r ?? "—"}</div>
      </div>
    </ToolPage>
  );
}
