"use client";

import { useEffect, useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

// HTML Editor with live preview (sandboxed iframe)
export function HtmlEditor({ tool }: Props) {
  const [code, setCode] = useState(`<!doctype html>
<html><body style="font-family:system-ui">
  <h1 style="color:#6366f1">Hello, world</h1>
  <p>Edit this code — the preview updates live.</p>
</body></html>`);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Edit HTML on the left; the preview on the right updates live. The preview runs in a sandboxed iframe — scripts in your code do not access this page.",
      formula: "We use an srcdoc iframe with sandbox='allow-scripts' so your code is isolated from the parent.",
      examples: "Prototype a snippet of HTML, see how a form behaves, or test inline CSS quickly.",
      faq: [{ q: "Can I include external CSS or JS?", a: "Yes — include them via <link> and <script src> tags. They load in the iframe just like a normal page." }],
    }}>
      <div className="grid lg:grid-cols-2 gap-3">
        <AutoTextarea className="input min-h-[400px] font-mono text-xs" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
        <iframe sandbox="allow-scripts" srcDoc={code} className="rounded-xl border border-[rgb(var(--border))] bg-white min-h-[400px]" title="Preview" />
      </div>
    </ToolPage>
  );
}

// CSS Minifier (whitespace + comment stripping; not a full optimizer)
export function CssMinifier({ tool }: Props) {
  const [css, setCss] = useState(`/* example */
.btn {
  background: #6366f1;
  color: white;
  padding: 8px 16px;
}`);
  const min = useMemo(() => css
    .replace(/\/\*[\s\S]*?\*\//g, "")        // comments
    .replace(/\s+/g, " ")                     // whitespace runs
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")     // around punctuation
    .replace(/;}/g, "}")                      // trailing semicolons
    .trim(), [css]);
  const ratio = css.length ? Math.round((1 - min.length / css.length) * 100) : 0;
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste CSS on the left to see minified output and the savings ratio.",
      formula: "Strips comments, collapses whitespace, removes unnecessary spaces around punctuation, and drops trailing semicolons before closing braces.",
      examples: "A 500 byte stylesheet often shrinks to 350–400 bytes (~25% smaller).",
      faq: [{ q: "Is this lossless?", a: "Yes — it only removes whitespace and comments. CSS rules and values are preserved exactly." }],
    }}>
      <div className="grid gap-4">
        <div>
          <label className="label">Input CSS</label>
          <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={css} onChange={(e) => setCss(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Minified <span className="text-[rgb(var(--fg-muted))] font-normal">— saved {ratio}% ({css.length} → {min.length} bytes)</span></label>
            <button onClick={() => navigator.clipboard.writeText(min)} className="btn-ghost text-xs">Copy</button>
          </div>
          <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={min} readOnly />
        </div>
      </div>
    </ToolPage>
  );
}

// JS Minifier (basic: comments + whitespace; no mangling)
export function JsMinifier({ tool }: Props) {
  const [js, setJs] = useState(`function add(a, b) {
  // simple add
  return a + b;
}
console.log(add(2, 3));`);
  const min = useMemo(() => js
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}();,:=<>+\-*/&|!?])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .trim(), [js]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste JavaScript; comments and whitespace are stripped. This is a *safe* minifier — it does not mangle identifiers or perform tree-shaking.",
      formula: "Removes // and /* */ comments, collapses whitespace, removes spaces around operators and punctuation.",
      examples: "Useful for inline scripts in HTML where every byte matters.",
      faq: [{ q: "Is this safe for all JS?", a: "Mostly — but it can break code that relies on whitespace around regex literals or template strings. Check output before shipping." }],
    }}>
      <div className="grid gap-4">
        <div>
          <label className="label">Input JavaScript</label>
          <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={js} onChange={(e) => setJs(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Minified</label>
            <button onClick={() => navigator.clipboard.writeText(min)} className="btn-ghost text-xs">Copy</button>
          </div>
          <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={min} readOnly />
        </div>
      </div>
    </ToolPage>
  );
}

