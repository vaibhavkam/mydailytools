// Vendor-specific JSON Schema constraints for LLM structured output / tool use.
//
// Each vendor enforces a subset of JSON Schema in their structured-output APIs.
// The constraints below are derived from official vendor docs (cited per rule)
// as of 2026-05. Constraints DRIFT — vendors loosen or tighten what they
// accept over time, so the citations matter. When updating, prefer the live
// docs over assumptions.
//
// We model findings rather than throw: a schema may have several issues, and
// users want to see all of them at once per vendor.

export type Severity = "error" | "warning" | "info";
export type VendorId = "openai-strict" | "openai-function" | "anthropic-tool" | "gemini-controlled";

export type Vendor = {
  id: VendorId;
  label: string;
  docsUrl: string;
};

export const VENDORS: Vendor[] = [
  {
    id: "openai-strict",
    label: "OpenAI Structured Outputs (strict)",
    docsUrl: "https://platform.openai.com/docs/guides/structured-outputs",
  },
  {
    id: "openai-function",
    label: "OpenAI Function Calling (non-strict)",
    docsUrl: "https://platform.openai.com/docs/guides/function-calling",
  },
  {
    id: "anthropic-tool",
    label: "Anthropic Tool Use",
    docsUrl: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
  },
  {
    id: "gemini-controlled",
    label: "Google Gemini Controlled Generation",
    docsUrl: "https://ai.google.dev/gemini-api/docs/structured-output",
  },
];

export type Finding = {
  severity: Severity;
  message: string;
  path: string;
  fix?: string;
};

type Schema = any; // We're walking arbitrary JSON; precise typing isn't worth it here.

// Walk a schema, calling visit(node, path) for every subschema.
function walk(schema: Schema, path: string, visit: (n: Schema, p: string) => void) {
  if (schema == null || typeof schema !== "object") return;
  visit(schema, path);
  // Recurse into known subschema-bearing keys.
  if (schema.properties && typeof schema.properties === "object") {
    for (const k of Object.keys(schema.properties)) {
      walk(schema.properties[k], `${path}.properties.${k}`, visit);
    }
  }
  if (schema.items) {
    if (Array.isArray(schema.items)) {
      schema.items.forEach((s: Schema, i: number) => walk(s, `${path}.items[${i}]`, visit));
    } else {
      walk(schema.items, `${path}.items`, visit);
    }
  }
  for (const combiner of ["oneOf", "anyOf", "allOf"] as const) {
    if (Array.isArray(schema[combiner])) {
      schema[combiner].forEach((s: Schema, i: number) => walk(s, `${path}.${combiner}[${i}]`, visit));
    }
  }
  if (schema.not) walk(schema.not, `${path}.not`, visit);
  if (schema.definitions && typeof schema.definitions === "object") {
    for (const k of Object.keys(schema.definitions)) {
      walk(schema.definitions[k], `${path}.definitions.${k}`, visit);
    }
  }
  if (schema.$defs && typeof schema.$defs === "object") {
    for (const k of Object.keys(schema.$defs)) {
      walk(schema.$defs[k], `${path}.$defs.${k}`, visit);
    }
  }
}

