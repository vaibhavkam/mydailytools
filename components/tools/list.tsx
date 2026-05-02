"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

function splitInput(text: string, opts: { trim: boolean; dropEmpty: boolean }) {
  let lines = text.split(/\r?\n/);
  if (opts.trim) lines = lines.map((s) => s.trim());
  if (opts.dropEmpty) lines = lines.filter((s) => s !== "");
  return lines;
}

function copyBtn(text: string) {
  return (
    <button onClick={() => navigator.clipboard.writeText(text)} className="btn-ghost text-xs">Copy</button>
  );
}

// =====================================================================
// Comma ↔ Lines Converter
// =====================================================================
export function CommaLines({ tool }: Props) {
  const [text, setText] = useState("apple, banana, cherry, date");
  const [sep, setSep] = useState(",");
  const [trim, setTrim] = useState(true);
  const [dedupe, setDedupe] = useState(false);
  const [dropEmpty, setDropEmpty] = useState(true);

  const toLines = useMemo(() => {
    const re = new RegExp(escapeRe(sep || ","), "g");
    let parts = text.split(re);
    if (trim) parts = parts.map((s) => s.trim());
    if (dropEmpty) parts = parts.filter((s) => s !== "");
    if (dedupe) parts = [...new Set(parts)];
    return parts.join("\n");
  }, [text, sep, trim, dedupe, dropEmpty]);

  const [linesIn, setLinesIn] = useState("apple\nbanana\ncherry\ndate");
  const toJoined = useMemo(() => {
    const lines = splitInput(linesIn, { trim, dropEmpty });
    const arr = dedupe ? [...new Set(lines)] : lines;
    return arr.join((sep || ",") + (sep === "," ? " " : ""));
  }, [linesIn, sep, trim, dedupe, dropEmpty]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste a comma-separated string on the left to get one item per line; paste a list on the right to join with your separator. Toggles let you trim whitespace, drop empties, or dedupe.",
      formula: "Splits and joins are exact — the only transformations are the toggles you enable.",
      examples: '"apple, banana, cherry" → three lines. With dedupe on, repeated values collapse.',
      faq: [],
    }}>
      <div className="flex flex-wrap gap-3 mb-3 items-end">
        <div className="w-32"><label className="label">Separator</label><input className="input font-mono" value={sep} onChange={(e) => setSep(e.target.value)} /></div>
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} className="accent-brand-600" /> Trim</label>
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} className="accent-brand-600" /> Dedupe</label>
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={dropEmpty} onChange={(e) => setDropEmpty(e.target.checked)} className="accent-brand-600" /> Drop empty</label>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        <div>
          <label className="label">Joined → Lines</label>
          <textarea className="input min-h-[180px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex items-center justify-between mt-2 mb-1"><span className="text-xs text-[rgb(var(--fg-muted))]">Result</span>{copyBtn(toLines)}</div>
          <textarea readOnly className="input min-h-[140px] font-mono text-xs" value={toLines} />
        </div>
        <div>
          <label className="label">Lines → Joined</label>
          <textarea className="input min-h-[180px] font-mono text-xs" value={linesIn} onChange={(e) => setLinesIn(e.target.value)} />
          <div className="flex items-center justify-between mt-2 mb-1"><span className="text-xs text-[rgb(var(--fg-muted))]">Result</span>{copyBtn(toJoined)}</div>
          <textarea readOnly className="input min-h-[140px] font-mono text-xs" value={toJoined} />
        </div>
      </div>
    </ToolPage>
  );
}
function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// =====================================================================
// List Set Operations
// =====================================================================
export function ListSetOps({ tool }: Props) {
  const [a, setA] = useState("apple\nbanana\ncherry\ndate");
  const [b, setB] = useState("banana\ncherry\nelderberry\nfig");
  const [trim, setTrim] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(true);

  const r = useMemo(() => {
    const norm = (s: string) => trim ? s.trim() : s;
    const A = splitInput(a, { trim, dropEmpty: true }).map(norm);
    const B = splitInput(b, { trim, dropEmpty: true }).map(norm);
    const key = (s: string) => caseSensitive ? s : s.toLowerCase();
    const setA = new Set(A.map(key));
    const setB = new Set(B.map(key));
    const union = [...new Set([...A, ...B.filter((x) => !setA.has(key(x)))])];
    const intersection = A.filter((x) => setB.has(key(x))).filter((x, i, arr) => arr.indexOf(x) === i);
    const aOnly = A.filter((x) => !setB.has(key(x))).filter((x, i, arr) => arr.indexOf(x) === i);
    const bOnly = B.filter((x) => !setA.has(key(x))).filter((x, i, arr) => arr.indexOf(x) === i);
    const symmetric = [...aOnly, ...bOnly];
    return { union, intersection, aOnly, bOnly, symmetric };
  }, [a, b, trim, caseSensitive]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste two lists, one item per line. The five common set results compute simultaneously: union, intersection, A only, B only, and symmetric difference.",
      formula: "Order is preserved from the first occurrence; duplicates within a list are collapsed in the output.",
      examples: "A: apple, banana, cherry, date. B: banana, cherry, elderberry. Intersection: banana, cherry. A−B: apple, date.",
      faq: [],
    }}>
      <div className="flex gap-3 mb-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} className="accent-brand-600" /> Trim</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-brand-600" /> Case sensitive</label>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        <div><label className="label">List A</label><textarea className="input min-h-[160px] font-mono text-xs" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <div><label className="label">List B</label><textarea className="input min-h-[160px] font-mono text-xs" value={b} onChange={(e) => setB(e.target.value)} /></div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          ["A ∪ B (Union)", r.union],
          ["A ∩ B (Intersection)", r.intersection],
          ["A − B (only in A)", r.aOnly],
          ["B − A (only in B)", r.bOnly],
          ["A △ B (symmetric)", r.symmetric],
        ].map(([label, list]) => (
          <div key={label as string} className="rounded-xl border border-[rgb(var(--border))] p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs font-semibold">{label as string}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[rgb(var(--fg-muted))]">{(list as string[]).length}</span>
                {copyBtn((list as string[]).join("\n"))}
              </div>
            </div>
            <textarea readOnly className="input min-h-[100px] font-mono text-xs" value={(list as string[]).join("\n")} />
          </div>
        ))}
      </div>
    </ToolPage>
  );
}

