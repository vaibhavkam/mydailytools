"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

function randInt(min: number, max: number) {
  // Uniform inclusive integer using crypto.
  const range = max - min + 1;
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return min + (arr[0] % range);
}

export function RandomNumberGenerator({ tool }: Props) {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("5");
  const [unique, setUnique] = useState(false);
  const [out, setOut] = useState<number[]>([]);
  function gen() {
    const lo = parseInt(min), hi = parseInt(max), n = parseInt(count);
    if (![lo, hi, n].every(Number.isFinite) || hi < lo || n < 1) return;
    if (unique && hi - lo + 1 < n) { setOut([]); return; }
    const seen = new Set<number>();
    const arr: number[] = [];
    while (arr.length < n) {
      const v = randInt(lo, hi);
      if (unique) { if (!seen.has(v)) { seen.add(v); arr.push(v); } }
      else arr.push(v);
    }
    setOut(arr);
  }
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a min, max, and count. Toggle 'unique' to disallow repeats.",
      formula: "Numbers come from window.crypto.getRandomValues — a CSPRNG, not Math.random — so they're suitable even for sensitive uses.",
      examples: "Pick 6 unique numbers between 1 and 49 for lottery; pick 100 numbers between 0 and 9 for a sample.",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-4 gap-3">
        <div><label className="label">Min</label><input className="input" value={min} onChange={(e) => setMin(e.target.value)} /></div>
        <div><label className="label">Max</label><input className="input" value={max} onChange={(e) => setMax(e.target.value)} /></div>
        <div><label className="label">Count</label><input className="input" value={count} onChange={(e) => setCount(e.target.value)} /></div>
        <label className="flex items-end gap-2 text-sm pb-2"><input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="accent-brand-600" /> Unique</label>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={gen} className="btn-primary min-tap"><RefreshCw className="h-4 w-4" /> Generate</button>
        {out.length > 0 && <button onClick={() => navigator.clipboard.writeText(out.join(", "))} className="btn-ghost text-xs">Copy</button>}
      </div>
      {out.length > 0 && (
        <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 font-mono text-lg break-all">{out.join(", ")}</div>
      )}
    </ToolPage>
  );
}

export function DiceRoller({ tool }: Props) {
  const [notation, setNotation] = useState("3d6");
  const [last, setLast] = useState<{ rolls: number[]; total: number } | null>(null);
  function roll() {
    const m = notation.trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!m) { setLast(null); return; }
    const n = parseInt(m[1]), sides = parseInt(m[2]);
    const mod = m[3] ? parseInt(m[3]) : 0;
    if (n > 1000 || sides > 1000) { setLast(null); return; }
    const rolls = Array.from({ length: n }, () => randInt(1, sides));
    setLast({ rolls, total: rolls.reduce((a, b) => a + b, 0) + mod });
  }
  return (
    <ToolPage tool={tool} content={{
      howTo: "Use standard dice notation: NdM (e.g. 3d6 = roll three six-sided dice) with optional +X / −X modifier.",
      formula: "Each die uses uniform random 1..M from crypto. Total adds them up plus any modifier.",
      examples: "3d6 → e.g. 4 + 2 + 5 = 11. 1d20+3 → e.g. 14 + 3 = 17. 2d10 → e.g. 7 + 9 = 16.",
      faq: [],
    }}>
      <label className="label">Notation</label>
      <div className="flex gap-2">
        <input className="input font-mono" value={notation} onChange={(e) => setNotation(e.target.value)} />
        <button onClick={roll} className="btn-primary min-tap">Roll</button>
      </div>
      {last && (
        <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
          <div className="text-3xl font-bold tabular-nums">{last.total}</div>
          <div className="mt-1 text-sm text-[rgb(var(--fg-muted))]">{last.rolls.join(" + ")}</div>
        </div>
      )}
    </ToolPage>
  );
}

