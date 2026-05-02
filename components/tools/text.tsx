"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

// Case Converter
export function CaseConverter({ tool }: Props) {
  const [text, setText] = useState("Hello world from MyDailyTools");
  const transforms = {
    "UPPERCASE": text.toUpperCase(),
    "lowercase": text.toLowerCase(),
    "Title Case": text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()),
    "Sentence case": text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
    "camelCase": text.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    "PascalCase": text.toLowerCase().replace(/(?:^|[^a-z0-9]+)(.)/g, (_, c) => c.toUpperCase()),
    "snake_case": text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
    "kebab-case": text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    "CONSTANT_CASE": text.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, ""),
    "aLtErNaTiNg": [...text].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join(""),
  };
  return (
    <ToolPage tool={tool} content={{
      howTo: "Type or paste text. Every common case is shown side-by-side; click the copy icon on any row to grab it.",
      formula: "camelCase: lowercase first word, capitalize the rest. snake_case: lowercase, underscore-separated. kebab-case: lowercase, hyphen-separated.",
      examples: '"Hello world" → camelCase "helloWorld", PascalCase "HelloWorld", snake_case "hello_world".',
      faq: [],
    }}>
      <textarea className="input min-h-[80px]" value={text} onChange={(e) => setText(e.target.value)} />
      <ul className="mt-3 grid gap-1.5">
        {Object.entries(transforms).map(([k, v]) => (
          <li key={k} className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-[rgb(var(--fg-muted))] w-32 shrink-0">{k}</span>
            <code className="font-mono text-sm flex-1 truncate">{v}</code>
            <button onClick={() => navigator.clipboard.writeText(v)} className="text-xs btn-ghost shrink-0">Copy</button>
          </li>
        ))}
      </ul>
    </ToolPage>
  );
}

// Character Counter
export function CharacterCounter({ tool }: Props) {
  const [text, setText] = useState("");
  const stats = {
    chars: text.length,
    noSpaces: text.replace(/\s/g, "").length,
    bytes: new Blob([text]).size,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
  };
  return (
    <ToolPage tool={tool} content={{
      howTo: "Type or paste text. Characters with and without spaces, byte length (UTF-8), and word count update live.",
      formula: "Bytes: TextEncoder UTF-8 byte length. Useful for SMS limits (160 chars), tweet limits, JSON column limits, etc.",
      examples: "'Hello' = 5 chars, 5 bytes. '日本' = 2 chars but 6 bytes in UTF-8.",
      faq: [],
    }}>
      <textarea className="input min-h-[160px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste text…" />
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-[rgb(var(--border))] p-3 text-center">
            <div className="text-xs text-[rgb(var(--fg-muted))] capitalize">{k.replace(/([A-Z])/g, " $1")}</div>
            <div className="text-lg font-semibold tabular-nums">{v}</div>
          </div>
        ))}
      </div>
    </ToolPage>
  );
}

// Line Counter
export function LineCounter({ tool }: Props) {
  const [text, setText] = useState("");
  const lines = text === "" ? [] : text.split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim().length > 0).length;
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste text — total and non-empty line counts update live.",
      formula: "Total lines: count of \\n-separated chunks (final line counted even without trailing newline). Non-empty: lines with at least one non-whitespace character.",
      examples: "Three lines with one blank → total 3, non-empty 2.",
      faq: [],
    }}>
      <textarea className="input min-h-[200px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[rgb(var(--border))] p-3 text-center"><div className="text-xs text-[rgb(var(--fg-muted))]">Total lines</div><div className="text-2xl font-semibold tabular-nums">{lines.length}</div></div>
        <div className="rounded-xl border border-[rgb(var(--border))] p-3 text-center"><div className="text-xs text-[rgb(var(--fg-muted))]">Non-empty</div><div className="text-2xl font-semibold tabular-nums">{nonEmpty}</div></div>
      </div>
    </ToolPage>
  );
}

// Text Reverser
export function TextReverser({ tool }: Props) {
  const [text, setText] = useState("Hello, world");
  const [mode, setMode] = useState<"chars" | "words" | "lines">("chars");
  const reversed = useMemo(() => {
    if (mode === "chars") return [...text].reverse().join("");
    if (mode === "words") return text.split(/(\s+)/).reverse().join("");
    return text.split(/\n/).reverse().join("\n");
  }, [text, mode]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick reversal mode (characters, words, or lines), type text, and the result updates instantly.",
      formula: "Characters: reverse Unicode code points. Words: keep whitespace tokens but reverse word order. Lines: reverse the array of lines.",
      examples: '"Hello, world" → chars: "dlrow ,olleH". Words: "world Hello,".',
      faq: [],
    }}>
      <div className="flex gap-2 mb-3">
        {(["chars", "words", "lines"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${mode === m ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{m}</button>
        ))}
      </div>
      <textarea className="input min-h-[100px]" value={text} onChange={(e) => setText(e.target.value)} />
      <textarea className="input min-h-[100px] mt-3" value={reversed} readOnly />
    </ToolPage>
  );
}

