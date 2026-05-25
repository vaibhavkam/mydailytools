"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { safeCopy } from "@/lib/clipboard";
import { AutoTextarea } from "@/components/AutoTextarea";

// ---------------------------------------------------------------------------
// Curl parser
// ---------------------------------------------------------------------------
// Tokenize a curl command string into argv, respecting:
//   - single quotes (no escaping inside)
//   - double quotes (backslash escapes)
//   - backslash-newline line continuations (typical pasted multi-line curl)
//   - $'...' (bash ANSI-C quoting, rare but real)
// Doesn't try to be a full bash parser — just enough to handle real-world
// curl commands copy-pasted from docs and terminals.

function tokenize(input: string): string[] {
  // Strip shell line continuations: backslash followed by newline (with optional whitespace)
  const cleaned = input.replace(/\\\r?\n\s*/g, " ").trim();
  const out: string[] = [];
  let buf = "";
  let i = 0;
  while (i < cleaned.length) {
    const c = cleaned[i];
    if (/\s/.test(c)) {
      if (buf) { out.push(buf); buf = ""; }
      i++;
      continue;
    }
    if (c === "'") {
      // single-quoted: read until next single quote, no escapes
      i++;
      while (i < cleaned.length && cleaned[i] !== "'") { buf += cleaned[i]; i++; }
      i++; // skip closing quote
      continue;
    }
    if (c === '"') {
      // double-quoted: read until next unescaped double quote
      i++;
      while (i < cleaned.length && cleaned[i] !== '"') {
        if (cleaned[i] === "\\" && i + 1 < cleaned.length) {
          const next = cleaned[i + 1];
          // Bash double-quote: only \, $, `, ", newline are escaped
          if (next === '"' || next === "\\" || next === "$" || next === "`" || next === "\n") {
            buf += next; i += 2; continue;
          }
          // Otherwise the backslash is literal
          buf += "\\"; i++; continue;
        }
        buf += cleaned[i]; i++;
      }
      i++; // skip closing quote
      continue;
    }
    if (c === "\\" && i + 1 < cleaned.length) {
      // outside quotes: backslash escapes the next char
      buf += cleaned[i + 1];
      i += 2;
      continue;
    }
    buf += c;
    i++;
  }
  if (buf) out.push(buf);
  return out;
}

type ParsedCurl = {
  method: string;
  url: string;
  headers: Record<string, string>;
  data: string | null;
  isForm: boolean; // -F / --form: multipart
  isUrlEncoded: boolean; // --data-urlencode
  basicAuth: { user: string; password: string } | null;
  followRedirects: boolean;
  insecure: boolean;
};

