"use client";

import { useMemo, useState } from "react";
import { Copy, Plus, Minus, ArrowRight, Equal } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

// Semantic JSON diff: compares values by path, ignoring key order. Returns a
// flat list of changes so we can render them clearly. Recursive but bounded
// by the structure of the input — JSON can't be cyclic.
type Change =
  | { kind: "added"; path: string; value: unknown }
  | { kind: "removed"; path: string; value: unknown }
  | { kind: "changed"; path: string; before: unknown; after: unknown };

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function diff(a: unknown, b: unknown, path = "$"): Change[] {
  // Equal primitives or both null → no change
  if (a === b) return [];

  // One is null, the other isn't
  if (a === null || b === null || a === undefined || b === undefined) {
    return [{ kind: "changed", path, before: a, after: b }];
  }

  // Both arrays — compare element-by-element. Length differences show as
  // added/removed at the longer indices.
  if (Array.isArray(a) && Array.isArray(b)) {
    const out: Change[] = [];
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) out.push({ kind: "added", path: p, value: b[i] });
      else if (i >= b.length) out.push({ kind: "removed", path: p, value: a[i] });
      else out.push(...diff(a[i], b[i], p));
    }
    return out;
  }

  // Both objects — compare by union of keys
  if (isObject(a) && isObject(b)) {
    const out: Change[] = [];
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const p = `${path}.${k}`;
      if (!(k in a)) out.push({ kind: "added", path: p, value: b[k] });
      else if (!(k in b)) out.push({ kind: "removed", path: p, value: a[k] });
      else out.push(...diff(a[k], b[k], p));
    }
    return out;
  }

  // Type mismatch or different primitives
  return [{ kind: "changed", path, before: a, after: b }];
}

function renderValue(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
}

// Normalize: pretty-print with sorted keys at every level so the two outputs
// can be compared line-for-line. Sorting is what makes the visual diff useful
// — otherwise a key reordering creates a wall of noise.
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[k] = sortKeysDeep((value as Record<string, unknown>)[k]);
    }
    return sorted;
  }
  return value;
}

// Walk and collect every leaf path so we can count "fields identical."
function leafPaths(value: unknown, path = "$"): string[] {
  if (Array.isArray(value)) {
    if (value.length === 0) return [path];
    return value.flatMap((item, i) => leafPaths(item, `${path}[${i}]`));
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return [path];
    return entries.flatMap(([k, v]) => leafPaths(v, `${path}.${k}`));
  }
  return [path];
}

// Build a per-line classification for the normalized output. For each line of
// the sorted-pretty-printed JSON, decide whether that line is part of a diff
// (and which kind) by looking at which JSONPaths the diff touched.
type LineKind = "same" | "added" | "removed" | "changed";

