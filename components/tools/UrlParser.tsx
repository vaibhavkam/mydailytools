"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function UrlParser({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState("https://user:pass@www.example.com:8080/path/to/page?utm_source=email&utm_campaign=spring&id=42#section");
  const r = useMemo(() => {
    try {
      const u = new URL(input);
      const params = [...u.searchParams.entries()];
      return {
        protocol: u.protocol, username: u.username, password: u.password,
        hostname: u.hostname, port: u.port, pathname: u.pathname,
        search: u.search, hash: u.hash, origin: u.origin, params,
      };
    } catch { return null; }
  }, [input]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste any URL — every component (protocol, host, port, path, query, hash) is decomposed below, with each query parameter as its own row.",
      formula: "Uses the WHATWG URL parser via the browser-native URL constructor. This is the same parser browsers use to decide where to navigate.",
      examples: "https://api.example.com/v1/users?id=42&format=json → host: api.example.com, path: /v1/users, params: id=42, format=json.",
      faq: [{ q: "Are query values URL-decoded?", a: "Yes — searchParams returns decoded values. The full search string (search field) shows them encoded." }],
    }}>
      <label className="label">URL</label>
      <input className="input font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
      {!r ? <p className="mt-3 text-sm text-red-600">Invalid URL</p> : (
        <>
          <div className="mt-4 grid sm:grid-cols-2 gap-2">
            {[
              ["Protocol", r.protocol], ["Hostname", r.hostname], ["Port", r.port || "(default)"],
              ["Path", r.pathname], ["Origin", r.origin], ["Hash", r.hash || "(none)"],
              ["Username", r.username || "(none)"], ["Password", r.password ? "•••" : "(none)"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-[rgb(var(--border))] p-3">
                <div className="text-xs text-[rgb(var(--fg-muted))]">{l}</div>
                <div className="font-mono text-sm break-all">{v}</div>
              </div>
            ))}
          </div>
          {r.params.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold mb-1.5">Query parameters</div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-[rgb(var(--fg-muted))] border-b border-[rgb(var(--border))]"><th className="py-1.5">Key</th><th>Value</th></tr></thead>
                <tbody>
                  {r.params.map(([k, v], i) => (
                    <tr key={i} className="border-b border-[rgb(var(--border))]/60 font-mono text-xs">
                      <td className="py-1.5 pr-3">{k}</td><td className="break-all">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </ToolPage>
  );
}
