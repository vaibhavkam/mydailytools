"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

// Tokenizer encoding tables are ~1.5MB. Loading them via static imports puts
// them in the common chunk pulled by every tool page (a Next.js / webpack
// quirk where a "shared" async chunk gets promoted when several routes share
// the same dynamic-import wrapper). Load on demand inside the component so
// only visitors to this page pay the cost.
type EncodeFn = (text: string) => number[];
async function loadEncoders(): Promise<{ o200k: EncodeFn; cl100k: EncodeFn }> {
  const [o, c] = await Promise.all([
    import("gpt-tokenizer/encoding/o200k_base"),
    import("gpt-tokenizer/encoding/cl100k_base"),
  ]);
  return { o200k: o.encode, cl100k: c.encode };
}

// Per-model token-count strategy. "exact" uses a real tokenizer; "approx" uses
// a chars-per-token heuristic calibrated against published averages, because
// the vendor hasn't released a JS-runnable tokenizer (Anthropic, Google) or
// it's not worth bundling for one tool (Llama, Mistral).
//
// Heuristic ratios come from published vendor docs and community measurements
// on English prose. They under-count on code-heavy / non-English text.
type ModelSpec = {
  id: string;
  label: string;
  vendor: string;
  // Per-1M-token prices in USD. Input only (output is roughly 3-5x but
  // unpredictable; we don't try to estimate output cost).
  inputPricePerMillion: number;
  count: (text: string) => number;
  exact: boolean;
};

const APPROX_CLAUDE = 3.5;   // Anthropic's own docs cite ~3.5 chars/token for English.
const APPROX_GEMINI = 4.0;   // Google's tokenizer is BPE-like; close to GPT-4.
const APPROX_LLAMA = 3.8;    // Llama 3 tokenizer; close to o200k.

function approxCount(text: string, charsPerToken: number) {
  return Math.ceil(text.length / charsPerToken);
}

function buildModels(encoders: { o200k: EncodeFn; cl100k: EncodeFn } | null): ModelSpec[] {
  return [
  {
    id: "gpt-4o",
    label: "GPT-4o / GPT-4o mini",
    vendor: "OpenAI",
    inputPricePerMillion: 2.5,
    count: (t) => encoders ? encoders.o200k(t).length : approxCount(t, 3.8),
    exact: !!encoders,
  },
  {
    id: "gpt-4",
    label: "GPT-4 / GPT-4 Turbo",
    vendor: "OpenAI",
    inputPricePerMillion: 10,
    count: (t) => encoders ? encoders.cl100k(t).length : approxCount(t, 4),
    exact: !!encoders,
  },
  {
    id: "gpt-3.5",
    label: "GPT-3.5 Turbo",
    vendor: "OpenAI",
    inputPricePerMillion: 0.5,
    count: (t) => encoders ? encoders.cl100k(t).length : approxCount(t, 4),
    exact: !!encoders,
  },
  {
    id: "claude-opus",
    label: "Claude Opus 4",
    vendor: "Anthropic",
    inputPricePerMillion: 15,
    count: (t) => approxCount(t, APPROX_CLAUDE),
    exact: false,
  },
  {
    id: "claude-sonnet",
    label: "Claude Sonnet 4",
    vendor: "Anthropic",
    inputPricePerMillion: 3,
    count: (t) => approxCount(t, APPROX_CLAUDE),
    exact: false,
  },
  {
    id: "claude-haiku",
    label: "Claude Haiku 4",
    vendor: "Anthropic",
    inputPricePerMillion: 0.8,
    count: (t) => approxCount(t, APPROX_CLAUDE),
    exact: false,
  },
  {
    id: "gemini-pro",
    label: "Gemini 2.5 Pro",
    vendor: "Google",
    inputPricePerMillion: 1.25,
    count: (t) => approxCount(t, APPROX_GEMINI),
    exact: false,
  },
  {
    id: "llama-3",
    label: "Llama 3.x (70B)",
    vendor: "Meta",
    inputPricePerMillion: 0,
    count: (t) => approxCount(t, APPROX_LLAMA),
    exact: false,
  },
  ];
}

const SAMPLE = `You are a helpful assistant. The user will ask questions about cooking. Respond concisely and only include ingredients commonly found in a typical pantry.`;