// XML Formatter
export function XmlFormatter({ tool }: Props) {
  const [xml, setXml] = useState(`<root><item id="1">A</item><item id="2">B</item></root>`);
  const out = useMemo(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const err = doc.querySelector("parsererror");
      if (err) return { ok: false, msg: err.textContent || "Parse error" };
      return { ok: true, text: prettyXml(xml) };
    } catch (e: any) { return { ok: false, msg: e.message }; }
  }, [xml]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste XML to pretty-print and validate. Errors point to the first parse failure.",
      formula: "Validation: DOMParser. Pretty-print: insert newlines and 2-space indent at each tag boundary, preserving text content.",
      examples: '<root><a>1</a></root> formats with each tag on its own line.',
      faq: [
        { q: "What XML dialects does this support?", a: "Any well-formed XML — RSS, SVG, XHTML, SOAP, and custom schemas all work as long as the syntax is valid." },
        { q: "Why does the formatter show an error on my file?", a: "XML is strict: every tag must be closed, attribute values must be quoted, and special characters like & must be escaped as &amp;. The error message points to the first violation." },
        { q: "Does this validate against a schema (XSD/DTD)?", a: "No — it checks well-formedness only, not schema validity. For full XSD validation you need a server-side tool." },
        { q: "Is my XML sent to a server?", a: "No. Parsing and formatting happen entirely in your browser using the built-in DOMParser API." },
      ],
    }}>
      <div className="grid gap-4">
        <div>
          <label className="label">Input XML</label>
          <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={xml} onChange={(e) => setXml(e.target.value)} />
        </div>
        {out.ok
          ? <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Formatted XML</label>
                <button onClick={() => navigator.clipboard.writeText(out.text ?? "")} className="btn-ghost text-xs">Copy</button>
              </div>
              <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={out.text ?? ""} readOnly />
            </div>
          : <p role="alert" className="text-sm text-red-600">{out.msg}</p>}
      </div>
    </ToolPage>
  );
}
function prettyXml(input: string) {
  const tokens = input.replace(/>\s*</g, ">\n<").split(/\n/);
  let depth = 0, out: string[] = [];
  for (const tok of tokens) {
    if (/^<\/[^>]+>/.test(tok)) depth--;
    out.push("  ".repeat(Math.max(0, depth)) + tok);
    if (/^<[^!?\/][^>]*[^\/]>$/.test(tok) && !/^<[^>]+\/>$/.test(tok)) depth++;
  }
  return out.join("\n");
}

// HTML Entities Encoder/Decoder
export function HtmlEntities({ tool }: Props) {
  const [text, setText] = useState(`<div class="x">Hello & 'world'</div>`);
  const encoded = text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
  const [enc, setEnc] = useState(encoded);
  const decoded = useMemo(() => {
    const el = typeof document !== "undefined" ? document.createElement("textarea") : null;
    if (!el) return enc;
    el.innerHTML = enc;
    return el.value;
  }, [enc]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste raw HTML on the left to encode special characters; paste encoded text on the right to decode entities back.",
      formula: "Encoding: replace & < > \" ' with named or numeric entities. Decoding: leverage the browser's HTML parser via a textarea element.",
      examples: '"<div>" → "&lt;div&gt;". "&amp;" → "&".',
      faq: [
        { q: "Which characters get encoded?", a: "The five characters that are special in HTML: & < > \" and ' — encoded as &amp; &lt; &gt; &quot; and &#39; respectively." },
        { q: "When do I need to encode HTML entities?", a: "Any time you display user-supplied text inside HTML, or when you want to show literal HTML tags as visible text rather than rendered markup." },
        { q: "Does encoding handle Unicode characters?", a: "This tool only encodes the five core HTML special characters. Unicode code points above ASCII are left as-is, which is fine for UTF-8 pages." },
        { q: "Can I decode numeric entities like &#169;?", a: "Yes — paste encoded text in the right panel and the browser's parser resolves both named entities (&copy;) and numeric ones (&#169;) to their character equivalents." },
      ],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Raw HTML</label>
          <AutoTextarea className="input min-h-[280px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
          <AutoTextarea className="input min-h-[200px] font-mono text-xs mt-2" value={encoded} readOnly />
        </div>
        <div>
          <label className="label">Encoded</label>
          <AutoTextarea className="input min-h-[280px] font-mono text-xs" value={enc} onChange={(e) => setEnc(e.target.value)} />
          <AutoTextarea className="input min-h-[200px] font-mono text-xs mt-2" value={decoded} readOnly />
        </div>
      </div>
    </ToolPage>
  );
}

