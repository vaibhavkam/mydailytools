"use client";

import UnitConverter, { type UnitDef } from "./UnitConverter";
import type { Tool } from "@/lib/tools";

type Props = { tool: Tool & { categorySlug: string; categoryName: string } };

const make = (units: UnitDef[], defaultFrom: string, content: any) =>
  function ConverterImpl({ tool }: Props) {
    return <UnitConverter tool={tool} units={units} defaultFrom={defaultFrom} content={content} />;
  };

// Weight: base = kilogram
export const WeightConverter = make(
  [
    { key: "mg", label: "Milligrams (mg)", toBase: 1e-6 },
    { key: "g", label: "Grams (g)", toBase: 0.001 },
    { key: "kg", label: "Kilograms (kg)", toBase: 1 },
    { key: "t", label: "Metric tons (t)", toBase: 1000 },
    { key: "oz", label: "Ounces (oz)", toBase: 0.0283495231 },
    { key: "lb", label: "Pounds (lb)", toBase: 0.45359237 },
    { key: "st", label: "Stones (st)", toBase: 6.35029318 },
    { key: "ton-us", label: "US tons", toBase: 907.18474 },
  ],
  "kg",
  { howTo: "Pick a value and unit; everything else updates.", formula: "All units scale through kilograms via fixed factors.", examples: "1 kg = 2.20462 lb. 1 stone = 14 lb.", faq: [] }
);

// Area: base = square meter
export const AreaConverter = make(
  [
    { key: "mm2", label: "Square millimeters", toBase: 1e-6 },
    { key: "cm2", label: "Square centimeters", toBase: 1e-4 },
    { key: "m2", label: "Square meters", toBase: 1 },
    { key: "ha", label: "Hectares", toBase: 10000 },
    { key: "km2", label: "Square kilometers", toBase: 1e6 },
    { key: "in2", label: "Square inches", toBase: 0.00064516 },
    { key: "ft2", label: "Square feet", toBase: 0.09290304 },
    { key: "yd2", label: "Square yards", toBase: 0.83612736 },
    { key: "ac", label: "Acres", toBase: 4046.8564224 },
    { key: "mi2", label: "Square miles", toBase: 2589988.110336 },
  ],
  "m2",
  { howTo: "Convert between metric and imperial area units.", formula: "Each unit has a constant conversion to square meters.", examples: "1 acre ≈ 0.4047 ha = 4047 m². 1 km² = 100 ha.", faq: [] }
);

// Volume: base = liter
export const VolumeConverter = make(
  [
    { key: "ml", label: "Milliliters (ml)", toBase: 0.001 },
    { key: "l", label: "Liters (L)", toBase: 1 },
    { key: "m3", label: "Cubic meters", toBase: 1000 },
    { key: "tsp", label: "Teaspoons (US)", toBase: 0.00492892 },
    { key: "tbsp", label: "Tablespoons (US)", toBase: 0.0147868 },
    { key: "floz", label: "Fluid ounces (US)", toBase: 0.0295735 },
    { key: "cup", label: "Cups (US)", toBase: 0.236588 },
    { key: "pt", label: "Pints (US)", toBase: 0.473176 },
    { key: "qt", label: "Quarts (US)", toBase: 0.946353 },
    { key: "gal", label: "Gallons (US)", toBase: 3.78541 },
    { key: "imp-gal", label: "Imperial gallons", toBase: 4.54609 },
  ],
  "l",
  { howTo: "Pick a value and unit. Volumes use US customary by default.", formula: "All units scale through liters.", examples: "1 gal (US) ≈ 3.785 L. 1 imperial gal ≈ 4.546 L.", faq: [] }
);

