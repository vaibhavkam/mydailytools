"use client";

import { useEffect, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

// Lightweight JSON → TypeScript inferrer. Handles the 95% case: objects, arrays,
// primitives, nullable fields, simple unions, and nested types. Not as polished
// as quicktype but ~200 lines vs ~80 MB of dependencies.

type TsType =
  | { kind: "primitive"; name: "string" | "number" | "boolean" | "null" | "any" }
  | { kind: "array"; items: TsType }
  | { kind: "object"; fields: Record<string, TsType> }
  | { kind: "union"; types: TsType[] };

function infer(value: unknown): TsType {
  if (value === null) return { kind: "primitive", name: "null" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: "array", items: { kind: "primitive", name: "any" } };
    // Merge all element types into one (potentially union) item type.
    const itemTypes = value.map(infer);
    return { kind: "array", items: mergeTypes(itemTypes) };
  }
  if (typeof value === "object") {
    const fields: Record<string, TsType> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) fields[k] = infer(v);
    return { kind: "object", fields };
  }
  if (typeof value === "string") return { kind: "primitive", name: "string" };
  if (typeof value === "number") return { kind: "primitive", name: "number" };
  if (typeof value === "boolean") return { kind: "primitive", name: "boolean" };
  return { kind: "primitive", name: "any" };
}

// Merge a list of types into a single representative type. Equal types collapse;
// objects with the same shape merge field-wise; otherwise we emit a union.
function mergeTypes(types: TsType[]): TsType {
  if (types.length === 0) return { kind: "primitive", name: "any" };
  if (types.length === 1) return types[0];

  // Bucket by kind so we can decide what to do.
  const byKind = new Map<string, TsType[]>();
  for (const t of types) {
    const k = t.kind;
    byKind.set(k, [...(byKind.get(k) ?? []), t]);
  }

  // All same primitive name → just that primitive.
  if (byKind.size === 1 && byKind.has("primitive")) {
    const names = new Set((byKind.get("primitive") as Extract<TsType, { kind: "primitive" }>[]).map((t) => t.name));
    if (names.size === 1) return { kind: "primitive", name: [...names][0] as any };
    // Mix of primitives → union, but collapse with `null` if present.
    return { kind: "union", types: [...names].map((name) => ({ kind: "primitive", name } as TsType)) };
  }

  // All objects → merge field-by-field. Fields that are missing in some samples
  // become optional (T | null in our scheme; we mark them with the `?` modifier
  // when emitting).
  if (byKind.size === 1 && byKind.has("object")) {
    const objs = byKind.get("object") as Extract<TsType, { kind: "object" }>[];
    const allKeys = new Set<string>();
    objs.forEach((o) => Object.keys(o.fields).forEach((k) => allKeys.add(k)));
    const merged: Record<string, TsType> = {};
    for (const key of allKeys) {
      const present = objs.filter((o) => key in o.fields).map((o) => o.fields[key]);
      const missingFromSome = present.length < objs.length;
      const t = mergeTypes(present);
      merged[key] = missingFromSome ? { kind: "union", types: [t, { kind: "primitive", name: "null" }] } : t;
    }
    return { kind: "object", fields: merged };
  }

  // All arrays → merge their item types.
  if (byKind.size === 1 && byKind.has("array")) {
    const arrs = byKind.get("array") as Extract<TsType, { kind: "array" }>[];
    return { kind: "array", items: mergeTypes(arrs.map((a) => a.items)) };
  }

  // Mixed kinds → union. Flatten any nested unions to keep output clean.
  const flat: TsType[] = [];
  for (const t of types) {
    if (t.kind === "union") flat.push(...t.types);
    else flat.push(t);
  }
  // Dedupe by structural equality (simple JSON-stringify comparison).
  const seen = new Set<string>();
  const unique: TsType[] = [];
  for (const t of flat) {
    const key = JSON.stringify(t);
    if (!seen.has(key)) { seen.add(key); unique.push(t); }
  }
  return unique.length === 1 ? unique[0] : { kind: "union", types: unique };
}

