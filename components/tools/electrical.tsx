"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

// Ohm's Law: V = IR. Solve any one given the other two.
export function OhmsLaw({ tool }: Props) {
  const [V, setV] = useState(""); const [I, setI] = useState("0.5"); const [R, setR] = useState("220");
  const r = useMemo(() => {
    const v = parseFloat(V), i = parseFloat(I), R_ = parseFloat(R);
    const known = [["V", v], ["I", i], ["R", R_]].filter(([, x]) => Number.isFinite(x));
    if (known.length < 2) return null;
    if (Number.isFinite(v) && Number.isFinite(i)) return { V: v, I: i, R: v / i, P: v * i };
    if (Number.isFinite(v) && Number.isFinite(R_)) return { V: v, I: v / R_, R: R_, P: (v * v) / R_ };
    if (Number.isFinite(i) && Number.isFinite(R_)) return { V: i * R_, I: i, R: R_, P: i * i * R_ };
    return null;
  }, [V, I, R]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Fill in any two of voltage (V), current (I), or resistance (R). The third and the power dissipation compute automatically.", formula: "V = IR. Power: P = VI = I²R = V²/R.", examples: "12 V across 220 Ω draws 54.5 mA, dissipating 0.65 W.", faq: [{ q: "What is Ohm's law?", a: "Ohm's law states that voltage equals current times resistance (V = IR). It describes how the three fundamental electrical quantities relate in a resistive circuit." }, { q: "How do I find current if I know voltage and resistance?", a: "Divide voltage by resistance: I = V / R. For example, 9 V across a 180 Ω resistor draws 50 mA." }, { q: "Can I use this for AC circuits?", a: "Ohm's law applies directly to purely resistive AC loads. For reactive components (capacitors, inductors) you need impedance Z instead of resistance R." }] }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Voltage (V)</label><input className="input" value={V} onChange={(e) => setV(e.target.value)} /></div>
        <div><label className="label">Current (A)</label><input className="input" value={I} onChange={(e) => setI(e.target.value)} /></div>
        <div><label className="label">Resistance (Ω)</label><input className="input" value={R} onChange={(e) => setR(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[["V", r.V, "V"], ["I", r.I, "A"], ["R", r.R, "Ω"], ["P", r.P, "W"]].map(([l, v, u]) => (
            <div key={l as string} className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">{l as string}</div><div className="text-lg font-semibold tabular-nums">{Number((v as number).toPrecision(6))} {u as string}</div></div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}

// Voltage divider: Vout = Vin × R2 / (R1 + R2)
export function VoltageDivider({ tool }: Props) {
  const [Vin, setVin] = useState("5"); const [R1, setR1] = useState("10000"); const [R2, setR2] = useState("4700");
  const r = useMemo(() => {
    const a = parseFloat(Vin), b = parseFloat(R1), c = parseFloat(R2);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || (b + c) === 0) return null;
    const vout = a * c / (b + c);
    const i = a / (b + c);
    return { vout, i };
  }, [Vin, R1, R2]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Enter input voltage and the two resistor values.", formula: "Vout = Vin × R2 / (R1 + R2). Current = Vin / (R1 + R2).", examples: "5 V, R1 = 10 kΩ, R2 = 4.7 kΩ → Vout ≈ 1.598 V.", faq: [{ q: "Why does loading affect output?", a: "Drawing current through Vout adds a parallel resistance to R2, reducing the output. Use a buffer (op-amp) for high-impedance loads." }] }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Vin (V)</label><input className="input" value={Vin} onChange={(e) => setVin(e.target.value)} /></div>
        <div><label className="label">R1 (Ω)</label><input className="input" value={R1} onChange={(e) => setR1(e.target.value)} /></div>
        <div><label className="label">R2 (Ω)</label><input className="input" value={R2} onChange={(e) => setR2(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-3"><div className="text-xs text-brand-700 dark:text-brand-300">Vout</div><div className="text-2xl font-bold tabular-nums">{r.vout.toFixed(4)} V</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Current</div><div className="text-2xl font-bold tabular-nums">{(r.i * 1000).toFixed(4)} mA</div></div>
        </div>
      )}
    </ToolPage>
  );
}

// Resistor color code (4-band)
const COLORS = [
  { name: "Black", hex: "#000", val: 0 },
  { name: "Brown", hex: "#7B3F00", val: 1 },
  { name: "Red", hex: "#FF0000", val: 2 },
  { name: "Orange", hex: "#FF7F00", val: 3 },
  { name: "Yellow", hex: "#FFFF00", val: 4 },
  { name: "Green", hex: "#00C000", val: 5 },
  { name: "Blue", hex: "#0040FF", val: 6 },
  { name: "Violet", hex: "#8000FF", val: 7 },
  { name: "Gray", hex: "#808080", val: 8 },
  { name: "White", hex: "#FFFFFF", val: 9 },
];
// Multiplier band can also be Gold (×0.1) or Silver (×0.01) for sub-ohm values.
const MULTIPLIERS = [
  ...COLORS.map((c) => ({ ...c, exp: c.val })),
  { name: "Gold", hex: "#D4AF37", exp: -1 },
  { name: "Silver", hex: "#C0C0C0", exp: -2 },
];
// Tolerance bands. 4-band typically uses gold/silver/brown/red; 5- and 6-band
// add the precision colours (green, blue, violet, gray) per IEC 60062.
const TOLERANCES = [
  { name: "Brown", val: 1 },
  { name: "Red", val: 2 },
  { name: "Green", val: 0.5 },
  { name: "Blue", val: 0.25 },
  { name: "Violet", val: 0.1 },
  { name: "Gray", val: 0.05 },
  { name: "Gold", val: 5 },
  { name: "Silver", val: 10 },
];
// Temperature coefficient (ppm/°C) for the 6th band.
const TEMPCO = [
  { name: "Brown", val: 100 },
  { name: "Red", val: 50 },
  { name: "Orange", val: 15 },
  { name: "Yellow", val: 25 },
  { name: "Blue", val: 10 },
  { name: "Violet", val: 5 },
];

function formatOhms(v: number): string {
  if (v >= 1e9) return (v / 1e9).toString() + " GΩ";
  if (v >= 1e6) return (v / 1e6).toString() + " MΩ";
  if (v >= 1e3) return (v / 1e3).toString() + " kΩ";
  if (v >= 1)   return v.toString() + " Ω";
  if (v >= 1e-3) return (v * 1000).toString() + " mΩ";
  return v.toExponential(2) + " Ω";
}

export function ResistorColorCode({ tool }: Props) {
  const [bands, setBands] = useState<4 | 5 | 6>(4);
  // Digit bands; we only use the 3rd one when bands >= 5.
  const [b1, setB1] = useState(2);
  const [b2, setB2] = useState(2);
  const [b3, setB3] = useState(0);
  const [m, setM] = useState(2);     // multiplier exponent (can be -2..9)
  const [t, setT] = useState(5);     // tolerance %
  const [tc, setTc] = useState(100); // temperature coefficient ppm/°C

  const value = (() => {
    const digits = bands === 4 ? b1 * 10 + b2 : b1 * 100 + b2 * 10 + b3;
    return digits * Math.pow(10, m);
  })();

  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick the band count printed on your resistor (4 is most common; 5 is precision; 6 adds temperature coefficient). Then choose each band's colour. The decoded resistance, tolerance, and (for 6-band) temperature coefficient appear instantly.",
      formula: "4-band: value = (digit1 × 10 + digit2) × 10^multiplier. 5- and 6-band: value = (digit1 × 100 + digit2 × 10 + digit3) × 10^multiplier. Multiplier can be 10⁻² (silver) to 10⁹ (white). Tolerance band gives the ± percent. The 6-band temperature coefficient is in parts-per-million per °C.",
      examples: "Red-Red-Red-Gold (4-band) = 2,200 Ω ±5% = 2.2 kΩ. Brown-Black-Black-Red-Brown (5-band) = 10,000 Ω ±1% = 10 kΩ. Yellow-Violet-Black-Orange-Brown-Red (6-band) = 47 kΩ ±1%, 50 ppm/°C.",
      faq: [
        { q: "Which side do I read from?", a: "Tolerance band is usually slightly wider and offset to one end. Read from the opposite end. If both ends look symmetric, gold/silver is always the tolerance band." },
        { q: "What's the difference between 4 and 5 bands?", a: "4-band gives 2 significant digits; 5-band gives 3, useful for tighter-tolerance resistors (1% or better)." },
        { q: "Why doesn't black appear as a tolerance?", a: "Black has no defined tolerance value. Tolerance is one of brown/red/green/blue/violet/gray/gold/silver per IEC 60062." },
      ],
    }}>
      <div className="flex gap-2 mb-4">
        {([4, 5, 6] as const).map((n) => (
          <button key={n} onClick={() => setBands(n)} aria-pressed={bands === n}
            className={`min-tap rounded-xl px-3 py-2 text-sm font-medium transition ${bands === n ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>
            {n}-band
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${bands === 4 ? "sm:grid-cols-4" : bands === 5 ? "sm:grid-cols-5" : "sm:grid-cols-6"}`}>
        <Picker label="Band 1" value={b1} options={COLORS} onChange={setB1} valueKey="val" />
        <Picker label="Band 2" value={b2} options={COLORS} onChange={setB2} valueKey="val" />
        {bands >= 5 && <Picker label="Band 3" value={b3} options={COLORS} onChange={setB3} valueKey="val" />}
        <Picker label="Multiplier" value={m} options={MULTIPLIERS} onChange={setM} valueKey="exp" />
        <Picker label="Tolerance" value={t} options={TOLERANCES} onChange={setT} valueKey="val" />
        {bands === 6 && <Picker label="Temp. coeff." value={tc} options={TEMPCO} onChange={setTc} valueKey="val" />}
      </div>

      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
        <div className="text-3xl font-bold tabular-nums">{formatOhms(value)}</div>
        <div className="text-sm text-[rgb(var(--fg-muted))]">±{t}%{bands === 6 ? `, ${tc} ppm/°C` : ""}</div>
        <div className="text-xs text-[rgb(var(--fg-muted))] mt-1 font-mono">{value.toLocaleString()} Ω</div>
      </div>
    </ToolPage>
  );
}
function Picker({ label, value, options, onChange, valueKey = "val" }: { label: string; value: number; options: any[]; onChange: (n: number) => void; valueKey?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((o) => <option key={o.name} value={o[valueKey]}>{o.name}</option>)}
      </select>
    </div>
  );
}

// Power: P = VI, P = I²R, P = V²/R
export function PowerCalculator({ tool }: Props) {
  const [V, setV] = useState("12"); const [I, setI] = useState("2");
  const r = useMemo(() => { const v = parseFloat(V), i = parseFloat(I); if (!Number.isFinite(v) || !Number.isFinite(i)) return null; return { P: v * i }; }, [V, I]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Enter voltage and current; the dissipated/delivered power is V × I.", formula: "P = V × I (DC or RMS for AC). For sinusoidal AC with non-resistive loads, multiply by power factor cos(θ).", examples: "12 V, 2 A → 24 W.", faq: [{ q: "How do I calculate power in a circuit?", a: "Multiply voltage by current: P = V × I. A 12 V circuit carrying 2 A dissipates 24 W." }, { q: "What is the difference between watts and volt-amps?", a: "Watts measure real (consumed) power; volt-amps measure apparent power. They are equal only for purely resistive loads — reactive loads have a power factor less than 1." }, { q: "How many watts can a standard 15 A, 120 V outlet supply?", a: "A 15 A outlet at 120 V can supply up to 1,800 W, though NEC guidelines recommend keeping continuous loads below 1,440 W (80% of the breaker rating)." }] }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Voltage (V)</label><input className="input" value={V} onChange={(e) => setV(e.target.value)} /></div>
        <div><label className="label">Current (A)</label><input className="input" value={I} onChange={(e) => setI(e.target.value)} /></div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
        <div className="text-3xl font-bold">{r ? Number(r.P.toPrecision(6)) + " W" : "—"}</div>
      </div>
    </ToolPage>
  );
}

// Capacitor: series, parallel, time constant
export function CapacitanceCalculator({ tool }: Props) {
  const [vals, setVals] = useState("10, 22, 47");
  const [R, setR] = useState("10000");
  const r = useMemo(() => {
    const arr = vals.split(/[, ]+/).map(Number).filter((n) => Number.isFinite(n) && n > 0);
    if (!arr.length) return null;
    const parallel = arr.reduce((a, b) => a + b, 0);
    const series = 1 / arr.reduce((a, b) => a + 1 / b, 0);
    const tau = parseFloat(R) * (parallel * 1e-6); // µF assumed
    return { parallel, series, tau };
  }, [vals, R]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Enter capacitances (µF) separated by commas. We compute the parallel sum, series equivalent, and the RC time constant for the parallel set.", formula: "Parallel: C_total = ΣC. Series: 1/C = Σ(1/C). τ = RC (seconds).", examples: "10, 22, 47 µF parallel = 79 µF, series ≈ 6.07 µF.", faq: [
        { q: "Why is parallel capacitance larger than any single capacitor?", a: "Parallel capacitors share the same voltage and their plate areas effectively add together, so total capacitance is the sum of all values." },
        { q: "Why is series capacitance smaller than the smallest capacitor?", a: "In series the charge must flow through each capacitor in turn. The reciprocal formula (1/C_total = Σ 1/Cₙ) means the result is always less than the smallest value." },
        { q: "What is the RC time constant (τ) used for?", a: "τ = RC tells you how quickly a capacitor charges or discharges through a resistor. After one τ the capacitor reaches ~63% of its final voltage; after 5τ it is considered fully charged." },
        { q: "What unit should I enter — µF, nF, or pF?", a: "Enter all values in the same unit (µF by default). The results will be in that same unit. If your capacitors are in nF, divide by 1000 to convert to µF first." },
      ] }}>
      <div className="grid gap-3">
        <div><label className="label">Capacitances (µF)</label><input className="input" value={vals} onChange={(e) => setVals(e.target.value)} /></div>
        <div><label className="label">R (Ω) for time constant</label><input className="input" value={R} onChange={(e) => setR(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Parallel</div><div className="text-lg font-semibold">{r.parallel.toFixed(2)} µF</div><div className="mt-1 text-[11px] text-[rgb(var(--fg-muted))]">C = ΣCᵢ</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Series</div><div className="text-lg font-semibold">{r.series.toFixed(4)} µF</div><div className="mt-1 text-[11px] text-[rgb(var(--fg-muted))]">1/C = Σ(1/Cᵢ)</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">τ = RC</div><div className="text-lg font-semibold">{(r.tau * 1000).toFixed(2)} ms</div><div className="mt-1 text-[11px] text-[rgb(var(--fg-muted))]">τ = R × C</div></div>
        </div>
      )}
    </ToolPage>
  );
}

// Inductor: reactance Xl = 2πfL, energy = ½LI²
export function InductanceCalculator({ tool }: Props) {
  const [L, setL] = useState("10"); const [f, setF] = useState("60"); const [I, setI] = useState("1");
  const r = useMemo(() => {
    const Lh = parseFloat(L) * 1e-3, freq = parseFloat(f), cur = parseFloat(I);
    if (!Number.isFinite(Lh) || !Number.isFinite(freq) || !Number.isFinite(cur)) return null;
    return { xl: 2 * Math.PI * freq * Lh, energy: 0.5 * Lh * cur * cur };
  }, [L, f, I]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Enter inductance (mH), frequency (Hz), and current (A).", formula: "Inductive reactance: X_L = 2πfL. Energy stored: E = ½LI².", examples: "10 mH at 60 Hz → X_L ≈ 3.77 Ω. 1 A → 5 mJ.", faq: [{ q: "What is inductive reactance?", a: "Inductive reactance (X_L) is the opposition an inductor presents to AC current. It increases with both frequency and inductance: X_L = 2πfL." }, { q: "Why does an inductor block high frequencies more than low ones?", a: "Reactance is proportional to frequency, so a higher-frequency signal sees a higher impedance from the same inductor — this is the basis of low-pass filter design." }, { q: "Where is the energy stored in an inductor?", a: "Energy is stored in the inductor's magnetic field. The amount is E = ½LI², so doubling the current quadruples the stored energy." }] }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">L (mH)</label><input className="input" value={L} onChange={(e) => setL(e.target.value)} /></div>
        <div><label className="label">f (Hz)</label><input className="input" value={f} onChange={(e) => setF(e.target.value)} /></div>
        <div><label className="label">I (A)</label><input className="input" value={I} onChange={(e) => setI(e.target.value)} /></div>
      </div>
      {r && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Reactance X_L</div><div className="text-lg font-semibold">{r.xl.toFixed(4)} Ω</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Energy</div><div className="text-lg font-semibold">{(r.energy * 1000).toFixed(4)} mJ</div></div>
        </div>
      )}
    </ToolPage>
  );
}

