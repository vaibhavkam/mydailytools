"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

// Date Calculator: add/subtract from a date
export function DateCalculator({ tool }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [days, setDays] = useState(0); const [months, setMonths] = useState(0); const [years, setYears] = useState(0);
  const r = useMemo(() => {
    const d = new Date(start);
    if (Number.isNaN(d.getTime())) return null;
    d.setFullYear(d.getFullYear() + Number(years));
    d.setMonth(d.getMonth() + Number(months));
    d.setDate(d.getDate() + Number(days));
    return d.toISOString().slice(0, 10);
  }, [start, days, months, years]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a starting date and how many days/months/years to add (use negatives to subtract).",
      formula: "Adds in this order: years, then months, then days, using JavaScript Date arithmetic which handles month-overflow.",
      examples: "2024-01-31 + 1 month = 2024-03-02 (Feb has only 29 days in 2024).",
      faq: [
        { q: "How do I subtract days from a date?", a: "Enter a negative number in the Days field. For example, -7 subtracts one week from the starting date." },
        { q: "What happens when adding a month to January 31?", a: "February doesn't have 31 days, so the result overflows to March 2 or 3 depending on whether it's a leap year. This matches standard calendar arithmetic used by most date libraries." },
        { q: "Does this account for leap years?", a: "Yes — the browser's native Date object correctly handles leap years, so February 28 + 1 day = February 29 in a leap year." },
      ],
    }}>
      <div className="grid sm:grid-cols-4 gap-3">
        <div><label className="label">Start</label><input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><label className="label">+ Years</label><input type="number" className="input" value={years} onChange={(e) => setYears(Number(e.target.value))} /></div>
        <div><label className="label">+ Months</label><input type="number" className="input" value={months} onChange={(e) => setMonths(Number(e.target.value))} /></div>
        <div><label className="label">+ Days</label><input type="number" className="input" value={days} onChange={(e) => setDays(Number(e.target.value))} /></div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
        <div className="text-xs uppercase text-brand-700 dark:text-brand-300">Result</div>
        <div className="text-2xl font-bold tabular-nums">{r ?? "—"}</div>
      </div>
    </ToolPage>
  );
}

