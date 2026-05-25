"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

export default function StandardDeviation({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState("2, 4, 4, 4, 5, 5, 7, 9");
  const r = useMemo(() => {
    const nums = input.split(/[, \n]+/).map(Number).filter(Number.isFinite);
    if (nums.length < 2) return null;
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const sqDev = nums.map((n) => (n - mean) ** 2).reduce((a, b) => a + b, 0);
    const variancePop = sqDev / nums.length;
    const varianceSample = sqDev / (nums.length - 1);
    return { mean, variancePop, varianceSample, sdPop: Math.sqrt(variancePop), sdSample: Math.sqrt(varianceSample), n: nums.length };
  }, [input]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste a list of numbers separated by commas, spaces, or new lines. Both population and sample standard deviation compute live.",
      formula: "Variance σ² = Σ(x − μ)² / N (population) or / (N−1) (sample, Bessel's correction). Standard deviation σ = √variance.",
      examples: "2, 4, 4, 4, 5, 5, 7, 9 → mean 5, σ_pop = 2, σ_sample ≈ 2.138.",
      faq: [{ q: "Population vs sample?", a: "Use sample (N−1) when you have a subset of a larger group; use population (N) when your data is the entire group." }],
    }}>
      <label className="label" htmlFor="sd">Numbers</label>
      <AutoTextarea id="sd" className="input min-h-[80px]" value={input} onChange={(e) => setInput(e.target.value)} />
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            ["Count", r.n], ["Mean", r.mean.toFixed(4)],
            ["σ (population)", r.sdPop.toFixed(4)], ["σ (sample)", r.sdSample.toFixed(4)],
            ["Variance (pop)", r.variancePop.toFixed(4)], ["Variance (sample)", r.varianceSample.toFixed(4)],
          ].map(([l, v]) => (
            <div key={l as string} className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">{l as string}</div><div className="text-lg font-semibold tabular-nums">{v as string}</div></div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
