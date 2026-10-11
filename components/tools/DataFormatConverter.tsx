"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, ArrowLeftRight, Download } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { safeCopy } from "@/lib/clipboard";
import { type Format, SAMPLE_BY_FORMAT, getParser, getSerializer } from "@/lib/data-formats";
import { AutoTextarea } from "@/components/AutoTextarea";

const FORMAT_LABELS: Record<Format, string> = {
  json: "JSON",
  yaml: "YAML",
  csv: "CSV",
  xml: "XML",
};

const FORMAT_EXTENSIONS: Record<Format, string> = {
  json: "json",
  yaml: "yaml",
  csv: "csv",
  xml: "xml",
};

const FORMAT_MIME: Record<Format, string> = {
  json: "application/json",
  yaml: "application/yaml",   // RFC 9512 (2024)
  csv: "text/csv",
  xml: "application/xml",
};

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a tick so Safari/Firefox have time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Map every supported slug to (from, to). Both directions of a pair use the
// same component but boot with the orientation that matches the slug — a user
// landing on /tools/csv-to-json/ sees CSV on the left and JSON on the right.
//
// Adding a new conversion pair = add two entries here, two entries in
// lib/tools.ts, and two entries in registry.ts pointing to this component.
export const SLUG_DIRECTION: Record<string, { from: Format; to: Format }> = {
  "csv-to-json": { from: "csv", to: "json" },
  "csv-to-xml": { from: "csv", to: "xml" },
  "csv-to-yaml": { from: "csv", to: "yaml" },
};

// Per-slug content shown inside <ToolPage>. Kept here (not in lib/tools.ts)
// because howTo / formula / examples / faq are component concerns and we want
// each URL to feel distinct — different framing for the same widget so Google
// doesn't treat the two pages as duplicates.
type Content = { howTo: string; formula: string; examples: string; faq: { q: string; a: string }[] };

const CONTENT_BY_SLUG: Record<string, Content> = {
  "csv-to-json": {
    howTo: "Paste CSV on the left. The first row is treated as column headers, and each subsequent row becomes a JSON object. JSON appears live on the right.",
    formula: "Each row → object. Keys come from the header row; values are strings (CSV has no native types). Delimiter is auto-detected: comma, semicolon, or tab.",
    examples: `name,age\\nAlice,30\\nBob,25 becomes [{"name":"Alice","age":"30"}, {"name":"Bob","age":"25"}]`,
    faq: [
      { q: "Why are numeric values strings in the output?", a: "CSV has no type information — \"30\" could be an int, a fixed-width code, or a phone-number prefix. We keep everything as a string so you decide. Parse them with parseInt / parseFloat in your code after." },
      { q: "How do you detect the delimiter?", a: "We sample the first few lines and pick whichever of comma, semicolon, or tab appears most frequently. European spreadsheets often default to semicolon — that works too." },
      { q: "What about quoted strings with commas inside?", a: "Standard RFC 4180 quoting is honored: double-quoted fields can contain the delimiter and newlines; doubled-quotes inside a quoted field render as a single quote." },
    ],
  },
  "csv-to-xml": {
    howTo: "Paste CSV on the left. XML appears live on the right, with the first row as element names and each subsequent row as a <row> element containing those tags.",
    formula: "Header row → element names. Each data row becomes <row><col1>…</col1><col2>…</col2></row>, wrapped in a <rows> root.",
    examples: `name,age\\nAlice,30 becomes <rows><row><name>Alice</name><age>30</age></row></rows>`,
    faq: [
      { q: "Can I customize the <row> / <rows> wrapper names?", a: "Not yet — they're fixed. If you need specific element names (e.g. <book> instead of <row>), do a find-replace on the output." },
      { q: "What if a CSV header contains spaces or special characters?", a: "Headers must be valid XML element names (letters, digits, hyphens, underscores). Spaces and most punctuation will produce invalid XML — rename your CSV columns first." },
    ],
  },
  "csv-to-yaml": {
    howTo: "Paste CSV on the left. YAML appears live on the right as a sequence of records — the format Ansible playbooks, Kubernetes ConfigMaps, and many CI files expect.",
    formula: "Each CSV row becomes a YAML mapping with the header row as keys. Values are strings (CSV has no type information); quote-or-leave-bare follows our YAML quoting rules.",
    examples: `name,age\\nAlice,30 becomes - name: Alice\\n  age: \"30\"`,
    faq: [
      { q: "Why is age quoted as a string?", a: "CSV doesn't distinguish numbers from strings — \"30\" could be an integer or a fixed-width zip-code prefix. To convert numeric columns, post-process in your code or use Ansible's `int` filter." },
      { q: "Can I get a YAML map instead of a sequence?", a: "Not directly — CSV is rows-and-columns, which maps naturally to a sequence. If you need a map keyed by one of the columns, transform the YAML output (or use CSV→JSON and re-key in your code)." },
    ],
  },
};

