"use client";

import { useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { safeCopy } from "@/lib/clipboard";
import { AutoTextarea } from "@/components/AutoTextarea";

export default function JsonFormatter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState('{"hello":"world","items":[1,2,3]}');
  const [indent, setIndent] = useState(2);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function format(mode: "pretty" | "minify") {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, mode === "pretty" ? indent : 0));
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  }

  function copy() {
    if (output) safeCopy(output);
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo:
          "Paste JSON into the input box, choose your indentation, then press Format to pretty-print or Minify to strip whitespace. Errors show the exact line and reason. The output is editable so you can copy the result back into your project.",
        formula:
          "JSON formatting is purely structural — JSON.parse validates the syntax, then JSON.stringify re-emits it with your chosen indent. Minifying produces the smallest valid JSON. We never modify keys, types, or the order of array elements.",
        examples:
          'Input: {"a":1,"b":[2,3]}. Pretty (2-space): two-line nested layout. Minified: {"a":1,"b":[2,3]} unchanged. Invalid input like {a:1} is rejected with a syntax error.',
        faq: [
          { q: "Does this send my JSON to a server?", a: "No. The browser parses and formats it locally using JSON.parse and JSON.stringify — nothing is uploaded." },
          { q: "Will it sort my keys?", a: "No. Key order is preserved exactly as in the input. JSON.stringify maintains insertion order in all modern JavaScript engines." },
          { q: "What's the difference between formatting and validating?", a: "Formatting only runs if the JSON is valid — so a successful format also means the input is valid JSON. Validation errors show the exact position and reason for the failure." },
          { q: "What's the largest JSON I can format?", a: "Practical limit is your browser's available memory — typically tens of megabytes. For very large files, consider a native tool like jq instead." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div>
          <label className="label" htmlFor="json-in">Input JSON</label>
          <AutoTextarea
            id="json-in"
            className="input font-mono text-xs min-h-[320px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => format("pretty")} className="btn-primary min-tap">Format</button>
          <button onClick={() => format("minify")} className="btn-ghost min-tap">Minify</button>
          <label className="ml-auto text-sm flex items-center gap-2">
            Indent
            <select className="input !py-1.5 !w-auto" value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label !mb-0" htmlFor="json-out">Output</label>
              <button onClick={copy} className="btn-ghost text-xs">Copy</button>
            </div>
            <AutoTextarea id="json-out" className="input font-mono text-xs min-h-[320px]" value={output} readOnly />
          </div>
        )}
      </div>
    </ToolPage>
  );
}
