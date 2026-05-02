"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Mode = "nearest" | "up" | "down" | "trunc";
type Place = number; // 10^place; -2 = hundredths, 0 = ones, 2 = hundreds

function roundAt(n: number, place: Place, mode: Mode) {
  const factor = Math.pow(10, -place);
  const x = n * factor;
  const f = mode === "up" ? Math.ceil : mode === "down" ? Math.floor : mode === "trunc" ? Math.trunc : Math.round;
  return f(x) / factor;
}

export default function RoundingCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [n, setN] = useState("3.14159");
  const [place, setPlace] = useState<Place>(-2);
  const [mode, setMode] = useState<Mode>("nearest");
  const r = useMemo(() => {
    const x = parseFloat(n);
    if (!Number.isFinite(x)) return null;
    return roundAt(x, place, mode);
  }, [n, place, mode]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter a number, choose the place to round to, and pick a mode (nearest, up, down, or truncate toward zero).",
      formula: "Multiply by 10^(−place), apply the rounding function, divide back. Place: −2 = hundredths, 0 = ones, 2 = hundreds.",
      examples: "3.14159 → nearest hundredth = 3.14. 7.6 → round down = 7. −7.6 truncate = −7, floor = −8.",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label" htmlFor="rn">Number</label><input id="rn" className="input" value={n} onChange={(e) => setN(e.target.value)} /></div>
        <div><label className="label" htmlFor="rp">Place (10^)</label>
          <select id="rp" className="input" value={place} onChange={(e) => setPlace(Number(e.target.value))}>
            {[-6, -4, -2, -1, 0, 1, 2, 3, 6].map((p) => <option key={p} value={p}>{p === 0 ? "ones" : p < 0 ? `10^${p} (decimals)` : `10^${p}`}</option>)}
          </select>
        </div>
        <div><label className="label" htmlFor="rm">Mode</label>
          <select id="rm" className="input" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="nearest">Nearest (half away)</option><option value="up">Up (ceil)</option><option value="down">Down (floor)</option><option value="trunc">Truncate (toward 0)</option>
          </select>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">Result</div>
        <div className="text-3xl font-bold tabular-nums">{r != null ? r : "—"}</div>
      </div>
    </ToolPage>
  );
}
