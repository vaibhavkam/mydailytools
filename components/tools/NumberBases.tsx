"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

// Generic two-base converter; specific tools wrap this with fixed bases.
function BaseConverter({ tool, fromBase, toBase, fromName, toName, content }: Props & { fromBase: number; toBase: number; fromName: string; toName: string; content: any }) {
  const [val, setVal] = useState(fromBase === 10 ? "255" : fromBase === 2 ? "11111111" : fromBase === 16 ? "ff" : "377");
  const r = useMemo(() => {
    if (!val.trim()) return { a: "", b: "" };
    try {
      const n = parseInt(val.trim(), fromBase);
      if (Number.isNaN(n)) return { a: val, b: "Invalid input" };
      return { a: n.toString(toBase).toUpperCase(), b: n.toString(fromBase).toUpperCase() };
    } catch { return { a: val, b: "Invalid" }; }
  }, [val, fromBase, toBase]);
  return (
    <ToolPage tool={tool} content={content}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">{fromName}</label><input className="input font-mono" value={val} onChange={(e) => setVal(e.target.value)} /></div>
        <div><label className="label">{toName}</label><input className="input font-mono" value={r.a} readOnly /></div>
      </div>
    </ToolPage>
  );
}

export const BinaryDecimal = (p: Props) => <BaseConverter {...p} fromBase={2} toBase={10} fromName="Binary" toName="Decimal" content={{ howTo: "Enter a binary number; the decimal value computes instantly.", formula: "Each binary digit represents a power of 2. 1101 = 8+4+0+1 = 13.", examples: "11111111 (binary) = 255. 10000000 = 128.", faq: [] }} />;
export const HexDecimal = (p: Props) => <BaseConverter {...p} fromBase={16} toBase={10} fromName="Hexadecimal" toName="Decimal" content={{ howTo: "Hex digits 0–9, A–F. Case insensitive.", formula: "Each hex digit represents 4 bits.", examples: "FF = 255. 1A = 26. C0FFEE = 12,648,430.", faq: [] }} />;
export const BinaryHex = (p: Props) => <BaseConverter {...p} fromBase={2} toBase={16} fromName="Binary" toName="Hexadecimal" content={{ howTo: "Group binary into nibbles (4 bits) for hex conversion.", formula: "Each hex digit corresponds to 4 binary digits.", examples: "1111 1111 = FF. 1010 0011 = A3.", faq: [] }} />;
export const OctalDecimal = (p: Props) => <BaseConverter {...p} fromBase={8} toBase={10} fromName="Octal" toName="Decimal" content={{ howTo: "Octal uses digits 0–7; common in legacy Unix permission notations.", formula: "Each octal digit represents 3 bits.", examples: "777 = 511. 644 = 420.", faq: [] }} />;

// Arbitrary base 2..36
export function NumberBaseConverter({ tool }: Props) {
  const [val, setVal] = useState("ff");
  const [from, setFrom] = useState(16);
  const [to, setTo] = useState(2);
  const r = useMemo(() => {
    const n = parseInt(val, from);
    if (Number.isNaN(n)) return "Invalid";
    return n.toString(to).toUpperCase();
  }, [val, from, to]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Convert between any two bases from 2 to 36.", formula: "JavaScript's parseInt and toString natively handle bases 2–36 using digits 0–9, A–Z.", examples: "ff (base 16) → 11111111 (base 2). 100 (base 36) = 1296 (decimal).", faq: [] }}>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="label">Value</label><input className="input font-mono" value={val} onChange={(e) => setVal(e.target.value)} /></div>
        <div><label className="label">From base</label><input type="number" min={2} max={36} className="input" value={from} onChange={(e) => setFrom(Math.min(36, Math.max(2, Number(e.target.value))))} /></div>
        <div><label className="label">To base</label><input type="number" min={2} max={36} className="input" value={to} onChange={(e) => setTo(Math.min(36, Math.max(2, Number(e.target.value))))} /></div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase text-brand-700 dark:text-brand-300">Result (base {to})</div>
        <div className="text-2xl font-mono break-all">{r}</div>
      </div>
    </ToolPage>
  );
}

