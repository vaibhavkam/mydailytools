"use client";

import { useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function UrlEncoderDecoder({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [text, setText] = useState("https://example.com/search?q=hello world&lang=en");
  const [mode, setMode] = useState<"component" | "uri">("component");
  const [out, setOut] = useState("");
  const [decoded, setDecoded] = useState("");
  const [encIn, setEncIn] = useState("https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world");
  const [error, setError] = useState<string | null>(null);

  function doEncode() {
    try {
      setOut(mode === "component" ? encodeURIComponent(text) : encodeURI(text));
      setError(null);
    } catch (e: any) { setError(e.message); }
  }
  function doDecode() {
    try { setDecoded(decodeURIComponent(encIn)); setError(null); }
    catch (e: any) { setError("Invalid encoding: " + e.message); }
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Encode a string for safe inclusion in a URL, or decode percent-encoded characters back to plain text. Two encoding modes: 'component' (encodes everything, including / and ?) and 'URI' (preserves URL structure characters).",
        formula: "Percent encoding replaces any non-ASCII or reserved character with %XX, where XX is the byte's UTF-8 hex. Reserved characters per RFC 3986 include : / ? # [ ] @ ! $ & ' ( ) * + , ; =.",
        examples: '"hello world" → "hello%20world". "/" stays "/" with encodeURI but becomes "%2F" with encodeURIComponent.',
        faq: [
          { q: "When do I use 'component' vs 'URI'?", a: "Use 'component' when encoding a value going inside a URL (a query param). Use 'URI' when encoding an entire URL that's already structured." },
          { q: "What about + for spaces?", a: "Form-encoded URLs use + for space; percent-encoded URLs use %20. We emit %20 (the modern standard)." },
        ],
      }}
    >
      <div className="grid gap-6">
        <section>
          <h3 className="font-semibold mb-2">Encode</h3>
          <textarea className="input min-h-[80px]" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select className="input !w-auto !py-1.5" value={mode} onChange={(e) => setMode(e.target.value as any)}>
              <option value="component">encodeURIComponent</option>
              <option value="uri">encodeURI</option>
            </select>
            <button onClick={doEncode} className="btn-primary min-tap">Encode →</button>
            {out && <button onClick={() => navigator.clipboard.writeText(out)} className="btn-ghost text-xs">Copy</button>}
          </div>
          {out && <textarea readOnly value={out} className="input min-h-[80px] font-mono text-xs mt-2" />}
        </section>

        <section>
          <h3 className="font-semibold mb-2">Decode</h3>
          <textarea className="input min-h-[80px] font-mono text-xs" value={encIn} onChange={(e) => setEncIn(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button onClick={doDecode} className="btn-primary min-tap">Decode →</button>
            {decoded && <button onClick={() => navigator.clipboard.writeText(decoded)} className="btn-ghost text-xs">Copy</button>}
          </div>
          {decoded && <textarea readOnly value={decoded} className="input min-h-[80px] mt-2" />}
          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
        </section>
      </div>
    </ToolPage>
  );
}