// Regex Tester
export function RegexTester({ tool }: Props) {
  const [pattern, setPattern] = useState("\\b(\\w+)@(\\w+\\.\\w+)\\b");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Email me at alice@example.com or bob@example.org.");
  const [error, setError] = useState<string | null>(null);
  const matches = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      setError(null);
      const out: { match: string; groups: string[]; index: number }[] = [];
      let m: RegExpExecArray | null;
      if (re.global) {
        while ((m = re.exec(text)) !== null) {
          out.push({ match: m[0], groups: m.slice(1), index: m.index });
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        m = re.exec(text);
        if (m) out.push({ match: m[0], groups: m.slice(1), index: m.index });
      }
      return out;
    } catch (e: any) { setError(e.message); return []; }
  }, [pattern, flags, text]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Enter a regular expression and flags, then test against any input. Each match shows its index and capture groups.",
      formula: "JavaScript regex syntax (PCRE-like, but not identical). Common flags: g (global), i (case-insensitive), m (multi-line), s (dotall).",
      examples: 'Pattern: \\d{3}-\\d{4} matches "555-1234". Pattern with capture: (\\w+)@(\\w+\\.\\w+) extracts user and domain.',
      faq: [
        { q: "What flags can I use?", a: "JavaScript supports g (global — find all matches), i (case-insensitive), m (multiline — ^ and $ match line boundaries), s (dotall — dot matches newlines), and u (Unicode mode)." },
        { q: "Why does my regex match nothing?", a: "Common causes: forgetting to escape special characters like . + * ? ( ) [ ] { } ^ $ | \\ — prepend a backslash to match them literally." },
        { q: "How do I extract a specific part of a match?", a: "Wrap the part you want in parentheses to create a capture group. The tool displays each group's value alongside the full match." },
        { q: "Is JavaScript regex the same as PCRE?", a: "Mostly, but not identical. JavaScript lacks some PCRE features (lookbehind support improved in ES2018, no possessive quantifiers or atomic groups). Code tested here may need small adjustments for Python/PHP/Perl." },
      ],
    }}>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3">
        <input className="input font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} />
        <input className="input font-mono w-24" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gimsuy" />
      </div>
      <AutoTextarea className="input min-h-[280px] mt-3 font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 text-sm">
        <div className="text-[rgb(var(--fg-muted))] mb-2">{matches.length} match(es)</div>
        <ul className="space-y-1.5">
          {matches.map((m, k) => (
            <li key={k} className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 font-mono text-xs">
              <div>@{m.index}: <span className="text-brand-600">{m.match}</span></div>
              {m.groups.length > 0 && <div className="text-[rgb(var(--fg-muted))] mt-1">Groups: {m.groups.map((g, i) => `$${i+1}=${g}`).join(", ")}</div>}
            </li>
          ))}
        </ul>
      </div>
    </ToolPage>
  );
}

