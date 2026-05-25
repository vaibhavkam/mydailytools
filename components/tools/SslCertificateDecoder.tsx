"use client";

import { useState } from "react";
import forge from "node-forge";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

const SAMPLE = `-----BEGIN CERTIFICATE-----
MIIBlTCCATugAwIBAgIRANRBDX+EQX9ja3I9DAKLAUwwCgYIKoZIzj0EAwIwGjEY
MBYGA1UEAwwPZXhhbXBsZS5sb2NhbCBDQTAeFw0yNDAxMDEwMDAwMDBaFw0yNTAx
MDEwMDAwMDBaMBoxGDAWBgNVBAMMD2V4YW1wbGUubG9jYWwgQ0EwWTATBgcqhkjO
PQIBBggqhkjOPQMBBwNCAATzh+S5oPtEHr2XJU/ZX2dvzD5ZOl+i3lIEehYhAoQF
NDaeq45dAGYy1ABkP+7T3l1zuVqHj1Wfw/kjr51jwzrVo10wWzAOBgNVHQ8BAf8E
BAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUu8O...
-----END CERTIFICATE-----`;

export default function SslCertificateDecoder({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [pem, setPem] = useState(SAMPLE);
  const [r, setR] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  function decode() {
    try {
      const cert = forge.pki.certificateFromPem(pem);
      const subject = cert.subject.attributes.map((a: any) => `${a.shortName ?? a.name}=${a.value}`).join(", ");
      const issuer = cert.issuer.attributes.map((a: any) => `${a.shortName ?? a.name}=${a.value}`).join(", ");
      const sanExt = cert.getExtension("subjectAltName") as any;
      const san = sanExt?.altNames?.map((a: any) => a.value).join(", ") ?? "";
      setR({
        subject, issuer, san,
        validFrom: cert.validity.notBefore.toISOString(),
        validTo: cert.validity.notAfter.toISOString(),
        serial: cert.serialNumber,
        sigAlg: cert.siginfo.algorithmOid,
        version: cert.version,
      });
      setErr(null);
    } catch (e: any) { setErr(e.message); setR(null); }
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Paste a PEM-encoded X.509 certificate (begins with -----BEGIN CERTIFICATE-----). Click Decode to view the subject, issuer, validity period, SAN list, and signature algorithm.",
      formula: "Powered by node-forge running entirely in your browser. We never upload the certificate.",
      examples: "Paste a server cert from openssl s_client, a CA bundle item, or a self-signed development cert.",
      faq: [
        { q: "Is the private key inspected?", a: "No — public certificates only. Don't paste private keys into any web tool." },
        { q: "Why does the sample fail?", a: "It's a placeholder; replace with a real cert. We don't ship a working sample to avoid giving the impression of a 'real' identity." },
      ],
    }}>
      <label className="label">PEM certificate</label>
      <AutoTextarea className="input min-h-[320px] font-mono text-xs" value={pem} onChange={(e) => setPem(e.target.value)} />
      <div className="mt-3">
        <button onClick={decode} className="btn-primary min-tap">Decode</button>
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
          {[
            ["Subject", r.subject], ["Issuer", r.issuer],
            ["Valid from", r.validFrom], ["Valid until", r.validTo],
            ["Serial", r.serial], ["Subject Alt Names", r.san || "(none)"],
            ["Signature OID", r.sigAlg], ["Version", `v${r.version + 1}`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-[rgb(var(--border))] p-3">
              <div className="text-xs text-[rgb(var(--fg-muted))]">{l}</div>
              <div className="font-mono text-xs break-all">{v}</div>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
