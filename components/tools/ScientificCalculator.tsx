"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

// Whitelist-only expression evaluator. Accepts numbers, +-*/(), %, and a known
// set of Math functions/constants. Anything else is rejected, so we can use
// `new Function` safely without exposing the full JS scope.
const ALLOWED_TOKEN = /^([0-9.]+|[+\-*/%(),]|sin|cos|tan|asin|acos|atan|sqrt|cbrt|log|ln|exp|abs|floor|ceil|round|pow|pi|e)$/;
const TOKENIZER = /([0-9]*\.?[0-9]+|sin|cos|tan|asin|acos|atan|sqrt|cbrt|log|ln|exp|abs|floor|ceil|round|pow|pi|e|[+\-*/%(),])/g;

function compile(expr: string): string {
  const cleaned = expr.replace(/\s+/g, "").toLowerCase();
  if (!cleaned) return "";
  const tokens = cleaned.match(TOKENIZER);
  if (!tokens || tokens.join("") !== cleaned) throw new Error("Unrecognized characters");
  for (const t of tokens) if (!ALLOWED_TOKEN.test(t)) throw new Error(`Unknown token: ${t}`);
  return tokens.map((t) => {
    if (t === "pi") return "Math.PI";
    if (t === "e") return "Math.E";
    if (t === "ln") return "Math.log";
    if (/^(sin|cos|tan|asin|acos|atan|sqrt|cbrt|log|exp|abs|floor|ceil|round|pow)$/.test(t)) return `Math.${t === "log" ? "log10" : t}`;
    return t;
  }).join("");
}

export default function ScientificCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [expr, setExpr] = useState("sin(pi/4) + sqrt(2)/2");
  const r = useMemo(() => {
    if (!expr.trim()) return null;
    try {
      const code = compile(expr);
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict"; return (${code});`)();
      if (typeof val === "number" && Number.isFinite(val)) return { val, err: null };
      return { val: NaN, err: "Result is not a number" };
    } catch (e: any) {
      return { val: NaN, err: e.message };
    }
  }, [expr]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Type an expression using +, −, ×, /, parentheses, and these functions: sin, cos, tan, asin, acos, atan, sqrt, cbrt, log, ln, exp, abs, floor, ceil, round, pow. Constants: pi, e. Trig is in radians.",
      formula: "Tokens are validated against a whitelist before evaluation, then mapped to JavaScript Math.* equivalents. log = log₁₀, ln = natural log.",
      examples: "sin(pi/4) + sqrt(2)/2 ≈ 1.4142. log(1000) = 3. pow(2, 10) = 1024. exp(1) ≈ 2.71828.",
      faq: [{ q: "Why not regular eval()?", a: "Eval would expose the full JS environment. Our whitelist limits input to well-defined math tokens only." }],
    }}>
      <label className="label" htmlFor="sc">Expression</label>
      <input id="sc" className="input font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} />
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">Result</div>
        <div className="text-3xl font-bold tabular-nums">{r ? (Number.isFinite(r.val) ? Number(r.val.toPrecision(12)) : r.err) : "—"}</div>
      </div>
    </ToolPage>
  );
}
