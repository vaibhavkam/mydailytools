// Central tool registry — drives navigation, sitemap, search, and category pages.
// Each tool has: slug, title, description (used as <meta description>), keywords, status.
// status: "live" = working tool page exists; "stub" = listed in nav, page is a coming-soon stub.

export type ToolStatus = "live" | "stub";

export type Tool = {
  slug: string; // URL path under /tools, e.g. "percentage-calculator"
  title: string; // visible name + <h1>
  description: string; // <meta description> + card subtitle (<=160 chars)
  keywords: string[]; // SEO keywords
  status: ToolStatus;
};

export type Category = {
  slug: string; // URL path, e.g. "math"
  name: string; // display name
  blurb: string; // short category description
  icon: string; // lucide-react icon name
  tools: Tool[];
};

// Category and per-category tool order is intentional and reflects expected
// usage frequency / search demand: daily-use up top, specialist tools at the
// bottom. Re-rank when traffic data shows a clear winner.
export const CATEGORIES: Category[] = [
  {
    slug: "developer",
    name: "Web & Developer",
    blurb: "Tools every web developer needs.",
    icon: "Code2",
    tools: [
      // Data formats — JSON / YAML / CSV / XML cluster
      // Order: source-format formatter first, then its outgoing converters
      // (JSON → XML / YAML / CSV / TS, then YAML formatter + outgoing, etc.).
      // Both directions of a converter render the same widget; see CONTRIBUTING.md.
      { slug: "json-formatter", title: "JSON Formatter", description: "Pretty-print, minify, and validate JSON. Detects syntax errors with line numbers and supports nested structures of any depth.", keywords: ["json formatter", "json validator", "json beautifier", "json prettifier"], status: "live" },
      { slug: "json-diff", title: "JSON Diff", description: "Compare two JSON values semantically. Ignores key order; shows added, removed, and changed fields with their JSONPath. Great for diffing API responses and config files.", keywords: ["json diff", "json compare", "compare json", "json difference", "semantic json diff"], status: "live" },
      { slug: "json-to-xml", title: "JSON to XML Converter", description: "Convert JSON objects and arrays to well-formed XML. Maps object keys to elements, array items to repeated elements, with optional root wrapper.", keywords: ["json to xml", "json to xml converter", "convert json to xml"], status: "live" },
      { slug: "json-to-yaml", title: "JSON to YAML Converter", description: "Convert JSON to clean indented YAML for Kubernetes manifests, Docker Compose, CI configs, and Helm charts. Preserves nested structures.", keywords: ["json to yaml", "json to yml", "json to yaml converter"], status: "live" },
      { slug: "json-to-csv", title: "JSON to CSV Converter", description: "Convert JSON arrays to CSV with automatic header detection from object keys. Handles nested values and arbitrary delimiters.", keywords: ["json to csv", "json to csv converter", "convert json to csv"], status: "live" },
      { slug: "json-to-typescript", title: "JSON to TypeScript", description: "Generate TypeScript interfaces from sample JSON.", keywords: ["json to typescript", "json to interface"], status: "live" },
      { slug: "yaml-formatter", title: "YAML Formatter", description: "Format and validate YAML for config files, Kubernetes manifests, Docker Compose, and CI pipelines. Normalizes indentation and surfaces syntax errors.", keywords: ["yaml formatter", "yaml validator", "yaml beautifier", "yml formatter"], status: "live" },
      { slug: "yaml-to-json", title: "YAML to JSON Converter", description: "Convert YAML to JSON for APIs, config files, and pipelines. Supports indented mappings, sequences, scalars, and nested objects.", keywords: ["yaml to json", "yaml to json converter", "yml to json"], status: "live" },
      { slug: "yaml-to-xml", title: "YAML to XML Converter", description: "Convert YAML to well-formed XML for legacy integrations. Preserves nested mappings and sequences as nested elements with text values.", keywords: ["yaml to xml", "yaml to xml converter"], status: "live" },
      { slug: "yaml-to-csv", title: "YAML to CSV Converter", description: "Convert YAML arrays of records to CSV. Flattens nested objects with dot-notation column names so spreadsheet tools can read structured YAML data.", keywords: ["yaml to csv", "yaml to csv converter"], status: "live" },
      { slug: "xml-formatter", title: "XML Formatter", description: "Format, indent, and validate XML documents. Detects malformed tags and unbalanced elements with clear error messages.", keywords: ["xml formatter", "xml validator", "xml beautifier"], status: "live" },
      { slug: "xml-to-json", title: "XML to JSON Converter", description: "Convert XML to JSON for legacy API integration, SOAP responses, and config migration. Handles attributes, namespaces, and text content.", keywords: ["xml to json", "xml to json converter", "convert xml to json", "soap to json"], status: "live" },
      { slug: "xml-to-yaml", title: "XML to YAML Converter", description: "Convert XML documents to clean indented YAML. Handles attributes, repeated elements, and text content; great for migrating legacy configs.", keywords: ["xml to yaml", "xml to yaml converter"], status: "live" },
      { slug: "xml-to-csv", title: "XML to CSV Converter", description: "Flatten repeated XML elements into CSV rows with attributes and child text as columns. Great for opening XML data in Excel or Sheets.", keywords: ["xml to csv", "xml to csv converter", "convert xml to csv"], status: "live" },
      { slug: "csv-to-json", title: "CSV to JSON Converter", description: "Convert CSV to a JSON array of objects. Uses the first row as keys, handles quoted values, and detects common delimiters automatically.", keywords: ["csv to json", "csv to json converter", "convert csv to json"], status: "live" },
      { slug: "csv-to-xml", title: "CSV to XML Converter", description: "Convert CSV rows into XML elements with column headers as tag names. Useful for Excel exports, legacy systems, and ETL pipelines.", keywords: ["csv to xml", "csv to xml converter", "convert csv to xml"], status: "live" },
      { slug: "csv-to-yaml", title: "CSV to YAML Converter", description: "Convert CSV to YAML for use in config files, Ansible playbooks, and Kubernetes ConfigMaps. Uses the header row as YAML keys.", keywords: ["csv to yaml", "csv to yaml converter"], status: "live" },
      // AI / LLM dev cluster
      { slug: "token-counter", title: "Token Counter for GPT, Claude, Llama", description: "Count tokens for ChatGPT, GPT-4o, Claude, Llama, and Gemini before you hit context limits. Shows per-model count, character count, and approximate API cost. Runs in your browser.", keywords: ["token counter", "gpt token counter", "tiktoken", "openai token counter", "claude tokenizer", "llm token counter"], status: "live" },
      { slug: "llm-schema-validator", title: "LLM JSON Schema Validator", description: "Validate JSON Schemas for OpenAI strict mode, function calling, Anthropic tool use, and Gemini controlled generation. Find vendor-specific incompatibilities before you ship.", keywords: ["llm json schema", "openai structured outputs", "openai strict mode", "anthropic tool schema", "gemini controlled generation", "json schema validator"], status: "live" },
      // JWT cluster
      { slug: "jwt-decoder", title: "JWT Decoder", description: "Decode JSON Web Tokens and inspect payload.", keywords: ["jwt decoder"], status: "live" },
      { slug: "jwt-generator", title: "JWT Generator", description: "Sign JSON Web Tokens with HS256/HS384/HS512.", keywords: ["jwt generator", "jwt signer"], status: "live" },
      // Regex / SQL
      { slug: "regex-tester", title: "Regex Tester", description: "Test JavaScript regular expressions live.", keywords: ["regex tester", "regular expression"], status: "live" },
      { slug: "sql-formatter", title: "SQL Formatter", description: "Pretty-print and format SQL for any major dialect.", keywords: ["sql formatter", "sql beautifier"], status: "live" },
      // URL cluster
      { slug: "url-encoder-decoder", title: "URL Encoder/Decoder", description: "Percent-encode and decode URLs.", keywords: ["url encoder", "url decoder"], status: "live" },
      { slug: "url-parser", title: "URL Parser", description: "Decompose any URL into its components and query parameters.", keywords: ["url parser"], status: "live" },
      { slug: "curl-to-code", title: "Curl to Code Converter", description: "Paste a curl command, get the equivalent code in JavaScript (fetch and axios), Python (requests), or Go (net/http). Handles headers, JSON bodies, basic auth, and form data.", keywords: ["curl to code", "curl to fetch", "curl to python", "curl to javascript", "curl to axios", "curl to requests", "curl converter"], status: "live" },
      { slug: "http-status-codes", title: "HTTP Status Code Reference", description: "Searchable reference for every HTTP status code with plain-English summaries and the gotchas devs actually hit: 301 vs 308, 401 vs 403, 404 vs 410, 400 vs 422.", keywords: ["http status codes", "http status reference", "what is http 422", "401 vs 403", "404 vs 410", "rest api status codes"], status: "live" },
      // Encoding / escaping cluster
      { slug: "base64-encoder-decoder", title: "Base64 Encoder/Decoder", description: "Encode and decode Base64 strings (text and binary).", keywords: ["base64 encoder", "base64 decoder"], status: "live" },
      { slug: "image-to-base64", title: "Image to Base64", description: "Convert an image into a Base64 data URI for inline CSS or HTML.", keywords: ["image to base64", "data uri"], status: "live" },
      { slug: "string-escape", title: "String Escape/Unescape", description: "Escape strings for JSON, JS, HTML, and SQL contexts.", keywords: ["string escape", "json escape"], status: "live" },
      { slug: "html-encoder", title: "HTML Entities Encoder", description: "Encode and decode HTML entities.", keywords: ["html entities encoder"], status: "live" },
      // HTML / markup cluster
      { slug: "html-editor", title: "HTML Editor", description: "Live preview HTML with formatted source.", keywords: ["html editor"], status: "live" },
      { slug: "markdown-preview", title: "Markdown Preview", description: "Live markdown editor with GitHub-flavored rendering.", keywords: ["markdown preview", "markdown editor"], status: "live" },
      // CSS / JS / color cluster
      { slug: "color-picker", title: "Color Picker", description: "Pick colors and copy in HEX, RGB, HSL, OKLCH.", keywords: ["color picker", "hex color", "hex to rgb", "rgb to hex"], status: "live" },
      { slug: "css-minifier", title: "CSS Minifier", description: "Minify CSS for production.", keywords: ["css minifier"], status: "live" },
      { slug: "js-minifier", title: "JS Minifier", description: "Minify JavaScript with Terser settings.", keywords: ["js minifier", "javascript minifier"], status: "live" },
      // Dev utility cluster
      { slug: "cron-expression-parser", title: "Cron Expression Parser", description: "Explain cron expressions in English and preview the next run times.", keywords: ["cron parser", "cron expression", "crontab"], status: "live" },
      { slug: "gitignore-generator", title: ".gitignore Generator", description: "Build a .gitignore file from popular language and tool templates.", keywords: ["gitignore generator", "gitignore template"], status: "live" },
      { slug: "htaccess-generator", title: ".htaccess Generator", description: "Common Apache .htaccess snippets.", keywords: ["htaccess generator"], status: "live" },
    ],
  },
  {
    slug: "text",
    name: "Text & String",
    blurb: "Manipulate, count, compare, and clean text.",
    icon: "Type",
    tools: [
      // Analysis
      { slug: "word-counter", title: "Word & Text Counter", description: "Count words, characters, lines, sentences, and reading time.", keywords: ["word counter", "character counter", "line counter", "text stats"], status: "live" },
      // Transformation cluster
      { slug: "case-converter", title: "Case Converter", description: "UPPER, lower, Title, Sentence, camelCase, and more.", keywords: ["case converter", "uppercase lowercase"], status: "live" },
      { slug: "text-reverser", title: "Text Reverser", description: "Reverse characters, words, or lines.", keywords: ["text reverser", "reverse text"], status: "live" },
      // Search / replace
      { slug: "find-and-replace", title: "Find & Replace", description: "Bulk replace with optional regex.", keywords: ["find and replace text"], status: "live" },
      // Organization cluster
      { slug: "sort-lines", title: "Sort Lines", description: "Alphabetical, reverse, numeric, or random.", keywords: ["sort lines", "sort text"], status: "live" },
      { slug: "remove-duplicate-lines", title: "Remove Duplicate Lines", description: "Deduplicate a list, preserving order.", keywords: ["remove duplicate lines"], status: "live" },
      { slug: "text-diff", title: "Text Diff", description: "Side-by-side comparison of two texts.", keywords: ["text diff", "compare text"], status: "live" },
      // Generation cluster
      { slug: "text-to-slug", title: "Text to URL Slug", description: "Convert any string into a clean URL slug.", keywords: ["url slug generator"], status: "live" },
      { slug: "lorem-ipsum-generator", title: "Lorem Ipsum Generator", description: "Generate paragraphs, words, or sentences of placeholder text.", keywords: ["lorem ipsum generator"], status: "live" },
      // Special
      { slug: "morse-code-translator", title: "Morse Code Translator", description: "Text to Morse, Morse to text, with audio playback.", keywords: ["morse code translator"], status: "live" },
    ],
  },
  {
    slug: "list",
    name: "List Tools",
    blurb: "Set operations, filtering, and clipboard transforms for lists.",
    icon: "List",
    tools: [
      // Conversion cluster
      { slug: "comma-lines-converter", title: "Comma ↔ Lines Converter", description: "Convert between comma-separated text and one item per line, with trim and dedupe options.", keywords: ["comma to lines", "lines to comma", "csv to list"], status: "live" },
      { slug: "list-json-array", title: "List ↔ JSON Array", description: "Convert one-per-line lists into JSON arrays of strings, and back.", keywords: ["list to json array", "json array converter"], status: "live" },
      // Set operations / comparison
      { slug: "list-set-operations", title: "List Set Operations", description: "Union, intersection, difference, A only, B only, and symmetric difference of two lists.", keywords: ["list union", "list intersection", "set operations", "list compare"], status: "live" },
      // Filtering / extraction cluster
      { slug: "list-filter", title: "List Filter", description: "Keep or drop lines matching a substring or regular expression.", keywords: ["list filter", "filter lines"], status: "live" },
      { slug: "column-picker", title: "Column Picker", description: "Pick a column from tab- or comma-separated rows.", keywords: ["column picker", "extract column"], status: "live" },
      // Transformation
      { slug: "prefix-suffix-wrapper", title: "Prefix / Suffix Wrapper", description: "Wrap every line with a prefix and suffix — useful for SQL IN clauses, quoting, or templating.", keywords: ["prefix suffix wrapper", "wrap lines"], status: "live" },
      // Analysis / generation
      { slug: "list-stats", title: "List Stats", description: "Count, unique count, min/max length, longest and shortest items in a list.", keywords: ["list stats", "list count"], status: "live" },
      { slug: "number-sequence-generator", title: "Number Sequence Generator", description: "Expand 1..100 or 0,2,4..20 patterns into full numeric lists.", keywords: ["number sequence generator", "range generator"], status: "live" },
    ],
  },
  {
    slug: "datetime",
    name: "Date & Time",
    blurb: "Date math, age, and timezone tools.",
    icon: "Clock",
    tools: [
      // Date math cluster
      { slug: "age-calculator", title: "Age Calculator", description: "Exact age in years, months, and days.", keywords: ["age calculator"], status: "live" },
      { slug: "days-between-dates", title: "Days Between Dates", description: "Calendar days between any two dates.", keywords: ["days between dates"], status: "live" },
      { slug: "date-calculator", title: "Date Calculator", description: "Add or subtract days, weeks, months, or years.", keywords: ["date calculator"], status: "live" },
      { slug: "week-number", title: "Week Number", description: "ISO week number for any date.", keywords: ["week number"], status: "live" },
      // Conversion cluster
      { slug: "unix-timestamp-converter", title: "Unix Timestamp Converter", description: "Epoch to date and date to epoch.", keywords: ["unix timestamp converter"], status: "live" },
      { slug: "timezone-converter", title: "Time Zone Converter", description: "Convert any date and time across 10 major world time zones instantly. DST-aware — covers New York, London, Tokyo, Kolkata, Sydney, and more. No sign-up needed.", keywords: ["timezone converter", "time zone converter", "world clock converter", "dst converter", "utc converter"], status: "live" },
      // Timers
      { slug: "countdown-timer", title: "Countdown Timer", description: "Live countdown to any future date.", keywords: ["countdown timer"], status: "live" },
      { slug: "stopwatch", title: "Stopwatch", description: "Web stopwatch with laps.", keywords: ["online stopwatch"], status: "live" },
    ],
  },
  {
    slug: "math",
    name: "Math",
    blurb: "Calculators for everyday and advanced math.",
    icon: "Calculator",
    tools: [
      // Basic arithmetic cluster
      { slug: "percentage-calculator", title: "Percentage Calculator", description: "Calculate percentages, percent change, and percent of a number instantly.", keywords: ["percentage calculator", "percent of number", "percent change"], status: "live" },
      { slug: "average-calculator", title: "Average Calculator", description: "Calculate mean, median, mode, range, sum, min, and max for any list of numbers. Paste in grades, scores, or measurements — results update instantly.", keywords: ["average calculator", "mean median mode", "mean calculator", "median calculator"], status: "live" },
      { slug: "fraction-calculator", title: "Fraction Calculator", description: "Add, subtract, multiply, and divide fractions with step-by-step results.", keywords: ["fraction calculator", "add fractions", "simplify fractions"], status: "live" },
      { slug: "ratio-calculator", title: "Ratio Calculator", description: "Simplify, compare, and scale ratios.", keywords: ["ratio calculator", "simplify ratio"], status: "live" },
      { slug: "rounding-calculator", title: "Rounding Calculator", description: "Round to nearest, up, or down with custom precision.", keywords: ["rounding calculator", "round number"], status: "live" },
      // Powers / roots / logs cluster
      { slug: "root-calculator", title: "Root Calculator", description: "Square root, cube root, and nth root with high precision.", keywords: ["root calculator", "nth root", "square root"], status: "live" },
      { slug: "exponent-calculator", title: "Exponent Calculator", description: "Raise any base to any power, including negatives and decimals.", keywords: ["exponent calculator", "power calculator"], status: "live" },
      { slug: "logarithm-calculator", title: "Logarithm Calculator", description: "log, ln, and log to any base.", keywords: ["logarithm calculator", "log calculator", "natural log"], status: "live" },
      { slug: "antilog-calculator", title: "Antilog Calculator", description: "Inverse log calculator for any base.", keywords: ["antilog calculator", "inverse log"], status: "live" },
      // Number theory cluster
      { slug: "gcf-calculator", title: "GCF / GCD Calculator", description: "Greatest common factor (also called GCD) of two or more integers.", keywords: ["gcf calculator", "gcd calculator", "greatest common factor", "greatest common divisor"], status: "live" },
      { slug: "lcm-calculator", title: "LCM Calculator", description: "Compute the least common multiple of any set of numbers.", keywords: ["lcm calculator", "least common multiple"], status: "live" },
      { slug: "factorial-calculator", title: "Factorial Calculator", description: "n! for large integers using big-int math.", keywords: ["factorial calculator", "n factorial"], status: "live" },
      { slug: "permutation-combination-calculator", title: "Permutation & Combination Calculator", description: "nPr and nCr calculator with formula breakdown.", keywords: ["permutation combination calculator", "nPr nCr"], status: "live" },
      { slug: "probability-calculator", title: "Probability Calculator", description: "Single and multiple event probability.", keywords: ["probability calculator"], status: "live" },
      // Statistics
      { slug: "standard-deviation-calculator", title: "Standard Deviation Calculator", description: "Population and sample standard deviation, variance, and mean.", keywords: ["standard deviation calculator", "variance"], status: "live" },
      // Geometry cluster
      { slug: "triangle-calculator", title: "Triangle Calculator", description: "Solve any triangle from sides or angles.", keywords: ["triangle calculator", "trigonometry"], status: "live" },
      { slug: "circle-calculator", title: "Circle Calculator", description: "Area, circumference, diameter, and radius.", keywords: ["circle calculator", "area circle"], status: "live" },
      // Advanced cluster
      { slug: "equation-solver", title: "Equation Solver", description: "Solve linear and quadratic equations symbolically.", keywords: ["equation solver", "quadratic solver"], status: "live" },
      { slug: "matrix-calculator", title: "Matrix Calculator", description: "Add, multiply, transpose, and invert matrices.", keywords: ["matrix calculator", "matrix multiplication"], status: "live" },
      { slug: "scientific-calculator", title: "Scientific Calculator", description: "Full scientific calculator with trig, log, and exponential functions.", keywords: ["scientific calculator", "trigonometry calculator"], status: "live" },
    ],
  },
  {
    slug: "converters",
    name: "Unit Converters",
    blurb: "Convert between units of length, weight, temperature, and more.",
    icon: "Ruler",
    tools: [
      // Physical dimensions cluster
      { slug: "length-converter", title: "Length Converter", description: "Convert meters, feet, miles, kilometers, inches, and more.", keywords: ["length converter", "meters to feet"], status: "live" },
      { slug: "weight-converter", title: "Weight Converter", description: "Kilograms, pounds, ounces, grams, stones, tons.", keywords: ["weight converter", "kg to lbs"], status: "live" },
      { slug: "area-converter", title: "Area Converter", description: "Square meters, acres, hectares, square feet.", keywords: ["area converter"], status: "live" },
      { slug: "volume-converter", title: "Volume Converter", description: "Liters, gallons, cubic meters, fluid ounces.", keywords: ["volume converter", "liters to gallons"], status: "live" },
      // Environmental / motion cluster
      { slug: "temperature-converter", title: "Temperature Converter", description: "Celsius, Fahrenheit, Kelvin conversion.", keywords: ["temperature converter", "celsius to fahrenheit"], status: "live" },
      { slug: "speed-converter", title: "Speed Converter", description: "mph, km/h, knots, m/s.", keywords: ["speed converter", "mph to kmh"], status: "live" },
      { slug: "time-converter", title: "Time Converter", description: "Seconds, minutes, hours, days, weeks, years.", keywords: ["time converter"], status: "live" },
      // Energy / force / power cluster
      { slug: "energy-converter", title: "Energy Converter", description: "Joules, calories, kWh, BTU.", keywords: ["energy converter"], status: "live" },
      { slug: "power-converter", title: "Power Converter", description: "Watts, horsepower, kW.", keywords: ["power converter"], status: "live" },
      { slug: "force-converter", title: "Force Converter", description: "Newtons, pounds-force, kilograms-force.", keywords: ["force converter"], status: "live" },
      { slug: "pressure-converter", title: "Pressure Converter", description: "Pa, bar, psi, atm.", keywords: ["pressure converter"], status: "live" },
      // Signal / angle
      { slug: "frequency-converter", title: "Frequency Converter", description: "Hz, kHz, MHz, GHz, RPM.", keywords: ["frequency converter"], status: "live" },
      { slug: "angle-converter", title: "Angle Converter", description: "Degrees, radians, gradians.", keywords: ["angle converter", "radians to degrees"], status: "live" },
      // Digital / everyday cluster
      { slug: "data-storage-converter", title: "Data Storage Converter", description: "Bytes, KB, MB, GB, TB, with binary and decimal modes.", keywords: ["data storage converter", "mb to gb"], status: "live" },
      { slug: "currency-converter", title: "Currency Converter", description: "Live exchange rates between major world currencies.", keywords: ["currency converter"], status: "live" },
      { slug: "fuel-economy-converter", title: "Fuel Economy Converter", description: "MPG, L/100km, km/L.", keywords: ["fuel economy converter", "mpg to l/100km"], status: "live" },
      // Size / lifestyle cluster
      { slug: "paper-size-converter", title: "Paper Size Converter", description: "ISO A and B series, US Letter/Legal/Tabloid in millimetres, inches, points, and pixels.", keywords: ["paper size converter", "a4 to letter", "iso paper sizes"], status: "live" },
      { slug: "shoe-size-converter", title: "Shoe Size Converter", description: "Convert shoe sizes between US, UK, EU, and foot length in cm, men's and women's.", keywords: ["shoe size converter", "us uk eu shoe size"], status: "live" },
      { slug: "clothing-size-converter", title: "Clothing Size Converter", description: "Convert clothing sizes between US, UK, EU, and AU for men and women.", keywords: ["clothing size converter", "international clothing sizes"], status: "live" },
    ],
  },
  {
    slug: "number-conversion",
    name: "Number & Code",
    blurb: "Binary, hex, ASCII, and base converters.",
    icon: "Binary",
    tools: [
      // Binary cluster
      { slug: "binary-decimal-converter", title: "Binary ⇄ Decimal", description: "Convert between binary and decimal numbers.", keywords: ["binary to decimal", "decimal to binary"], status: "live" },
      { slug: "binary-hex-converter", title: "Binary ⇄ Hex", description: "Convert between binary and hexadecimal.", keywords: ["binary to hex"], status: "live" },
      // Hex cluster
      { slug: "hex-decimal-converter", title: "Hex ⇄ Decimal", description: "Convert between hexadecimal and decimal.", keywords: ["hex to decimal", "decimal to hex"], status: "live" },
      // Other bases
      { slug: "octal-decimal-converter", title: "Octal ⇄ Decimal", description: "Convert between octal and decimal.", keywords: ["octal to decimal"], status: "live" },
      { slug: "number-base-converter", title: "Number Base Converter", description: "Convert between any two bases from 2 to 36.", keywords: ["number base converter"], status: "live" },
      // Text / code cluster
      { slug: "ascii-converter", title: "ASCII Converter", description: "Text to ASCII codes, and ASCII codes to text.", keywords: ["ascii converter", "ascii to text"], status: "live" },
      { slug: "roman-numeral-converter", title: "Roman Numeral Converter", description: "Convert numbers to and from Roman numerals.", keywords: ["roman numeral converter"], status: "live" },
      { slug: "bcd-converter", title: "BCD Converter", description: "Decimal to binary-coded decimal.", keywords: ["bcd converter"], status: "live" },
    ],
  },
  {
    slug: "generators",
    name: "Generators",
    blurb: "Passwords, IDs, QR codes, and more.",
    icon: "Shuffle",
    tools: [
      // Security / ID cluster
      { slug: "password-generator", title: "Password Generator", description: "Strong, customizable passwords with strength meter.", keywords: ["password generator", "strong password"], status: "live" },
      { slug: "uuid-generator", title: "UUID Generator", description: "Generate random UUID v4 strings instantly — one or in bulk. Copy-paste ready GUIDs for databases, APIs, and unique identifiers.", keywords: ["uuid generator", "guid generator", "uuid v4", "random uuid"], status: "live" },
      // Code / barcode cluster
      { slug: "qr-code-generator", title: "QR Code Generator", description: "Generate QR codes for URLs, text, or contact cards.", keywords: ["qr code generator"], status: "live" },
      { slug: "barcode-generator", title: "Barcode Generator", description: "EAN, UPC, Code 128, and Code 39 barcodes.", keywords: ["barcode generator"], status: "live" },
      // Random cluster
      { slug: "random-number-generator", title: "Random Number Generator", description: "Pick a number in any range, with no-repeat option.", keywords: ["random number generator"], status: "live" },
      { slug: "dice-roller", title: "Dice Roller", description: "Roll any combination of dice (e.g. 3d6).", keywords: ["dice roller"], status: "live" },
      { slug: "coin-flipper", title: "Coin Flipper", description: "Heads or tails, with statistics.", keywords: ["coin flipper"], status: "live" },
      { slug: "random-color-generator", title: "Random Color Generator", description: "Single color or palette with harmony rules.", keywords: ["random color generator"], status: "live" },
      { slug: "random-name-generator", title: "Random Name Generator", description: "Generate first and last names from many cultures.", keywords: ["random name generator"], status: "live" },
    ],
  },
  {
    slug: "design",
    name: "Design & CSS",
    blurb: "Color, typography, spacing, and CSS generators.",
    icon: "Palette",
    tools: [
      // Color cluster
      { slug: "wcag-contrast-checker", title: "WCAG Contrast Checker", description: "Check color contrast against WCAG 2.1 AA and AAA standards for text and UI.", keywords: ["wcag contrast checker", "color contrast", "accessibility"], status: "live" },
      { slug: "css-gradient-generator", title: "CSS Gradient Generator", description: "Build linear and radial gradients with live preview and copy-ready CSS.", keywords: ["css gradient generator"], status: "live" },
      { slug: "color-palette-from-image", title: "Image Color Palette", description: "Extract a dominant color palette from an uploaded image.", keywords: ["palette from image", "dominant colors"], status: "live" },
      // CSS property generators cluster
      { slug: "box-shadow-generator", title: "Box Shadow Generator", description: "Visually compose CSS box-shadow with offsets, blur, spread, and color.", keywords: ["box shadow generator", "css shadow"], status: "live" },
      { slug: "border-radius-generator", title: "Border Radius Generator", description: "Build symmetric and asymmetric border-radius with live preview.", keywords: ["border radius generator"], status: "live" },
      // Typography / spacing cluster
      { slug: "type-scale-generator", title: "Type Scale Generator", description: "Generate a modular type scale from a base size and ratio.", keywords: ["type scale generator", "modular scale", "font size scale"], status: "live" },
      { slug: "pixel-rem-converter", title: "PX ↔ REM Converter", description: "Convert between pixels and rems for any base font size.", keywords: ["px to rem", "rem converter"], status: "live" },
      { slug: "spacing-scale-generator", title: "Spacing Scale Generator", description: "Build a consistent spacing scale for design systems.", keywords: ["spacing scale generator"], status: "live" },
      // Layout
      { slug: "aspect-ratio-calculator", title: "Aspect Ratio Calculator", description: "Calculate width or height to preserve any aspect ratio — 16:9, 4:3, 1:1, or custom. Perfect for responsive images, video embeds, and UI layouts.", keywords: ["aspect ratio calculator", "aspect ratio", "image ratio", "video ratio"], status: "live" },
    ],
  },
  {
    slug: "network",
    name: "Network & Security",
    blurb: "Networking, certificates, hashing, and security utilities.",
    icon: "Shield",
    tools: [
      // Security cluster
      { slug: "password-strength-checker", title: "Password Strength Checker", description: "Estimate entropy and crack time using zxcvbn.", keywords: ["password strength checker", "zxcvbn"], status: "live" },
      { slug: "hash-generator", title: "Hash Generator", description: "MD5, SHA-1, SHA-256, SHA-512 of any string.", keywords: ["hash generator", "md5 sha256"], status: "live" },
      { slug: "ssl-certificate-decoder", title: "SSL Certificate Decoder", description: "Paste a PEM certificate to inspect issuer, SAN, validity, and signature.", keywords: ["ssl decoder", "certificate decoder", "pem decoder"], status: "live" },
      // Network
      { slug: "cidr-calculator", title: "IP/CIDR Subnet Calculator", description: "Compute subnet range, mask, broadcast, and host count for any CIDR block.", keywords: ["cidr calculator", "subnet calculator"], status: "live" },
    ],
  },
  {
    slug: "finance",
    name: "Personal Finance",
    blurb: "Loans, taxes, salary, and everyday money decisions.",
    icon: "DollarSign",
    tools: [
      // Loans cluster
      { slug: "mortgage-calculator", title: "Mortgage Calculator", description: "PITI, amortization, and payoff schedule.", keywords: ["mortgage calculator"], status: "live" },
      { slug: "loan-calculator", title: "Loan Calculator", description: "Monthly payment and amortization for any loan.", keywords: ["loan calculator"], status: "live" },
      { slug: "ear-apr-calculator", title: "EAR ↔ APR Calculator", description: "Convert between APR and effective annual rate at any compounding frequency.", keywords: ["ear calculator", "apr calculator", "effective annual rate"], status: "live" },
      // Income
      { slug: "salary-calculator", title: "Salary Calculator", description: "Hourly, weekly, monthly, and annual conversion.", keywords: ["salary calculator"], status: "live" },
      // Everyday spending cluster
      { slug: "tip-calculator", title: "Tip Calculator", description: "Tip and split a check with friends.", keywords: ["tip calculator"], status: "live" },
      { slug: "sales-tax-calculator", title: "Sales Tax Calculator", description: "Add or remove sales tax.", keywords: ["sales tax calculator"], status: "live" },
      { slug: "discount-calculator", title: "Discount Calculator", description: "Final price after percent off.", keywords: ["discount calculator"], status: "live" },
      // Investment / savings cluster
      { slug: "compound-interest-calculator", title: "Compound Interest", description: "Future value with monthly contributions.", keywords: ["compound interest calculator"], status: "live" },
      { slug: "roi-calculator", title: "ROI Calculator", description: "Return on investment in absolute and annualized form.", keywords: ["roi calculator"], status: "live" },
      { slug: "cagr-calculator", title: "CAGR Calculator", description: "Compound annual growth rate from beginning value, ending value, and years.", keywords: ["cagr calculator", "compound annual growth rate"], status: "live" },
      { slug: "inflation-calculator", title: "Inflation Calculator", description: "Buying power across years.", keywords: ["inflation calculator"], status: "live" },
      // Business
      { slug: "margin-markup-calculator", title: "Margin & Markup Calculator", description: "Gross margin, markup percentage, and cost from sale price.", keywords: ["margin calculator", "markup calculator", "gross margin"], status: "live" },
      { slug: "annuity-calculator", title: "Annuity Calculator", description: "Present and future value of ordinary annuities and annuities due — useful for retirement planning.", keywords: ["annuity calculator", "present value annuity", "retirement annuity"], status: "live" },
    ],
  },
  {
    slug: "investing",
    name: "Investing & Corporate Finance",
    blurb: "Valuation, options, fixed income, and risk metrics for analysts.",
    icon: "LineChart",
    tools: [
      // Valuation cluster
      { slug: "npv-irr-calculator", title: "NPV & IRR Calculator", description: "Net present value and internal rate of return for any cash flow series.", keywords: ["npv calculator", "irr calculator", "discounted cash flow"], status: "live" },
      { slug: "wacc-calculator", title: "WACC Calculator", description: "Weighted average cost of capital from debt and equity inputs.", keywords: ["wacc calculator", "cost of capital"], status: "live" },
      { slug: "capm-calculator", title: "CAPM Calculator", description: "Required return from beta, risk-free rate, and equity risk premium.", keywords: ["capm calculator", "required return"], status: "live" },
      // Fixed income
      { slug: "bond-pricing-calculator", title: "Bond Pricing & YTM", description: "Price, yield to maturity, duration, and convexity of a fixed-coupon bond.", keywords: ["bond pricing calculator", "yield to maturity", "ytm calculator", "bond duration"], status: "live" },
      // Options
      { slug: "black-scholes-calculator", title: "Black-Scholes Options Pricing", description: "Call and put prices plus all five Greeks under Black-Scholes.", keywords: ["black scholes calculator", "options pricing", "greeks"], status: "live" },
      // Risk
      { slug: "sharpe-ratio-calculator", title: "Sharpe Ratio Calculator", description: "Risk-adjusted return from a return series and risk-free rate.", keywords: ["sharpe ratio calculator", "risk adjusted return"], status: "live" },
    ],
  },
  {
    slug: "marketing",
    name: "Marketing & SEO",
    blurb: "Ad math, conversion, A/B testing, and SEO helpers.",
    icon: "TrendingUp",
    tools: [
      // SEO cluster
      { slug: "serp-snippet-preview", title: "SERP Snippet Preview", description: "Preview your title and meta description as Google would render them.", keywords: ["serp snippet preview", "meta description preview"], status: "live" },
      { slug: "utm-builder", title: "UTM Link Builder", description: "Build clean UTM-tagged campaign URLs.", keywords: ["utm builder", "utm generator"], status: "live" },
      // Ad metrics cluster
      { slug: "cpm-cpc-calculator", title: "CPM / CPC / CTR Calculator", description: "Convert between impressions, clicks, cost, CTR, CPM, and CPC.", keywords: ["cpm calculator", "cpc calculator", "ctr calculator"], status: "live" },
      { slug: "roas-calculator", title: "ROAS Calculator", description: "Return on ad spend, CPA, and break-even ROAS.", keywords: ["roas calculator", "return on ad spend"], status: "live" },
      // Analytics cluster
      { slug: "conversion-rate-calculator", title: "Conversion Rate Calculator", description: "Compute and compare conversion rates with confidence intervals.", keywords: ["conversion rate calculator"], status: "live" },
      { slug: "ab-test-significance", title: "A/B Test Significance", description: "Two-proportion z-test for A/B test results, with sample-size guidance.", keywords: ["a/b test significance", "ab test calculator"], status: "live" },
      // Customer value
      { slug: "ltv-cac-calculator", title: "LTV / CAC Calculator", description: "Customer lifetime value and CAC payback period.", keywords: ["ltv calculator", "cac calculator", "ltv to cac ratio"], status: "live" },
    ],
  },
  {
    slug: "health",
    name: "Health & Medical",
    blurb: "Clinical formulas, dosing, and physiology calculators.",
    icon: "HeartPulse",
    tools: [
      // Body metrics cluster
      { slug: "bmi-calculator", title: "BMI Calculator", description: "Body mass index in metric and imperial.", keywords: ["bmi calculator"], status: "live" },
      { slug: "bsa-calculator", title: "Body Surface Area (BSA)", description: "Mosteller and DuBois body surface area for dosing.", keywords: ["bsa calculator", "body surface area"], status: "live" },
      { slug: "ideal-body-weight", title: "Ideal Body Weight", description: "Devine, Robinson, and Hamwi ideal body weight estimates.", keywords: ["ideal body weight", "devine formula"], status: "live" },
      { slug: "heart-rate-zones", title: "Target Heart Rate Zones", description: "Karvonen heart rate training zones from age and resting HR.", keywords: ["target heart rate", "karvonen formula"], status: "live" },
      // Renal cluster
      { slug: "egfr-calculator", title: "eGFR Calculator", description: "Estimated glomerular filtration rate using CKD-EPI 2021.", keywords: ["egfr calculator", "ckd-epi"], status: "live" },
      { slug: "creatinine-clearance", title: "Creatinine Clearance", description: "Cockcroft-Gault creatinine clearance with optional adjusted body weight.", keywords: ["creatinine clearance", "cockcroft gault"], status: "live" },
      // Obstetrics
      { slug: "due-date-calculator", title: "Pregnancy Due Date", description: "Estimated due date and gestational age (Naegele's rule).", keywords: ["pregnancy due date", "gestational age"], status: "live" },
      // Dosing cluster
      { slug: "pediatric-dosing", title: "Pediatric Dose (mg/kg)", description: "Convert mg/kg to total dose, with max-dose checks.", keywords: ["pediatric dose", "mg per kg dosing"], status: "live" },
      { slug: "iv-drip-rate", title: "IV Drip Rate", description: "Drops per minute and mL/hr for any IV infusion.", keywords: ["iv drip rate calculator"], status: "live" },
      // Clinical scores cluster
      { slug: "anion-gap", title: "Anion Gap Calculator", description: "Anion gap with optional albumin correction.", keywords: ["anion gap calculator"], status: "live" },
      { slug: "chads-vasc", title: "CHA₂DS₂-VASc Score", description: "Stroke risk in atrial fibrillation patients.", keywords: ["cha2ds2-vasc", "stroke risk score"], status: "live" },
      { slug: "meld-score", title: "MELD Score", description: "Model for End-Stage Liver Disease score for transplant prioritization.", keywords: ["meld score", "liver disease score"], status: "live" },
      { slug: "wells-pe-score", title: "Wells PE Score", description: "Pulmonary embolism clinical probability.", keywords: ["wells pe score", "pulmonary embolism risk"], status: "live" },
    ],
  },
  {
    slug: "electrical",
    name: "Electrical & Electronics",
    blurb: "Practical calculators for circuits and electronics.",
    icon: "Zap",
    tools: [
      // Power / voltage cluster
      { slug: "ohms-law-calculator", title: "Ohm's Law Calculator", description: "Solve V = IR for any unknown.", keywords: ["ohms law calculator"], status: "live" },
      { slug: "watts-to-amps", title: "Watts to Amps", description: "Convert between watts, amps, and volts.", keywords: ["watts to amps"], status: "live" },
      { slug: "power-calculator", title: "Power Calculator", description: "Watts from voltage, current, or resistance.", keywords: ["watts calculator", "power calculator"], status: "live" },
      { slug: "kva-calculator", title: "kVA Calculator", description: "kVA, kW, and amperage for single and three-phase.", keywords: ["kva calculator"], status: "live" },
      // Circuit components cluster
      { slug: "voltage-divider-calculator", title: "Voltage Divider", description: "Compute output voltage of a resistor divider.", keywords: ["voltage divider calculator"], status: "live" },
      { slug: "resistor-color-code", title: "Resistor Color Code", description: "Decode 4, 5, and 6-band resistors.", keywords: ["resistor color code"], status: "live" },
      { slug: "capacitance-calculator", title: "Capacitance Calculator", description: "Calculate total capacitance for series and parallel circuits, plus RC time constants. Useful for electronics design and circuit analysis.", keywords: ["capacitance calculator", "series capacitance", "parallel capacitance", "rc time constant"], status: "live" },
      { slug: "inductance-calculator", title: "Inductance Calculator", description: "Inductor reactance and energy.", keywords: ["inductance calculator"], status: "live" },
      // Signal / measurement
      { slug: "decibel-calculator", title: "Decibel Calculator", description: "dB from voltage, power, or amplitude ratios.", keywords: ["decibel calculator", "db calculator"], status: "live" },
      // Wire
      { slug: "awg-wire-size", title: "AWG Wire Size", description: "American wire gauge to mm² and ampacity.", keywords: ["awg wire size"], status: "live" },
    ],
  },
];

