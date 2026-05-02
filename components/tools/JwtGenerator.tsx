"use client";

import { useState } from "react";
import { SignJWT } from "jose";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Alg = "HS256" | "HS384" | "HS512";

export default function JwtGenerator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [alg, setAlg] = useState<Alg>("HS256");
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function sign() {
    try {
      const obj = JSON.parse(payload);
      const enc = new TextEncoder().encode(secret);
      const t = await new SignJWT(obj).setProtectedHeader({ alg, typ: "JWT" }).sign(enc);
      setToken(t); setErr(null);
    } catch (e: any) { setErr(e.message); setToken(""); }
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste a JSON payload, set a secret, pick an HMAC algorithm, and click Sign. The signed JWT appears below — three Base64URL parts separated by dots.",
      formula: "JWT = base64url(header) + '.' + base64url(payload) + '.' + HMAC-SHAxxx(header.payload, secret). HS256 = HMAC-SHA-256, HS384 = SHA-384, HS512 = SHA-512.",
      examples: '{"sub":"123"} signed with secret "my-secret" using HS256 → a 3-part token your auth library will accept.',
      faq: [
        { q: "Can I sign with RS256 (RSA)?", a: "Not yet — only HMAC family for now. RSA requires you to paste private keys, which is risky in a public web tool." },
        { q: "Is my secret stored?", a: "No. Signing happens entirely in your browser via the Web Crypto API; nothing is uploaded." },
      ],
    }}>
      <div className="grid lg:grid-cols-2 gap-3">
        <div>
          <label className="label">Payload (JSON)</label>
          <textarea className="input min-h-[200px] font-mono text-xs" value={payload} onChange={(e) => setPayload(e.target.value)} />
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            <div><label className="label">Secret</label><input className="input font-mono" value={secret} onChange={(e) => setSecret(e.target.value)} /></div>
            <div><label className="label">Algorithm</label>
              <select className="input" value={alg} onChange={(e) => setAlg(e.target.value as Alg)}>
                <option>HS256</option><option>HS384</option><option>HS512</option>
              </select>
            </div>
          </div>
          <button onClick={sign} className="mt-2 btn-primary min-tap">Sign</button>
          {err && <p role="alert" className="mt-2 text-sm text-red-600">{err}</p>}
        </div>
        <div>
          <label className="label">Signed token</label>
          <textarea className="input min-h-[200px] font-mono text-xs" value={token} readOnly />
          {token && <button onClick={() => navigator.clipboard.writeText(token)} className="mt-2 btn-ghost text-xs">Copy</button>}
        </div>
      </div>
    </ToolPage>
  );
}