// Decibel
export function DecibelCalculator({ tool }: Props) {
  const [a, setA] = useState("100"); const [b, setB] = useState("1");
  const [type, setType] = useState<"power" | "voltage">("power");
  const r = useMemo(() => {
    const x = parseFloat(a), y = parseFloat(b);
    if (!Number.isFinite(x) || !Number.isFinite(y) || y === 0) return null;
    return type === "power" ? 10 * Math.log10(x / y) : 20 * Math.log10(x / y);
  }, [a, b, type]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Compute dB from a ratio of powers (10 log) or voltages/amplitudes (20 log).", formula: "dB(power) = 10 × log10(P1/P2). dB(voltage) = 20 × log10(V1/V2).", examples: "Doubling power = +3 dB. Doubling voltage = +6 dB.", faq: [{ q: "What is a decibel?", a: "A decibel (dB) is a logarithmic unit expressing the ratio between two values. It is used for power and amplitude comparisons in audio, electronics, and communications." }, { q: "Why does doubling power equal +3 dB but doubling voltage equal +6 dB?", a: "Power is proportional to voltage squared (P ∝ V²), so the voltage formula uses 20 log instead of 10 log. A ×2 voltage ratio gives 20 × log₁₀(2) ≈ 6 dB, while a ×2 power ratio gives 10 × log₁₀(2) ≈ 3 dB." }, { q: "What does a negative dB value mean?", a: "A negative dB value means the numerator is smaller than the denominator — i.e. there is attenuation or loss rather than gain." }] }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Numerator</label><input className="input" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <div><label className="label">Denominator</label><input className="input" value={b} onChange={(e) => setB(e.target.value)} /></div>
        <div><label className="label">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}><option value="power">Power (10 log)</option><option value="voltage">Voltage (20 log)</option></select>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
        <div className="text-3xl font-bold">{r != null ? r.toFixed(4) + " dB" : "—"}</div>
      </div>
    </ToolPage>
  );
}

