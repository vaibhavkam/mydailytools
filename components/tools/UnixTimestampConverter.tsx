"use client";

import { useEffect, useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function UnixTimestampConverter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [now, setNow] = useState(0);
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  // Populate with current time on client only to avoid SSR/hydration mismatch.
  useEffect(() => {
    const epoch = Math.floor(Date.now() / 1000);
    setNow(epoch);
    setTsInput(String(epoch));
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Detect seconds vs milliseconds heuristically: 13 digits ≈ ms, 10 digits ≈ s.
  const tsResult = useMemo(() => {
    const n = parseFloat(tsInput);
    if (!Number.isFinite(n)) return null;
    const ms = String(Math.floor(n)).length >= 13 ? n : n * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return { iso: d.toISOString(), local: d.toString(), utc: d.toUTCString() };
  }, [tsInput]);

  const dateResult = useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    return { sec: Math.floor(d.getTime() / 1000), ms: d.getTime() };
  }, [dateInput]);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Convert in either direction: paste a Unix timestamp (seconds or milliseconds) to get a human date, or pick a date to get the epoch. The current epoch ticks live at the top so you can grab it with one click.",
        formula: "Unix time = seconds since 1970-01-01T00:00:00Z. Milliseconds is ×1000. We auto-detect 10-digit (seconds) vs 13-digit (milliseconds) input.",
        examples: "1714665600 → 2024-05-02T16:00:00Z. The new millennium (2000-01-01T00:00:00Z) is 946684800.",
        faq: [
          { q: "What about the year 2038 problem?", a: "32-bit signed Unix time overflows in 2038. JavaScript uses 64-bit floats, so this tool works far past 2038." },
          { q: "Which timezone?", a: "Unix time is timezone-independent (always UTC). We show your local interpretation for convenience." },
        ],
      }}
    >
      <div className="grid gap-5">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-[rgb(var(--border))] p-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-[rgb(var(--fg-muted))]">Current Unix time</div>
            <div className="font-mono text-lg tabular-nums">{now}</div>
          </div>
          <button onClick={() => navigator.clipboard.writeText(String(now))} className="btn-ghost text-xs">Copy</button>
        </div>

        <div>
          <label className="label" htmlFor="ts">Timestamp → Date</label>
          <input id="ts" inputMode="numeric" className="input font-mono" value={tsInput} onChange={(e) => setTsInput(e.target.value)} />
          {tsResult && (
            <dl className="mt-2 grid sm:grid-cols-3 gap-2 text-sm">
              <div className="card p-2"><dt className="text-xs text-[rgb(var(--fg-muted))]">ISO 8601</dt><dd className="font-mono">{tsResult.iso}</dd></div>
              <div className="card p-2"><dt className="text-xs text-[rgb(var(--fg-muted))]">UTC</dt><dd className="font-mono">{tsResult.utc}</dd></div>
              <div className="card p-2"><dt className="text-xs text-[rgb(var(--fg-muted))]">Local</dt><dd className="font-mono text-xs">{tsResult.local}</dd></div>
            </dl>
          )}
        </div>

        <div>
          <label className="label" htmlFor="dt">Date → Timestamp</label>
          <input id="dt" type="datetime-local" step="1" className="input" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
          {dateResult && (
            <div className="mt-2 grid sm:grid-cols-2 gap-2 text-sm">
              <div className="card p-2"><div className="text-xs text-[rgb(var(--fg-muted))]">Seconds</div><div className="font-mono">{dateResult.sec}</div></div>
              <div className="card p-2"><div className="text-xs text-[rgb(var(--fg-muted))]">Milliseconds</div><div className="font-mono">{dateResult.ms}</div></div>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  );
}