// =====================================================================
// List Compare
// =====================================================================
export function ListCompare({ tool }: Props) {
  const [a, setA] = useState("apple\nbanana\ncherry\ndate");
  const [b, setB] = useState("banana\ncherry\nelderberry\nfig");
  const r = useMemo(() => {
    const A = splitInput(a, { trim: true, dropEmpty: true });
    const B = splitInput(b, { trim: true, dropEmpty: true });
    const sA = new Set(A); const sB = new Set(B);
    const both = A.filter((x) => sB.has(x)).filter((x, i, arr) => arr.indexOf(x) === i);
    const onlyA = A.filter((x) => !sB.has(x));
    const onlyB = B.filter((x) => !sA.has(x));
    return { both, onlyA, onlyB };
  }, [a, b]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste two lists. See three columns: items in both, items only in A, items only in B.",
      formula: "Set-based comparison after trimming each line. Lines preserved in their original order.",
      examples: "Compare two CSVs of email addresses, two lists of file names, etc.",
      faq: [],
    }}>
      <div className="grid lg:grid-cols-2 gap-3">
        <div><label className="label">List A</label><textarea className="input min-h-[160px] font-mono text-xs" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <div><label className="label">List B</label><textarea className="input min-h-[160px] font-mono text-xs" value={b} onChange={(e) => setB(e.target.value)} /></div>
      </div>
      <div className="mt-4 grid lg:grid-cols-3 gap-3">
        {[["In both", r.both, "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"],
          ["Only in A", r.onlyA, "border-sky-300 bg-sky-50/50 dark:bg-sky-950/20"],
          ["Only in B", r.onlyB, "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"]].map(([label, list, cls]) => (
          <div key={label as string} className={`rounded-xl border p-3 ${cls as string}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs font-semibold">{label as string} <span className="opacity-60">({(list as string[]).length})</span></div>
              {copyBtn((list as string[]).join("\n"))}
            </div>
            <textarea readOnly className="input min-h-[140px] font-mono text-xs" value={(list as string[]).join("\n")} />
          </div>
        ))}
      </div>
    </ToolPage>
  );
}

// =====================================================================
// List Stats
// =====================================================================
export function ListStats({ tool }: Props) {
  const [text, setText] = useState("apple\nbanana\ncherry\ndate\napple\nfig\ngrape");
  const r = useMemo(() => {
    const lines = splitInput(text, { trim: true, dropEmpty: true });
    if (lines.length === 0) return null;
    const unique = new Set(lines);
    const lengths = lines.map((s) => s.length);
    const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b));
    const shortest = lines.reduce((a, b) => (a.length <= b.length ? a : b));
    const avg = lengths.reduce((a, b) => a + b, 0) / lines.length;
    const counts = new Map<string, number>();
    for (const l of lines) counts.set(l, (counts.get(l) ?? 0) + 1);
    const dups = [...counts.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]);
    return { count: lines.length, unique: unique.size, dupCount: lines.length - unique.size, longest, shortest, avg, dups };
  }, [text]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste any list. Counts, lengths, and the most-repeated entries are computed instantly.",
      formula: "Whitespace-trimmed, blank-skipped. Avg length is in characters.",
      examples: "Useful for quickly inspecting CSV exports, log lines, or raw API responses.",
      faq: [],
    }}>
      <textarea className="input min-h-[160px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
      {r && (
        <>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["Total", r.count.toString()],
              ["Unique", r.unique.toString()],
              ["Duplicates", r.dupCount.toString()],
              ["Avg length", r.avg.toFixed(1)],
              ["Longest length", r.longest.length.toString()],
              ["Shortest length", r.shortest.length.toString()],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-[rgb(var(--border))] p-3 text-center">
                <div className="text-xs text-[rgb(var(--fg-muted))]">{l}</div>
                <div className="text-lg font-semibold tabular-nums">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Longest</div><div className="font-mono text-sm break-all">{r.longest}</div></div>
            <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Shortest</div><div className="font-mono text-sm break-all">{r.shortest}</div></div>
          </div>
          {r.dups.length > 0 && (
            <div className="mt-3 rounded-xl border border-[rgb(var(--border))] p-3">
              <div className="text-xs font-semibold mb-1.5">Top duplicates</div>
              <ul className="text-sm font-mono space-y-0.5">
                {r.dups.slice(0, 10).map(([word, n]) => (
                  <li key={word} className="flex justify-between"><span className="truncate">{word}</span><span className="text-[rgb(var(--fg-muted))]">×{n}</span></li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </ToolPage>
  );
}

// =====================================================================
// Number Sequence Generator
// =====================================================================
export function NumberSequence({ tool }: Props) {
  const [pattern, setPattern] = useState("1..20");
  const [sep, setSep] = useState(", ");

  const r = useMemo(() => {
    // Patterns supported:
    //   "1..10"       inclusive range, step 1
    //   "1..2..20"    range with step (start..step..end)
    //   "0,2,4..20"   arithmetic continuation: take last two as anchors, fill to end
    try {
      const parts = pattern.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length === 0) return [];
      const lastPart = parts[parts.length - 1];
      const dot = lastPart.includes("..");
      if (!dot && parts.length === 1) {
        const n = Number(parts[0]);
        return Number.isFinite(n) ? [n] : null;
      }
      // Combine the head literals + last range
      const literals = parts.slice(0, -1).map(Number);
      if (literals.some((n) => !Number.isFinite(n))) return null;
      let rangeStart: number, rangeEnd: number, step: number;
      const dots = lastPart.split("..").map(Number);
      if (dots.length === 2) {
        [rangeStart, rangeEnd] = dots;
        // If we have prior literals, infer step from last two literals (or default to 1).
        step = literals.length >= 2 ? literals[literals.length - 1] - literals[literals.length - 2] : (literals.length === 1 ? rangeStart - literals[literals.length - 1] : 1);
      } else if (dots.length === 3) {
        [rangeStart, step, rangeEnd] = dots;
      } else return null;
      if (![rangeStart, rangeEnd, step].every(Number.isFinite) || step === 0) return null;
      const out: number[] = [...literals];
      if (literals.length === 0) out.push(rangeStart);
      const cmp = step > 0 ? (a: number, b: number) => a <= b : (a: number, b: number) => a >= b;
      let cur = literals.length === 0 ? rangeStart + step : rangeStart;
      while (cmp(cur, rangeEnd) && out.length < 100000) {
        out.push(cur);
        cur += step;
      }
      return out;
    } catch { return null; }
  }, [pattern]);

  const out = r ? r.join(sep) : "Invalid pattern";

  return (
    <ToolPage tool={tool} content={{
      howTo: "Patterns: 1..20 (range, step 1), 1..2..20 (start..step..end), 0,2,4..20 (literals + range that infers step).",
      formula: "Sequences expand to at most 100,000 items.",
      examples: "1..10 → 1,2,…,10. 0,2,4..20 → all even numbers 0–20. 100..-10..0 → 100, 90, …, 0.",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Pattern</label><input className="input font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} /></div>
        <div><label className="label">Separator</label><input className="input font-mono" value={sep} onChange={(e) => setSep(e.target.value)} /></div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-[rgb(var(--fg-muted))]">{r ? `${r.length} items` : ""}</span>
        {r && copyBtn(out)}
      </div>
      <textarea readOnly className="input min-h-[160px] font-mono text-xs mt-1" value={out} />
    </ToolPage>
  );
}

// =====================================================================
// List ↔ JSON Array
// =====================================================================
export function ListJsonArray({ tool }: Props) {
  const [list, setList] = useState("apple\nbanana\ncherry");
  const [json, setJson] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const toJson = useMemo(() => {
    const items = splitInput(list, { trim: true, dropEmpty: true });
    return JSON.stringify(items, null, 2);
  }, [list]);

  function fromJson() {
    try {
      const arr = JSON.parse(json);
      if (!Array.isArray(arr)) throw new Error("Expected a JSON array.");
      setList(arr.map((x) => typeof x === "string" ? x : JSON.stringify(x)).join("\n"));
      setErr(null);
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Edit the list on the left to see a JSON array of strings on the right. Edit the JSON side, click 'JSON → List' to convert back.",
      formula: 'Lines map 1:1 to array elements. Trims whitespace and skips blanks.',
      examples: '["apple", "banana", "cherry"] ⇄ three lines.',
      faq: [{ q: "What about non-string items?", a: "Decoded back as JSON.stringify(value). For numeric arrays, the round-trip will quote each number." }],
    }}>
      <div className="grid lg:grid-cols-2 gap-3">
        <div>
          <label className="label">Lines</label>
          <textarea className="input min-h-[200px] font-mono text-xs" value={list} onChange={(e) => setList(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="label !mb-0">JSON array</label><div className="flex items-center gap-2"><button onClick={fromJson} className="btn-ghost text-xs">JSON → List</button>{copyBtn(toJson)}</div></div>
          <textarea className="input min-h-[200px] mt-1 font-mono text-xs" value={json || toJson} onChange={(e) => setJson(e.target.value)} />
          {err && <p role="alert" className="mt-2 text-sm text-red-600">{err}</p>}
        </div>
      </div>
    </ToolPage>
  );
}

// =====================================================================
// Prefix / Suffix Wrapper
// =====================================================================
export function PrefixSuffix({ tool }: Props) {
  const [text, setText] = useState("apple\nbanana\ncherry");
  const [prefix, setPrefix] = useState("'");
  const [suffix, setSuffix] = useState("',");
  const [skipBlank, setSkipBlank] = useState(true);
  const out = useMemo(() => {
    const lines = text.split(/\r?\n/);
    return lines.map((l) => skipBlank && l.trim() === "" ? l : `${prefix}${l}${suffix}`).join("\n");
  }, [text, prefix, suffix, skipBlank]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Set a prefix and a suffix; every line gets wrapped. Useful for SQL IN clauses, code generation, or quoting lists.",
      formula: "Pure string concatenation; no escaping is performed — that's your responsibility for the target context.",
      examples: 'Prefix \' and suffix \',  → SQL list: \'apple\', \'banana\', \'cherry\',',
      faq: [],
    }}>
      <div className="grid sm:grid-cols-2 gap-3 mb-2">
        <div><label className="label">Prefix</label><input className="input font-mono" value={prefix} onChange={(e) => setPrefix(e.target.value)} /></div>
        <div><label className="label">Suffix</label><input className="input font-mono" value={suffix} onChange={(e) => setSuffix(e.target.value)} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" checked={skipBlank} onChange={(e) => setSkipBlank(e.target.checked)} className="accent-brand-600" /> Skip blank lines</label>
      <div className="grid lg:grid-cols-2 gap-3">
        <textarea className="input min-h-[200px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
        <textarea readOnly className="input min-h-[200px] font-mono text-xs" value={out} />
      </div>
      <div className="mt-2">{copyBtn(out)}</div>
    </ToolPage>
  );
}

// =====================================================================
// Column Picker
// =====================================================================
export function ColumnPicker({ tool }: Props) {
  const [text, setText] = useState("alice\t30\tNYC\nbob\t25\tSF\ncarol\t35\tLA");
  const [delim, setDelim] = useState<"tab" | "comma" | "pipe" | "space">("tab");
  const [col, setCol] = useState(1);
  const [hasHeader, setHasHeader] = useState(false);

  const out = useMemo(() => {
    const sepMap = { tab: /\t/, comma: /,/, pipe: /\|/, space: /\s+/ };
    const re = sepMap[delim];
    const rows = text.split(/\r?\n/).filter(Boolean).map((r) => r.split(re));
    const start = hasHeader ? 1 : 0;
    return rows.slice(start).map((r) => r[col] ?? "").join("\n");
  }, [text, delim, col, hasHeader]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste delimited rows, pick the delimiter and column index (0-based). Toggle 'has header' to skip the first row.",
      formula: "Splits each line by the chosen delimiter. Missing cells emit empty strings.",
      examples: "Tab-separated rows of name/age/city → pick column 1 to extract just ages.",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <div><label className="label">Delimiter</label>
          <select className="input" value={delim} onChange={(e) => setDelim(e.target.value as any)}>
            <option value="tab">Tab</option><option value="comma">Comma</option><option value="pipe">Pipe (|)</option><option value="space">Whitespace</option>
          </select>
        </div>
        <div><label className="label">Column (0-based)</label><input type="number" min={0} className="input" value={col} onChange={(e) => setCol(Math.max(0, Number(e.target.value)))} /></div>
        <label className="flex items-end gap-2 text-sm pb-2"><input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="accent-brand-600" /> First row is header</label>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        <textarea className="input min-h-[200px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
        <textarea readOnly className="input min-h-[200px] font-mono text-xs" value={out} />
      </div>
      <div className="mt-2">{copyBtn(out)}</div>
    </ToolPage>
  );
}

// =====================================================================
// List Filter
// =====================================================================
export function ListFilter({ tool }: Props) {
  const [text, setText] = useState("apple\nbanana\ncherry\ndate\nelderberry\nfig");
  const [pattern, setPattern] = useState("a");
  const [mode, setMode] = useState<"keep" | "drop">("keep");
  const [regex, setRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const out = useMemo(() => {
    if (!pattern) return text;
    let test: (line: string) => boolean;
    try {
      if (regex) {
        const re = new RegExp(pattern, caseSensitive ? "" : "i");
        test = (line) => re.test(line);
      } else {
        const needle = caseSensitive ? pattern : pattern.toLowerCase();
        test = (line) => (caseSensitive ? line : line.toLowerCase()).includes(needle);
      }
      setErr(null);
    } catch (e: any) { setErr(e.message); return text; }
    return text.split(/\r?\n/).filter((l) => mode === "keep" ? test(l) : !test(l)).join("\n");
  }, [text, pattern, mode, regex, caseSensitive]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Type a substring (or regex pattern). Choose to keep matching lines or drop them. Case sensitivity is configurable.",
      formula: "Plain mode does a case-insensitive substring match by default; regex mode uses your pattern as JavaScript regex.",
      examples: 'Pattern "a", keep mode → only lines containing "a". Switch to drop mode to remove them.',
      faq: [],
    }}>
      <div className="flex flex-wrap gap-3 mb-2 items-end">
        <div className="flex-1 min-w-[180px]"><label className="label">Pattern</label><input className="input font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} /></div>
        <div className="flex gap-2">
          {(["keep", "drop"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${mode === m ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{m}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 mb-2 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} className="accent-brand-600" /> Regex</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-brand-600" /> Case sensitive</label>
      </div>
      {err && <p role="alert" className="text-sm text-red-600 mb-2">{err}</p>}
      <div className="grid lg:grid-cols-2 gap-3">
        <textarea className="input min-h-[200px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
        <textarea readOnly className="input min-h-[200px] font-mono text-xs" value={out} />
      </div>
      <div className="mt-2">{copyBtn(out)}</div>
    </ToolPage>
  );
}
