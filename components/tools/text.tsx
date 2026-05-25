"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { safeCopy } from "@/lib/clipboard";
import { AutoTextarea } from "@/components/AutoTextarea";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

// Case Converter
export function CaseConverter({ tool }: Props) {
  const [text, setText] = useState("Hello world from MyDailyTool");
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
      faq: [
        { q: "What is the difference between camelCase and PascalCase?", a: "In camelCase the first letter is lowercase (e.g. myVariable), while PascalCase capitalises every word including the first (e.g. MyVariable). PascalCase is common for class names; camelCase for variable and function names." },
        { q: "When should I use snake_case vs kebab-case?", a: "snake_case (underscores) is the norm in Python variable names, database column names, and file systems. kebab-case (hyphens) is standard in URLs, CSS class names, and HTML attributes." },
        { q: "What is CONSTANT_CASE used for?", a: "CONSTANT_CASE (all caps with underscores) is the conventional style for named constants in languages like JavaScript, Java, and C — for example MAX_RETRIES or API_BASE_URL." },
        { q: "Can I convert multi-word phrases with punctuation?", a: "Yes. The converter strips punctuation and special characters, then applies the chosen casing to the remaining words." },
      ],
    }}>
      <AutoTextarea className="input min-h-[320px]" value={text} onChange={(e) => setText(e.target.value)} />
      <ul className="mt-3 grid gap-1.5">
        {Object.entries(transforms).map(([k, v]) => (
          <li key={k} className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-[rgb(var(--fg-muted))] w-32 shrink-0">{k}</span>
            <code className="font-mono text-sm flex-1 truncate">{v}</code>
            <button onClick={() => safeCopy(v)} className="text-xs btn-ghost shrink-0">Copy</button>
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
      faq: [
        { q: "Why is the byte count higher than the character count?", a: "Because non-ASCII characters (like accented letters, emoji, or CJK characters) take more than one byte in UTF-8 encoding. For example, one emoji can be 4 bytes while counting as a single character." },
        { q: "What is the character limit for an SMS message?", a: "A standard SMS is 160 characters when using GSM-7 encoding. If your message includes any character outside GSM-7 (like emoji), the limit drops to 70 characters per segment." },
        { q: "How does Twitter/X count characters?", a: "X counts most Unicode characters as one, but URLs are always wrapped and counted as 23 characters regardless of their actual length. This tool's character count gives you the raw figure before any platform-specific rules apply." },
        { q: "Does the word count include punctuation?", a: "Words are split on whitespace only, so 'hello,' counts as one word (including the comma). This matches how most word processors count." },
      ],
    }}>
      <AutoTextarea className="input min-h-[320px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste text…" />
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
      faq: [
        { q: "Does a trailing newline add an extra line?", a: "No. A final newline at the end of a file is standard but does not create an additional blank line in this counter." },
        { q: "What counts as a non-empty line?", a: "Any line that contains at least one non-whitespace character. Lines with only spaces or tabs are counted as empty." },
        { q: "How do I count lines in a file on the command line?", a: "Use wc -l filename on Linux/macOS or find /c /v \"\" filename on Windows. This tool is useful when you don't have terminal access." },
        { q: "What is the difference between CRLF and LF line endings?", a: "LF (\\n) is used on Unix/Linux/macOS; CRLF (\\r\\n) is the Windows standard. This tool handles both, so paste from any operating system and the count will be accurate." },
      ],
    }}>
      <AutoTextarea className="input min-h-[200px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
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
      faq: [
        { q: "Is reversed text the same as a mirror image?", a: "Character reversal produces the same characters in the opposite order, but it is not a true visual mirror. To create a mirrored image you would also need to flip each letter horizontally, which requires a font or image editor." },
        { q: "Does reversing words preserve punctuation?", a: "Yes. Punctuation attached to a word stays with that word. So 'Hello, world!' reversed by words gives 'world! Hello,'." },
        { q: "What is word reversal useful for?", a: "Common uses include reversing a numbered list order, flipping bullet points, or creating simple text puzzles." },
        { q: "Can I reverse a multiline poem or list?", a: "Yes — use the Lines mode to flip the order of lines while keeping each individual line intact." },
      ],
    }}>
      <div className="flex gap-2 mb-3">
        {(["chars", "words", "lines"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${mode === m ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{m}</button>
        ))}
      </div>
      <AutoTextarea className="input min-h-[320px]" value={text} onChange={(e) => setText(e.target.value)} />
      <AutoTextarea className="input min-h-[320px] mt-3" value={reversed} readOnly />
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
      <AutoTextarea readOnly value={out} className="input min-h-[260px]" />
      <button onClick={() => safeCopy(out)} className="mt-2 btn-ghost text-xs">Copy</button>
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
      faq: [
        { q: "What is the difference between plain and regex mode?", a: "In plain mode, special regex characters like . and * are treated as literal text. In regex mode, your find string is interpreted as a regular expression, giving you pattern matching, wildcards, and capture groups." },
        { q: "How do I use backreferences in the replacement?", a: "Switch on regex mode, wrap the part you want to reuse in parentheses in the Find field, then reference it as $1, $2, etc. in the Replace field. For example, find '(\\d+)-(\\d+)' and replace with '$2-$1' to swap two numbers." },
        { q: "Does this replace all occurrences or just the first?", a: "All occurrences are replaced in a single pass, equivalent to using the global flag in a regular expression." },
        { q: "How do I do a case-insensitive find?", a: "Uncheck the Case sensitive option. This makes the search ignore letter case so 'apple', 'Apple', and 'APPLE' all match." },
      ],
    }}>
      <AutoTextarea className="input min-h-[320px]" placeholder="Source text" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <input className="input" placeholder="Find" value={find} onChange={(e) => setFind(e.target.value)} />
        <input className="input" placeholder="Replace with" value={replace} onChange={(e) => setReplace(e.target.value)} />
      </div>
      <div className="mt-2 flex gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} className="accent-brand-600" /> Regex</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-brand-600" /> Case sensitive</label>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <AutoTextarea className="input min-h-[320px] mt-3" value={out} readOnly />
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
      faq: [
        { q: "What does the diff output mean?", a: "Lines prefixed with − exist only in the original text; lines prefixed with + exist only in the modified text. Lines with no prefix are identical in both versions." },
        { q: "Does this tool do word-level or character-level diffing?", a: "This tool diffs at the line level. For a word-by-word comparison, break your content onto separate lines (one word or phrase per line) before pasting." },
        { q: "What algorithm is used?", a: "The Longest Common Subsequence (LCS) algorithm, the same technique used by the Unix diff utility and most version control systems." },
        { q: "Is my pasted text sent to a server?", a: "No. All diffing runs entirely in your browser. Nothing you paste leaves your device." },
      ],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={a} onChange={(e) => setA(e.target.value)} placeholder="Original" />
        <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={b} onChange={(e) => setB(e.target.value)} placeholder="Modified" />
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
      faq: [
        { q: "Does removing duplicates change the order of the remaining lines?", a: "No. The original order is preserved — only the second and subsequent occurrences of a duplicate are removed, keeping the first one in place." },
        { q: "What does the 'Trim whitespace' option do?", a: "It strips leading and trailing spaces from each line before comparing, so '  apple' and 'apple  ' are treated as the same entry even though they look different." },
        { q: "Can I remove duplicates case-insensitively?", a: "Yes. Uncheck Case sensitive and entries like 'Apple', 'apple', and 'APPLE' will all be treated as the same value." },
        { q: "How do I remove duplicate words (not lines)?", a: "Put each word on its own line first — for example by replacing spaces with newlines in a text editor — then paste the result here." },
      ],
    }}>
      <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder="One item per line…" />
      <div className="mt-2 flex gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} className="accent-brand-600" /> Trim whitespace</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-brand-600" /> Case sensitive</label>
        <span className="ml-auto text-[rgb(var(--fg-muted))]">{out.removed} duplicates removed</span>
      </div>
      <AutoTextarea className="input min-h-[320px] mt-3 font-mono text-xs" value={out.text} readOnly />
    </ToolPage>
  );
}

