"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function AverageCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState("5, 10, 12, 15, 20, 20, 25");
  const r = useMemo(() => {
    const nums = input.split(/[, \n]+/).map(Number).filter(Number.isFinite);
    if (!nums.length) return null;
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const counts = new Map<number, number>();
    nums.forEach((n) => counts.set(n, (counts.get(n) ?? 0) + 1));
    const max = Math.max(...counts.values());
    const mode = max > 1 ? [...counts.entries()].filter(([, c]) => c === max).map(([n]) => n) : [];
    const min = sorted[0], maxV = sorted[sorted.length - 1];
    return { mean, median, mode, min, max: maxV, sum: mean * nums.length, count: nums.length };
  }, [input]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter a list of numbers. Mean, median, mode, sum, min, and max compute live.",
      formula: "Mean = Σx / n. Median = middle value (or average of two middles). Mode = most frequent value (none if all values are unique).",
      examples: "5, 10, 12, 15, 20, 20, 25 → mean 15.29, median 15, mode 20.",
      faq: [
        { q: "What is the difference between mean, median, and mode?", a: "Mean is the sum divided by count. Median is the middle value when sorted. Mode is the most frequently occurring value. Use median when data has outliers that would skew the mean." },
        { q: "Why is there no mode shown?", a: "Mode is only reported when at least one value appears more than once. If all values are unique, no mode exists." },
        { q: "How do I enter my numbers?", a: "Separate numbers with commas, spaces, or newlines — any combination works. Duplicates are counted as separate data points." },
        { q: "What is the range?", a: "Range is the difference between the maximum and minimum values. It gives a simple measure of how spread out the data is." },
      ],
    }}>
      <label className="label" htmlFor="avg">Numbers</label>
      <textarea id="avg" className="input min-h-[80px]" value={input} onChange={(e) => setInput(e.target.value)} />
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ["Mean", r.mean.toFixed(4)],
            ["Median", r.median.toString()],
            ["Mode", r.mode.length ? r.mode.join(", ") : "—"],
            ["Count", r.count.toString()],
            ["Sum", r.sum.toFixed(4)],
            ["Min", r.min.toString()],
            ["Max", r.max.toString()],
            ["Range", (r.max - r.min).toString()],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-[rgb(var(--border))] p-3 text-center">
              <div className="text-xs text-[rgb(var(--fg-muted))]">{l}</div>
              <div className="text-lg font-semibold tabular-nums">{v}</div>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
