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
      faq: [
        { q: "What does a negative exponent mean?", a: "x^−n equals 1 / x^n. For example, 2^−3 = 1/8 = 0.125. Negative exponents represent reciprocals." },
        { q: "What does a fractional exponent mean?", a: "A fractional exponent is a root: x^(1/n) equals the nth root of x. So 16^0.5 = √16 = 4, and 27^(1/3) = ∛27 = 3." },
        { q: "What is anything to the power of 0?", a: "Any non-zero number raised to the power of 0 equals 1. This follows from the rule x^n / x^n = x^(n−n) = x^0 = 1." },
        { q: "Can I enter a negative base?", a: "Yes. A negative base with an integer exponent works normally (e.g. (−2)^3 = −8). With fractional exponents, the result may be complex (not real), so the calculator may return NaN." },
      ],
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