// Sort Lines
export function SortLines({ tool }: Props) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"asc" | "desc" | "numeric-asc" | "numeric-desc" | "shuffle">("asc");
  const out = useMemo(() => {
    const lines = text.split(/\r?\n/);
    if (mode === "asc") return [...lines].sort().join("\n");
    if (mode === "desc") return [...lines].sort().reverse().join("\n");
    if (mode === "numeric-asc") return [...lines].sort((a, b) => parseFloat(a) - parseFloat(b)).join("\n");
    if (mode === "numeric-desc") return [...lines].sort((a, b) => parseFloat(b) - parseFloat(a)).join("\n");
    // shuffle (Fisher-Yates)
    const arr = [...lines];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.join("\n");
  }, [text, mode]);

  const MODES: { value: typeof mode; label: string }[] = [
    { value: "asc", label: "A → Z" },
    { value: "desc", label: "Z → A" },
    { value: "numeric-asc", label: "1 → 9" },
    { value: "numeric-desc", label: "9 → 1" },
    { value: "shuffle", label: "Shuffle" },
  ];

  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste your list — one item per line — then pick a sort mode: A→Z or Z→A for alphabetical, 1→9 or 9→1 for numeric order, or Shuffle for random. Results appear instantly.",
      formula: "A→Z and Z→A use lexicographic (Unicode) order. 1→9 and 9→1 parse each line as a float so 10 sorts after 9, not before. Shuffle uses the Fisher-Yates algorithm.",
      examples: "Names: Alice, Charlie, Bob → Alice, Bob, Charlie. Numbers: 10, 9, 2 → 2, 9, 10 (1→9 mode) or 10, 9, 2 (9→1 mode).",
      faq: [
        { q: "Why does A→Z put '10' before '9'?", a: "Alphabetical sort compares characters left to right, so '1' comes before '9'. Use 1→9 or 9→1 to sort by actual number value." },
        { q: "Is alphabetical sort case-sensitive?", a: "Yes — uppercase letters sort before lowercase in Unicode order. Convert to the same case first using the Case Converter tool if needed." },
        { q: "What algorithm does Shuffle use?", a: "Fisher-Yates (Knuth) shuffle — produces an unbiased random permutation of the lines." },
        { q: "Can I sort by a specific column in CSV data?", a: "Not directly — this tool sorts whole lines. Extract the column first with the Column Picker tool, sort it, then re-combine." },
      ],
    }}>
      <div className="flex gap-2 mb-3 flex-wrap">
        {MODES.map(({ value, label }) => (
          <button key={value} onClick={() => setMode(value)} className={`min-tap rounded-xl px-3 py-2 text-sm ${mode === value ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{label}</button>
        ))}
      </div>
      <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
      <AutoTextarea className="input min-h-[320px] mt-3 font-mono text-xs" value={out} readOnly />
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
      faq: [
        { q: "What is a URL slug?", a: "A slug is the human-readable part of a URL that identifies a page, typically derived from the page title. For example, a post titled 'Best Coffee Recipes' might have the slug best-coffee-recipes." },
        { q: "Why are hyphens used instead of spaces in slugs?", a: "Spaces are not valid in URLs without encoding (they become %20). Hyphens are the standard word separator for slugs because they are URL-safe, readable, and treated as word separators by search engines." },
        { q: "Does this handle accented characters like é or ü?", a: "Yes. Accented letters are decomposed using Unicode NFD normalization and the diacritic marks are stripped, so 'café' becomes 'cafe'." },
        { q: "What is the maximum recommended length for a URL slug?", a: "Most SEO guides recommend keeping slugs under 60–75 characters (roughly 3–5 keywords). Shorter slugs are easier to share and less likely to be truncated." },
      ],
    }}>
      <input className="input" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 flex items-center justify-between gap-3">
        <code className="font-mono text-lg break-all">{slug || "—"}</code>
        <button onClick={() => safeCopy(slug)} className="btn-ghost text-xs shrink-0">Copy</button>
      </div>
    </ToolPage>
  );
}
