"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function ProbabilityCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [pa, setPa] = useState("0.5");
  const [pb, setPb] = useState("0.4");
  const r = useMemo(() => {
    const a = parseFloat(pa), b = parseFloat(pb);
    if (![a, b].every((x) => Number.isFinite(x) && x >= 0 && x <= 1)) return null;
    return {
      andIndep: a * b,
      orIndep: a + b - a * b,
      notA: 1 - a, notB: 1 - b,
      neither: (1 - a) * (1 - b),
      onlyA: a * (1 - b),
    };
  }, [pa, pb]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter the probabilities of two independent events as decimals between 0 and 1.",
      formula: "Independent events: P(A∩B) = P(A)·P(B). P(A∪B) = P(A)+P(B)−P(A∩B). P(¬A) = 1−P(A).",
      examples: "P(A)=0.5, P(B)=0.4 → P(both) = 0.20, P(either) = 0.70, P(neither) = 0.30.",
      faq: [{ q: "What if A and B are dependent?", a: "These formulas assume independence. For dependent events you need conditional probabilities." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label" htmlFor="pra">P(A)</label><input id="pra" className="input" value={pa} onChange={(e) => setPa(e.target.value)} /></div>
        <div><label className="label" htmlFor="prb">P(B)</label><input id="prb" className="input" value={pb} onChange={(e) => setPb(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            ["P(A and B)", r.andIndep], ["P(A or B)", r.orIndep], ["P(only A)", r.onlyA],
            ["P(¬A)", r.notA], ["P(¬B)", r.notB], ["P(neither)", r.neither],
          ].map(([l, v]) => (
            <div key={l as string} className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">{l as string}</div><div className="text-lg font-semibold tabular-nums">{(v as number).toFixed(4)}</div></div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
