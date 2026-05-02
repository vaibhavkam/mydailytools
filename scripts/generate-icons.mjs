// Generate PNG icons + OG card from public/favicon.svg and public/og.svg.
// Uses macOS-native qlmanage (Quick Look) to rasterize SVGs — no npm deps.
//
// Run:  node scripts/generate-icons.mjs
//
// Outputs to public/:
//   - favicon.ico             (32×32 PNG renamed; modern browsers accept PNG-in-ICO)
//   - apple-touch-icon.png    (180×180)
//   - icon-192.png            (192×192, PWA manifest)
//   - icon-512.png            (512×512, PWA manifest)
//   - og.png                  (1200×630, social previews)

import { execSync } from "node:child_process";
import { readdirSync, renameSync, unlinkSync, existsSync, mkdtempSync, copyFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pub = resolve(root, "public");

function rasterize(svgPath, outDir, size) {
  // qlmanage produces a thumbnail at <size> capped to fit the source's aspect ratio.
  // For a square SVG it gives us exactly size×size; for the OG card (1200×630),
  // requesting size 1200 yields 1200×630.
  execSync(`qlmanage -t -s ${size} -o "${outDir}" "${svgPath}" >/dev/null 2>&1`);
  const stem = svgPath.split("/").pop().replace(/\.svg$/, "");
  // qlmanage names output as <basename>.svg.png
  const produced = readdirSync(outDir).find((f) => f.startsWith(stem + ".svg") && f.endsWith(".png"));
  if (!produced) throw new Error(`qlmanage did not produce a PNG for ${svgPath} at size ${size}`);
  return join(outDir, produced);
}

function makePng(svgRelPath, outName, size) {
  const tmp = mkdtempSync(join(tmpdir(), "icons-"));
  const png = rasterize(resolve(pub, svgRelPath), tmp, size);
  const dest = resolve(pub, outName);
  if (existsSync(dest)) unlinkSync(dest);
  renameSync(png, dest);
  console.log(`  ${outName.padEnd(28)} (${size}px from ${svgRelPath})`);
}

console.log("Generating raster icons from SVG sources…");
makePng("favicon.svg", "icon-192.png",            192);
makePng("favicon.svg", "icon-512.png",            512);
makePng("favicon.svg", "apple-touch-icon.png",    180);
// favicon.ico — many browsers happily accept a 32×32 PNG renamed to .ico.
makePng("favicon.svg", "favicon.ico",             32);
makePng("og.svg",      "og.png",                  1200);
// qlmanage clamps the long axis but emits a square canvas, so og.png comes out
// 1200×1200. Crop it back to the OpenGraph spec (1200×630) using sips.
execSync(`sips -c 630 1200 "${resolve(pub, "og.png")}" --out "${resolve(pub, "og.png")}" >/dev/null`);
console.log("Done.");
