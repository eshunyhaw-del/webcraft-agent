// Static-site finisher for plain HTML, CSS and JavaScript sites. No dependencies, edits files in place.
// Usage: node scripts/site/build.mjs <site-folder> [--url https://www.example.org]
//
// 1. Shared partials: every page keeps a marked region, for example
//      <!-- include:header --> ... <!-- /include:header -->
//    and the region is replaced with _partials/header.html. In a partial, {{root}} becomes the relative path
//    to the site root ("", "../", ...), and a link with data-nav="about/" gets aria-current="page" on that page.
//    Pages stay valid, viewable HTML before and after a build.
// 2. sitemap.xml (when --url is given) and robots.txt.
// 3. Reports missing finishing files: favicon, web app manifest, Open Graph image, title and description.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

export function listPages(root) {
  const out = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".") || e.name.startsWith("_") || e.name === "node_modules" || e.name === "assets") continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) out.push(p);
    }
  })(root);
  return out.sort();
}

const route = (root, file) => {
  const r = relative(root, file).split(sep).join("/");
  return r === "index.html" ? "" : r.endsWith("/index.html") ? r.slice(0, -"index.html".length) : r;
};

export function applyPartials(root) {
  const partialsDir = join(root, "_partials");
  if (!existsSync(partialsDir)) return { updated: 0, partials: [] };
  const partials = Object.fromEntries(readdirSync(partialsDir).filter((f) => f.endsWith(".html")).map((f) => [f.slice(0, -5), readFileSync(join(partialsDir, f), "utf8").trim()]));
  let updated = 0;
  for (const file of listPages(root)) {
    const r = route(root, file);
    const depth = relative(root, file).split(sep).length - 1;
    const rootPath = file.endsWith(sep + "404.html") || r === "404.html" ? "/" : "../".repeat(depth);
    let html = readFileSync(file, "utf8");
    const before = html;
    html = html.replace(/(<!-- include:([\w-]+) -->)[\s\S]*?(<!-- \/include:\2 -->)/g, (m, open, name, close) => {
      if (!(name in partials)) return m;
      let part = partials[name].replaceAll("{{root}}", rootPath);
      part = part.replace(/<a\b([^>]*?)\sdata-nav="([^"]*)"([^>]*)>/g, (a, pre, nav, post) =>
        `<a${pre} data-nav="${nav}"${post}${nav === r ? ' aria-current="page"' : ""}>`);
      return `${open}\n${part}\n${close}`;
    });
    if (html !== before) { writeFileSync(file, html); updated++; }
  }
  return { updated, partials: Object.keys(partials) };
}

export function writeSeoFiles(root, url) {
  const pages = listPages(root).filter((f) => !f.endsWith("404.html"));
  const written = [];
  let robots = "User-agent: *\nAllow: /\n";
  if (url) {
    const base = url.replace(/\/+$/, "") + "/";
    const urls = pages.map((f) => `  <url><loc>${base}${route(root, f)}</loc></url>`).join("\n");
    writeFileSync(join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    written.push("sitemap.xml");
    robots += `Sitemap: ${base}sitemap.xml\n`;
  }
  writeFileSync(join(root, "robots.txt"), robots);
  written.push("robots.txt");
  return { pages: pages.length, written };
}

export function checkFinishing(root) {
  const missing = [];
  if (!["favicon.svg", "favicon.ico", "favicon.png"].some((f) => existsSync(join(root, f)))) missing.push("favicon (favicon.svg or favicon.ico at the site root)");
  if (!["site.webmanifest", "manifest.webmanifest", "manifest.json"].some((f) => existsSync(join(root, f)))) missing.push("web app manifest (site.webmanifest)");
  for (const file of listPages(root)) {
    const html = readFileSync(file, "utf8");
    const where = relative(root, file).split(sep).join("/");
    if (!/<link[^>]+rel="icon"/.test(html)) missing.push(`${where}: no <link rel="icon">`);
    if (!/property="og:image"/.test(html)) missing.push(`${where}: no og:image`);
    if (!/<meta name="description"/.test(html)) missing.push(`${where}: no meta description`);
    if (!/<title>[^<]+<\/title>/.test(html)) missing.push(`${where}: no title`);
  }
  return missing;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const dir = process.argv[2];
  if (!dir || !existsSync(dir)) { console.error("Usage: node scripts/site/build.mjs <site-folder> [--url https://www.example.org]"); process.exit(2); }
  const i = process.argv.indexOf("--url");
  const url = i > 0 ? process.argv[i + 1] : null;
  const root = resolve(dir);
  const p = applyPartials(root);
  console.log(p.partials.length ? `Partials (${p.partials.join(", ")}) applied to ${p.updated} page(s).` : "No _partials folder; skipped shared header and footer.");
  const s = writeSeoFiles(root, url);
  console.log(`Wrote ${s.written.join(" and ")} for ${s.pages} page(s).` + (url ? "" : " Add --url https://your-domain to also write sitemap.xml."));
  const missing = checkFinishing(root);
  for (const m of missing) console.log("MISSING " + m);
  console.log(missing.length ? `\n${missing.length} finishing item(s) missing.` : "\nAll finishing files present.");
  process.exitCode = missing.length ? 1 : 0;
}
