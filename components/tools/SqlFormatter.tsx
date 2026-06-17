"use client";

import { useEffect, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

const DIALECTS = ["sql", "postgresql", "mysql", "mariadb", "sqlite", "bigquery", "redshift", "snowflake", "tsql", "trino", "spark", "db2"] as const;
type Dialect = typeof DIALECTS[number];

export default function SqlFormatter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [src, setSrc] = useState("select id,name,email from users where active=1 and created_at>'2024-01-01' order by created_at desc limit 50;");
  const [dialect, setDialect] = useState<Dialect>("postgresql");
  const [tabWidth, setTabWidth] = useState(2);
  const [uppercase, setUppercase] = useState(true);

  const [out, setOut] = useState("");
  useEffect(() => {
    let cancelled = false;
    // Lazy-load sql-formatter so it doesn't get promoted into the shared chunk
    // loaded by every tool page (see CLAUDE.md bundle-size note).
    (async () => {
      try {
        const { format: sqlFormat } = await import("sql-formatter");
        const formatted = sqlFormat(src, { language: dialect, tabWidth, keywordCase: uppercase ? "upper" : "preserve" });
        if (!cancelled) setOut(formatted);
      } catch (e: any) {
        if (!cancelled) setOut(e.message || "Failed to format");
      }
    })();
    return () => { cancelled = true; };
  }, [src, dialect, tabWidth, uppercase]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick the dialect that matches your database, paste the SQL, and the formatted version updates instantly.",
      formula: "Uses sql-formatter, a syntax-aware SQL beautifier supporting 12 dialects. Keyword case and indentation are configurable.",
      examples: "Inline 200-char queries become readable multi-line statements with consistent indent.",
      faq: [
        { q: "Which dialect should I pick?", a: "Match your database. 'sql' is generic ANSI; 'postgresql' is a safe default for unknown dialects." },
        { q: "Does this run my SQL?", a: "No — it only formats. Nothing is sent anywhere." },
      ],
    }}>
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <div><label className="label">Dialect</label>
          <select className="input" value={dialect} onChange={(e) => setDialect(e.target.value as Dialect)}>
            {DIALECTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div><label className="label">Indent</label>
          <select className="input" value={tabWidth} onChange={(e) => setTabWidth(Number(e.target.value))}>
            <option value={2}>2 spaces</option><option value={4}>4 spaces</option>
          </select>
        </div>
        <label className="flex items-end gap-2 text-sm pb-2"><input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="accent-brand-600" /> Uppercase keywords</label>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        <AutoTextarea className="input min-h-[300px] font-mono text-xs" value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} />
        <AutoTextarea className="input min-h-[300px] font-mono text-xs" value={out} readOnly />
      </div>
    </ToolPage>
  );
}
