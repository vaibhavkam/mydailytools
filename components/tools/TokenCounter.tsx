"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
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
type ModelSpec = {
  id: string;
  label: string;
  vendor: string;
  // OpenRouter model ID for the live-refresh button. Use the `~vendor/...-latest`
  // alias form when available so the refresh tracks new versions automatically.
  // null = no OpenRouter equivalent (e.g. self-hosted Llama with no canonical price).
  openrouterId: string | null;
  // Static fallback price ($ per million input tokens) shown before any refresh.
  // Captured manually from OpenRouter on STATIC_PRICES_AS_OF; refresh button
  // overlays live values. See ADR-011-adjacent staleness pattern.
  staticInputPricePerMillion: number;
  count: (text: string) => number;
  exact: boolean;
};

// Stamp shown next to the price column. Update this whenever you re-pull
// prices from openrouter.ai/api/v1/models to refresh the static fallback.
const STATIC_PRICES_AS_OF = "2026-05-22";

const APPROX_CLAUDE = 3.5;
const APPROX_GEMINI = 4.0;
const APPROX_LLAMA = 3.8;

function approxCount(text: string, charsPerToken: number) {
  return Math.ceil(text.length / charsPerToken);
}

function buildModels(encoders: { o200k: EncodeFn; cl100k: EncodeFn } | null): ModelSpec[] {
  return [
    {
      id: "openai-latest",
      label: "GPT (latest)",
      vendor: "OpenAI",
      openrouterId: "openai/gpt-latest",
      staticInputPricePerMillion: 5,
      count: (t) => encoders ? encoders.o200k(t).length : approxCount(t, 3.8),
      exact: !!encoders,
    },
    {
      id: "openai-mid",
      label: "GPT-5.4 (mid-tier)",
      vendor: "OpenAI",
      openrouterId: "openai/gpt-5.4",
      staticInputPricePerMillion: 2.5,
      count: (t) => encoders ? encoders.o200k(t).length : approxCount(t, 3.8),
      exact: !!encoders,
    },
    {
      id: "claude-opus",
      label: "Claude Opus (latest)",
      vendor: "Anthropic",
      openrouterId: "anthropic/claude-opus-latest",
      staticInputPricePerMillion: 5,
      count: (t) => approxCount(t, APPROX_CLAUDE),
      exact: false,
    },
    {
      id: "claude-sonnet",
      label: "Claude Sonnet (latest)",
      vendor: "Anthropic",
      openrouterId: "anthropic/claude-sonnet-latest",
      staticInputPricePerMillion: 3,
      count: (t) => approxCount(t, APPROX_CLAUDE),
      exact: false,
    },
    {
      id: "claude-haiku",
      label: "Claude Haiku (latest)",
      vendor: "Anthropic",
      openrouterId: "anthropic/claude-haiku-latest",
      staticInputPricePerMillion: 1,
      count: (t) => approxCount(t, APPROX_CLAUDE),
      exact: false,
    },
    {
      id: "gemini-pro",
      label: "Gemini Pro (latest)",
      vendor: "Google",
      openrouterId: "google/gemini-pro-latest",
      staticInputPricePerMillion: 2,
      count: (t) => approxCount(t, APPROX_GEMINI),
      exact: false,
    },
    {
      id: "gemini-flash",
      label: "Gemini Flash (latest)",
      vendor: "Google",
      openrouterId: "google/gemini-flash-latest",
      staticInputPricePerMillion: 1.5,
      count: (t) => approxCount(t, APPROX_GEMINI),
      exact: false,
    },
    {
      id: "llama-3",
      label: "Llama 3.x (70B, self-hosted)",
      vendor: "Meta",
      openrouterId: null,
      staticInputPricePerMillion: 0,
      count: (t) => approxCount(t, APPROX_LLAMA),
      exact: false,
    },
  ];
}

const SAMPLE = `You are a helpful assistant. The user will ask questions about cooking. Respond concisely and only include ingredients commonly found in a typical pantry.`;

