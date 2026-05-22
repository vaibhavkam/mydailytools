// Shared parsers and serializers for the JSON / YAML / CSV / XML converter
// family. Each converter tool composes parse(fromFormat) → serialize(toFormat)
// over a plain JS intermediate (objects, arrays, primitives).
//
// The XML parser is lazy-loaded (~1MB) — see loadXml() below. Everything else
// is small enough to ship in the component bundle.

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

export function parseJsonValue(src: string): unknown {
  return JSON.parse(src);
}

export function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

// ---------------------------------------------------------------------------
// YAML — a safe subset (no anchors/aliases/flow-style/multiline scalars).
// Lifted from the previous YamlJson component so all converters share one
// parser. Suitable for typical config files (Compose, K8s, GitHub Actions).
// ---------------------------------------------------------------------------

export function parseYaml(src: string): unknown {
  const lines = src.split(/\r?\n/).filter((l) => !/^\s*(#|$)/.test(l));
  let i = 0;
  function indent(s: string) { const m = s.match(/^( *)/); return m ? m[1].length : 0; }
  function scalar(s: string): unknown {
    s = s.trim();
    if (s === "null" || s === "~" || s === "") return null;
    if (s === "true") return true;
    if (s === "false") return false;
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d*\.\d+$/.test(s)) return parseFloat(s);
    if ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'"))) return s.slice(1, -1);
    return s;
  }
  function parseBlock(baseIndent: number): unknown {
    if (i >= lines.length) return null;
    const first = lines[i];
    const ind = indent(first);
    if (ind < baseIndent) return null;
    if (first.trimStart().startsWith("- ")) {
      const arr: unknown[] = [];
      while (i < lines.length && indent(lines[i]) === ind && lines[i].trimStart().startsWith("- ")) {
        const rest = lines[i].trimStart().slice(2);
        i++;
        if (rest.includes(": ") || rest.endsWith(":")) {
          lines.splice(i, 0, " ".repeat(ind + 2) + rest);
          arr.push(parseBlock(ind + 2));
        } else {
          arr.push(scalar(rest));
        }
      }
      return arr;
    }
    const obj: Record<string, unknown> = {};
    while (i < lines.length && indent(lines[i]) === ind) {
      const line = lines[i].trim();
      const m = line.match(/^([^:]+):(\s*)(.*)$/);
      if (!m) throw new Error(`Bad YAML line: "${line}"`);
      const key = m[1].trim();
      const rest = m[3];
      i++;
      if (rest === "") {
        obj[key] = parseBlock(ind + 2);
      } else {
        obj[key] = scalar(rest);
      }
    }
    return obj;
  }
  return parseBlock(0);
}

export function toYaml(value: unknown, indent = 0): string {
  // Emit indented YAML. Doesn't try to round-trip the input formatting; we
  // just produce something readable and parseable by our own parseYaml plus
  // every real-world YAML library.
  const pad = " ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    // Quote strings that would parse as something else, contain special chars,
    // or are empty.
    if (
      value === "" ||
      /^(true|false|null|~)$/i.test(value) ||
      /^-?\d/.test(value) ||
      /[:#&*?,\[\]{}|>"'%@`]/.test(value) ||
      /^\s|\s$/.test(value) ||
      /\n/.test(value)
    ) {
      return JSON.stringify(value);
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        const rendered = toYaml(item, indent + 2);
        if (item !== null && typeof item === "object") {
          // Inline first line of the object/array after the dash, indent rest.
          const lines = rendered.split("\n");
          return `${pad}- ${lines[0].trimStart()}${lines.length > 1 ? "\n" + lines.slice(1).join("\n") : ""}`;
        }
        return `${pad}- ${rendered}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        const keyPart = `${pad}${k}:`;
        if (v !== null && typeof v === "object") {
          const rendered = toYaml(v, indent + 2);
          if (rendered === "[]" || rendered === "{}") return `${keyPart} ${rendered}`;
          return `${keyPart}\n${rendered}`;
        }
        return `${keyPart} ${toYaml(v, indent + 2)}`;
      })
      .join("\n");
  }
  return String(value);
}

// ---------------------------------------------------------------------------
// CSV — RFC 4180 with auto delimiter detection (comma > semicolon > tab).
// ---------------------------------------------------------------------------

function detectDelimiter(src: string): string {
  const sample = src.split("\n").slice(0, 5).join("\n");
  const candidates = [",", ";", "\t"];
  let best = ",", bestCount = 0;
  for (const c of candidates) {
    const n = (sample.match(new RegExp(c === "\t" ? "\\t" : c, "g")) || []).length;
    if (n > bestCount) { best = c; bestCount = n; }
  }
  return best;
}

function parseCsvRows(input: string, delimiter: string): string[][] {
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
      else if (c === delimiter) { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && input[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

// Parse CSV → array of objects, using the first row as keys.
export function parseCsv(src: string): Record<string, string>[] {
  const delimiter = detectDelimiter(src);
  const rows = parseCsvRows(src, delimiter);
  if (rows.length === 0) return [];
  const [headers, ...body] = rows;
  return body.map((r) => Object.fromEntries(headers.map((h, idx) => [h, r[idx] ?? ""])));
}

function escapeCsvCell(cell: unknown, delimiter: string): string {
  const s = cell == null ? "" : typeof cell === "object" ? JSON.stringify(cell) : String(cell);
  const re = new RegExp(`["${delimiter === "\t" ? "\\t" : delimiter}\\n\\r]`);
  return re.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Flatten a single record object to scalar values with dot-notation keys, so
// that nested structures (common from XML / YAML) collapse into CSV columns.
// Arrays of scalars stay JSON-stringified; arrays of objects can't be expressed
// in a single row, so they also stringify.
function flattenRecord(obj: unknown, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) {
    if (prefix) out[prefix] = obj;
    return out;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flattenRecord(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

// Walk a parsed tree looking for the first array-of-objects we can flatten
// into CSV rows. XML parsers produce a single-root tree, so we need to drill
// into the children to find the repeated records. Returns null if there's
// nothing array-shaped to flatten.
function findRecordArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) {
    if (value.some((item) => item && typeof item === "object")) return value;
    return null;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>)) {
      const found = findRecordArray(child);
      if (found) return found;
    }
  }
  return null;
}

export function toCsv(value: unknown): string {
  const delimiter = ",";
  // Fast path: already an array.
  let records: unknown[] | null = Array.isArray(value) ? value : null;
  // Drill into a tree (typical XML output) looking for the first array of
  // records. This is what makes XML → CSV work: <rows><row>…</row></rows>
  // parses to { rows: { row: [{…}, {…}] } } and we extract the inner array.
  if (!records) {
    records = findRecordArray(value);
    if (!records) {
      throw new Error("CSV output requires a list of records. The input doesn't contain an array of objects to flatten.");
    }
  }
  if (records.length === 0) return "";
  // Array of arrays: emit directly.
  if (Array.isArray(records[0])) {
    return (records as unknown[][])
      .map((r) => r.map((c) => escapeCsvCell(c, delimiter)).join(delimiter))
      .join("\n");
  }
  // Array of objects: flatten nested fields with dot-notation column names,
  // then take the union of all keys as headers.
  const flatRows = records.map((r) => (r && typeof r === "object" ? flattenRecord(r) : {}));
  const headers = Array.from(new Set(flatRows.flatMap((r) => Object.keys(r))));
  const rows = [
    headers.join(delimiter),
    ...flatRows.map((r) =>
      headers.map((h) => escapeCsvCell(r[h], delimiter)).join(delimiter),
    ),
  ];
  return rows.join("\n");
}

// ---------------------------------------------------------------------------
// XML — lazy-loaded fast-xml-parser. Each converter calls loadXml() inside
// useEffect so the ~1MB library only downloads on /tools/*xml*/ pages.
// ---------------------------------------------------------------------------

export type XmlLib = {
  parse: (xml: string) => unknown;
  build: (value: unknown) => string;
};

export async function loadXml(): Promise<XmlLib> {
  const mod = await import("fast-xml-parser");
  const parser = new mod.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
    parseAttributeValue: true,
    trimValues: true,
  });
  const builder = new mod.XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true,
    indentBy: "  ",
    suppressEmptyNode: true,
  });
  return {
    parse: (xml) => parser.parse(xml),
    build: (value) => {
      // If the value is an array or primitive at the root, wrap it so XML stays
      // well-formed (XML requires a single root element).
      let root: unknown = value;
      if (Array.isArray(value) || value === null || typeof value !== "object") {
        root = { root: { item: value } };
      }
      return builder.build(root);
    },
  };
}

