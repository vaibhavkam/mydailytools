"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

const FORMATS = ["CODE128", "CODE39", "EAN13", "EAN8", "UPC", "ITF14"] as const;
type Format = typeof FORMATS[number];

export default function BarcodeGenerator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [text, setText] = useState("MYDAILYTOOLS");
  const [format, setFormat] = useState<Format>("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    // Lazy-load jsbarcode so it doesn't get promoted into the shared chunk
    // loaded by every tool page (see CLAUDE.md bundle-size note).
    (async () => {
      const { default: JsBarcode } = await import("jsbarcode");
      if (cancelled || !ref.current) return;
      try {
        JsBarcode(ref.current, text, { format, width, height, displayValue: true, background: "transparent" });
        setError(null);
      } catch (e: any) {
        setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [text, format, width, height]);

  function download() {
    if (!ref.current) return;
    const xml = new XMLSerializer().serializeToString(ref.current);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "barcode.svg"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a format, type your code, and the barcode renders live. Each format has rules about valid characters and length.",
      formula: "CODE128 supports any ASCII; CODE39 is uppercase + digits + a few symbols; EAN13/EAN8/UPC require digits with valid check digits; ITF14 needs 14 digits.",
      examples: "CODE128 with 'HELLO' renders fine. EAN13 needs 12-13 digits and computes the check digit.",
      faq: [{ q: "Why is EAN13 picky?", a: "It's used on retail products and has structural requirements. CODE128 is the safe choice if you don't have a specific format requirement." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Content</label><input className="input font-mono" value={text} onChange={(e) => setText(e.target.value)} /></div>
        <div><label className="label">Format</label>
          <select className="input" value={format} onChange={(e) => setFormat(e.target.value as Format)}>
            {FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div><label className="label">Bar width: {width}</label><input type="range" min={1} max={5} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-brand-600" /></div>
        <div><label className="label">Height: {height}px</label><input type="range" min={40} max={160} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-brand-600" /></div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 rounded-xl border border-[rgb(var(--border))] bg-white p-4 grid place-items-center">
        <svg ref={ref} aria-label="Barcode preview" />
      </div>
      <button onClick={download} className="mt-3 btn-primary min-tap"><Download className="h-4 w-4" /> Download SVG</button>
    </ToolPage>
  );
}
