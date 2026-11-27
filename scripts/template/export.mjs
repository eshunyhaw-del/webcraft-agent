// Exports a template into a clean, installable folder for distribution.
// Usage: node scripts/template/export.mjs <template-folder> <output-folder> [--force]
// Copies source, public assets, manifest, README, .env.example, licence notes and the QA reports in
// .webcraft/ (validation-report.md, visual-qa-report.md, screenshots/). Leaves out node_modules, build
// caches, .env files, other .webcraft files (they can contain client details), OS junk, logs, and any media
// file the manifest does not license. Refuses to export when the manifest is invalid.
// Zip the output folder with your operating system to upload it.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, relative, dirname, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadManifest } from "./validate-manifest.mjs";
import { listFiles, MEDIA_EXT } from "./gate.mjs";

const KEEP_RECORD = /^\.webcraft\/(validation-report\.md|visual-qa-report\.md|screenshots\/.+)$/;
const JUNK = /(^|\/)(\.DS_Store|Thumbs\.db|[^/]*\.log)$/;

export function exportTemplate(templateDir, outDir, { force = false } = {}) {
  const src = resolve(templateDir), out = resolve(outDir);
  const { manifest, errors } = loadManifest(src);
  if (errors.length) throw new Error("Manifest invalid; fix it before exporting:\n  " + errors.join("\n  "));
  if (existsSync(out) && readdirSync(out).length) {
    if (!force) throw new Error(`${out} is not empty. Use --force to replace it.`);
    rmSync(out, { recursive: true, force: true });
  }
  const licensed = new Set(manifest.assets.map((a) => a.path.replace(/^\.\//, "")));
  const copied = [], skipped = [];
  for (const f of listFiles(src)) {
    const rel = relative(src, f).replace(/\\/g, "/");
    const name = rel.split("/").pop();
    let reason = null;
    if (/^\.env(\..+)?$/.test(name) && name !== ".env.example") reason = "local environment file";
    else if (rel.startsWith(".webcraft/") && !KEEP_RECORD.test(rel)) reason = "project record (may contain client details)";
    else if (JUNK.test(rel)) reason = "OS or log file";
    else if (MEDIA_EXT.has(extname(name).toLowerCase()) && !licensed.has(rel) && !rel.startsWith(".webcraft/screenshots/")) reason = "media without licence in manifest.assets";
    if (reason) { skipped.push({ path: rel, reason }); continue; }
    mkdirSync(dirname(join(out, rel)), { recursive: true });
    copyFileSync(f, join(out, rel));
    copied.push(rel);
  }
  const summary = { templateId: manifest.templateId, version: manifest.version, exportedAt: new Date().toISOString(), files: copied.length, skipped };
  writeFileSync(join(out, "EXPORT.json"), JSON.stringify(summary, null, 2) + "\n");
  return { out, copied, skipped };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const [dir, outDir] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!dir || !outDir) { console.error("Usage: node scripts/template/export.mjs <template-folder> <output-folder> [--force]"); process.exit(2); }
  try {
    const r = exportTemplate(dir, outDir, { force: process.argv.includes("--force") });
    console.log(`Exported ${r.copied.length} file(s) to ${r.out}`);
    for (const s of r.skipped) console.log(`  left out ${s.path}  (${s.reason})`);
    console.log("Run scripts/template/gate.mjs on the exported folder before publishing it.");
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
