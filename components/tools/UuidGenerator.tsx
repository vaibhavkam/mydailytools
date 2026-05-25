"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

function uuidv4(): string {
  // crypto.randomUUID is available in all evergreen browsers and Node 19+.
  const c: Crypto = crypto;
  if (typeof c.randomUUID === "function") return c.randomUUID();
  // Fallback: fill 16 bytes, set version + variant nibbles.
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

export default function UuidGenerator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  // Start empty to avoid SSR/client hydration mismatch (random values differ between server and client).
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    setList(Array.from({ length: 5 }, uuidv4));
  }, []);

  function regen(n = count) {
    setList(Array.from({ length: n }, uuidv4));
  }

  function copyAll() {
    navigator.clipboard.writeText(format(list).join("\n"));
  }

  function format(arr: string[]) {
    return uppercase ? arr.map((u) => u.toUpperCase()) : arr;
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Pick how many UUIDs you need (1–500), choose case, and click Generate. Each UUID is independent v4 — random except for the version and variant nibbles.",
        formula: "UUID v4 has 122 bits of randomness, giving ~5.3 × 10³⁶ possibilities. Collision probability is effectively zero for any practical workload. Format: 8-4-4-4-12 hex digits.",
        examples: "9fa8b1c4-3d50-4f9a-b3e1-7d2f6c0a4b58 — version digit ('4') is fixed, variant first hex of 4th group is 8/9/a/b.",
        faq: [
          { q: "Are these UUIDs unique?", a: "Statistically yes. You'd need ~2.7 × 10¹⁸ UUIDs before a collision is expected (birthday paradox)." },
          { q: "Is this v4 or v7?", a: "v4 (random). Need v7 for time-ordered IDs? It's an easy add — file a feature request." },
          { q: "Why not v1 (timestamp + MAC)?", a: "v1 leaks the generating machine's MAC address and creation time, which is a privacy concern." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            Count:
            <input type="number" min={1} max={500} className="input !w-24 !py-1.5" value={count} onChange={(e) => setCount(Math.min(500, Math.max(1, Number(e.target.value))))} />
          </label>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="accent-brand-600" />
            Uppercase
          </label>
          <div className="ml-auto flex gap-2">
            <button onClick={() => regen(count)} className="btn-primary min-tap"><RefreshCw className="h-4 w-4" /> Generate</button>
            <button onClick={copyAll} className="btn-ghost min-tap"><Copy className="h-4 w-4" /> Copy all</button>
          </div>
        </div>
        <ul className="font-mono text-xs grid gap-1 max-h-[420px] overflow-auto">
          {format(list).map((u, i) => (
            <li key={i} className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 flex items-center justify-between gap-2">
              <span className="truncate">{u}</span>
              <button onClick={() => navigator.clipboard.writeText(u)} aria-label="Copy" className="opacity-60 hover:opacity-100">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </ToolPage>
  );
}