// Watts to Amps
export function WattsToAmps({ tool }: Props) {
  const [W, setW] = useState("1500"); const [V, setV] = useState("120"); const [pf, setPf] = useState("1");
  const r = useMemo(() => {
    const w = parseFloat(W), v = parseFloat(V), p = parseFloat(pf);
    if (!Number.isFinite(w) || !Number.isFinite(v) || !Number.isFinite(p) || v === 0) return null;
    return w / (v * p);
  }, [W, V, pf]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Enter power, voltage, and (for AC) the power factor.", formula: "I = P / (V × PF). For DC or purely resistive AC, PF = 1.", examples: "1500 W at 120 V → 12.5 A.", faq: [{ q: "How do I convert watts to amps?", a: "Divide watts by volts: I = P / V. For AC circuits with reactive loads, also divide by the power factor: I = P / (V × PF)." }, { q: "What power factor should I use?", a: "Use 1.0 for DC circuits and purely resistive AC loads (heaters, incandescent bulbs). Use 0.8–0.95 for motors, transformers, and switching power supplies." }, { q: "Why does a higher power factor mean lower current for the same watts?", a: "A poor power factor means the current and voltage are out of phase, so more current must flow to deliver the same real power. Improving power factor reduces wasted current." }] }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">Watts</label><input className="input" value={W} onChange={(e) => setW(e.target.value)} /></div>
        <div><label className="label">Volts</label><input className="input" value={V} onChange={(e) => setV(e.target.value)} /></div>
        <div><label className="label">Power factor</label><input className="input" value={pf} onChange={(e) => setPf(e.target.value)} /></div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
        <div className="text-3xl font-bold">{r != null ? r.toFixed(4) + " A" : "—"}</div>
      </div>
    </ToolPage>
  );
}

