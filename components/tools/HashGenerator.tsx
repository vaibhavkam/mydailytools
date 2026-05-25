"use client";

import { useEffect, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

const ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-512"] as const;
type Algo = typeof ALGOS[number];

// MD5 isn't in Web Crypto. Self-contained MD5 implementation (RSA Data Security RFC 1321).
// Used only for non-security purposes — checksums, dedupe keys. Do not use for auth.
function md5(input: string): string {
  function r(n: number, c: number) { return (n << c) | (n >>> (32 - c)); }
  function add(a: number, b: number) { return (a + b) & 0xffffffff; }

  const bytes = new TextEncoder().encode(input);
  const len = bytes.length;
  const blocks = new Uint32Array((((len + 8) >> 6) + 1) * 16);
  for (let i = 0; i < len; i++) blocks[i >> 2] |= bytes[i] << ((i % 4) * 8);
  blocks[len >> 2] |= 0x80 << ((len % 4) * 8);
  blocks[blocks.length - 2] = len * 8;

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);
  const round = (fn: (x: number, y: number, z: number) => number, a: number, b: number, c: number, d: number, x: number, s: number, t: number) => add(r(add(add(a, fn(b, c, d)), add(x, t)), s), b);

  for (let i = 0; i < blocks.length; i += 16) {
    const [aa, bb, cc, dd] = [a, b, c, d];
    a = round(F, a, b, c, d, blocks[i + 0], 7, 0xd76aa478);
    d = round(F, d, a, b, c, blocks[i + 1], 12, 0xe8c7b756);
    c = round(F, c, d, a, b, blocks[i + 2], 17, 0x242070db);
    b = round(F, b, c, d, a, blocks[i + 3], 22, 0xc1bdceee);
    a = round(F, a, b, c, d, blocks[i + 4], 7, 0xf57c0faf);
    d = round(F, d, a, b, c, blocks[i + 5], 12, 0x4787c62a);
    c = round(F, c, d, a, b, blocks[i + 6], 17, 0xa8304613);
    b = round(F, b, c, d, a, blocks[i + 7], 22, 0xfd469501);
    a = round(F, a, b, c, d, blocks[i + 8], 7, 0x698098d8);
    d = round(F, d, a, b, c, blocks[i + 9], 12, 0x8b44f7af);
    c = round(F, c, d, a, b, blocks[i + 10], 17, 0xffff5bb1);
    b = round(F, b, c, d, a, blocks[i + 11], 22, 0x895cd7be);
    a = round(F, a, b, c, d, blocks[i + 12], 7, 0x6b901122);
    d = round(F, d, a, b, c, blocks[i + 13], 12, 0xfd987193);
    c = round(F, c, d, a, b, blocks[i + 14], 17, 0xa679438e);
    b = round(F, b, c, d, a, blocks[i + 15], 22, 0x49b40821);

    a = round(G, a, b, c, d, blocks[i + 1], 5, 0xf61e2562);
    d = round(G, d, a, b, c, blocks[i + 6], 9, 0xc040b340);
    c = round(G, c, d, a, b, blocks[i + 11], 14, 0x265e5a51);
    b = round(G, b, c, d, a, blocks[i + 0], 20, 0xe9b6c7aa);
    a = round(G, a, b, c, d, blocks[i + 5], 5, 0xd62f105d);
    d = round(G, d, a, b, c, blocks[i + 10], 9, 0x02441453);
    c = round(G, c, d, a, b, blocks[i + 15], 14, 0xd8a1e681);
    b = round(G, b, c, d, a, blocks[i + 4], 20, 0xe7d3fbc8);
    a = round(G, a, b, c, d, blocks[i + 9], 5, 0x21e1cde6);
    d = round(G, d, a, b, c, blocks[i + 14], 9, 0xc33707d6);
    c = round(G, c, d, a, b, blocks[i + 3], 14, 0xf4d50d87);
    b = round(G, b, c, d, a, blocks[i + 8], 20, 0x455a14ed);
    a = round(G, a, b, c, d, blocks[i + 13], 5, 0xa9e3e905);
    d = round(G, d, a, b, c, blocks[i + 2], 9, 0xfcefa3f8);
    c = round(G, c, d, a, b, blocks[i + 7], 14, 0x676f02d9);
    b = round(G, b, c, d, a, blocks[i + 12], 20, 0x8d2a4c8a);

    a = round(H, a, b, c, d, blocks[i + 5], 4, 0xfffa3942);
    d = round(H, d, a, b, c, blocks[i + 8], 11, 0x8771f681);
    c = round(H, c, d, a, b, blocks[i + 11], 16, 0x6d9d6122);
    b = round(H, b, c, d, a, blocks[i + 14], 23, 0xfde5380c);
    a = round(H, a, b, c, d, blocks[i + 1], 4, 0xa4beea44);
    d = round(H, d, a, b, c, blocks[i + 4], 11, 0x4bdecfa9);
    c = round(H, c, d, a, b, blocks[i + 7], 16, 0xf6bb4b60);
    b = round(H, b, c, d, a, blocks[i + 10], 23, 0xbebfbc70);
    a = round(H, a, b, c, d, blocks[i + 13], 4, 0x289b7ec6);
    d = round(H, d, a, b, c, blocks[i + 0], 11, 0xeaa127fa);
    c = round(H, c, d, a, b, blocks[i + 3], 16, 0xd4ef3085);
    b = round(H, b, c, d, a, blocks[i + 6], 23, 0x04881d05);
    a = round(H, a, b, c, d, blocks[i + 9], 4, 0xd9d4d039);
    d = round(H, d, a, b, c, blocks[i + 12], 11, 0xe6db99e5);
    c = round(H, c, d, a, b, blocks[i + 15], 16, 0x1fa27cf8);
    b = round(H, b, c, d, a, blocks[i + 2], 23, 0xc4ac5665);

    a = round(I, a, b, c, d, blocks[i + 0], 6, 0xf4292244);
    d = round(I, d, a, b, c, blocks[i + 7], 10, 0x432aff97);
    c = round(I, c, d, a, b, blocks[i + 14], 15, 0xab9423a7);
    b = round(I, b, c, d, a, blocks[i + 5], 21, 0xfc93a039);
    a = round(I, a, b, c, d, blocks[i + 12], 6, 0x655b59c3);
    d = round(I, d, a, b, c, blocks[i + 3], 10, 0x8f0ccc92);
    c = round(I, c, d, a, b, blocks[i + 10], 15, 0xffeff47d);
    b = round(I, b, c, d, a, blocks[i + 1], 21, 0x85845dd1);
    a = round(I, a, b, c, d, blocks[i + 8], 6, 0x6fa87e4f);
    d = round(I, d, a, b, c, blocks[i + 15], 10, 0xfe2ce6e0);
    c = round(I, c, d, a, b, blocks[i + 6], 15, 0xa3014314);
    b = round(I, b, c, d, a, blocks[i + 13], 21, 0x4e0811a1);
    a = round(I, a, b, c, d, blocks[i + 4], 6, 0xf7537e82);
    d = round(I, d, a, b, c, blocks[i + 11], 10, 0xbd3af235);
    c = round(I, c, d, a, b, blocks[i + 2], 15, 0x2ad7d2bb);
    b = round(I, b, c, d, a, blocks[i + 9], 21, 0xeb86d391);

    a = add(a, aa); b = add(b, bb); c = add(c, cc); d = add(d, dd);
  }
  // Output: little-endian hex of [a, b, c, d].
  const out = [a, b, c, d].map((v) => {
    let s = "";
    for (let j = 0; j < 4; j++) s += ((v >>> (j * 8)) & 0xff).toString(16).padStart(2, "0");
    return s;
  }).join("");
  return out;
}

