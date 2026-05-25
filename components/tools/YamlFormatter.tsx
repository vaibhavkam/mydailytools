"use client";

import { useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { parseYaml, toYaml } from "@/lib/data-formats";
import { AutoTextarea } from "@/components/AutoTextarea";

export default function YamlFormatter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState(`name: MyDailyTool
version: 1.0
features:
  - fast
  - free
  - private
meta:
  count: 110`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function format() {
    try {
      const parsed = parseYaml(input);
      setOutput(toYaml(parsed));
      setError(null);
    } catch (e: any) {
      setError(e.message ?? String(e));
      setOutput("");
    }
  }

  function copy() {
    if (output) navigator.clipboard.writeText(output);
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo:
          "Paste YAML into the input box and press Format. The tool re-emits a clean indented version using two-space indentation — useful for normalizing files that mix tabs and spaces, or for catching syntax errors before committing.",
        formula:
          "Round-trip through our YAML parser: parseYaml(input) produces a JS value, then toYaml() serializes it back out. Any syntax error surfaces during parsing.",
        examples:
          "Input with inconsistent spacing or tabs becomes output with uniform two-space indent. Lists, nested mappings, scalars, and booleans are normalized.",
        faq: [
          { q: "Does this support the full YAML spec?", a: "No — we parse a safe subset (no anchors/aliases, no flow style, no multiline scalars). It handles the parts of YAML that real config files actually use (Compose, Kubernetes manifests, GitHub Actions, Ansible)." },
          { q: "Will it preserve comments?", a: "No. YAML comments are stripped during parsing because they aren't part of the parsed value. If you need to preserve comments, format with a full-fidelity tool like yamllint." },
          { q: "Does this validate against a schema?", a: "Just syntax. For schema validation (e.g. Kubernetes resource schemas), use a dedicated linter. For LLM tool/function schemas, see our LLM JSON Schema Validator." },
          { q: "Does this send my YAML to a server?", a: "No. Parsing and formatting happen entirely in your browser." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div>
          <label className="label" htmlFor="yaml-in">Input YAML</label>
          <AutoTextarea
            id="yaml-in"
            className="input font-mono text-xs min-h-[320px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={format} className="btn-primary min-tap">Format</button>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label !mb-0" htmlFor="yaml-out">Formatted YAML</label>
              <button onClick={copy} className="btn-ghost text-xs">Copy</button>
            </div>
            <AutoTextarea id="yaml-out" className="input font-mono text-xs min-h-[320px]" value={output} readOnly />
          </div>
        )}
      </div>
    </ToolPage>
  );
}
