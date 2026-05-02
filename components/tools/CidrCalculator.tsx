"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

function ipToInt(ip: string): number | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  // Use Math (not bitwise) to avoid sign issues for >127.x.x.x.
  return parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3];
}
function intToIp(n: number): string {
  return [n >>> 24 & 0xff, n >>> 16 & 0xff, n >>> 8 & 0xff, n & 0xff].join(".");
}

export default function CidrCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [input, setInput] = useState("192.168.1.0/24");
  const r = useMemo(() => {
    const m = input.trim().match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
    if (!m) return null;
    const ipInt = ipToInt(m[1]);
    const prefix = parseInt(m[2]);
    if (ipInt == null || prefix < 0 || prefix > 32) return null;
    const hostBits = 32 - prefix;
    const maskInt = hostBits === 32 ? 0 : (0xffffffff << hostBits) >>> 0;
    const network = (ipInt & maskInt) >>> 0;
    const broadcast = (network | (~maskInt >>> 0)) >>> 0;
    const hosts = hostBits >= 31 ? hostBits === 32 ? 1 : 2 : Math.pow(2, hostBits);
    const usable = hostBits <= 1 ? hosts : hosts - 2;
    const first = usable === hosts ? network : network + 1;
    const last = usable === hosts ? broadcast : broadcast - 1;
    return {
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      mask: intToIp(maskInt),
      wildcard: intToIp((~maskInt) >>> 0),
      prefix,
      total: hosts,
      usable,
      first: intToIp(first),
      last: intToIp(last),
    };
  }, [input]);

  return (
    <ToolPage tool={tool} content={{
      howTo: "Type a CIDR block in the form A.B.C.D/N. The calculator returns the network and broadcast addresses, subnet mask, total addresses, and the usable host range.",
      formula: "Mask = 32 minus N host bits. Network = IP AND mask. Broadcast = network OR ~mask. Usable hosts = 2^(32 − N) − 2 (network + broadcast excluded), except for /31 and /32 which behave specially.",
      examples: "192.168.1.0/24 → mask 255.255.255.0, range 192.168.1.0–192.168.1.255, 254 usable hosts (.1–.254).",
      faq: [
        { q: "What about /31 and /32?", a: "/31 (RFC 3021) is used for point-to-point links — both addresses are usable. /32 is a single host." },
        { q: "IPv6?", a: "Not yet — IPv4 only. IPv6 is on the roadmap." },
      ],
    }}>
      <label className="label">CIDR block</label>
      <input className="input font-mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder="192.168.1.0/24" />
      {!r ? <p className="mt-3 text-sm text-red-600">Invalid CIDR (use A.B.C.D/N)</p> : (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            ["Network", r.network], ["Broadcast", r.broadcast],
            ["Subnet mask", r.mask], ["Wildcard", r.wildcard],
            ["First host", r.first], ["Last host", r.last],
            ["Prefix", `/${r.prefix}`], ["Total addresses", r.total.toLocaleString()], ["Usable hosts", r.usable.toLocaleString()],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-[rgb(var(--border))] p-3">
              <div className="text-xs text-[rgb(var(--fg-muted))]">{l}</div>
              <div className="font-mono text-sm">{v}</div>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
