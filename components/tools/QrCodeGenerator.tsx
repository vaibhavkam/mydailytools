"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Level = "L" | "M" | "Q" | "H";

export default function QrCodeGenerator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [text, setText] = useState("https://mydailytool.com");
  const [level, setLevel] = useState<Level>("M");
  const [size, setSize] = useState(280);
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !text) return;
    QRCode.toCanvas(ref.current, text, {
      errorCorrectionLevel: level,
      width: size,
      color: { dark: fg, light: bg },
      margin: 2,
    }).catch(() => {});
  }, [text, level, size, fg, bg]);

  function download() {
    if (!ref.current) return;
    const url = ref.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "qr-code.png"; a.click();
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Type any URL or text. Adjust size, error-correction level, and colors. Click Download to save as PNG.",
      formula: "Error-correction levels: L (~7% recoverable), M (~15%), Q (~25%), H (~30%). Higher levels make the code denser but more resilient to damage or partial occlusion.",
      examples: "Encode a URL for a poster, a Wi-Fi config, or a plain-text note. QR codes can hold up to ~3 KB of data at level L.",
      faq: [{ q: "Can I encode an image?", a: "No — only text. To share an image via QR, host it and encode the URL." }],
    }}>
      <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-start">
        <div className="grid gap-3">
          <div><label className="label">Content</label><textarea className="input min-h-[100px]" value={text} onChange={(e) => setText(e.target.value)} /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Error correction</label>
              <select className="input" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                <option value="L">L (low — denser, more data)</option>
                <option value="M">M (medium)</option>
                <option value="Q">Q (quartile)</option>
                <option value="H">H (high — more resilient)</option>
              </select>
            </div>
            <div><label className="label">Size: {size}px</label><input type="range" min={120} max={600} step={20} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-brand-600" /></div>
            <div><label className="label">Foreground</label><input type="color" className="h-10 w-full rounded-lg" value={fg} onChange={(e) => setFg(e.target.value)} /></div>
            <div><label className="label">Background</label><input type="color" className="h-10 w-full rounded-lg" value={bg} onChange={(e) => setBg(e.target.value)} /></div>
          </div>
          <button onClick={download} className="btn-primary min-tap self-start"><Download className="h-4 w-4" /> Download PNG</button>
        </div>
        <div className="rounded-xl border border-[rgb(var(--border))] p-3" style={{ background: bg }}>
          <canvas ref={ref} aria-label="QR code preview" />
        </div>
      </div>
    </ToolPage>
  );
}
