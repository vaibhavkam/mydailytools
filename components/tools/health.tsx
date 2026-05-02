"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

function Tile({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className={`rounded-xl border border-[rgb(var(--border))] p-3 text-center ${big ? "bg-brand-50 dark:bg-brand-950/40 border-brand-300/60" : ""}`}>
      <div className="text-xs text-[rgb(var(--fg-muted))]">{label}</div>
      <div className={`${big ? "text-2xl" : "text-lg"} font-semibold tabular-nums`}>{value}</div>
    </div>
  );
}

const DISCLAIMER = (
  <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
    Educational tool. Not a substitute for clinical judgment, professional diagnosis, or treatment. Always verify with current guidelines.
  </div>
);

// =====================================================================
// BSA — Mosteller and DuBois
// =====================================================================
export function Bsa({ tool }: Props) {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [h, setH] = useState("170");
  const [w, setW] = useState("70");
  const r = useMemo(() => {
    const heightCm = unit === "metric" ? parseFloat(h) : parseFloat(h) * 2.54;
    const weightKg = unit === "metric" ? parseFloat(w) : parseFloat(w) * 0.453592;
    if (![heightCm, weightKg].every(Number.isFinite) || heightCm <= 0 || weightKg <= 0) return null;
    const mosteller = Math.sqrt((heightCm * weightKg) / 3600);
    const dubois = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
    const haycock = 0.024265 * Math.pow(heightCm, 0.3964) * Math.pow(weightKg, 0.5378);
    return { mosteller, dubois, haycock };
  }, [unit, h, w]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick units, enter height and weight. Three common BSA formulas compute side-by-side. Mosteller is the most widely used clinically.",
      formula: "Mosteller: BSA (m²) = √((height_cm × weight_kg) ÷ 3600). DuBois: 0.007184 × ht^0.725 × wt^0.425. Haycock: 0.024265 × ht^0.3964 × wt^0.5378.",
      examples: "170 cm, 70 kg → Mosteller ≈ 1.81 m², DuBois ≈ 1.81 m².",
      faq: [
        { q: "Which formula should I use?", a: "Mosteller is favored for chemotherapy dosing per most guidelines. DuBois is older but widely accepted." },
        { q: "Children?", a: "Haycock is generally preferred under age 5; otherwise Mosteller is fine." },
      ],
    }}>
      <div className="flex gap-2 mb-3">
        {(["metric", "imperial"] as const).map((u) => (<button key={u} onClick={() => setUnit(u)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${unit === u ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{u === "metric" ? "Metric (cm/kg)" : "Imperial (in/lbs)"}</button>))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Height ({unit === "metric" ? "cm" : "in"})</label><input className="input" value={h} onChange={(e) => setH(e.target.value)} /></div>
        <div><label className="label">Weight ({unit === "metric" ? "kg" : "lbs"})</label><input className="input" value={w} onChange={(e) => setW(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="Mosteller" value={`${r.mosteller.toFixed(2)} m²`} big />
          <Tile label="DuBois" value={`${r.dubois.toFixed(2)} m²`} />
          <Tile label="Haycock" value={`${r.haycock.toFixed(2)} m²`} />
        </div>
      )}
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// eGFR — CKD-EPI 2021 (race-free)
// =====================================================================
export function Egfr({ tool }: Props) {
  const [scr, setScr] = useState("1.0");
  const [age, setAge] = useState("55");
  const [sex, setSex] = useState<"male" | "female">("male");
  const r = useMemo(() => {
    const Scr = parseFloat(scr), A = parseFloat(age);
    if (!Number.isFinite(Scr) || !Number.isFinite(A) || Scr <= 0 || A <= 0) return null;
    // CKD-EPI 2021: 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^age × 1.012 [if female]
    const kappa = sex === "female" ? 0.7 : 0.9;
    const alpha = sex === "female" ? -0.241 : -0.302;
    const sexFactor = sex === "female" ? 1.012 : 1.0;
    const ratio = Scr / kappa;
    const egfr = 142 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.200) * Math.pow(0.9938, A) * sexFactor;
    return egfr;
  }, [scr, age, sex]);
  const stage = r == null ? "" : r >= 90 ? "G1 (normal)" : r >= 60 ? "G2 (mildly reduced)" : r >= 45 ? "G3a" : r >= 30 ? "G3b" : r >= 15 ? "G4" : "G5 (kidney failure)";
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter serum creatinine (mg/dL), age (years), and sex. The CKD-EPI 2021 race-free formula returns eGFR in mL/min/1.73 m².",
      formula: "CKD-EPI 2021: 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.200 × 0.9938^age × (1.012 if female). κ = 0.7 (female) or 0.9 (male); α = −0.241 / −0.302.",
      examples: "Scr 1.0, age 55, male → eGFR ≈ 87 mL/min/1.73 m² (G2).",
      faq: [
        { q: "Why race-free?", a: "The 2021 update by NKF/ASN removed the race coefficient to address health-equity concerns." },
        { q: "Children?", a: "Use the bedside Schwartz formula for pediatric patients, not CKD-EPI." },
      ],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Serum creatinine (mg/dL)</label><input className="input" value={scr} onChange={(e) => setScr(e.target.value)} /></div>
        <div><label className="label">Age (years)</label><input className="input" value={age} onChange={(e) => setAge(e.target.value)} /></div>
        <div><label className="label">Sex</label>
          <select className="input" value={sex} onChange={(e) => setSex(e.target.value as any)}>
            <option value="male">Male</option><option value="female">Female</option>
          </select>
        </div>
      </div>
      {r != null && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="eGFR (mL/min/1.73 m²)" value={r.toFixed(1)} big />
          <Tile label="CKD stage" value={stage} />
        </div>
      )}
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// Creatinine Clearance — Cockcroft-Gault
// =====================================================================
export function CreatinineClearance({ tool }: Props) {
  const [age, setAge] = useState("55");
  const [w, setW] = useState("70");        // kg
  const [scr, setScr] = useState("1.0");
  const [sex, setSex] = useState<"male" | "female">("male");
  const r = useMemo(() => {
    const A = parseFloat(age), W = parseFloat(w), S = parseFloat(scr);
    if (![A, W, S].every(Number.isFinite) || S <= 0) return null;
    const factor = sex === "female" ? 0.85 : 1;
    return ((140 - A) * W * factor) / (72 * S);
  }, [age, w, scr, sex]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter age, weight in kg, serum creatinine in mg/dL, and sex. Cockcroft-Gault estimates creatinine clearance in mL/min.",
      formula: "CrCl = ((140 − age) × weight × (0.85 if female)) ÷ (72 × Scr).",
      examples: "Age 55, 70 kg, male, Scr 1.0 → CrCl ≈ 82.6 mL/min.",
      faq: [
        { q: "When to use Cockcroft-Gault vs. eGFR?", a: "Many drug-dosing references (especially nephrotoxic drugs) still cite Cockcroft-Gault. Use the formula your reference specifies." },
        { q: "Obese patients?", a: "Consider adjusted body weight (e.g., IBW + 0.4 × (TBW − IBW)) for more accurate estimates in obesity." },
      ],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Age (years)</label><input className="input" value={age} onChange={(e) => setAge(e.target.value)} /></div>
        <div><label className="label">Weight (kg)</label><input className="input" value={w} onChange={(e) => setW(e.target.value)} /></div>
        <div><label className="label">Serum creatinine (mg/dL)</label><input className="input" value={scr} onChange={(e) => setScr(e.target.value)} /></div>
        <div><label className="label">Sex</label><select className="input" value={sex} onChange={(e) => setSex(e.target.value as any)}><option value="male">Male</option><option value="female">Female</option></select></div>
      </div>
      {r != null && (<div className="mt-4 grid grid-cols-1 gap-2"><Tile label="CrCl (mL/min)" value={r.toFixed(1)} big /></div>)}
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// MELD score
// =====================================================================
export function Meld({ tool }: Props) {
  const [bili, setBili] = useState("1.2");
  const [inr, setInr] = useState("1.2");
  const [scr, setScr] = useState("1.0");
  const [dialysis, setDialysis] = useState(false);
  const r = useMemo(() => {
    const b = Math.max(1, parseFloat(bili)); // floor 1
    const i = Math.max(1, parseFloat(inr));
    let s = Math.max(1, parseFloat(scr));
    if (dialysis) s = 4.0;
    s = Math.min(s, 4.0); // cap at 4
    if (![b, i, s].every(Number.isFinite)) return null;
    const meld = 9.57 * Math.log(s) + 3.78 * Math.log(b) + 11.20 * Math.log(i) + 6.43;
    return Math.round(Math.max(6, Math.min(40, meld)));
  }, [bili, inr, scr, dialysis]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter bilirubin (mg/dL), INR, and serum creatinine. Tick dialysis if the patient had ≥2 sessions in the last week (creatinine forced to 4.0).",
      formula: "Original MELD = 9.57 × ln(Cr) + 3.78 × ln(Bili) + 11.20 × ln(INR) + 6.43. Values floored at 1, Cr capped at 4. Final score bounded 6–40.",
      examples: "Bili 1.2, INR 1.2, Cr 1.0 → MELD ≈ 6 (low risk).",
      faq: [{ q: "MELD vs MELD-Na?", a: "MELD-Na adds sodium and is used for transplant prioritization since 2016. This page returns the classic MELD." }],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Bilirubin (mg/dL)</label><input className="input" value={bili} onChange={(e) => setBili(e.target.value)} /></div>
        <div><label className="label">INR</label><input className="input" value={inr} onChange={(e) => setInr(e.target.value)} /></div>
        <div><label className="label">Creatinine (mg/dL)</label><input className="input" value={scr} onChange={(e) => setScr(e.target.value)} /></div>
      </div>
      <label className="flex items-center gap-2 mt-3 text-sm"><input type="checkbox" checked={dialysis} onChange={(e) => setDialysis(e.target.checked)} className="accent-brand-600" /> ≥2 dialysis sessions in past 7 days</label>
      {r != null && (<div className="mt-4 grid grid-cols-1 gap-2"><Tile label="MELD score" value={String(r)} big /></div>)}
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// CHA₂DS₂-VASc
// =====================================================================
export function Chads({ tool }: Props) {
  const [v, setV] = useState({ chf: false, htn: false, age75: false, dm: false, stroke: false, vasc: false, age65: false, female: false });
  const score = (v.chf ? 1 : 0) + (v.htn ? 1 : 0) + (v.age75 ? 2 : 0) + (v.dm ? 1 : 0) + (v.stroke ? 2 : 0) + (v.vasc ? 1 : 0) + (v.age65 && !v.age75 ? 1 : 0) + (v.female ? 1 : 0);
  const items: [keyof typeof v, string, number][] = [
    ["chf", "Congestive heart failure", 1],
    ["htn", "Hypertension", 1],
    ["age75", "Age ≥ 75", 2],
    ["dm", "Diabetes mellitus", 1],
    ["stroke", "Stroke / TIA / thromboembolism", 2],
    ["vasc", "Vascular disease (MI, PAD, aortic plaque)", 1],
    ["age65", "Age 65–74 (ignored if ≥75)", 1],
    ["female", "Sex: female", 1],
  ];
  return (
    <ToolPage tool={tool} content={{
      howTo: "Tick each criterion that applies. The score predicts annual stroke risk in non-valvular atrial fibrillation.",
      formula: "Sum of points (max 9). Age ≥75 contributes 2 and overrides 65–74. Used to guide anticoagulation decisions.",
      examples: "A 70-year-old woman with HTN and diabetes: 1 + 1 + 1 + 1 = score of 4 (~4% annual stroke risk).",
      faq: [{ q: "Treatment threshold?", a: "Most guidelines recommend anticoagulation for ≥2 in men or ≥3 in women. Verify with current local guidance." }],
    }}>
      <ul className="space-y-1.5">
        {items.map(([k, label, pts]) => (
          <li key={k}>
            <label className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] px-3 py-2 cursor-pointer min-tap">
              <input type="checkbox" checked={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.checked })} className="accent-brand-600" />
              <span className="flex-1 text-sm">{label}</span>
              <span className="text-xs text-[rgb(var(--fg-muted))]">+{pts}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-1 gap-2"><Tile label="CHA₂DS₂-VASc score" value={String(score)} big /></div>
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// Wells PE Score
// =====================================================================
export function WellsPe({ tool }: Props) {
  const [v, setV] = useState({ symptoms: false, alt: false, hr100: false, immob: false, dvt: false, hemo: false, malig: false });
  const score =
    (v.symptoms ? 3 : 0) + (v.alt ? 3 : 0) + (v.hr100 ? 1.5 : 0) +
    (v.immob ? 1.5 : 0) + (v.dvt ? 1.5 : 0) + (v.hemo ? 1 : 0) + (v.malig ? 1 : 0);
  const risk = score > 6 ? "High" : score >= 2 ? "Moderate" : "Low";
  const items: [keyof typeof v, string, number][] = [
    ["symptoms", "Clinical signs of DVT", 3],
    ["alt", "PE is most likely diagnosis", 3],
    ["hr100", "Heart rate > 100", 1.5],
    ["immob", "Immobilization ≥3 days or surgery in past 4 weeks", 1.5],
    ["dvt", "Previous DVT or PE", 1.5],
    ["hemo", "Hemoptysis", 1],
    ["malig", "Active malignancy", 1],
  ];
  return (
    <ToolPage tool={tool} content={{
      howTo: "Tick each finding present. Original Wells: ≤4 unlikely; >4 likely. Three-tier: <2 low / 2-6 moderate / >6 high.",
      formula: "Weighted sum of clinical features. Used with D-dimer to rule out PE in low-probability patients.",
      examples: "HR > 100 + previous DVT + hemoptysis: 1.5 + 1.5 + 1 = 4 (moderate).",
      faq: [{ q: "What about PERC?", a: "PERC is a separate rule for ruling out PE in low-probability patients without further testing — use it after Wells when probability is low." }],
    }}>
      <ul className="space-y-1.5">
        {items.map(([k, label, pts]) => (
          <li key={k}>
            <label className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] px-3 py-2 cursor-pointer min-tap">
              <input type="checkbox" checked={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.checked })} className="accent-brand-600" />
              <span className="flex-1 text-sm">{label}</span>
              <span className="text-xs text-[rgb(var(--fg-muted))]">+{pts}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        <Tile label="Wells score" value={score.toString()} big />
        <Tile label="Risk tier" value={risk} />
      </div>
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// Anion Gap
// =====================================================================
export function AnionGap({ tool }: Props) {
  const [na, setNa] = useState("140");
  const [cl, setCl] = useState("100");
  const [hco3, setHco3] = useState("24");
  const [k, setK] = useState("");
  const [alb, setAlb] = useState("");
  const r = useMemo(() => {
    const Na = parseFloat(na), Cl = parseFloat(cl), HCO3 = parseFloat(hco3);
    if (![Na, Cl, HCO3].every(Number.isFinite)) return null;
    const K = parseFloat(k);
    const includeK = Number.isFinite(K);
    const ag = (Na + (includeK ? K : 0)) - (Cl + HCO3);
    const Alb = parseFloat(alb);
    const corrected = Number.isFinite(Alb) ? ag + 2.5 * (4 - Alb) : null;
    return { ag, corrected };
  }, [na, cl, hco3, k, alb]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter Na, Cl, HCO3 (mEq/L). K and albumin are optional. Albumin entry triggers a corrected anion gap.",
      formula: "AG = (Na + K) − (Cl + HCO3). K is conventionally omitted. Albumin-corrected AG = AG + 2.5 × (4 − albumin).",
      examples: "Na 140, Cl 100, HCO3 24 → AG = 16. Normal range typically 8–12 (without K).",
      faq: [{ q: "Why correct for albumin?", a: "Albumin contributes most of the unmeasured anions; hypoalbuminemia falsely lowers the gap." }],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Na (mEq/L)</label><input className="input" value={na} onChange={(e) => setNa(e.target.value)} /></div>
        <div><label className="label">Cl (mEq/L)</label><input className="input" value={cl} onChange={(e) => setCl(e.target.value)} /></div>
        <div><label className="label">HCO3 (mEq/L)</label><input className="input" value={hco3} onChange={(e) => setHco3(e.target.value)} /></div>
        <div><label className="label">K (optional)</label><input className="input" value={k} onChange={(e) => setK(e.target.value)} /></div>
        <div><label className="label">Albumin g/dL (optional)</label><input className="input" value={alb} onChange={(e) => setAlb(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="Anion gap" value={r.ag.toFixed(1)} big />
          {r.corrected != null && <Tile label="Corrected AG" value={r.corrected.toFixed(1)} />}
        </div>
      )}
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// Pediatric Dosing
// =====================================================================
export function PediatricDose({ tool }: Props) {
  const [w, setW] = useState("12");
  const [dose, setDose] = useState("10");
  const [frequency, setFrequency] = useState("3");
  const [maxPerDose, setMaxPerDose] = useState("");
  const r = useMemo(() => {
    const W = parseFloat(w), D = parseFloat(dose), F = parseFloat(frequency);
    if ([W, D, F].some((x) => !Number.isFinite(x) || x <= 0)) return null;
    let perDose = W * D;
    const cap = parseFloat(maxPerDose);
    const capped = Number.isFinite(cap) && perDose > cap;
    if (capped) perDose = cap;
    return { perDose, daily: perDose * F, capped };
  }, [w, dose, frequency, maxPerDose]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter the child's weight, prescribed mg/kg dose, and number of doses per day. Optional max-per-dose protects against unsafe totals.",
      formula: "Per-dose = weight × mg/kg. Daily total = per-dose × frequency. If a max is set, per-dose is capped.",
      examples: "12 kg child, amoxicillin 10 mg/kg three times daily → 120 mg per dose, 360 mg/day.",
      faq: [{ q: "Round to nearest convenient unit?", a: "We don't round — apply your own rounding rules based on available concentrations." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Weight (kg)</label><input className="input" value={w} onChange={(e) => setW(e.target.value)} /></div>
        <div><label className="label">Dose (mg/kg)</label><input className="input" value={dose} onChange={(e) => setDose(e.target.value)} /></div>
        <div><label className="label">Doses per day</label><input className="input" value={frequency} onChange={(e) => setFrequency(e.target.value)} /></div>
        <div><label className="label">Max per dose (mg, optional)</label><input className="input" value={maxPerDose} onChange={(e) => setMaxPerDose(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="Per dose (mg)" value={r.perDose.toFixed(1)} big />
          <Tile label="Daily total (mg)" value={r.daily.toFixed(1)} />
          {r.capped && <div className="sm:col-span-2 text-xs text-amber-700 dark:text-amber-300">Max-per-dose cap applied.</div>}
        </div>
      )}
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// IV Drip Rate
// =====================================================================
export function IvDrip({ tool }: Props) {
  const [vol, setVol] = useState("1000");
  const [hours, setHours] = useState("8");
  const [factor, setFactor] = useState("20");
  const r = useMemo(() => {
    const V = parseFloat(vol), H = parseFloat(hours), F = parseFloat(factor);
    if ([V, H, F].some((x) => !Number.isFinite(x) || x <= 0)) return null;
    const mlPerHr = V / H;
    const gtts = (V * F) / (H * 60);
    return { mlPerHr, gtts };
  }, [vol, hours, factor]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter volume to infuse (mL), duration (hours), and the drip factor (gtts/mL — printed on the IV tubing).",
      formula: "mL/hr = volume ÷ hours. gtts/min = (volume × drip factor) ÷ (hours × 60).",
      examples: "1 L over 8 hr with 20 gtts/mL tubing: 125 mL/hr, ~42 gtts/min.",
      faq: [{ q: "What's a typical drip factor?", a: "Macro tubing is usually 10, 15, or 20 gtts/mL. Micro (pediatric) tubing is 60 gtts/mL." }],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Volume (mL)</label><input className="input" value={vol} onChange={(e) => setVol(e.target.value)} /></div>
        <div><label className="label">Hours</label><input className="input" value={hours} onChange={(e) => setHours(e.target.value)} /></div>
        <div><label className="label">Drip factor (gtts/mL)</label><input className="input" value={factor} onChange={(e) => setFactor(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="mL / hour" value={r.mlPerHr.toFixed(1)} big />
          <Tile label="gtts / min" value={Math.round(r.gtts).toString()} big />
        </div>
      )}
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// Pregnancy Due Date — Naegele's Rule
// =====================================================================
export function DueDate({ tool }: Props) {
  const [lmp, setLmp] = useState("");
  const r = useMemo(() => {
    if (!lmp) return null;
    const d = new Date(lmp);
    if (Number.isNaN(d.getTime())) return null;
    const due = new Date(d); due.setDate(due.getDate() + 280);
    const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const wks = Math.floor(days / 7);
    const wkDays = days - wks * 7;
    return { due: due.toISOString().slice(0, 10), gaWeeks: wks, gaDays: wkDays };
  }, [lmp]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick the first day of the last menstrual period (LMP). The estimated due date and current gestational age are computed.",
      formula: "Naegele's rule: EDD = LMP + 280 days (40 weeks). Gestational age = days since LMP, expressed in weeks + days.",
      examples: "LMP 2026-01-01 → EDD 2026-10-08.",
      faq: [{ q: "Is this accurate?", a: "Naegele's rule assumes a 28-day cycle and ovulation on day 14. First-trimester ultrasound is more accurate." }],
    }}>
      <label className="label">First day of last menstrual period</label>
      <input type="date" className="input" value={lmp} onChange={(e) => setLmp(e.target.value)} />
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <Tile label="Estimated due date" value={r.due} big />
          <Tile label="Current GA" value={`${r.gaWeeks}w ${r.gaDays}d`} />
        </div>
      )}
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// Heart Rate Zones — Karvonen
// =====================================================================
export function HrZones({ tool }: Props) {
  const [age, setAge] = useState("35");
  const [rhr, setRhr] = useState("65");
  const r = useMemo(() => {
    const A = parseFloat(age), R = parseFloat(rhr);
    if (![A, R].every(Number.isFinite)) return null;
    const max = 220 - A;
    const reserve = max - R;
    const zone = (lo: number, hi: number) => `${Math.round(R + reserve * lo)}–${Math.round(R + reserve * hi)} bpm`;
    return {
      max,
      Z1: zone(0.50, 0.60), Z2: zone(0.60, 0.70), Z3: zone(0.70, 0.80),
      Z4: zone(0.80, 0.90), Z5: zone(0.90, 1.00),
    };
  }, [age, rhr]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter age and resting heart rate. The Karvonen formula returns the five training zones based on heart-rate reserve.",
      formula: "HRmax = 220 − age. HRR = HRmax − HRrest. Zone HR = HRrest + (intensity × HRR).",
      examples: "Age 35, RHR 65: Z2 (aerobic base) ≈ 122–134 bpm. Z4 (threshold) ≈ 145–158 bpm.",
      faq: [{ q: "Is 220 − age accurate?", a: "It's a population estimate; individual HRmax varies by ±10 bpm. A maximal exercise test gives the truest number." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Age</label><input className="input" value={age} onChange={(e) => setAge(e.target.value)} /></div>
        <div><label className="label">Resting HR</label><input className="input" value={rhr} onChange={(e) => setRhr(e.target.value)} /></div>
      </div>
      {r && (
        <>
          <div className="mt-3"><Tile label="HRmax" value={`${r.max} bpm`} /></div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {[["Z1 — Recovery (50–60%)", r.Z1], ["Z2 — Aerobic base (60–70%)", r.Z2], ["Z3 — Tempo (70–80%)", r.Z3], ["Z4 — Threshold (80–90%)", r.Z4], ["Z5 — VO₂ max (90–100%)", r.Z5]].map(([l, v]) => (
              <li key={l} className="rounded-xl border border-[rgb(var(--border))] px-3 py-2 flex justify-between"><span>{l}</span><span className="font-mono">{v}</span></li>
            ))}
          </ul>
        </>
      )}
      {DISCLAIMER}
    </ToolPage>
  );
}

// =====================================================================
// Ideal Body Weight
// =====================================================================
export function IdealWeight({ tool }: Props) {
  const [h, setH] = useState("170");
  const [sex, setSex] = useState<"male" | "female">("male");
  const r = useMemo(() => {
    const cm = parseFloat(h);
    if (!Number.isFinite(cm)) return null;
    const inches = cm / 2.54;
    const over60 = Math.max(0, inches - 60);
    const devine = (sex === "male" ? 50 : 45.5) + 2.3 * over60;
    const robinson = (sex === "male" ? 52 : 49) + 1.9 * over60;
    const hamwi = (sex === "male" ? 48 : 45.5) + 2.7 * over60;
    return { devine, robinson, hamwi };
  }, [h, sex]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter height in cm and select sex. Three popular IBW formulas compute side-by-side.",
      formula: "Devine: 50 (♂) / 45.5 (♀) kg + 2.3 kg per inch over 5 ft. Robinson: 52/49 + 1.9. Hamwi: 48/45.5 + 2.7.",
      examples: "Male, 170 cm (5'7\"): Devine ≈ 66.1 kg, Robinson ≈ 65.3 kg, Hamwi ≈ 66.9 kg.",
      faq: [{ q: "Below 5 ft?", a: "Devine is undefined below 5 ft. Some references suggest subtracting 2.3 kg/inch below 5 ft, but it's an extrapolation — use clinical judgment." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Height (cm)</label><input className="input" value={h} onChange={(e) => setH(e.target.value)} /></div>
        <div><label className="label">Sex</label><select className="input" value={sex} onChange={(e) => setSex(e.target.value as any)}><option value="male">Male</option><option value="female">Female</option></select></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="Devine (kg)" value={r.devine.toFixed(1)} big />
          <Tile label="Robinson (kg)" value={r.robinson.toFixed(1)} />
          <Tile label="Hamwi (kg)" value={r.hamwi.toFixed(1)} />
        </div>
      )}
      {DISCLAIMER}
    </ToolPage>
  );
}
