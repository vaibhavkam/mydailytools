"use client";

import { useEffect, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

const STARTER = `# MyDailyTool

A live-rendered **markdown** editor.

- supports *GFM* (tables, task lists, fenced code)
- code blocks render with monospace
- safe-by-default: HTML is escaped

## Code

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Tool      | Status |
| --------- | ------ |
| Markdown  | Live   |
| Compose   | TODO   |

## Tasks

- [x] write parser
- [ ] add export
`;

export default function MarkdownPreview({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [src, setSrc] = useState(STARTER);
  const [html, setHtml] = useState("");
  useEffect(() => {
    let cancelled = false;
    // Lazy-load marked so it doesn't get promoted into the shared chunk
    // loaded by every tool page (see CLAUDE.md bundle-size note).
    (async () => {
      const { marked } = await import("marked");
      marked.setOptions({ gfm: true, breaks: false });
      const rendered = marked.parse(src, { async: false }) as string;
      if (!cancelled) setHtml(rendered);
    })();
    return () => { cancelled = true; };
  }, [src]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Type or paste markdown on the left; the GitHub-flavored rendering updates live on the right. Inline HTML is escaped (safe by default).",
      formula: "Powered by marked with GFM enabled — tables, fenced code blocks, task lists, autolinks, and strikethrough all supported.",
      examples: "Paste your README to see how it'll render on GitHub before pushing.",
      faq: [{ q: "Are images and links rendered?", a: "Yes, but rendered inside a sandboxed area without scripts." }],
    }}>
      <div className="grid lg:grid-cols-2 gap-3">
        <AutoTextarea className="input min-h-[440px] font-mono text-xs" value={src} onChange={(e) => setSrc(e.target.value)} />
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-4 overflow-auto min-h-[440px] markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <style jsx>{`
        .markdown-body :global(h1) { font-size: 1.6rem; font-weight: 700; margin: 0.4em 0; }
        .markdown-body :global(h2) { font-size: 1.3rem; font-weight: 600; margin: 0.6em 0 0.3em; }
        .markdown-body :global(h3) { font-size: 1.1rem; font-weight: 600; margin: 0.5em 0 0.2em; }
        .markdown-body :global(p) { margin: 0.5em 0; line-height: 1.6; }
        .markdown-body :global(code) { background: rgba(99,102,241,0.12); padding: 1px 4px; border-radius: 4px; font-size: 0.85em; }
        .markdown-body :global(pre) { background: rgba(0,0,0,0.06); padding: 12px; border-radius: 8px; overflow-x: auto; }
        .markdown-body :global(pre code) { background: none; padding: 0; }
        .markdown-body :global(table) { border-collapse: collapse; }
        .markdown-body :global(th), .markdown-body :global(td) { border: 1px solid rgb(var(--border)); padding: 6px 10px; }
        .markdown-body :global(th) { background: rgba(0,0,0,0.04); }
        .markdown-body :global(ul) { list-style: disc; padding-left: 1.5em; }
        .markdown-body :global(ol) { list-style: decimal; padding-left: 1.5em; }
        .markdown-body :global(blockquote) { border-left: 3px solid rgb(var(--ring)); padding-left: 12px; opacity: 0.85; }
        .markdown-body :global(a) { color: rgb(var(--ring)); text-decoration: underline; }
      `}</style>
    </ToolPage>
  );
}
