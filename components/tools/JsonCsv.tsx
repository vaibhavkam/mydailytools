"use client";

import { useEffect, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

// Minimal CSV parser: handles quoted fields, embedded commas, doubled quotes.
function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", inQuotes = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && input[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

function toCsv(rows: any[][]): string {
  return rows.map((r) =>
    r.map((cell) => {
      const s = cell == null ? "" : String(cell);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")
  ).join("\n");
}

export default function JsonCsv({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [json, setJson] = useState('[\n  {"name":"Alice","age":30,"city":"NYC"},\n  {"name":"Bob","age":25,"city":"SF"}\n]');
  const [csv, setCsv] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // JSON → CSV (whenever JSON edits)
  useEffect(() => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data) || data.length === 0) throw new Error("Expected a non-empty JSON array of objects.");
      const headers = Array.from(new Set(data.flatMap((r: any) => Object.keys(r ?? {}))));
      const rows = [headers, ...data.map((r: any) => headers.map((h) => r?.[h] ?? ""))];
      setCsv(toCsv(rows));
      setErr(null);
    } catch (e: any) {
      // Don't blow away CSV if user is editing CSV side; only show error inline.
      setErr(e.message);
    }
  }, [json]);

  // CSV → JSON button (explicit, since both fields are editable).
  function csvToJson() {
    try {
      const rows = parseCsv(csv);
      if (rows.length === 0) throw new Error("CSV is empty.");
      const [headers, ...body] = rows;
      const out = body.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
      setJson(JSON.stringify(out, null, 2));
      setErr(null);
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Edit the JSON side and the CSV updates automatically. Edit the CSV side, then click 'CSV → JSON' to convert. JSON must be an array of objects; the union of all keys becomes the CSV header row.",
      formula: "JSON arrays of objects map naturally to CSV: keys = headers, values = cells. CSV strings are RFC 4180-quoted (commas, newlines, and quotes inside fields trigger escaping).",
      examples: '[{"a":1,"b":2}, {"a":3,"b":4}] → "a,b\\n1,2\\n3,4". Reverse direction: same.',
      faq: [
        { q: "Nested objects?", a: "Top-level objects only. Stringify any nested object/array before exporting, or flatten with dot-notation keys." },
        { q: "Custom delimiter?", a: "We use comma. Tab-separated and semicolon variants on the roadmap — file a request." },
      ],
    }}>
      <div className="grid lg:grid-cols-2 gap-3">
        <div>
          <label className="label">JSON (array of objects)</label>
          <AutoTextarea className="input min-h-[360px] font-mono text-xs" value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label !mb-0">CSV</label>
            <button onClick={csvToJson} className="text-xs btn-ghost">CSV → JSON</button>
          </div>
          <AutoTextarea className="input min-h-[360px] font-mono text-xs mt-1.5" value={csv} onChange={(e) => setCsv(e.target.value)} spellCheck={false} />
        </div>
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
    </ToolPage>
  );
}