// ---------------------------------------------------------------------------
// OpenAI Structured Outputs (strict mode)
// ---------------------------------------------------------------------------
// Source: https://platform.openai.com/docs/guides/structured-outputs
// Key constraints (as of 2026-05):
//   - additionalProperties MUST be false on every object
//   - All properties must be required (no optional fields)
//   - Supported types: string, number, boolean, integer, object, array, enum, anyOf
//     (Note: oneOf and allOf are NOT supported; anyOf is.)
//   - No: minLength, maxLength, pattern, format, minimum, maximum, multipleOf,
//     patternProperties, unevaluatedProperties, propertyNames, minProperties,
//     maxProperties, contains, minContains, maxContains, minItems, maxItems,
//     uniqueItems
//   - Root must be object (not array, not primitive)
//   - Recursive schemas supported only via $ref to root.
function checkOpenAIStrict(schema: Schema): Finding[] {
  const out: Finding[] = [];
  if (!schema || typeof schema !== "object") {
    out.push({ severity: "error", message: "Schema must be an object.", path: "$" });
    return out;
  }
  if (schema.type && schema.type !== "object") {
    out.push({
      severity: "error",
      message: "Root schema must be of type \"object\". Wrap primitives or arrays in an object property.",
      path: "$",
      fix: "Replace the root with { type: \"object\", properties: { result: <your schema> }, required: [\"result\"], additionalProperties: false }",
    });
  }
  walk(schema, "$", (node, path) => {
    if (node.type === "object") {
      if (node.additionalProperties !== false) {
        out.push({
          severity: "error",
          message: "Every object must have additionalProperties: false in strict mode.",
          path,
          fix: "Add additionalProperties: false to this object.",
        });
      }
      const propNames = node.properties ? Object.keys(node.properties) : [];
      const required: string[] = Array.isArray(node.required) ? node.required : [];
      const missing = propNames.filter((p) => !required.includes(p));
      if (missing.length > 0) {
        out.push({
          severity: "error",
          message: `All properties must be required in strict mode. Missing from required: ${missing.join(", ")}.`,
          path,
          fix: "Add every property name to the \"required\" array. If a field is truly optional, model it as a union with null instead.",
        });
      }
    }
    if (Array.isArray(node.oneOf)) {
      out.push({
        severity: "error",
        message: "oneOf is not supported in OpenAI strict mode. Use anyOf instead.",
        path,
        fix: "Rename oneOf → anyOf (semantics differ slightly: anyOf accepts a value matching multiple branches; oneOf requires exactly one match).",
      });
    }
    if (Array.isArray(node.allOf)) {
      out.push({
        severity: "error",
        message: "allOf is not supported in OpenAI strict mode.",
        path,
        fix: "Inline the merged schema manually or restructure with anyOf if it's actually a union.",
      });
    }
    const unsupportedKeywords = [
      "minLength", "maxLength", "pattern", "format",
      "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
      "patternProperties", "unevaluatedProperties", "propertyNames",
      "minProperties", "maxProperties",
      "contains", "minContains", "maxContains",
      "minItems", "maxItems", "uniqueItems",
    ];
    for (const kw of unsupportedKeywords) {
      if (kw in node) {
        out.push({
          severity: "warning",
          message: `OpenAI strict mode ignores the \"${kw}\" keyword. The model won't enforce it; validate in your code if you need it.`,
          path: `${path}.${kw}`,
        });
      }
    }
  });
  return out;
}

// ---------------------------------------------------------------------------
// OpenAI Function Calling (non-strict)
// ---------------------------------------------------------------------------
// Source: https://platform.openai.com/docs/guides/function-calling
// Looser than strict mode. The model is steered by the schema but doesn't
// guarantee adherence. Most JSON Schema keywords are accepted as hints.
//   - Recommends: type, description on every property (improves accuracy)
//   - No hard subset restrictions, but: very deep / complex schemas
//     degrade reliability
//   - additionalProperties true/false both allowed
function checkOpenAIFunction(schema: Schema): Finding[] {
  const out: Finding[] = [];
  if (!schema || typeof schema !== "object") {
    out.push({ severity: "error", message: "Schema must be an object.", path: "$" });
    return out;
  }
  let depth = 0;
  const measureDepth = (node: Schema, d: number) => {
    if (!node || typeof node !== "object") return;
    depth = Math.max(depth, d);
    if (node.properties) for (const k of Object.keys(node.properties)) measureDepth(node.properties[k], d + 1);
    if (node.items) measureDepth(node.items, d + 1);
  };
  measureDepth(schema, 0);
  if (depth > 5) {
    out.push({
      severity: "warning",
      message: `Schema is ${depth} levels deep. OpenAI's docs note that deeply nested schemas degrade function-calling accuracy.`,
      path: "$",
      fix: "Consider flattening or splitting into multiple function calls.",
    });
  }
  walk(schema, "$", (node, path) => {
    if (node.type && (node.type === "string" || node.type === "number" || node.type === "boolean" || node.type === "integer")) {
      if (!node.description) {
        out.push({
          severity: "info",
          message: "Property has no description. OpenAI recommends a description on every leaf property — the model uses it to decide what to put there.",
          path,
        });
      }
    }
  });
  return out;
}

