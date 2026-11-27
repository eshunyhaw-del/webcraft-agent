// Design-token consistency audit. No dependencies.
// Usage: node scripts/qa/token-audit.mjs <site-or-src-folder> [--json] [--max-raw-colors N]
// Reads .css files and <style> blocks in .html files. Reports:
//   - colours defined as custom properties (tokens) versus raw colour literals used directly in rules,
//   - distinct raw spacing/size values used in margin, padding and gap,
//   - distinct border-radius values.
// A high count of raw values usually means the page styles bypass the design tokens. It is a prompt to look,
// not a verdict; transparent overlays such as rgba(0,0,0,.4) on a scrim can be legitimate.
// With --max-raw-colors N, exits 1 when more than N distinct raw colours are used outside token definitions.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^)]*\)/gi;

export function auditTokens(dir) {
  const files = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (["node_modules", "dist", "build", ".git"].includes(e.name)) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if ([".css", ".html", ".scss"].includes(extname(e.name))) files.push(p);
    }
  })(resolve(dir));

  const tokens = new Map(), raw = new Map(), spacing = new Map(), radius = new Map();
  const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);
  for (const f of files) {
    let css = readFileSync(f, "utf8");
    if (extname(f) === ".html") css = [...css.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
    css = css.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const decl of css.matchAll(/([-\w]+)\s*:\s*([^;{}]+)/g)) {
      const [, prop, value] = decl;
      if (prop.startsWith("--")) { for (const c of value.match(COLOR) || []) tokens.set(prop, c); continue; }
      for (const c of value.match(COLOR) || []) bump(raw, c.toLowerCase().replace(/\s+/g, ""));
      if (/^(margin|padding|gap|row-gap|column-gap)(-|$)/.test(prop) && !value.includes("var(")) for (const v of value.trim().split(/\s+/)) if (/^-?[\d.]+(px|rem|em)$/.test(v)) bump(spacing, v);
      if (prop === "border-radius" && !value.includes("var(")) bump(radius, value.trim());
    }
  }
  const sorted = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([value, uses]) => ({ value, uses }));
  return { files: files.length, colorTokens: tokens.size, rawColors: sorted(raw), rawSpacing: sorted(spacing), radii: sorted(radius) };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const dir = process.argv[2];
  if (!dir || !existsSync(dir)) { console.error("Usage: node scripts/qa/token-audit.mjs <folder> [--json] [--max-raw-colors N]"); process.exit(2); }
  const r = auditTokens(dir);
  const i = process.argv.indexOf("--max-raw-colors");
  const max = i > 0 ? Number(process.argv[i + 1]) : null;
  if (process.argv.includes("--json")) console.log(JSON.stringify(r, null, 2));
  else {
    const top = (list) => list.slice(0, 10).map((x) => `${x.value} ×${x.uses}`).join(", ") || "none";
    console.log(`${r.files} file(s). Colour tokens defined: ${r.colorTokens}.`);
    console.log(`Raw colours used outside tokens: ${r.rawColors.length} distinct. Most used: ${top(r.rawColors)}`);
    console.log(`Raw spacing values (margin/padding/gap): ${r.rawSpacing.length} distinct. Most used: ${top(r.rawSpacing)}`);
    console.log(`Border radii: ${r.radii.length} distinct: ${top(r.radii)}`);
  }
  if (max !== null && r.rawColors.length > max) { console.log(`FAIL: ${r.rawColors.length} distinct raw colours > ${max}`); process.exitCode = 1; }
}
