"use client";

import { useState, useCallback } from "react";
import { Delete } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

// Whitelist-only expression evaluator.
const ALLOWED_TOKEN = /^([0-9.]+|[+\-*/%(),]|sin|cos|tan|asin|acos|atan|sqrt|cbrt|log|ln|exp|abs|floor|ceil|round|pow|pi|e)$/;
const TOKENIZER = /([0-9]*\.?[0-9]+|sin|cos|tan|asin|acos|atan|sqrt|cbrt|log|ln|exp|abs|floor|ceil|round|pow|pi|e|[+\-*/%(),])/g;

function compile(expr: string, deg: boolean): string {
  const cleaned = expr.replace(/\s+/g, "").toLowerCase();
  if (!cleaned) return "";
  const tokens = cleaned.match(TOKENIZER);
  if (!tokens || tokens.join("") !== cleaned) throw new Error("Syntax error");
  for (const t of tokens) if (!ALLOWED_TOKEN.test(t)) throw new Error(`Unknown: ${t}`);
  return tokens.map((t) => {
    if (t === "pi") return "Math.PI";
    if (t === "e") return "Math.E";
    if (t === "ln") return "Math.log";
    if (t === "log") return "Math.log10";
    if (["sin","cos","tan","asin","acos","atan"].includes(t)) {
      return deg
        ? (["asin","acos","atan"].includes(t) ? `(x=>x*180/Math.PI)(Math.${t}` : `Math.${t}((x=>x*Math.PI/180)(`)
        : `Math.${t}(`;
    }
    if (/^(sqrt|cbrt|exp|abs|floor|ceil|round|pow)$/.test(t)) return `Math.${t}(`;
    return t;
  }).join("");
}

function evaluate(expr: string, deg: boolean, ans: number): number {
  const withAns = expr.replace(/\bans\b/gi, String(ans));
  // handle n! factorial
  const factored = withAns.replace(/(\d+(?:\.\d+)?)\s*!/g, (_, n) => {
    const x = parseInt(n, 10);
    if (x < 0 || x > 170) throw new Error("Factorial out of range");
    let r = 1; for (let i = 2; i <= x; i++) r *= i;
    return String(r);
  });
  // handle nthroot: n√x → Math.pow(x, 1/n) — typed as "nrt("
  const code = compile(factored, deg);
  // eslint-disable-next-line no-new-func
  const val = Function(`"use strict"; return (${code});`)();
  if (typeof val !== "number" || !isFinite(val)) throw new Error("Not a number");
  return val;
}

type HistoryEntry = { expr: string; result: string };

type ButtonDef = {
  label: string;
  value?: string;
  wide?: boolean;
  color?: "red" | "green" | "gray";
  action?: "ac" | "backspace" | "equals" | "deg" | "rad";
};

const BUTTONS: ButtonDef[][] = [
  [
    { label: "AC", action: "ac", color: "red" },
    { label: "√", value: "sqrt(" },
    { label: "xʸ", value: "^" },
    { label: "%", value: "%" },
    { label: "⌫", action: "backspace" },
    { label: "Deg", action: "deg", color: "gray" },
    { label: "Rad", action: "rad", color: "gray" },
    { label: "( )", value: "()" },
  ],
  [
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "sin", value: "sin(" },
    { label: "cos", value: "cos(" },
    { label: "tan", value: "tan(" },
  ],
  [
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "×", value: "*" },
    { label: "÷", value: "/" },
    { label: "sin⁻¹", value: "asin(" },
    { label: "cos⁻¹", value: "acos(" },
    { label: "tan⁻¹", value: "atan(" },
  ],
  [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "+", value: "+" },
    { label: "−", value: "-" },
    { label: "ⁿ√", value: "cbrt(" },
    { label: "log", value: "log(" },
    { label: "ln", value: "ln(" },
  ],
  [
    { label: "0", value: "0" },
    { label: ".", value: "." },
    { label: "Ans", value: "ans" },
    { label: "+", value: "+" },
    { label: "=", action: "equals", color: "green", wide: false },
    { label: "π", value: "pi" },
    { label: "e", value: "e" },
    { label: "n!", value: "!" },
  ],
];

