"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { safeCopy } from "@/lib/clipboard";
import { AutoTextarea } from "@/components/AutoTextarea";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

function splitInput(text: string, opts: { trim: boolean; dropEmpty: boolean }) {
  let lines = text.split(/\r?\n/);
  if (opts.trim) lines = lines.map((s) => s.trim());
  if (opts.dropEmpty) lines = lines.filter((s) => s !== "");
  return lines;
}

function copyBtn(text: string) {
  return (
    <button onClick={() => safeCopy(text)} className="btn-ghost text-xs">Copy</button>
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
      faq: [
        { q: "How do I convert a comma-separated list to one item per line?", a: "Paste your CSV into the left box and the tool splits it by commas automatically, putting each item on its own line." },
        { q: "Can I use a separator other than a comma?", a: "Yes — change the Separator field to any character such as a semicolon, pipe, or tab, and both panels update instantly." },
        { q: "How do I remove duplicate entries while converting?", a: "Enable the Dedupe toggle; it keeps the first occurrence of each value and drops subsequent repeats." },
        { q: "What does the Trim toggle do?", a: "It strips leading and trailing whitespace from each item, so ' apple ' becomes 'apple'. This prevents invisible mismatches when deduping." },
      ],
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
          <AutoTextarea className="input min-h-[180px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex items-center justify-between mt-2 mb-1"><span className="text-xs text-[rgb(var(--fg-muted))]">Result</span>{copyBtn(toLines)}</div>
          <AutoTextarea readOnly className="input min-h-[140px] font-mono text-xs" value={toLines} />
        </div>
        <div>
          <label className="label">Lines → Joined</label>
          <AutoTextarea className="input min-h-[180px] font-mono text-xs" value={linesIn} onChange={(e) => setLinesIn(e.target.value)} />
          <div className="flex items-center justify-between mt-2 mb-1"><span className="text-xs text-[rgb(var(--fg-muted))]">Result</span>{copyBtn(toJoined)}</div>
          <AutoTextarea readOnly className="input min-h-[140px] font-mono text-xs" value={toJoined} />
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
      faq: [
        { q: "What is the difference between intersection and union of two lists?", a: "The intersection contains only items present in both lists; the union contains all items from either list with no duplicates." },
        { q: "What is symmetric difference?", a: "Symmetric difference (A △ B) contains items that appear in either list but not both — the opposite of intersection." },
        { q: "Does the tool handle case-insensitive comparison?", a: "Yes — uncheck 'Case sensitive' and 'Apple' and 'apple' will be treated as the same item." },
        { q: "Are duplicates within a single list removed?", a: "Yes, each output set collapses duplicates so you get clean, unique results even if your original list had repeated entries." },
      ],
    }}>
      <div className="flex gap-3 mb-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} className="accent-brand-600" /> Trim</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-brand-600" /> Case sensitive</label>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        <div><label className="label">List A</label><AutoTextarea className="input min-h-[160px] font-mono text-xs" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <div><label className="label">List B</label><AutoTextarea className="input min-h-[160px] font-mono text-xs" value={b} onChange={(e) => setB(e.target.value)} /></div>
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
            <AutoTextarea readOnly className="input min-h-[100px] font-mono text-xs" value={(list as string[]).join("\n")} />
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
      faq: [
        { q: "How do I find items that are in one list but not the other?", a: "The 'Only in A' and 'Only in B' columns show exactly those items. Copy either column for a clean difference list." },
        { q: "Is the comparison case-sensitive?", a: "Yes, the comparison is case-sensitive by default. 'Apple' and 'apple' would appear as different items." },
        { q: "What common use cases is this tool good for?", a: "Comparing two exports of email addresses, finding new or removed rows between two CSV snapshots, or checking which file names were added or deleted." },
        { q: "How many items can I compare?", a: "There is no hard limit; the comparison runs entirely in your browser so performance depends on list size, but thousands of lines work fine." },
      ],
    }}>
      <div className="grid lg:grid-cols-2 gap-3">
        <div><label className="label">List A</label><AutoTextarea className="input min-h-[160px] font-mono text-xs" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <div><label className="label">List B</label><AutoTextarea className="input min-h-[160px] font-mono text-xs" value={b} onChange={(e) => setB(e.target.value)} /></div>
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
            <AutoTextarea readOnly className="input min-h-[140px] font-mono text-xs" value={(list as string[]).join("\n")} />
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
      faq: [
        { q: "How do I count unique values in a list?", a: "Paste your list and the 'Unique' count shows exactly how many distinct items exist after trimming whitespace." },
        { q: "Can I see which items appear more than once?", a: "Yes — the 'Top duplicates' section lists every repeated item alongside how many times it appears, sorted by frequency." },
        { q: "What does average length mean here?", a: "It is the mean number of characters per line (after trimming), useful for spotting unexpectedly long or truncated entries in a data export." },
        { q: "How are blank lines handled?", a: "Blank lines are skipped before all calculations, so they do not inflate the total count or distort average lengths." },
      ],
    }}>
      <AutoTextarea className="input min-h-[160px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
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
      faq: [
        { q: "How do I generate a list of even numbers?", a: "Use a pattern like 0,2,4..100 — the tool infers the step of 2 from the first two literals and continues to 100." },
        { q: "Can I generate a descending sequence?", a: "Yes — use a negative step: 100..-10..0 produces 100, 90, 80, …, 0." },
        { q: "How do I change what separator appears between numbers?", a: "Edit the Separator field; it defaults to ', ' but you can use a newline, tab, pipe, or any string." },
        { q: "What is the maximum sequence length?", a: "The generator stops at 100,000 items to prevent browser freezes. For very large sequences, generate in chunks." },
      ],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Pattern</label><input className="input font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} /></div>
        <div><label className="label">Separator</label><input className="input font-mono" value={sep} onChange={(e) => setSep(e.target.value)} /></div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-[rgb(var(--fg-muted))]">{r ? `${r.length} items` : ""}</span>
        {r && copyBtn(out)}
      </div>
      <AutoTextarea readOnly className="input min-h-[160px] font-mono text-xs mt-1" value={out} />
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
          <AutoTextarea className="input min-h-[200px] font-mono text-xs" value={list} onChange={(e) => setList(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="label !mb-0">JSON array</label><div className="flex items-center gap-2"><button onClick={fromJson} className="btn-ghost text-xs">JSON → List</button>{copyBtn(toJson)}</div></div>
          <AutoTextarea className="input min-h-[200px] mt-1 font-mono text-xs" value={json || toJson} onChange={(e) => setJson(e.target.value)} />
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
      faq: [
        { q: "How do I format a list for a SQL IN clause?", a: "Set prefix to ' and suffix to ', then paste your values. Copy the result and paste inside IN ( … )." },
        { q: "Can I add a prefix without a suffix, or vice versa?", a: "Yes — leave either field blank and only the non-empty side is added to each line." },
        { q: "Does the tool escape quotes or special characters?", a: "No, it is pure string concatenation. If your values contain single quotes, escape them manually before pasting." },
        { q: "What is 'Skip blank lines' for?", a: "It prevents blank lines in your input from becoming lines with only the prefix/suffix, keeping the output clean." },
      ],
    }}>
      <div className="grid sm:grid-cols-2 gap-3 mb-2">
        <div><label className="label">Prefix</label><input className="input font-mono" value={prefix} onChange={(e) => setPrefix(e.target.value)} /></div>
        <div><label className="label">Suffix</label><input className="input font-mono" value={suffix} onChange={(e) => setSuffix(e.target.value)} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" checked={skipBlank} onChange={(e) => setSkipBlank(e.target.checked)} className="accent-brand-600" /> Skip blank lines</label>
      <div className="grid lg:grid-cols-2 gap-3">
        <AutoTextarea className="input min-h-[200px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
        <AutoTextarea readOnly className="input min-h-[200px] font-mono text-xs" value={out} />
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
      faq: [
        { q: "Why are columns numbered from 0?", a: "Column indexing starts at 0 (zero-based), so the first column is 0, the second is 1, and so on — consistent with most programming languages." },
        { q: "How do I extract a column from a CSV file?", a: "Paste your CSV text, set the delimiter to Comma, enter the column number, and enable 'First row is header' if your CSV has a header row." },
        { q: "What happens if a row has fewer columns than the one I selected?", a: "Rows with missing cells output an empty string for that position, so every input row still produces one output line." },
        { q: "Can I extract from tab-separated (TSV) files?", a: "Yes — select Tab as the delimiter. TSV is common in spreadsheet exports and database dumps." },
      ],
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
        <AutoTextarea className="input min-h-[200px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
        <AutoTextarea readOnly className="input min-h-[200px] font-mono text-xs" value={out} />
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
      faq: [
        { q: "How do I remove lines that contain a specific word?", a: "Type the word in the Pattern field and select Drop mode. Every line containing that word will be removed from the output." },
        { q: "Can I filter using regular expressions?", a: "Yes — enable the Regex toggle and enter any JavaScript regular expression, such as ^error to match lines starting with 'error'." },
        { q: "Is the filter case-sensitive?", a: "No by default. Enable 'Case sensitive' if you need exact case matching, for example to distinguish 'NULL' from 'null'." },
        { q: "What is a common use case for list filtering?", a: "Cleaning log files by removing noise lines, extracting only error lines from a large output, or filtering a CSV export by a keyword." },
      ],
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
        <AutoTextarea className="input min-h-[200px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
        <AutoTextarea readOnly className="input min-h-[200px] font-mono text-xs" value={out} />
      </div>
      <div className="mt-2">{copyBtn(out)}</div>
    </ToolPage>
  );
}
