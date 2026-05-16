"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

function gcd(a: number, b: number) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }

export default function RatioCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [a, setA] = useState("16");
  const [b, setB] = useState("9");
  const r = useMemo(() => {
    const x = parseFloat(a), y = parseFloat(b);
    if (!Number.isFinite(x) || !Number.isFinite(y) || y === 0) return null;
    if (Number.isInteger(x) && Number.isInteger(y)) {
      const g = gcd(x, y) || 1;
      return { simplified: `${x / g} : ${y / g}`, decimal: x / y };
    }
    return { simplified: `${x} : ${y}`, decimal: x / y };
  }, [a, b]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter two numbers — the ratio is simplified to lowest terms (for integers) and shown as a decimal.",
      formula: "Simplified ratio: divide both terms by GCD. Decimal: a ÷ b.",
      examples: "16 : 9 is already simplified, decimal 1.778. 24 : 36 simplifies to 2 : 3.",
      faq: [
        { q: "What does simplifying a ratio mean?", a: "Simplifying means dividing both terms by their greatest common divisor (GCD) so the ratio is expressed in the smallest whole numbers. 24:36 simplifies to 2:3." },
        { q: "Can I enter decimal or fractional values?", a: "Yes. For non-integer inputs the tool shows the ratio as-is and gives the decimal equivalent, since GCD is only defined for integers." },
        { q: "How is a ratio different from a fraction?", a: "A ratio compares two quantities (a:b), while a fraction represents one part of a whole (a/b). They're numerically equivalent but used in different contexts." },
        { q: "What is the aspect ratio 16:9 as a decimal?", a: "16 ÷ 9 ≈ 1.7778. This is the standard widescreen display ratio used by most HD and 4K screens." },
      ],
    }}>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
        <div><label className="label" htmlFor="ra">A</label><input id="ra" className="input" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <span className="pb-3 font-bold">:</span>
        <div><label className="label" htmlFor="rb">B</label><input id="rb" className="input" value={b} onChange={(e) => setB(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-3">
            <div className="text-xs text-brand-700 dark:text-brand-300">Simplified</div>
            <div className="text-2xl font-bold">{r.simplified}</div>
          </div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3">
            <div className="text-xs text-[rgb(var(--fg-muted))]">Decimal</div>
            <div className="text-2xl font-bold">{r.decimal.toFixed(6)}</div>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
