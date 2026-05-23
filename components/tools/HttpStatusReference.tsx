"use client";

import { useMemo, useState } from "react";
import { Copy, Search } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type StatusCode = {
  code: number;
  name: string;
  category: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
  rfc: string;
  summary: string;
  gotcha?: string;
};

// Hand-curated reference. The gotchas are the differentiator — every dev hits
// these distinctions, and the canonical RFC descriptions don't make them
// obvious.
const CODES: StatusCode[] = [
  // 1xx
  { code: 100, name: "Continue", category: "1xx", rfc: "RFC 9110", summary: "Server received the request headers and the client should proceed sending the body. Triggered by Expect: 100-continue header." },
  { code: 101, name: "Switching Protocols", category: "1xx", rfc: "RFC 9110", summary: "Server agrees to switch protocols (e.g. HTTP to WebSocket) per the Upgrade header." },
  { code: 103, name: "Early Hints", category: "1xx", rfc: "RFC 8297", summary: "Lets the server send preload hints before the final response — used to pre-warm fonts, scripts, etc." },

  // 2xx
  { code: 200, name: "OK", category: "2xx", rfc: "RFC 9110", summary: "Standard success. Response body contains the requested representation." },
  { code: 201, name: "Created", category: "2xx", rfc: "RFC 9110", summary: "Request succeeded and a new resource was created. Location header should point to the new resource.", gotcha: "Use for POST that creates a resource. For PUT that creates, also 201; for PUT that updates, 200 or 204." },
  { code: 202, name: "Accepted", category: "2xx", rfc: "RFC 9110", summary: "Request accepted for processing but not yet completed. Used for async jobs.", gotcha: "The response body should describe how the client can check the job's status (e.g. a polling URL)." },
  { code: 204, name: "No Content", category: "2xx", rfc: "RFC 9110", summary: "Success with no response body. Common for DELETE and for PUT that updates.", gotcha: "If you return 204, do NOT include a body — some clients (including fetch) will reject the response." },
  { code: 206, name: "Partial Content", category: "2xx", rfc: "RFC 9110", summary: "Response to a Range request — server returned only the bytes the client asked for. Used by video players and download resumption." },

  // 3xx
  { code: 301, name: "Moved Permanently", category: "3xx", rfc: "RFC 9110", summary: "Resource has permanently moved to the URL in the Location header. Search engines update their index.", gotcha: "Many clients change POST to GET when following 301. Use 308 if you need to preserve the method." },
  { code: 302, name: "Found", category: "3xx", rfc: "RFC 9110", summary: "Temporary redirect. Originally \"Moved Temporarily\".", gotcha: "Same method-changing behavior as 301 in practice. Use 307 if you specifically need to preserve POST." },
  { code: 303, name: "See Other", category: "3xx", rfc: "RFC 9110", summary: "Redirect that ALWAYS changes the request method to GET. Classic post-redirect-get pattern after form submission." },
  { code: 304, name: "Not Modified", category: "3xx", rfc: "RFC 9110", summary: "Cache hit — the version the client has (per If-Modified-Since / If-None-Match) is still current. No body returned." },
  { code: 307, name: "Temporary Redirect", category: "3xx", rfc: "RFC 9110", summary: "Like 302 but the HTTP method MUST NOT change. POST stays POST when following." },
  { code: 308, name: "Permanent Redirect", category: "3xx", rfc: "RFC 9110", summary: "Like 301 but the HTTP method MUST NOT change. The modern way to permanently redirect a POST endpoint.", gotcha: "Older clients (curl 7.x, some bots) don't support 308. Stick to 301 for max compatibility unless you specifically need to preserve POST." },

  // 4xx
  { code: 400, name: "Bad Request", category: "4xx", rfc: "RFC 9110", summary: "Request is malformed — bad JSON, missing required field, invalid syntax. The client should fix the request before retrying.", gotcha: "Don't use 400 for \"valid request but business logic rejection.\" That's 422." },
  { code: 401, name: "Unauthorized", category: "4xx", rfc: "RFC 9110", summary: "Misnamed — should be \"Unauthenticated.\" The client has not provided valid credentials.", gotcha: "401 = \"who are you?\" 403 = \"I know who you are, you can't do this.\" Confusing these breaks UX." },
  { code: 403, name: "Forbidden", category: "4xx", rfc: "RFC 9110", summary: "Client is authenticated but doesn't have permission for this resource.", gotcha: "Some APIs use 404 instead of 403 to avoid revealing which resources exist. Defensible for security-sensitive endpoints." },
  { code: 404, name: "Not Found", category: "4xx", rfc: "RFC 9110", summary: "The requested resource does not exist (or the server won't say if it does).", gotcha: "Means \"does not exist NOW.\" If a resource used to exist and is permanently gone, 410 is more accurate." },
  { code: 405, name: "Method Not Allowed", category: "4xx", rfc: "RFC 9110", summary: "The resource exists but doesn't support this HTTP method.", gotcha: "Response MUST include an Allow header listing supported methods, e.g. Allow: GET, POST." },
  { code: 406, name: "Not Acceptable", category: "4xx", rfc: "RFC 9110", summary: "Server can't produce a response matching the client's Accept header." },
  { code: 408, name: "Request Timeout", category: "4xx", rfc: "RFC 9110", summary: "Client took too long to send the full request. Server's giving up.", gotcha: "Different from 504 Gateway Timeout — that's an upstream server taking too long, not the client." },
  { code: 409, name: "Conflict", category: "4xx", rfc: "RFC 9110", summary: "Request conflicts with current state — e.g. trying to create a resource that already exists, or a version mismatch." },
  { code: 410, name: "Gone", category: "4xx", rfc: "RFC 9110", summary: "Resource permanently removed. Use instead of 404 when you want to tell crawlers and clients \"don't come back.\"", gotcha: "Google removes 410 pages from index faster than 404. Use it for deprecated endpoints you want de-indexed." },
  { code: 412, name: "Precondition Failed", category: "4xx", rfc: "RFC 9110", summary: "An If-Match / If-Unmodified-Since precondition failed. Used for optimistic concurrency control." },
  { code: 413, name: "Content Too Large", category: "4xx", rfc: "RFC 9110", summary: "Request body exceeds the server's size limit. Previously \"Payload Too Large.\"" },
  { code: 415, name: "Unsupported Media Type", category: "4xx", rfc: "RFC 9110", summary: "Request body is in a format the server doesn't accept — wrong Content-Type." },
  { code: 418, name: "I'm a Teapot", category: "4xx", rfc: "RFC 2324", summary: "Joke status from a 1998 April Fools RFC. Some services return it for blocked requests as easter eggs." },
  { code: 422, name: "Unprocessable Content", category: "4xx", rfc: "RFC 9110", summary: "Request is syntactically valid but semantically invalid — e.g. valid JSON but the values fail business rules.", gotcha: "The right code for validation errors when 400 feels too generic. Stripe, GitHub, and most modern APIs use this." },
  { code: 425, name: "Too Early", category: "4xx", rfc: "RFC 8470", summary: "Server unwilling to risk processing a request that might be replayed (used in TLS 0-RTT contexts)." },
  { code: 428, name: "Precondition Required", category: "4xx", rfc: "RFC 6585", summary: "Server requires conditional requests (If-Match etc.) to prevent lost-update problems on PUT/PATCH." },
  { code: 429, name: "Too Many Requests", category: "4xx", rfc: "RFC 6585", summary: "Rate limit exceeded. Response should include a Retry-After header.", gotcha: "Retry-After can be a number of seconds or an HTTP date. Modern clients handle both, but check what your client library does." },
  { code: 431, name: "Request Header Fields Too Large", category: "4xx", rfc: "RFC 6585", summary: "Individual header too large or total header section too large." },
  { code: 451, name: "Unavailable For Legal Reasons", category: "4xx", rfc: "RFC 7725", summary: "Resource blocked due to legal demand (court order, government censorship). The number is a Fahrenheit 451 reference." },

  // 5xx
  { code: 500, name: "Internal Server Error", category: "5xx", rfc: "RFC 9110", summary: "Generic catchall — the server hit a condition it couldn't handle. The client did nothing wrong.", gotcha: "Don't leak stack traces in production. Log the detail server-side, return a generic message." },
  { code: 501, name: "Not Implemented", category: "5xx", rfc: "RFC 9110", summary: "Server doesn't support this HTTP method at all (any URL). Different from 405, which is method-not-allowed for a specific resource." },
  { code: 502, name: "Bad Gateway", category: "5xx", rfc: "RFC 9110", summary: "Server (acting as gateway/proxy) got an invalid response from an upstream server." },
  { code: 503, name: "Service Unavailable", category: "5xx", rfc: "RFC 9110", summary: "Server is temporarily down — overloaded, in maintenance, etc. Include Retry-After if you can estimate.", gotcha: "Different from 502: 503 means the server itself is choosing not to respond; 502 means an upstream did something wrong." },
  { code: 504, name: "Gateway Timeout", category: "5xx", rfc: "RFC 9110", summary: "Server (acting as gateway) didn't get a timely response from an upstream service." },
  { code: 505, name: "HTTP Version Not Supported", category: "5xx", rfc: "RFC 9110", summary: "Server doesn't support the HTTP protocol version used in the request." },
  { code: 507, name: "Insufficient Storage", category: "5xx", rfc: "RFC 4918", summary: "Server has run out of disk space or quota to process the request (originally WebDAV)." },
  { code: 511, name: "Network Authentication Required", category: "5xx", rfc: "RFC 6585", summary: "The client needs to authenticate to gain network access — used by captive portals (\"sign in to airport WiFi\")." },
];

