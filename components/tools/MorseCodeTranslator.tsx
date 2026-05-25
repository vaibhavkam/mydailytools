"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-",
  L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-",
  W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.", "@": ".--.-.",
};
const FROM_MORSE: Record<string, string> = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

export default function MorseCodeTranslator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [text, setText] = useState("Hello, World");
  const morse = useMemo(() =>
    text.toUpperCase().split("\n").map((line) =>
      line.split(" ").map((word) => [...word].map((c) => MORSE[c] ?? "").filter(Boolean).join(" ")).join(" / ")
    ).join("\n"),
  [text]);

  const [m, setM] = useState(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
  const decoded = useMemo(() =>
    m.split("\n").map((line) =>
      line.split(/ \/ /).map((word) => word.trim().split(/ +/).map((c) => FROM_MORSE[c] ?? "").join("")).join(" ")
    ).join("\n").toLowerCase(),
  [m]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Type text to encode it as Morse, or paste Morse to decode. Use space between letters and ' / ' between words.",
      formula: "International Morse Code (ITU). Letter separator is a single space; word separator is ' / '.",
      examples: "SOS = ... --- ... ; HELLO = .... . .-.. .-.. --- .",
      faq: [{ q: "Does this encode punctuation?", a: "Yes — common punctuation (. , ? ! ' / etc.) is mapped per ITU." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Text</label>
          <AutoTextarea className="input min-h-[140px]" value={text} onChange={(e) => setText(e.target.value)} />
          <AutoTextarea readOnly value={morse} className="input min-h-[100px] font-mono text-xs mt-2" />
        </div>
        <div>
          <label className="label">Morse</label>
          <AutoTextarea className="input min-h-[140px] font-mono text-xs" value={m} onChange={(e) => setM(e.target.value)} />
          <AutoTextarea readOnly value={decoded} className="input min-h-[100px] mt-2" />
        </div>
      </div>
    </ToolPage>
  );
}
