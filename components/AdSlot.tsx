// AdSense placeholder. After AdSense approval, replace data-ad-client / data-ad-slot
// with real values. The component renders a non-intrusive box pre-approval so layout
// is identical before and after ads go live.
//
// Slots used on this site:
//   - "header"   728x90 / 320x50 — below header
//   - "sidebar"  300x250 — sticky desktop sidebar
//   - "in-content" responsive — between tool result and related tools
//   - "footer"   728x90 — above footer
//
// The Google AdSense <script> is loaded in app/layout.tsx, gated on
// NEXT_PUBLIC_ADSENSE_CLIENT being set at build time.

type Slot = "header" | "sidebar" | "in-content" | "footer";

const SLOT_DIMS: Record<Slot, { className: string; format: string; minH: string }> = {
  header: { className: "max-w-3xl mx-auto", format: "auto", minH: "min-h-[60px] md:min-h-[90px]" },
  sidebar: { className: "w-[300px]", format: "rectangle", minH: "min-h-[250px]" },
  "in-content": { className: "w-full", format: "fluid", minH: "min-h-[120px] md:min-h-[280px]" },
  footer: { className: "max-w-3xl mx-auto", format: "auto", minH: "min-h-[90px]" },
};

export function AdSlot({ slot, label = "Advertisement" }: { slot: Slot; label?: string }) {
  const dims = SLOT_DIMS[slot];
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adSlotId = process.env[`NEXT_PUBLIC_ADSENSE_SLOT_${slot.toUpperCase().replace("-", "_")}` as any];

  return (
    <div className={`my-6 ${dims.className}`} aria-label={label}>
      <div className="text-[10px] uppercase tracking-widest text-center text-[rgb(var(--fg-muted))] mb-1">{label}</div>
      {client && adSlotId ? (
        <ins
          className={`adsbygoogle block ${dims.minH}`}
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={adSlotId}
          data-ad-format={dims.format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className={`rounded-xl border border-dashed border-[rgb(var(--border))] grid place-items-center text-xs text-[rgb(var(--fg-muted))] ${dims.minH}`}>
          AdSense slot — {slot}
        </div>
      )}
    </div>
  );
}