// ASCII converter: text <-> ASCII codes
export function AsciiConverter({ tool }: Props) {
  const [text, setText] = useState("Hello");
  const [codes, setCodes] = useState("72 101 108 108 111");
  return (
    <ToolPage tool={tool} content={{ howTo: "Type text to see ASCII codes; type codes (space-separated decimals) to see text.", formula: "Each character maps to its Unicode code point (compatible with ASCII for codes 0–127).", examples: "'A' = 65. 'hi' = 104 105.", faq: [] }}>
      <div className="grid gap-3">
        <div><label className="label">Text</label>
          <input className="input" value={text} onChange={(e) => { setText(e.target.value); setCodes([...e.target.value].map((c) => c.charCodeAt(0)).join(" ")); }} />
        </div>
        <div><label className="label">ASCII codes (space-separated)</label>
          <input className="input font-mono" value={codes} onChange={(e) => {
            setCodes(e.target.value);
            const t = e.target.value.split(/\s+/).filter(Boolean).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 0x10ffff).map((n) => String.fromCodePoint(n)).join("");
            setText(t);
          }} />
        </div>
      </div>
    </ToolPage>
  );
}

// BCD: each decimal digit -> 4 bits
export function BcdConverter({ tool }: Props) {
  const [dec, setDec] = useState("256");
  const r = useMemo(() => {
    if (!/^\d+$/.test(dec)) return null;
    return [...dec].map((d) => parseInt(d).toString(2).padStart(4, "0")).join(" ");
  }, [dec]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Enter a non-negative decimal integer. Each digit is encoded in 4 bits independently.", formula: "BCD (binary-coded decimal) keeps each base-10 digit as its own 4-bit nibble — wasteful but useful when you need digit-by-digit display.", examples: "256 → 0010 0101 0110.", faq: [] }}>
      <label className="label">Decimal</label>
      <input className="input font-mono" value={dec} onChange={(e) => setDec(e.target.value)} />
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs uppercase text-brand-700 dark:text-brand-300">BCD</div>
        <div className="text-xl font-mono break-all">{r ?? "Digits only"}</div>
      </div>
    </ToolPage>
  );
}

// Roman numerals (1..3999)
const ROMAN: [number, string][] = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
function toRoman(n: number) { let s = ""; for (const [v, r] of ROMAN) while (n >= v) { s += r; n -= v; } return s; }
function fromRoman(s: string): number | null {
  s = s.toUpperCase().trim(); if (!/^[MDCLXVI]+$/.test(s)) return null;
  let n = 0, i = 0;
  for (const [v, r] of ROMAN) { while (s.slice(i, i + r.length) === r) { n += v; i += r.length; } }
  return i === s.length ? n : null;
}
export function RomanNumeralConverter({ tool }: Props) {
  const [num, setNum] = useState("2024");
  const [rom, setRom] = useState("MMXXIV");
  return (
    <ToolPage tool={tool} content={{ howTo: "Convert numbers (1–3999) to Roman numerals and back.", formula: "I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Subtractive notation: IV=4, IX=9, XL=40, XC=90, CD=400, CM=900.", examples: "2024 = MMXXIV. MCMXCIX = 1999.", faq: [{ q: "Why max 3999?", a: "Standard Roman notation can't represent 4000+ without overlines. We cap at MMMCMXCIX = 3999." }] }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Number</label>
          <input className="input" value={num} onChange={(e) => {
            setNum(e.target.value);
            const n = parseInt(e.target.value);
            if (n >= 1 && n <= 3999) setRom(toRoman(n)); else setRom("");
          }} />
        </div>
        <div><label className="label">Roman</label>
          <input className="input font-mono" value={rom} onChange={(e) => {
            setRom(e.target.value.toUpperCase());
            const n = fromRoman(e.target.value);
            if (n != null) setNum(String(n));
          }} />
        </div>
      </div>
    </ToolPage>
  );
}