function classifyLines(normalized: string, changedPaths: { added: Set<string>; removed: Set<string>; changed: Set<string> }, side: "left" | "right"): LineKind[] {
  // We re-stringify with a custom replacer that emits a sentinel comment per
  // line — too invasive. Simpler approach: re-walk the value tracking a path
  // stack as we render. JSON.stringify-with-indent produces predictable
  // formatting, so we can track depth-by-line and match keys to paths.
  //
  // Best practical approach: parse the normalized text and identify the path
  // at each line by tracking object-key context with a small state machine.
  const lines = normalized.split("\n");
  const out: LineKind[] = new Array(lines.length).fill("same");

  // Stack of contexts: each entry is either {kind:'object', path} or {kind:'array', path, index}
  type Ctx = { kind: "object" | "array"; path: string; index?: number };
  const stack: Ctx[] = [];
  let currentPath = "$";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Compute the path for THIS line before adjusting stack for opens/closes
    // on this same line.
    const top = stack[stack.length - 1];

    // Detect object key: "key": ... (handle nested quotes via simple match)
    const keyMatch = trimmed.match(/^"((?:[^"\\]|\\.)*)"\s*:/);
    let lineKey: string | null = null;
    if (keyMatch && top?.kind === "object") {
      lineKey = JSON.parse(`"${keyMatch[1]}"`);
      currentPath = `${top.path}.${lineKey}`;
    } else if (top?.kind === "array") {
      // For array items, the path is parent[index]. We bump index after each
      // top-level child line — but a child can span multiple lines (nested
      // object). We treat the line that contains the start of a child as
      // index-bearing, and bump index when we see a closing brace at the
      // array's depth or a top-level scalar.
      currentPath = `${top.path}[${top.index ?? 0}]`;
    }

    // Classify this line against the change paths.
    // - "added" lines (only present in right) — only meaningful for the right side
    // - "removed" lines (only present in left) — only meaningful for the left side
    // - "changed" — both sides, but the value differs
    if (side === "left") {
      if (changedPaths.removed.has(currentPath)) out[i] = "removed";
      else if (changedPaths.changed.has(currentPath)) out[i] = "changed";
    } else {
      if (changedPaths.added.has(currentPath)) out[i] = "added";
      else if (changedPaths.changed.has(currentPath)) out[i] = "changed";
    }
    // Also color descendant paths (e.g. when an entire object is added, every
    // line of its body should be tinted too).
    for (const p of (side === "left" ? changedPaths.removed : changedPaths.added)) {
      if (currentPath.startsWith(p + ".") || currentPath.startsWith(p + "[")) {
        out[i] = side === "left" ? "removed" : "added";
        break;
      }
    }

    // Update the stack based on what this line opens/closes.
    // We track only structural braces/brackets at the END of the line for
    // open, and at the START for close. Standard pretty-print places opens
    // at end-of-line and closes on their own line, so this is reliable.
    if (trimmed.endsWith("{")) {
      stack.push({ kind: "object", path: currentPath });
    } else if (trimmed.endsWith("[")) {
      stack.push({ kind: "array", path: currentPath, index: 0 });
    }
    if (trimmed.startsWith("}") || trimmed.startsWith("]")) {
      stack.pop();
      // After popping, if we're now inside an array, bump its index because
      // that nested structure was one array element.
      const newTop = stack[stack.length - 1];
      if (newTop?.kind === "array") newTop.index = (newTop.index ?? 0) + 1;
    } else if (top?.kind === "array" && (trimmed.endsWith(",") || (i + 1 < lines.length && /^\s*[\]]/.test(lines[i + 1])))) {
      // Top-level scalar element in an array — bump after this line if there
      // was no nested structure opened.
      if (!trimmed.endsWith("{") && !trimmed.endsWith("[")) {
        top.index = (top.index ?? 0) + 1;
      }
    }
  }

  return out;
}

const KIND_BG: Record<LineKind, string> = {
  same: "",
  added: "bg-emerald-100/60 dark:bg-emerald-950/40",
  removed: "bg-red-100/60 dark:bg-red-950/40",
  changed: "bg-amber-100/60 dark:bg-amber-950/40",
};

const KIND_MARKER: Record<LineKind, string> = {
  same: "  ",
  added: "+ ",
  removed: "- ",
  changed: "~ ",
};

const SAMPLE_A = `{
  "id": 42,
  "name": "Alice",
  "tags": ["admin", "user"],
  "address": {
    "city": "NYC",
    "zip": "10001"
  },
  "deprecated_field": "remove me"
}`;

const SAMPLE_B = `{
  "name": "Alice",
  "id": 42,
  "tags": ["admin", "user", "beta"],
  "address": {
    "zip": "10001",
    "city": "Brooklyn"
  },
  "new_field": "added"
}`;