export default function DataFormatConverter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const direction = SLUG_DIRECTION[tool.slug];
  if (!direction) throw new Error(`No direction mapping for slug: ${tool.slug}`);

  const content = CONTENT_BY_SLUG[tool.slug];
  const [from, setFrom] = useState<Format>(direction.from);
  const [to, setTo] = useState<Format>(direction.to);
  const [input, setInput] = useState(SAMPLE_BY_FORMAT[direction.from]);
  const [output, setOutput] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const needsXml = from === "xml" || to === "xml";

  // Convert on every input change. Async because XML parser is lazy-loaded.
  useEffect(() => {
    let cancelled = false;
    async function convert() {
      if (!input.trim()) { setOutput(""); setErr(null); return; }
      try {
        setConverting(true);
        const parse = await getParser(from);
        const serialize = await getSerializer(to);
        if (cancelled) return;
        const intermediate = parse(input);
        const out = serialize(intermediate);
        if (cancelled) return;
        setOutput(out);
        setErr(null);
      } catch (e: any) {
        if (cancelled) return;
        setErr(e.message ?? String(e));
      } finally {
        if (!cancelled) setConverting(false);
      }
    }
    convert();
    return () => { cancelled = true; };
  }, [input, from, to]);

  function swap() {
    setFrom(to);
    setTo(from);
    setInput(output);
  }

  function copyOutput() {
    if (output) safeCopy(output);
  }

  function downloadOutput() {
    if (!output) return;
    const ext = FORMAT_EXTENSIONS[to];
    downloadText(output, `converted.${ext}`, FORMAT_MIME[to]);
  }

  const fromLabel = FORMAT_LABELS[from];
  const toLabel = FORMAT_LABELS[to];

  return (
    <ToolPage tool={tool} content={content}>
      <div className="grid gap-3">
        <div className="grid lg:grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <label className="label">{fromLabel} input</label>
            <AutoTextarea
              className="input min-h-[320px] font-mono text-xs"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              aria-label={`${fromLabel} input`}
            />
          </div>
          <button
            onClick={swap}
            className="btn-ghost text-xs flex-shrink-0 self-center hidden lg:flex"
            title={`Swap to ${toLabel} → ${fromLabel}`}
            aria-label="Swap input and output formats"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center justify-between">
              <label className="label !mb-0">{toLabel} output</label>
              <div className="flex gap-1">
                <button onClick={copyOutput} disabled={!output} className="btn-ghost text-xs disabled:opacity-50">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                <button onClick={downloadOutput} disabled={!output} className="btn-ghost text-xs disabled:opacity-50" aria-label={`Download as .${FORMAT_EXTENSIONS[to]}`}>
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>
            <AutoTextarea
              className="input min-h-[320px] font-mono text-xs mt-1.5"
              value={output}
              readOnly
              spellCheck={false}
              aria-label={`${toLabel} output`}
            />
          </div>
        </div>
        <button
          onClick={swap}
          className="btn-ghost text-xs self-start lg:hidden"
          aria-label="Swap input and output formats"
        >
          <ArrowLeftRight className="h-4 w-4" /> Swap direction
        </button>
        {err && <p role="alert" className="text-sm text-red-600 font-mono">{err}</p>}
        {needsXml && converting && !output && (
          <p className="text-xs text-[rgb(var(--fg-muted))]">Loading XML parser…</p>
        )}
      </div>
    </ToolPage>
  );
}