// OpenRouter returns prices as raw $/token strings. Convert to $/1M.
type OpenRouterModel = { id: string; pricing?: { prompt?: string | number } };
async function fetchLivePrices(): Promise<Map<string, number>> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`OpenRouter returned ${res.status}`);
  const json: { data?: OpenRouterModel[] } = await res.json();
  const out = new Map<string, number>();
  for (const m of json.data ?? []) {
    const raw = m.pricing?.prompt;
    if (raw == null) continue;
    const perToken = typeof raw === "string" ? parseFloat(raw) : raw;
    if (!Number.isFinite(perToken) || perToken < 0) continue;
    out.set(m.id, perToken * 1_000_000);
  }
  return out;
}

type LiveState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; prices: Map<string, number>; at: number }
  | { kind: "error"; message: string };

export default function TokenCounter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [text, setText] = useState(SAMPLE);
  const [encoders, setEncoders] = useState<{ o200k: EncodeFn; cl100k: EncodeFn } | null>(null);
  const [live, setLive] = useState<LiveState>({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;
    loadEncoders().then((enc) => { if (!cancelled) setEncoders(enc); });
    return () => { cancelled = true; };
  }, []);

  async function refreshPrices() {
    setLive({ kind: "loading" });
    try {
      const prices = await fetchLivePrices();
      setLive({ kind: "ok", prices, at: Date.now() });
    } catch (e: any) {
      setLive({ kind: "error", message: e?.message ?? "Network error" });
    }
  }

  const models = useMemo(() => buildModels(encoders), [encoders]);

  function priceFor(m: ModelSpec): { price: number; source: "static" | "live" | "live-missing" } {
    if (live.kind === "ok" && m.openrouterId) {
      const found = live.prices.get(m.openrouterId);
      if (found != null) return { price: found, source: "live" };
      return { price: m.staticInputPricePerMillion, source: "live-missing" };
    }
    return { price: m.staticInputPricePerMillion, source: "static" };
  }

  const results = useMemo(() => models.map((m) => {
    const tokens = m.count(text);
    const { price, source } = priceFor(m);
    const costPerCall = (tokens / 1_000_000) * price;
    return { ...m, tokens, price, source, costPerCall };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [models, text, live]);

  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;

  function copyAllCounts() {
    const rows = results.map((r) => `${r.label}\t${r.tokens}${r.exact ? "" : " (approx)"}\t$${r.costPerCall.toFixed(6)}`);
    navigator.clipboard.writeText(["Model\tTokens\tInput cost", ...rows].join("\n"));
  }

  const priceLabel = (() => {
    if (live.kind === "ok") {
      const sec = Math.round((Date.now() - live.at) / 1000);
      return `Live from OpenRouter · fetched ${sec < 60 ? "just now" : `${Math.round(sec / 60)} min ago`}`;
    }
    if (live.kind === "loading") return "Fetching live prices…";
    if (live.kind === "error") return `Couldn't fetch live prices: ${live.message}. Showing static prices.`;
    return `Static prices as of ${STATIC_PRICES_AS_OF}`;
  })();

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Paste your prompt or input text. Token counts and approximate input cost update live for each major LLM. Exact counts use the real OpenAI tokenizer (tiktoken). Other vendors use a chars-per-token heuristic because their tokenizers aren't publicly available in JavaScript. Click \"Refresh prices\" to pull current rates from OpenRouter.",
        formula: "Token count = number of BPE tokens the model's tokenizer produces. Cost = (tokens / 1,000,000) × input price per million. Output cost is 3-5x input cost and depends on response length, so it's not estimated here.",
        examples: "The string \"Hello, world!\" is 4 tokens in GPT-4o. One \"average\" English word ≈ 1.3 tokens. One code token ≈ 0.5 words.",
        faq: [
          { q: "Are these token counts exact?", a: "For OpenAI models yes — we use the actual tiktoken encoder (o200k_base) running in your browser. For Claude, Gemini, and Llama, no public JavaScript tokenizer exists, so we use a chars-per-token heuristic calibrated against published averages (~3.5 for Claude, ~4 for Gemini, ~3.8 for Llama). Expect ±10% error on those." },
          { q: "Are the prices current?", a: `The prices shown by default are pinned to ${STATIC_PRICES_AS_OF} when this page was last updated. Click "Refresh prices" to pull live values from OpenRouter, which aggregates current rates across providers. The page falls back to the pinned values if the network call fails.` },
          { q: "Why does the same text produce different counts on different models?", a: "Each model family uses its own tokenizer. Recent OpenAI models use o200k_base, which is more efficient on multilingual text than the older cl100k_base. Claude, Llama, and Gemini each have their own BPE vocabularies." },
          { q: "Why doesn't the cost include output tokens?", a: "Output token count is unpredictable — it depends on how long the model decides to respond. Most APIs charge 3-5x more for output than input, so total cost is roughly (input tokens) × (input price) + (output tokens) × (3-5 × input price). Multiply this tool's number by your expected response ratio." },
          { q: "Where do the live prices come from?", a: "OpenRouter (openrouter.ai), which aggregates pricing across LLM providers for routing purposes. They expose a public JSON API at /api/v1/models. We fetch it only when you click the Refresh button — the page makes zero network calls otherwise." },
          { q: "Does this work offline?", a: "Yes for the token counts. The tokenizer runs entirely in your browser. The live-price refresh button needs network; without it, the page shows the pinned static prices." },
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
            <div className="flex gap-2">
              <button
                onClick={refreshPrices}
                disabled={live.kind === "loading"}
                className="btn-ghost min-tap text-xs disabled:opacity-50"
                aria-label="Refresh prices from OpenRouter"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${live.kind === "loading" ? "animate-spin" : ""}`} />
                Refresh prices
              </button>
              <button onClick={copyAllCounts} className="btn-ghost min-tap text-xs"><Copy className="h-3.5 w-3.5" /> Copy table</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[rgb(var(--fg-muted))] border-b border-[rgb(var(--border))]">
                  <th className="px-3 py-2 font-medium">Model</th>
                  <th className="px-3 py-2 font-medium">Vendor</th>
                  <th className="px-3 py-2 font-medium text-right">Tokens</th>
                  <th className="px-3 py-2 font-medium text-right">$/1M input</th>
                  <th className="px-3 py-2 font-medium text-right">Cost / call</th>
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
                      {r.price === 0 ? "—" : `$${r.price.toFixed(2)}`}
                      {r.source === "live" && <span className="ml-1 text-[10px] text-emerald-600 uppercase">live</span>}
                      {r.source === "live-missing" && <span className="ml-1 text-[10px] text-[rgb(var(--fg-muted))] uppercase" title="Not in OpenRouter's response">pinned</span>}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.price === 0 ? "—" : `$${r.costPerCall.toFixed(6)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`px-3 py-2 text-[11px] border-t border-[rgb(var(--border))] ${live.kind === "error" ? "text-red-600" : "text-[rgb(var(--fg-muted))]"}`}>
            {priceLabel}
          </div>
        </div>

        {!encoders && (
          <div className="text-xs text-[rgb(var(--fg-muted))] -mt-2">Loading exact OpenAI tokenizer… (showing estimates until it&apos;s ready)</div>
        )}

        <div className="text-xs text-[rgb(var(--fg-muted))] leading-relaxed">
          <p><strong>Exact counts</strong> (OpenAI): real tiktoken (o200k_base) running in your browser.</p>
          <p className="mt-1"><strong>Estimates</strong> (Claude, Gemini, Llama): chars-per-token heuristic. Expect ±10% on English prose; larger error on code or non-Latin scripts. For exact counts, use each vendor&apos;s own API.</p>
          <p className="mt-1">Prices are <strong>input</strong> only. Output is typically 3-5× more expensive and depends on response length. Static prices reflect rates pinned on {STATIC_PRICES_AS_OF}. Click <em>Refresh prices</em> to pull live values from OpenRouter.</p>
        </div>
      </div>
    </ToolPage>
  );
}