export default function JsonDiff({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [left, setLeft] = useState(SAMPLE_A);
  const [right, setRight] = useState(SAMPLE_B);

  const result = useMemo(() => {
    let parsedA: unknown, parsedB: unknown;
    try { parsedA = JSON.parse(left); } catch (e: any) { return { error: `Left JSON: ${e.message}` }; }
    try { parsedB = JSON.parse(right); } catch (e: any) { return { error: `Right JSON: ${e.message}` }; }
    return { changes: diff(parsedA, parsedB), parsedA, parsedB };
  }, [left, right]);

  function copyDiff() {
    if (!result.changes) return;
    const lines = result.changes.map((c) => {
      if (c.kind === "added") return `+ ${c.path}  ${renderValue(c.value)}`;
      if (c.kind === "removed") return `- ${c.path}  ${renderValue(c.value)}`;
      return `~ ${c.path}  ${renderValue(c.before)} -> ${renderValue(c.after)}`;
    });
    navigator.clipboard.writeText(lines.join("\n"));
  }

  const summary = result.changes ? {
    added: result.changes.filter((c) => c.kind === "added").length,
    removed: result.changes.filter((c) => c.kind === "removed").length,
    changed: result.changes.filter((c) => c.kind === "changed").length,
  } : null;

  // Normalized side-by-side view: pretty-printed, keys sorted at every level,
  // with each line tinted based on whether it's part of a diff. Together with
  // the path-based diff list above, this gives users both the structural view
  // and the high-density list.
  const sideBySide = useMemo(() => {
    if (!result.changes || !("parsedA" in result)) return null;
    const a = sortKeysDeep(result.parsedA);
    const b = sortKeysDeep(result.parsedB);
    const leftText = JSON.stringify(a, null, 2);
    const rightText = JSON.stringify(b, null, 2);
    const added = new Set(result.changes.filter((c) => c.kind === "added").map((c) => c.path));
    const removed = new Set(result.changes.filter((c) => c.kind === "removed").map((c) => c.path));
    const changed = new Set(result.changes.filter((c) => c.kind === "changed").map((c) => c.path));
    const leftKinds = classifyLines(leftText, { added, removed, changed }, "left");
    const rightKinds = classifyLines(rightText, { added, removed, changed }, "right");
    const leafCountA = leafPaths(result.parsedA).length;
    const leafCountB = leafPaths(result.parsedB).length;
    const totalLeaves = Math.max(leafCountA, leafCountB);
    const differingLeaves = added.size + removed.size + changed.size;
    const identicalLeaves = Math.max(0, totalLeaves - differingLeaves);
    return {
      leftLines: leftText.split("\n"),
      rightLines: rightText.split("\n"),
      leftKinds,
      rightKinds,
      identicalLeaves,
      totalLeaves,
    };
  }, [result]);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Paste two JSON values side-by-side. The diff compares them semantically — by value, not by text — so key reordering is ignored. Added keys appear in green, removed in red, changed in amber, each with the JSONPath where the difference lives.",
        formula: "Semantic diff walks both values in parallel: objects are compared by union of keys, arrays element-by-element, primitives by equality. Output is a flat list of (path, change) pairs rather than a text diff.",
        examples: 'Two responses with the same fields in a different order produce no diff. Adding a tag to an array shows as `+ $.tags[2]`. Changing a nested value shows as `~ $.address.city  "NYC" -> "Brooklyn"`.',
        faq: [
          { q: "Why not just use a text diff?", a: "Text diff treats key order as significant — `{\"a\":1,\"b\":2}` and `{\"b\":2,\"a\":1}` look different even though they're semantically identical. APIs often return keys in different orders across calls (especially across language bindings), so text diff produces noise for working JSON." },
          { q: "How does array diffing work?", a: "Element-by-element, by index. So `[1,2,3]` vs `[1,2,3,4]` shows as `+ $[3]  4`. `[1,2,3]` vs `[3,2,1]` shows three changes (every position differs). Set-style diffing where order doesn't matter is a different operation — for that, sort both arrays before pasting, or use the List Set Operations tool." },
          { q: "Can I diff two large JSON files?", a: "The diff is in-browser and handles a few MB comfortably. Beyond that, browser JSON.parse + diff gets slow (seconds, not minutes). For multi-megabyte files, use a command-line tool like `jd` or `dyff`." },
          { q: "Does it handle JSON5 / comments / trailing commas?", a: "No — strict JSON only. If your input has comments or trailing commas, strip them first (or paste through the JSON Formatter, which will reject them with a clear error)." },
          { q: "What's JSONPath?", a: "The standard syntax for pointing into a JSON document. `$` is the root, `.key` is an object property, `[i]` is an array index. So `$.users[2].name` means \"the name of the third user.\" The same paths work in tools like jq (with slightly different syntax) and JSONPath libraries." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="grid lg:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="json-left">Left (before / expected)</label>
            <AutoTextarea
              id="json-left"
              className="input min-h-[260px] font-mono text-xs"
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div>
            <label className="label" htmlFor="json-right">Right (after / actual)</label>
            <AutoTextarea
              id="json-right"
              className="input min-h-[260px] font-mono text-xs"
              value={right}
              onChange={(e) => setRight(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        {result.error && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300 font-mono">
            {result.error}
          </div>
        )}

        {result.changes && (
          <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-muted,250,250,252))] gap-3 flex-wrap">
              <div className="flex items-center gap-3 text-xs">
                {result.changes.length === 0 ? (
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300"><Equal className="h-3.5 w-3.5" /> Identical</span>
                ) : (
                  <>
                    {summary!.added > 0 && <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300"><Plus className="h-3.5 w-3.5" /> {summary!.added} added</span>}
                    {summary!.removed > 0 && <span className="flex items-center gap-1 text-red-700 dark:text-red-300"><Minus className="h-3.5 w-3.5" /> {summary!.removed} removed</span>}
                    {summary!.changed > 0 && <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300"><ArrowRight className="h-3.5 w-3.5" /> {summary!.changed} changed</span>}
                  </>
                )}
              </div>
              {result.changes.length > 0 && (
                <button onClick={copyDiff} className="btn-ghost text-xs"><Copy className="h-3.5 w-3.5" /> Copy diff</button>
              )}
            </div>
            {result.changes.length === 0 ? (
              <div className="p-6 text-center text-sm text-[rgb(var(--fg-muted))]">No semantic differences — the two values are equal.</div>
            ) : (
              <ul className="divide-y divide-[rgb(var(--border))]">
                {result.changes.map((c, i) => (
                  <li key={i} className="p-3 text-xs font-mono">
                    {c.kind === "added" && (
                      <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                        <Plus className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1"><span className="font-bold">{c.path}</span> <span className="opacity-70">{renderValue(c.value)}</span></div>
                      </div>
                    )}
                    {c.kind === "removed" && (
                      <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                        <Minus className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1"><span className="font-bold">{c.path}</span> <span className="opacity-70">{renderValue(c.value)}</span></div>
                      </div>
                    )}
                    {c.kind === "changed" && (
                      <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
                        <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-bold">{c.path}</span>{" "}
                          <span className="opacity-70 line-through">{renderValue(c.before)}</span>
                          {" → "}
                          <span className="opacity-90">{renderValue(c.after)}</span>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {sideBySide && (
          <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
            <div className="px-3 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-muted,250,250,252))] text-xs flex items-center justify-between gap-3 flex-wrap">
              <span className="font-medium">Normalized side-by-side (keys sorted)</span>
              <span className="text-[rgb(var(--fg-muted))]">
                {sideBySide.identicalLeaves} of {sideBySide.totalLeaves} fields identical
              </span>
            </div>
            <div className="grid lg:grid-cols-2 gap-px bg-[rgb(var(--border))]">
              <pre className="bg-[rgb(var(--bg))] font-mono text-[11px] overflow-auto max-h-[480px] m-0">
                {sideBySide.leftLines.map((line, i) => (
                  <div
                    key={i}
                    className={`px-3 py-px ${KIND_BG[sideBySide.leftKinds[i]]}`}
                  >
                    <span className="select-none opacity-40 mr-2">{KIND_MARKER[sideBySide.leftKinds[i]]}</span>
                    <span>{line || " "}</span>
                  </div>
                ))}
              </pre>
              <pre className="bg-[rgb(var(--bg))] font-mono text-[11px] overflow-auto max-h-[480px] m-0">
                {sideBySide.rightLines.map((line, i) => (
                  <div
                    key={i}
                    className={`px-3 py-px ${KIND_BG[sideBySide.rightKinds[i]]}`}
                  >
                    <span className="select-none opacity-40 mr-2">{KIND_MARKER[sideBySide.rightKinds[i]]}</span>
                    <span>{line || " "}</span>
                  </div>
                ))}
              </pre>
            </div>
            <div className="px-3 py-1.5 border-t border-[rgb(var(--border))] text-[10px] text-[rgb(var(--fg-muted))]">
              Both inputs re-rendered with sorted keys and 2-space indent so a true line-for-line comparison is meaningful. Original input formatting in the textareas above is preserved.
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
