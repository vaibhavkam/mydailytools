import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { Tool } from "@/lib/tools";

type ToolProps = { tool: Tool & { categorySlug: string; categoryName: string } };

// Dynamic imports keep tool bundles out of the shared chunk — each tool page
// only ships the JS for its own widget. ssr stays enabled for SEO.
const REGISTRY: Record<string, ComponentType<ToolProps>> = {
  // Wave 0 (initial 5)
  "percentage-calculator": dynamic(() => import("./PercentageCalculator")),
  "json-formatter": dynamic(() => import("./JsonFormatter")),
  "password-generator": dynamic(() => import("./PasswordGenerator")),
  "length-converter": dynamic(() => import("./LengthConverter")),
  "word-counter": dynamic(() => import("./WordCounter")),

  // Wave 1
  "bmi-calculator": dynamic(() => import("./BmiCalculator")),
  "tip-calculator": dynamic(() => import("./TipCalculator")),
  "loan-calculator": dynamic(() => import("./LoanCalculator")),
  "age-calculator": dynamic(() => import("./AgeCalculator")),
  "unix-timestamp-converter": dynamic(() => import("./UnixTimestampConverter")),
  "uuid-generator": dynamic(() => import("./UuidGenerator")),
  "hash-generator": dynamic(() => import("./HashGenerator")),
  "base64-encoder-decoder": dynamic(() => import("./Base64EncoderDecoder")),
  "url-encoder-decoder": dynamic(() => import("./UrlEncoderDecoder")),
  "temperature-converter": dynamic(() => import("./TemperatureConverter")),

  // Wave A — math
  "fraction-calculator": dynamic(() => import("./FractionCalculator")),
  "gcf-calculator": dynamic(() => import("./GcfCalculator")),
  "lcm-calculator": dynamic(() => import("./LcmCalculator")),
  "average-calculator": dynamic(() => import("./AverageCalculator")),
  "ratio-calculator": dynamic(() => import("./RatioCalculator")),
  "root-calculator": dynamic(() => import("./RootCalculator")),
  "exponent-calculator": dynamic(() => import("./ExponentCalculator")),
  "logarithm-calculator": dynamic(() => import("./LogarithmCalculator")),
  "antilog-calculator": dynamic(() => import("./AntilogCalculator")),
  "factorial-calculator": dynamic(() => import("./FactorialCalculator")),
  "permutation-combination-calculator": dynamic(() => import("./PermutationCombination")),
  "probability-calculator": dynamic(() => import("./ProbabilityCalculator")),
  "rounding-calculator": dynamic(() => import("./RoundingCalculator")),
  "standard-deviation-calculator": dynamic(() => import("./StandardDeviation")),
  "scientific-calculator": dynamic(() => import("./ScientificCalculator")),

  // Wave B — harder math
  "equation-solver": dynamic(() => import("./EquationSolver")),
  "matrix-calculator": dynamic(() => import("./MatrixCalculator")),
  "triangle-calculator": dynamic(() => import("./TriangleCalculator")),
  "circle-calculator": dynamic(() => import("./CircleCalculator")),

  // Wave C — converters via shared base
  "weight-converter": dynamic(() => import("./converters").then((m) => ({ default: m.WeightConverter }))),
  "area-converter": dynamic(() => import("./converters").then((m) => ({ default: m.AreaConverter }))),
  "volume-converter": dynamic(() => import("./converters").then((m) => ({ default: m.VolumeConverter }))),
  "time-converter": dynamic(() => import("./converters").then((m) => ({ default: m.TimeConverter }))),
  "speed-converter": dynamic(() => import("./converters").then((m) => ({ default: m.SpeedConverter }))),
  "pressure-converter": dynamic(() => import("./converters").then((m) => ({ default: m.PressureConverter }))),
  "energy-converter": dynamic(() => import("./converters").then((m) => ({ default: m.EnergyConverter }))),
  "power-converter": dynamic(() => import("./converters").then((m) => ({ default: m.PowerConverter }))),
  "force-converter": dynamic(() => import("./converters").then((m) => ({ default: m.ForceConverter }))),
  "angle-converter": dynamic(() => import("./converters").then((m) => ({ default: m.AngleConverter }))),
  "frequency-converter": dynamic(() => import("./converters").then((m) => ({ default: m.FrequencyConverter }))),
  "data-storage-converter": dynamic(() => import("./converters").then((m) => ({ default: m.DataStorageConverter }))),
  "fuel-economy-converter": dynamic(() => import("./FuelEconomyConverter")),
  "paper-size-converter": dynamic(() => import("./regional").then((m) => ({ default: m.PaperSize }))),
  "shoe-size-converter": dynamic(() => import("./regional").then((m) => ({ default: m.ShoeSize }))),
  "clothing-size-converter": dynamic(() => import("./regional").then((m) => ({ default: m.ClothingSize }))),

  // Wave C — number bases
  "binary-decimal-converter": dynamic(() => import("./NumberBases").then((m) => ({ default: m.BinaryDecimal }))),
  "hex-decimal-converter": dynamic(() => import("./NumberBases").then((m) => ({ default: m.HexDecimal }))),
  "binary-hex-converter": dynamic(() => import("./NumberBases").then((m) => ({ default: m.BinaryHex }))),
  "octal-decimal-converter": dynamic(() => import("./NumberBases").then((m) => ({ default: m.OctalDecimal }))),
  "ascii-converter": dynamic(() => import("./NumberBases").then((m) => ({ default: m.AsciiConverter }))),
  "bcd-converter": dynamic(() => import("./NumberBases").then((m) => ({ default: m.BcdConverter }))),
  "roman-numeral-converter": dynamic(() => import("./NumberBases").then((m) => ({ default: m.RomanNumeralConverter }))),
  "number-base-converter": dynamic(() => import("./NumberBases").then((m) => ({ default: m.NumberBaseConverter }))),

  // Wave E — text
  "case-converter": dynamic(() => import("./text").then((m) => ({ default: m.CaseConverter }))),
  "text-reverser": dynamic(() => import("./text").then((m) => ({ default: m.TextReverser }))),
  "lorem-ipsum-generator": dynamic(() => import("./text").then((m) => ({ default: m.LoremIpsum }))),
  "find-and-replace": dynamic(() => import("./text").then((m) => ({ default: m.FindReplace }))),
  "text-diff": dynamic(() => import("./text").then((m) => ({ default: m.TextDiff }))),
  "remove-duplicate-lines": dynamic(() => import("./text").then((m) => ({ default: m.RemoveDuplicates }))),
  "sort-lines": dynamic(() => import("./text").then((m) => ({ default: m.SortLines }))),
  "text-to-slug": dynamic(() => import("./text").then((m) => ({ default: m.TextToSlug }))),

  // Wave F — developer
  "html-editor": dynamic(() => import("./developer").then((m) => ({ default: m.HtmlEditor }))),
  "css-minifier": dynamic(() => import("./developer").then((m) => ({ default: m.CssMinifier }))),
  "js-minifier": dynamic(() => import("./developer").then((m) => ({ default: m.JsMinifier }))),
  "xml-formatter": dynamic(() => import("./developer").then((m) => ({ default: m.XmlFormatter }))),
  "html-encoder": dynamic(() => import("./developer").then((m) => ({ default: m.HtmlEntities }))),
  "regex-tester": dynamic(() => import("./developer").then((m) => ({ default: m.RegexTester }))),
  "color-picker": dynamic(() => import("./developer").then((m) => ({ default: m.ColorPicker }))),
  "htaccess-generator": dynamic(() => import("./developer").then((m) => ({ default: m.HtaccessGenerator }))),
  "jwt-decoder": dynamic(() => import("./developer").then((m) => ({ default: m.JwtDecoder }))),
  "yaml-to-json": dynamic(() => import("./developer").then((m) => ({ default: m.YamlJson }))),

  // Tier 1+2 dev/network tools
  "cron-expression-parser": dynamic(() => import("./CronExpressionParser")),
  "json-to-csv": dynamic(() => import("./JsonCsv")),
  "json-to-typescript": dynamic(() => import("./JsonToTypescript")),
  "token-counter": dynamic(() => import("./TokenCounter")),
  "llm-schema-validator": dynamic(() => import("./LlmSchemaValidator")),
  "sql-formatter": dynamic(() => import("./SqlFormatter")),
  "markdown-preview": dynamic(() => import("./MarkdownPreview")),
  "jwt-generator": dynamic(() => import("./JwtGenerator")),
  "string-escape": dynamic(() => import("./StringEscape")),
  "url-parser": dynamic(() => import("./UrlParser")),
  "gitignore-generator": dynamic(() => import("./GitignoreGenerator")),
  "cidr-calculator": dynamic(() => import("./CidrCalculator")),
  "ssl-certificate-decoder": dynamic(() => import("./SslCertificateDecoder")),
  "password-strength-checker": dynamic(() => import("./PasswordStrengthChecker")),
  "image-to-base64": dynamic(() => import("./ImageToBase64")),

  // List & clipboard tools
  "comma-lines-converter": dynamic(() => import("./list").then((m) => ({ default: m.CommaLines }))),
  "list-set-operations": dynamic(() => import("./list").then((m) => ({ default: m.ListSetOps }))),
  "list-stats": dynamic(() => import("./list").then((m) => ({ default: m.ListStats }))),
  "number-sequence-generator": dynamic(() => import("./list").then((m) => ({ default: m.NumberSequence }))),
  "list-json-array": dynamic(() => import("./list").then((m) => ({ default: m.ListJsonArray }))),
  "prefix-suffix-wrapper": dynamic(() => import("./list").then((m) => ({ default: m.PrefixSuffix }))),
  "column-picker": dynamic(() => import("./list").then((m) => ({ default: m.ColumnPicker }))),
  "list-filter": dynamic(() => import("./list").then((m) => ({ default: m.ListFilter }))),

  // Design pack
  "wcag-contrast-checker": dynamic(() => import("./design").then((m) => ({ default: m.WcagContrastChecker }))),
  "css-gradient-generator": dynamic(() => import("./design").then((m) => ({ default: m.CssGradient }))),
  "box-shadow-generator": dynamic(() => import("./design").then((m) => ({ default: m.BoxShadowGenerator }))),
  "border-radius-generator": dynamic(() => import("./design").then((m) => ({ default: m.BorderRadius }))),
  "type-scale-generator": dynamic(() => import("./design").then((m) => ({ default: m.TypeScale }))),
  "spacing-scale-generator": dynamic(() => import("./design").then((m) => ({ default: m.SpacingScale }))),
  "aspect-ratio-calculator": dynamic(() => import("./design").then((m) => ({ default: m.AspectRatio }))),
  "pixel-rem-converter": dynamic(() => import("./design").then((m) => ({ default: m.PxRem }))),
  "color-palette-from-image": dynamic(() => import("./design").then((m) => ({ default: m.ImagePalette }))),

  // Health pack
  "bsa-calculator": dynamic(() => import("./health").then((m) => ({ default: m.Bsa }))),
  "egfr-calculator": dynamic(() => import("./health").then((m) => ({ default: m.Egfr }))),
  "creatinine-clearance": dynamic(() => import("./health").then((m) => ({ default: m.CreatinineClearance }))),
  "meld-score": dynamic(() => import("./health").then((m) => ({ default: m.Meld }))),
  "chads-vasc": dynamic(() => import("./health").then((m) => ({ default: m.Chads }))),
  "wells-pe-score": dynamic(() => import("./health").then((m) => ({ default: m.WellsPe }))),
  "anion-gap": dynamic(() => import("./health").then((m) => ({ default: m.AnionGap }))),
  "pediatric-dosing": dynamic(() => import("./health").then((m) => ({ default: m.PediatricDose }))),
  "iv-drip-rate": dynamic(() => import("./health").then((m) => ({ default: m.IvDrip }))),
  "due-date-calculator": dynamic(() => import("./health").then((m) => ({ default: m.DueDate }))),
  "heart-rate-zones": dynamic(() => import("./health").then((m) => ({ default: m.HrZones }))),
  "ideal-body-weight": dynamic(() => import("./health").then((m) => ({ default: m.IdealWeight }))),

  // Marketing/SEO pack
  "cpm-cpc-calculator": dynamic(() => import("./marketing").then((m) => ({ default: m.CpmCpcCtr }))),
  "roas-calculator": dynamic(() => import("./marketing").then((m) => ({ default: m.Roas }))),
  "conversion-rate-calculator": dynamic(() => import("./marketing").then((m) => ({ default: m.ConversionRate }))),
  "ab-test-significance": dynamic(() => import("./marketing").then((m) => ({ default: m.AbTest }))),
  "ltv-cac-calculator": dynamic(() => import("./marketing").then((m) => ({ default: m.LtvCac }))),
  "utm-builder": dynamic(() => import("./marketing").then((m) => ({ default: m.UtmBuilder }))),
  "serp-snippet-preview": dynamic(() => import("./marketing").then((m) => ({ default: m.SerpPreview }))),

  // Finance Pro pack
  "npv-irr-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.NpvIrr }))),
  "wacc-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.Wacc }))),
  "capm-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.Capm }))),
  "bond-pricing-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.BondPricing }))),
  "black-scholes-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.BlackScholes }))),
  "sharpe-ratio-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.Sharpe }))),
  "cagr-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.Cagr }))),
  "margin-markup-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.MarginMarkup }))),
  "annuity-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.Annuity }))),
  "ear-apr-calculator": dynamic(() => import("./finance-pro").then((m) => ({ default: m.EarApr }))),

  // Final batch — finance, random, encode tools
  "mortgage-calculator": dynamic(() => import("./finance").then((m) => ({ default: m.MortgageCalculator }))),
  "compound-interest-calculator": dynamic(() => import("./finance").then((m) => ({ default: m.CompoundInterest }))),
  "discount-calculator": dynamic(() => import("./finance").then((m) => ({ default: m.DiscountCalculator }))),
  "sales-tax-calculator": dynamic(() => import("./finance").then((m) => ({ default: m.SalesTaxCalculator }))),
  "salary-calculator": dynamic(() => import("./finance").then((m) => ({ default: m.SalaryCalculator }))),
  "roi-calculator": dynamic(() => import("./finance").then((m) => ({ default: m.RoiCalculator }))),
  "inflation-calculator": dynamic(() => import("./finance").then((m) => ({ default: m.InflationCalculator }))),
  "random-number-generator": dynamic(() => import("./random").then((m) => ({ default: m.RandomNumberGenerator }))),
  "dice-roller": dynamic(() => import("./random").then((m) => ({ default: m.DiceRoller }))),
  "coin-flipper": dynamic(() => import("./random").then((m) => ({ default: m.CoinFlipper }))),
  "random-color-generator": dynamic(() => import("./random").then((m) => ({ default: m.RandomColorGenerator }))),
  "random-name-generator": dynamic(() => import("./random").then((m) => ({ default: m.RandomNameGenerator }))),
  "morse-code-translator": dynamic(() => import("./MorseCodeTranslator")),
  "qr-code-generator": dynamic(() => import("./QrCodeGenerator")),
  "barcode-generator": dynamic(() => import("./BarcodeGenerator")),
  "currency-converter": dynamic(() => import("./CurrencyConverter")),

  // Wave G — datetime
  "date-calculator": dynamic(() => import("./datetime").then((m) => ({ default: m.DateCalculator }))),
  "timezone-converter": dynamic(() => import("./datetime").then((m) => ({ default: m.TimezoneConverter }))),
  "countdown-timer": dynamic(() => import("./datetime").then((m) => ({ default: m.CountdownTimer }))),
  "stopwatch": dynamic(() => import("./datetime").then((m) => ({ default: m.Stopwatch }))),
  "days-between-dates": dynamic(() => import("./datetime").then((m) => ({ default: m.DaysBetween }))),
  "week-number": dynamic(() => import("./datetime").then((m) => ({ default: m.WeekNumber }))),

  // Wave D — electrical
  "ohms-law-calculator": dynamic(() => import("./electrical").then((m) => ({ default: m.OhmsLaw }))),
  "voltage-divider-calculator": dynamic(() => import("./electrical").then((m) => ({ default: m.VoltageDivider }))),
  "resistor-color-code": dynamic(() => import("./electrical").then((m) => ({ default: m.ResistorColorCode }))),
  "power-calculator": dynamic(() => import("./electrical").then((m) => ({ default: m.PowerCalculator }))),
  "capacitance-calculator": dynamic(() => import("./electrical").then((m) => ({ default: m.CapacitanceCalculator }))),
  "inductance-calculator": dynamic(() => import("./electrical").then((m) => ({ default: m.InductanceCalculator }))),
  "decibel-calculator": dynamic(() => import("./electrical").then((m) => ({ default: m.DecibelCalculator }))),
  "watts-to-amps": dynamic(() => import("./electrical").then((m) => ({ default: m.WattsToAmps }))),
  "kva-calculator": dynamic(() => import("./electrical").then((m) => ({ default: m.KvaCalculator }))),
  "awg-wire-size": dynamic(() => import("./electrical").then((m) => ({ default: m.AwgWireSize }))),
};

export function getToolImpl(slug: string): ComponentType<ToolProps> | null {
  return REGISTRY[slug] ?? null;
}
