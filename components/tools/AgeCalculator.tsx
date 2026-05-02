"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function AgeCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const today = new Date().toISOString().slice(0, 10);
  const [dob, setDob] = useState("1990-01-15");
  const [on, setOn] = useState(today);

  const r = useMemo(() => {
    const start = new Date(dob);
    const end = new Date(on);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return null;

    // Calendar-based diff: count whole years, then whole months, then days.
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      // borrow days from the previous month of `end`
      const prev = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prev;
      months -= 1;
    }
    if (months < 0) { months += 12; years -= 1; }

    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;

    return { years, months, days, totalDays, totalWeeks, totalHours };
  }, [dob, on]);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Enter a date of birth and (optionally) the date you want the age computed on. By default, it uses today. Years/months/days are calendar-correct, accounting for leap years.",
        formula: "We count whole years from birth, then whole remaining months, then leftover days, borrowing from the previous month when day-of-month subtracts negative. This matches the way humans report age.",
        examples: "Born 1990-01-15, on 2026-05-02 → 36 years, 3 months, 17 days; that's about 1,872 weeks or 13,256 days.",
        faq: [
          { q: "Does this account for leap years?", a: "Yes. We use real calendar dates, so February 29 is handled correctly." },
          { q: "What about people born February 29?", a: "On non-leap years their 'birthday' is March 1 here, matching most legal definitions." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="dob">Date of birth</label>
            <input id="dob" type="date" className="input" value={dob} onChange={(e) => setDob(e.target.value)} max={today} />
          </div>
          <div>
            <label className="label" htmlFor="on">Calculate age on</label>
            <input id="on" type="date" className="input" value={on} onChange={(e) => setOn(e.target.value)} />
          </div>
        </div>

        {r ? (
          <>
            <div aria-live="polite" className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/60 p-5 text-center">
              <div className="text-3xl font-bold">{r.years} <span className="text-base font-normal text-[rgb(var(--fg-muted))]">years</span> {r.months} <span className="text-base font-normal text-[rgb(var(--fg-muted))]">months</span> {r.days} <span className="text-base font-normal text-[rgb(var(--fg-muted))]">days</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="card p-3"><div className="text-[rgb(var(--fg-muted))] text-xs">Total days</div><div className="font-semibold tabular-nums">{r.totalDays.toLocaleString()}</div></div>
              <div className="card p-3"><div className="text-[rgb(var(--fg-muted))] text-xs">Total weeks</div><div className="font-semibold tabular-nums">{r.totalWeeks.toLocaleString()}</div></div>
              <div className="card p-3"><div className="text-[rgb(var(--fg-muted))] text-xs">Total hours</div><div className="font-semibold tabular-nums">{r.totalHours.toLocaleString()}</div></div>
            </div>
          </>
        ) : (
          <p className="text-sm text-[rgb(var(--fg-muted))]">Pick a date of birth on or before the target date.</p>
        )}
      </div>
    </ToolPage>
  );
}