export default function TokenCounter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [text, setText] = useState(SAMPLE);
  const [encoders, setEncoders] = useState<{ o200k: EncodeFn; cl100k: EncodeFn } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadEncoders().then((enc) => { if (!cancelled) setEncoders(enc); });
    return () => { cancelled = true; };
  }, []);

  const models = useMemo(() => buildModels(encoders), [encoders]);
  const results = useMemo(() => models.map((m) => {
    const tokens = m.count(text);
    const costPerCall = (tokens / 1_000_000) * m.inputPricePerMillion;
    return { ...m, tokens, costPerCall };
  }), [models, text]);

  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;

  function copyAllCounts() {
    const rows = results.map((r) => `${r.label}\t${r.tokens}${r.exact ? "" : " (approx)"}\t$${r.costPerCall.toFixed(6)}`);
    navigator.clipboard.writeText(["Model\tTokens\tInput cost", ...rows].join("\n"));
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Paste your prompt or input text. Token counts and approximate input cost update live for each major LLM. Exact counts use the real OpenAI tokenizer (tiktoken). Other vendors use a chars-per-token heuristic because their tokenizers aren't publicly available in JavaScript.",
        formula: "Token count = number of BPE tokens the model's tokenizer produces. Cost = (tokens / 1,000,000) × input price per million. Output cost is 3-5x input cost and depends on response length, so it's not estimated here.",
        examples: "The string \"Hello, world!\" is 4 tokens in GPT-4o (cl100k_base + o200k_base both split it the same way). One \"average\" English word ≈ 1.3 tokens. One code token ≈ 0.5 words.",
        faq: [
          { q: "Are these token counts exact?", a: "For OpenAI models (GPT-3.5, GPT-4, GPT-4o) yes — we use the actual tiktoken encoder running in your browser. For Claude, Gemini, and Llama, no public JavaScript tokenizer exists, so we use a chars-per-token heuristic calibrated against published averages (~3.5 for Claude, ~4 for Gemini, ~3.8 for Llama). Expect ±10% error on those." },
          { q: "Why does the same text produce different counts on different models?", a: "Each model family uses its own tokenizer. GPT-4o switched to o200k_base which is more efficient on multilingual text than the older cl100k_base used by GPT-4 / GPT-3.5. Claude, Llama, and Gemini each have their own BPE vocabularies." },
          { q: "Why doesn't the cost include output tokens?", a: "Output token count is unpredictable — it depends on how long the model decides to respond. Most APIs charge 3-5x more for output than input, so total cost is roughly (input tokens) × (input price) + (output tokens) × (3-5 × input price). Multiply this tool's number by your expected response ratio." },
          { q: "What's the difference between cl100k_base and o200k_base?", a: "Both are BPE tokenizers from OpenAI. cl100k_base is used by GPT-3.5 and GPT-4. o200k_base is newer (GPT-4o, GPT-4o mini), has a larger vocabulary (~200k vs ~100k tokens), and is significantly more efficient on non-English text, code, and special characters." },
          { q: "Does this work offline?", a: "Yes. The tokenizer runs entirely in your browser as JavaScript. Nothing is sent to any server. You can disconnect from the internet and the counts will still update." },
          { q: "Why is my Claude token count an estimate?", a: "Anthropic does not publish their tokenizer as a runnable library. The only way to get an exact Claude token count is to call their API's count_tokens endpoint, which requires an API key and a network round-trip. The heuristic we use is accurate to within ~10% for English prose." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div>
          <label className="label">Input text</label>
          <textarea
            className="input font-mono text-sm"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your prompt or any text..."
          />
          <div className="mt-2 flex gap-4 text-xs text-[rgb(var(--fg-muted))]">
            <span><strong className="text-[rgb(var(--fg))]">{chars.toLocaleString()}</strong> characters</span>
            <span><strong className="text-[rgb(var(--fg))]">{words.toLocaleString()}</strong> words</span>
            <span><strong className="text-[rgb(var(--fg))]">{lines.toLocaleString()}</strong> lines</span>
          </div>
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-muted,250,250,252))]">
            <div className="text-xs font-medium">Token counts by model</div>
            <button onClick={copyAllCounts} className="btn-ghost min-tap text-xs"><Copy className="h-3.5 w-3.5" /> Copy table</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[rgb(var(--fg-muted))] border-b border-[rgb(var(--border))]">
                  <th className="px-3 py-2 font-medium">Model</th>
                  <th className="px-3 py-2 font-medium">Vendor</th>
                  <th className="px-3 py-2 font-medium text-right">Tokens</th>
                  <th className="px-3 py-2 font-medium text-right">Input cost / call</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-[rgb(var(--border))] last:border-0">
                    <td className="px-3 py-2 font-medium">{r.label}</td>
                    <td className="px-3 py-2 text-[rgb(var(--fg-muted))]">{r.vendor}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.tokens.toLocaleString()}
                      {!r.exact && <span className="ml-1 text-[10px] text-[rgb(var(--fg-muted))] uppercase">~est</span>}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.inputPricePerMillion === 0 ? "—" : `$${r.costPerCall.toFixed(6)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!encoders && (
          <div className="text-xs text-[rgb(var(--fg-muted))] -mt-2">Loading exact OpenAI tokenizer… (showing estimates until it&apos;s ready)</div>
        )}

        <div className="text-xs text-[rgb(var(--fg-muted))] leading-relaxed">
          <p><strong>Exact counts</strong> (OpenAI): real tiktoken (cl100k_base for GPT-3.5/4, o200k_base for GPT-4o) running in your browser.</p>
          <p className="mt-1"><strong>Estimates</strong> (Claude, Gemini, Llama): chars-per-token heuristic. Expect ±10% on English prose; larger error on code or non-Latin scripts. For exact counts, use each vendor&apos;s own API.</p>
          <p className="mt-1">Prices are <strong>input</strong> only. Output is typically 3-5× more expensive and depends on response length. Pricing reflects published rates as of May 2026 and may change.</p>
        </div>
      </div>
    </ToolPage>
  );
}
