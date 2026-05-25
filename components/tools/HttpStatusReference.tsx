"use client";

import { useMemo, useState } from "react";
import { Copy, Search } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { safeCopy } from "@/lib/clipboard";

type StatusCode = {
  code: number;
  name: string;
  category: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
  rfc: string;
  summary: string;
  gotcha?: string;
  // Detail fields shown in the expandable disclosure.
  whenToReturn?: string;       // Guidance for API designers — when YOU should send this.
  example?: string;            // A realistic HTTP response (multi-line, monospace).
  relatedCodes?: number[];     // Codes worth comparing — rendered as scrolling chips.
  rare?: boolean;              // True for codes most devs never see in practice.
};

// Hand-curated reference. Summary + gotcha give the at-a-glance view;
// whenToReturn + example + relatedCodes power the expandable detail panel.
// Curated based on what API designers actually need when picking a code, not
// the full RFC text (which is one click away via the cited RFC).
const CODES: StatusCode[] = [
  // 1xx informational
  {
    code: 100, name: "Continue", category: "1xx", rfc: "RFC 9110",
    summary: "Server received the request headers and the client should proceed sending the body. Triggered by Expect: 100-continue header.",
    whenToReturn: "Almost never manually — your HTTP framework handles this automatically when a client sends Expect: 100-continue. You'd only emit it yourself in low-level proxy code.",
    example: "HTTP/1.1 100 Continue",
    relatedCodes: [101, 103],
  },
  {
    code: 101, name: "Switching Protocols", category: "1xx", rfc: "RFC 9110",
    summary: "Server agrees to switch protocols (e.g. HTTP to WebSocket) per the Upgrade header.",
    whenToReturn: "When implementing a WebSocket server or HTTP/2 upgrade. Almost always emitted by a library, not your code.",
    example: "HTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=",
    relatedCodes: [100, 426],
  },
  {
    code: 102, name: "Processing", category: "1xx", rfc: "RFC 2518",
    summary: "WebDAV interim response indicating the server is still working on the request. Deprecated by RFC 4918.",
    rare: true,
    whenToReturn: "Don't. It's WebDAV-specific and effectively obsolete — use 202 Accepted for async work.",
    relatedCodes: [202, 103],
  },
  {
    code: 103, name: "Early Hints", category: "1xx", rfc: "RFC 8297",
    summary: "Lets the server send preload hints before the final response — used to pre-warm fonts, scripts, etc.",
    whenToReturn: "When you know the final response will need specific assets (CSS, fonts, scripts) but computing it will take time. Lets the browser start fetching those while your server thinks. Supported by Cloudflare, Fastly, modern browsers.",
    example: "HTTP/1.1 103 Early Hints\nLink: </styles.css>; rel=preload; as=style\nLink: </app.js>; rel=preload; as=script\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n...",
    relatedCodes: [100, 200],
  },

  // 2xx success
  {
    code: 200, name: "OK", category: "2xx", rfc: "RFC 9110",
    summary: "Standard success. Response body contains the requested representation.",
    whenToReturn: "For successful GET (returning the resource), successful PUT/PATCH that updates an existing resource (and you want to return the new state), and most other happy-path responses that have a body.",
    example: 'HTTP/1.1 200 OK\nContent-Type: application/json\nContent-Length: 42\n\n{"id":1,"name":"Alice","email":"a@ex.com"}',
    relatedCodes: [201, 204, 206],
  },
  {
    code: 201, name: "Created", category: "2xx", rfc: "RFC 9110",
    summary: "Request succeeded and a new resource was created. Location header should point to the new resource.",
    gotcha: "Use for POST that creates a resource. For PUT that creates, also 201; for PUT that updates, 200 or 204.",
    whenToReturn: "After a POST or PUT that creates a new resource. Always include the Location header pointing to the new URL; optionally include the new resource in the body.",
    example: 'HTTP/1.1 201 Created\nLocation: /api/users/42\nContent-Type: application/json\n\n{"id":42,"name":"Alice"}',
    relatedCodes: [200, 202, 204],
  },
  {
    code: 202, name: "Accepted", category: "2xx", rfc: "RFC 9110",
    summary: "Request accepted for processing but not yet completed. Used for async jobs.",
    gotcha: "The response body should describe how the client can check the job's status (e.g. a polling URL).",
    whenToReturn: "For long-running operations you've queued — video transcoding, report generation, batch jobs. Return immediately with a status URL the client can poll.",
    example: 'HTTP/1.1 202 Accepted\nContent-Type: application/json\nLocation: /api/jobs/abc123\n\n{"jobId":"abc123","status":"queued","statusUrl":"/api/jobs/abc123"}',
    relatedCodes: [201, 200, 102],
  },
  {
    code: 203, name: "Non-Authoritative Information", category: "2xx", rfc: "RFC 9110",
    summary: "Success, but the response was modified by an intermediary (typically a transforming proxy).",
    rare: true,
    whenToReturn: "Almost never from application code — used by transforming proxies. If you're writing a proxy that strips ads or modifies content, set this instead of 200.",
    relatedCodes: [200],
  },
  {
    code: 204, name: "No Content", category: "2xx", rfc: "RFC 9110",
    summary: "Success with no response body. Common for DELETE and for PUT that updates.",
    gotcha: "If you return 204, do NOT include a body — some clients (including fetch) will reject the response.",
    whenToReturn: "After a successful DELETE, or PUT/PATCH where you don't need to return the updated state. Also for endpoints called for side effects (form submissions, telemetry events) where the response body would be wasted bandwidth.",
    example: "HTTP/1.1 204 No Content\nDate: Sun, 24 May 2026 12:00:00 GMT\n(no body)",
    relatedCodes: [200, 205],
  },
  {
    code: 205, name: "Reset Content", category: "2xx", rfc: "RFC 9110",
    summary: "Success; tells the client to reset the document view (e.g. clear a form after submission).",
    rare: true,
    whenToReturn: "Browser form submissions where you want the form cleared but no page reload. Rarely used in modern web apps — JS handles this client-side.",
    relatedCodes: [204, 303],
  },
  {
    code: 206, name: "Partial Content", category: "2xx", rfc: "RFC 9110",
    summary: "Response to a Range request — server returned only the bytes the client asked for. Used by video players and download resumption.",
    whenToReturn: "When you support Range requests on large files (videos, downloads, large datasets) and the client sent a Range header. Required to support seeking in HTML5 video.",
    example: "HTTP/1.1 206 Partial Content\nContent-Type: video/mp4\nContent-Range: bytes 1024-2047/100000\nContent-Length: 1024\n\n(binary bytes 1024-2047)",
    relatedCodes: [200, 416],
  },
  {
    code: 226, name: "IM Used", category: "2xx", rfc: "RFC 3229",
    summary: "Response represents a delta from a previous state, not the full resource. Niche to specific replication protocols.",
    rare: true,
    whenToReturn: "Don't, unless you're implementing RFC 3229 delta encoding. Not supported by mainstream clients.",
    relatedCodes: [200, 304],
  },

  // 3xx redirects
  {
    code: 300, name: "Multiple Choices", category: "3xx", rfc: "RFC 9110",
    summary: "The requested resource has multiple representations and the user/client should pick one.",
    rare: true,
    whenToReturn: "Rarely — modern content negotiation uses Accept headers and 200/406 instead. Some servers use this for language picker pages.",
    relatedCodes: [406, 301, 303],
  },
  {
    code: 301, name: "Moved Permanently", category: "3xx", rfc: "RFC 9110",
    summary: "Resource has permanently moved to the URL in the Location header. Search engines update their index.",
    gotcha: "Many clients change POST to GET when following 301. Use 308 if you need to preserve the method.",
    whenToReturn: "When a URL has permanently changed and you want SEO to follow. Use for renamed pages, restructured URL paths, http→https redirects. Crawlers will update their index over time.",
    example: "HTTP/1.1 301 Moved Permanently\nLocation: https://example.com/new-path\nContent-Length: 0",
    relatedCodes: [302, 307, 308, 410],
  },
  {
    code: 302, name: "Found", category: "3xx", rfc: "RFC 9110",
    summary: "Temporary redirect. Originally \"Moved Temporarily\".",
    gotcha: "Same method-changing behavior as 301 in practice. Use 307 if you specifically need to preserve POST.",
    whenToReturn: "When the redirect is temporary — A/B test variants, maintenance pages, geo-redirects. Crawlers won't update their index.",
    example: "HTTP/1.1 302 Found\nLocation: /login\nSet-Cookie: returnTo=/dashboard; Path=/",
    relatedCodes: [301, 303, 307],
  },
  {
    code: 303, name: "See Other", category: "3xx", rfc: "RFC 9110",
    summary: "Redirect that ALWAYS changes the request method to GET. Classic post-redirect-get pattern after form submission.",
    whenToReturn: "After a successful POST when you want the browser to GET a result page (post-redirect-get pattern, prevents form re-submission on refresh).",
    example: "HTTP/1.1 303 See Other\nLocation: /orders/12345/confirmation",
    relatedCodes: [302, 307, 200],
  },
  {
    code: 304, name: "Not Modified", category: "3xx", rfc: "RFC 9110",
    summary: "Cache hit — the version the client has (per If-Modified-Since / If-None-Match) is still current. No body returned.",
    whenToReturn: "Automatically by your framework or CDN when the client's If-None-Match or If-Modified-Since matches the resource's current ETag/Last-Modified. You rarely write this manually.",
    example: "HTTP/1.1 304 Not Modified\nETag: \"abc123\"\nCache-Control: max-age=3600\n(no body)",
    relatedCodes: [200, 412],
  },
  {
    code: 307, name: "Temporary Redirect", category: "3xx", rfc: "RFC 9110",
    summary: "Like 302 but the HTTP method MUST NOT change. POST stays POST when following.",
    whenToReturn: "Temporary redirects where the client must re-submit the same method (e.g. POST forwarded to a regional endpoint). Common in API gateways.",
    example: "HTTP/1.1 307 Temporary Redirect\nLocation: https://eu-api.example.com/v1/orders",
    relatedCodes: [302, 308, 303],
  },
  {
    code: 308, name: "Permanent Redirect", category: "3xx", rfc: "RFC 9110",
    summary: "Like 301 but the HTTP method MUST NOT change. The modern way to permanently redirect a POST endpoint.",
    gotcha: "Older clients (curl 7.x, some bots) don't support 308. Stick to 301 for max compatibility unless you specifically need to preserve POST.",
    whenToReturn: "Permanent redirects on API endpoints where POST/PUT/DELETE bodies must be re-sent. Use 301 instead for browser-facing pages where method-preservation doesn't matter.",
    example: "HTTP/1.1 308 Permanent Redirect\nLocation: /api/v2/users",
    relatedCodes: [301, 307],
  },

  // 4xx client errors
  {
    code: 400, name: "Bad Request", category: "4xx", rfc: "RFC 9110",
    summary: "Request is malformed — bad JSON, missing required field, invalid syntax. The client should fix the request before retrying.",
    gotcha: "Don't use 400 for \"valid request but business logic rejection.\" That's 422.",
    whenToReturn: "When the request itself is broken: malformed JSON, missing required parameter, invalid query string. Use 422 instead when the syntax is fine but the values fail business rules.",
    example: 'HTTP/1.1 400 Bad Request\nContent-Type: application/json\n\n{"error":"Invalid JSON: unexpected token at position 14"}',
    relatedCodes: [422, 415, 411],
  },
  {
    code: 401, name: "Unauthorized", category: "4xx", rfc: "RFC 9110",
    summary: "Misnamed — should be \"Unauthenticated.\" The client has not provided valid credentials.",
    gotcha: "401 = \"who are you?\" 403 = \"I know who you are, you can't do this.\" Confusing these breaks UX.",
    whenToReturn: "When no credentials were sent, the token is missing/expired/malformed, or the API key is invalid. Always include a WWW-Authenticate header indicating how to authenticate.",
    example: 'HTTP/1.1 401 Unauthorized\nWWW-Authenticate: Bearer realm="api"\nContent-Type: application/json\n\n{"error":"Token expired","authUrl":"/login"}',
    relatedCodes: [403, 407, 511],
  },
  {
    code: 402, name: "Payment Required", category: "4xx", rfc: "RFC 9110",
    summary: "Reserved for future use. Some APIs (Stripe historically) returned it for payment-related errors.",
    rare: true,
    whenToReturn: "Generally don't — it's reserved by the spec. If you need to signal billing issues, use 403 with a specific error message in the body.",
    relatedCodes: [403, 429],
  },
  {
    code: 403, name: "Forbidden", category: "4xx", rfc: "RFC 9110",
    summary: "Client is authenticated but doesn't have permission for this resource.",
    gotcha: "Some APIs use 404 instead of 403 to avoid revealing which resources exist. Defensible for security-sensitive endpoints.",
    whenToReturn: "User is authenticated but lacks permission — wrong role, accessing another user's data, attempting an admin-only action.",
    example: 'HTTP/1.1 403 Forbidden\nContent-Type: application/json\n\n{"error":"Insufficient permissions","required":"admin"}',
    relatedCodes: [401, 404],
  },
  {
    code: 404, name: "Not Found", category: "4xx", rfc: "RFC 9110",
    summary: "The requested resource does not exist (or the server won't say if it does).",
    gotcha: "Means \"does not exist NOW.\" If a resource used to exist and is permanently gone, 410 is more accurate.",
    whenToReturn: "Resource genuinely doesn't exist, or you want to hide its existence from unauthorized users (treating 403 as 404 for privacy).",
    example: 'HTTP/1.1 404 Not Found\nContent-Type: application/json\n\n{"error":"User not found"}',
    relatedCodes: [410, 403, 400],
  },
  {
    code: 405, name: "Method Not Allowed", category: "4xx", rfc: "RFC 9110",
    summary: "The resource exists but doesn't support this HTTP method.",
    gotcha: "Response MUST include an Allow header listing supported methods, e.g. Allow: GET, POST.",
    whenToReturn: "Client used the wrong method on a valid URL — e.g. POST to a read-only endpoint. Always include Allow header.",
    example: 'HTTP/1.1 405 Method Not Allowed\nAllow: GET, HEAD\nContent-Type: application/json\n\n{"error":"DELETE not supported on this resource"}',
    relatedCodes: [404, 501],
  },
  {
    code: 406, name: "Not Acceptable", category: "4xx", rfc: "RFC 9110",
    summary: "Server can't produce a response matching the client's Accept header.",
    whenToReturn: "Rare. Client demanded a specific format (Accept: application/xml) you don't support. In practice most APIs ignore Accept and just return JSON.",
    example: 'HTTP/1.1 406 Not Acceptable\nContent-Type: application/json\n\n{"error":"Only application/json is supported","supportedTypes":["application/json"]}',
    relatedCodes: [415, 300],
  },
  {
    code: 407, name: "Proxy Authentication Required", category: "4xx", rfc: "RFC 9110",
    summary: "Like 401 but the credentials are required by a proxy between client and server, not the server itself.",
    rare: true,
    whenToReturn: "Only from HTTP proxies — you wouldn't emit this from an application server.",
    relatedCodes: [401, 511],
  },
  {
    code: 408, name: "Request Timeout", category: "4xx", rfc: "RFC 9110",
    summary: "Client took too long to send the full request. Server's giving up.",
    gotcha: "Different from 504 Gateway Timeout — that's an upstream server taking too long, not the client.",
    whenToReturn: "Web server emits this automatically when the client opens a connection but stops sending data. You rarely write this manually.",
    relatedCodes: [504, 503, 425],
  },
  {
    code: 409, name: "Conflict", category: "4xx", rfc: "RFC 9110",
    summary: "Request conflicts with current state — e.g. trying to create a resource that already exists, or a version mismatch.",
    whenToReturn: "POST creating a duplicate (e.g. username already taken), PUT with a stale ETag, deleting a resource that has dependents.",
    example: 'HTTP/1.1 409 Conflict\nContent-Type: application/json\n\n{"error":"Email already registered","conflictingResource":"/users/42"}',
    relatedCodes: [412, 422, 423],
  },
  {
    code: 410, name: "Gone", category: "4xx", rfc: "RFC 9110",
    summary: "Resource permanently removed. Use instead of 404 when you want to tell crawlers and clients \"don't come back.\"",
    gotcha: "Google removes 410 pages from index faster than 404. Use it for deprecated endpoints you want de-indexed.",
    whenToReturn: "Deprecated API endpoints you've fully shut down, deleted user accounts you don't want re-created, old URLs you want removed from search engines.",
    example: 'HTTP/1.1 410 Gone\nContent-Type: application/json\n\n{"error":"This API was retired on 2026-01-01. Migrate to /v2/."}',
    relatedCodes: [404, 301],
  },
  {
    code: 411, name: "Length Required", category: "4xx", rfc: "RFC 9110",
    summary: "Server requires a Content-Length header on the request and the client didn't send one.",
    rare: true,
    whenToReturn: "Rare; HTTP/1.1 servers accept chunked transfer encoding instead. Only needed by some legacy systems.",
    relatedCodes: [400, 413],
  },
  {
    code: 412, name: "Precondition Failed", category: "4xx", rfc: "RFC 9110",
    summary: "An If-Match / If-Unmodified-Since precondition failed. Used for optimistic concurrency control.",
    whenToReturn: "PUT or PATCH where the client sent If-Match: \"abc123\" but the current ETag is different — someone else modified the resource since the client last read it.",
    example: 'HTTP/1.1 412 Precondition Failed\nETag: "def456"\nContent-Type: application/json\n\n{"error":"Resource modified by another request","currentEtag":"def456"}',
    relatedCodes: [409, 428, 304],
  },
  {
    code: 413, name: "Content Too Large", category: "4xx", rfc: "RFC 9110",
    summary: "Request body exceeds the server's size limit. Previously \"Payload Too Large.\"",
    whenToReturn: "File upload too big, JSON body over your size limit. Always document your size limits in your API docs — clients can't infer them.",
    example: 'HTTP/1.1 413 Content Too Large\nContent-Type: application/json\n\n{"error":"Maximum upload size is 10MB","received":52428800}',
    relatedCodes: [400, 431, 507],
  },
  {
    code: 414, name: "URI Too Long", category: "4xx", rfc: "RFC 9110",
    summary: "Request URI exceeds the server's limit. Typically a GET with way too much in the query string.",
    rare: true,
    whenToReturn: "Almost never manually — your web server enforces this. If you're hitting it intentionally, switch the endpoint to POST with a body.",
    relatedCodes: [413, 431],
  },
  {
    code: 415, name: "Unsupported Media Type", category: "4xx", rfc: "RFC 9110",
    summary: "Request body is in a format the server doesn't accept — wrong Content-Type.",
    whenToReturn: "Client sent application/xml when you only handle JSON, or sent multipart form data to an endpoint that expects raw JSON. Include the supported types in the response.",
    example: 'HTTP/1.1 415 Unsupported Media Type\nContent-Type: application/json\nAccept: application/json\n\n{"error":"Content-Type must be application/json"}',
    relatedCodes: [406, 400],
  },
  {
    code: 416, name: "Range Not Satisfiable", category: "4xx", rfc: "RFC 9110",
    summary: "Client requested a byte range outside the resource's actual size.",
    whenToReturn: "Automatically when you support Range requests and the client asks for bytes beyond end-of-file. Web server usually handles this.",
    relatedCodes: [206, 200],
  },
  {
    code: 418, name: "I'm a Teapot", category: "4xx", rfc: "RFC 2324",
    summary: "Joke status from a 1998 April Fools RFC. Some services return it for blocked requests as easter eggs.",
    whenToReturn: "Don't return it from a real API — it's a joke. Some bot-blocking systems use it for honeypot responses.",
    example: "HTTP/1.1 418 I'm a teapot\nContent-Type: text/plain\n\nI'm a little teapot, short and stout.",
  },
  {
    code: 421, name: "Misdirected Request", category: "4xx", rfc: "RFC 9110",
    summary: "Request was sent to a server that can't produce a response for this URL/authority. Common with HTTP/2 connection coalescing.",
    rare: true,
    whenToReturn: "Almost never from application code; emitted by load balancers and HTTP/2 servers handling multi-host connections.",
    relatedCodes: [400, 502],
  },
  {
    code: 422, name: "Unprocessable Content", category: "4xx", rfc: "RFC 9110",
    summary: "Request is syntactically valid but semantically invalid — e.g. valid JSON but the values fail business rules.",
    gotcha: "The right code for validation errors when 400 feels too generic. Stripe, GitHub, and most modern APIs use this.",
    whenToReturn: "Form validation failures: required field missing, value out of range, end-date-before-start-date, email already exists. The request was well-formed but rejected on its content.",
    example: 'HTTP/1.1 422 Unprocessable Content\nContent-Type: application/json\n\n{"errors":[{"field":"email","message":"Already taken"},{"field":"age","message":"Must be >= 18"}]}',
    relatedCodes: [400, 409, 428],
  },
  {
    code: 423, name: "Locked", category: "4xx", rfc: "RFC 4918",
    summary: "Resource is locked (WebDAV). Borrowed by some APIs for \"this resource is currently being edited by someone else.\"",
    rare: true,
    whenToReturn: "Collaborative editing scenarios where only one user can write at a time. Most modern APIs use 409 Conflict or 423 with a custom body explaining who has the lock.",
    relatedCodes: [409, 412],
  },
  {
    code: 424, name: "Failed Dependency", category: "4xx", rfc: "RFC 4918",
    summary: "Request failed because a previous request it depended on failed (WebDAV).",
    rare: true,
    whenToReturn: "Batch APIs where step N failed because step N-1 failed. Most APIs handle this with their own error structure rather than this code.",
    relatedCodes: [422, 409],
  },
  {
    code: 425, name: "Too Early", category: "4xx", rfc: "RFC 8470",
    summary: "Server unwilling to risk processing a request that might be replayed (used in TLS 0-RTT contexts).",
    rare: true,
    whenToReturn: "Only relevant for TLS 1.3 0-RTT-enabled servers protecting against replay attacks. Library/server config concern, not application code.",
    relatedCodes: [403],
  },
  {
    code: 426, name: "Upgrade Required", category: "4xx", rfc: "RFC 9110",
    summary: "Server refuses to handle this protocol version and wants the client to switch (e.g. HTTP/1.0 → HTTP/2).",
    rare: true,
    whenToReturn: "When you've dropped support for older HTTP versions. Must include an Upgrade header listing what to switch to.",
    relatedCodes: [101, 505],
  },
  {
    code: 428, name: "Precondition Required", category: "4xx", rfc: "RFC 6585",
    summary: "Server requires conditional requests (If-Match etc.) to prevent lost-update problems on PUT/PATCH.",
    whenToReturn: "When an unconditional PUT/PATCH on a frequently-modified resource would risk overwriting concurrent edits. Forces clients to use If-Match with ETags.",
    example: 'HTTP/1.1 428 Precondition Required\nContent-Type: application/json\n\n{"error":"This endpoint requires If-Match header","example":"If-Match: \\"abc123\\""}',
    relatedCodes: [412, 409],
  },
  {
    code: 429, name: "Too Many Requests", category: "4xx", rfc: "RFC 6585",
    summary: "Rate limit exceeded. Response should include a Retry-After header.",
    gotcha: "Retry-After can be a number of seconds or an HTTP date. Modern clients handle both, but check what your client library does.",
    whenToReturn: "Always when rate-limiting. Always include Retry-After (seconds preferred). Including X-RateLimit-Remaining and X-RateLimit-Reset headers on regular responses helps clients self-throttle.",
    example: 'HTTP/1.1 429 Too Many Requests\nRetry-After: 60\nX-RateLimit-Limit: 100\nX-RateLimit-Remaining: 0\nX-RateLimit-Reset: 1716552000\nContent-Type: application/json\n\n{"error":"Rate limit exceeded, retry in 60s"}',
    relatedCodes: [503, 403, 402],
  },
  {
    code: 431, name: "Request Header Fields Too Large", category: "4xx", rfc: "RFC 6585",
    summary: "Individual header too large or total header section too large.",
    whenToReturn: "Almost never manually — your web server enforces header size limits. Often surfaces when cookies grow too large or auth tokens are appended to existing tokens.",
    relatedCodes: [413, 414],
  },
  {
    code: 451, name: "Unavailable For Legal Reasons", category: "4xx", rfc: "RFC 7725",
    summary: "Resource blocked due to legal demand (court order, government censorship). The number is a Fahrenheit 451 reference.",
    whenToReturn: "Geoblocking by legal requirement, DMCA-takedown'd content, GDPR-erased resources. Should include a Link header pointing to information about the blocking authority.",
    example: 'HTTP/1.1 451 Unavailable For Legal Reasons\nLink: <https://example.com/legal-notice>; rel="blocked-by"\nContent-Type: application/json\n\n{"error":"Unavailable in your region due to GDPR request"}',
    relatedCodes: [403, 410],
  },

  // 5xx server errors
  {
    code: 500, name: "Internal Server Error", category: "5xx", rfc: "RFC 9110",
    summary: "Generic catchall — the server hit a condition it couldn't handle. The client did nothing wrong.",
    gotcha: "Don't leak stack traces in production. Log the detail server-side, return a generic message.",
    whenToReturn: "When something unexpected blew up in your code. If you can describe the problem more specifically (e.g. database down, upstream service failed), use a more specific 5xx code instead.",
    example: 'HTTP/1.1 500 Internal Server Error\nContent-Type: application/json\n\n{"error":"An unexpected error occurred","requestId":"req_abc123"}',
    relatedCodes: [502, 503, 504],
  },
  {
    code: 501, name: "Not Implemented", category: "5xx", rfc: "RFC 9110",
    summary: "Server doesn't support this HTTP method at all (any URL). Different from 405, which is method-not-allowed for a specific resource.",
    whenToReturn: "Server only understands GET and HEAD, client sent PATCH. Almost never seen in modern frameworks which support all methods by default.",
    relatedCodes: [405, 426],
  },
  {
    code: 502, name: "Bad Gateway", category: "5xx", rfc: "RFC 9110",
    summary: "Server (acting as gateway/proxy) got an invalid response from an upstream server.",
    whenToReturn: "Your load balancer / reverse proxy got a malformed response from your backend (5xx, connection refused, garbage bytes). Usually emitted by Nginx / Cloudflare, not application code.",
    example: 'HTTP/1.1 502 Bad Gateway\nContent-Type: application/json\n\n{"error":"Upstream service returned invalid response"}',
    relatedCodes: [503, 504, 500],
  },
  {
    code: 503, name: "Service Unavailable", category: "5xx", rfc: "RFC 9110",
    summary: "Server is temporarily down — overloaded, in maintenance, etc. Include Retry-After if you can estimate.",
    gotcha: "Different from 502: 503 means the server itself is choosing not to respond; 502 means an upstream did something wrong.",
    whenToReturn: "Planned maintenance, queue depth exceeded, circuit breaker open, database connection pool exhausted. The right code for \"we know we're down, retry later.\"",
    example: 'HTTP/1.1 503 Service Unavailable\nRetry-After: 120\nContent-Type: application/json\n\n{"error":"Service in maintenance until 14:00 UTC"}',
    relatedCodes: [502, 504, 429],
  },
  {
    code: 504, name: "Gateway Timeout", category: "5xx", rfc: "RFC 9110",
    summary: "Server (acting as gateway) didn't get a timely response from an upstream service.",
    whenToReturn: "Reverse proxy or API gateway waited too long for the backend. Usually emitted by Nginx/Cloudflare/Envoy when their upstream-timeout fires.",
    example: 'HTTP/1.1 504 Gateway Timeout\nContent-Type: application/json\n\n{"error":"Upstream service timed out after 30s"}',
    relatedCodes: [502, 503, 408],
  },
  {
    code: 505, name: "HTTP Version Not Supported", category: "5xx", rfc: "RFC 9110",
    summary: "Server doesn't support the HTTP protocol version used in the request.",
    rare: true,
    whenToReturn: "Almost never manually. Server-config level.",
    relatedCodes: [426, 501],
  },
  {
    code: 506, name: "Variant Also Negotiates", category: "5xx", rfc: "RFC 2295",
    summary: "Server has a configuration error in transparent content negotiation.",
    rare: true,
    whenToReturn: "Don't. Niche to RFC 2295 transparent content negotiation, effectively unused.",
    relatedCodes: [300, 406],
  },
  {
    code: 507, name: "Insufficient Storage", category: "5xx", rfc: "RFC 4918",
    summary: "Server has run out of disk space or quota to process the request (originally WebDAV).",
    whenToReturn: "User's storage quota exhausted, server's disk full. More specific than 500 when you know the cause is storage.",
    example: 'HTTP/1.1 507 Insufficient Storage\nContent-Type: application/json\n\n{"error":"Quota exceeded","used":"10GB","limit":"10GB"}',
    relatedCodes: [413, 500],
  },
  {
    code: 508, name: "Loop Detected", category: "5xx", rfc: "RFC 5842",
    summary: "Server detected an infinite loop while processing the request (WebDAV).",
    rare: true,
    whenToReturn: "Niche to WebDAV. For general APIs, use 500 with a specific error message.",
    relatedCodes: [500],
  },
  {
    code: 510, name: "Not Extended", category: "5xx", rfc: "RFC 2774",
    summary: "Server requires further extensions to the request before it can fulfill it. From a never-adopted HTTP extension framework.",
    rare: true,
    whenToReturn: "Don't. Effectively dead spec.",
  },
  {
    code: 511, name: "Network Authentication Required", category: "5xx", rfc: "RFC 6585",
    summary: "The client needs to authenticate to gain network access — used by captive portals (\"sign in to airport WiFi\").",
    whenToReturn: "Only from captive portals (hotel/airport WiFi). Should include a Link header to the auth page. Don't use from a normal API — that's what 401 is for.",
    example: 'HTTP/1.1 511 Network Authentication Required\nContent-Type: text/html\n\n<html><body><a href="https://wifi.example.com/login">Sign in to continue</a></body></html>',
    relatedCodes: [401, 407],
  },
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
    safeCopy(`${c.code} ${c.name} — ${c.summary}`);
  }

  function scrollToCode(code: number) {
    // Briefly clear the search so the target is in the visible list, then
    // scroll. Without this, clicking a related-code chip while filtered would
    // jump nowhere if the target was filtered out.
    setQuery("");
    // requestAnimationFrame waits for the next paint so the now-unfiltered
    // list is in the DOM before we look up the target element.
    requestAnimationFrame(() => {
      const el = document.getElementById(`http-${code}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-brand-500");
        setTimeout(() => el.classList.remove("ring-2", "ring-brand-500"), 1500);
      }
    });
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
                  {grouped[cat].map((c) => {
                    const hasDetails = !!(c.whenToReturn || c.example || (c.relatedCodes && c.relatedCodes.length > 0));
                    return (
                    <li key={c.code} id={`http-${c.code}`} className={`rounded-xl border ${CATEGORY_COLORS[c.category]} p-3 transition-shadow scroll-mt-4`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="font-mono text-lg font-bold">{c.code}</span>
                          <span className="font-medium">{c.name}</span>
                          <span className="text-[10px] text-[rgb(var(--fg-muted))] uppercase">{c.rfc}</span>
                          {c.rare && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[rgb(var(--bg-muted,250,250,252))] border border-[rgb(var(--border))] text-[rgb(var(--fg-muted))]">rarely seen</span>}
                        </div>
                        <button onClick={() => copyCode(c)} className="text-xs opacity-60 hover:opacity-100" aria-label={`Copy ${c.code}`}>
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-1.5 text-sm">{c.summary}</p>
                      {c.gotcha && (
                        <p className="mt-1.5 text-xs italic opacity-80"><strong className="not-italic">Gotcha:</strong> {c.gotcha}</p>
                      )}
                      {hasDetails && (
                        <details className="mt-2 group">
                          <summary className="text-xs cursor-pointer select-none opacity-70 hover:opacity-100 list-none flex items-center gap-1">
                            <span className="inline-block transition-transform group-open:rotate-90">▸</span>
                            <span className="group-open:hidden">Show details</span>
                            <span className="hidden group-open:inline">Hide details</span>
                          </summary>
                          <div className="mt-2 space-y-2.5">
                            {c.whenToReturn && (
                              <div>
                                <div className="text-[10px] uppercase tracking-wide opacity-60 mb-0.5">When to return</div>
                                <p className="text-xs">{c.whenToReturn}</p>
                              </div>
                            )}
                            {c.example && (
                              <div>
                                <div className="text-[10px] uppercase tracking-wide opacity-60 mb-0.5">Example response</div>
                                <pre className="text-[11px] font-mono bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded-md p-2 overflow-auto whitespace-pre">{c.example}</pre>
                              </div>
                            )}
                            {c.relatedCodes && c.relatedCodes.length > 0 && (
                              <div>
                                <div className="text-[10px] uppercase tracking-wide opacity-60 mb-0.5">Related codes</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {c.relatedCodes.map((rc) => {
                                    const related = CODES.find((x) => x.code === rc);
                                    return (
                                      <button
                                        key={rc}
                                        onClick={() => scrollToCode(rc)}
                                        className="text-[11px] px-2 py-0.5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] hover:bg-[rgb(var(--bg-muted,250,250,252))] font-mono"
                                        title={related?.name ?? `HTTP ${rc}`}
                                      >
                                        {rc} {related ? <span className="opacity-60 font-sans">{related.name}</span> : null}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </li>
                    );
                  })}
                </ul>
              </div>
            )
          )
        )}
      </div>
    </ToolPage>
  );
}
