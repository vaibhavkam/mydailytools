// Fetches latest currency rates from Frankfurter (https://frankfurter.dev) at
// build time, merges with static fallbacks for currencies Frankfurter doesn't
// support (BTC, ETH, PKR, BDT, NGN, etc.), and writes lib/rates.json.
//
// Frankfurter is free, key-less, and supplies ECB reference rates. It covers
// ~30 currencies — fine for most users.
//
// Run automatically via the `prebuild` npm script. To run manually:
//   node scripts/fetch-rates.mjs

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const out = resolve(root, "lib/rates.json");

// Currencies we want, identified by ISO 4217. Crypto and a few exotics are
// flagged as static — we never ask Frankfurter for them, just use the fallback.
const CURRENCIES = {
  // ECB-supported (Frankfurter handles)
  USD: { name: "US Dollar",          live: true,  fallback: 1.0000 },
  EUR: { name: "Euro",               live: true,  fallback: 0.9200 },
  GBP: { name: "British Pound",      live: true,  fallback: 0.7900 },
  JPY: { name: "Japanese Yen",       live: true,  fallback: 152.50 },
  CHF: { name: "Swiss Franc",        live: true,  fallback: 0.9100 },
  CAD: { name: "Canadian Dollar",    live: true,  fallback: 1.3800 },
  AUD: { name: "Australian Dollar",  live: true,  fallback: 1.5300 },
  NZD: { name: "New Zealand Dollar", live: true,  fallback: 1.6500 },
  CNY: { name: "Chinese Yuan",       live: true,  fallback: 7.2500 },
  HKD: { name: "Hong Kong Dollar",   live: true,  fallback: 7.8000 },
  SGD: { name: "Singapore Dollar",   live: true,  fallback: 1.3500 },
  KRW: { name: "South Korean Won",   live: true,  fallback: 1370.0 },
  INR: { name: "Indian Rupee",       live: true,  fallback: 83.50 },
  IDR: { name: "Indonesian Rupiah",  live: true,  fallback: 15850 },
  MYR: { name: "Malaysian Ringgit",  live: true,  fallback: 4.7200 },
  THB: { name: "Thai Baht",          live: true,  fallback: 36.50 },
  PHP: { name: "Philippine Peso",    live: true,  fallback: 56.40 },
  SEK: { name: "Swedish Krona",      live: true,  fallback: 10.40 },
  NOK: { name: "Norwegian Krone",    live: true,  fallback: 10.80 },
  DKK: { name: "Danish Krone",       live: true,  fallback: 6.8500 },
  ISK: { name: "Icelandic Króna",    live: true,  fallback: 138.0 },
  PLN: { name: "Polish Złoty",       live: true,  fallback: 3.9500 },
  CZK: { name: "Czech Koruna",       live: true,  fallback: 22.80 },
  HUF: { name: "Hungarian Forint",   live: true,  fallback: 358.0 },
  RON: { name: "Romanian Leu",       live: true,  fallback: 4.5800 },
  BGN: { name: "Bulgarian Lev",      live: true,  fallback: 1.7900 },
  TRY: { name: "Turkish Lira",       live: true,  fallback: 32.50 },
  MXN: { name: "Mexican Peso",       live: true,  fallback: 17.20 },
  BRL: { name: "Brazilian Real",     live: true,  fallback: 5.0500 },
  ILS: { name: "Israeli Shekel",     live: true,  fallback: 3.7000 },
  ZAR: { name: "South African Rand", live: true,  fallback: 18.50 },
  // Static-only (Frankfurter doesn't cover; rates updated manually)
  TWD: { name: "Taiwan Dollar",      live: false, fallback: 32.10 },
  PKR: { name: "Pakistani Rupee",    live: false, fallback: 278.0 },
  BDT: { name: "Bangladeshi Taka",   live: false, fallback: 110.0 },
  VND: { name: "Vietnamese Dong",    live: false, fallback: 25400 },
  RUB: { name: "Russian Ruble",      live: false, fallback: 92.00 },
  UAH: { name: "Ukrainian Hryvnia",  live: false, fallback: 39.50 },
  ARS: { name: "Argentine Peso",     live: false, fallback: 870.0 },
  CLP: { name: "Chilean Peso",       live: false, fallback: 945.0 },
  COP: { name: "Colombian Peso",     live: false, fallback: 3950 },
  PEN: { name: "Peruvian Sol",       live: false, fallback: 3.7500 },
  AED: { name: "UAE Dirham",         live: false, fallback: 3.6700 },
  SAR: { name: "Saudi Riyal",        live: false, fallback: 3.7500 },
  QAR: { name: "Qatari Riyal",       live: false, fallback: 3.6400 },
  KWD: { name: "Kuwaiti Dinar",      live: false, fallback: 0.3070 },
  EGP: { name: "Egyptian Pound",     live: false, fallback: 47.50 },
  NGN: { name: "Nigerian Naira",     live: false, fallback: 1580 },
  KES: { name: "Kenyan Shilling",    live: false, fallback: 130.0 },
  // Crypto (rough; users should rely on real exchanges, not us)
  BTC: { name: "Bitcoin",            live: false, fallback: 0.0000165 },
  ETH: { name: "Ethereum",           live: false, fallback: 0.000350 },
};

async function fetchLiveRates(targets) {
  // Frankfurter API: GET /v1/latest?base=USD&symbols=EUR,GBP,...
  const symbols = targets.filter((c) => c !== "USD").join(",");
  const url = `https://api.frankfurter.dev/v1/latest?base=USD&symbols=${symbols}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Frankfurter ${res.status}: ${await res.text()}`);
  const json = await res.json();
  // json.rates is { EUR: 0.92, GBP: 0.79, ... } per 1 USD
  return { date: json.date, rates: { USD: 1, ...json.rates } };
}

async function main() {
  const liveTargets = Object.entries(CURRENCIES).filter(([, m]) => m.live).map(([k]) => k);
  let live = null;
  try {
    live = await fetchLiveRates(liveTargets);
    console.log(`Frankfurter rates fetched (${live.date}, ${Object.keys(live.rates).length} currencies)`);
  } catch (e) {
    console.warn(`Frankfurter fetch failed: ${e.message}. Falling back to static rates.`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const merged = {};
  for (const [code, meta] of Object.entries(CURRENCIES)) {
    const fromLive = live?.rates?.[code];
    merged[code] = {
      name: meta.name,
      perUSD: typeof fromLive === "number" ? fromLive : meta.fallback,
      live: typeof fromLive === "number",
    };
  }

  const payload = {
    asOf: live?.date ?? today,
    source: live ? "frankfurter.dev" : "static fallback",
    fetchedAt: new Date().toISOString(),
    rates: merged,
  };

  writeFileSync(out, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Wrote ${Object.keys(merged).length} rates to ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
