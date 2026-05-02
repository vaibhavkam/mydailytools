"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

// =====================================================================
// WCAG Contrast Checker
// =====================================================================
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  let h = m[0]; if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function relLum([r, g, b]: [number, number, number]) {
  const conv = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * conv(r) + 0.7152 * conv(g) + 0.0722 * conv(b);
}
export function WcagContrastChecker({ tool }: Props) {
  const [fg, setFg] = useState("#1e293b");
  const [bg, setBg] = useState("#ffffff");
  const r = useMemo(() => {
    const a = hexToRgb(fg), b = hexToRgb(bg);
    if (!a || !b) return null;
    const l1 = relLum(a), l2 = relLum(b);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return {
      ratio,
      normalAA: ratio >= 4.5, normalAAA: ratio >= 7,
      largeAA: ratio >= 3, largeAAA: ratio >= 4.5,
      uiAA: ratio >= 3,
    };
  }, [fg, bg]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick or paste foreground and background colors. The contrast ratio is computed and graded against WCAG 2.1 AA/AAA for normal text, large text, and UI components.",
      formula: "WCAG ratio = (L1 + 0.05) / (L2 + 0.05) where L is relative luminance using the sRGB formula. Thresholds: AA = 4.5 (normal text) / 3 (large/UI). AAA = 7 / 4.5.",
      examples: "#1e293b on #ffffff → 14.6:1 (passes AAA on everything). #999 on #fff → 2.85:1 (fails most standards).",
      faq: [{ q: "What counts as large text?", a: "18pt+ regular or 14pt+ bold (≈ 24px / 19px in CSS)." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Foreground</label>
          <div className="flex gap-2"><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-14 rounded-lg cursor-pointer" /><input className="input font-mono" value={fg} onChange={(e) => setFg(e.target.value)} /></div>
        </div>
        <div><label className="label">Background</label>
          <div className="flex gap-2"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-14 rounded-lg cursor-pointer" /><input className="input font-mono" value={bg} onChange={(e) => setBg(e.target.value)} /></div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl p-6 text-center" style={{ background: bg, color: fg }}>
        <div className="text-3xl font-bold">Sample headline</div>
        <div className="mt-2 text-base">The quick brown fox jumps over the lazy dog</div>
      </div>
      {r && (
        <>
          <div className="mt-4 text-center text-4xl font-bold">{r.ratio.toFixed(2)}:1</div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
            {[
              ["AA normal", r.normalAA], ["AAA normal", r.normalAAA],
              ["AA large", r.largeAA], ["AAA large", r.largeAAA], ["AA UI", r.uiAA],
            ].map(([l, ok]) => (
              <div key={l as string} className={`rounded-xl border p-3 text-center ${ok ? "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/30" : "border-red-400/60 bg-red-50 dark:bg-red-950/30"}`}>
                <div className="text-xs">{l as string}</div>
                <div className="text-base font-semibold">{ok ? "✓ Pass" : "✗ Fail"}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolPage>
  );
}

// =====================================================================
// CSS Gradient Generator
// =====================================================================
export function CssGradient({ tool }: Props) {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState([{ c: "#6366f1", p: 0 }, { c: "#a855f7", p: 100 }]);

  const css = useMemo(() => {
    const stopStr = stops.map((s) => `${s.c} ${s.p}%`).join(", ");
    return type === "linear" ? `linear-gradient(${angle}deg, ${stopStr})` : `radial-gradient(circle, ${stopStr})`;
  }, [type, angle, stops]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick linear or radial, set the angle (linear only), and tweak each color stop. The CSS updates live below.",
      formula: "linear-gradient(<angle>deg, <color> <pos>%, …) emits a smooth color transition along the given direction.",
      examples: "Default: an indigo→purple linear gradient at 135°.",
      faq: [],
    }}>
      <div className="rounded-2xl h-44" style={{ background: css }} />
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <div><label className="label">Type</label>
          <div className="flex gap-2">
            {(["linear", "radial"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`min-tap rounded-xl px-3 py-2 text-sm capitalize ${type === t ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{t}</button>
            ))}
          </div>
        </div>
        {type === "linear" && (
          <div><label className="label">Angle: {angle}°</label><input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-brand-600" /></div>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {stops.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="color" value={s.c} onChange={(e) => setStops((cur) => cur.map((x, j) => j === i ? { ...x, c: e.target.value } : x))} className="h-8 w-12 rounded-lg cursor-pointer" />
            <input className="input font-mono" value={s.c} onChange={(e) => setStops((cur) => cur.map((x, j) => j === i ? { ...x, c: e.target.value } : x))} />
            <input type="number" min={0} max={100} className="input w-24" value={s.p} onChange={(e) => setStops((cur) => cur.map((x, j) => j === i ? { ...x, p: Number(e.target.value) } : x))} />
            {stops.length > 2 && <button onClick={() => setStops((cur) => cur.filter((_, j) => j !== i))} className="btn-ghost text-xs">×</button>}
          </div>
        ))}
        <button onClick={() => setStops((cur) => [...cur, { c: "#ffffff", p: 50 }])} className="btn-ghost text-xs">+ Add stop</button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <code className="font-mono text-xs flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-[rgb(var(--border))] px-3 py-2">background: {css};</code>
        <button onClick={() => navigator.clipboard.writeText(`background: ${css};`)} className="btn-ghost text-xs">Copy</button>
      </div>
    </ToolPage>
  );
}

// =====================================================================
// Box Shadow Generator
// =====================================================================
export function BoxShadowGenerator({ tool }: Props) {
  const [x, setX] = useState(0); const [y, setY] = useState(8); const [blur, setBlur] = useState(24);
  const [spread, setSpread] = useState(-8); const [color, setColor] = useState("#6366f1"); const [alpha, setAlpha] = useState(40);
  const [inset, setInset] = useState(false);

  const rgba = useMemo(() => {
    const rgb = hexToRgb(color); if (!rgb) return color;
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${(alpha / 100).toFixed(2)})`;
  }, [color, alpha]);

  const css = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${rgba}`;

  return (
    <ToolPage tool={tool} content={{
      howTo: "Tweak the sliders to compose a CSS box-shadow. The preview updates live; click Copy when satisfied.",
      formula: "box-shadow: [inset?] x y blur spread color. Multiple shadows can be comma-separated to layer effects.",
      examples: "Default: a soft indigo glow under the box.",
      faq: [],
    }}>
      <div className="grid place-items-center min-h-[160px] py-8">
        <div className="w-32 h-32 rounded-2xl bg-[rgb(var(--bg-elevated))]" style={{ boxShadow: css }} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {[["X offset", x, setX, -50, 50], ["Y offset", y, setY, -50, 50], ["Blur", blur, setBlur, 0, 100], ["Spread", spread, setSpread, -50, 50], ["Alpha", alpha, setAlpha, 0, 100]].map(([l, v, set, lo, hi]: any) => (
          <div key={l}><label className="label">{l}: {v}</label><input type="range" min={lo} max={hi} value={v} onChange={(e) => set(Number(e.target.value))} className="w-full accent-brand-600" /></div>
        ))}
        <div><label className="label">Color</label><div className="flex gap-2"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 rounded-lg cursor-pointer" /><input className="input font-mono" value={color} onChange={(e) => setColor(e.target.value)} /></div></div>
        <label className="flex items-end gap-2 text-sm pb-2"><input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} className="accent-brand-600" /> Inset</label>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <code className="font-mono text-xs flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-[rgb(var(--border))] px-3 py-2">box-shadow: {css};</code>
        <button onClick={() => navigator.clipboard.writeText(`box-shadow: ${css};`)} className="btn-ghost text-xs">Copy</button>
      </div>
    </ToolPage>
  );
}

// =====================================================================
// Border Radius Generator
// =====================================================================
export function BorderRadius({ tool }: Props) {
  const [tl, setTl] = useState(20); const [tr, setTr] = useState(20);
  const [br, setBr] = useState(20); const [bl, setBl] = useState(20);
  const [linked, setLinked] = useState(true);

  function setAll(v: number) { setTl(v); setTr(v); setBr(v); setBl(v); }
  const css = `${tl}px ${tr}px ${br}px ${bl}px`;

  return (
    <ToolPage tool={tool} content={{
      howTo: "Drag the corner sliders. Toggle 'linked' to set all four corners at once.",
      formula: "border-radius: top-left top-right bottom-right bottom-left. Equal values can be condensed to one number.",
      examples: "Default: 20px on all corners.",
      faq: [],
    }}>
      <div className="grid place-items-center min-h-[160px] py-8">
        <div className="w-40 h-40 bg-brand-gradient" style={{ borderRadius: css }} />
      </div>
      <div className="mb-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} className="accent-brand-600" /> Link all corners</label></div>
      {linked ? (
        <div><label className="label">All corners: {tl}px</label><input type="range" min={0} max={120} value={tl} onChange={(e) => setAll(Number(e.target.value))} className="w-full accent-brand-600" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {[["Top-left", tl, setTl], ["Top-right", tr, setTr], ["Bottom-right", br, setBr], ["Bottom-left", bl, setBl]].map(([l, v, set]: any) => (
            <div key={l}><label className="label">{l}: {v}px</label><input type="range" min={0} max={120} value={v} onChange={(e) => set(Number(e.target.value))} className="w-full accent-brand-600" /></div>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <code className="font-mono text-xs flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-[rgb(var(--border))] px-3 py-2">border-radius: {css};</code>
        <button onClick={() => navigator.clipboard.writeText(`border-radius: ${css};`)} className="btn-ghost text-xs">Copy</button>
      </div>
    </ToolPage>
  );
}

// =====================================================================
// Type Scale Generator
// =====================================================================
export function TypeScale({ tool }: Props) {
  const [base, setBase] = useState(16);
  const [ratio, setRatio] = useState(1.25);
  const [steps, setSteps] = useState(8);
  const scale = useMemo(() => {
    const arr: { name: string; px: number; rem: number }[] = [];
    for (let i = -2; i < steps; i++) {
      const px = base * Math.pow(ratio, i);
      arr.push({ name: `step-${i}`, px, rem: px / 16 });
    }
    return arr;
  }, [base, ratio, steps]);
  const RATIOS = [
    { v: 1.067, n: "Minor second" }, { v: 1.125, n: "Major second" }, { v: 1.2, n: "Minor third" },
    { v: 1.25, n: "Major third" }, { v: 1.333, n: "Perfect fourth" }, { v: 1.414, n: "Augmented fourth" },
    { v: 1.5, n: "Perfect fifth" }, { v: 1.618, n: "Golden ratio" },
  ];
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a base size and a musical-style ratio. The scale generates step-by-step font sizes — useful for type ramps in design systems.",
      formula: "Each step multiplies the previous by the ratio: size_n = base × ratio^n. The 'major third' ratio (1.25) is a popular default.",
      examples: "Base 16px, ratio 1.25, 8 steps → 16, 20, 25, 31.25, 39.06, … plus two smaller steps below the base.",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Base (px)</label><input type="number" className="input" value={base} onChange={(e) => setBase(Number(e.target.value))} /></div>
        <div><label className="label">Ratio</label>
          <select className="input" value={ratio} onChange={(e) => setRatio(Number(e.target.value))}>
            {RATIOS.map((r) => <option key={r.v} value={r.v}>{r.v} — {r.n}</option>)}
          </select>
        </div>
        <div><label className="label">Steps</label><input type="number" className="input" value={steps} onChange={(e) => setSteps(Math.min(20, Math.max(2, Number(e.target.value))))} /></div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {scale.map((s) => (
          <li key={s.name} className="flex items-baseline gap-3 rounded-xl border border-[rgb(var(--border))] px-3 py-2">
            <span className="text-xs text-[rgb(var(--fg-muted))] w-20 shrink-0 font-mono">{s.name}</span>
            <span className="font-medium" style={{ fontSize: `${s.px}px`, lineHeight: 1.1 }}>The quick brown fox</span>
            <span className="ml-auto font-mono text-xs text-[rgb(var(--fg-muted))]">{s.px.toFixed(2)}px / {s.rem.toFixed(3)}rem</span>
          </li>
        ))}
      </ul>
    </ToolPage>
  );
}

// =====================================================================
// Spacing Scale Generator
// =====================================================================
export function SpacingScale({ tool }: Props) {
  const [base, setBase] = useState(4);
  const [count, setCount] = useState(12);
  const scale = useMemo(() => Array.from({ length: count }, (_, i) => ({ name: i, px: i * base })), [base, count]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a base unit (commonly 4 or 8 px) and how many steps you want. The scale is step × base.",
      formula: "Linear progression. Tailwind uses base 4 (rem * 0.25); Material Design uses base 8.",
      examples: "Base 4, 12 steps → 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44 px.",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Base (px)</label><input type="number" className="input" value={base} onChange={(e) => setBase(Number(e.target.value))} /></div>
        <div><label className="label">Steps</label><input type="number" className="input" value={count} onChange={(e) => setCount(Math.min(40, Math.max(2, Number(e.target.value))))} /></div>
      </div>
      <ul className="mt-4 space-y-1">
        {scale.map((s) => (
          <li key={s.name} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5">
            <span className="text-xs text-[rgb(var(--fg-muted))] w-10 font-mono">{s.name}</span>
            <div className="bg-brand-500 h-3" style={{ width: `${Math.min(s.px, 320)}px` }} />
            <span className="ml-auto font-mono text-xs text-[rgb(var(--fg-muted))]">{s.px}px</span>
          </li>
        ))}
      </ul>
    </ToolPage>
  );
}

// =====================================================================
// Aspect Ratio Calculator
// =====================================================================
export function AspectRatio({ tool }: Props) {
  const [w, setW] = useState("1920");
  const [h, setH] = useState("1080");
  const [tw, setTw] = useState("");
  const [th, setTh] = useState("");
  const ratio = useMemo(() => {
    const a = parseFloat(w), b = parseFloat(h);
    if (!a || !b) return null;
    return { dec: a / b, simplified: simplifyRatio(a, b) };
  }, [w, h]);
  const target = useMemo(() => {
    if (!ratio) return null;
    const a = parseFloat(tw), b = parseFloat(th);
    if (a && !b) return { mode: "h" as const, value: a / ratio.dec };
    if (b && !a) return { mode: "w" as const, value: b * ratio.dec };
    return null;
  }, [tw, th, ratio]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter your source dimensions. Then enter ONE of target width or target height — the other is computed to maintain the same ratio.",
      formula: "Ratio = source width ÷ source height. Target height = target width ÷ ratio (and vice versa).",
      examples: "1920×1080 source = 16:9. Target width 1280 → height 720.",
      faq: [],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Source width</label><input className="input" value={w} onChange={(e) => setW(e.target.value)} /></div>
        <div><label className="label">Source height</label><input className="input" value={h} onChange={(e) => setH(e.target.value)} /></div>
      </div>
      {ratio && (
        <div className="mt-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-3 text-center">
          <div className="text-xs text-brand-700 dark:text-brand-300">Aspect ratio</div>
          <div className="text-2xl font-bold">{ratio.simplified}  <span className="text-sm text-[rgb(var(--fg-muted))] font-normal">({ratio.dec.toFixed(4)})</span></div>
        </div>
      )}
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <div><label className="label">Target width (or leave blank)</label><input className="input" value={tw} onChange={(e) => { setTw(e.target.value); if (e.target.value) setTh(""); }} /></div>
        <div><label className="label">Target height (or leave blank)</label><input className="input" value={th} onChange={(e) => { setTh(e.target.value); if (e.target.value) setTw(""); }} /></div>
      </div>
      {target && (
        <div className="mt-3 text-center text-lg font-semibold">{target.mode === "h" ? `Height: ${target.value.toFixed(2)}` : `Width: ${target.value.toFixed(2)}`}</div>
      )}
    </ToolPage>
  );
}
function simplifyRatio(a: number, b: number) {
  const gcd = (x: number, y: number): number => y < 1e-9 ? x : gcd(y, x % y);
  const g = gcd(a, b);
  return `${(a / g).toFixed(0)}:${(b / g).toFixed(0)}`;
}

// =====================================================================
// PX ↔ REM
// =====================================================================
export function PxRem({ tool }: Props) {
  const [base, setBase] = useState(16);
  const [px, setPx] = useState("32");
  const [rem, setRem] = useState("2");
  return (
    <ToolPage tool={tool} content={{
      howTo: "Set the base font-size (default 16px). Edit either the px or rem field — the other updates instantly.",
      formula: "rem = px ÷ base. px = rem × base. Most browsers default to 16px root.",
      examples: "Base 16: 32px = 2rem. 24px = 1.5rem.",
      faq: [],
    }}>
      <div><label className="label">Base font-size (px)</label><input type="number" className="input" value={base} onChange={(e) => setBase(Number(e.target.value) || 16)} /></div>
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <div><label className="label">Pixels (px)</label><input className="input" value={px} onChange={(e) => { setPx(e.target.value); setRem((parseFloat(e.target.value) / base || 0).toString()); }} /></div>
        <div><label className="label">REM</label><input className="input" value={rem} onChange={(e) => { setRem(e.target.value); setPx((parseFloat(e.target.value) * base || 0).toString()); }} /></div>
      </div>
    </ToolPage>
  );
}

// =====================================================================
// Image Color Palette
// =====================================================================
export function ImagePalette({ tool }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | null | undefined) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(f);
  }

  // Median-cut style color extraction. Down-sample image, bucket pixels into 5-bit
  // RGB cubes, return top-N most populated buckets as the palette.
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const max = 100;
      const scale = Math.min(max / img.width, max / img.height, 1);
      c.width = Math.max(1, Math.floor(img.width * scale));
      c.height = Math.max(1, Math.floor(img.height * scale));
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] >> 3, g = data[i + 1] >> 3, b = data[i + 2] >> 3;
        const key = `${r}-${g}-${b}`;
        const cur = buckets.get(key);
        if (cur) { cur.count++; cur.r += data[i]; cur.g += data[i + 1]; cur.b += data[i + 2]; }
        else buckets.set(key, { count: 1, r: data[i], g: data[i + 1], b: data[i + 2] });
      }
      const top = [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, 6);
      setPalette(top.map((p) => "#" + [p.r / p.count, p.g / p.count, p.b / p.count].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")));
    };
    img.src = src;
  }, [src]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Drop or pick an image; the 6 most-used colors are extracted client-side and shown as a palette.",
      formula: "We downsample to ≤100×100, bucket pixels into 32³ RGB cubes, and pick the densest. Fast, deterministic, no server upload.",
      examples: "Useful for matching a brand color from a logo, or finding the dominant tones of a photo.",
      faq: [],
    }}>
      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
        onClick={() => fileRef.current?.click()}
        className="rounded-2xl border-2 border-dashed border-[rgb(var(--border))] p-8 text-center cursor-pointer hover:border-brand-500/60 transition">
        <div className="text-sm">{src ? "Click to replace image" : "Drop or click to choose an image"}</div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {src && (
        <div className="mt-4 grid sm:grid-cols-[160px_1fr] gap-4 items-start">
          { /* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="source" className="rounded-xl border border-[rgb(var(--border))] max-w-[160px]" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {palette.map((c) => (
              <button key={c} onClick={() => navigator.clipboard.writeText(c)} className="rounded-xl overflow-hidden border border-[rgb(var(--border))]">
                <div className="h-16" style={{ background: c }} />
                <div className="bg-[rgb(var(--bg-elevated))] py-1 text-xs font-mono">{c}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </ToolPage>
  );
}
