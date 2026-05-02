"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

function gcd(a: number, b: number) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
function lcm(a: number, b: number) { return Math.abs(a * b) / gcd(a, b); }

export default function LcmCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState("4, 6, 8");
  const r = useMemo(() => {
    const nums = input.split(/[, \n]+/).map(Number).filter((n) => Number.isFinite(n) && Number.isInteger(n) && n !== 0);
    if (nums.length < 2) return null;
    return nums.reduce((a, b) => lcm(a, b));
  }, [input]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter two or more positive integers separated by commas, spaces, or new lines.",
      formula: "LCM(a, b) = |a × b| ÷ GCD(a, b). Extended pairwise across the input list.",
      examples: "LCM(4, 6) = 12. LCM(4, 6, 8) = 24. LCM(3, 5) = 15.",
      faq: [{ q: "Why no zero?", a: "LCM is undefined when any input is zero — anything times zero is zero." }],
    }}>
      <label className="label" htmlFor="lcm">Numbers</label>
      <input id="lcm" className="input" value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">LCM</div>
        <div className="text-3xl font-bold tabular-nums">{r ?? "—"}</div>
      </div>
    </ToolPage>
  );
}