// Render a TsType as TypeScript. Top-level objects become named interfaces;
// nested objects also get extracted to keep the output readable.
function emit(rootName: string, type: TsType): string {
  // Collect every distinct nested object type and assign it a name.
  const interfaces: { name: string; fields: Record<string, TsType> }[] = [];
  const nameCounts: Record<string, number> = {};

  function nameFor(hint: string): string {
    const cap = hint.charAt(0).toUpperCase() + hint.slice(1);
    const base = cap.replace(/[^a-zA-Z0-9]/g, "");
    nameCounts[base] = (nameCounts[base] ?? 0) + 1;
    return nameCounts[base] === 1 ? base : `${base}${nameCounts[base]}`;
  }

  function visit(t: TsType, hint: string): string {
    switch (t.kind) {
      case "primitive": return t.name;
      case "array": return `${wrapIfUnion(visit(t.items, singularize(hint)))}[]`;
      case "union": return t.types.map((u) => visit(u, hint)).join(" | ");
      case "object": {
        const name = nameFor(hint);
        const resolvedFields: Record<string, TsType> = {};
        for (const [k, v] of Object.entries(t.fields)) resolvedFields[k] = v;
        interfaces.push({ name, fields: resolvedFields });
        return name;
      }
    }
  }

  function wrapIfUnion(s: string) {
    return s.includes(" | ") ? `(${s})` : s;
  }

  function singularize(s: string) {
    return s.endsWith("s") && s.length > 1 ? s.slice(0, -1) : s;
  }

  // Kick off rendering with the root type name.
  if (type.kind === "object") {
    visit(type, rootName);
  } else if (type.kind === "array") {
    const itemTypeStr = visit(type.items, singularize(rootName));
    // Top-level array — emit a type alias.
    return `${interfaces.map(emitInterface).join("\n\n")}\n\nexport type ${rootName} = ${itemTypeStr}[];\n`.trim();
  } else {
    return `export type ${rootName} = ${visit(type, rootName)};`;
  }

  return interfaces.map(emitInterface).reverse().join("\n\n");

  function emitInterface({ name, fields }: { name: string; fields: Record<string, TsType> }) {
    const lines: string[] = [`export interface ${name} {`];
    for (const [k, v] of Object.entries(fields)) {
      const nullable = v.kind === "union" && v.types.some((u) => u.kind === "primitive" && u.name === "null");
      const typeStr = visit(v, k);
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      lines.push(`  ${safeKey}${nullable ? "?" : ""}: ${typeStr};`);
    }
    lines.push("}");
    return lines.join("\n");
  }
}

export default function JsonToTypescript({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [json, setJson] = useState('{\n  "id": 42,\n  "name": "Alice",\n  "tags": ["admin", "user"],\n  "address": { "city": "NYC", "zip": "10001" }\n}');
  const [name, setName] = useState("Root");
  const [out, setOut] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function generate() {
    try {
      const parsed = JSON.parse(json);
      const inferred = infer(parsed);
      setOut(emit(name || "Root", inferred));
      setErr(null);
    } catch (e: any) {
      setErr(e.message);
      setOut("");
    }
  }

  useEffect(() => { generate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste a JSON sample and click Generate. The result is a set of TypeScript interfaces and type aliases that match the structure. Larger or more varied samples produce more accurate unions.",
      formula: "We walk the JSON tree once, emit a TypeScript shape for each unique object structure, and wire arrays + unions automatically. Fields that vary between samples become optional.",
      examples: '{"id":1,"tags":["a","b"]} produces interface Root { id: number; tags: string[]; }',
      faq: [
        { q: "Can I paste an array?", a: "Yes — top-level arrays emit a type alias for the element type." },
        { q: "What about nullable fields?", a: "Mix several samples that include and omit a field, and the inferred type becomes T | null." },
      ],
    }}>
      <div className="grid lg:grid-cols-2 gap-3">
        <div>
          <label className="label">JSON sample</label>
          <AutoTextarea className="input min-h-[260px] font-mono text-xs" value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
          <div className="mt-2 flex gap-2 items-end">
            <div className="flex-1"><label className="label">Root type name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <button onClick={generate} className="btn-primary min-tap">Generate</button>
          </div>
        </div>
        <div>
          <label className="label">TypeScript</label>
          <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={out} readOnly />
        </div>
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
    </ToolPage>
  );
}