// kVA calculator (single & three phase)
export function KvaCalculator({ tool }: Props) {
  const [kva, setKva] = useState("10"); const [V, setV] = useState("400"); const [phase, setPhase] = useState<"1" | "3">("3");
  const r = useMemo(() => {
    const k = parseFloat(kva), v = parseFloat(V);
    if (!Number.isFinite(k) || !Number.isFinite(v) || v === 0) return null;
    const I = phase === "1" ? (k * 1000) / v : (k * 1000) / (Math.sqrt(3) * v);
    return I;
  }, [kva, V, phase]);
  return (
    <ToolPage tool={tool} content={{ howTo: "Enter apparent power (kVA), line voltage, and phase configuration.", formula: "Single phase: I = (kVA × 1000) / V. Three phase: I = (kVA × 1000) / (√3 × V_line).", examples: "10 kVA @ 400 V three-phase ≈ 14.43 A.", faq: [{ q: "What is kVA and how does it differ from kW?", a: "kVA is apparent power (voltage × current), while kW is real power actually consumed. They are related by kW = kVA × power factor." }, { q: "Why does three-phase use √3 in the formula?", a: "In a balanced three-phase system the line voltage is √3 times the phase voltage. The √3 factor accounts for this geometric relationship between the three phases." }, { q: "When do I need to calculate current from kVA?", a: "Generator sizing, transformer capacity, and breaker/cable selection are all rated in kVA. Converting to amps lets you verify that wiring and protective devices are correctly rated." }] }}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="label">kVA</label><input className="input" value={kva} onChange={(e) => setKva(e.target.value)} /></div>
        <div><label className="label">Voltage</label><input className="input" value={V} onChange={(e) => setV(e.target.value)} /></div>
        <div><label className="label">Phase</label><select className="input" value={phase} onChange={(e) => setPhase(e.target.value as any)}><option value="1">Single</option><option value="3">Three</option></select></div>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4 text-center">
        <div className="text-3xl font-bold">{r != null ? r.toFixed(2) + " A" : "—"}</div>
      </div>
    </ToolPage>
  );
}