// ---------------------------------------------------------------------------
// Anthropic Tool Use
// ---------------------------------------------------------------------------
// Source: https://docs.anthropic.com/en/docs/build-with-claude/tool-use
// Anthropic accepts a broader subset than OpenAI strict but has its own quirks:
//   - input_schema must be an object with type "object"
//   - All standard JSON Schema keywords work (Claude is more permissive)
//   - description on the tool and each property is strongly recommended
//   - Recommended properties limit: keep tool input under ~20 fields for
//     accuracy (Anthropic prompt-engineering guide)
function checkAnthropicTool(schema: Schema): Finding[] {
  const out: Finding[] = [];
  if (!schema || typeof schema !== "object") {
    out.push({ severity: "error", message: "Schema must be an object.", path: "$" });
    return out;
  }
  if (schema.type !== "object") {
    out.push({
      severity: "error",
      message: "Anthropic input_schema must have type \"object\" at the root.",
      path: "$",
    });
  }
  const propCount = schema.properties ? Object.keys(schema.properties).length : 0;
  if (propCount > 20) {
    out.push({
      severity: "warning",
      message: `Tool has ${propCount} top-level properties. Anthropic's prompt-engineering docs suggest splitting tools with more than ~20 fields for better accuracy.`,
      path: "$",
    });
  }
  walk(schema, "$", (node, path) => {
    if (node.type === "object" && node.properties) {
      for (const k of Object.keys(node.properties)) {
        const child = node.properties[k];
        if (child && typeof child === "object" && !child.description) {
          out.push({
            severity: "info",
            message: `Property \"${k}\" has no description. Claude relies heavily on descriptions to populate tool input correctly.`,
            path: `${path}.properties.${k}`,
          });
        }
      }
    }
  });
  return out;
}

// ---------------------------------------------------------------------------
// Google Gemini Controlled Generation
// ---------------------------------------------------------------------------
// Source: https://ai.google.dev/gemini-api/docs/structured-output
// Most restrictive of the three. Uses a subset called "OpenAPI 3.0 schema":
//   - Supported types: string, number, integer, boolean, array, object
//   - Supported keywords: type, format, description, nullable, enum, items,
//     properties, required, propertyOrdering
//   - NOT supported: $ref, $defs, definitions, additionalProperties (ignored),
//     oneOf, anyOf, allOf, not, patternProperties, dependencies, if/then/else
//   - propertyOrdering recommended: Gemini emits properties in the order they
//     appear here, and order can affect generation quality.
function checkGeminiControlled(schema: Schema): Finding[] {
  const out: Finding[] = [];
  if (!schema || typeof schema !== "object") {
    out.push({ severity: "error", message: "Schema must be an object.", path: "$" });
    return out;
  }
  const unsupportedRoot = ["$ref", "$defs", "definitions"];
  for (const kw of unsupportedRoot) {
    if (kw in schema) {
      out.push({
        severity: "error",
        message: `Gemini does not support \"${kw}\". Inline referenced schemas before sending.`,
        path: `$.${kw}`,
      });
    }
  }
  walk(schema, "$", (node, path) => {
    for (const kw of ["oneOf", "anyOf", "allOf", "not"]) {
      if (kw in node) {
        out.push({
          severity: "error",
          message: `Gemini does not support \"${kw}\". Restructure using enum or a single type.`,
          path: `${path}.${kw}`,
        });
      }
    }
    if ("patternProperties" in node) {
      out.push({
        severity: "error",
        message: "Gemini does not support patternProperties. Use a fixed property set.",
        path: `${path}.patternProperties`,
      });
    }
    if (node.type === "object" && node.properties && !node.propertyOrdering) {
      out.push({
        severity: "info",
        message: "Gemini honors propertyOrdering to control the order it emits fields. Adding it can improve generation quality.",
        path,
        fix: `Add propertyOrdering: [${Object.keys(node.properties).map((k) => `"${k}"`).join(", ")}]`,
      });
    }
  });
  return out;
}

const CHECKERS: Record<VendorId, (s: Schema) => Finding[]> = {
  "openai-strict": checkOpenAIStrict,
  "openai-function": checkOpenAIFunction,
  "anthropic-tool": checkAnthropicTool,
  "gemini-controlled": checkGeminiControlled,
};

export function checkVendor(vendor: VendorId, schema: Schema): Finding[] {
  return CHECKERS[vendor](schema);
}