const CATEGORY_COLORS: Record<string, string> = {
  "1xx": "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 border-sky-300",
  "2xx": "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300",
  "3xx": "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border-amber-300",
  "4xx": "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30 border-orange-300",
  "5xx": "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border-red-300",
};

export default function HttpStatusReference({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return CODES;
    const q = query.toLowerCase();
    return CODES.filter((c) =>
      String(c.code).includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      (c.gotcha?.toLowerCase().includes(q) ?? false) ||
      c.category === q
    );
  }, [query]);

  const grouped = useMemo(() => {
    const out: Record<string, StatusCode[]> = { "1xx": [], "2xx": [], "3xx": [], "4xx": [], "5xx": [] };
    for (const c of filtered) out[c.category].push(c);
    return out;
  }, [filtered]);

  function copyCode(c: StatusCode) {
    navigator.clipboard.writeText(`${c.code} ${c.name} — ${c.summary}`);
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Browse or search HTTP status codes by number, name, or keyword. The gotchas explain the non-obvious distinctions (301 vs 308, 401 vs 403, 404 vs 410, 400 vs 422) that trip up most API designs.",
        formula: "Status codes are grouped by class: 1xx informational, 2xx success, 3xx redirect, 4xx client error, 5xx server error. RFCs cited point to the current authoritative source (mostly RFC 9110, which superseded the old 7230-7235 series in 2022).",
        examples: "Search '422' to see the right code for validation errors. Search 'redirect' to compare 301/302/307/308. Search '401' to clarify the auth-vs-permission distinction.",
        faq: [
          { q: "What's the difference between 401 and 403?", a: "401 means \"who are you?\" (unauthenticated — no valid credentials provided). 403 means \"I know who you are, but you can't do this\" (authenticated but unauthorized). Misnamed in the spec: 401 should really be called Unauthenticated." },
          { q: "When should I use 422 vs 400?", a: "400 is for syntactic problems: malformed JSON, missing required field, invalid query parameter type. 422 is for semantic problems: valid input but business logic rejects it (e.g. \"start date must be before end date\"). Stripe, GitHub, and most modern APIs use 422 for validation errors." },
          { q: "What's the difference between 301 and 308?", a: "Both are permanent redirects, but 301 historically allowed clients to change the HTTP method (POST → GET) when following. 308 explicitly preserves the method. Use 308 if your endpoint accepts POST and the new URL also expects POST." },
          { q: "Should I use 404 or 410?", a: "404 means \"does not exist now\" (might come back). 410 means \"permanently gone, don't come back.\" Google removes 410 pages from its index faster than 404 — useful for deprecating endpoints you want de-indexed quickly." },
          { q: "Why does my client get an error on 204 responses?", a: "204 means \"no content\" and forbids a response body. Some HTTP libraries (including fetch) treat any body in a 204 as a protocol error. If you're returning 204, make sure your framework isn't auto-serializing an empty object — return truly nothing." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--fg-muted))]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code (e.g. 422), name (e.g. teapot), keyword (redirect, auth, validation), or class (4xx)"
            className="input !pl-9 text-sm"
            aria-label="Search status codes"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-[rgb(var(--fg-muted))] py-8 text-center">No codes match &quot;{query}&quot;.</div>
        ) : (
          (Object.keys(grouped) as Array<keyof typeof grouped>).map((cat) =>
            grouped[cat].length === 0 ? null : (
              <div key={cat}>
                <h3 className="text-xs font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-2">{cat} — {cat === "1xx" ? "Informational" : cat === "2xx" ? "Success" : cat === "3xx" ? "Redirect" : cat === "4xx" ? "Client Error" : "Server Error"}</h3>
                <ul className="grid gap-2">
                  {grouped[cat].map((c) => (
                    <li key={c.code} className={`rounded-xl border ${CATEGORY_COLORS[c.category]} p-3`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-lg font-bold">{c.code}</span>
                          <span className="font-medium">{c.name}</span>
                          <span className="text-[10px] text-[rgb(var(--fg-muted))] uppercase">{c.rfc}</span>
                        </div>
                        <button onClick={() => copyCode(c)} className="text-xs opacity-60 hover:opacity-100" aria-label={`Copy ${c.code}`}>
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-1.5 text-sm">{c.summary}</p>
                      {c.gotcha && (
                        <p className="mt-1.5 text-xs italic opacity-80"><strong className="not-italic">Gotcha:</strong> {c.gotcha}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )
        )}
      </div>
    </ToolPage>
  );
}
