"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { useLocale } from "@/lib/locale";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

export function MortgageCalculator({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [price, setPrice] = useState("400000");
  const [down, setDown] = useState("80000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [tax, setTax] = useState("4800");      // annual property tax
  const [insurance, setInsurance] = useState("1200"); // annual home insurance
  const r = useMemo(() => {
    const P = parseFloat(price) - parseFloat(down);
    const i = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    if (!P || !n || i < 0) return null;
    const PI = i === 0 ? P / n : (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const T = parseFloat(tax) / 12;
    const I = parseFloat(insurance) / 12;
    const PITI = PI + T + I;
    return { PI, T, I, PITI, total: PI * n, interest: PI * n - P };
  }, [price, down, rate, years, tax, insurance]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter the home price, down payment, interest rate, term, and yearly taxes/insurance. The result shows your monthly PITI (principal + interest + taxes + insurance) and total interest.",
      formula: "Monthly P&I = P × i(1+i)ⁿ / ((1+i)ⁿ − 1), where P = price − down, i = annual rate / 12, n = years × 12. PITI adds property tax/12 + insurance/12.",
      examples: "400k home, 80k down, 30 yr at 6.5%: P&I ≈ 2,022/mo. Add 400 tax + 100 insurance → PITI ≈ 2,522/mo.",
      faq: [{ q: "Does this include PMI?", a: "No — PMI typically applies when down payment is below 20%. Add ~0.5–1% of loan amount yearly to estimate." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Home price ({sym})</label><input className="input" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label className="label">Down payment ({sym})</label><input className="input" value={down} onChange={(e) => setDown(e.target.value)} /></div>
        <div><label className="label">Annual rate (%)</label><input className="input" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
        <div><label className="label">Term (years)</label><input className="input" value={years} onChange={(e) => setYears(e.target.value)} /></div>
        <div><label className="label">Property tax/year ({sym})</label><input className="input" value={tax} onChange={(e) => setTax(e.target.value)} /></div>
        <div><label className="label">Home insurance/year ({sym})</label><input className="input" value={insurance} onChange={(e) => setInsurance(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Tile label="P & I" value={fmt(r.PI)} big />
          <Tile label="Tax (mo)" value={fmt(r.T)} />
          <Tile label="Insurance (mo)" value={fmt(r.I)} />
          <Tile label="PITI" value={fmt(r.PITI)} big />
          <Tile label="Total paid" value={fmt(r.total)} />
          <Tile label="Total interest" value={fmt(r.interest)} />
        </div>
      )}
    </ToolPage>
  );
}

export function CompoundInterest({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [P, setP] = useState("10000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("20");
  const [contrib, setContrib] = useState("200");      // monthly addition
  const [n, setN] = useState("12");                   // compounds/year
  const r = useMemo(() => {
    const principal = parseFloat(P);
    const r_ = parseFloat(rate) / 100;
    const t = parseFloat(years);
    const c = parseFloat(contrib);
    const k = parseFloat(n);
    if (![principal, r_, t, c, k].every(Number.isFinite) || k <= 0) return null;
    const A = principal * Math.pow(1 + r_ / k, k * t);
    // Future value of monthly contributions (treated as additional periodic deposits at frequency 12).
    const monthlyRate = r_ / 12;
    const months = t * 12;
    const FVcontrib = c * (monthlyRate === 0 ? months : (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const total = A + FVcontrib;
    const contributed = principal + c * months;
    return { total, contributed, interest: total - contributed };
  }, [P, rate, years, contrib, n]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Set your starting amount, annual interest rate, time horizon, monthly contribution, and how often interest compounds. Future value, total contributions, and interest earned compute live.",
      formula: "FV of principal: A = P(1 + r/n)^(nt). FV of monthly contributions: c × ((1 + r/12)ᵗ⁾¹² − 1) / (r/12). Total = both, summed.",
      examples: "10k starting, 7%, 20 yr, 200/mo contribution = ~144k future value, ~58k contributed, ~86k interest.",
      faq: [{ q: "Why is the interest so much larger than contributions?", a: "Compounding — interest earns interest. The longer the time horizon, the more dramatic the effect." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Starting amount ({sym})</label><input className="input" value={P} onChange={(e) => setP(e.target.value)} /></div>
        <div><label className="label">Annual rate (%)</label><input className="input" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
        <div><label className="label">Years</label><input className="input" value={years} onChange={(e) => setYears(e.target.value)} /></div>
        <div><label className="label">Monthly contribution ({sym})</label><input className="input" value={contrib} onChange={(e) => setContrib(e.target.value)} /></div>
        <div><label className="label">Compounds/year</label><input className="input" value={n} onChange={(e) => setN(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="Future value" value={fmt(r.total)} big />
          <Tile label="Total contributed" value={fmt(r.contributed)} />
          <Tile label="Interest earned" value={fmt(r.interest)} />
        </div>
      )}
    </ToolPage>
  );
}

export function DiscountCalculator({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [price, setPrice] = useState("100");
  const [pct, setPct] = useState("25");
  const r = useMemo(() => {
    const p = parseFloat(price), d = parseFloat(pct);
    if (!Number.isFinite(p) || !Number.isFinite(d)) return null;
    const off = p * d / 100;
    return { off, final: p - off };
  }, [price, pct]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter the original price and discount percent. Saving and final price compute instantly.",
      formula: "Discount = price × (percent ÷ 100). Final = price − discount.",
      examples: "100 at 25% off = 25 saved, 75 final.",
      faq: [
        { q: "How do I calculate a discount percentage?", a: "Divide the amount you save by the original price, then multiply by 100. For example, saving 25 on a 100 item is a 25% discount." },
        { q: "What if I have a stacked discount?", a: "Apply them sequentially, not additively. A 20% off then 10% off is not 30% off — it's 28% off (100 → 80 → 72)." },
        { q: "Can I use this to find the original price from the sale price?", a: "Yes — enter the original price field as the unknown and work backwards, or rearrange: original = final ÷ (1 − discount/100)." },
      ],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Original price ({sym})</label><input className="input" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label className="label">Discount (%)</label><input className="input" value={pct} onChange={(e) => setPct(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="You save" value={fmt(r.off)} />
          <Tile label="Final price" value={fmt(r.final)} big />
        </div>
      )}
    </ToolPage>
  );
}

// Common consumption-tax rates around the world. Useful as quick-presets so
// users don't have to remember whether VAT is 19 or 20 in their country.
const TAX_PRESETS: { label: string; rate: number; kind: string }[] = [
  { label: "US — varies by state",    rate: 8.25, kind: "Sales Tax" },
  { label: "Canada — GST 5%",         rate: 5,    kind: "GST" },
  { label: "Canada — HST (ON) 13%",   rate: 13,   kind: "HST" },
  { label: "UK — VAT 20%",            rate: 20,   kind: "VAT" },
  { label: "EU — VAT 19% (DE)",       rate: 19,   kind: "VAT" },
  { label: "EU — VAT 20% (FR/AT)",    rate: 20,   kind: "VAT" },
  { label: "EU — VAT 21% (NL/ES/BE)", rate: 21,   kind: "VAT" },
  { label: "EU — VAT 22% (IT)",       rate: 22,   kind: "VAT" },
  { label: "EU — VAT 25% (DK/SE)",    rate: 25,   kind: "VAT" },
  { label: "Australia — GST 10%",     rate: 10,   kind: "GST" },
  { label: "New Zealand — GST 15%",   rate: 15,   kind: "GST" },
  { label: "India — GST 5% / 12% / 18% / 28%", rate: 18, kind: "GST" },
  { label: "Japan — Consumption 10%", rate: 10,   kind: "Consumption Tax" },
  { label: "Singapore — GST 9%",      rate: 9,    kind: "GST" },
];

export function SalesTaxCalculator({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [price, setPrice] = useState("100");
  const [rate, setRate] = useState("8.25");
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [kind, setKind] = useState("Sales Tax"); // display label
  const r = useMemo(() => {
    const p = parseFloat(price), t = parseFloat(rate) / 100;
    if (!Number.isFinite(p) || !Number.isFinite(t)) return null;
    if (mode === "add") { const tax = p * t; return { tax, total: p + tax, pretax: p }; }
    const pretax = p / (1 + t); const tax = p - pretax;
    return { tax, total: p, pretax };
  }, [price, rate, mode]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a country preset, or enter your own rate. Choose 'add' if your input is pre-tax, or 'remove' to back out the pre-tax amount from a tax-inclusive total.",
      formula: "Add: tax = price × rate; total = price + tax. Remove: pretax = price ÷ (1 + rate); tax = price − pretax.",
      examples: "100 + 8.25% sales tax (US) = 108.25. UK VAT 20%: 100 → 120. Removing 20% VAT from 120 → 100 + 20 tax.",
      faq: [
        { q: "What's the difference between Sales Tax, VAT, GST, HST?", a: "They're all consumption taxes. Sales Tax (US) is added at point-of-sale. VAT (most of Europe) is paid at every step of the supply chain but only the end consumer bears the net cost. GST (Canada/Australia/India/NZ) is similar to VAT. HST (Canada) is GST + provincial sales tax combined." },
        { q: "Are these rates current?", a: "Snapshots — verify against your country's tax authority before relying on them. Local sub-jurisdictions (US states, Canadian provinces, Indian states) often add their own rates." },
      ],
    }}>
      <div>
        <label className="label">Country / region preset</label>
        <select className="input" onChange={(e) => {
          const p = TAX_PRESETS[Number(e.target.value)];
          if (p) { setRate(String(p.rate)); setKind(p.kind); }
        }}>
          <option value="">— Pick a preset —</option>
          {TAX_PRESETS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mt-3 mb-3">
        {(["add", "remove"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${mode === m ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{m === "add" ? `Add ${kind}` : `Remove ${kind}`}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">{mode === "add" ? "Pre-tax price" : "Total (inc. tax)"}</label><input className="input" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label className="label">{kind} rate (%)</label><input className="input" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="Pre-tax" value={fmt(r.pretax)} />
          <Tile label={kind} value={fmt(r.tax)} />
          <Tile label="Total" value={fmt(r.total)} big />
        </div>
      )}
    </ToolPage>
  );
}

export function SalaryCalculator({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [hourly, setHourly] = useState("25");
  const [hpw, setHpw] = useState("40");           // hours/week
  const [wpy, setWpy] = useState("52");           // weeks/year
  const r = useMemo(() => {
    const h = parseFloat(hourly), w = parseFloat(hpw), y = parseFloat(wpy);
    if (![h, w, y].every(Number.isFinite)) return null;
    const weekly = h * w;
    return { hourly: h, daily: h * (w / 5), weekly, biweekly: weekly * 2, monthly: (weekly * y) / 12, yearly: weekly * y };
  }, [hourly, hpw, wpy]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter your hourly rate, hours per week, and weeks per year (52 minus vacation if you don't get PTO). All other timeframes calculate.",
      formula: "Weekly = hourly × hours/week. Yearly = weekly × weeks/year. Monthly = yearly ÷ 12. Daily assumes 5 workdays per week.",
      examples: "25/hr × 40 hr/wk × 52 wk = 52,000/yr ≈ 4,333/mo.",
      faq: [{ q: "Pre-tax or post-tax?", a: "Pre-tax (gross). Net pay depends on your tax bracket and deductions." }],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Hourly rate ({sym})</label><input className="input" value={hourly} onChange={(e) => setHourly(e.target.value)} /></div>
        <div><label className="label">Hours / week</label><input className="input" value={hpw} onChange={(e) => setHpw(e.target.value)} /></div>
        <div><label className="label">Weeks / year</label><input className="input" value={wpy} onChange={(e) => setWpy(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Tile label="Hourly" value={fmt(r.hourly)} />
          <Tile label="Daily" value={fmt(r.daily)} />
          <Tile label="Weekly" value={fmt(r.weekly)} />
          <Tile label="Biweekly" value={fmt(r.biweekly)} />
          <Tile label="Monthly" value={fmt(r.monthly)} />
          <Tile label="Yearly" value={fmt(r.yearly)} big />
        </div>
      )}
    </ToolPage>
  );
}

export function RoiCalculator({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [start, setStart] = useState("1000");
  const [end, setEnd] = useState("1500");
  const [years, setYears] = useState("3");
  const r = useMemo(() => {
    const s = parseFloat(start), e = parseFloat(end), t = parseFloat(years);
    if (![s, e, t].every(Number.isFinite) || s <= 0) return null;
    const total = ((e - s) / s) * 100;
    const annualized = (Math.pow(e / s, 1 / t) - 1) * 100;
    return { gain: e - s, total, annualized };
  }, [start, end, years]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter your initial investment, final value, and years held. The total ROI and annualized (CAGR) ROI compute together.",
      formula: "ROI = (final − initial) ÷ initial × 100. Annualized = (final/initial)^(1/years) − 1, ×100.",
      examples: "1,000 → 1,500 over 3 yr: 50% total ROI, ~14.47% annualized (CAGR).",
      faq: [{ q: "ROI vs CAGR?", a: "ROI is the simple total return. CAGR (compound annual growth rate) annualizes it for fair comparison across time periods." }],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Initial ({sym})</label><input className="input" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><label className="label">Final ({sym})</label><input className="input" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        <div><label className="label">Years</label><input className="input" value={years} onChange={(e) => setYears(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="Gain" value={fmt(r.gain)} />
          <Tile label="Total ROI" value={r.total.toFixed(2) + "%"} big />
          <Tile label="Annualized" value={r.annualized.toFixed(2) + "%"} />
        </div>
      )}
    </ToolPage>
  );
}

// US CPI-U annual averages, 1913–2023. Source: BLS, retrieved at build time.
const CPI: Record<number, number> = {
  1913: 9.9, 1920: 20.0, 1930: 16.7, 1940: 14.0, 1950: 24.1, 1960: 29.6, 1970: 38.8, 1980: 82.4, 1985: 107.6, 1990: 130.7,
  1995: 152.4, 2000: 172.2, 2005: 195.3, 2010: 218.056, 2015: 237.017, 2018: 251.107, 2019: 255.657, 2020: 258.811,
  2021: 270.970, 2022: 292.655, 2023: 304.702, 2024: 313.689,
};
const CPI_YEARS = Object.keys(CPI).map(Number).sort((a, b) => a - b);
function cpiFor(y: number) {
  if (CPI[y]) return CPI[y];
  // Linear interpolate between nearest known years.
  const lower = [...CPI_YEARS].reverse().find((x) => x <= y);
  const upper = CPI_YEARS.find((x) => x >= y);
  if (!lower || !upper) return null;
  if (lower === upper) return CPI[lower];
  return CPI[lower] + ((CPI[upper] - CPI[lower]) * (y - lower)) / (upper - lower);
}
export function InflationCalculator({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("1990");
  const [to, setTo] = useState("2024");
  const r = useMemo(() => {
    const a = parseFloat(amount), f = parseInt(from), t = parseInt(to);
    if (!Number.isFinite(a) || !Number.isFinite(f) || !Number.isFinite(t)) return null;
    const cf = cpiFor(f), ct = cpiFor(t);
    if (cf == null || ct == null) return { error: `Year out of range (${CPI_YEARS[0]}–${CPI_YEARS[CPI_YEARS.length - 1]})` };
    const equivalent = a * (ct / cf);
    const totalPct = (equivalent / a - 1) * 100;
    return { equivalent, totalPct };
  }, [amount, from, to]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter an amount and two years (US only). The equivalent buying power and total inflation are computed using BLS CPI-U data through 2024.",
      formula: "Equivalent = amount × (CPI_target ÷ CPI_source). Total inflation = (CPI_target ÷ CPI_source − 1) × 100.",
      examples: "100 USD in 1990 had the same buying power as ~240 USD in 2024 — a ~140% cumulative price increase. (US CPI-U.)",
      faq: [{ q: "Which inflation measure?", a: "CPI-U (Consumer Price Index for All Urban Consumers), the most commonly cited US measure." }, { q: "Other countries?", a: "Not yet — US-only for now." }],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Amount ({sym})</label><input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <div><label className="label">From year</label><input className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label">To year</label><input className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      {r && ("error" in r ? <p className="mt-3 text-sm text-red-600">{r.error}</p> : (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="Equivalent buying power" value={fmt(r.equivalent)} big />
          <Tile label="Total inflation" value={r.totalPct.toFixed(1) + "%"} />
        </div>
      ))}
    </ToolPage>
  );
}

function Tile({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className={`rounded-xl border border-[rgb(var(--border))] p-3 text-center ${big ? "bg-brand-50 dark:bg-brand-950/40 border-brand-300/60" : ""}`}>
      <div className="text-xs text-[rgb(var(--fg-muted))]">{label}</div>
      <div className={`${big ? "text-2xl" : "text-lg"} font-semibold tabular-nums`}>{value}</div>
    </div>
  );
}
