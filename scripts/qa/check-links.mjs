// Static route and link checker for a built site folder. No dependencies, no network.
// Usage: node scripts/qa/check-links.mjs <site-folder> [--json] [--strict]
// Checks every .html file: local href/src/poster/srcset targets exist, #fragments exist in the target page,
// and flags placeholder links (href="#", empty, javascript:). Lists external links without fetching them.
// Warns when a <nav> menu only jumps to sections of one page, or when a link to the site's own pages opens a
// new tab (owner's rule: one page per menu item, same tab). Warnings fail the run only with --strict.
// For frameworks, run it on the production build output (dist/, out/, build/). Exits 1 on any error.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, relative, extname } from "node:path";
import { pathToFileURL } from "node:url";

export function checkSite(siteDir) {
  const root = resolve(siteDir);
  const pages = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".") || e.name.startsWith("_")) continue; // _partials are templates, not pages
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (extname(e.name) === ".html") pages.push(p);
    }
  })(root);

  const idsCache = new Map();
  const idsOf = (file) => {
    if (!idsCache.has(file)) {
      const html = readFileSync(file, "utf8");
      idsCache.set(file, new Set([...html.matchAll(/\s(?:id|name)=["']([^"']+)["']/g)].map((m) => m[1])));
    }
    return idsCache.get(file);
  };
  const resolveTarget = (fromFile, urlPath) => {
    let p = urlPath.startsWith("/") ? join(root, urlPath) : resolve(dirname(fromFile), urlPath);
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
    else if (!existsSync(p) && !extname(p) && existsSync(p + ".html")) p += ".html";
    return p;
  };

  const errors = [], warnings = [], external = new Set();
  let checked = 0;
  for (const page of pages) {
    const html = readFileSync(page, "utf8").replace(/<!--[\s\S]*?-->/g, "");
    const where = relative(root, page).replace(/\\/g, "/");
    const refs = [];
    for (const nav of html.matchAll(/<nav\b[\s\S]*?<\/nav>/gi)) {
      const hrefs = [...nav[0].matchAll(/<a\b[^>]*\shref\s*=\s*(["'])(.*?)\1/gi)].map((m) => m[2].trim());
      if (hrefs.length >= 2 && hrefs.every((h) => h.startsWith("#") && h !== "#")) warnings.push(`${where}: menu only jumps to sections of this page (${hrefs.slice(0, 4).join(", ")}); give each menu item its own page`);
    }
    for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
      const href = (m[0].match(/\shref\s*=\s*(["'])(.*?)\1/i) || [])[2];
      if (href && /\starget\s*=\s*(["'])_blank\1/i.test(m[0]) && !/^((https?:)?\/\/|mailto:|tel:|sms:)/i.test(href.trim())) warnings.push(`${where}: link to the site's own page "${href}" opens a new tab; remove target="_blank"`);
    }
    for (const m of html.matchAll(/<(a|link|script|img|source|video|audio|iframe)\b[^>]*>/gi)) {
      const tag = m[0];
      for (const a of tag.matchAll(/\s(href|src|poster)\s*=\s*(["'])(.*?)\2/gi)) refs.push({ attr: a[1].toLowerCase(), val: a[3].trim(), tag: m[1].toLowerCase() });
      const ss = tag.match(/\ssrcset\s*=\s*(["'])(.*?)\1/i);
      if (ss) for (const part of ss[2].split(",")) { const u = part.trim().split(/\s+/)[0]; if (u) refs.push({ attr: "srcset", val: u, tag: m[1].toLowerCase() }); }
    }
    for (const { attr, val, tag } of refs) {
      if (tag === "a" && attr === "href" && (val === "" || val === "#" || /^javascript:/i.test(val))) {
        errors.push(`${where}: placeholder link href="${val}"`);
        continue;
      }
      if (/^(mailto:|tel:|data:|sms:)/i.test(val)) continue;
      if (/^(https?:)?\/\//i.test(val)) { external.add(val); continue; }
      checked++;
      const [pathPart, frag] = val.split("#");
      const target = pathPart ? resolveTarget(page, decodeURIComponent(pathPart.split("?")[0])) : page;
      if (!existsSync(target)) { errors.push(`${where}: ${attr}="${val}" points to a missing file`); continue; }
      if (frag && extname(target) === ".html" && !idsOf(target).has(decodeURIComponent(frag))) errors.push(`${where}: ${attr}="${val}" points to a missing #${frag}`);
    }
  }
  return { pages: pages.length, checked, errors, warnings, external: [...external].sort() };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const dir = process.argv[2];
  if (!dir || !existsSync(dir)) {
    console.error("Usage: node scripts/qa/check-links.mjs <site-folder> [--json] [--strict]");
    process.exit(2);
  }
  const r = checkSite(dir);
  if (process.argv.includes("--json")) console.log(JSON.stringify(r, null, 2));
  else {
    console.log(`${r.pages} page(s), ${r.checked} local reference(s) checked, ${r.external.length} external link(s) not fetched.`);
    for (const e of r.errors) console.log("ERROR " + e);
    for (const w of r.warnings) console.log("WARN  " + w);
    console.log(r.errors.length ? `\nFAIL: ${r.errors.length} problem(s)` : "\nPASS: every local link and asset resolves" + (r.warnings.length ? ` (${r.warnings.length} warning(s))` : ""));
  }
  process.exitCode = r.errors.length || (process.argv.includes("--strict") && r.warnings.length) ? 1 : 0;
}
