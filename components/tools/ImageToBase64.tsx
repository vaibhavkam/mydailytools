"use client";

import { useRef, useState } from "react";
import { Copy, Download, Upload } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

export default function ImageToBase64({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [dataUri, setDataUri] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState(0);
  const [mode, setMode] = useState<"datauri" | "css" | "img">("datauri");
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | null | undefined) {
    if (!f) return;
    setName(f.name); setSize(f.size);
    const r = new FileReader();
    r.onload = () => setDataUri(r.result as string);
    r.readAsDataURL(f);
  }

  function output() {
    if (!dataUri) return "";
    if (mode === "css") return `background-image: url("${dataUri}");`;
    if (mode === "img") return `<img src="${dataUri}" alt="" />`;
    return dataUri;
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Drop or pick an image. The Base64 data URI appears below — switch the format toggle to wrap it in CSS or HTML.",
      formula: "Browser's FileReader.readAsDataURL produces a 'data:<mime>;base64,<encoded>' URI. Useful for inlining small images directly into CSS or HTML, avoiding extra HTTP requests.",
      examples: "Inlining a 5 KB icon into a CSS file removes one round-trip — but the encoded version is ~33% larger, so use only for small assets.",
      faq: [
        { q: "Maximum file size?", a: "Browser memory is the only limit (~tens of MB), but data URIs blow up bundle size, so keep below 10 KB for performance." },
        { q: "Is the file uploaded?", a: "No — encoding happens entirely in your browser." },
      ],
    }}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
        className="rounded-2xl border-2 border-dashed border-[rgb(var(--border))] p-8 text-center cursor-pointer hover:border-brand-500/60 transition"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto text-[rgb(var(--fg-muted))]" />
        <div className="mt-2 text-sm">{name ? `${name} (${(size / 1024).toFixed(1)} KB)` : "Drop or click to choose an image"}</div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      {dataUri && (
        <>
          <div className="mt-4 grid sm:grid-cols-[auto_1fr] gap-4 items-start">
            <img src={dataUri} alt="preview" className="max-w-[160px] rounded-lg border border-[rgb(var(--border))]" />
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                {(["datauri", "css", "img"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`min-tap rounded-xl px-3 py-2 text-xs font-medium uppercase ${mode === m ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>
                    {m === "datauri" ? "Data URI" : m.toUpperCase()}
                  </button>
                ))}
              </div>
              <AutoTextarea className="input min-h-[200px] font-mono text-xs" value={output()} readOnly />
              <button onClick={() => navigator.clipboard.writeText(output())} className="mt-2 btn-ghost text-xs"><Copy className="h-3 w-3" /> Copy</button>
            </div>
          </div>
        </>
      )}
    </ToolPage>
  );
}
