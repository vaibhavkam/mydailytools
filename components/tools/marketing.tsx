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
// CPM / CPC / CTR
// =====================================================================
export function CpmCpcCtr({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [imps, setImps] = useState("100000");
  const [clicks, setClicks] = useState("1500");
  const [cost, setCost] = useState("250");
  const r = useMemo(() => {
    const I = parseFloat(imps), C = parseFloat(clicks), $ = parseFloat(cost);
    if ([I, C, $].some((n) => !Number.isFinite(n) || n < 0) || I === 0) return null;
    return { ctr: (C / I) * 100, cpm: ($ / I) * 1000, cpc: C === 0 ? 0 : $ / C };
  }, [imps, clicks, cost]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter any three of impressions, clicks, and total spend. CTR, CPM, and CPC are computed.",
      formula: "CTR = clicks ÷ impressions × 100. CPM = (cost ÷ impressions) × 1000. CPC = cost ÷ clicks.",
      examples: "100k impressions, 1500 clicks, 250 spend: CTR 1.5%, CPM 2.50, CPC 0.17.",
      faq: [{ q: "Industry benchmarks?", a: "Search ads CTR averages ~3–5%; display ads ~0.4%. Wildly varies by industry." }],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Impressions</label><input className="input" value={imps} onChange={(e) => setImps(e.target.value)} /></div>
        <div><label className="label">Clicks</label><input className="input" value={clicks} onChange={(e) => setClicks(e.target.value)} /></div>
        <div><label className="label">Cost ({sym})</label><input className="input" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="CTR" value={pct(r.ctr, 2)} big />
          <Tile label="CPM" value={fmt(r.cpm)} big />
          <Tile label="CPC" value={fmt(r.cpc)} big />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// ROAS
// =====================================================================
export function Roas({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [revenue, setRevenue] = useState("5000");
  const [spend, setSpend] = useState("1000");
  const [conversions, setConversions] = useState("80");
  const r = useMemo(() => {
    const R = parseFloat(revenue), S = parseFloat(spend), C = parseFloat(conversions);
    if (![R, S, C].every(Number.isFinite) || S <= 0) return null;
    return { roas: R / S, cpa: C === 0 ? 0 : S / C, breakEven: 1 };
  }, [revenue, spend, conversions]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter ad-driven revenue, ad spend, and number of conversions. ROAS, CPA, and break-even ROAS compute together.",
      formula: "ROAS = revenue ÷ ad spend. CPA = ad spend ÷ conversions. Break-even ROAS = 1 (you spent what you earned).",
      examples: "5000 revenue, 1000 spend, 80 conversions → ROAS 5.0×, CPA 12.50.",
      faq: [{ q: "Is ROAS the same as ROI?", a: "No — ROAS uses revenue (gross), ROI uses profit (net of margins). A 4× ROAS at 25% margin is 1× ROI." }],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Revenue ({sym})</label><input className="input" value={revenue} onChange={(e) => setRevenue(e.target.value)} /></div>
        <div><label className="label">Ad spend ({sym})</label><input className="input" value={spend} onChange={(e) => setSpend(e.target.value)} /></div>
        <div><label className="label">Conversions</label><input className="input" value={conversions} onChange={(e) => setConversions(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="ROAS" value={`${r.roas.toFixed(2)}×`} big />
          <Tile label="CPA" value={fmt(r.cpa)} />
          <Tile label="Break-even ROAS" value="1.0×" />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// Conversion Rate
// =====================================================================
export function ConversionRate({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [visits, setVisits] = useState("10000");
  const [conv, setConv] = useState("250");
  const r = useMemo(() => {
    const V = parseFloat(visits), C = parseFloat(conv);
    if ([V, C].some((n) => !Number.isFinite(n) || n < 0) || V === 0) return null;
    const p = C / V;
    // Wilson 95% CI for proportions.
    const z = 1.96;
    const denom = 1 + (z * z) / V;
    const center = (p + (z * z) / (2 * V)) / denom;
    const halfWidth = (z * Math.sqrt((p * (1 - p) / V) + (z * z) / (4 * V * V))) / denom;
    return { rate: p * 100, lo: Math.max(0, (center - halfWidth) * 100), hi: Math.min(100, (center + halfWidth) * 100) };
  }, [visits, conv]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter total visitors and conversions. We return the conversion rate plus a 95% Wilson confidence interval — a more accurate range than the textbook normal approximation, especially for small samples or extreme rates.",
      formula: "Rate = conversions ÷ visitors. CI uses Wilson score interval at z = 1.96.",
      examples: "10000 visitors, 250 conversions → 2.50% rate (95% CI: 2.21% – 2.83%).",
      faq: [{ q: "Why not Normal approximation?", a: "Wilson is well-behaved for small n and rates near 0% or 100% where the normal CI can extend below 0 or above 1." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Visitors</label><input className="input" value={visits} onChange={(e) => setVisits(e.target.value)} /></div>
        <div><label className="label">Conversions</label><input className="input" value={conv} onChange={(e) => setConv(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="Conversion rate" value={pct(r.rate, 3)} big />
          <Tile label="95% CI" value={`${pct(r.lo, 3)} – ${pct(r.hi, 3)}`} />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// A/B Test Significance
// =====================================================================
function normalCdf(z: number) {
  // Abramowitz & Stegun
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const ax = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}
export function AbTest({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [Va, setVa] = useState("5000"); const [Ca, setCa] = useState("250");
  const [Vb, setVb] = useState("5000"); const [Cb, setCb] = useState("295");
  const r = useMemo(() => {
    const va = parseFloat(Va), vb = parseFloat(Vb), ca = parseFloat(Ca), cb = parseFloat(Cb);
    if (![va, vb, ca, cb].every((n) => Number.isFinite(n) && n >= 0) || va === 0 || vb === 0) return null;
    const pa = ca / va, pb = cb / vb;
    const pPool = (ca + cb) / (va + vb);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / va + 1 / vb));
    if (se === 0) return null;
    const z = (pb - pa) / se;
    const pTwoTail = 2 * (1 - normalCdf(Math.abs(z)));
    const lift = pa === 0 ? 0 : ((pb - pa) / pa) * 100;
    return { pa, pb, lift, z, p: pTwoTail, significant: pTwoTail < 0.05 };
  }, [Va, Ca, Vb, Cb]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter visitors and conversions for variants A (control) and B (treatment). The two-proportion z-test tells you whether the difference is statistically significant at p < 0.05.",
      formula: "z = (pB − pA) / √(p̂(1−p̂)(1/nA + 1/nB)) where p̂ is the pooled proportion. Two-sided p-value via the standard normal CDF.",
      examples: "A: 5000 visits, 250 conv (5.0%). B: 5000 visits, 295 conv (5.9%). Lift +18%, p ≈ 0.046 → significant.",
      faq: [{ q: "What about small samples?", a: "z-test assumes large enough samples (typically np ≥ 5 in both arms). For very small n, use Fisher's exact test." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">A: Visitors</label><input className="input" value={Va} onChange={(e) => setVa(e.target.value)} /></div>
        <div><label className="label">A: Conversions</label><input className="input" value={Ca} onChange={(e) => setCa(e.target.value)} /></div>
        <div><label className="label">B: Visitors</label><input className="input" value={Vb} onChange={(e) => setVb(e.target.value)} /></div>
        <div><label className="label">B: Conversions</label><input className="input" value={Cb} onChange={(e) => setCb(e.target.value)} /></div>
      </div>
      {r && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Tile label="A rate" value={pct(r.pa * 100, 3)} />
            <Tile label="B rate" value={pct(r.pb * 100, 3)} />
            <Tile label="Lift" value={(r.lift > 0 ? "+" : "") + pct(r.lift, 2)} />
            <Tile label="z-score" value={r.z.toFixed(3)} />
            <Tile label="p-value" value={r.p.toFixed(4)} />
            <Tile label="Significant?" value={r.significant ? "Yes (p<0.05)" : "No"} big />
          </div>
        </>
      )}
    </ToolPage>
  );
}

// =====================================================================
// LTV / CAC
// =====================================================================
export function LtvCac({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [arpu, setArpu] = useState("50");
  const [margin, setMargin] = useState("70");
  const [churn, setChurn] = useState("3");
  const [cac, setCac] = useState("200");
  const r = useMemo(() => {
    const a = parseFloat(arpu), m = parseFloat(margin) / 100, c = parseFloat(churn) / 100, k = parseFloat(cac);
    if ([a, m, c, k].some((n) => !Number.isFinite(n) || n < 0) || c <= 0 || k === 0) return null;
    const ltv = (a * m) / c;
    return { ltv, ratio: ltv / k, paybackMonths: k / (a * m) };
  }, [arpu, margin, churn, cac]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter monthly ARPU, gross margin %, monthly churn rate %, and CAC. LTV, LTV/CAC ratio, and CAC payback period are computed.",
      formula: "LTV = (ARPU × margin) ÷ churn rate. LTV/CAC ratio: target ≥ 3. Payback (months) = CAC ÷ (ARPU × margin).",
      examples: "50 ARPU, 70% margin, 3% monthly churn, 200 CAC → LTV ≈ 1,167, ratio 5.83, payback 5.7 months.",
      faq: [{ q: "Healthy benchmarks?", a: "SaaS heuristics: LTV/CAC ≥ 3, payback < 12 months. Aggressive growth allows higher CAC short-term." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Monthly ARPU ({sym})</label><input className="input" value={arpu} onChange={(e) => setArpu(e.target.value)} /></div>
        <div><label className="label">Gross margin (%)</label><input className="input" value={margin} onChange={(e) => setMargin(e.target.value)} /></div>
        <div><label className="label">Monthly churn (%)</label><input className="input" value={churn} onChange={(e) => setChurn(e.target.value)} /></div>
        <div><label className="label">CAC ({sym})</label><input className="input" value={cac} onChange={(e) => setCac(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="LTV" value={fmt(r.ltv)} big />
          <Tile label="LTV / CAC" value={`${r.ratio.toFixed(2)}×`} big />
          <Tile label="Payback (mo)" value={r.paybackMonths.toFixed(1)} />
        </div>
      )}
    </ToolPage>
  );
}

// =====================================================================
// UTM Builder
// =====================================================================
export function UtmBuilder({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [base, setBase] = useState("https://example.com/landing");
  const [src, setSrc] = useState("newsletter");
  const [med, setMed] = useState("email");
  const [camp, setCamp] = useState("spring-sale");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const out = useMemo(() => {
    try {
      const u = new URL(base);
      const set = (k: string, v: string) => v && u.searchParams.set(k, v);
      set("utm_source", src); set("utm_medium", med); set("utm_campaign", camp);
      set("utm_term", term); set("utm_content", content);
      return u.toString();
    } catch { return ""; }
  }, [base, src, med, camp, term, content]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste your destination URL and fill in source/medium/campaign (required for clean attribution). Term and content are optional.",
      formula: "Standard Google Analytics UTM parameters appended as query string.",
      examples: 'https://example.com/landing?utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale',
      faq: [{ q: "Should I lowercase everything?", a: "Yes — UTMs are case-sensitive in most analytics platforms, so 'Email' and 'email' show as separate sources." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="label">Destination URL</label><input className="input font-mono" value={base} onChange={(e) => setBase(e.target.value)} /></div>
        <div><label className="label">Source (utm_source)</label><input className="input" value={src} onChange={(e) => setSrc(e.target.value)} /></div>
        <div><label className="label">Medium (utm_medium)</label><input className="input" value={med} onChange={(e) => setMed(e.target.value)} /></div>
        <div><label className="label">Campaign (utm_campaign)</label><input className="input" value={camp} onChange={(e) => setCamp(e.target.value)} /></div>
        <div><label className="label">Term (utm_term, optional)</label><input className="input" value={term} onChange={(e) => setTerm(e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Content (utm_content, optional)</label><input className="input" value={content} onChange={(e) => setContent(e.target.value)} /></div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <code className="font-mono text-xs flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-[rgb(var(--border))] px-3 py-2 break-all">{out || "Invalid URL"}</code>
        <button onClick={() => out && navigator.clipboard.writeText(out)} className="btn-ghost text-xs">Copy</button>
      </div>
    </ToolPage>
  );
}

// =====================================================================
// SERP Snippet Preview
// =====================================================================
export function SerpPreview({ tool }: Props) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [title, setTitle] = useState("MyDailyTool — Free Online Calculators & Developer Utilities");
  const [url, setUrl] = useState("https://mydailytool.com/tools/percentage-calculator/");
  const [desc, setDesc] = useState("Calculate percentages, percent change, and percent of a number instantly. 100+ free tools, runs entirely in your browser.");
  // Google truncates titles around 580 px wide and meta descriptions around 920 px;
  // approximate with character counts that match real-world cutoffs.
  const titleOver = title.length > 60;
  const descOver = desc.length > 160;
  return (
    <ToolPage tool={tool} content={{
      howTo: "Type your title, URL, and meta description; the preview mirrors how Google would render the result. Watch for the warnings when you exceed approximate length limits.",
      formula: "Soft limits: title ~60 chars, meta description ~160 chars. Google may rewrite either if it's not a good match for the query.",
      examples: "A 70-character title is likely to get truncated with an ellipsis on the SERP.",
      faq: [{ q: "Why does Google rewrite my title?", a: "If your <title> doesn't match query intent, Google may pull text from H1 or alt content. Better matches reduce rewrites." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="label">Title <span className={titleOver ? "text-amber-600" : "text-[rgb(var(--fg-muted))]"}>({title.length}/60)</span></label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">URL</label><input className="input font-mono" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Meta description <span className={descOver ? "text-amber-600" : "text-[rgb(var(--fg-muted))]"}>({desc.length}/160)</span></label><textarea className="input min-h-[80px]" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
      </div>
      <div className="mt-4 rounded-2xl border border-[rgb(var(--border))] p-5 max-w-2xl bg-white dark:bg-slate-900">
        <div className="text-xs text-emerald-700 dark:text-emerald-400 truncate">{url}</div>
        <div className="mt-1 text-xl text-[#1a0dab] dark:text-blue-400 hover:underline cursor-pointer truncate" title={title}>{titleOver ? title.slice(0, 57) + "…" : title}</div>
        <div className="mt-1 text-sm text-[#4d5156] dark:text-slate-300 line-clamp-2">{descOver ? desc.slice(0, 157) + "…" : desc}</div>
      </div>
    </ToolPage>
  );
}
