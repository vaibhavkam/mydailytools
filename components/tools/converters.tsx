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
  { howTo: "Pick a value and unit; everything else updates.", formula: "All units scale through kilograms via fixed factors.", examples: "1 kg = 2.20462 lb. 1 stone = 14 lb.", faq: [
    { q: "How many pounds are in a kilogram?", a: "1 kilogram equals approximately 2.20462 pounds." },
    { q: "How do I convert pounds to kilograms?", a: "Divide the number of pounds by 2.20462. For example, 150 lb ÷ 2.20462 ≈ 68.04 kg." },
    { q: "What is a stone in pounds and kilograms?", a: "1 stone equals exactly 14 pounds or approximately 6.35 kilograms, commonly used for body weight in the UK." },
    { q: "How many grams are in an ounce?", a: "1 ounce (oz) equals approximately 28.35 grams." },
  ] }
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
  { howTo: "Convert between metric and imperial area units.", formula: "Each unit has a constant conversion to square meters.", examples: "1 acre ≈ 0.4047 ha = 4047 m². 1 km² = 100 ha.", faq: [
    { q: "How many acres are in a hectare?", a: "1 hectare equals approximately 2.471 acres." },
    { q: "How do I convert square feet to square meters?", a: "Multiply square feet by 0.0929. For example, 1000 sq ft × 0.0929 ≈ 92.9 m²." },
    { q: "How many square feet are in an acre?", a: "1 acre equals exactly 43,560 square feet." },
    { q: "What is the difference between a hectare and a square kilometer?", a: "1 square kilometer equals 100 hectares, or 1 km² = 1,000,000 m² while 1 ha = 10,000 m²." },
  ] }
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
  { howTo: "Pick a value and unit. Volumes use US customary by default.", formula: "All units scale through liters.", examples: "1 gal (US) ≈ 3.785 L. 1 imperial gal ≈ 4.546 L.", faq: [
    { q: "How many cups are in a gallon?", a: "There are 16 US cups in 1 US gallon." },
    { q: "How many milliliters are in a tablespoon?", a: "1 US tablespoon equals approximately 14.79 milliliters." },
    { q: "What is the difference between a US gallon and an imperial gallon?", a: "A US gallon is approximately 3.785 liters while a UK imperial gallon is approximately 4.546 liters — about 20% larger." },
    { q: "How many teaspoons are in a tablespoon?", a: "There are exactly 3 teaspoons in 1 tablespoon (US customary)." },
  ] }
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
  { howTo: "Months and years use average lengths (30.44 d, 365.25 d) for ratios; use the date calculator for exact calendar math.", formula: "Linear factors to seconds.", examples: "1 day = 86,400 s. 1 year ≈ 31.56 million s.", faq: [
    { q: "How many seconds are in a day?", a: "There are exactly 86,400 seconds in a day (24 hours × 60 minutes × 60 seconds)." },
    { q: "How many hours are in a year?", a: "A standard year has 8,760 hours; a leap year has 8,784 hours. Using the average of 365.25 days gives 8,766 hours." },
    { q: "How many weeks are in a year?", a: "A year has approximately 52.18 weeks (365.25 days ÷ 7)." },
    { q: "How many minutes are in a week?", a: "There are 10,080 minutes in a week (7 days × 24 hours × 60 minutes)." },
  ] }
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
  { howTo: "Convert between common speed units, including knots used in maritime/aviation.", formula: "Linear scaling through meters per second.", examples: "60 mph ≈ 96.56 km/h ≈ 26.82 m/s. 1 knot = 1.852 km/h.", faq: [
    { q: "How do I convert mph to km/h?", a: "Multiply mph by 1.60934. For example, 60 mph × 1.60934 ≈ 96.56 km/h." },
    { q: "What is a knot in mph?", a: "1 knot equals approximately 1.151 mph or 1.852 km/h. Knots are used in maritime and aviation contexts." },
    { q: "How fast is the speed of light in km/h?", a: "The speed of light is approximately 1,079,252,848 km/h (about 299,792 km/s)." },
    { q: "How do I convert km/h to m/s?", a: "Divide km/h by 3.6. For example, 90 km/h ÷ 3.6 = 25 m/s." },
  ] }
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
  { howTo: "Pick the input unit; the rest scale through pascals.", formula: "1 atm = 101325 Pa = 1.01325 bar = 14.696 psi.", examples: "Sea-level pressure ≈ 1 atm ≈ 1.013 bar.", faq: [
    { q: "How many PSI is 1 bar?", a: "1 bar equals approximately 14.504 PSI." },
    { q: "What is the difference between bar and atm?", a: "1 atmosphere (atm) is approximately 1.01325 bar. They are very close — standard sea-level pressure is defined as 1 atm or 1.01325 bar." },
    { q: "What does PSI stand for?", a: "PSI stands for pounds per square inch, the most common pressure unit used in the United States for tire pressure, hydraulics, and gas cylinders." },
    { q: "How do I convert psi to kPa?", a: "Multiply PSI by 6.89476. For example, 30 PSI × 6.89476 ≈ 206.8 kPa." },
  ] }
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
  { howTo: "Energy units span 38 orders of magnitude — from eV (atomic) to GJ (industrial).", formula: "Linear scaling through joules.", examples: "1 kWh = 3.6 MJ ≈ 860 kcal.", faq: [
    { q: "What is the difference between a calorie and a kilocalorie?", a: "1 kilocalorie (kcal) equals 1,000 small calories (cal). Food labels use kcal, often written as 'Cal' (capital C) or simply 'calories' in everyday speech." },
    { q: "How many joules are in a kilowatt-hour?", a: "1 kilowatt-hour (kWh) equals 3,600,000 joules (3.6 MJ)." },
    { q: "What is a BTU?", a: "A BTU (British Thermal Unit) is the energy needed to raise 1 pound of water by 1°F. 1 BTU ≈ 1055 joules. It is commonly used for air conditioner and heater ratings." },
    { q: "How do I convert kcal to kJ?", a: "Multiply kcal by 4.184. For example, 500 kcal × 4.184 = 2,092 kJ." },
  ] }
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
  { howTo: "Watts is the SI unit; horsepower exists in two flavors that differ by ~1.4%.", formula: "Linear scaling through watts.", examples: "100 hp (mech) ≈ 74.57 kW.", faq: [
    { q: "How many watts are in one horsepower?", a: "1 mechanical horsepower equals approximately 745.7 watts. Metric horsepower is slightly less at approximately 735.5 watts." },
    { q: "What is the difference between mechanical and metric horsepower?", a: "Mechanical (imperial) horsepower equals 745.7 W and is standard in the US. Metric horsepower equals 735.5 W and is used in Europe. They differ by about 1.4%." },
    { q: "How do I convert kilowatts to horsepower?", a: "Multiply kilowatts by 1.341 to get mechanical horsepower. For example, 100 kW × 1.341 ≈ 134.1 hp." },
    { q: "What does BTU/hour measure?", a: "BTU/hour is a unit of power (energy per time) commonly used for heating and cooling equipment ratings, such as air conditioners." },
  ] }
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
  { howTo: "1 N is the force to accelerate 1 kg by 1 m/s².", formula: "Linear scaling through newtons.", examples: "1 kgf ≈ 9.81 N (gravity at sea level).", faq: [
    { q: "What is the difference between a newton and a kilogram-force?", a: "A newton (N) is the SI unit of force. A kilogram-force (kgf) is the force exerted by 1 kg under standard gravity (9.80665 m/s²), so 1 kgf ≈ 9.807 N." },
    { q: "How many newtons are in a pound-force?", a: "1 pound-force (lbf) equals approximately 4.448 newtons." },
    { q: "What is a dyne?", a: "A dyne is the CGS unit of force equal to 10⁻⁵ newtons. It is the force needed to accelerate 1 gram by 1 cm/s²." },
    { q: "How do I convert newtons to pounds-force?", a: "Divide newtons by 4.44822. For example, 100 N ÷ 4.44822 ≈ 22.48 lbf." },
  ] }
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
  { howTo: "180° = π rad. Trigonometric functions in most languages use radians.", formula: "Multiply degrees by π/180 to get radians.", examples: "90° = π/2 rad ≈ 1.5708.", faq: [
    { q: "How do I convert degrees to radians?", a: "Multiply degrees by π/180 (approximately 0.01745). For example, 90° × π/180 = π/2 ≈ 1.5708 radians." },
    { q: "How do I convert radians to degrees?", a: "Multiply radians by 180/π (approximately 57.296). For example, 1 rad × 180/π ≈ 57.3°." },
    { q: "What is a gradian?", a: "A gradian (grad) divides a full circle into 400 equal parts, so a right angle is 100 gradians. Gradians are used in surveying and some European countries." },
    { q: "How many degrees are in a full circle?", a: "A full circle is 360 degrees, 2π radians, or 400 gradians." },
  ] }
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
  { howTo: "Hertz = cycles per second. RPM = revolutions per minute, common for engines.", formula: "Linear scaling through hertz; 1 RPM = 1/60 Hz.", examples: "Wi-Fi 5 GHz = 5 × 10⁹ Hz. 3000 RPM = 50 Hz.", faq: [
    { q: "What is the difference between Hz, kHz, MHz, and GHz?", a: "They are all units of frequency differing by factors of 1,000: 1 kHz = 1,000 Hz, 1 MHz = 1,000,000 Hz, 1 GHz = 1,000,000,000 Hz." },
    { q: "How do I convert RPM to Hz?", a: "Divide RPM by 60. For example, 3,600 RPM ÷ 60 = 60 Hz. This is why AC power in the US runs at 3,600 RPM generators." },
    { q: "What frequency is human hearing?", a: "Humans can generally hear sounds from about 20 Hz to 20,000 Hz (20 kHz). The range narrows with age." },
    { q: "What is the CPU frequency of a typical computer?", a: "Modern CPUs typically run at 3–5 GHz (3,000–5,000 MHz), meaning the processor executes billions of cycles per second." },
  ] }
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
  { howTo: "Distinguishes decimal SI prefixes (MB = 10⁶) from binary IEC prefixes (MiB = 2²⁰). Hard drives use decimal; OS file sizes are usually binary.", formula: "Linear scaling through bytes.", examples: "1 GB = 10⁹ bytes ≈ 0.931 GiB.", faq: [
    { q: "Why does my hard drive show less space than advertised?", a: "Hard drive manufacturers use decimal GB (1 GB = 1,000,000,000 bytes), but operating systems report in binary GiB (1 GiB = 1,073,741,824 bytes). A 1 TB drive shows as about 931 GiB in Windows or macOS." },
    { q: "What is the difference between MB and MiB?", a: "1 MB (megabyte) = 1,000,000 bytes using the decimal SI standard. 1 MiB (mebibyte) = 1,048,576 bytes using the binary IEC standard. The difference is about 4.9%." },
    { q: "How many bytes are in a gigabyte?", a: "1 GB (decimal) = 1,000,000,000 bytes. 1 GiB (binary) = 1,073,741,824 bytes." },
    { q: "How many bits are in a byte?", a: "There are exactly 8 bits in 1 byte. Network speeds are often measured in bits (Mbps), while file sizes use bytes (MB)." },
  ] }
);

// Fuel economy is inverse-proportional — implemented separately in FuelEconomyConverter.tsx.