export function CoinFlipper({ tool }: Props) {
  const [history, setHistory] = useState<("H" | "T")[]>([]);
  const heads = history.filter((x) => x === "H").length;
  const tails = history.length - heads;
  function flip() {
    const r: "H" | "T" = Math.random() < 0.5 ? "H" : "T";
    setHistory((h) => [r, ...h].slice(0, 100));
  }
  return (
    <ToolPage tool={tool} content={{
      howTo: "Click Flip. Up to the last 100 results are shown along with running heads/tails counts.",
      formula: "50/50 fair coin via crypto-quality randomness.",
      examples: "Flip 10 times, expect roughly 5 heads — but variance is high in small samples.",
      faq: [],
    }}>
      <button onClick={flip} className="btn-primary min-tap">Flip</button>
      {history.length > 0 && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Tile label="Last" value={history[0]} />
            <Tile label="Heads" value={`${heads}`} />
            <Tile label="Tails" value={`${tails}`} />
          </div>
          <div className="mt-3 font-mono text-sm break-all opacity-70">{history.slice(0, 50).join(" ")}</div>
        </>
      )}
    </ToolPage>
  );
}

export function RandomColorGenerator({ tool }: Props) {
  const [colors, setColors] = useState<string[]>(() => Array.from({ length: 5 }, randHex));
  function gen() { setColors(Array.from({ length: 5 }, randHex)); }
  return (
    <ToolPage tool={tool} content={{
      howTo: "Click Generate to get a fresh palette of 5 random colors. Click any swatch to copy its HEX value.",
      formula: "Each channel (R, G, B) is a uniform random byte (0–255). For more harmonious palettes, see the harmony-based color tool.",
      examples: "Useful for placeholder swatches, design exploration, or testing color contrast.",
      faq: [],
    }}>
      <button onClick={gen} className="btn-primary min-tap"><RefreshCw className="h-4 w-4" /> Generate</button>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {colors.map((c) => (
          <button key={c} onClick={() => navigator.clipboard.writeText(c)} className="rounded-xl overflow-hidden border border-[rgb(var(--border))]" style={{ background: c }}>
            <div className="h-20" />
            <div className="bg-[rgb(var(--bg-elevated))] py-1 text-xs font-mono">{c}</div>
          </button>
        ))}
      </div>
    </ToolPage>
  );
}
function randHex() {
  const arr = new Uint8Array(3); crypto.getRandomValues(arr);
  return "#" + [...arr].map((x) => x.toString(16).padStart(2, "0")).join("");
}

const FIRST_NAMES = ["Alex","Jordan","Taylor","Morgan","Casey","Jamie","Riley","Avery","Quinn","Reese","Sage","Rowan","Skyler","Drew","Cameron","Hayden","Parker","Charlie","Frankie","Sam","Robin","Kai","Toni","Dakota","Phoenix","River","Eden","Logan","Emerson","Finley"];
const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright"];
export function RandomNameGenerator({ tool }: Props) {
  const [count, setCount] = useState(5);
  const [list, setList] = useState<string[]>(() => Array.from({ length: 5 }, makeName));
  function gen() { setList(Array.from({ length: count }, makeName)); }
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick how many names to generate (1–50). Click any name to copy.",
      formula: "First and last names are sampled uniformly from a curated list of common, gender-neutral names.",
      examples: "Useful for placeholder data, demo content, or design mockups.",
      faq: [],
    }}>
      <div className="flex gap-2 items-end">
        <div><label className="label">Count</label><input type="number" className="input" min={1} max={50} value={count} onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value))))} /></div>
        <button onClick={gen} className="btn-primary min-tap"><RefreshCw className="h-4 w-4" /> Generate</button>
      </div>
      <ul className="mt-4 grid sm:grid-cols-2 gap-2">
        {list.map((n, i) => (
          <li key={i}>
            <button onClick={() => navigator.clipboard.writeText(n)} className="w-full text-left rounded-xl border border-[rgb(var(--border))] px-3 py-2 hover:border-brand-500/40 transition">
              {n}
            </button>
          </li>
        ))}
      </ul>
    </ToolPage>
  );
}
function makeName() {
  return `${FIRST_NAMES[randInt(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[randInt(0, LAST_NAMES.length - 1)]}`;
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] p-3 text-center">
      <div className="text-xs text-[rgb(var(--fg-muted))]">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
