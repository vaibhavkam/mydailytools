"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

function gcd(a: number, b: number) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }

export default function GcfCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState("12, 18, 24");
  const r = useMemo(() => {
    const nums = input.split(/[, \n]+/).map(Number).filter((n) => Number.isFinite(n) && Number.isInteger(n));
    if (nums.length < 2) return null;
    return nums.reduce((a, b) => gcd(a, b));
  }, [input]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter two or more integers separated by commas, spaces, or new lines.",
      formula: "GCF (greatest common factor) is computed using Euclid's algorithm: gcd(a, b) = gcd(b, a mod b), repeated pairwise across the list.",
      examples: "GCF(12, 18) = 6. GCF(12, 18, 24) = 6. GCF(7, 11) = 1 (coprime).",
      faq: [{ q: "Same as GCD?", a: "Yes — 'greatest common factor' and 'greatest common divisor' are the same thing." }],
    }}>
      <label className="label" htmlFor="gcf">Numbers</label>
      <input id="gcf" className="input" value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">GCF</div>
        <div className="text-3xl font-bold tabular-nums">{r ?? "—"}</div>
      </div>
    </ToolPage>
  );
}
