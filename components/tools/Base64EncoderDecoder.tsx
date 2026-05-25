"use client";

import { useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

// btoa/atob only handle Latin-1. We round-trip via TextEncoder/Decoder to support
// the full Unicode range (emoji, CJK, etc.).
function encodeUtf8(s: string) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(s)));
}
function decodeUtf8(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
  return new TextDecoder().decode(bytes);
}

export default function Base64EncoderDecoder({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [text, setText] = useState("Hello, MyDailyTool! 👋");
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");
  const [decodeIn, setDecodeIn] = useState("SGVsbG8sIE15RGFpbHlUb29scyEg8J+Riw==");
  const [error, setError] = useState<string | null>(null);

  function doEncode() {
    try { setEncoded(encodeUtf8(text)); setError(null); }
    catch (e: any) { setError(e.message); }
  }
  function doDecode() {
    try { setDecoded(decodeUtf8(decodeIn.trim())); setError(null); }
    catch (e: any) { setError("Invalid Base64: " + e.message); }
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Use the Encode tab to convert text into Base64, or the Decode tab to recover text from Base64. Unicode (emoji, CJK) is fully supported via UTF-8.",
        formula: "Base64 encodes 3 bytes (24 bits) as 4 ASCII characters from a 64-symbol alphabet (A–Z, a–z, 0–9, +, /). Output is roughly 33% larger than input. Padding with '=' fills the last group to a multiple of 4.",
        examples: '"hi" → "aGk=". "Hello, World!" → "SGVsbG8sIFdvcmxkIQ==". A 12-character string becomes a 16-char (with padding) Base64 string.',
        faq: [
          { q: "Is Base64 encryption?", a: "No. It's encoding — anyone can decode it instantly. Don't use Base64 to hide secrets." },
          { q: "What about URL-safe Base64?", a: "Replace + with - and / with _, and strip = padding. We use standard Base64 here; convert if your protocol requires URL-safe." },
        ],
      }}
    >
      <div className="grid gap-6">
        <section>
          <h3 className="font-semibold mb-2">Encode</h3>
          <AutoTextarea className="input min-h-[100px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Plain text" />
          <div className="mt-2 flex gap-2">
            <button onClick={doEncode} className="btn-primary min-tap">Encode →</button>
            {encoded && <button onClick={() => navigator.clipboard.writeText(encoded)} className="btn-ghost text-xs">Copy</button>}
          </div>
          {encoded && <AutoTextarea readOnly value={encoded} className="input min-h-[80px] font-mono text-xs mt-2" />}
        </section>

        <section>
          <h3 className="font-semibold mb-2">Decode</h3>
          <AutoTextarea className="input min-h-[100px] font-mono text-xs" value={decodeIn} onChange={(e) => setDecodeIn(e.target.value)} placeholder="Base64 string" />
          <div className="mt-2 flex gap-2">
            <button onClick={doDecode} className="btn-primary min-tap">Decode →</button>
            {decoded && <button onClick={() => navigator.clipboard.writeText(decoded)} className="btn-ghost text-xs">Copy</button>}
          </div>
          {decoded && <AutoTextarea readOnly value={decoded} className="input min-h-[80px] mt-2" />}
          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
        </section>
      </div>
    </ToolPage>
  );
}
