"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Unit = "metric" | "imperial";

export default function BmiCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [unit, setUnit] = useState<Unit>("metric");
  // metric inputs
  const [cm, setCm] = useState("170");
  const [kg, setKg] = useState("65");
  // imperial inputs
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("7");
  const [lbs, setLbs] = useState("145");

  const bmi = useMemo(() => {
    if (unit === "metric") {
      const h = parseFloat(cm) / 100;
      const w = parseFloat(kg);
      if (!h || !w) return null;
      return w / (h * h);
    } else {
      const totalIn = parseFloat(ft) * 12 + parseFloat(inch);
      const w = parseFloat(lbs);
      if (!totalIn || !w) return null;
      return (w / (totalIn * totalIn)) * 703;
    }
  }, [unit, cm, kg, ft, inch, lbs]);

  const cat = bmi == null
    ? null
    : bmi < 18.5 ? { label: "Underweight", color: "text-sky-600" }
    : bmi < 25  ? { label: "Healthy weight", color: "text-emerald-600" }
    : bmi < 30  ? { label: "Overweight", color: "text-amber-600" }
    :             { label: "Obese", color: "text-red-600" };

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Pick metric or imperial, enter your height and weight, and the BMI updates instantly along with the WHO category. BMI is a screening tool — it doesn't account for muscle mass, age, or body composition.",
        formula: "Metric: BMI = weight (kg) ÷ height (m)². Imperial: BMI = (weight (lbs) ÷ height (in)²) × 703. WHO categories: < 18.5 underweight, 18.5–24.9 healthy, 25–29.9 overweight, ≥ 30 obese.",
        examples: "A 170 cm person weighing 65 kg has a BMI of 22.5 (healthy). A 5'7\" person at 145 lbs is BMI 22.7.",
        faq: [
          { q: "Is BMI accurate for athletes?", a: "Not very. Muscular people often score 'overweight' despite low body fat. Use BMI as a quick check, not a diagnosis." },
          { q: "What about children?", a: "Children use age- and sex-specific BMI percentiles, not the adult cutoffs above. Consult a pediatrician for accurate readings." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="flex gap-2">
          {(["metric", "imperial"] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={`min-tap rounded-xl px-3 py-2 text-sm font-medium transition ${
                unit === u ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"
              }`}
            >
              {u === "metric" ? "Metric (cm/kg)" : "Imperial (ft/in/lbs)"}
            </button>
          ))}
        </div>

        {unit === "metric" ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="cm">Height (cm)</label>
              <input id="cm" inputMode="decimal" className="input" value={cm} onChange={(e) => setCm(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="kg">Weight (kg)</label>
              <input id="kg" inputMode="decimal" className="input" value={kg} onChange={(e) => setKg(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label" htmlFor="ft">Height (ft)</label>
              <input id="ft" inputMode="decimal" className="input" value={ft} onChange={(e) => setFt(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="inch">Height (in)</label>
              <input id="inch" inputMode="decimal" className="input" value={inch} onChange={(e) => setInch(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="lbs">Weight (lbs)</label>
              <input id="lbs" inputMode="decimal" className="input" value={lbs} onChange={(e) => setLbs(e.target.value)} />
            </div>
          </div>
        )}

        <div aria-live="polite" className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/60 p-4">
          <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">Your BMI</div>
          <div className="mt-1 text-3xl font-bold">{bmi ? bmi.toFixed(1) : "—"}</div>
          {cat && <div className={`mt-1 text-sm font-medium ${cat.color}`}>{cat.label}</div>}
        </div>
      </div>
    </ToolPage>
  );
}