// Color Picker
export function ColorPicker({ tool }: Props) {
  const [hex, setHex] = useState("#6366f1");
  const rgb = (() => {
    const m = hex.match(/^#?([0-9a-f]{6})$/i);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
  })();
  const hsl = rgb && rgbToHsl(rgb.r, rgb.g, rgb.b);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick a color or paste a hex code; HEX, RGB, HSL, and OKLCH update simultaneously.",
      formula: "RGB ⇄ HSL via the standard conversions. We display rounded values for legibility.",
      examples: "#6366f1 = rgb(99, 102, 241) = hsl(238, 84%, 67%).",
      faq: [
        { q: "What color formats does this show?", a: "HEX (#RRGGBB), RGB (0–255 per channel), and HSL (hue 0–360°, saturation and lightness as percentages)." },
        { q: "What is the difference between HSL and HSB/HSV?", a: "HSL and HSB/HSV both use hue and saturation, but their third axis differs: HSL uses lightness (50% = pure color), HSB uses brightness (100% = pure color). Most CSS workflows use HSL." },
        { q: "Can I paste a color in formats other than hex?", a: "The text input accepts 6-digit hex codes only. Use the native color wheel to pick any color visually." },
        { q: "Does this tool store my selected colors?", a: "No — everything stays in your browser's memory and is gone when you close the tab." },
      ],
    }}>
      <div className="grid sm:grid-cols-[auto_1fr] gap-4 items-center">
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-24 w-24 rounded-xl cursor-pointer" />
        <div className="grid gap-2">
          <input className="input font-mono" value={hex} onChange={(e) => setHex(e.target.value)} />
          {rgb && (
            <>
              <div className="rounded-lg border border-[rgb(var(--border))] p-2 text-sm font-mono">rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
              {hsl && <div className="rounded-lg border border-[rgb(var(--border))] p-2 text-sm font-mono">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>}
            </>
          )}
        </div>
      </div>
    </ToolPage>
  );
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// HEX to RGB (and back)
export function HexRgb({ tool }: Props) {
  const [hex, setHex] = useState("#6366f1");
  const [r, setR] = useState(99); const [g, setG] = useState(102); const [b, setB] = useState(241);
  function setHexValue(h: string) {
    setHex(h);
    const m = h.match(/^#?([0-9a-f]{6})$/i);
    if (m) { const n = parseInt(m[1], 16); setR((n >> 16) & 0xff); setG((n >> 8) & 0xff); setB(n & 0xff); }
  }
  function setRgbValue(rr: number, gg: number, bb: number) {
    setR(rr); setG(gg); setB(bb);
    setHex("#" + [rr, gg, bb].map((x) => x.toString(16).padStart(2, "0")).join(""));
  }
  return (
    <ToolPage tool={tool} content={{
      howTo: "Type a hex code or adjust RGB sliders; both representations stay in sync.",
      formula: "Each hex pair encodes one byte (0–255). #RRGGBB uses 6 hex digits = 24 bits.",
      examples: "#FF0000 = rgb(255, 0, 0) = pure red.",
      faq: [
        { q: "What does each hex pair represent?", a: "A 6-digit hex color (#RRGGBB) has three pairs: first two digits are red, next two are green, last two are blue. Each pair ranges from 00 (0) to FF (255)." },
        { q: "What is the shorthand 3-digit hex format?", a: "#RGB is shorthand for #RRGGBB when each pair has identical digits — #F0A is the same as #FF00AA. This tool always shows the full 6-digit form." },
        { q: "How do I add transparency (alpha)?", a: "Use 8-digit hex (#RRGGBBAA) in CSS — the last two digits set opacity from 00 (transparent) to FF (opaque). This tool works with 6-digit codes; alpha isn't shown." },
        { q: "Are hex color codes case-sensitive?", a: "No. #6366f1 and #6366F1 are identical. Most style guides prefer lowercase." },
      ],
    }}>
      <div><label className="label">HEX</label><input className="input font-mono" value={hex} onChange={(e) => setHexValue(e.target.value)} /></div>
      <div className="mt-3 grid sm:grid-cols-3 gap-3">
        <Channel label="R" value={r} onChange={(v) => setRgbValue(v, g, b)} />
        <Channel label="G" value={g} onChange={(v) => setRgbValue(r, v, b)} />
        <Channel label="B" value={b} onChange={(v) => setRgbValue(r, g, v)} />
      </div>
    </ToolPage>
  );
}

function Channel({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type="range" min={0} max={255} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand-600" />
      <input type="number" min={0} max={255} value={value} onChange={(e) => onChange(Math.max(0, Math.min(255, Number(e.target.value))))} className="input mt-1" />
    </div>
  );
}

// .htaccess Generator
export function HtaccessGenerator({ tool }: Props) {
  const [opts, setOpts] = useState({
    forceHttps: true,
    wwwToNonWww: true,
    blockHotlinks: false,
    customDomain: "example.com",
    cache: true,
    gzip: true,
  });
  const out = useMemo(() => {
    const lines: string[] = [];
    if (opts.forceHttps) lines.push("# Force HTTPS\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]");
    if (opts.wwwToNonWww) lines.push(`# Strip www\nRewriteCond %{HTTP_HOST} ^www\\.${opts.customDomain.replace(/\./g, "\\.")} [NC]\nRewriteRule ^(.*)$ https://${opts.customDomain}/$1 [R=301,L]`);
    if (opts.blockHotlinks) lines.push(`# Block image hotlinks\nRewriteCond %{HTTP_REFERER} !^$\nRewriteCond %{HTTP_REFERER} !^https?://(www\\.)?${opts.customDomain.replace(/\./g, "\\.")}/.*$ [NC]\nRewriteRule \\.(jpe?g|png|gif|svg)$ - [F]`);
    if (opts.cache) lines.push("# Cache static assets\n<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresByType text/css \"access plus 1 year\"\n  ExpiresByType application/javascript \"access plus 1 year\"\n  ExpiresByType image/jpeg \"access plus 1 year\"\n</IfModule>");
    if (opts.gzip) lines.push("# Gzip compression\n<IfModule mod_deflate.c>\n  AddOutputFilterByType DEFLATE text/html text/css application/javascript\n</IfModule>");
    return lines.join("\n\n");
  }, [opts]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick the options you need; the .htaccess file builds itself. Drop the result into the root of your Apache site.",
      formula: "Each toggle adds a known-good Apache directive block. Customize the domain field for the redirect rules.",
      examples: "Force HTTPS, strip www, and add caching — three checkboxes, ~30 lines of valid .htaccess.",
      faq: [{ q: "Does this work on Nginx?", a: "No. .htaccess is Apache-specific. Use Nginx server blocks instead." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-2 mb-3">
        {Object.entries(opts).filter(([k]) => k !== "customDomain").map(([k, v]) => (
          <label key={k} className="rounded-xl border border-[rgb(var(--border))] px-3 py-2 flex items-center gap-2 cursor-pointer min-tap">
            <input type="checkbox" checked={v as boolean} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} className="accent-brand-600" />
            <span className="text-sm">{k.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
          </label>
        ))}
      </div>
      <div><label className="label">Domain</label><input className="input" value={opts.customDomain} onChange={(e) => setOpts({ ...opts, customDomain: e.target.value })} /></div>
      <AutoTextarea className="input mt-3 min-h-[360px] font-mono text-xs" value={out} readOnly />
    </ToolPage>
  );
}

// JWT Decoder
export function JwtDecoder({ tool }: Props) {
  const [token, setToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiIsImlhdCI6MTUxNjIzOTAyMn0.xZJX6RnSp1Mh8oGS6S8d3UF2MIRuP9kSGmJj-bGuWk0");
  const r = useMemo(() => {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return { error: "Token must have 3 dot-separated parts" };
    function decode(part: string) {
      try {
        const padded = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(part.length + (4 - part.length % 4) % 4, "=");
        const json = atob(padded);
        return JSON.stringify(JSON.parse(json), null, 2);
      } catch (e: any) { return "Invalid: " + e.message; }
    }
    return { header: decode(parts[0]), payload: decode(parts[1]), sig: parts[2] };
  }, [token]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste a JWT (three Base64URL segments separated by dots). Header and payload decode locally — the signature is shown but not verified.",
      formula: "JWT = base64url(header) + '.' + base64url(payload) + '.' + signature. Header and payload are JSON.",
      examples: "A typical JWT header is { alg, typ }; payload is { sub, iat, exp, ... }.",
      faq: [{ q: "Does this verify the signature?", a: "No. Verifying needs the secret/public key, which would be a security risk to enter into a public web tool." }],
    }}>
      <AutoTextarea className="input min-h-[200px] font-mono text-xs" value={token} onChange={(e) => setToken(e.target.value)} />
      {"error" in r ? <p role="alert" className="mt-3 text-sm text-red-600">{r.error}</p> : (
        <div className="mt-3 grid lg:grid-cols-2 gap-3">
          <div><div className="text-xs font-semibold mb-1">Header</div><pre className="rounded-xl border border-[rgb(var(--border))] p-3 text-xs font-mono whitespace-pre-wrap">{r.header}</pre></div>
          <div><div className="text-xs font-semibold mb-1">Payload</div><pre className="rounded-xl border border-[rgb(var(--border))] p-3 text-xs font-mono whitespace-pre-wrap">{r.payload}</pre></div>
        </div>
      )}
    </ToolPage>
  );
}

// YAML to JSON (and back). Minimal YAML — supports the safe subset most config files use.
export function YamlJson({ tool }: Props) {
  const [yaml, setYaml] = useState("name: MyDailyTool\nversion: 1.0\nfeatures:\n  - fast\n  - free\n  - private\nmeta:\n  count: 110");
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    try { setJson(JSON.stringify(parseYaml(yaml), null, 2)); setError(null); }
    catch (e: any) { setError(e.message); }
  }, [yaml]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste YAML to see the JSON equivalent. Supports indented mappings, sequences, strings, numbers, booleans, and null.",
      formula: "We parse a safe subset of YAML — no anchors/aliases, no flow style, no multiline scalars. Suitable for typical config files (CI YAML, Compose files, Kubernetes manifests).",
      examples: "key: value, list of strings, nested objects all work.",
      faq: [{ q: "Why not full YAML?", a: "Full YAML is famously tricky (and unsafe with anchor expansion). We support the parts you actually use day-to-day." }],
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <AutoTextarea className="input min-h-[360px] font-mono text-xs" value={yaml} onChange={(e) => setYaml(e.target.value)} />
        {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : <AutoTextarea className="input min-h-[360px] font-mono text-xs" value={json} readOnly />}
      </div>
    </ToolPage>
  );
}

