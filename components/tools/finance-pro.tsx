"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { useLocale } from "@/lib/locale";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };
const pct = (n: number, d = 2) => Number.isFinite(n) ? `${n.toFixed(d)}%` : "—";

function Tile({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className={`rounded-xl border border-[rgb(var(--border))] p-3 text-center ${big ? "bg-brand-50 dark:bg-brand-950/40 border-brand-300/60" : ""}`}>
      <div className="text-xs text-[rgb(var(--fg-muted))]">{label}</div>
      <div className={`${big ? "text-2xl" : "text-lg"} font-semibold tabular-nums`}>{value}</div>
    </div>
  );
}

// =====================================================================
// NPV & IRR
// =====================================================================
function npv(rate: number, flows: number[]) {
  return flows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}
function irr(flows: number[]): number | null {
  // Bisection — robust for typical cash flow shapes.
  // Works when there's at least one sign change.
  const hasSignChange = flows.some((cf, i) => i > 0 && Math.sign(cf) !== Math.sign(flows[0]));
  if (!hasSignChange) return null;
  let lo = -0.999, hi = 10;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const v = npv(mid, flows);
    if (Math.abs(v) < 1e-7) return mid;
    if (npv(lo, flows) * v < 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}
export function NpvIrr({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [text, setText] = useState("-1000, 200, 300, 400, 500");
  const [rate, setRate] = useState("10");
  const r = useMemo(() => {
    const flows = text.split(/[, \n]+/).map(Number).filter(Number.isFinite);
    if (flows.length < 2) return null;
    const r_ = parseFloat(rate) / 100;
    return { npv: npv(r_, flows), irr: irr(flows) };
  }, [text, rate]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter your cash flow series (period 0 first, typically the negative initial investment) separated by commas, spaces, or new lines. Set the discount rate for NPV. IRR is computed automatically.",
      formula: "NPV = Σ (CF_t / (1 + r)^t). IRR is the rate r where NPV = 0 — solved here by bisection over [-99.9%, 1000%].",
      examples: "Initial −1000, then 200, 300, 400, 500 over 4 years at 10%: NPV ≈ -103.55, IRR ≈ 12.83%.",
      faq: [
        { q: "Multiple IRRs?", a: "When cash flows have multiple sign changes, IRR isn't unique. We return the first root found; for those cases, prefer MIRR." },
        { q: "What discount rate should I use?", a: "Common choice is your firm's WACC for project evaluation, or a market rate equal to the project's risk." },
      ],
    }}>
      <label className="label">Cash flows (period 0 first)</label>
      <textarea className="input min-h-[80px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3"><label className="label">Discount rate (%)</label><input className="input" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label={`NPV at ${rate}%`} value={fmt(r.npv)} big />
          <Tile label="IRR" value={r.irr == null ? "n/a" : pct(r.irr * 100)} />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// WACC
// =====================================================================
export function Wacc({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [E, setE] = useState("600");      // Market cap (equity)
  const [D, setD] = useState("400");      // Total debt
  const [Re, setRe] = useState("10");     // Cost of equity (%)
  const [Rd, setRd] = useState("5");      // Cost of debt (%)
  const [Tc, setTc] = useState("21");     // Tax rate (%)
  const r = useMemo(() => {
    const e = parseFloat(E), d = parseFloat(D), re = parseFloat(Re) / 100, rd = parseFloat(Rd) / 100, t = parseFloat(Tc) / 100;
    if (![e, d, re, rd, t].every(Number.isFinite) || e + d <= 0) return null;
    const v = e + d;
    const wacc = (e / v) * re + (d / v) * rd * (1 - t);
    return { wacc, weightE: e / v, weightD: d / v };
  }, [E, D, Re, Rd, Tc]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter market value of equity (E), debt (D), cost of equity (Re), pre-tax cost of debt (Rd), and corporate tax rate (Tc). The weighted average cost of capital is computed.",
      formula: "WACC = (E/V) × Re + (D/V) × Rd × (1 − Tc), where V = E + D. The (1 − Tc) factor reflects the tax-deductibility of interest.",
      examples: "E = 600, D = 400, Re = 10%, Rd = 5%, Tc = 21% → WACC ≈ 7.58%.",
      faq: [
        { q: "Book or market values?", a: "Always use market values — book values understate WACC for profitable firms." },
        { q: "Where does cost of equity come from?", a: "Most commonly CAPM: Re = Rf + β × (Rm − Rf). See the CAPM tool." },
      ],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Equity value E ({sym})</label><input className="input" value={E} onChange={(e) => setE(e.target.value)} /></div>
        <div><label className="label">Debt value D ({sym})</label><input className="input" value={D} onChange={(e) => setD(e.target.value)} /></div>
        <div><label className="label">Cost of equity Re (%)</label><input className="input" value={Re} onChange={(e) => setRe(e.target.value)} /></div>
        <div><label className="label">Cost of debt Rd (%)</label><input className="input" value={Rd} onChange={(e) => setRd(e.target.value)} /></div>
        <div><label className="label">Tax rate Tc (%)</label><input className="input" value={Tc} onChange={(e) => setTc(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="Equity weight" value={pct(r.weightE * 100, 1)} />
          <Tile label="Debt weight" value={pct(r.weightD * 100, 1)} />
          <Tile label="WACC" value={pct(r.wacc * 100, 3)} big />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// CAPM
// =====================================================================
export function Capm({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [rf, setRf] = useState("4.0");
  const [beta, setBeta] = useState("1.20");
  const [erp, setErp] = useState("5.5");
  const r = useMemo(() => {
    const f = parseFloat(rf) / 100, b = parseFloat(beta), e = parseFloat(erp) / 100;
    if (![f, b, e].every(Number.isFinite)) return null;
    return { req: f + b * e, premium: b * e };
  }, [rf, beta, erp]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter the risk-free rate (typically 10-year Treasury yield), the asset's beta, and the equity risk premium (long-run market return minus risk-free rate, often 4–6%).",
      formula: "Re = Rf + β × (Rm − Rf), where (Rm − Rf) is the equity risk premium.",
      examples: "Rf = 4%, β = 1.2, ERP = 5.5% → required return = 4% + 1.2 × 5.5% = 10.6%.",
      faq: [
        { q: "What's a typical equity risk premium?", a: "Damodaran's implied ERP for the US has hovered around 4–6% in recent years." },
        { q: "Beta < 0?", a: "Yes — gold and some defensive stocks can have negative betas, implying required return below Rf." },
      ],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Risk-free rate (%)</label><input className="input" value={rf} onChange={(e) => setRf(e.target.value)} /></div>
        <div><label className="label">Beta</label><input className="input" value={beta} onChange={(e) => setBeta(e.target.value)} /></div>
        <div><label className="label">Equity risk premium (%)</label><input className="input" value={erp} onChange={(e) => setErp(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="Risk premium for asset" value={pct(r.premium * 100, 2)} />
          <Tile label="Required return" value={pct(r.req * 100, 2)} big />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// Bond Pricing, YTM, Duration, Convexity
// =====================================================================
function bondPrice(face: number, coupon: number, ytm: number, n: number, freq: number) {
  // coupon and ytm are annual %, expressed as decimals here.
  const c = (coupon * face) / freq;
  const y = ytm / freq;
  const periods = n * freq;
  let pv = 0;
  for (let t = 1; t <= periods; t++) pv += c / Math.pow(1 + y, t);
  pv += face / Math.pow(1 + y, periods);
  return pv;
}
function bondYtm(face: number, coupon: number, price: number, n: number, freq: number): number | null {
  // Bisect for ytm in [-0.99, 5].
  let lo = -0.99, hi = 5;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const p = bondPrice(face, coupon, mid, n, freq);
    if (Math.abs(p - price) < 1e-6) return mid;
    if (bondPrice(face, coupon, lo, n, freq) > price === p > price) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
function macaulayDuration(face: number, coupon: number, ytm: number, n: number, freq: number) {
  const c = (coupon * face) / freq;
  const y = ytm / freq;
  const periods = n * freq;
  let weightedT = 0, pv = 0;
  for (let t = 1; t <= periods; t++) {
    const cf = t === periods ? c + face : c;
    const cfPv = cf / Math.pow(1 + y, t);
    weightedT += (t / freq) * cfPv;
    pv += cfPv;
  }
  return weightedT / pv;
}
function bondConvexity(face: number, coupon: number, ytm: number, n: number, freq: number) {
  const c = (coupon * face) / freq;
  const y = ytm / freq;
  const periods = n * freq;
  let conv = 0, pv = 0;
  for (let t = 1; t <= periods; t++) {
    const cf = t === periods ? c + face : c;
    const cfPv = cf / Math.pow(1 + y, t);
    conv += (t * (t + 1)) * cfPv;
    pv += cfPv;
  }
  return conv / (pv * Math.pow(1 + y, 2)) / (freq * freq);
}
export function BondPricing({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [mode, setMode] = useState<"priceFromYtm" | "ytmFromPrice">("priceFromYtm");
  const [face, setFace] = useState("1000");
  const [coupon, setCoupon] = useState("5");
  const [years, setYears] = useState("10");
  const [freq, setFreq] = useState("2");
  const [ytm, setYtm] = useState("4.5");
  const [price, setPrice] = useState("1040");
  const r = useMemo(() => {
    const F = parseFloat(face), C = parseFloat(coupon) / 100, n = parseFloat(years), f = parseFloat(freq);
    if (![F, C, n, f].every(Number.isFinite) || f <= 0) return null;
    let y_: number;
    let p_: number;
    if (mode === "priceFromYtm") {
      y_ = parseFloat(ytm) / 100;
      if (!Number.isFinite(y_)) return null;
      p_ = bondPrice(F, C, y_, n, f);
    } else {
      p_ = parseFloat(price);
      if (!Number.isFinite(p_)) return null;
      const guess = bondYtm(F, C, p_, n, f);
      if (guess == null) return null;
      y_ = guess;
    }
    const dur = macaulayDuration(F, C, y_, n, f);
    const modDur = dur / (1 + y_ / f);
    const conv = bondConvexity(F, C, y_, n, f);
    return { price: p_, ytm: y_, dur, modDur, conv };
  }, [mode, face, coupon, years, freq, ytm, price]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick whether you have YTM (and want price) or vice versa. Enter face value, coupon rate, years to maturity, and coupon frequency. Duration (Macaulay & modified) and convexity are computed for the resulting yield.",
      formula: "Price = Σ (C / (1 + y/f)^t) + F / (1 + y/f)^N where N = years × frequency. Modified duration ≈ Macaulay / (1 + y/f). Convexity ≈ Σ t(t+1) × cf_t / (price × (1+y)^2 × f²).",
      examples: "1,000 face, 5% coupon (semi-annual), 10 years to maturity, 4.5% YTM → price ≈ 1,039.96.",
      faq: [
        { q: "Why does the price drop when yields rise?", a: "Future cash flows are discounted at a higher rate, so present value is lower. Modified duration estimates the percent price change for a 1% yield move." },
        { q: "What's convexity used for?", a: "It's the second-order correction to duration's linear approximation. Higher convexity = more curvature, generally desirable for bondholders." },
      ],
    }}>
      <div className="flex gap-2 mb-3">
        {(["priceFromYtm", "ytmFromPrice"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`min-tap rounded-xl px-3 py-2 text-sm ${mode === m ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{m === "priceFromYtm" ? "Price from YTM" : "YTM from Price"}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Face value ({sym})</label><input className="input" value={face} onChange={(e) => setFace(e.target.value)} /></div>
        <div><label className="label">Coupon rate (%/yr)</label><input className="input" value={coupon} onChange={(e) => setCoupon(e.target.value)} /></div>
        <div><label className="label">Years to maturity</label><input className="input" value={years} onChange={(e) => setYears(e.target.value)} /></div>
        <div><label className="label">Coupons per year</label>
          <select className="input" value={freq} onChange={(e) => setFreq(e.target.value)}>
            <option value="1">1 (annual)</option><option value="2">2 (semi-annual)</option><option value="4">4 (quarterly)</option><option value="12">12 (monthly)</option>
          </select>
        </div>
        {mode === "priceFromYtm"
          ? <div><label className="label">YTM (%)</label><input className="input" value={ytm} onChange={(e) => setYtm(e.target.value)} /></div>
          : <div><label className="label">Market price ({sym})</label><input className="input" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        }
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Tile label="Price" value={fmt(r.price)} big />
          <Tile label="YTM" value={pct(r.ytm * 100, 4)} />
          <Tile label="Macaulay duration" value={r.dur.toFixed(4) + " yr"} />
          <Tile label="Modified duration" value={r.modDur.toFixed(4)} />
          <Tile label="Convexity" value={r.conv.toFixed(4)} />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// Black-Scholes
// =====================================================================
function cdf(x: number) {
  // Abramowitz & Stegun approximation of the standard normal CDF.
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}
function pdf(x: number) { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI); }
function bs(S: number, K: number, T: number, r: number, sigma: number, q: number = 0) {
  if (T <= 0 || sigma <= 0) return null;
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const Nd1 = cdf(d1), Nd2 = cdf(d2);
  const eqT = Math.exp(-q * T), erT = Math.exp(-r * T);
  const call = S * eqT * Nd1 - K * erT * Nd2;
  const put = K * erT * cdf(-d2) - S * eqT * cdf(-d1);
  // Greeks
  const dCall = eqT * Nd1, dPut = eqT * (Nd1 - 1);
  const gamma = (eqT * pdf(d1)) / (S * sigma * Math.sqrt(T));
  const vega = S * eqT * pdf(d1) * Math.sqrt(T) / 100; // per 1% vol change
  const thetaCall = (-S * eqT * pdf(d1) * sigma / (2 * Math.sqrt(T)) - r * K * erT * Nd2 + q * S * eqT * Nd1) / 365;
  const thetaPut  = (-S * eqT * pdf(d1) * sigma / (2 * Math.sqrt(T)) + r * K * erT * cdf(-d2) - q * S * eqT * cdf(-d1)) / 365;
  const rhoCall = K * T * erT * Nd2 / 100;
  const rhoPut  = -K * T * erT * cdf(-d2) / 100;
  return { call, put, dCall, dPut, gamma, vega, thetaCall, thetaPut, rhoCall, rhoPut };
}
export function BlackScholes({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [S, setS] = useState("100");
  const [K, setK] = useState("100");
  const [T, setT] = useState("0.5");
  const [r, setR] = useState("4.0");
  const [sigma, setSigma] = useState("25");
  const [q, setQ] = useState("0");
  const out = useMemo(() => bs(+S, +K, +T, +r/100, +sigma/100, +q/100), [S, K, T, r, sigma, q]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter the underlying price (S), strike (K), time to expiry in years (T), risk-free rate, volatility, and dividend yield. Call and put prices appear with all five Greeks for each.",
      formula: "Black-Scholes-Merton (with dividends): C = Se^(-qT) N(d1) − Ke^(-rT) N(d2). Vega is per 1% vol change; Theta is per day; Rho is per 1% rate change.",
      examples: "S = K = 100, T = 0.5 yr, r = 4%, σ = 25%: call ≈ 7.97, put ≈ 5.99 (no dividends).",
      faq: [
        { q: "Why use this vs. real market prices?", a: "For pricing illiquid options, computing fair value, and estimating sensitivity (Greeks). Real markets price implied vol; our σ is your assumption." },
        { q: "American options?", a: "Black-Scholes assumes European exercise. American options on non-dividend stocks are equivalent for calls; for puts and dividend-paying stocks, use a binomial tree." },
      ],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Spot S ({sym})</label><input className="input" value={S} onChange={(e) => setS(e.target.value)} /></div>
        <div><label className="label">Strike K ({sym})</label><input className="input" value={K} onChange={(e) => setK(e.target.value)} /></div>
        <div><label className="label">Time T (years)</label><input className="input" value={T} onChange={(e) => setT(e.target.value)} /></div>
        <div><label className="label">Risk-free r (%)</label><input className="input" value={r} onChange={(e) => setR(e.target.value)} /></div>
        <div><label className="label">Volatility σ (%)</label><input className="input" value={sigma} onChange={(e) => setSigma(e.target.value)} /></div>
        <div><label className="label">Dividend yield (%)</label><input className="input" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      {out && (
        <>
          <div className="mt-4 grid sm:grid-cols-2 gap-2">
            <Tile label="Call price" value={fmt(out.call)} big />
            <Tile label="Put price" value={fmt(out.put)} big />
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
            <Tile label="Δ call" value={out.dCall.toFixed(4)} />
            <Tile label="Δ put" value={out.dPut.toFixed(4)} />
            <Tile label="Γ" value={out.gamma.toFixed(5)} />
            <Tile label="Vega (per 1%)" value={out.vega.toFixed(4)} />
            <Tile label="Θ call (per day)" value={out.thetaCall.toFixed(4)} />
            <Tile label="Θ put (per day)" value={out.thetaPut.toFixed(4)} />
            <Tile label="ρ call (per 1%)" value={out.rhoCall.toFixed(4)} />
            <Tile label="ρ put (per 1%)" value={out.rhoPut.toFixed(4)} />
          </div>
        </>
      )}
    </ToolPage>
  );
}

// =====================================================================
// Sharpe Ratio
// =====================================================================
export function Sharpe({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [returns, setReturns] = useState("0.5, 1.2, -0.8, 0.3, 1.5, -0.4, 0.9, 0.2, 0.7, -0.1");
  const [rf, setRf] = useState("4.0");
  const [periodsPerYear, setPpy] = useState("252");
  const r = useMemo(() => {
    const arr = returns.split(/[, \n]+/).map(Number).filter(Number.isFinite);
    if (arr.length < 2) return null;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (arr.length - 1);
    const sd = Math.sqrt(variance);
    const rfPerPeriod = (parseFloat(rf) / 100) / parseFloat(periodsPerYear);
    const sharpePeriod = (mean / 100 - rfPerPeriod) / (sd / 100);
    const annualized = sharpePeriod * Math.sqrt(parseFloat(periodsPerYear));
    return { mean, sd, sharpePeriod, annualized, n: arr.length };
  }, [returns, rf, periodsPerYear]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste a return series (in percent — e.g. 0.5 for 0.5%). Set the risk-free rate (annual) and the periods per year (252 for daily, 12 for monthly, 4 for quarterly). Per-period and annualized Sharpe ratios are computed.",
      formula: "Sharpe = (Mean return − Rf per period) ÷ Std dev. Annualized = Sharpe × √(periods per year).",
      examples: "10 monthly returns averaging 0.4% with 0.8% std dev and 4% annual Rf: Sharpe ≈ 0.083/period, annualized ≈ 0.29.",
      faq: [
        { q: "Sharpe vs. Sortino?", a: "Sortino uses only downside deviation in the denominator. Sharpe penalizes upside volatility too; Sortino doesn't." },
        { q: "Is a higher Sharpe always better?", a: "Higher means more excess return per unit of risk. Caveats: assumes normal returns and consistent risk-free rate." },
      ],
    }}>
      <label className="label">Returns (%)</label>
      <textarea className="input min-h-[80px] font-mono text-xs" value={returns} onChange={(e) => setReturns(e.target.value)} />
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <div><label className="label">Risk-free rate (annual %)</label><input className="input" value={rf} onChange={(e) => setRf(e.target.value)} /></div>
        <div><label className="label">Periods per year</label>
          <select className="input" value={periodsPerYear} onChange={(e) => setPpy(e.target.value)}>
            <option value="252">252 (daily)</option><option value="52">52 (weekly)</option><option value="12">12 (monthly)</option><option value="4">4 (quarterly)</option><option value="1">1 (annual)</option>
          </select>
        </div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Tile label="Periods" value={String(r.n)} />
          <Tile label="Mean return" value={pct(r.mean, 3)} />
          <Tile label="Std dev" value={pct(r.sd, 3)} />
          <Tile label="Sharpe (period)" value={r.sharpePeriod.toFixed(4)} />
          <Tile label="Sharpe (annualized)" value={r.annualized.toFixed(4)} big />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// CAGR
// =====================================================================
export function Cagr({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [bv, setBv] = useState("1000");
  const [ev, setEv] = useState("1500");
  const [years, setYears] = useState("3");
  const r = useMemo(() => {
    const b = parseFloat(bv), e = parseFloat(ev), n = parseFloat(years);
    if (![b, e, n].every(Number.isFinite) || b <= 0 || n <= 0) return null;
    return Math.pow(e / b, 1 / n) - 1;
  }, [bv, ev, years]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter starting value, ending value, and number of years. CAGR (compound annual growth rate) is the constant rate at which the starting value would have grown to reach the ending value.",
      formula: "CAGR = (Ending ÷ Beginning)^(1/years) − 1.",
      examples: "1,000 → 1,500 over 3 years: CAGR ≈ 14.47%. Better metric than simple ROI for comparing investments of different durations.",
      faq: [
        { q: "What years count?", a: "Years between dates, including fractions. 18 months = 1.5." },
        { q: "CAGR vs annualized return?", a: "Same for two-point inputs. Differ when computed from a return series." },
      ],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Beginning value ({sym})</label><input className="input" value={bv} onChange={(e) => setBv(e.target.value)} /></div>
        <div><label className="label">Ending value ({sym})</label><input className="input" value={ev} onChange={(e) => setEv(e.target.value)} /></div>
        <div><label className="label">Years</label><input className="input" value={years} onChange={(e) => setYears(e.target.value)} /></div>
      </div>
      {r != null && (
        <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
          <div className="text-xs uppercase text-brand-700 dark:text-brand-300">CAGR</div>
          <div className="text-3xl font-bold tabular-nums">{pct(r * 100, 4)}</div>
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// Margin & Markup
// =====================================================================
export function MarginMarkup({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [cost, setCost] = useState("60");
  const [price, setPrice] = useState("100");
  const r = useMemo(() => {
    const c = parseFloat(cost), p = parseFloat(price);
    if (!Number.isFinite(c) || !Number.isFinite(p) || p <= 0 || c < 0) return null;
    const profit = p - c;
    const margin = (profit / p) * 100;     // % of revenue
    const markup = (profit / c) * 100;     // % of cost
    return { profit, margin, markup };
  }, [cost, price]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter cost and selling price. Profit, gross margin (% of revenue), and markup (% of cost) compute together — they're commonly confused.",
      formula: "Margin = (Price − Cost) ÷ Price × 100. Markup = (Price − Cost) ÷ Cost × 100. They never equal each other except at 0%.",
      examples: "Cost 60, price 100: profit 40, margin 40%, markup 66.67%. A 50% margin requires a 100% markup.",
      faq: [{ q: "Which should I report?", a: "Margin for retail/services analysis (denominator is what customers pay). Markup for product cost-plus pricing." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Cost ({sym})</label><input className="input" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
        <div><label className="label">Selling price ({sym})</label><input className="input" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="Profit" value={fmt(r.profit)} />
          <Tile label="Margin" value={pct(r.margin, 2)} big />
          <Tile label="Markup" value={pct(r.markup, 2)} big />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// Annuity (PV / FV; ordinary or due)
// =====================================================================
export function Annuity({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [pmt, setPmt] = useState("1000");
  const [rate, setRate] = useState("5");
  const [years, setYears] = useState("10");
  const [freq, setFreq] = useState("12");
  const [type, setType] = useState<"ordinary" | "due">("ordinary");
  const r = useMemo(() => {
    const PMT = parseFloat(pmt), i = parseFloat(rate) / 100 / parseFloat(freq), n = parseFloat(years) * parseFloat(freq);
    if (![PMT, i, n].every(Number.isFinite) || n <= 0) return null;
    const pv = i === 0 ? PMT * n : PMT * (1 - Math.pow(1 + i, -n)) / i;
    const fv = i === 0 ? PMT * n : PMT * (Math.pow(1 + i, n) - 1) / i;
    const factor = type === "due" ? (1 + i) : 1;
    return { pv: pv * factor, fv: fv * factor };
  }, [pmt, rate, years, freq, type]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter payment amount, annual interest rate, term in years, and how many payments per year. Choose ordinary (end of period, default) or annuity-due (start of period). PV and FV are computed.",
      formula: "PV (ordinary) = PMT × (1 − (1+i)^−n) ÷ i. FV (ordinary) = PMT × ((1+i)^n − 1) ÷ i. Annuity due: multiply by (1 + i).",
      examples: "1,000/month for 10 yr at 5% APR (ordinary): PV ≈ 94,281, FV ≈ 155,282.",
      faq: [{ q: "Ordinary vs. due?", a: "Mortgages, leases, most loans = ordinary (end of period). Rent and insurance premiums = annuity due (paid at start)." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Payment ({sym})</label><input className="input" value={pmt} onChange={(e) => setPmt(e.target.value)} /></div>
        <div><label className="label">Annual rate (%)</label><input className="input" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
        <div><label className="label">Years</label><input className="input" value={years} onChange={(e) => setYears(e.target.value)} /></div>
        <div><label className="label">Payments per year</label>
          <select className="input" value={freq} onChange={(e) => setFreq(e.target.value)}>
            <option value="12">12 (monthly)</option><option value="4">4 (quarterly)</option><option value="2">2 (semi-annual)</option><option value="1">1 (annual)</option>
          </select>
        </div>
        <div className="sm:col-span-2"><label className="label">Type</label>
          <div className="flex gap-2">
            {(["ordinary", "due"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${type === t ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{t === "ordinary" ? "Ordinary (end)" : "Due (start)"}</button>
            ))}
          </div>
        </div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="Present value" value={fmt(r.pv)} big />
          <Tile label="Future value" value={fmt(r.fv)} big />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// EAR ↔ APR
// =====================================================================
export function EarApr({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [direction, setDirection] = useState<"aprToEar" | "earToApr">("aprToEar");
  const [val, setVal] = useState("12");
  const [n, setN] = useState("12");
  const r = useMemo(() => {
    const v = parseFloat(val) / 100, periods = parseFloat(n);
    if (!Number.isFinite(v) || !Number.isFinite(periods) || periods <= 0) return null;
    if (direction === "aprToEar") {
      return Math.pow(1 + v / periods, periods) - 1;
    }
    return periods * (Math.pow(1 + v, 1 / periods) - 1);
  }, [direction, val, n]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a direction. APR → EAR shows the actual annual cost when interest compounds N times per year. EAR → APR shows the nominal rate that, with N compoundings, equals the given EAR.",
      formula: "EAR = (1 + APR/N)^N − 1. APR = N × ((1 + EAR)^(1/N) − 1).",
      examples: "12% APR compounded monthly → EAR = (1.01)^12 − 1 ≈ 12.6825%. Continuous compounding (N → ∞): EAR ≈ e^APR − 1.",
      faq: [{ q: "Why does it matter?", a: "Lenders quote APR; what you actually pay is EAR. Always compare EAR across products with different compounding." }],
    }}>
      <div className="flex gap-2 mb-3">
        {(["aprToEar", "earToApr"] as const).map((d) => (
          <button key={d} onClick={() => setDirection(d)} className={`min-tap rounded-xl px-3 py-2 text-sm ${direction === d ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{d === "aprToEar" ? "APR → EAR" : "EAR → APR"}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">{direction === "aprToEar" ? "APR" : "EAR"} (%)</label><input className="input" value={val} onChange={(e) => setVal(e.target.value)} /></div>
        <div><label className="label">Compoundings per year</label><input className="input" value={n} onChange={(e) => setN(e.target.value)} /></div>
      </div>
      {r != null && (
        <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
          <div className="text-xs uppercase text-brand-700 dark:text-brand-300">{direction === "aprToEar" ? "Effective Annual Rate" : "Annual Percentage Rate"}</div>
          <div className="text-3xl font-bold tabular-nums">{pct(r * 100, 6)}</div>
        </div>
      )}
    </ToolPage>
  );
}