// Timezone Converter
export function TimezoneConverter({ tool }: Props) {
  const tzs = ["UTC", "America/New_York", "America/Los_Angeles", "America/Chicago", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Kolkata", "Asia/Shanghai", "Australia/Sydney"];
  const [time, setTime] = useState("");
  useEffect(() => { setTime(new Date().toISOString().slice(0, 16)); }, []);
  const [from, setFrom] = useState("UTC");
  const r = useMemo(() => {
    const d = new Date(`${time}:00${tzOffset(from, time)}`);
    if (Number.isNaN(d.getTime())) return null;
    return tzs.map((tz) => ({ tz, fmt: d.toLocaleString("en-GB", { timeZone: tz, dateStyle: "medium", timeStyle: "short" }) }));
  }, [time, from]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a date/time and its source timezone. The same instant is shown in 10 common timezones.",
      formula: "We construct a UTC timestamp from your input + selected source-zone offset, then format it via Intl.DateTimeFormat for each target zone.",
      examples: "2026-05-02T14:00 in New York is 19:00 in London on the same day.",
      faq: [{ q: "Does this handle DST?", a: "Yes — the IANA timezone database (built into the browser) accounts for daylight saving rules." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Date & time</label><input type="datetime-local" className="input" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        <div><label className="label">Source timezone</label>
          <select className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
            {tzs.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3 grid sm:grid-cols-2 gap-2">
        {r?.map((row) => (
          <div key={row.tz} className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">{row.tz}</div><div className="font-mono text-sm">{row.fmt}</div></div>
        ))}
      </div>
    </ToolPage>
  );
}
function tzOffset(tz: string, isoLocal: string) {
  // Compute the offset by formatting a reference instant in the target tz.
  const ref = new Date(isoLocal + "Z");
  const local = new Date(ref.toLocaleString("en-US", { timeZone: tz }));
  const diff = (local.getTime() - ref.getTime()) / 60000;
  const sign = diff >= 0 ? "+" : "-";
  const a = Math.abs(diff);
  return `${sign}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
}

// Countdown Timer
export function CountdownTimer({ tool }: Props) {
  const [target, setTarget] = useState("");
  const [now, setNow] = useState(0);
  useEffect(() => {
    const d = new Date(); d.setHours(d.getHours() + 24);
    setTarget(d.toISOString().slice(0, 16));
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms / 3600000) % 24);
  const m = Math.floor((ms / 60000) % 60);
  const s = Math.floor((ms / 1000) % 60);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a future date and time. The countdown updates every second; once it hits zero, all values stay at 0.",
      formula: "Difference between the target timestamp and the current local time, broken into days/hours/minutes/seconds.",
      examples: "Useful for tracking product launches, exam dates, or holidays.",
      faq: [
        { q: "Does the countdown continue if I close the tab?", a: "No — the countdown runs in the browser. When you reopen the page it recalculates from your target date vs the current time, so it will still show the correct remaining time as long as the target hasn't passed." },
        { q: "What timezone is the countdown using?", a: "Your local system timezone. The target date/time you pick is interpreted in your browser's local time." },
        { q: "What happens when the countdown reaches zero?", a: "All values stop at 0 and stay there. The page doesn't refresh or navigate anywhere." },
      ],
    }}>
      <label className="label">Target date & time</label>
      <input type="datetime-local" className="input" value={target} onChange={(e) => setTarget(e.target.value)} />
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[["Days", d], ["Hours", h], ["Minutes", m], ["Seconds", s]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
            <div className="text-3xl font-bold tabular-nums">{v}</div>
            <div className="text-xs text-brand-700 dark:text-brand-300">{l as string}</div>
          </div>
        ))}
      </div>
    </ToolPage>
  );
}

// Stopwatch
export function Stopwatch({ tool }: Props) {
  const [running, setRunning] = useState(false);
  const [ms, setMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (running) {
      const start = Date.now() - ms;
      ref.current = window.setInterval(() => setMs(Date.now() - start), 31);
    } else if (ref.current) clearInterval(ref.current);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps
  function fmt(t: number) {
    const s = Math.floor(t / 1000); const cs = Math.floor((t % 1000) / 10);
    return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}.${String(cs).padStart(2,"0")}`;
  }
  return (
    <ToolPage tool={tool} content={{
      howTo: "Start the stopwatch, click Lap to record split times, Reset to zero everything out.",
      formula: "Uses Date.now() differences for accuracy independent of CPU jitter; redraws every ~31 ms.",
      examples: "Track workout intervals, kitchen timers, or anything you'd time on a phone.",
      faq: [
        { q: "How accurate is the stopwatch?", a: "It uses Date.now() sampled every ~31 ms, so displayed precision is to the centisecond (1/100 s). Actual accuracy depends on tab-throttling — background tabs may drift by tens of milliseconds." },
        { q: "How many laps can I record?", a: "There's no hard limit. Laps are stored in memory so they're cleared when you reset or refresh the page." },
        { q: "Does pausing the stopwatch lose time?", a: "No — pausing captures the elapsed time, and resuming continues from exactly where it left off." },
      ],
    }}>
      <div className="text-center font-mono text-6xl font-bold tabular-nums my-6">{fmt(ms)}</div>
      <div className="flex gap-2 justify-center">
        <button onClick={() => setRunning(!running)} className="btn-primary min-tap">{running ? "Pause" : "Start"}</button>
        <button onClick={() => setLaps([ms, ...laps])} disabled={!running} className="btn-ghost min-tap">Lap</button>
        <button onClick={() => { setRunning(false); setMs(0); setLaps([]); }} className="btn-ghost min-tap">Reset</button>
      </div>
      {laps.length > 0 && <ul className="mt-6 text-sm space-y-1 max-h-40 overflow-auto">{laps.map((l, i) => (<li key={i} className="flex justify-between font-mono px-2"><span>Lap {laps.length - i}</span><span>{fmt(l)}</span></li>))}</ul>}
    </ToolPage>
  );
}

// Days Between Dates
export function DaysBetween({ tool }: Props) {
  const [a, setA] = useState("2024-01-01");
  const [b, setB] = useState("");
  useEffect(() => { setB(new Date().toISOString().slice(0, 10)); }, []);
  const r = useMemo(() => {
    const x = new Date(a), y = new Date(b);
    if (Number.isNaN(x.getTime()) || Number.isNaN(y.getTime())) return null;
    const ms = Math.abs(y.getTime() - x.getTime());
    return { days: Math.floor(ms / 86400000), weeks: Math.floor(ms / (86400000 * 7)) };
  }, [a, b]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick two dates — the gap is shown in days and weeks.",
      formula: "Absolute difference in milliseconds, divided by 86,400,000.",
      examples: "Jan 1 to Dec 31 = 365 days (or 366 in a leap year).",
      faq: [
        { q: "Does the order of the two dates matter?", a: "No — the tool always returns the absolute difference, so Date A can be before or after Date B." },
        { q: "Are the start and end dates themselves counted?", a: "The calculation counts the gap between midnight on each date, so neither boundary day is included. Add 1 if you need inclusive counting." },
        { q: "How many days are in a week for the weeks calculation?", a: "Exactly 7. Partial weeks are truncated — 13 days shows 1 week, not 2." },
      ],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Date A</label><input type="date" className="input" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <div><label className="label">Date B</label><input type="date" className="input" value={b} onChange={(e) => setB(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-3 text-center"><div className="text-xs text-brand-700 dark:text-brand-300">Days</div><div className="text-3xl font-bold tabular-nums">{r.days}</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3 text-center"><div className="text-xs text-[rgb(var(--fg-muted))]">Weeks</div><div className="text-3xl font-bold tabular-nums">{r.weeks}</div></div>
        </div>
      )}
    </ToolPage>
  );
}

// Week Number (ISO 8601)
export function WeekNumber({ tool }: Props) {
  const [date, setDate] = useState("");
  useEffect(() => { setDate(new Date().toISOString().slice(0, 10)); }, []);
  const r = useMemo(() => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    // ISO week: Thursday-based, week 1 contains Jan 4.
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { week, year: t.getUTCFullYear(), dayOfYear: Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000) };
  }, [date]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a date — ISO week number, ISO year, and day-of-year are computed.",
      formula: "ISO 8601 weeks start Monday; week 1 contains January 4th.",
      examples: "January 1 might be week 52 or 53 of the previous ISO year if it falls on a Friday/Saturday/Sunday.",
      faq: [
        { q: "Why does January 1 sometimes belong to week 52 of the previous year?", a: "ISO 8601 defines week 1 as the week containing the first Thursday of the year. If January 1 falls on a Friday, Saturday, or Sunday, it belongs to the last week of the previous ISO year." },
        { q: "What is the difference between ISO week year and calendar year?", a: "The ISO week year can differ from the calendar year by ±1 day for dates at the start or end of January. The ISO week year is always the year that contains Thursday of that week." },
        { q: "How is the day-of-year counted?", a: "Day 1 is January 1. Day 365 (or 366 in a leap year) is December 31. The count resets to 1 on January 1 each calendar year." },
      ],
    }}>
      <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[rgb(var(--border))] p-3 text-center"><div className="text-xs text-[rgb(var(--fg-muted))]">ISO Week</div><div className="text-2xl font-bold">{r.week}</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3 text-center"><div className="text-xs text-[rgb(var(--fg-muted))]">ISO Year</div><div className="text-2xl font-bold">{r.year}</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3 text-center"><div className="text-xs text-[rgb(var(--fg-muted))]">Day of year</div><div className="text-2xl font-bold">{r.dayOfYear}</div></div>
        </div>
      )}
    </ToolPage>
  );
}