async function webHash(algo: "SHA-1" | "SHA-256" | "SHA-512", text: string) {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algo, buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGenerator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [text, setText] = useState("hello world");
  const [hashes, setHashes] = useState<Record<Algo, string>>({ "MD5": "", "SHA-1": "", "SHA-256": "", "SHA-512": "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Record<Algo, string> = {
        "MD5": md5(text),
        "SHA-1": await webHash("SHA-1", text),
        "SHA-256": await webHash("SHA-256", text),
        "SHA-512": await webHash("SHA-512", text),
      };
      if (!cancelled) setHashes(next);
    })();
    return () => { cancelled = true; };
  }, [text]);

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Type or paste any text. MD5, SHA-1, SHA-256, and SHA-512 update live. SHA-2 hashes use the browser's Web Crypto API; MD5 is a self-contained JS implementation since it's not in the standard Web Crypto.",
        formula: "Hash functions map arbitrary input to a fixed-size digest. Same input → same output, deterministically. SHA-256 and SHA-512 are still considered cryptographically secure; MD5 and SHA-1 are broken for collision resistance and should not be used for security.",
        examples: 'MD5("hello world") = 5eb63bbbe01eeed093cb22bb8f5acdc3. SHA-256("hello world") = b94d27b9... (64 hex chars).',
        faq: [
          { q: "Is MD5 safe?", a: "Not for cryptographic use. It's still fine as a non-cryptographic checksum (e.g., dedupe keys, file fingerprints) where you don't fear an adversary." },
          { q: "Why is the result lowercase?", a: "Convention. Hex digests are case-insensitive — convert if your downstream system needs uppercase." },
        ],
      }}
    >
      <div className="grid gap-4">
        <div>
          <label className="label" htmlFor="hash-in">Input text</label>
          <AutoTextarea id="hash-in" className="input min-h-[100px] font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="grid gap-2">
          {ALGOS.map((a) => (
            <div key={a} className="rounded-xl border border-[rgb(var(--border))] p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">{a}</span>
                <button onClick={() => navigator.clipboard.writeText(hashes[a])} className="text-xs btn-ghost">Copy</button>
              </div>
              <code className="font-mono text-xs break-all">{hashes[a]}</code>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
