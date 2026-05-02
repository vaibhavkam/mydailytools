"use client";

import { useMemo, useState } from "react";
import cronstrue from "cronstrue";
import { CronExpressionParser as Cron } from "cron-parser";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function CronExpressionParser({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [expr, setExpr] = useState("0 */6 * * *");

  const r = useMemo(() => {
    let humanText = "";
    try { humanText = cronstrue.toString(expr, { use24HourTimeFormat: true }); }
    catch (e: any) { return { error: e.message || "Invalid cron expression" }; }

    try {
      const interval = Cron.parse(expr);
      const next: string[] = [];
      for (let i = 0; i < 5; i++) next.push(interval.next().toISOString() ?? "");
      return { humanText, next };
    } catch (e: any) {
      return { humanText, next: [], note: e.message };
    }
  }, [expr]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Type a cron expression in standard 5-field form. The English description and the next 5 run times appear instantly. Both the cronstrue and cron-parser libraries support the common extensions (lists, ranges, steps).",
      formula: "Five fields: minute (0–59), hour (0–23), day of month (1–31), month (1–12), day of week (0–7, where 0 and 7 are Sunday). Special characters: * (any), , (list), - (range), / (step).",
      examples: "0 */6 * * * = every 6 hours. 0 9 * * 1-5 = 9 am Monday–Friday. */15 9-17 * * * = every 15 minutes from 9 am to 5 pm.",
      faq: [
        { q: "Does this support 6-field (with seconds)?", a: "We use the 5-field standard. Some flavors (Quartz, Spring) add a leading seconds field — drop it before pasting." },
        { q: "What timezone?", a: "Next-run times are shown in UTC. Convert to your local timezone in your scheduler config." },
      ],
    }}>
      <label className="label">Cron expression</label>
      <input className="input font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="0 */6 * * *" />
      {"error" in r ? (
        <p role="alert" className="mt-3 text-sm text-red-600">{r.error}</p>
      ) : (
        <>
          <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
            <div className="text-xs uppercase text-brand-700 dark:text-brand-300 mb-1">In English</div>
            <div className="text-lg">{r.humanText}</div>
          </div>
          {r.next?.length ? (
            <div className="mt-3">
              <div className="text-xs font-semibold mb-1.5">Next 5 run times (UTC)</div>
              <ul className="font-mono text-xs space-y-1">
                {r.next.map((t) => <li key={t} className="rounded-lg border border-[rgb(var(--border))] px-3 py-1.5">{t}</li>)}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </ToolPage>
  );
}