// Time: base = second
export const TimeConverter = make(
  [
    { key: "ms", label: "Milliseconds", toBase: 0.001 },
    { key: "s", label: "Seconds", toBase: 1 },
    { key: "min", label: "Minutes", toBase: 60 },
    { key: "h", label: "Hours", toBase: 3600 },
    { key: "d", label: "Days", toBase: 86400 },
    { key: "w", label: "Weeks", toBase: 604800 },
    { key: "mo", label: "Months (avg 30.44 d)", toBase: 2629746 },
    { key: "y", label: "Years (365.25 d)", toBase: 31557600 },
  ],
  "h",
  { howTo: "Months and years use average lengths (30.44 d, 365.25 d) for ratios; use the date calculator for exact calendar math.", formula: "Linear factors to seconds.", examples: "1 day = 86,400 s. 1 year ≈ 31.56 million s.", faq: [] }
);

// Speed: base = m/s
export const SpeedConverter = make(
  [
    { key: "ms", label: "m/s", toBase: 1 },
    { key: "kmh", label: "km/h", toBase: 1 / 3.6 },
    { key: "mph", label: "mph", toBase: 0.44704 },
    { key: "fps", label: "ft/s", toBase: 0.3048 },
    { key: "knot", label: "Knots", toBase: 0.514444 },
    { key: "c", label: "Speed of light", toBase: 299792458 },
  ],
  "kmh",
  { howTo: "Convert between common speed units, including knots used in maritime/aviation.", formula: "Linear scaling through meters per second.", examples: "60 mph ≈ 96.56 km/h ≈ 26.82 m/s. 1 knot = 1.852 km/h.", faq: [] }
);

// Pressure: base = pascal
export const PressureConverter = make(
  [
    { key: "pa", label: "Pascal (Pa)", toBase: 1 },
    { key: "kpa", label: "Kilopascal (kPa)", toBase: 1000 },
    { key: "bar", label: "Bar", toBase: 100000 },
    { key: "atm", label: "Atmosphere (atm)", toBase: 101325 },
    { key: "psi", label: "PSI", toBase: 6894.757293168 },
    { key: "torr", label: "Torr (mmHg)", toBase: 133.322387415 },
  ],
  "atm",
  { howTo: "Pick the input unit; the rest scale through pascals.", formula: "1 atm = 101325 Pa = 1.01325 bar = 14.696 psi.", examples: "Sea-level pressure ≈ 1 atm ≈ 1.013 bar.", faq: [] }
);

// Energy: base = joule
export const EnergyConverter = make(
  [
    { key: "j", label: "Joules (J)", toBase: 1 },
    { key: "kj", label: "Kilojoules (kJ)", toBase: 1000 },
    { key: "cal", label: "Calorie (cal)", toBase: 4.184 },
    { key: "kcal", label: "Kilocalorie (kcal)", toBase: 4184 },
    { key: "wh", label: "Watt-hour (Wh)", toBase: 3600 },
    { key: "kwh", label: "Kilowatt-hour (kWh)", toBase: 3.6e6 },
    { key: "btu", label: "BTU", toBase: 1055.05585 },
    { key: "ev", label: "Electron-volt (eV)", toBase: 1.602176634e-19 },
  ],
  "kwh",
  { howTo: "Energy units span 38 orders of magnitude — from eV (atomic) to GJ (industrial).", formula: "Linear scaling through joules.", examples: "1 kWh = 3.6 MJ ≈ 860 kcal.", faq: [] }
);

// Power: base = watt
export const PowerConverter = make(
  [
    { key: "mw", label: "Milliwatts (mW)", toBase: 0.001 },
    { key: "w", label: "Watts (W)", toBase: 1 },
    { key: "kw", label: "Kilowatts (kW)", toBase: 1000 },
    { key: "mw2", label: "Megawatts (MW)", toBase: 1e6 },
    { key: "hp", label: "Mechanical horsepower", toBase: 745.6998715822702 },
    { key: "hp-m", label: "Metric horsepower", toBase: 735.49875 },
    { key: "btu-h", label: "BTU/hour", toBase: 0.29307107 },
  ],
  "kw",
  { howTo: "Watts is the SI unit; horsepower exists in two flavors that differ by ~1.4%.", formula: "Linear scaling through watts.", examples: "100 hp (mech) ≈ 74.57 kW.", faq: [] }
);