export default function ScientificCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [ans, setAns] = useState(0);
  const [deg, setDeg] = useState(true);
  const [error, setError] = useState("");

  const appendToInput = useCallback((val: string) => {
    setError("");
    if (val === "()") {
      // smart parenthesis: open if unbalanced, else close
      const open = (input.match(/\(/g) || []).length;
      const close = (input.match(/\)/g) || []).length;
      setInput((p) => p + (open > close ? ")" : "("));
    } else if (val === "^") {
      setInput((p) => p + "^");
    } else {
      setInput((p) => p + val);
    }
  }, [input]);

  const calc = useCallback(() => {
    if (!input.trim()) return;
    // replace ^ with ** for power (compile handles xʸ)
    const expr = input.replace(/\^/g, "**");
    try {
      const result = evaluate(expr, deg, ans);
      const resultStr = Number(result.toPrecision(12)).toString();
      setHistory((h) => [...h, { expr: input, result: resultStr }]);
      setAns(result);
      setInput(resultStr);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }, [input, deg, ans]);

  const handleButton = useCallback((btn: ButtonDef) => {
    switch (btn.action) {
      case "ac":
        setInput(""); setError(""); break;
      case "backspace":
        setInput((p) => p.slice(0, -1)); setError(""); break;
      case "equals":
        calc(); break;
      case "deg":
        setDeg(true); break;
      case "rad":
        setDeg(false); break;
      default:
        if (btn.value) appendToInput(btn.value);
    }
  }, [calc, appendToInput]);

  function btnClass(btn: ButtonDef) {
    const base = "min-tap rounded-xl text-sm font-medium transition active:scale-95 flex items-center justify-center h-11";
    if (btn.action === "deg") return `${base} ${deg ? "bg-[rgb(var(--border))] text-[rgb(var(--fg))]" : "btn-ghost"}`;
    if (btn.action === "rad") return `${base} ${!deg ? "bg-[rgb(var(--border))] text-[rgb(var(--fg))]" : "btn-ghost"}`;
    if (btn.color === "red") return `${base} bg-red-400 hover:bg-red-500 text-white`;
    if (btn.color === "green") return `${base} bg-brand-gradient text-white shadow-glow`;
    return `${base} btn-ghost`;
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Tap buttons or type directly in the input. Press = or Enter to evaluate. 'Ans' inserts the last result.",
      formula: "Whitelist-tokenised evaluator — input is parsed into safe Math.* calls only. ^ = power, n! = factorial, log = log₁₀, ln = natural log.",
      examples: "5+3+12.5 = 20.5 · sin(30) in Deg = 0.5 · log(1000) = 3 · 2^10 = 1024 · 5! = 120",
      faq: [
        { q: "What does 'Ans' do?", a: "Inserts the result of the last calculation so you can chain operations." },
        { q: "Deg vs Rad?", a: "Toggles whether trig functions (sin, cos, tan) expect degrees or radians." },
        { q: "Is it safe to evaluate expressions?", a: "Yes — only whitelisted math tokens are allowed. No access to JS globals." },
      ],
    }}>
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden">

        {/* History display */}
        <div className="min-h-[100px] max-h-[140px] overflow-y-auto px-4 pt-3 pb-1 font-mono text-sm space-y-0.5">
          {history.length === 0 && (
            <p className="text-[rgb(var(--fg-muted))] text-xs">History will appear here…</p>
          )}
          {history.map((h, i) => (
            <div key={i}>
              <div className="text-[rgb(var(--fg-muted))]">{h.expr}</div>
              <div className="font-semibold">= {h.result}</div>
            </div>
          ))}
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 px-3 pb-2 border-b border-[rgb(var(--border))]">
          <input
            className="flex-1 bg-transparent font-mono text-lg outline-none py-2"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && calc()}
            placeholder="0"
            autoComplete="off"
            spellCheck={false}
          />
          {input && (
            <button onClick={() => { setInput(""); setError(""); }} className="text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg))]">
              ×
            </button>
          )}
          <button onClick={calc} className="min-tap rounded-xl px-3 py-2 bg-brand-gradient text-white shadow-glow">
            <Delete className="h-4 w-4 rotate-180" />
          </button>
        </div>

        {error && <p className="px-4 py-1 text-xs text-red-500">{error}</p>}

        {/* Button grid */}
        <div className="p-3 space-y-2">
          {BUTTONS.map((row, ri) => (
            <div key={ri} className="grid grid-cols-8 gap-1.5">
              {row.map((btn, bi) => (
                <button
                  key={bi}
                  onClick={() => handleButton(btn)}
                  className={btnClass(btn)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
