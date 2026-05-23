"use client";

import { useMemo, useState } from "react";
import { Copy, Plus, Minus, ArrowRight, Equal } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

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
    return { changes: diff(parsedA, parsedB) };
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
            <textarea
              id="json-left"
              className="input min-h-[260px] font-mono text-xs"
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div>
            <label className="label" htmlFor="json-right">Right (after / actual)</label>
            <textarea
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
      </div>
    </ToolPage>
  );
}