// Slug → canonical-slug map for tools we removed but want to keep redirecting.
// app/tools/[slug] checks this and emits a meta-refresh redirect.
export const SLUG_REDIRECTS: Record<string, string> = {
  "hex-to-rgb": "color-picker",
  "character-counter": "word-counter",
  "line-counter": "word-counter",
  "list-compare": "list-set-operations",
  "image-color-picker": "color-picker",
  "image-resizer": "image-to-base64",
  "image-format-converter": "image-to-base64",
};

// Flat list for sitemap, search, and routing.
export const ALL_TOOLS: (Tool & { categorySlug: string; categoryName: string })[] =
  CATEGORIES.flatMap((c) => c.tools.map((t) => ({ ...t, categorySlug: c.slug, categoryName: c.name })));

export function findTool(slug: string) {
  return ALL_TOOLS.find((t) => t.slug === slug);
}

export function findCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export const SITE = {
  name: "MyDailyTool",
  domain: "mydailytool.com",
  url: "https://mydailytool.com",
  tagline: "Free online tools for everyday tasks",
  description:
    "Free, fast, privacy-friendly online tools: calculators, unit converters, developer utilities, text tools, and more. No login, runs entirely in your browser.",
  twitter: "@mydailytools",
  email: "hello@mydailytool.com",
  bmc: "vaibhav.kamble", // Buy Me a Coffee username — full URL: https://buymeacoffee.com/<bmc>
};
