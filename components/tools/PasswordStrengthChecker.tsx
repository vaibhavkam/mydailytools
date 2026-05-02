"use client";

import { useMemo, useState } from "react";
import zxcvbn from "zxcvbn";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

const SCORE_LABEL = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
const SCORE_COLOR = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-brand-600"];

export default function PasswordStrengthChecker({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const r = useMemo(() => {
    if (!pw) return null;
    const z = zxcvbn(pw);
    return {
      score: z.score,
      label: SCORE_LABEL[z.score],
      color: SCORE_COLOR[z.score],
      crackTimes: z.crack_times_display,
      feedback: z.feedback.warning || (z.feedback.suggestions || []).join(" "),
      guesses: z.guesses,
    };
  }, [pw]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Type a password. Strength is estimated using the zxcvbn library, which models real cracking patterns (dictionary words, sequences, keyboard runs, leetspeak, dates) — not just length and character classes.",
      formula: "zxcvbn returns a 0–4 score and an estimated number of guesses. Crack times are derived from the guess count divided by typical attacker speeds (online unthrottled ≈ 10/s; offline GPU ≈ 10¹⁰/s).",
      examples: "'password' = score 0. 'Password1!' = score 1 (predictable pattern). 'correct horse battery staple' = score 4. A 16-char random string = score 4.",
      faq: [
        { q: "Why is 'P@ssw0rd!' weak?", a: "zxcvbn knows about leetspeak substitutions and common passwords — those tricks add almost no real security." },
        { q: "Is my password sent anywhere?", a: "No. Everything runs locally in your browser." },
      ],
    }}>
      <label className="label">Password</label>
      <div className="flex gap-2">
        <input type={show ? "text" : "password"} className="input font-mono" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button onClick={() => setShow(!show)} className="btn-ghost text-xs whitespace-nowrap">{show ? "Hide" : "Show"}</button>
      </div>
      {r && (
        <>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1"><span className="text-[rgb(var(--fg-muted))]">Strength</span><span className="font-medium">{r.label}</span></div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className={`h-full ${r.color} transition-all`} style={{ width: `${(r.score + 1) * 20}%` }} />
            </div>
          </div>
          {r.feedback && <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">{r.feedback}</p>}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["Online (10/s)", r.crackTimes.online_throttling_100_per_hour],
              ["Online unthrottled", r.crackTimes.online_no_throttling_10_per_second],
              ["Offline slow (10⁴/s)", r.crackTimes.offline_slow_hashing_1e4_per_second],
              ["Offline fast (10¹⁰/s)", r.crackTimes.offline_fast_hashing_1e10_per_second],
            ].map(([l, v]) => (
              <div key={l as string} className="rounded-xl border border-[rgb(var(--border))] p-3">
                <div className="text-xs text-[rgb(var(--fg-muted))]">{l as string}</div>
                <div className="text-sm font-semibold">{v as string}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolPage>
  );
}
