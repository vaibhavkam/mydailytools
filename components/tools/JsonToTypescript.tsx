"use client";

import { useEffect, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

// We use quicktype-core dynamically only inside the click handler, so its
// large bundle doesn't load until the user actually generates types.

export default function JsonToTypescript({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [json, setJson] = useState('{\n  "id": 42,\n  "name": "Alice",\n  "tags": ["admin", "user"],\n  "address": { "city": "NYC", "zip": "10001" }\n}');
  const [name, setName] = useState("Root");
  const [out, setOut] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true); setErr(null);
    try {
      const { quicktype, InputData, jsonInputForTargetLanguage } = await import("quicktype-core");
      const jsonInput = jsonInputForTargetLanguage("typescript");
      await jsonInput.addSource({ name: name || "Root", samples: [json] });
      const inputData = new InputData();
      inputData.addInput(jsonInput);
      const result = await quicktype({
        inputData,
        lang: "typescript",
        rendererOptions: { "just-types": "true", "prefer-unions": "true" } as any,
      });
      setOut(result.lines.join("\n"));
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  useEffect(() => { generate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste a JSON sample and click Generate. The result is a set of TypeScript type aliases / interfaces that match the structure. Larger or more varied samples produce more accurate unions.",
      formula: "Powered by quicktype-core, the same engine behind quicktype.io. We enable 'just-types' so the output is purely interfaces with no runtime helpers.",
      examples: '{"id":1,"tags":["a","b"]} produces interface Root { id: number; tags: string[]; }',
      faq: [
        { q: "Can I paste an array?", a: "Yes — quicktype infers the element type and emits the array type alias." },
        { q: "What about nullable fields?", a: "Mix several samples that include and omit a field, and the inferred type becomes T | null." },
      ],
    }}>
      <div className="grid lg:grid-cols-2 gap-3">
        <div>
          <label className="label">JSON sample</label>
          <textarea className="input min-h-[260px] font-mono text-xs" value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
          <div className="mt-2 flex gap-2 items-end">
            <div className="flex-1"><label className="label">Root type name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <button onClick={generate} disabled={busy} className="btn-primary min-tap">{busy ? "Generating…" : "Generate"}</button>
          </div>
        </div>
        <div>
          <label className="label">TypeScript</label>
          <textarea className="input min-h-[320px] font-mono text-xs" value={out} readOnly />
        </div>
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
    </ToolPage>
  );
}