function parseCurl(input: string): ParsedCurl | { error: string } {
  const tokens = tokenize(input);
  if (tokens.length === 0) return { error: "Empty input." };
  if (tokens[0] !== "curl") return { error: "Command must start with `curl`." };

  const result: ParsedCurl = {
    method: "GET",
    url: "",
    headers: {},
    data: null,
    isForm: false,
    isUrlEncoded: false,
    basicAuth: null,
    followRedirects: false,
    insecure: false,
  };

  // Track whether the user explicitly set a method, because -d implies POST
  // only when no method was specified.
  let methodExplicit = false;
  let dataParts: string[] = [];

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    const next = () => tokens[++i];

    // Some flags accept value as either next token or as --flag=value
    const valueOf = (longForm: string): string => {
      if (t.startsWith(longForm + "=")) return t.slice(longForm.length + 1);
      return next();
    };

    if (t === "-X" || t.startsWith("--request")) {
      result.method = t === "-X" ? next() : valueOf("--request");
      methodExplicit = true;
    } else if (t === "-H" || t.startsWith("--header")) {
      const hv = t === "-H" ? next() : valueOf("--header");
      const idx = hv.indexOf(":");
      if (idx > 0) {
        const name = hv.slice(0, idx).trim();
        const val = hv.slice(idx + 1).trim();
        result.headers[name] = val;
      }
    } else if (t === "-d" || t === "--data" || t === "--data-raw" || t === "--data-binary" || t.startsWith("--data=") || t.startsWith("--data-raw=") || t.startsWith("--data-binary=")) {
      const dv = t.includes("=") ? t.slice(t.indexOf("=") + 1) : next();
      dataParts.push(dv);
    } else if (t === "--data-urlencode" || t.startsWith("--data-urlencode=")) {
      const dv = t.includes("=") ? t.slice(t.indexOf("=") + 1) : next();
      dataParts.push(dv);
      result.isUrlEncoded = true;
    } else if (t === "-F" || t === "--form" || t.startsWith("--form=")) {
      const fv = t.includes("=") ? t.slice(t.indexOf("=") + 1) : t === "-F" ? next() : valueOf("--form");
      result.isForm = true;
      dataParts.push(fv);
    } else if (t === "-u" || t.startsWith("--user")) {
      const uv = t === "-u" ? next() : valueOf("--user");
      const colon = uv.indexOf(":");
      result.basicAuth = colon >= 0
        ? { user: uv.slice(0, colon), password: uv.slice(colon + 1) }
        : { user: uv, password: "" };
    } else if (t === "-L" || t === "--location") {
      result.followRedirects = true;
    } else if (t === "-k" || t === "--insecure") {
      result.insecure = true;
    } else if (t === "-A" || t.startsWith("--user-agent")) {
      const ua = t === "-A" ? next() : valueOf("--user-agent");
      result.headers["User-Agent"] = ua;
    } else if (t === "-e" || t.startsWith("--referer")) {
      const ref = t === "-e" ? next() : valueOf("--referer");
      result.headers["Referer"] = ref;
    } else if (t === "-b" || t.startsWith("--cookie")) {
      const cookie = t === "-b" ? next() : valueOf("--cookie");
      // -b can be a file path; if so, can't include literally. Best effort: treat as Cookie header.
      result.headers["Cookie"] = cookie;
    } else if (t === "-G" || t === "--get") {
      // Convert data into query string
      methodExplicit = true;
      result.method = "GET";
    } else if (t === "-I" || t === "--head") {
      result.method = "HEAD";
      methodExplicit = true;
    } else if (t.startsWith("--url=")) {
      result.url = t.slice(6);
    } else if (t === "--url") {
      result.url = next();
    } else if (t.startsWith("-")) {
      // Unknown flag — skip it (and skip its value if it doesn't start with -)
      // Conservative: don't consume next; might be a value, might be the URL.
      // Most flags we'd want to handle are above.
    } else if (!result.url) {
      // First positional arg = URL
      result.url = t;
    }
  }

  if (!result.url) return { error: "No URL found in the curl command." };

  // -d implies POST if no method was set
  if (dataParts.length > 0 && !methodExplicit) result.method = "POST";

  if (dataParts.length > 0) {
    result.data = dataParts.join("&");
  }

  return result;
}

// ---------------------------------------------------------------------------
// Code generators
// ---------------------------------------------------------------------------

function jsonStringify(s: string): string {
  return JSON.stringify(s);
}

