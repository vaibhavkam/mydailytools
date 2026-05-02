"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { useLocale } from "@/lib/locale";

export default function LoanCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const { fmtCurrency: fmt, currencySymbol } = useLocale(); const sym = currencySymbol();
  const [amount, setAmount] = useState("25000");
  const [rate, setRate] = useState("6.5");      // annual %
  const [years, setYears] = useState("5");

  const r = useMemo(() => {
    const P = parseFloat(amount);
    const annual = parseFloat(rate) / 100;
    const n = parseFloat(years) * 12;
    if (!P || !n || annual < 0) return null;
    const i = annual / 12;
    // Standard amortization formula: M = P × i(1+i)^n / ((1+i)^n − 1)
    const monthly = i === 0 ? P / n : (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = monthly * n;
    const interest = total - P;
    return { monthly, total, interest };
  }, [amount, rate, years]);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Enter the loan principal, annual interest rate, and term in years. The monthly payment, total paid, and total interest update as you type.",
        formula: "Monthly payment M = P × (i(1+i)ⁿ) ÷ ((1+i)ⁿ − 1), where P is principal, i is the monthly rate (annual ÷ 12), and n is the number of months.",
        examples: "25,000 over 5 years at 6.5% APR → 489.16/month, 4,349 total interest. Doubling the term to 10 years drops the payment to 283.93 but interest grows to 9,071.",
        faq: [
          { q: "Does this include taxes and insurance?", a: "No. This is principal + interest only. For mortgages with PITI, use the mortgage calculator." },
          { q: "Why does paying longer cost so much more?", a: "Interest compounds monthly on the unpaid balance. A longer term means a larger average balance, which means more total interest." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label" htmlFor="amt">Loan amount ({sym})</label>
            <input id="amt" inputMode="decimal" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="rate">Annual rate (%)</label>
            <input id="rate" inputMode="decimal" className="input" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="years">Term (years)</label>
            <input id="years" inputMode="decimal" className="input" value={years} onChange={(e) => setYears(e.target.value)} />
          </div>
        </div>

        {r && (
          <div className="grid grid-cols-3 gap-2" aria-live="polite">
            {[
              { label: "Monthly", value: fmt(r.monthly), big: true },
              { label: "Total paid", value: fmt(r.total) },
              { label: "Total interest", value: fmt(r.interest) },
            ].map((t) => (
              <div key={t.label} className={`rounded-xl border border-[rgb(var(--border))] p-3 text-center ${t.big ? "bg-brand-50 dark:bg-brand-950/40 border-brand-300/60" : ""}`}>
                <div className="text-xs text-[rgb(var(--fg-muted))]">{t.label}</div>
                <div className={`${t.big ? "text-2xl" : "text-lg"} font-semibold tabular-nums`}>{t.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPage>
  );
}
