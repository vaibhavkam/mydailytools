"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import staticRates from "@/lib/rates.json";

// Build-time rates ship in lib/rates.json. They're refreshed nightly via the
// scripts/fetch-rates.mjs prebuild step. Users who want a live update can click
// "Refresh" to call Frankfurter directly from the browser; we cache that
// result in localStorage so subsequent sessions start fresh too.

type RateEntry = { name: string; perUSD: number; live: boolean };
type RatesPayload = { asOf: string; source: string; fetchedAt: string; rates: Record<string, RateEntry> };

const SHIPPED: RatesPayload = staticRates as RatesPayload;
const CACHE_KEY = "mdt:currency-rates";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function readCache(): RatesPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RatesPayload;
    if (!parsed?.fetchedAt) return null;
    const age = Date.now() - new Date(parsed.fetchedAt).getTime();
    if (age > 24 * 60 * 60 * 1000) return null; // discard if older than a day
    return parsed;
  } catch { return null; }
}

export default function CurrencyConverter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [payload, setPayload] = useState<RatesPayload>(SHIPPED);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  // On mount: prefer a cached fresh payload from a prior refresh.
  useEffect(() => {
    const cached = readCache();
    if (cached) setPayload(cached);
  }, []);

  async function refresh() {
    setRefreshing(true); setRefreshError(null);
    try {
      // Frankfurter returns 30+ ECB rates; merge into our shipped fallback so
      // exotic/crypto currencies (PKR, BTC, etc.) keep their last-known values.
      const symbols = Object.keys(SHIPPED.rates).filter((c) => c !== "USD" && SHIPPED.rates[c].live).join(",");
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${symbols}`, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
      const live = await res.json();
      const merged: RatesPayload = {
        asOf: live.date,
        source: "frankfurter.dev (live, in-browser)",
        fetchedAt: new Date().toISOString(),
        rates: Object.fromEntries(Object.entries(SHIPPED.rates).map(([code, entry]) => {
          const liveRate = live.rates?.[code];
          return [code, { ...entry, perUSD: typeof liveRate === "number" ? liveRate : (code === "USD" ? 1 : entry.perUSD) }];
        })),
      };
      setPayload(merged);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch { /* private mode etc. */ }
    } catch (e: any) {
      setRefreshError(e.message || "Failed to fetch live rates");
    } finally {
      setRefreshing(false);
    }
  }

  const result = useMemo(() => {
    const a = parseFloat(amount);
    if (!Number.isFinite(a)) return null;
    const fromRate = payload.rates[from]?.perUSD;
    const toRate = payload.rates[to]?.perUSD;
    if (!fromRate || !toRate) return null;
    return (a / fromRate) * toRate;
  }, [amount, from, to, payload]);

  // "Live" specifically means the user clicked Refresh this session.
  const isLive = payload.source.includes("in-browser");

  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter an amount, pick source and target currencies. Rates ship daily-fresh from the build; click 'Refresh' for an instant live fetch from Frankfurter (ECB reference rates).",
      formula: "Convert via USD as a pivot: USD = amount ÷ from-rate; result = USD × to-rate.",
      examples: "100 USD ≈ 92 EUR. 100 EUR ≈ 108.7 USD. Crypto rates (BTC/ETH) are rough estimates from build time, not live.",
      faq: [
        { q: "How current are these rates?", a: "Built into the site at build time, refreshed daily via a cron-triggered redeploy. The 'Refresh' button fetches in real time from Frankfurter (api.frankfurter.dev — free, no key)." },
        { q: "Are these tradeable rates?", a: "No. ECB reference rates are mid-market — actual broker spreads will be wider. For trading, use your bank or broker's quote." },
        { q: "Why do crypto rates look stale?", a: "Frankfurter only covers fiat. Crypto rates ship as build-time fallbacks. Use a real exchange for crypto." },
      ],
    }}>
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-200 mb-3 flex items-center justify-between gap-3">
        <span>
          Rates as of {payload.asOf} {isLive ? "(refreshed live)" : "(daily build)"} · source: {payload.source.split(" ")[0]}
        </span>
        <button onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-60">
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {refreshError && (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200 mb-3">
          {refreshError} — using build-time rates from {payload.asOf}.
        </div>
      )}
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Amount</label><input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <div><label className="label">From</label>
          <select className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
            {Object.entries(payload.rates).map(([k, v]) => <option key={k} value={k}>{k} — {v.name}</option>)}
          </select>
        </div>
        <div><label className="label">To</label>
          <select className="input" value={to} onChange={(e) => setTo(e.target.value)}>
            {Object.entries(payload.rates).map(([k, v]) => <option key={k} value={k}>{k} — {v.name}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
        <div className="text-xs uppercase text-brand-700 dark:text-brand-300">{amount} {from} =</div>
        <div className="text-3xl font-bold tabular-nums">
          {result != null ? result.toLocaleString(undefined, { maximumFractionDigits: 4 }) + " " + to : "—"}
        </div>
        {result != null && payload.rates[from] && payload.rates[to] && (
          <div className="text-xs text-[rgb(var(--fg-muted))] mt-1">
            1 {from} = {(payload.rates[to].perUSD / payload.rates[from].perUSD).toFixed(6)} {to}
          </div>
        )}
      </div>
    </ToolPage>
  );
}
