"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

function fact(n: bigint): bigint { let r = 1n; for (let i = 2n; i <= n; i++) r *= i; return r; }

export default function PermutationCombination({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [n, setN] = useState("10");
  const [r, setR] = useState("3");
  const out = useMemo(() => {
    const N = parseInt(n), R = parseInt(r);
    if (!Number.isFinite(N) || !Number.isFinite(R) || R > N || N < 0 || R < 0 || N > 200) return null;
    const Nb = BigInt(N), Rb = BigInt(R);
    const nPr = fact(Nb) / fact(Nb - Rb);
    const nCr = nPr / fact(Rb);
    return { nPr: nPr.toString(), nCr: nCr.toString() };
  }, [n, r]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter total items n and the selection size r (0 ≤ r ≤ n).",
      formula: "Permutations: nPr = n! ÷ (n−r)! (order matters). Combinations: nCr = n! ÷ (r! × (n−r)!) (order doesn't).",
      examples: "10P3 = 720, 10C3 = 120. 5C2 = 10 (the number of pairs in a group of 5).",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label" htmlFor="pn">n</label><input id="pn" className="input" value={n} onChange={(e) => setN(e.target.value)} /></div>
        <div><label className="label" htmlFor="pr">r</label><input id="pr" className="input" value={r} onChange={(e) => setR(e.target.value)} /></div>
      </div>
      {out && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-3"><div className="text-xs text-brand-700 dark:text-brand-300">Permutations (nPr)</div><div className="text-2xl font-bold font-mono break-all">{out.nPr}</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Combinations (nCr)</div><div className="text-2xl font-bold font-mono break-all">{out.nCr}</div></div>
        </div>
      )}
    </ToolPage>
  );
}