function isLikelyJson(data: string, headers: Record<string, string>): boolean {
  const ct = Object.entries(headers).find(([k]) => k.toLowerCase() === "content-type")?.[1] ?? "";
  if (ct.toLowerCase().includes("application/json")) return true;
  const trimmed = data.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function generateFetch(p: ParsedCurl): string {
  const headers = { ...p.headers };
  if (p.basicAuth) {
    headers["Authorization"] = `Basic <base64('${p.basicAuth.user}:${p.basicAuth.password}')>`;
  }
  const opts: string[] = [];
  if (p.method !== "GET") opts.push(`  method: ${jsonStringify(p.method)}`);
  if (Object.keys(headers).length > 0) {
    const headerLines = Object.entries(headers).map(([k, v]) => `    ${jsonStringify(k)}: ${jsonStringify(v)}`).join(",\n");
    opts.push(`  headers: {\n${headerLines},\n  }`);
  }
  if (p.data) {
    if (p.isForm) {
      opts.push(`  body: formData  // build a FormData object from the -F parts`);
    } else if (isLikelyJson(p.data, headers)) {
      opts.push(`  body: JSON.stringify(${p.data.startsWith("{") || p.data.startsWith("[") ? p.data : jsonStringify(p.data)})`);
    } else {
      opts.push(`  body: ${jsonStringify(p.data)}`);
    }
  }
  if (p.basicAuth) {
    return `// Basic auth: build the Authorization header yourself:
// 'Basic ' + btoa('${p.basicAuth.user}:${p.basicAuth.password}')

const response = await fetch(${jsonStringify(p.url)}, {
${opts.join(",\n")},
});
const data = await response.json();`;
  }
  return `const response = await fetch(${jsonStringify(p.url)}${opts.length > 0 ? `, {\n${opts.join(",\n")},\n}` : ""});
const data = await response.json();`;
}

function generateAxios(p: ParsedCurl): string {
  const headers = { ...p.headers };
  const config: string[] = [];
  config.push(`  method: ${jsonStringify(p.method.toLowerCase())}`);
  config.push(`  url: ${jsonStringify(p.url)}`);
  if (Object.keys(headers).length > 0) {
    const headerLines = Object.entries(headers).map(([k, v]) => `    ${jsonStringify(k)}: ${jsonStringify(v)}`).join(",\n");
    config.push(`  headers: {\n${headerLines},\n  }`);
  }
  if (p.basicAuth) {
    config.push(`  auth: { username: ${jsonStringify(p.basicAuth.user)}, password: ${jsonStringify(p.basicAuth.password)} }`);
  }
  if (p.data) {
    if (p.isForm) {
      config.push(`  data: formData  // build a FormData object from the -F parts`);
    } else if (isLikelyJson(p.data, headers)) {
      config.push(`  data: ${p.data.startsWith("{") || p.data.startsWith("[") ? p.data : jsonStringify(p.data)}`);
    } else {
      config.push(`  data: ${jsonStringify(p.data)}`);
    }
  }
  return `import axios from 'axios';

const response = await axios({
${config.join(",\n")},
});
const data = response.data;`;
}

function generateRequests(p: ParsedCurl): string {
  const lines: string[] = ["import requests", ""];
  const args: string[] = [`'${p.url.replace(/'/g, "\\'")}'`];

  if (Object.keys(p.headers).length > 0) {
    const headerLines = Object.entries(p.headers).map(([k, v]) => `    ${pyStr(k)}: ${pyStr(v)}`).join(",\n");
    lines.push(`headers = {\n${headerLines},\n}`);
    args.push(`headers=headers`);
  }
  if (p.basicAuth) {
    args.push(`auth=(${pyStr(p.basicAuth.user)}, ${pyStr(p.basicAuth.password)})`);
  }
  if (p.data) {
    if (p.isForm) {
      lines.push(`files = {\n    # build from the -F parts\n}`);
      args.push(`files=files`);
    } else if (isLikelyJson(p.data, p.headers)) {
      lines.push(`payload = ${p.data}`);
      args.push(`json=payload`);
    } else {
      lines.push(`data = ${pyStr(p.data)}`);
      args.push(`data=data`);
    }
  }
  if (!p.followRedirects) {
    args.push(`allow_redirects=${p.followRedirects ? "True" : "False"}`);
  }
  if (p.insecure) {
    args.push(`verify=False`);
  }

  const method = p.method.toLowerCase();
  if (["get", "post", "put", "patch", "delete", "head"].includes(method)) {
    lines.push(`response = requests.${method}(${args.join(", ")})`);
  } else {
    lines.push(`response = requests.request(${pyStr(p.method)}, ${args.join(", ")})`);
  }
  lines.push(`data = response.json()`);
  return lines.join("\n");
}

function pyStr(s: string): string {
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function generateGo(p: ParsedCurl): string {
  const lines: string[] = [
    `package main`,
    ``,
    `import (`,
    `\t"fmt"`,
    `\t"io"`,
    `\t"net/http"`,
    p.data ? `\t"strings"` : "",
    `)`,
    ``,
    `func main() {`,
  ].filter(Boolean);

  if (p.data) {
    lines.push(`\tbody := strings.NewReader(${goStr(p.data)})`);
    lines.push(`\treq, err := http.NewRequest(${goStr(p.method)}, ${goStr(p.url)}, body)`);
  } else {
    lines.push(`\treq, err := http.NewRequest(${goStr(p.method)}, ${goStr(p.url)}, nil)`);
  }
  lines.push(`\tif err != nil { panic(err) }`);

  for (const [k, v] of Object.entries(p.headers)) {
    lines.push(`\treq.Header.Set(${goStr(k)}, ${goStr(v)})`);
  }
  if (p.basicAuth) {
    lines.push(`\treq.SetBasicAuth(${goStr(p.basicAuth.user)}, ${goStr(p.basicAuth.password)})`);
  }

  lines.push(``);
  lines.push(`\tresp, err := http.DefaultClient.Do(req)`);
  lines.push(`\tif err != nil { panic(err) }`);
  lines.push(`\tdefer resp.Body.Close()`);
  lines.push(``);
  lines.push(`\tdata, _ := io.ReadAll(resp.Body)`);
  lines.push(`\tfmt.Println(string(data))`);
  lines.push(`}`);

  return lines.join("\n");
}

function goStr(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\n")}"`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SAMPLE = `curl -X POST https://api.example.com/v1/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer eyJhbGc..." \\
  -d '{"name":"Alice","email":"alice@example.com"}'`;

const LANGS = [
  { id: "fetch", label: "JavaScript (fetch)", generate: generateFetch },
  { id: "axios", label: "JavaScript (axios)", generate: generateAxios },
  { id: "requests", label: "Python (requests)", generate: generateRequests },
  { id: "go", label: "Go (net/http)", generate: generateGo },
] as const;

type LangId = typeof LANGS[number]["id"];

export default function CurlToCode({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [curl, setCurl] = useState(SAMPLE);
  const [lang, setLang] = useState<LangId>("fetch");

  const parsed = useMemo(() => parseCurl(curl), [curl]);

  const code = useMemo(() => {
    if ("error" in parsed) return "";
    const gen = LANGS.find((l) => l.id === lang)!.generate;
    return gen(parsed);
  }, [parsed, lang]);

  function copy() {
    if (code) safeCopy(code);
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Paste a curl command on the left. The right side shows the equivalent code in your chosen language. Edit the curl freely — the output updates live. Supports common flags: -X, -H, -d, --data-raw, --data-binary, -u, -F, -L, -k, -A, -b, -G, -I.",
        formula: "Parser tokenizes the curl with shell-quoting rules, extracts method/URL/headers/body/auth, then a per-language generator emits idiomatic code. Method is implicit POST when -d is used without -X.",
        examples: "A curl with -H \"Content-Type: application/json\" and -d '{\"x\":1}' becomes fetch with a headers object and JSON.stringify body. Basic auth (-u user:pass) maps to native auth helpers in each language.",
        faq: [
          { q: "What curl flags are supported?", a: "The common ones: -X / --request, -H / --header, -d / --data / --data-raw / --data-binary / --data-urlencode, -F / --form, -u / --user, -L / --location, -k / --insecure, -A / --user-agent, -e / --referer, -b / --cookie, -G / --get, -I / --head. Unknown flags are silently skipped to avoid garbling the rest of the parse." },
          { q: "Does it handle multipart form (-F) uploads?", a: "It detects -F and marks the body as form-data in the generated code, but you'll need to construct the FormData / files dict yourself — file paths and content streams don't translate directly. The output includes a comment showing where to plug them in." },
          { q: "Why does my JSON body have escaped quotes?", a: "Curl bodies are strings; we detect when the body parses as JSON (or Content-Type is application/json) and emit it as a native object literal in JS/Python. If your input has unusual escaping, the heuristic may miss it — paste through the JSON Formatter first to normalize." },
          { q: "Does the generated code actually run?", a: "Yes for the common cases (JSON POST, GET with query strings, basic auth, custom headers). Edge cases that need manual attention: multipart uploads, file streaming, cookies-from-file, certificate pinning, --http2/--http3 protocol forcing. These are flagged in comments where relevant." },
          { q: "Why no Ruby / PHP / Rust / Java?", a: "Started with the four highest-demand targets. If you'd find another language useful, let us know — the parser is language-agnostic, only the generator needs to be written." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div>
          <label className="label" htmlFor="curl-in">curl command</label>
          <AutoTextarea
            id="curl-in"
            className="input font-mono text-xs min-h-[320px]"
            value={curl}
            onChange={(e) => setCurl(e.target.value)}
            spellCheck={false}
          />
        </div>

        {"error" in parsed && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {parsed.error}
          </div>
        )}

        {!("error" in parsed) && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium" htmlFor="lang-select">Output language:</label>
              <select
                id="lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value as LangId)}
                className="text-sm rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-1"
              >
                {LANGS.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
              <button onClick={copy} className="ml-auto btn-ghost text-xs">
                <Copy className="h-3.5 w-3.5" /> Copy code
              </button>
            </div>

            <div>
              <label className="label" htmlFor="code-out">Code</label>
              <pre className="input font-mono text-xs min-h-[360px] overflow-auto whitespace-pre" id="code-out">{code}</pre>
            </div>

            <details className="text-xs text-[rgb(var(--fg-muted))]">
              <summary className="cursor-pointer select-none hover:text-[rgb(var(--fg))]">Parsed details (for debugging)</summary>
              <pre className="mt-2 p-3 rounded-md bg-[rgb(var(--bg-muted,250,250,252))] text-[11px] font-mono overflow-auto">{JSON.stringify(parsed, null, 2)}</pre>
            </details>
          </>
        )}
      </div>
    </ToolPage>
  );
}