// ---------------------------------------------------------------------------
// Convenience: pick parse/serialize by format name.
// ---------------------------------------------------------------------------

export type Format = "json" | "yaml" | "csv" | "xml";

export async function getParser(fmt: Format): Promise<(src: string) => unknown> {
  if (fmt === "xml") {
    const xml = await loadXml();
    return (src: string) => xml.parse(src);
  }
  if (fmt === "json") return (src: string) => parseJsonValue(src);
  if (fmt === "yaml") return (src: string) => parseYaml(src);
  if (fmt === "csv") return (src: string) => parseCsv(src);
  throw new Error(`Unknown format: ${fmt}`);
}

export async function getSerializer(fmt: Format): Promise<(value: unknown) => string> {
  if (fmt === "xml") {
    const xml = await loadXml();
    return (value: unknown) => xml.build(value);
  }
  if (fmt === "json") return (value: unknown) => toJson(value);
  if (fmt === "yaml") return (value: unknown) => toYaml(value);
  if (fmt === "csv") return (value: unknown) => toCsv(value);
  throw new Error(`Unknown format: ${fmt}`);
}

export const SAMPLE_BY_FORMAT: Record<Format, string> = {
  json: `[
  {"name": "Alice", "age": 30, "city": "NYC"},
  {"name": "Bob", "age": 25, "city": "SF"}
]`,
  yaml: `- name: Alice
  age: 30
  city: NYC
- name: Bob
  age: 25
  city: SF`,
  csv: `name,age,city
Alice,30,NYC
Bob,25,SF`,
  xml: `<root>
  <item>
    <name>Alice</name>
    <age>30</age>
    <city>NYC</city>
  </item>
  <item>
    <name>Bob</name>
    <age>25</age>
    <city>SF</city>
  </item>
</root>`,
};
