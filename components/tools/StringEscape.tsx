"use client";

import { useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

type Mode = "json" | "js" | "html" | "sql";

function escapeFor(mode: Mode, s: string) {
  switch (mode) {
    case "json": return JSON.stringify(s).slice(1, -1);
    case "js":   return s.replace(/[\\'"\n\r\t]/g, (c) => ({ "\\": "\\\\", "'": "\\'", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t" })[c] ?? c);
    case "html": return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
    case "sql":  return s.replace(/'/g, "''");
  }
}
function unescapeFor(mode: Mode, s: string) {
  switch (mode) {
    case "json": try { return JSON.parse(`"${s}"`); } catch { return s; }
    case "js":   return s.replace(/\\([\\'"nrt])/g, (_, c) => ({ "\\": "\\", "'": "'", '"': '"', n: "\n", r: "\r", t: "\t" })[c as string] ?? c);
    case "html": {
      const el = typeof document !== "undefined" ? document.createElement("textarea") : null;
      if (!el) return s;
      el.innerHTML = s; return el.value;
    }
    case "sql":  return s.replace(/''/g, "'");
  }
}

export default function StringEscape({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [mode, setMode] = useState<Mode>("json");
  const [text, setText] = useState(`Hello, "world"\nLine 2`);
  const escaped = escapeFor(mode, text);
  const [back, setBack] = useState(escaped);
  const unescaped = unescapeFor(mode, back);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick the target context (JSON, JavaScript, HTML, SQL). Edit the left side to escape, the right side to unescape.",
      formula: "JSON: uses JSON.stringify rules. JS: backslash-escapes quotes, backslash, and control chars. HTML: replaces &<>\"' with named entities. SQL: doubles single quotes (the standard literal-string escape).",
      examples: "JSON: She said \"hi\" becomes She said \\\"hi\\\". SQL: it's becomes it''s (single quotes doubled).",
      faq: [
        { q: "When should I use HTML escaping vs JSON escaping?", a: "Use HTML escaping when inserting user-supplied text into an HTML page to prevent XSS. Use JSON escaping when embedding strings inside JSON payloads or configuration files." },
        { q: "Why does SQL escaping only double single quotes?", a: "In standard SQL, string literals are delimited by single quotes, and a literal single quote inside a string is represented by two consecutive single quotes (''). This is defined by the SQL standard (ISO 9075)." },
        { q: "What is the difference between JS and JSON escaping?", a: "JSON escaping is a strict subset: it always uses double quotes and only escapes what the JSON spec requires. JS escaping is more permissive — it handles both single and double quotes and the same control characters." },
        { q: "Does this tool send my text anywhere?", a: "No. All escaping and unescaping happens entirely in your browser with no data sent to any server." },
      ],
    }}>
      <div className="flex gap-2 mb-3">
        {(["json", "js", "html", "sql"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setBack(escapeFor(m, text)); }} className={`min-tap rounded-xl px-3 py-2 text-sm uppercase ${mode === m ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>{m}</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        <div>
          <label className="label">Raw → Escaped</label>
          <AutoTextarea className="input min-h-[160px]" value={text} onChange={(e) => setText(e.target.value)} />
          <AutoTextarea readOnly value={escaped} className="input min-h-[120px] font-mono text-xs mt-2" />
        </div>
        <div>
          <label className="label">Escaped → Raw</label>
          <AutoTextarea className="input min-h-[160px] font-mono text-xs" value={back} onChange={(e) => setBack(e.target.value)} />
          <AutoTextarea readOnly value={unescaped} className="input min-h-[120px] mt-2" />
        </div>
      </div>
    </ToolPage>
  );
}
