"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, CheckCircle2, AlertCircle, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { VENDORS, checkVendor, type Finding, type VendorId } from "@/lib/llm-schema-rules";
import { AutoTextarea } from "@/components/AutoTextarea";

const DEFAULT_VENDOR: VendorId = "anthropic-tool";

// ajv is ~120kB. Static-import would promote it into the common chunk per
// the failure mode captured in CLAUDE.md after the Token Counter incident.
// Load on demand inside the component.
type ValidateFn = (data: unknown) => boolean;
type Validator = { validate: ValidateFn; errors: Array<{ message?: string; instancePath?: string }> | null };

async function loadAjv(): Promise<{ compile: (schema: object) => Validator }> {
  const [{ default: Ajv }, { default: addFormats }] = await Promise.all([
    import("ajv"),
    import("ajv-formats"),
  ]);
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return {
    compile: (schema: object) => {
      const fn = ajv.compile(schema as any);
      return {
        validate: (data: unknown) => fn(data) as boolean,
        get errors() { return fn.errors as any ?? null; },
      };
    },
  };
}

const SAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "priority": {
      "oneOf": [
        { "type": "string", "enum": ["low", "high"] },
        { "type": "integer" }
      ]
    }
  },
  "required": ["title"]
}`;

const SAMPLE_DATA = `{
  "title": "Refactor auth middleware",
  "tags": ["security", "tech-debt"],
  "priority": "high"
}`;

export default function LlmSchemaValidator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [schemaText, setSchemaText] = useState(SAMPLE_SCHEMA);
  const [dataText, setDataText] = useState(SAMPLE_DATA);
  const [ajv, setAjv] = useState<{ compile: (schema: object) => Validator } | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorId>(DEFAULT_VENDOR);

  useEffect(() => {
    let cancelled = false;
    loadAjv().then((m) => { if (!cancelled) setAjv(m); });
    return () => { cancelled = true; };
  }, []);

  const parsedSchema = useMemo(() => {
    try { return { ok: true as const, value: JSON.parse(schemaText) }; }
    catch (e: any) { return { ok: false as const, error: e.message as string }; }
  }, [schemaText]);

  const parsedData = useMemo(() => {
    try { return { ok: true as const, value: JSON.parse(dataText) }; }
    catch (e: any) { return { ok: false as const, error: e.message as string }; }
  }, [dataText]);

  // ajv validation result
  const validation = useMemo(() => {
    if (!ajv || !parsedSchema.ok || !parsedData.ok) return null;
    try {
      const v = ajv.compile(parsedSchema.value);
      const ok = v.validate(parsedData.value);
      return { ok, errors: v.errors ?? [] };
    } catch (e: any) {
      return { ok: false, errors: [{ message: `Schema compile error: ${e.message}`, instancePath: "" }] };
    }
  }, [ajv, parsedSchema, parsedData]);

  // Per-vendor compatibility findings
  const vendorFindings = useMemo(() => {
    if (!parsedSchema.ok) return null;
    const out: Record<VendorId, Finding[]> = {} as any;
    for (const v of VENDORS) {
      out[v.id] = checkVendor(v.id, parsedSchema.value);
    }
    return out;
  }, [parsedSchema]);

  function copyFindings() {
    if (!vendorFindings) return;
    const lines: string[] = [];
    for (const v of VENDORS) {
      const findings = vendorFindings[v.id];
      lines.push(`## ${v.label}`);
      if (findings.length === 0) lines.push("✓ No issues");
      else for (const f of findings) lines.push(`${f.severity.toUpperCase()}: ${f.message} (at ${f.path})`);
      lines.push("");
    }
    navigator.clipboard.writeText(lines.join("\n"));
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Paste your JSON Schema on the left and a sample JSON response on the right. The validator checks the sample against the schema with ajv, and separately reports which LLM providers (OpenAI strict mode, OpenAI function calling, Anthropic tool use, Google Gemini controlled generation) will accept the schema, along with vendor-specific gotchas. Each vendor enforces a different subset of JSON Schema.",
        formula: "Validation uses ajv (JSON Schema draft 2020-12). Vendor compatibility uses hand-curated rules derived from each vendor's structured-output documentation — see lib/llm-schema-rules.ts in the source for citations.",
        examples: "An OpenAI strict-mode schema must have additionalProperties: false on every object and list every property in \"required\". Anthropic accepts a much broader subset. Gemini doesn't support oneOf/anyOf/allOf or $ref at all.",
        faq: [
          { q: "Why doesn't my schema work with OpenAI strict mode?", a: "OpenAI's strict mode (response_format: { type: \"json_schema\", strict: true }) requires every object to have additionalProperties: false, every property listed in \"required\", and forbids oneOf, allOf, and most validation keywords like minLength or pattern. Paste your schema in this tool and the OpenAI Strict column will list every constraint violation with a fix suggestion." },
          { q: "What's the difference between OpenAI strict and function calling?", a: "Strict mode (a.k.a. Structured Outputs) guarantees the model emits JSON matching your schema; in exchange it imposes hard subset restrictions. Function calling (non-strict) is steered by the schema but the model can deviate — most JSON Schema keywords work as hints, but accuracy degrades on deeply nested or large schemas." },
          { q: "Does Anthropic enforce additionalProperties: false?", a: "No. Anthropic's tool-use schema is the most permissive of the major vendors. It accepts standard JSON Schema including additionalProperties either way, oneOf/anyOf/allOf, and most validation keywords. The main practical limit is property count: keeping tools under ~20 top-level properties improves accuracy." },
          { q: "Why doesn't Gemini support oneOf or $ref?", a: "Google Gemini's controlled generation uses a subset based on OpenAPI 3.0 schema, which historically didn't support these keywords. You need to inline any $ref'd subschemas and restructure unions as enums or a single type. The tool flags both as errors when you paste a schema with them." },
          { q: "Can I get an exact token count for my schema?", a: "Not in this tool — pop over to the Token Counter for that. Schemas themselves count against your context window; deeply nested schemas can use a surprising number of tokens, especially in OpenAI function calling where the schema is sent on every turn." },
          { q: "Does this validate offline?", a: "Yes. ajv runs entirely in your browser, and the vendor rules are hand-coded JavaScript. Nothing is sent to OpenAI, Anthropic, or Google — we just check your schema against the documented constraints." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="label">JSON Schema</label>
            <AutoTextarea
              className="input font-mono text-xs"
              rows={14}
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              spellCheck={false}
            />
            {!parsedSchema.ok && (
              <div className="mt-1 text-xs text-red-600 font-mono">Parse error: {parsedSchema.error}</div>
            )}
          </div>
          <div>
            <label className="label">Sample JSON to validate</label>
            <AutoTextarea
              className="input font-mono text-xs"
              rows={14}
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              spellCheck={false}
            />
            {!parsedData.ok && (
              <div className="mt-1 text-xs text-red-600 font-mono">Parse error: {parsedData.error}</div>
            )}
          </div>
        </div>

        {validation && (
          <div className={`rounded-xl border p-3 ${validation.ok ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" : "border-red-300 bg-red-50 dark:bg-red-950/30"}`}>
            <div className="flex items-center gap-2 font-medium text-sm">
              {validation.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
              {validation.ok ? "Sample JSON validates against the schema" : `${validation.errors.length} validation error${validation.errors.length === 1 ? "" : "s"}`}
            </div>
            {!validation.ok && validation.errors.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs font-mono">
                {validation.errors.map((err, i) => (
                  <li key={i}>
                    <span className="text-[rgb(var(--fg-muted))]">{err.instancePath || "$"}</span>
                    {" "}{err.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!ajv && parsedSchema.ok && (
          <div className="text-xs text-[rgb(var(--fg-muted))]">Loading ajv validator…</div>
        )}

        <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-muted,250,250,252))] gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor="vendor-select" className="text-xs font-medium">Check against:</label>
              <select
                id="vendor-select"
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value as VendorId)}
                className="text-xs rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-1"
              >
                {VENDORS.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </div>
            <button onClick={copyFindings} className="btn-ghost min-tap text-xs"><Copy className="h-3.5 w-3.5" /> Copy full report</button>
          </div>
          {vendorFindings ? (
            <>
              <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-muted,250,250,252))]/40 text-[11px]">
                <span className="text-[rgb(var(--fg-muted))] mr-1">Other vendors:</span>
                {VENDORS.filter((v) => v.id !== selectedVendor).map((v) => {
                  const findings = vendorFindings[v.id];
                  const errors = findings.filter((f) => f.severity === "error").length;
                  const ok = errors === 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVendor(v.id)}
                      className={`px-2 py-0.5 rounded-full border ${ok ? "border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" : "border-red-300 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30"} hover:opacity-80 transition`}
                      title={`Click to view ${v.label} details`}
                    >
                      {v.label.replace(/^(OpenAI|Anthropic|Google) /, "").replace(/^Gemini /, "")} {ok ? "✓" : `✗${errors}`}
                    </button>
                  );
                })}
              </div>
              {(() => {
                const v = VENDORS.find((x) => x.id === selectedVendor)!;
                const findings = vendorFindings[selectedVendor];
                const errors = findings.filter((f) => f.severity === "error").length;
                const warnings = findings.filter((f) => f.severity === "warning").length;
                const ok = errors === 0;
                return (
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        <div>
                          <div className="text-sm font-medium">{v.label}</div>
                          <div className="text-xs text-[rgb(var(--fg-muted))]">
                            {ok ? (warnings === 0 ? "Compatible" : `${warnings} warning${warnings === 1 ? "" : "s"}`) : `${errors} error${errors === 1 ? "" : "s"}${warnings ? `, ${warnings} warning${warnings === 1 ? "" : "s"}` : ""}`}
                          </div>
                        </div>
                      </div>
                      <a href={v.docsUrl} target="_blank" rel="noopener" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                        Docs <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {findings.length > 0 && (
                      <ul className="mt-2 space-y-1.5 text-xs">
                        {findings.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            {f.severity === "error" && <AlertCircle className="h-3.5 w-3.5 text-red-600 mt-0.5 flex-shrink-0" />}
                            {f.severity === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />}
                            {f.severity === "info" && <Info className="h-3.5 w-3.5 text-sky-600 mt-0.5 flex-shrink-0" />}
                            <div>
                              <span className="font-mono text-[rgb(var(--fg-muted))]">{f.path}</span> <span>{f.message}</span>
                              {f.fix && <div className="text-[rgb(var(--fg-muted))] mt-0.5">Fix: {f.fix}</div>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="p-3 text-xs text-[rgb(var(--fg-muted))]">Fix the schema parse error above to see vendor compatibility.</div>
          )}
        </div>

        <div className="text-xs text-[rgb(var(--fg-muted))] leading-relaxed">
          <p>Vendor rules are hand-coded from each provider&apos;s structured-output documentation as of May 2026. Vendors loosen and tighten their schema subsets over time — when in doubt, check the linked docs.</p>
        </div>
      </div>
    </ToolPage>
  );
}