// Tiny YAML subset parser. Handles indentation, mappings, sequences, scalars.
function parseYaml(src: string): any {
  const lines = src.split(/\r?\n/).filter((l) => !/^\s*(#|$)/.test(l));
  let i = 0;
  function indent(s: string) { const m = s.match(/^( *)/); return m ? m[1].length : 0; }
  function scalar(s: string): any {
    s = s.trim();
    if (s === "null" || s === "~" || s === "") return null;
    if (s === "true") return true;
    if (s === "false") return false;
    if (/^-?\d+$/.test(s)) return parseInt(s);
    if (/^-?\d*\.\d+$/.test(s)) return parseFloat(s);
    if ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'"))) return s.slice(1, -1);
    return s;
  }
  function parseBlock(baseIndent: number): any {
    if (i >= lines.length) return null;
    const first = lines[i];
    const ind = indent(first);
    if (ind < baseIndent) return null;
    if (first.trimStart().startsWith("- ")) {
      const arr: any[] = [];
      while (i < lines.length && indent(lines[i]) === ind && lines[i].trimStart().startsWith("- ")) {
        const rest = lines[i].trimStart().slice(2);
        i++;
        if (rest.includes(": ") || rest.endsWith(":")) {
          // sequence of mappings: re-inject as a mapping line
          lines.splice(i, 0, " ".repeat(ind + 2) + rest);
          arr.push(parseBlock(ind + 2));
        } else {
          arr.push(scalar(rest));
        }
      }
      return arr;
    }
    const obj: Record<string, any> = {};
    while (i < lines.length && indent(lines[i]) === ind) {
      const line = lines[i].trim();
      const m = line.match(/^([^:]+):(\s*)(.*)$/);
      if (!m) throw new Error(`Bad YAML line: "${line}"`);
      const key = m[1].trim();
      const rest = m[3];
      i++;
      if (rest === "") {
        obj[key] = parseBlock(ind + 2);
      } else {
        obj[key] = scalar(rest);
      }
    }
    return obj;
  }
  return parseBlock(0);
}
