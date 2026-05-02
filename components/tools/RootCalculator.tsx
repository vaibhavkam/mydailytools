"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function RootCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [x, setX] = useState("64");
  const [n, setN] = useState("3");
  const r = useMemo(() => {
    const a = parseFloat(x), b = parseFloat(n);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    if (a < 0 && b % 2 === 0) return { val: NaN, msg: "Even root of a negative is not real." };
    const sign = a < 0 ? -1 : 1;
    const val = sign * Math.pow(Math.abs(a), 1 / b);
    return { val, msg: null as string | null };
  }, [x, n]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter the radicand (the number under the root) and the root degree. Square root is degree 2, cube root is 3, and so on.",
      formula: "ⁿ√x = x^(1/n). For negative radicands with odd n, the real root is −|x|^(1/n).",
      examples: "²√64 = 8. ³√64 = 4. ⁴√16 = 2. ³√−27 = −3.",
      faq: [{ q: "Why does even root of negative show error?", a: "It's complex — there's no real number whose even power is negative." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label" htmlFor="rx">Radicand (x)</label><input id="rx" className="input" value={x} onChange={(e) => setX(e.target.value)} /></div>
        <div><label className="label" htmlFor="rn">Root (n)</label><input id="rn" className="input" value={n} onChange={(e) => setN(e.target.value)} /></div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">{n}√{x}</div>
        <div className="text-3xl font-bold tabular-nums">{r ? (Number.isFinite(r.val) ? Number(r.val.toFixed(8)) : r.msg) : "—"}</div>
      </div>
    </ToolPage>
  );
}
