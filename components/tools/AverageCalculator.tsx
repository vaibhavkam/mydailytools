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
      howTo: "Type or paste a list of numbers separated by commas, spaces, or new lines. Mean, median, mode, sum, min, max, and range all update instantly. Works for any size dataset — grades, scores, measurements, or financial figures.",
      formula: "Mean (average) = sum of all values ÷ count. Median = middle value when sorted (or average of the two middle values for even-length sets). Mode = value(s) appearing most often. Range = max − min.",
      examples: "Test scores 72, 85, 90, 90, 95 → mean 86.4, median 90, mode 90, range 23. Sales figures 1200, 1450, 980, 2100, 1450 → mean 1436, median 1450, mode 1450.",
      faq: [
        { q: "What is the difference between mean, median, and mode?", a: "Mean (arithmetic average) is the sum divided by count — sensitive to outliers. Median is the middle value when sorted — robust to extreme values. Mode is the most frequent value — useful for categorical or discrete data. For skewed data like salaries or house prices, median is usually more meaningful than mean." },
        { q: "When should I use median instead of mean?", a: "Use median when your data has outliers or is skewed. For example, average household income uses median because a few very high earners would inflate the mean and misrepresent the typical household." },
        { q: "Why is there no mode shown?", a: "Mode is only reported when at least one value appears more than once. If all values are unique, there is no mode by definition." },
        { q: "How do I enter my numbers?", a: "Separate numbers with commas, spaces, or newlines — any combination works. Negative numbers and decimals are supported. Duplicates are counted as separate data points." },
        { q: "What is the range?", a: "Range = maximum − minimum. It is the simplest measure of spread. For a more robust measure of spread, consider standard deviation (which accounts for all values, not just the extremes)." },
        { q: "Can I calculate the average of percentages?", a: "You can average percentages directly if each percentage is based on the same sample size. If sample sizes differ, use a weighted average instead — multiply each percentage by its sample size, sum those, then divide by the total sample size." },
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
