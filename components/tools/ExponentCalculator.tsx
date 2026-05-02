"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function ExponentCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [base, setBase] = useState("2");
  const [exp, setExp] = useState("10");
  const r = useMemo(() => {
    const b = parseFloat(base), e = parseFloat(exp);
    if (!Number.isFinite(b) || !Number.isFinite(e)) return null;
    return Math.pow(b, e);
  }, [base, exp]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter a base and exponent. Negative and fractional exponents are supported.",
      formula: "base^exp. For fractional exponents, this is equivalent to a root: x^(1/n) = ⁿ√x. Negative exponents: x^−n = 1 / x^n.",
      examples: "2^10 = 1024. 10^−3 = 0.001. 16^0.5 = 4.",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label" htmlFor="eb">Base</label><input id="eb" className="input" value={base} onChange={(e) => setBase(e.target.value)} /></div>
        <div><label className="label" htmlFor="ee">Exponent</label><input id="ee" className="input" value={exp} onChange={(e) => setExp(e.target.value)} /></div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">{base}<sup>{exp}</sup></div>
        <div className="text-3xl font-bold tabular-nums break-all">{r != null ? Number(r.toPrecision(12)) : "—"}</div>
      </div>
    </ToolPage>
  );
}
