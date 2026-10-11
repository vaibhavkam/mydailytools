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
  // Whether this category and its tools are exposed to search engines. 206 tools
  // rendered from one shared template read as mass-produced content: GSC showed
  // 219 URLs submitted / 0 indexed and impressions collapsing 545 -> 8. Only the
  // clusters we can genuinely defend stay indexed; the rest stay live and usable
  // but out of the index. See seo-ops/reports/2026-08-18-workplan.md.
  indexed: boolean;
};

// Categories currently exposed to search. The only demand signal GSC ever
// recorded on this domain (yaml-to-csv, image-to-base64, xml-to-csv) was all
// developer tooling, which is also where this portfolio has proven competence.
const INDEXED_CATEGORIES = new Set(["developer", "pdf", "text"]);

// Category and per-category tool order is intentional and reflects expected
// usage frequency / search demand: daily-use up top, specialist tools at the
// bottom. Re-rank when traffic data shows a clear winner.
const RAW_CATEGORIES: Omit<Category, "indexed">[] = [
  {
    slug: "developer",
    name: "Developer Tools",
    blurb: "Tools every web developer needs.",
    icon: "Code2",
    tools: [
      // Data formats — JSON / YAML / CSV / XML cluster
      // Order: source-format formatter first, then its outgoing converters
      // (JSON → XML / YAML / CSV / TS, then YAML formatter + outgoing, etc.).
      // Both directions of a converter render the same widget; see CONTRIBUTING.md.
      { slug: "json-to-typescript", title: "JSON to TypeScript", description: "Generate TypeScript interfaces and types from any sample JSON. Handles nested objects, arrays, optional fields, and mixed types. Paste JSON, copy the interface.", keywords: ["json to typescript", "json to interface", "json to type", "typescript interface generator"], status: "live" },
      { slug: "csv-to-json", title: "CSV to JSON Converter", description: "Convert CSV to a JSON array of objects. Uses the first row as keys, handles quoted values, and detects common delimiters automatically.", keywords: ["csv to json", "csv to json converter", "convert csv to json"], status: "live" },
      { slug: "csv-to-xml", title: "CSV to XML Converter", description: "Convert CSV rows into XML elements with column headers as tag names. Useful for Excel exports, legacy systems, and ETL pipelines.", keywords: ["csv to xml", "csv to xml converter", "convert csv to xml"], status: "live" },
      { slug: "csv-to-yaml", title: "CSV to YAML Converter", description: "Convert CSV to YAML for use in config files, Ansible playbooks, and Kubernetes ConfigMaps. Uses the header row as YAML keys.", keywords: ["csv to yaml", "csv to yaml converter"], status: "live" },
      // AI / LLM dev cluster
      { slug: "token-counter", title: "Token Counter for GPT, Claude, Llama", description: "Count tokens for ChatGPT, GPT-4o, Claude, Llama, and Gemini before hitting context limits. Shows per-model token count, character count, and approximate API cost.", keywords: ["token counter", "gpt token counter", "tiktoken", "openai token counter", "claude tokenizer", "llm token counter"], status: "live" },
      { slug: "llm-schema-validator", title: "LLM JSON Schema Validator", description: "Validate JSON Schemas for OpenAI strict mode, function calling, Anthropic tool use, and Gemini controlled generation. Catch vendor-specific schema errors before shipping.", keywords: ["llm json schema", "openai structured outputs", "openai strict mode", "anthropic tool schema", "gemini controlled generation", "json schema validator"], status: "live" },
      // JWT cluster
      { slug: "jwt-decoder", title: "JWT Decoder", description: "Decode JSON Web Tokens and inspect the header, payload, and signature. Paste any JWT to see claims, expiry, issuer, and algorithm — no secret key needed to decode.", keywords: ["jwt decoder", "jwt parser", "decode jwt", "jwt inspector"], status: "live" },
      { slug: "jwt-generator", title: "JWT Generator", description: "Sign JSON Web Tokens with HS256, HS384, or HS512. Set custom claims, expiry, and issuer — then copy the signed token for use in API testing or auth flows.", keywords: ["jwt generator", "jwt signer", "create jwt", "sign jwt"], status: "live" },
      // Regex / SQL
      { slug: "regex-tester", title: "Regex Tester", description: "Test JavaScript regular expressions live with instant match highlighting. Supports all JS regex flags (g, i, m, s, u) and shows match groups, indices, and global matches.", keywords: ["regex tester", "regular expression tester", "regex checker", "javascript regex"], status: "live" },
      { slug: "sql-formatter", title: "SQL Formatter", description: "Pretty-print and format SQL for any major dialect — MySQL, PostgreSQL, SQLite, T-SQL, and more. Normalizes indentation, keywords, and spacing for readable, consistent queries.", keywords: ["sql formatter", "sql beautifier", "sql pretty print", "format sql online"], status: "live" },
      // URL cluster
      { slug: "url-encoder-decoder", title: "URL Encoder/Decoder", description: "Percent-encode and decode URLs and query string values. Handles full URLs or individual components — paste any URL to encode special characters or decode percent-encoded strings.", keywords: ["url encoder", "url decoder", "percent encode", "url encode decode"], status: "live" },
      { slug: "url-parser", title: "URL Parser", description: "Decompose any URL into its components — protocol, host, port, path, query parameters, and fragment. Great for debugging redirect chains, API endpoints, and UTM parameters.", keywords: ["url parser", "url breakdown", "parse url", "url components"], status: "live" },
      { slug: "curl-to-code", title: "Curl to Code Converter", description: "Paste a curl command, get equivalent code in JavaScript (fetch/axios), Python (requests), or Go (net/http). Handles headers, JSON bodies, basic auth, and form data.", keywords: ["curl to code", "curl to fetch", "curl to python", "curl to javascript", "curl to axios", "curl to requests", "curl converter"], status: "live" },
      { slug: "http-status-codes", title: "HTTP Status Code Reference", description: "Searchable reference for every HTTP status code with plain-English summaries and the gotchas devs actually hit: 301 vs 308, 401 vs 403, 404 vs 410, 400 vs 422.", keywords: ["http status codes", "http status reference", "what is http 422", "401 vs 403", "404 vs 410", "rest api status codes"], status: "live" },
      // Encoding / escaping cluster
      { slug: "base64-encoder-decoder", title: "Base64 Encoder/Decoder", description: "Encode text or binary data to Base64 and decode Base64 strings back to text. Supports standard and URL-safe Base64. Useful for data URIs, API tokens, and email attachments.", keywords: ["base64 encoder", "base64 decoder", "base64 decode online", "encode base64"], status: "live" },
      { slug: "image-to-base64", title: "Image to Base64", description: "Convert any image file into a Base64 data URI for embedding directly in CSS or HTML. Supports PNG, JPG, GIF, WebP, and SVG. No upload — processed entirely in your browser.", keywords: ["image to base64", "data uri", "base64 image", "embed image in css"], status: "live" },
      { slug: "string-escape", title: "String Escape/Unescape", description: "Escape and unescape strings for JSON, JavaScript, HTML, and SQL. Handles special characters, backslashes, quotes, newlines, and Unicode escape sequences instantly.", keywords: ["string escape", "json escape", "javascript escape", "html escape", "sql escape"], status: "live" },
      { slug: "html-encoder", title: "HTML Entities Encoder", description: "Encode text to HTML entities and decode entities back to text. Converts angle brackets, ampersands, quotes, and other special characters to safe equivalents for use in HTML templates and CMS workflows.", keywords: ["html entities encoder", "html escape", "html entity decoder", "encode html"], status: "live" },
      // HTML / markup cluster
      { slug: "html-editor", title: "HTML Editor", description: "Write HTML with live preview side-by-side. Syntax-highlighted editor with formatted source view — useful for testing snippets, email templates, or quick mockups in your browser.", keywords: ["html editor online", "live html preview", "html sandbox", "html tester"], status: "live" },
      { slug: "markdown-preview", title: "Markdown Preview", description: "Live markdown editor with GitHub-flavored rendering. Supports tables, code blocks, task lists, and strikethrough. Great for drafting README files or documentation.", keywords: ["markdown preview", "markdown editor", "github flavored markdown", "markdown online"], status: "live" },
      // CSS / JS / color cluster
      { slug: "color-picker", title: "Color Picker", description: "Pick any color visually and copy the value in HEX, RGB, HSL, or OKLCH. Enter a hex code to convert to other formats. Includes a color wheel, shade slider, and clipboard copy.", keywords: ["color picker", "hex color", "hex to rgb", "rgb to hex", "color converter"], status: "live" },
      { slug: "css-minifier", title: "CSS Minifier", description: "Minify CSS for production by stripping whitespace, comments, and redundant rules. Paste your stylesheet and get the compressed output ready to ship or inline.", keywords: ["css minifier", "minify css online", "compress css", "css compressor"], status: "live" },
      { slug: "js-minifier", title: "JS Minifier", description: "Minify JavaScript using Terser — removes whitespace, shortens variable names, and removes dead code. Paste your JS and get a production-ready compressed bundle.", keywords: ["js minifier", "javascript minifier", "minify javascript", "terser online"], status: "live" },
      // Dev utility cluster
      { slug: "cron-expression-parser", title: "Cron Expression Parser — Explain & Preview Runs", description: "Explain any cron expression in plain English and preview the next run times. Supports 5-field crontab, 6-field, and @hourly/@daily/@weekly shortcuts. Free, no signup.", keywords: ["cron parser", "cron expression", "crontab", "cron schedule", "cron job tester"], status: "live" },
      { slug: "gitignore-generator", title: ".gitignore Generator", description: "Build a .gitignore file from community templates for any language or framework — Node, Python, Go, Java, React, Rails, and more. Select multiple templates and merge them in one click.", keywords: ["gitignore generator", "gitignore template", "create gitignore", ".gitignore file"], status: "live" },
      { slug: "htaccess-generator", title: ".htaccess Generator", description: "Generate common Apache .htaccess snippets — redirects, URL rewrites, HTTPS enforcement, custom error pages, CORS headers, and caching rules. Copy the snippet you need.", keywords: ["htaccess generator", "apache htaccess", "mod_rewrite", "htaccess redirect"], status: "live" },
    ],
  },
  {
    slug: "text",
    name: "Text & String",
    blurb: "Manipulate, count, compare, and clean text.",
    icon: "Type",
    tools: [
      { slug: "text-diff", title: "Text Diff", description: "Side-by-side diff comparison of two text blocks with line-by-line highlighting. Shows added, removed, and changed lines — useful for comparing document versions or config files.", keywords: ["text diff", "compare text", "text comparison", "diff checker online"], status: "live" },
      { slug: "remove-duplicate-lines", title: "Remove Duplicate Lines", description: "Remove duplicate lines from any list or text block while preserving original order. Optionally trim whitespace and ignore case before deduplication. Results update instantly.", keywords: ["remove duplicate lines", "deduplicate list", "remove duplicates", "unique lines"], status: "live" },
      { slug: "sort-lines", title: "Sort Lines / Sort List Online", description: "Sort a list of words, names, or numbers — alphabetically A→Z or Z→A, numerically, or randomly. Paste any list and get sorted results instantly.", keywords: ["sort list online", "sort words", "sort numbers", "sort lines", "alphabetical sorter", "sort text online"], status: "live" },
      { slug: "word-counter", title: "Word & Text Counter", description: "Count words, characters, lines, sentences, and reading time instantly. Paste any text — article, essay, or code — and get a live breakdown. Also shows unique word count and average word length.", keywords: ["word counter", "character counter", "line counter", "text stats", "word count tool"], status: "live" },
      { slug: "case-converter", title: "Case Converter", description: "Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case. Paste any text and switch case in one click.", keywords: ["case converter", "uppercase lowercase", "camelcase converter", "snake case converter"], status: "live" },
      { slug: "text-reverser", title: "Text Reverser", description: "Reverse the characters, words, or individual lines of any text. Useful for debugging palindromes, creating mirror text, or just having fun with strings.", keywords: ["text reverser", "reverse text", "reverse string", "reverse words"], status: "live" },
      { slug: "find-and-replace", title: "Find & Replace", description: "Bulk find and replace across any block of text with plain text or regex patterns. Supports case-sensitive matching, global replace, and regular expression capture groups.", keywords: ["find and replace text", "text find replace", "bulk replace", "regex find replace"], status: "live" },
      { slug: "text-to-slug", title: "Text to URL Slug", description: "Convert any title or string into a clean, hyphenated URL slug. Strips accents, punctuation, and spaces. Useful for generating SEO-friendly URLs and blog post paths.", keywords: ["url slug generator", "text to slug", "slug generator", "url slug"], status: "live" },
      { slug: "lorem-ipsum-generator", title: "Lorem Ipsum Generator", description: "Generate paragraphs, sentences, or words of classic lorem ipsum placeholder text. Choose the amount and copy instantly — useful for mockups, wireframes, and design prototypes.", keywords: ["lorem ipsum generator", "placeholder text", "dummy text generator", "lorem ipsum"], status: "live" },
      { slug: "morse-code-translator", title: "Morse Code Translator", description: "Translate text to Morse code and Morse code back to text, with audio playback of the dots and dashes. Supports the full International Morse Code alphabet and numbers.", keywords: ["morse code translator", "text to morse code", "morse decoder", "morse code audio"], status: "live" },
    ],
  },
  {
    slug: "list",
    name: "List Tools",
    blurb: "Set operations, filtering, and clipboard transforms for lists.",
    icon: "List",
    tools: [
      { slug: "list-stats", title: "List Stats", description: "Get statistics on any list: total count, unique count, min and max line length, average length, and the longest and shortest items. Useful for auditing data before further processing.", keywords: ["list stats", "list count", "list analysis", "count unique lines"], status: "live" },
      { slug: "list-set-operations", title: "List Set Operations", description: "Perform set operations on two lists: union, intersection, difference, A-only, B-only, and symmetric difference. Paste two lists and choose the operation — results update instantly.", keywords: ["list union", "list intersection", "set operations", "list compare", "list difference"], status: "live" },
      { slug: "list-filter", title: "List Filter", description: "Keep or remove lines matching a plain-text substring or regular expression. Useful for filtering log output, cleaning data, or extracting matching lines from large lists.", keywords: ["list filter", "filter lines", "grep online", "filter text lines"], status: "live" },
      { slug: "comma-lines-converter", title: "Comma to Lines Converter", description: "Convert between comma-separated values and one-item-per-line format. Handles quoted fields, trims whitespace, and removes duplicates. Paste CSV data, get a clean list — and back.", keywords: ["comma to lines", "lines to comma", "csv to list", "comma separated to list"], status: "live" },
      { slug: "list-json-array", title: "List to JSON Array", description: "Convert a one-item-per-line list into a JSON array of strings and back again. Handles quoting and escaping automatically — useful for turning clipboard lists into API payloads.", keywords: ["list to json array", "json array converter", "lines to json", "text to json array"], status: "live" },
      { slug: "column-picker", title: "Column Picker", description: "Extract a specific column from tab-separated or comma-separated rows. Enter column index or name — useful for pulling a single field from TSV exports or pasted spreadsheet data.", keywords: ["column picker", "extract column", "tsv column extractor", "csv column picker"], status: "live" },
      { slug: "prefix-suffix-wrapper", title: "Prefix / Suffix Wrapper", description: "Wrap every line with a custom prefix and suffix. Useful for building SQL IN clauses ('value'), quoting shell arguments, wrapping HTML tags, or generating code from a list.", keywords: ["prefix suffix wrapper", "wrap lines", "add prefix to lines", "sql in clause generator"], status: "live" },
      { slug: "number-sequence-generator", title: "Number Sequence Generator", description: "Expand range patterns like 1..100 or 0,2,4..20 into complete numeric lists. Supports step size, comma-separated output, and custom separators — great for test data and scripting.", keywords: ["number sequence generator", "range generator", "number range expander", "generate number list"], status: "live" },
    ],
  },
  {
    slug: "datetime",
    name: "Date & Time",
    blurb: "Date math, age, and timezone tools.",
    icon: "Clock",
    tools: [
      { slug: "days-between-dates", title: "Days Between Dates — How Many Days Calculator", description: "Find how many days are between two dates — plus weeks, months, and years. Counts calendar days inclusive or exclusive. Free, runs in your browser, no signup.", keywords: ["days between dates", "how many days between dates", "number of days between two dates", "date difference calculator", "date range calculator"], status: "live" },
      { slug: "timezone-converter", title: "Time Zone Converter — Convert Time Across Zones", description: "Convert any time across 10+ world time zones instantly. DST-aware — New York, London, Tokyo, Kolkata, Sydney & more. Runs locally in your browser, no signup.", keywords: ["timezone converter", "time zone converter", "convert time to timezone", "world clock converter", "dst converter", "utc converter"], status: "live" },
      { slug: "unix-timestamp-converter", title: "Unix Timestamp Converter", description: "Convert Unix epoch timestamps to human-readable dates and vice versa. Supports seconds and milliseconds. Instantly shows UTC and local time — no signup needed.", keywords: ["unix timestamp converter", "epoch converter", "epoch to date", "timestamp to date", "milliseconds to date"], status: "live" },
      { slug: "date-calculator", title: "Date Calculator", description: "Add or subtract days, weeks, months, or years from any date to find a future or past date. Handles leap years correctly — useful for deadlines, scheduling, and date math.", keywords: ["date calculator", "add days to date", "date math", "days from date"], status: "live" },
      { slug: "week-number", title: "Week Number", description: "Find the ISO 8601 week number for any date and see which dates fall in that week. Useful for project planning, payroll periods, and international reporting standards.", keywords: ["week number", "iso week number", "what week is it", "week of year"], status: "live" },
      { slug: "countdown-timer", title: "Countdown Timer", description: "Live countdown to any future date or event — shows days, hours, minutes, and seconds remaining. Set a target date and share the link or bookmark it for quick access.", keywords: ["countdown timer", "countdown to date", "event countdown", "days until"], status: "live" },
      { slug: "stopwatch", title: "Stopwatch", description: "Online stopwatch with lap tracking. Start, pause, and record lap splits — all in your browser. No install needed. Accurate to milliseconds for timing tasks, workouts, or experiments.", keywords: ["online stopwatch", "stopwatch with laps", "lap timer", "browser stopwatch"], status: "live" },
      { slug: "age-calculator", title: "Age Calculator", description: "Calculate your exact age in years, months, and days from your date of birth. Also shows the next birthday countdown and total days, hours, and minutes lived.", keywords: ["age calculator", "birthday calculator", "how old am i", "age from date of birth"], status: "live" },
    ],
  },
  {
    slug: "math",
    name: "Math",
    blurb: "Calculators for everyday and advanced math.",
    icon: "Calculator",
    tools: [
      // Basic arithmetic cluster
      { slug: "percentage-calculator", title: "Percentage Calculator", description: "Calculate what percent of a number is, find percent change, and reverse-calculate any percentage. Three modes — pick the one that matches your problem, get the answer instantly.", keywords: ["percentage calculator", "percent of number", "percent change", "calculate percentage"], status: "live" },
      { slug: "average-calculator", title: "Average Calculator", description: "Calculate mean, median, mode, range, sum, min, and max for any list of numbers. Paste in grades, scores, or measurements — results update instantly.", keywords: ["average calculator", "mean median mode", "mean calculator", "median calculator"], status: "live" },
      { slug: "fraction-calculator", title: "Fraction Calculator", description: "Add, subtract, multiply, and divide fractions with full step-by-step results showing the LCD, equivalent fractions, and simplified answer. Handles mixed numbers and improper fractions.", keywords: ["fraction calculator", "add fractions", "simplify fractions", "fraction math"], status: "live" },
      { slug: "ratio-calculator", title: "Ratio Calculator", description: "Simplify ratios to lowest terms, convert a ratio to a decimal, scale to any value, and compare two ratios. For recipes, map scales, and aspect ratios.", keywords: ["ratio calculator", "simplify ratio", "ratio simplifier", "ratio to decimal", "simplest form of ratio calculator", "proportion calculator"], status: "live" },
      { slug: "rounding-calculator", title: "Rounding Calculator", description: "Round numbers to the nearest integer, decimal place, or significant figure. Choose round half-up, half-down, or toward zero. Handles large and small numbers precisely.", keywords: ["rounding calculator", "round number", "round to decimal places", "significant figures"], status: "live" },
      // Powers / roots / logs cluster
      { slug: "root-calculator", title: "Root Calculator", description: "Calculate square roots, cube roots, and any nth root with high precision. Handles perfect squares and irrational results — shows the decimal approximation and the radical form.", keywords: ["root calculator", "nth root", "square root calculator", "cube root calculator"], status: "live" },
      { slug: "exponent-calculator", title: "Exponent Calculator", description: "Raise any base to any power — including negative bases, decimal exponents, and fractional powers. Shows the full numeric result with high precision for scientific and engineering work.", keywords: ["exponent calculator", "power calculator", "base exponent", "x to the power of n"], status: "live" },
      { slug: "logarithm-calculator", title: "Logarithm Calculator", description: "Calculate log base 10, natural log (ln), log base 2, and log to any custom base. Shows step-by-step working — useful for chemistry, information theory, and general math.", keywords: ["logarithm calculator", "log calculator", "natural log", "log base 10", "log base 2"], status: "live" },
      { slug: "antilog-calculator", title: "Antilog Calculator", description: "Calculate the antilog (inverse logarithm) for any base — base 10, base e (natural), or a custom base. Converts log values back to their original numbers instantly.", keywords: ["antilog calculator", "inverse log", "antilogarithm", "10 to the power"], status: "live" },
      // Number theory cluster
      { slug: "gcf-calculator", title: "GCF / GCD Calculator", description: "Find the greatest common factor (GCF) — also called GCD — of two or more integers. Uses the Euclidean algorithm and shows step-by-step working. Useful for simplifying fractions.", keywords: ["gcf calculator", "gcd calculator", "greatest common factor", "greatest common divisor"], status: "live" },
      { slug: "lcm-calculator", title: "LCM Calculator", description: "Find the least common multiple of any set of integers. Shows prime factorization and step-by-step working — useful for adding fractions, scheduling problems, and number theory.", keywords: ["lcm calculator", "least common multiple", "lcm of numbers", "lowest common multiple"], status: "live" },
      { slug: "factorial-calculator", title: "Factorial Calculator", description: "Calculate n! for any integer using big-int math that handles very large numbers precisely. Shows the full expanded result — useful for combinatorics, statistics, and algorithm analysis.", keywords: ["factorial calculator", "n factorial", "n!", "factorial math"], status: "live" },
      { slug: "permutation-combination-calculator", title: "Permutation & Combination Calculator", description: "Calculate nPr (permutations) and nCr (combinations) with a step-by-step formula breakdown. Enter n and r to see the count, formula expansion, and intermediate values.", keywords: ["permutation combination calculator", "nPr nCr", "combinations calculator", "permutations calculator"], status: "live" },
      { slug: "probability-calculator", title: "Probability Calculator", description: "Calculate the probability of single events and combined events (and/or). Enter counts or fractions to find probability, odds, and complementary probability in one step.", keywords: ["probability calculator", "event probability", "calculate probability", "odds calculator"], status: "live" },
      // Statistics
      { slug: "standard-deviation-calculator", title: "Standard Deviation Calculator", description: "Calculate population and sample standard deviation, variance, and mean for any data set. Paste numbers one per line or comma-separated — results and formula shown instantly.", keywords: ["standard deviation calculator", "variance calculator", "sample standard deviation", "population std dev"], status: "live" },
      // Geometry cluster
      { slug: "triangle-calculator", title: "Triangle Calculator", description: "Solve any triangle from sides or angles using the law of sines and cosines. Enter any three values (SSS, SAS, ASA, AAS, or SSA) and get all remaining sides, angles, and area.", keywords: ["triangle calculator", "trigonometry", "law of sines", "law of cosines", "solve triangle"], status: "live" },
      { slug: "circle-calculator", title: "Circle Calculator", description: "Calculate the area, circumference, diameter, and radius of a circle from any one known value. Instant results with formulas shown — useful for geometry, engineering, and design.", keywords: ["circle calculator", "area of circle", "circumference calculator", "circle area formula"], status: "live" },
      // Advanced cluster
      { slug: "equation-solver", title: "Equation Solver", description: "Solve linear equations (ax + b = c) and quadratic equations (ax² + bx + c = 0) symbolically. Shows step-by-step working and real or complex roots for quadratics.", keywords: ["equation solver", "quadratic solver", "linear equation solver", "solve for x"], status: "live" },
      { slug: "matrix-calculator", title: "Matrix Calculator", description: "Add, subtract, multiply, transpose, and invert matrices of any size. Shows intermediate steps for multiplication and Gaussian elimination for matrix inversion.", keywords: ["matrix calculator", "matrix multiplication", "matrix inverse", "matrix operations"], status: "live" },
      { slug: "scientific-calculator", title: "Scientific Calculator", description: "Full scientific calculator with trigonometric functions (sin, cos, tan), logarithms, exponents, factorials, and constants. Supports degree and radian mode.", keywords: ["scientific calculator", "trigonometry calculator", "sin cos tan calculator", "online scientific calculator"], status: "live" },
    ],
  },
  {
    slug: "converters",
    name: "Unit Converters",
    blurb: "Convert between units of length, weight, temperature, and more.",
    icon: "Ruler",
    tools: [
      // Physical dimensions cluster
      { slug: "length-converter", title: "Length Converter", description: "Convert length between meters, feet, miles, kilometers, inches, centimeters, yards, and nautical miles. Instant results — useful for travel, construction, and international unit conversion.", keywords: ["length converter", "meters to feet", "feet to meters", "miles to km", "cm to inches"], status: "live" },
      { slug: "weight-converter", title: "Weight Converter", description: "Convert weight between kilograms, pounds, ounces, grams, stones, and metric tons. Handles both metric and imperial units — useful for cooking, shipping, and fitness tracking.", keywords: ["weight converter", "kg to lbs", "pounds to kg", "grams to ounces", "weight unit converter"], status: "live" },
      { slug: "area-converter", title: "Area Converter", description: "Convert area between square meters, square feet, acres, hectares, square kilometers, and square miles. Useful for real estate, land measurement, and engineering projects.", keywords: ["area converter", "acres to square meters", "hectares to acres", "square feet to square meters"], status: "live" },
      { slug: "volume-converter", title: "Volume Converter", description: "Convert volume between liters, gallons, milliliters, cubic meters, fluid ounces, cups, and pints. Handles both US and UK gallons — useful for cooking, chemistry, and engineering.", keywords: ["volume converter", "liters to gallons", "gallons to liters", "ml to oz", "fluid ounces converter"], status: "live" },
      // Environmental / motion cluster
      { slug: "temperature-converter", title: "Temperature Converter", description: "Convert temperature between Celsius, Fahrenheit, and Kelvin with instant results. Includes common reference points — freezing, body temperature, boiling — for quick sanity checks.", keywords: ["temperature converter", "celsius to fahrenheit", "fahrenheit to celsius", "kelvin converter"], status: "live" },
      { slug: "speed-converter", title: "Speed Converter", description: "Convert speed between mph, km/h, knots, m/s, and feet per second. Useful for travel, aviation, maritime, and physics — handles all common speed units instantly.", keywords: ["speed converter", "mph to kmh", "km/h to mph", "knots to mph", "speed unit converter"], status: "live" },
      { slug: "time-converter", title: "Time Converter", description: "Convert time between seconds, minutes, hours, days, weeks, months, and years. Useful for project estimates, API timeout values, and unit conversions in calculations.", keywords: ["time converter", "seconds to minutes", "hours to days", "time unit converter", "minutes to hours"], status: "live" },
      // Energy / force / power cluster
      { slug: "energy-converter", title: "Energy Converter", description: "Convert energy between joules, calories, kilocalories, kilowatt-hours, BTU, and electron volts. Useful for physics, nutrition, and engineering calculations.", keywords: ["energy converter", "joules to calories", "kwh converter", "btu converter", "energy unit converter"], status: "live" },
      { slug: "power-converter", title: "Power Converter", description: "Convert power between watts, kilowatts, megawatts, horsepower, BTU/hour, and foot-pounds per second. Useful for electrical engineering, automotive, and HVAC calculations.", keywords: ["power converter", "watts to horsepower", "horsepower to watts", "kw to hp", "power unit converter"], status: "live" },
      { slug: "force-converter", title: "Force Converter", description: "Convert force between newtons, pounds-force, kilonewtons, dynes, and kilograms-force. Useful for physics, mechanical engineering, and structural calculations.", keywords: ["force converter", "newtons to pounds", "pounds to newtons", "force unit converter"], status: "live" },
      { slug: "pressure-converter", title: "Pressure Converter", description: "Convert pressure between pascals, bar, psi, atm, mmHg, and kilopascals. Useful for meteorology, hydraulics, pneumatics, and tire pressure conversions.", keywords: ["pressure converter", "psi to bar", "bar to psi", "atm to psi", "pressure unit converter"], status: "live" },
      // Signal / angle
      { slug: "frequency-converter", title: "Frequency Converter", description: "Convert frequency between hertz, kilohertz, megahertz, gigahertz, and RPM. Useful for electronics, signal processing, audio engineering, and mechanical rotation.", keywords: ["frequency converter", "hz to mhz", "mhz to ghz", "rpm to hz", "frequency unit converter"], status: "live" },
      { slug: "angle-converter", title: "Angle Converter", description: "Convert angles between degrees, radians, and gradians. Instant conversion with formulas shown — useful for trigonometry, navigation, engineering, and CAD work.", keywords: ["angle converter", "radians to degrees", "degrees to radians", "gradians converter"], status: "live" },
      // Digital / everyday cluster
      { slug: "data-storage-converter", title: "Data Storage Converter", description: "Convert data storage between bytes, KB, MB, GB, TB, and PB — in both binary (1 KB = 1024 B) and decimal (1 KB = 1000 B) modes. Useful for storage planning and file size comparisons.", keywords: ["data storage converter", "mb to gb", "gb to tb", "bytes to mb", "file size converter"], status: "live" },
      { slug: "currency-converter", title: "Currency Converter", description: "Convert between 30+ world currencies using live exchange rates updated daily from the European Central Bank. No signup — get instant results for USD, EUR, GBP, JPY, INR, and more.", keywords: ["currency converter", "exchange rate calculator", "usd to eur", "currency exchange", "forex calculator"], status: "live" },
      { slug: "fuel-economy-converter", title: "Fuel Economy Converter", description: "Convert fuel economy between MPG (US and UK), L/100km, and km/L. Useful for comparing car specs across countries or understanding international fuel consumption ratings.", keywords: ["fuel economy converter", "mpg to l/100km", "l/100km to mpg", "km per liter converter"], status: "live" },
      // Size / lifestyle cluster
      { slug: "paper-size-converter", title: "Paper Size Converter", description: "Convert ISO A and B series paper sizes and US Letter, Legal, and Tabloid between millimetres, inches, points, and pixels at any DPI. Includes a full reference table of standard dimensions.", keywords: ["paper size converter", "a4 to letter", "iso paper sizes", "a4 in inches"], status: "live" },
      { slug: "shoe-size-converter", title: "Shoe Size Converter", description: "Convert shoe sizes between US, UK, EU, and foot length in cm — for both men's and women's sizing. Includes a full reference chart for all standard international shoe size systems.", keywords: ["shoe size converter", "us uk eu shoe size", "shoe size chart", "eu to us shoe size"], status: "live" },
      { slug: "clothing-size-converter", title: "Clothing Size Converter", description: "Convert clothing sizes between US, UK, EU, and AU for men's and women's tops, bottoms, and dresses. Includes reference charts for chest, waist, and hip measurements.", keywords: ["clothing size converter", "international clothing sizes", "us to eu clothing size", "clothing size chart"], status: "live" },
    ],
  },
  {
    slug: "number-conversion",
    name: "Number & Code",
    blurb: "Binary, hex, ASCII, and base converters.",
    icon: "Binary",
    tools: [
      // Binary cluster
      { slug: "binary-decimal-converter", title: "Binary ⇄ Decimal", description: "Convert between binary and decimal numbers in both directions. Supports signed integers and shows the step-by-step positional value breakdown for each conversion.", keywords: ["binary to decimal", "decimal to binary", "binary converter", "convert binary"], status: "live" },
      { slug: "binary-hex-converter", title: "Binary ⇄ Hex", description: "Convert between binary and hexadecimal notation. Handles any length input and groups binary output into nibbles (4-bit groups) for readability.", keywords: ["binary to hex", "hex to binary", "binary hexadecimal converter"], status: "live" },
      // Hex cluster
      { slug: "hex-decimal-converter", title: "Hex ⇄ Decimal", description: "Convert between hexadecimal and decimal numbers. Supports uppercase and lowercase hex input — useful for color codes, memory addresses, and network protocols.", keywords: ["hex to decimal", "decimal to hex", "hexadecimal converter", "hex decimal converter"], status: "live" },
      // Other bases
      { slug: "octal-decimal-converter", title: "Octal ⇄ Decimal", description: "Convert between octal (base 8) and decimal (base 10). Useful for Unix file permissions, legacy computing, and programming exercises involving number systems.", keywords: ["octal to decimal", "decimal to octal", "octal converter", "base 8 converter"], status: "live" },
      { slug: "number-base-converter", title: "Number Base Converter", description: "Convert any number between any two bases from 2 (binary) to 36. Enter the source base, target base, and number — ideal for computer science and custom encoding schemes.", keywords: ["number base converter", "base converter", "radix converter", "convert number base"], status: "live" },
      // Text / code cluster
      { slug: "ascii-converter", title: "ASCII Converter", description: "Convert text to ASCII character codes and ASCII codes back to text. Shows decimal, hexadecimal, and binary representations for each character simultaneously.", keywords: ["ascii converter", "ascii to text", "text to ascii", "ascii code lookup"], status: "live" },
      { slug: "roman-numeral-converter", title: "Roman Numeral Converter", description: "Convert integers to Roman numerals and Roman numerals back to integers. Supports 1–3999 with proper subtractive notation (IV, IX, XL, XC, CD, CM).", keywords: ["roman numeral converter", "integer to roman", "roman to integer", "roman numerals"], status: "live" },
      { slug: "bcd-converter", title: "BCD Converter", description: "Convert decimal numbers to Binary-Coded Decimal (BCD) and back. Shows the 4-bit group encoding for each decimal digit — useful for electronics and embedded systems.", keywords: ["bcd converter", "binary coded decimal", "decimal to bcd", "bcd encoding"], status: "live" },
    ],
  },
  {
    slug: "generators",
    name: "Generators",
    blurb: "Passwords, IDs, QR codes, and more.",
    icon: "Shuffle",
    tools: [
      // Security / ID cluster
      { slug: "password-generator", title: "Password Generator", description: "Generate strong, random passwords with custom length, uppercase, lowercase, numbers, and symbols. Built-in strength meter. Nothing is stored — all generation happens in your browser.", keywords: ["password generator", "strong password", "random password generator", "secure password"], status: "live" },
      { slug: "uuid-generator", title: "UUID Generator", description: "Generate random UUID v4 strings instantly — one or in bulk. Copy-paste ready GUIDs for databases, APIs, and unique identifiers.", keywords: ["uuid generator", "guid generator", "uuid v4", "random uuid"], status: "live" },
      // Code / barcode cluster
      { slug: "qr-code-generator", title: "QR Code Generator", description: "Create QR codes for URLs, plain text, phone numbers, or contact cards (vCard). Download as PNG. Free QR code generator — no signup, no watermark, works in your browser.", keywords: ["qr code generator", "create qr code", "free qr code", "qr code maker"], status: "live" },
      { slug: "barcode-generator", title: "Barcode Generator", description: "Generate EAN-13, EAN-8, UPC-A, Code 128, and Code 39 barcodes from any input. Download as SVG or PNG — useful for product labeling, inventory, and retail applications.", keywords: ["barcode generator", "ean barcode", "upc barcode", "code 128 generator", "barcode maker"], status: "live" },
      // Random cluster
      { slug: "random-number-generator", title: "Random Number Generator", description: "Generate a random number in any range — integers or decimals, with optional no-repeat mode. Useful for picking lottery numbers, random sampling, and game mechanics.", keywords: ["random number generator", "random number picker", "number randomizer", "pick random number"], status: "live" },
      { slug: "dice-roller", title: "Dice Roller", description: "Roll any combination of dice using standard RPG notation (e.g. 3d6, 2d10+5). Shows individual die results and totals — perfect for tabletop games and probability demonstrations.", keywords: ["dice roller", "roll dice online", "d6 roller", "rpg dice roller", "virtual dice"], status: "live" },
      { slug: "coin-flipper", title: "Coin Flipper", description: "Flip a virtual coin and track heads vs. tails statistics over many flips. Useful for teaching probability, settling disputes, or making random decisions quickly.", keywords: ["coin flipper", "flip a coin online", "heads or tails", "virtual coin flip"], status: "live" },
      { slug: "random-color-generator", title: "Random Color Generator", description: "Generate a random color or a harmonious palette using complementary, triadic, or analogous color rules. Shows HEX, RGB, and HSL values — great for design inspiration.", keywords: ["random color generator", "random color palette", "color palette generator", "random hex color"], status: "live" },
      { slug: "random-name-generator", title: "Random Name Generator", description: "Generate random first and last names from many cultures and regions — English, Spanish, Japanese, Chinese, and more. Useful for placeholders, test data, and creative writing.", keywords: ["random name generator", "fake name generator", "random person name", "name randomizer"], status: "live" },
    ],
  },
  {
    slug: "design",
    name: "Design & CSS",
    blurb: "Color, typography, spacing, and CSS generators.",
    icon: "Palette",
    tools: [
      // Color cluster
      { slug: "wcag-contrast-checker", title: "WCAG Contrast Checker", description: "Check foreground/background color contrast ratios against WCAG 2.1 AA (4.5:1) and AAA (7:1) standards. Enter HEX or RGB values — see pass/fail for normal and large text.", keywords: ["wcag contrast checker", "color contrast", "accessibility checker", "contrast ratio calculator"], status: "live" },
      { slug: "css-gradient-generator", title: "CSS Gradient Generator", description: "Build linear and radial CSS gradients visually with a live preview and copy-ready CSS output. Control colors, stops, angle, and shape — no code required.", keywords: ["css gradient generator", "linear gradient generator", "radial gradient css", "gradient background css"], status: "live" },
      { slug: "color-palette-from-image", title: "Image Color Palette", description: "Extract a dominant color palette from any uploaded image. Shows the top colors with HEX values — useful for brand identity, design matching, and color inspiration.", keywords: ["palette from image", "dominant colors", "image color extractor", "color palette generator from image"], status: "live" },
      // CSS property generators cluster
      { slug: "box-shadow-generator", title: "Box Shadow Generator", description: "Compose CSS box-shadow visually — adjust X/Y offset, blur, spread, and color with a live preview. Copy the final CSS rule with one click. Supports multiple shadow layers.", keywords: ["box shadow generator", "css shadow", "css box shadow", "drop shadow generator"], status: "live" },
      { slug: "border-radius-generator", title: "Border Radius Generator", description: "Build CSS border-radius values visually — symmetric, asymmetric, or fully custom per-corner shapes. Live preview with copy-ready CSS output for any border-radius combination.", keywords: ["border radius generator", "css border radius", "rounded corners css", "border radius tool"], status: "live" },
      // Typography / spacing cluster
      { slug: "type-scale-generator", title: "Type Scale Generator", description: "Generate a modular type scale from a base font size and ratio (Major Third, Perfect Fourth, Golden Ratio, and more). Outputs CSS custom properties for a consistent typographic system.", keywords: ["type scale generator", "modular scale", "font size scale", "typography scale css"], status: "live" },
      { slug: "pixel-rem-converter", title: "PX ↔ REM Converter", description: "Convert between pixels and rems for any base font size (default 16px). Paste a list of values to convert all at once — useful for responsive CSS and design token work.", keywords: ["px to rem", "rem converter", "pixels to rem", "rem to px calculator"], status: "live" },
      { slug: "spacing-scale-generator", title: "Spacing Scale Generator", description: "Build a consistent spacing scale for design systems — enter a base unit and multiplier to generate a full set of spacing tokens in px and rem, ready for Tailwind or CSS variables.", keywords: ["spacing scale generator", "design system spacing", "tailwind spacing", "css spacing tokens"], status: "live" },
      // Layout
      { slug: "aspect-ratio-calculator", title: "Aspect Ratio Calculator", description: "Calculate width or height to preserve any aspect ratio — 16:9 widescreen, 4:3, 1:1, or custom. Great for responsive images, video embeds, and UI layouts.", keywords: ["aspect ratio calculator", "aspect ratio", "widescreen calculator", "calculate aspect ratio", "image ratio", "video ratio"], status: "live" },
    ],
  },
  {
    slug: "network",
    name: "Network & Security",
    blurb: "Networking, certificates, hashing, and security utilities.",
    icon: "Shield",
    tools: [
      // Security cluster
      { slug: "password-strength-checker", title: "Password Strength Checker", description: "Estimate password entropy and time-to-crack using the zxcvbn algorithm. Shows realistic crack time estimates under different attack scenarios — far more accurate than simple strength bars.", keywords: ["password strength checker", "zxcvbn", "password entropy", "how strong is my password"], status: "live" },
      { slug: "hash-generator", title: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes of any string. Useful for checksums, data integrity verification, and understanding hash output lengths for each algorithm.", keywords: ["hash generator", "md5 sha256", "sha256 hash", "md5 hash generator", "sha1 generator"], status: "live" },
      { slug: "ssl-certificate-decoder", title: "SSL Certificate Decoder", description: "Paste a PEM-encoded SSL/TLS certificate to inspect issuer, subject, SANs, validity period, public key, and signature algorithm. Everything runs in your browser — no certificate is uploaded.", keywords: ["ssl decoder", "certificate decoder", "pem decoder", "x509 certificate viewer", "tls certificate inspector"], status: "live" },
      // Network
      { slug: "cidr-calculator", title: "IP/CIDR Subnet Calculator", description: "Compute subnet range, network mask, broadcast address, and usable host count for any IPv4 CIDR block. Also shows all subnets when you split a block — useful for network planning.", keywords: ["cidr calculator", "subnet calculator", "ip subnet calculator", "cidr to ip range"], status: "live" },
    ],
  },
  {
    slug: "finance",
    name: "Personal Finance",
    blurb: "Loans, taxes, salary, and everyday money decisions.",
    icon: "DollarSign",
    tools: [
      // Loans cluster
      { slug: "mortgage-calculator", title: "Mortgage Calculator", description: "Calculate your monthly mortgage payment including principal, interest, taxes, and insurance (PITI). View full amortization schedule and see how extra payments affect payoff date.", keywords: ["mortgage calculator", "mortgage payment calculator", "piti calculator", "home loan calculator"], status: "live" },
      { slug: "loan-calculator", title: "Loan Calculator", description: "Calculate monthly loan payment, total interest paid, and full amortization schedule for any loan amount, interest rate, and term. Works for auto loans, personal loans, and student loans.", keywords: ["loan calculator", "loan payment calculator", "amortization calculator", "monthly payment calculator"], status: "live" },
      { slug: "ear-apr-calculator", title: "EAR ↔ APR Calculator", description: "Convert between APR and effective annual rate (EAR) at any compounding frequency — monthly, daily, continuous. Shows how compounding frequency changes the true cost of a loan.", keywords: ["ear calculator", "apr calculator", "effective annual rate", "apr to ear", "nominal to effective rate"], status: "live" },
      // Income
      { slug: "salary-calculator", title: "Salary Calculator", description: "Convert salary between hourly, daily, weekly, bi-weekly, monthly, and annual rates. Useful for comparing job offers, freelance rates, and understanding your true annual income.", keywords: ["salary calculator", "hourly to salary", "salary to hourly", "annual salary calculator"], status: "live" },
      // Everyday spending cluster
      { slug: "tip-calculator", title: "Tip Calculator", description: "Calculate tip amount and split the total bill between any number of people. Choose from common tip percentages or enter a custom rate — great for restaurants and group outings.", keywords: ["tip calculator", "bill splitter", "restaurant tip calculator", "split bill calculator"], status: "live" },
      { slug: "sales-tax-calculator", title: "Sales Tax Calculator", description: "Calculate sales tax on any purchase or reverse-calculate the pre-tax price from a total. Enter price and tax rate to see tax amount and final total — useful for any US state rate.", keywords: ["sales tax calculator", "add sales tax", "tax calculator", "reverse sales tax"], status: "live" },
      { slug: "discount-calculator", title: "Discount Calculator", description: "Calculate the final price after a percentage discount, the discount amount saved, and the effective discount rate from original and sale prices. Great for shopping and pricing decisions.", keywords: ["discount calculator", "percent off calculator", "sale price calculator", "calculate discount"], status: "live" },
      // Investment / savings cluster
      { slug: "compound-interest-calculator", title: "Compound Interest", description: "Calculate future value with compound interest and optional monthly contributions. Shows year-by-year growth, total contributions, and total interest earned — useful for savings planning.", keywords: ["compound interest calculator", "compound interest formula", "savings calculator", "investment growth"], status: "live" },
      { slug: "roi-calculator", title: "ROI Calculator", description: "Calculate return on investment (ROI) in both absolute and annualized percentage form. Enter initial cost and final value to see simple ROI and CAGR for any holding period.", keywords: ["roi calculator", "return on investment", "investment roi", "annualized return"], status: "live" },
      { slug: "cagr-calculator", title: "CAGR Calculator", description: "Calculate compound annual growth rate (CAGR) from beginning value, ending value, and number of years. The standard metric for measuring consistent investment or business growth over time.", keywords: ["cagr calculator", "compound annual growth rate", "cagr formula", "investment growth rate"], status: "live" },
      { slug: "inflation-calculator", title: "Inflation Calculator", description: "Calculate how inflation erodes purchasing power over time. Enter an amount and two years to see the equivalent value in today's dollars — uses historical US CPI data.", keywords: ["inflation calculator", "purchasing power calculator", "cpi calculator", "real value of money"], status: "live" },
      // Business
      { slug: "margin-markup-calculator", title: "Margin & Markup Calculator", description: "Calculate gross margin percentage, markup percentage, and cost or sale price from any two known values. Understand the difference between margin (of revenue) and markup (of cost).", keywords: ["margin calculator", "markup calculator", "gross margin", "profit margin calculator", "markup vs margin"], status: "live" },
      { slug: "annuity-calculator", title: "Annuity Calculator", description: "Calculate present and future value of ordinary annuities and annuities due from payment, rate, and periods. Useful for valuing bonds, lease payments, pension income, and retirement planning.", keywords: ["annuity calculator", "present value annuity", "retirement annuity", "pv annuity", "future value annuity"], status: "live" },
    ],
  },
  {
    slug: "investing",
    name: "Investing & Corporate Finance",
    blurb: "Valuation, options, fixed income, and risk metrics for analysts.",
    icon: "LineChart",
    tools: [
      // Valuation cluster
      { slug: "npv-irr-calculator", title: "NPV & IRR Calculator", description: "Calculate net present value and internal rate of return for any series of cash flows. Enter a discount rate and yearly cash flows to evaluate whether an investment creates value.", keywords: ["npv calculator", "irr calculator", "discounted cash flow", "net present value", "internal rate of return"], status: "live" },
      { slug: "wacc-calculator", title: "WACC Calculator", description: "Calculate weighted average cost of capital from equity cost, debt cost, tax rate, and capital structure weights. The standard discount rate for corporate DCF valuations.", keywords: ["wacc calculator", "cost of capital", "weighted average cost of capital", "dcf discount rate"], status: "live" },
      { slug: "capm-calculator", title: "CAPM Calculator", description: "Calculate the required return on equity using CAPM: risk-free rate + beta × equity risk premium. Used to estimate cost of equity for WACC and to assess whether a stock is fairly valued.", keywords: ["capm calculator", "required return", "cost of equity", "capital asset pricing model"], status: "live" },
      // Fixed income
      { slug: "bond-pricing-calculator", title: "Bond Pricing & YTM", description: "Calculate bond price, yield to maturity, Macaulay duration, and convexity for any fixed-coupon bond. Supports semi-annual and annual coupons — useful for fixed income analysis.", keywords: ["bond pricing calculator", "yield to maturity", "ytm calculator", "bond duration", "bond convexity"], status: "live" },
      // Options
      { slug: "black-scholes-calculator", title: "Black-Scholes Options Pricing", description: "Calculate call and put option prices and all five Greeks (delta, gamma, theta, vega, rho) using the Black-Scholes model. Enter spot price, strike, volatility, rate, and expiry.", keywords: ["black scholes calculator", "options pricing", "greeks", "options delta", "black scholes formula"], status: "live" },
      // Risk
      { slug: "sharpe-ratio-calculator", title: "Sharpe Ratio Calculator", description: "Calculate the Sharpe ratio (risk-adjusted return) from a return series and risk-free rate. Paste portfolio returns to see mean return, standard deviation, and Sharpe ratio.", keywords: ["sharpe ratio calculator", "risk adjusted return", "portfolio sharpe ratio", "risk return ratio"], status: "live" },
    ],
  },
  {
    slug: "marketing",
    name: "Marketing & SEO",
    blurb: "Ad math, conversion, A/B testing, and SEO helpers.",
    icon: "TrendingUp",
    tools: [
      // SEO cluster
      { slug: "serp-snippet-preview", title: "SERP Snippet Preview", description: "Preview how your page title and meta description will appear in Google search results. Shows the rendered SERP snippet with character counts and truncation warnings.", keywords: ["serp snippet preview", "meta description preview", "google snippet preview", "seo title preview"], status: "live" },
      { slug: "utm-builder", title: "UTM Link Builder", description: "Build clean UTM-tagged campaign URLs for Google Analytics tracking. Enter source, medium, campaign, term, and content — get a properly encoded URL to paste into your ads or emails.", keywords: ["utm builder", "utm generator", "utm parameters", "campaign url builder", "google analytics utm"], status: "live" },
      // Ad metrics cluster
      { slug: "cpm-cpc-calculator", title: "CPM / CPC / CTR Calculator", description: "Convert between impressions, clicks, cost, CTR, CPM, and CPC for any ad campaign. Enter any two values to calculate the others — useful for planning and evaluating digital ad buys.", keywords: ["cpm calculator", "cpc calculator", "ctr calculator", "cost per click", "cost per thousand"], status: "live" },
      { slug: "roas-calculator", title: "ROAS Calculator", description: "Calculate return on ad spend (ROAS), cost per acquisition (CPA), and the break-even ROAS needed to cover your cost of goods. Essential for evaluating paid search and social campaigns.", keywords: ["roas calculator", "return on ad spend", "break even roas", "cpa calculator"], status: "live" },
      // Analytics cluster
      { slug: "conversion-rate-calculator", title: "Conversion Rate Calculator", description: "Compute conversion rates from visitors and conversions, compare two rates, and calculate the confidence interval around each estimate. Useful for landing page and funnel analysis.", keywords: ["conversion rate calculator", "conversion rate formula", "cvr calculator", "landing page conversion"], status: "live" },
      { slug: "ab-test-significance", title: "A/B Test Significance", description: "Run a two-proportion z-test on A/B test results. Enter visitors and conversions for each variant to see p-value, statistical significance, relative lift, and minimum sample size guidance.", keywords: ["a/b test significance", "ab test calculator", "statistical significance", "ab test p value"], status: "live" },
      // Customer value
      { slug: "ltv-cac-calculator", title: "LTV / CAC Calculator", description: "Calculate customer lifetime value (LTV), customer acquisition cost (CAC), LTV:CAC ratio, and CAC payback period. Core SaaS and e-commerce metrics for assessing unit economics.", keywords: ["ltv calculator", "cac calculator", "ltv to cac ratio", "customer lifetime value", "cac payback period"], status: "live" },
    ],
  },
  {
    slug: "pdf",
    name: "PDF Tools",
    blurb: "Merge, split, convert, and edit PDF files — all in your browser.",
    icon: "FileText",
    tools: [
      { slug: "pdf-merge", title: "PDF Merge", description: "Combine multiple PDF files into one document. Drag to reorder pages, then download the merged PDF — no upload, processed entirely in your browser.", keywords: ["merge pdf", "combine pdf", "pdf merger", "join pdf files", "merge pdf online"], status: "live" },
      { slug: "pdf-split", title: "PDF Split", description: "Split a PDF by page ranges or extract individual pages. Enter ranges like 1-3,5,7-9 or extract every page as a separate file — processed in your browser.", keywords: ["split pdf", "pdf splitter", "extract pages pdf", "separate pdf pages", "pdf page extractor"], status: "live" },
      { slug: "pdf-to-images", title: "PDF to Images", description: "Convert PDF pages to PNG or JPG images. Renders each page as a high-quality image you can download individually or as a ZIP — runs entirely in your browser.", keywords: ["pdf to image", "pdf to png", "pdf to jpg", "convert pdf to image", "pdf page to image"], status: "live" },
      { slug: "images-to-pdf", title: "Images to PDF", description: "Convert JPG, PNG, or WebP images to a PDF document. Drag to reorder, choose page size and orientation, then download the PDF — no upload, runs in your browser.", keywords: ["images to pdf", "jpg to pdf", "png to pdf", "image to pdf converter", "photos to pdf"], status: "live" },
      { slug: "pdf-rotate", title: "PDF Rotate", description: "Rotate PDF pages by 90°, 180°, or 270°. Apply rotation to all pages or specific pages — download the corrected PDF instantly, processed in your browser.", keywords: ["rotate pdf", "pdf rotate pages", "rotate pdf online", "turn pdf pages"], status: "live" },
      { slug: "pdf-compress", title: "PDF Compress", description: "Reduce PDF file size by recompressing the document structure. No external server — compressed and downloaded directly in your browser.", keywords: ["compress pdf", "reduce pdf size", "pdf compressor", "shrink pdf", "pdf file size reducer"], status: "live" },
      { slug: "pdf-metadata", title: "PDF Metadata Viewer", description: "View PDF metadata: title, author, creator, producer, creation date, modification date, and page count — instantly parsed in your browser without uploading anywhere.", keywords: ["pdf metadata", "pdf properties", "pdf info viewer", "view pdf metadata", "pdf author title"], status: "live" },
    ],
  },
  {
    slug: "electrical",
    name: "Electrical & Electronics",
    blurb: "Practical calculators for circuits and electronics.",
    icon: "Zap",
    tools: [
      // Power / voltage cluster
      { slug: "ohms-law-calculator", title: "Ohm's Law Calculator", description: "Solve Ohm's Law (V = IR) for voltage, current, or resistance — enter any two values to find the third. Also calculates power (W) from the known values.", keywords: ["ohms law calculator", "ohms law formula", "voltage current resistance", "v ir calculator"], status: "live" },
      { slug: "watts-to-amps", title: "Watts to Amps", description: "Convert between watts, amps, and volts for AC and DC circuits. Handles single-phase and three-phase AC with power factor — useful for electrical load planning and wiring.", keywords: ["watts to amps", "amps to watts", "watt amp volt converter", "electrical calculator"], status: "live" },
      { slug: "power-calculator", title: "Power Calculator", description: "Calculate electrical power in watts from any two of voltage, current, or resistance. Uses P = VI, P = V²/R, and P = I²R — useful for circuit design and energy estimation.", keywords: ["watts calculator", "power calculator", "electrical power formula", "p vi calculator"], status: "live" },
      { slug: "kva-calculator", title: "kVA Calculator", description: "Calculate kVA, kW, and amperage for single-phase and three-phase electrical systems. Enter any two values to find the third — useful for generator sizing and transformer selection.", keywords: ["kva calculator", "kva to kw", "kw to kva", "three phase calculator"], status: "live" },
      // Circuit components cluster
      { slug: "voltage-divider-calculator", title: "Voltage Divider", description: "Calculate the output voltage of a two-resistor voltage divider. Enter input voltage and both resistor values — useful for sensor biasing, ADC reference voltages, and signal conditioning.", keywords: ["voltage divider calculator", "voltage divider formula", "resistor divider", "output voltage calculator"], status: "live" },
      { slug: "resistor-color-code", title: "Resistor Color Code", description: "Decode 4-band, 5-band, and 6-band resistor color codes to find resistance in ohms, tolerance, and temperature coefficient. Also converts a resistance value to color bands.", keywords: ["resistor color code", "resistor color bands", "resistor calculator", "decode resistor"], status: "live" },
      { slug: "capacitance-calculator", title: "Capacitor Calculator — Series & Parallel Capacitance", description: "Calculate equivalent capacitance for capacitors in series and parallel, plus RC time constants. Enter values, get total capacitance instantly — free, no signup.", keywords: ["capacitor calculator", "capacitance calculator", "parallel capacitor calculator", "series capacitor calculator", "capacitor series parallel calculator", "equivalent capacitance calculator", "rc time constant"], status: "live" },
      { slug: "inductance-calculator", title: "Inductance Calculator", description: "Calculate inductive reactance (XL) and energy stored in an inductor from inductance and frequency. Also computes resonant frequency for LC circuits.", keywords: ["inductance calculator", "inductive reactance", "xl calculator", "lc resonant frequency"], status: "live" },
      // Signal / measurement
      { slug: "decibel-calculator", title: "Decibel Calculator", description: "Calculate decibels (dB) from voltage ratios, power ratios, or amplitude ratios — and convert dB values back to linear ratios. Covers dBV, dBm, and dBW standards.", keywords: ["decibel calculator", "db calculator", "db to voltage", "power to db"], status: "live" },
      // Wire
      { slug: "awg-wire-size", title: "AWG Wire Size", description: "Look up American Wire Gauge (AWG) specifications: diameter in mm, cross-section in mm², resistance per meter, and maximum ampacity for chassis and power wiring.", keywords: ["awg wire size", "american wire gauge", "awg to mm", "wire ampacity"], status: "live" },
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
  // 2026-10-11: JSON/XML/YAML tools consolidated into the -indent sites (absolute
  // URLs are honoured by app/tools/[slug]); CloudFront serves the real 301.
  "json-formatter": "https://json-indent.com/",
  "json-diff": "https://json-indent.com/diff.html",
  "json-to-xml": "https://json-indent.com/converter.html",
  "json-to-yaml": "https://json-indent.com/converter.html",
  "json-to-csv": "https://json-indent.com/converter.html",
  "yaml-formatter": "https://yaml-indent.com/",
  "yaml-to-json": "https://yaml-indent.com/converter.html",
  "yaml-to-xml": "https://yaml-indent.com/converter.html",
  "yaml-to-csv": "https://yaml-indent.com/converter.html",
  "xml-formatter": "https://xml-indent.com/",
  "xml-to-json": "https://xml-indent.com/converter.html",
  "xml-to-yaml": "https://xml-indent.com/converter.html",
  "xml-to-csv": "https://xml-indent.com/converter.html",
};

// Flat list for sitemap, search, and routing.
export const CATEGORIES: Category[] = RAW_CATEGORIES.map((c) => ({
  ...c,
  indexed: INDEXED_CATEGORIES.has(c.slug),
}));

export const ALL_TOOLS: (Tool & {
  categorySlug: string;
  categoryName: string;
  indexed: boolean;
})[] = CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({ ...t, categorySlug: c.slug, categoryName: c.name, indexed: c.indexed })),
);

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
