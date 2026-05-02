"use client";

import { useEffect, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};

function generate(length: number, opts: Record<keyof typeof SETS, boolean>) {
  const pool = (Object.keys(SETS) as (keyof typeof SETS)[]).filter((k) => opts[k]).map((k) => SETS[k]).join("");
  if (!pool) return "";
  // Use crypto.getRandomValues for cryptographically strong randomness.
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < length; i++) out += pool[arr[i] % pool.length];
  return out;
}

function strength(pw: string) {
  // Rough log2 entropy: bits = log2(pool^length). Categorize for UI.
  const poolSize =
    (/[a-z]/.test(pw) ? 26 : 0) +
    (/[A-Z]/.test(pw) ? 26 : 0) +
    (/\d/.test(pw) ? 10 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 24 : 0);
  const bits = pw.length * Math.log2(Math.max(poolSize, 2));
  if (bits < 40) return { label: "Weak", color: "bg-red-500", pct: 25 };
  if (bits < 60) return { label: "Fair", color: "bg-amber-500", pct: 50 };
  if (bits < 80) return { label: "Strong", color: "bg-emerald-500", pct: 75 };
  return { label: "Very strong", color: "bg-brand-600", pct: 100 };
}

export default function PasswordGenerator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [pw, setPw] = useState("");

  const regen = () => setPw(generate(length, opts));
  useEffect(() => { setPw(generate(length, opts)); }, [length, opts]);

  const s = strength(pw);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo:
          "Pick a length and which character sets to include. The password regenerates as you change settings, and the strength meter estimates entropy. Click the copy button to copy to clipboard — passwords are never stored.",
        formula:
          "Entropy ≈ length × log₂(pool size), where pool size depends on which character classes are enabled. 60+ bits is generally considered strong; 80+ is excellent. Random characters come from window.crypto.getRandomValues, the browser's CSPRNG.",
        examples:
          "12 chars, lowercase only: ~56 bits — fair. 16 chars, all sets: ~104 bits — very strong. 24 chars, all sets: ~157 bits — overkill, but harmless.",
        faq: [
          { q: "Is my password sent anywhere?", a: "No. Generation happens entirely in your browser and we don't log or store it." },
          { q: "How random is the output?", a: "We use the Web Crypto API (crypto.getRandomValues), the same source recommended for cryptographic use." },
          { q: "What length should I pick?", a: "16+ characters with mixed sets is a good default. Use 20+ for high-value accounts." },
        ],
      }}
    >
      <div className="grid gap-5">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-[rgb(var(--border))] px-4 py-3 flex items-center gap-2">
          <code className="font-mono text-base flex-1 truncate">{pw || " "}</code>
          <button onClick={() => navigator.clipboard.writeText(pw)} aria-label="Copy password" className="btn-ghost min-tap">
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={regen} aria-label="Regenerate" className="btn-ghost min-tap">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[rgb(var(--fg-muted))]">Strength</span>
            <span className="font-medium">{s.label}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full transition-all ${s.color}`} style={{ width: `${s.pct}%` }} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="pwlen">Length: {length}</label>
          <input id="pwlen" type="range" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => (
            <label key={k} className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] px-3 py-2.5 cursor-pointer min-tap">
              <input
                type="checkbox"
                checked={opts[k]}
                onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })}
                className="accent-brand-600"
              />
              <span className="text-sm capitalize">{k}</span>
            </label>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