// Lorem Ipsum Generator
const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
export function LoremIpsum({ tool }: Props) {
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [startWith, setStartWith] = useState(true);
  const out = useMemo(() => {
    function word() { return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]; }
    function sentence() {
      const len = 6 + Math.floor(Math.random() * 14);
      const arr = Array.from({ length: len }, word);
      arr[0] = arr[0][0].toUpperCase() + arr[0].slice(1);
      return arr.join(" ") + ".";
    }
    if (type === "words") return Array.from({ length: count }, word).join(" ");
    if (type === "sentences") return Array.from({ length: count }, sentence).join(" ");
    const paras = Array.from({ length: count }, () => Array.from({ length: 3 + Math.floor(Math.random() * 4) }, sentence).join(" "));
    if (startWith) paras[0] = "Lorem ipsum dolor sit amet, " + paras[0].toLowerCase().slice(0, paras[0].length - 1) + ".";
    return paras.join("\n\n");
  }, [type, count, startWith]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick what to generate (words/sentences/paragraphs) and how many. Click Regenerate to get a new sample.",
      formula: "Random words drawn from the standard Lorem Ipsum vocabulary. Paragraphs are 3–6 sentences each; sentences are 6–20 words.",
      examples: "Designers use 1–3 paragraphs of lorem to mock up layouts without real content.",
      faq: [{ q: "Where does Lorem Ipsum come from?", a: "It is adapted from Cicero (De Finibus Bonorum et Malorum, 45 BC), used as printer filler text since the 1500s." }],
    }}>
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option>
        </select>
        <input type="number" className="input" min={1} max={50} value={count} onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value))))} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={startWith} onChange={(e) => setStartWith(e.target.checked)} className="accent-brand-600" /> Start with &ldquo;Lorem ipsum&hellip;&rdquo;</label>
      </div>
      <textarea readOnly value={out} className="input min-h-[260px]" />
      <button onClick={() => navigator.clipboard.writeText(out)} className="mt-2 btn-ghost text-xs">Copy</button>
    </ToolPage>
  );
}

// Find & Replace
export function FindReplace({ tool }: Props) {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [regex, setRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const out = useMemo(() => {
    if (!find) return text;
    try {
      if (regex) {
        const flags = "g" + (caseSensitive ? "" : "i");
        const re = new RegExp(find, flags);
        setError(null);
        return text.replace(re, replace);
      }
      const flags = "g" + (caseSensitive ? "" : "i");
      const re = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      setError(null);
      return text.replace(re, replace);
    } catch (e: any) {
      setError(e.message);
      return text;
    }
  }, [text, find, replace, regex, caseSensitive]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste text, enter what to find and what to replace with. Toggle regex mode to use patterns (capture groups: $1, $2…).",
      formula: "Plain mode escapes special regex characters so you find literal text. Regex mode uses your pattern as-is. Replacement supports $1..$9 backreferences.",
      examples: 'Plain: find "color" → "colour" replaces every occurrence. Regex: find "(\\w+)@(\\w+)" → replace "$2/$1".',
      faq: [],
    }}>
      <textarea className="input min-h-[120px]" placeholder="Source text" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <input className="input" placeholder="Find" value={find} onChange={(e) => setFind(e.target.value)} />
        <input className="input" placeholder="Replace with" value={replace} onChange={(e) => setReplace(e.target.value)} />
      </div>
      <div className="mt-2 flex gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} className="accent-brand-600" /> Regex</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-brand-600" /> Case sensitive</label>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <textarea className="input min-h-[120px] mt-3" value={out} readOnly />
    </ToolPage>
  );
}

