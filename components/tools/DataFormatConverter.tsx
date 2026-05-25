"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, ArrowLeftRight, Download } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
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
// landing on /tools/xml-to-json/ sees XML on the left and JSON on the right.
//
// Adding a new conversion pair = add two entries here, two entries in
// lib/tools.ts, and two entries in registry.ts pointing to this component.
export const SLUG_DIRECTION: Record<string, { from: Format; to: Format }> = {
  "json-to-csv": { from: "json", to: "csv" },
  "csv-to-json": { from: "csv", to: "json" },
  "json-to-yaml": { from: "json", to: "yaml" },
  "yaml-to-json": { from: "yaml", to: "json" },
  "json-to-xml": { from: "json", to: "xml" },
  "xml-to-json": { from: "xml", to: "json" },
  "csv-to-xml": { from: "csv", to: "xml" },
  "xml-to-csv": { from: "xml", to: "csv" },
  "yaml-to-csv": { from: "yaml", to: "csv" },
  "csv-to-yaml": { from: "csv", to: "yaml" },
  "yaml-to-xml": { from: "yaml", to: "xml" },
  "xml-to-yaml": { from: "xml", to: "yaml" },
};

// Per-slug content shown inside <ToolPage>. Kept here (not in lib/tools.ts)
// because howTo / formula / examples / faq are component concerns and we want
// each URL to feel distinct — different framing for the same widget so Google
// doesn't treat the two pages as duplicates.
type Content = { howTo: string; formula: string; examples: string; faq: { q: string; a: string }[] };

