"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Mode = "percentOf" | "isWhatPercent" | "percentChange";

export default function PercentageCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [mode, setMode] = useState<Mode>("percentOf");
  const [a, setA] = useState("20");
  const [b, setB] = useState("150");

  const result = useMemo(() => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (Number.isNaN(x) || Number.isNaN(y)) return null;
    switch (mode) {
      case "percentOf":      return { label: `${x}% of ${y}`, value: (x / 100) * y };
      case "isWhatPercent":  return { label: `${x} is what % of ${y}`, value: y === 0 ? NaN : (x / y) * 100, suffix: "%" };
      case "percentChange":  return { label: `% change from ${x} to ${y}`, value: x === 0 ? NaN : ((y - x) / Math.abs(x)) * 100, suffix: "%" };
    }
  }, [mode, a, b]);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo:
          "Pick a calculation type, enter your numbers, and the result updates instantly. Use 'percent of' to find a portion of a number, 'is what percent of' to find the ratio, and 'percent change' to compare two values over time.",
        formula:
          "Percent of: (X ÷ 100) × Y. Is what percent of: (X ÷ Y) × 100. Percent change: ((New − Old) ÷ |Old|) × 100. Negative percent change indicates a decrease.",
        examples:
          "20% of 150 is 30. 45 is 60% of 75. The percent change from 80 to 100 is +25%.",
        faq: [
          { q: "What's the difference between the three modes?", a: "'X% of Y' finds a portion (e.g. 20% of 150 = 30). 'X is what % of Y' finds the ratio (e.g. 30 is 20% of 150). '% change' compares two values (e.g. from 80 to 100 is +25%)." },
          { q: "How is percent change calculated?", a: "Formula: ((New − Old) ÷ |Old|) × 100. Dividing by the absolute value of Old keeps the sign meaningful even when the starting value is negative." },
          { q: "What does a negative percent change mean?", a: "A negative result means the value decreased. For example, a change from 100 to 75 is −25% — a 25% decrease." },
          { q: "Is my data sent to a server?", a: "No. Every calculation runs locally in your browser. Nothing leaves your device." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Calculation type">
          {[
            { id: "percentOf", label: "X% of Y" },
            { id: "isWhatPercent", label: "X is what % of Y" },
            { id: "percentChange", label: "% change X → Y" },
          ].map((opt) => (
            <button
              key={opt.id}
              role="tab"
              aria-selected={mode === opt.id}
              onClick={() => setMode(opt.id as Mode)}
              className={`min-tap rounded-xl px-3 py-2 text-sm font-medium transition ${
                mode === opt.id
                  ? "bg-brand-gradient text-white shadow-glow"
                  : "btn-ghost"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="pa">X</label>
            <input id="pa" inputMode="decimal" className="input" value={a} onChange={(e) => setA(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="pb">Y</label>
            <input id="pb" inputMode="decimal" className="input" value={b} onChange={(e) => setB(e.target.value)} />
          </div>
        </div>

        <div aria-live="polite" className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/60 p-4">
          <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">{result?.label ?? "Result"}</div>
          <div className="mt-1 text-3xl font-bold">
            {result && Number.isFinite(result.value)
              ? `${formatNum(result.value)}${"suffix" in result && result.suffix ? result.suffix : ""}`
              : "—"}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

function formatNum(n: number) {
  return Math.abs(n) < 1e-6 ? "0" : Number(n.toFixed(6)).toString();
}