// Force: base = newton
export const ForceConverter = make(
  [
    { key: "n", label: "Newton (N)", toBase: 1 },
    { key: "kn", label: "Kilonewton (kN)", toBase: 1000 },
    { key: "kgf", label: "Kilogram-force", toBase: 9.80665 },
    { key: "lbf", label: "Pound-force (lbf)", toBase: 4.4482216152605 },
    { key: "dyne", label: "Dyne", toBase: 1e-5 },
  ],
  "n",
  { howTo: "1 N is the force to accelerate 1 kg by 1 m/s².", formula: "Linear scaling through newtons.", examples: "1 kgf ≈ 9.81 N (gravity at sea level).", faq: [] }
);

// Angle: base = radian
export const AngleConverter = make(
  [
    { key: "rad", label: "Radians", toBase: 1 },
    { key: "deg", label: "Degrees", toBase: Math.PI / 180 },
    { key: "grad", label: "Gradians", toBase: Math.PI / 200 },
    { key: "turn", label: "Turns", toBase: 2 * Math.PI },
    { key: "arcmin", label: "Arcminutes", toBase: Math.PI / 10800 },
    { key: "arcsec", label: "Arcseconds", toBase: Math.PI / 648000 },
  ],
  "deg",
  { howTo: "180° = π rad. Trigonometric functions in most languages use radians.", formula: "Multiply degrees by π/180 to get radians.", examples: "90° = π/2 rad ≈ 1.5708.", faq: [] }
);

// Frequency: base = hertz
export const FrequencyConverter = make(
  [
    { key: "hz", label: "Hertz (Hz)", toBase: 1 },
    { key: "khz", label: "Kilohertz", toBase: 1000 },
    { key: "mhz", label: "Megahertz", toBase: 1e6 },
    { key: "ghz", label: "Gigahertz", toBase: 1e9 },
    { key: "rpm", label: "Revolutions/min", toBase: 1 / 60 },
  ],
  "mhz",
  { howTo: "Hertz = cycles per second. RPM = revolutions per minute, common for engines.", formula: "Linear scaling through hertz; 1 RPM = 1/60 Hz.", examples: "Wi-Fi 5 GHz = 5 × 10⁹ Hz. 3000 RPM = 50 Hz.", faq: [] }
);

// Data storage: base = byte (binary IEC)
export const DataStorageConverter = make(
  [
    { key: "b", label: "Bits", toBase: 1 / 8 },
    { key: "B", label: "Bytes", toBase: 1 },
    { key: "KB", label: "Kilobytes (decimal)", toBase: 1000 },
    { key: "MB", label: "Megabytes (decimal)", toBase: 1e6 },
    { key: "GB", label: "Gigabytes (decimal)", toBase: 1e9 },
    { key: "TB", label: "Terabytes (decimal)", toBase: 1e12 },
    { key: "KiB", label: "Kibibytes (binary)", toBase: 1024 },
    { key: "MiB", label: "Mebibytes (binary)", toBase: 1024 ** 2 },
    { key: "GiB", label: "Gibibytes (binary)", toBase: 1024 ** 3 },
    { key: "TiB", label: "Tebibytes (binary)", toBase: 1024 ** 4 },
  ],
  "MB",
  { howTo: "Distinguishes decimal SI prefixes (MB = 10⁶) from binary IEC prefixes (MiB = 2²⁰). Hard drives use decimal; OS file sizes are usually binary.", formula: "Linear scaling through bytes.", examples: "1 GB = 10⁹ bytes ≈ 0.931 GiB.", faq: [] }
);

// Fuel economy is inverse-proportional — implemented separately in FuelEconomyConverter.tsx.
