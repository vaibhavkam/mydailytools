"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function AntilogCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [x, setX] = useState("3");
  const [base, setBase] = useState("10");
  const r = useMemo(() => {
    const a = parseFloat(x), b = parseFloat(base);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    return Math.pow(b, a);
  }, [x, base]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Antilog is the inverse of log: given the log of a number, find the original number.",
      formula: "antilog_b(x) = b^x.",
      examples: "antilog₁₀(3) = 1000. antilog_e(1) = 2.718…",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label" htmlFor="ax">Value (x)</label><input id="ax" className="input" value={x} onChange={(e) => setX(e.target.value)} /></div>
        <div><label className="label" htmlFor="ab">Base (b)</label><input id="ab" className="input" value={base} onChange={(e) => setBase(e.target.value)} /></div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">{base}<sup>{x}</sup></div>
        <div className="text-3xl font-bold tabular-nums break-all">{r != null ? Number(r.toPrecision(12)) : "—"}</div>
      </div>
    </ToolPage>
  );
}