// AWG wire size: diameter (mm) = 0.127 × 92^((36 - n)/39)
export function AwgWireSize({ tool }: Props) {
  const [mode, setMode] = useState<"awg" | "mm2">("awg");
  const [n, setN] = useState("12");      // AWG
  const [mm2, setMm2] = useState("3.31"); // metric area
  const r = useMemo(() => {
    let N: number;
    if (mode === "awg") {
      N = parseFloat(n);
      if (!Number.isFinite(N) || N < -3 || N > 40) return null;
    } else {
      const a = parseFloat(mm2);
      if (!Number.isFinite(a) || a <= 0) return null;
      // Invert area = π × ((0.127 × 92^((36 − AWG)/39))/2)². Solve for AWG.
      const d = 2 * Math.sqrt(a / Math.PI);  // diameter in mm
      N = 36 - 39 * (Math.log(d / 0.127) / Math.log(92));
    }
    const dMm = 0.127 * Math.pow(92, (36 - N) / 39);
    const area = Math.PI * (dMm / 2) ** 2;
    return { N, dMm, dIn: dMm / 25.4, area };
  }, [mode, n, mm2]);
  return (
    <ToolPage tool={tool} content={{
      howTo: "Pick the input direction. 'AWG → mm²' is the classic lookup; 'mm² → AWG' is for engineers spec'ing wire by metric cross-section.",
      formula: "diameter (mm) = 0.127 × 92^((36 − AWG)/39). Area (mm²) = π × (d/2)². Inverse: AWG = 36 − 39 × log₉₂(d/0.127).",
      examples: "AWG 12 ≈ 2.05 mm dia, 3.31 mm² cross-section. 4 mm² ≈ AWG 11.",
      faq: [{ q: "Ampacity?", a: "Depends on insulation and bundling — consult NEC tables. AWG 12 is rated ~20 A typical residential." }],
    }}>
      <div className="flex gap-2 mb-3">
        {(["awg", "mm2"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`min-tap rounded-xl px-3 py-2 text-sm ${mode === m ? "bg-brand-gradient text-white shadow-glow" : "btn-ghost"}`}>
            {m === "awg" ? "AWG → mm²" : "mm² → AWG"}
          </button>
        ))}
      </div>
      {mode === "awg" ? (
        <><label className="label">AWG number</label><input className="input" value={n} onChange={(e) => setN(e.target.value)} /></>
      ) : (
        <><label className="label">Cross-sectional area (mm²)</label><input className="input" value={mm2} onChange={(e) => setMm2(e.target.value)} /></>
      )}
      {r && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">AWG</div><div className="text-lg font-semibold">{Number.isInteger(r.N) ? r.N : r.N.toFixed(2)}</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Diameter (mm)</div><div className="text-lg font-semibold">{r.dMm.toFixed(3)}</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Diameter (in)</div><div className="text-lg font-semibold">{r.dIn.toFixed(4)}</div></div>
          <div className="rounded-xl border border-[rgb(var(--border))] p-3"><div className="text-xs text-[rgb(var(--fg-muted))]">Area (mm²)</div><div className="text-lg font-semibold">{r.area.toFixed(3)}</div></div>
        </div>
      )}
    </ToolPage>
  );
}