const CONTENT_BY_SLUG: Record<string, Content> = {
  "json-to-csv": {
    howTo: "Paste a JSON array of objects on the left. The CSV equivalent appears live on the right, using each object's keys as column headers.",
    formula: "Headers = union of all object keys (left to right by first occurrence). Each row maps an object's values in header order. Values containing commas, quotes, or newlines are RFC 4180-quoted.",
    examples: `[{"name":"Alice","age":30}, {"name":"Bob","age":25}] becomes name,age\\nAlice,30\\nBob,25`,
    faq: [
      { q: "What about nested objects?", a: "Nested objects and arrays are JSON-stringified into a single cell. Flatten with dot-notation keys (\"address.city\") before converting if you want them as separate columns." },
      { q: "Can I customize the delimiter?", a: "Output is comma-delimited (the most portable). To re-import into Excel with a different delimiter, use Excel's Text Import Wizard or a one-line find/replace." },
      { q: "Why does the first row become the header?", a: "That's the most common CSV convention. If your JSON has objects with different keys, every key across all objects becomes a column — missing values render as empty cells." },
    ],
  },
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
  "yaml-to-json": {
    howTo: "Paste YAML on the left. JSON appears live on the right. Supports indented mappings, sequences, strings, numbers, booleans, and null.",
    formula: "We parse a safe subset of YAML — no anchors/aliases, no flow style, no multiline scalars. Suitable for Compose files, Kubernetes manifests, GitHub Actions, and most config files.",
    examples: "name: example\\ncount: 3 becomes {\"name\":\"example\",\"count\":3}",
    faq: [
      { q: "Why not full YAML?", a: "Full YAML supports features (anchors, type tags, flow style) that are rarely used and famously footgun-prone. We handle the parts every config file actually uses." },
      { q: "Are my type annotations preserved?", a: "Standard scalar types (numbers, booleans, null, strings) are detected automatically. Explicit !!str / !!int tags aren't supported — quote the value if you need it preserved as a string." },
    ],
  },
  "json-to-yaml": {
    howTo: "Paste JSON on the left. Clean indented YAML appears live on the right — the format Kubernetes, Helm, Docker Compose, and GitHub Actions expect.",
    formula: "Object keys become YAML mapping keys, arrays become YAML sequences with leading dashes. Strings are quoted only when they'd parse as a different type (e.g. \"true\", \"123\").",
    examples: `{"version":3,"services":{"web":{"image":"nginx"}}} becomes a Compose-style YAML`,
    faq: [
      { q: "Why are some strings quoted and others aren't?", a: "We quote strings that would otherwise round-trip to a different type (\"true\", \"3.14\", \"null\"), or contain special characters like colons. Plain identifier strings are left bare for readability." },
      { q: "Can I use this for Kubernetes manifests?", a: "Yes. Output is standard indented YAML that kubectl, Helm, and Argo all accept. For multiple documents in one file, convert each one separately and join with \"---\" separators." },
    ],
  },
  "json-to-xml": {
    howTo: "Paste JSON on the left. Well-formed XML appears live on the right. Object keys become element names; nested objects become nested elements; array items become repeated elements.",
    formula: "We map { key: value } to <key>value</key>. Arrays render as repeated elements. Keys starting with \"@_\" become attributes on the parent (matches fast-xml-parser's convention).",
    examples: `{"book":{"@_id":"1","title":"Demo"}} becomes <book id="1"><title>Demo</title></book>`,
    faq: [
      { q: "How do I produce attributes instead of child elements?", a: "Prefix the key with @_ — e.g. {\"book\": {\"@_id\": \"1\", \"title\": \"x\"}} produces <book id=\"1\"><title>x</title></book>. This matches the fast-xml-parser convention." },
      { q: "What if my root is an array?", a: "XML requires a single root element. We wrap arrays in <root><item>…</item></root> automatically. Wrap them yourself in a named root if you want a specific element name." },
      { q: "Are XML namespaces supported?", a: "Yes — include them as attributes (e.g. \"@_xmlns\": \"http://example.com\"). The output is namespace-aware but we don't auto-generate prefixes." },
    ],
  },
  "xml-to-json": {
    howTo: "Paste XML on the left. JSON appears live on the right. Elements become object keys; attributes are prefixed with \"@_\"; text content of mixed elements lives under \"#text\".",
    formula: "<tag attr=\"v\">text</tag> becomes {\"tag\": {\"@_attr\": \"v\", \"#text\": \"text\"}}. Repeated sibling elements collapse into a JSON array.",
    examples: `<book id="1"><title>Demo</title></book> becomes {"book":{"@_id":1,"title":"Demo"}}`,
    faq: [
      { q: "Why does an attribute have an \"@_\" prefix?", a: "JSON doesn't distinguish attributes from child elements, so we use a prefix to make the distinction visible. This matches the convention used by most XML-to-JSON converters (badgerfish, fast-xml-parser, x2js)." },
      { q: "What happens to repeated elements?", a: "Multiple <item> siblings collapse into a JSON array. A single <item> stays as an object — there's no way to distinguish \"one element\" from \"an array of one\" without a schema." },
      { q: "Are SOAP responses supported?", a: "Yes. SOAP is just XML, so paste the response body and the envelope structure will be preserved. Use a JSON tool downstream to drill into the soap:Body content." },
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
  "xml-to-csv": {
    howTo: "Paste XML containing a list of repeated elements. CSV appears live on the right, with each repeated element becoming a row.",
    formula: "Find the first repeated element under the root. Each one becomes a CSV row; its child elements and attributes become columns. Single-element trees won't produce useful CSV.",
    examples: `<rows><row><name>Alice</name></row><row><name>Bob</name></row></rows> becomes a two-row CSV`,
    faq: [
      { q: "Why doesn't my XML produce any rows?", a: "CSV needs a list of records. We look for a repeated sibling element to flatten. If your XML has nested unique elements, there's nothing to enumerate — restructure to a list, or pick a sub-tree that is one." },
      { q: "What about attributes?", a: "Attributes on the row elements become CSV columns alongside child elements. They're prefixed with @_ in the column name so you can tell them apart." },
    ],
  },
  "yaml-to-csv": {
    howTo: "Paste a YAML array of records on the left. CSV appears live on the right, with each record becoming a row. Works best when your YAML is a flat array of objects with the same keys.",
    formula: "YAML → JS array → CSV, using the union of all keys as headers. Nested objects/arrays are JSON-stringified into a single cell.",
    examples: `- name: Alice\\n  age: 30\\n- name: Bob\\n  age: 25 becomes name,age\\nAlice,30\\nBob,25`,
    faq: [
      { q: "My YAML has deep nesting — can I still convert?", a: "Yes, but nested structures get JSON-stringified into one cell. CSV is tabular by nature; if your data is a tree, consider using YAML→JSON instead and processing in code." },
      { q: "What if the array isn't at the root?", a: "Currently we assume the YAML root is a sequence (-prefixed list). If your records live under a key, copy just that sub-array as the input." },
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
  "yaml-to-xml": {
    howTo: "Paste YAML on the left. XML appears live on the right. Mappings become nested elements; sequences become repeated elements.",
    formula: "YAML → JS value → XML via fast-xml-parser. Keys prefixed with \"@_\" become XML attributes (this is the standard convention).",
    examples: `name: Alice\\nage: 30 becomes <root><name>Alice</name><age>30</age></root>`,
    faq: [
      { q: "How do I produce XML attributes from YAML?", a: "Prefix the key with @_ — e.g. \"@_id: 1\" under a parent becomes id=\"1\" on the parent element. This matches the fast-xml-parser convention used across the converters." },
      { q: "What if my YAML is a sequence at the root?", a: "XML requires a single root element. We wrap arrays in <root><item>…</item></root> automatically." },
    ],
  },
  "xml-to-yaml": {
    howTo: "Paste XML on the left. Clean indented YAML appears live on the right. Elements become keys; attributes prefix with \"@_\"; mixed-content text lives under \"#text\".",
    formula: "XML → JS value → YAML. Repeated sibling elements collapse into YAML sequences; attributes stay distinguishable via the @_ prefix.",
    examples: `<book id="1"><title>Demo</title></book> becomes book:\\n  \"@_id\": 1\\n  title: Demo`,
    faq: [
      { q: "Can I round-trip XML through YAML and back?", a: "For most documents yes — the @_ prefix convention preserves attribute-vs-element information. Edge cases (mixed content, namespaces with bound prefixes) may need manual adjustment." },
      { q: "Why are some YAML keys quoted?", a: "Keys starting with \"@_\" need quoting in YAML because the @ character isn't valid as a bare scalar. The output handles this automatically." },
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
    if (output) navigator.clipboard.writeText(output);
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
              className="input min-h-[280px] font-mono text-xs"
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
              className="input min-h-[280px] font-mono text-xs mt-1.5"
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