// Text Diff (line-level)
export function TextDiff({ tool }: Props) {
  const [a, setA] = useState("apple\nbanana\ncherry");
  const [b, setB] = useState("apple\nblueberry\ncherry\ndate");
  // Simple LCS-based line diff. O(n*m) — fine for short inputs.
  const diff = useMemo(() => {
    const A = a.split("\n"), B = b.split("\n");
    const dp: number[][] = Array.from({ length: A.length + 1 }, () => Array(B.length + 1).fill(0));
    for (let i = 1; i <= A.length; i++) for (let j = 1; j <= B.length; j++) {
      dp[i][j] = A[i-1] === B[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
    }
    const out: { type: "same" | "del" | "ins"; line: string }[] = [];
    let i = A.length, j = B.length;
    while (i > 0 && j > 0) {
      if (A[i-1] === B[j-1]) { out.unshift({ type: "same", line: A[i-1] }); i--; j--; }
      else if (dp[i-1][j] >= dp[i][j-1]) { out.unshift({ type: "del", line: A[i-1] }); i--; }
      else { out.unshift({ type: "ins", line: B[j-1] }); j--; }
    }
    while (i > 0) { out.unshift({ type: "del", line: A[i-1] }); i--; }
    while (j > 0) { out.unshift({ type: "ins", line: B[j-1] }); j--; }
    return out;
  }, [a, b]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste two versions of text. Lines unique to the first are marked −, lines unique to the second are marked +.",
      formula: "Longest common subsequence (LCS) algorithm — O(n × m) time and space. Suitable for short documents.",
      examples: "Compare two configs to spot what changed; compare two paragraphs to see edits.",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <textarea className="input min-h-[180px] font-mono text-xs" value={a} onChange={(e) => setA(e.target.value)} placeholder="Original" />
        <textarea className="input min-h-[180px] font-mono text-xs" value={b} onChange={(e) => setB(e.target.value)} placeholder="Modified" />
      </div>
      <div className="mt-3 rounded-xl border border-[rgb(var(--border))] font-mono text-xs overflow-x-auto">
        {diff.map((d, k) => (
          <div key={k} className={`px-3 py-1 ${d.type === "del" ? "bg-red-500/10 text-red-700 dark:text-red-300" : d.type === "ins" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : ""}`}>
            <span className="opacity-50 mr-2">{d.type === "same" ? "  " : d.type === "del" ? "−" : "+"}</span>{d.line || " "}
          </div>
        ))}
      </div>
    </ToolPage>
  );
}

// Remove duplicate lines
export function RemoveDuplicates({ tool }: Props) {
  const [text, setText] = useState("");
  const [trim, setTrim] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const out = useMemo(() => {
    const seen = new Set<string>();
    const lines = text.split(/\r?\n/);
    const kept: string[] = [];
    for (const raw of lines) {
      const key = (trim ? raw.trim() : raw);
      const k = caseSensitive ? key : key.toLowerCase();
      if (!seen.has(k)) { seen.add(k); kept.push(raw); }
    }
    return { text: kept.join("\n"), removed: lines.length - kept.length };
  }, [text, trim, caseSensitive]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste a list. Duplicates after the first occurrence are removed; original order is preserved.",
      formula: "Maintains a Set of seen keys; first occurrence wins. Optional trim and case-insensitive matching.",
      examples: "Removing duplicates from a list of email addresses, log entries, or config keys.",
      faq: [],
    }}>
      <textarea className="input min-h-[160px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder="One item per line…" />
      <div className="mt-2 flex gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} className="accent-brand-600" /> Trim whitespace</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-brand-600" /> Case sensitive</label>
        <span className="ml-auto text-[rgb(var(--fg-muted))]">{out.removed} duplicates removed</span>
      </div>
      <textarea className="input min-h-[160px] mt-3 font-mono text-xs" value={out.text} readOnly />
    </ToolPage>
  );
}

// Sort Lines
export function SortLines({ tool }: Props) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"asc" | "desc" | "numeric" | "shuffle">("asc");
  const out = useMemo(() => {
    const lines = text.split(/\r?\n/);
    if (mode === "asc") return [...lines].sort().join("\n");
    if (mode === "desc") return [...lines].sort().reverse().join("\n");
    if (mode === "numeric") return [...lines].sort((a, b) => parseFloat(a) - parseFloat(b)).join("\n");
    // shuffle (Fisher-Yates)
    const arr = [...lines];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.join("\n");
  }, [text, mode]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste lines and pick a sort: alphabetical, reverse, numeric, or random shuffle.",
      formula: "Default sort uses lexicographic order (Unicode code points). Numeric mode parses each line as a float.",
      examples: '["b","a","c"] sorted asc → ["a","b","c"]. ["10","9","2"] numeric → ["2","9","10"].',
      faq: [],
    }}>
      <div className="flex gap-2 mb-3 flex-wrap">
        {(["asc", "desc", "numeric", "shuffle"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${mode === m ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{m === "asc" ? "A → Z" : m === "desc" ? "Z → A" : m}</button>
        ))}
      </div>
      <textarea className="input min-h-[160px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
      <textarea className="input min-h-[160px] mt-3 font-mono text-xs" value={out} readOnly />
    </ToolPage>
  );
}

// Slug generator
export function TextToSlug({ tool }: Props) {
  const [text, setText] = useState("My Daily Tools — The Best Free Online Toolbox");
  const slug = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (
    <ToolPage tool={tool} content={{
      howTo: "Type any title or sentence — a clean, URL-safe slug appears below.",
      formula: "Lowercase, NFD-normalize to strip diacritics, replace non-alphanumeric runs with a single hyphen, trim leading/trailing hyphens.",
      examples: '"My Daily Tools — The Best!" → "my-daily-tools-the-best".',
      faq: [],
    }}>
      <input className="input" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 flex items-center justify-between gap-3">
        <code className="font-mono text-lg break-all">{slug || "—"}</code>
        <button onClick={() => navigator.clipboard.writeText(slug)} className="btn-ghost text-xs shrink-0">Copy</button>
      </div>
    </ToolPage>
  );
}
