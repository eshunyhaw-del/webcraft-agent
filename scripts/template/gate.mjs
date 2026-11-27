// Template quality gate. Prints READY_FOR_MARKETPLACE only when every automated condition passes.
// Usage: node scripts/template/gate.mjs <template-folder> [--json]
// It does not run installs or builds; it reads the validation results recorded in the manifest and
// checks what it can check statically. Human review of design quality is still required.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadManifest } from "./validate-manifest.mjs";
import { checkSite } from "../qa/check-links.mjs";

export const EXCLUDE_DIRS = new Set(["node_modules", ".git", "dist", "build", "out", ".next", ".astro", ".svelte-kit", ".nuxt", ".cache", ".turbo", ".vercel", ".netlify", "coverage", "__pycache__"]);
export const MEDIA_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg", ".ico", ".mp4", ".webm", ".mov", ".mp3", ".wav", ".woff", ".woff2", ".ttf", ".otf", ".glb", ".gltf"]);
const TEXT_EXT = new Set([".html", ".css", ".js", ".mjs", ".ts", ".tsx", ".jsx", ".json", ".md", ".astro", ".vue", ".svelte", ".txt", ".yml", ".yaml"]);
const isEnvFile = (name) => /^\.env(\..+)?$/.test(name) && name !== ".env.example";

export function listFiles(dir, { includeBuild = false } = {}) {
  const out = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory() && (EXCLUDE_DIRS.has(e.name) && !(includeBuild && ["dist", "build", "out"].includes(e.name)))) continue;
      const p = join(d, e.name);
      e.isDirectory() ? walk(p) : out.push(p);
    }
  })(dir);
  return out;
}

export function gate(templateDir) {
  const dir = resolve(templateDir);
  const results = [];
  const add = (name, status, detail) => results.push({ name, status, detail });
  const rel = (p) => relative(dir, p).replace(/\\/g, "/");

  const { manifest, errors } = loadManifest(dir);
  add("Manifest matches schema 1.0", errors.length ? "FAIL" : "PASS", errors.join("; ") || "webcraft-template.json valid");
  const files = listFiles(dir);

  add("README with setup instructions", existsSync(join(dir, "README.md")) ? "PASS" : "FAIL", "README.md");

  const envFiles = files.filter((f) => isEnvFile(f.split(/[\\/]/).pop())).map(rel);
  add("No .env files with real values", envFiles.length ? "FAIL" : "PASS", envFiles.join(", ") || "none");

  if (manifest) {
    const needsEnv = (manifest.requiresEnvironmentVariables || []).length > 0;
    if (needsEnv) {
      const ex = join(dir, ".env.example");
      const missing = existsSync(ex) ? manifest.requiresEnvironmentVariables.filter((v) => !readFileSync(ex, "utf8").includes(v)) : manifest.requiresEnvironmentVariables;
      add(".env.example lists every required variable", missing.length ? "FAIL" : "PASS", missing.length ? "missing: " + missing.join(", ") : ".env.example");
    }

    const tokens = manifest.designTokens && join(dir, manifest.designTokens);
    add("Design tokens file exists", tokens && existsSync(tokens) ? "PASS" : "FAIL", manifest.designTokens);

    const missingPoints = (manifest.customizationPoints || []).filter((c) => !existsSync(join(dir, c.file))).map((c) => c.file);
    add("Customisation points point to real files", missingPoints.length ? "FAIL" : "PASS", missingPoints.join(", ") || `${(manifest.customizationPoints || []).length} documented`);

    const listed = new Set((manifest.assets || []).map((a) => a.path.replace(/^\.\//, "")));
    const unlisted = files.filter((f) => MEDIA_EXT.has(extname(f).toLowerCase())).map(rel).filter((p) => !listed.has(p));
    const unknown = (manifest.assets || []).filter((a) => /^(unknown|tbd|\?|none)$/i.test(a.license.trim())).map((a) => a.path);
    add("Every media file has known usage rights", unlisted.length || unknown.length ? "FAIL" : "PASS",
      [unlisted.length && "not in manifest.assets: " + unlisted.join(", "), unknown.length && "unknown licence: " + unknown.join(", ")].filter(Boolean).join("; ") || `${listed.size} asset(s) listed`);

    const out = join(dir, manifest.buildOutput || ".");
    if (existsSync(out) && statSync(out).isDirectory() && readdirSync(out).length) {
      const r = checkSite(out);
      add("Routes, links and assets resolve; no placeholder links", r.errors.length ? "FAIL" : "PASS", r.errors.slice(0, 5).join("; ") || `${r.pages} page(s)`);
      const routes = (manifest.pages || []).filter((p) => {
        const base = join(out, p.route.replace(/^\//, ""));
        return !(existsSync(join(base, "index.html")) || existsSync(base + ".html") || (p.route === "/" && existsSync(join(out, "index.html"))));
      }).map((p) => p.route);
      add("Every manifest page exists in the build output", routes.length ? "FAIL" : "PASS", routes.join(", ") || `${(manifest.pages || []).length} route(s)`);
    } else {
      add("Routes, links and assets resolve; no placeholder links", "NOT RUN", `build output "${manifest.buildOutput}" not found; build the template first`);
    }

    const v = manifest.validation || {};
    for (const k of ["install", "build", "routes"]) {
      const s = v[k]?.status;
      const okStatic = manifest.framework === "static" && s === "NOT APPLICABLE" && k !== "routes";
      add(`Recorded ${k} check passed`, s === "PASS" || okStatic ? "PASS" : "FAIL", `${s || "missing"}: ${v[k]?.evidence || ""}`);
    }
    const rs = v.responsive?.status;
    add("Responsive checks run or explicitly unavailable", rs === "PASS" || (rs === "NOT RUN" && (v.responsive?.evidence || "").length > 10) ? "PASS" : "FAIL", `${rs || "missing"}: ${v.responsive?.evidence || ""}`);
  }

  const leaks = [];
  for (const f of files.filter((f) => TEXT_EXT.has(extname(f).toLowerCase()) && !f.endsWith("webcraft-template.json"))) {
    const t = readFileSync(f, "utf8");
    for (const m of t.matchAll(/[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g)) if (!/^(example\.(com|org|net)|.*\.example|.*\.test)$/i.test(m[1]) && !/@(\d|[a-z-]+\/)/.test(m[0])) leaks.push(`${rel(f)}: ${m[0]}`);
    for (const m of t.matchAll(/\b(sk_live_[A-Za-z0-9]{8,}|pk_live_[A-Za-z0-9]{8,}|AKIA[A-Z0-9]{16}|ghp_[A-Za-z0-9]{20,}|xox[bp]-[A-Za-z0-9-]{10,})/g)) leaks.push(`${rel(f)}: credential-like string ${m[1].slice(0, 8)}…`);
  }
  add("No private emails or credentials", leaks.length ? "FAIL" : "PASS", leaks.slice(0, 6).join("; ") || "none found (use @example.com in templates)");

  const ready = results.every((r) => r.status === "PASS");
  return { status: ready ? "READY_FOR_MARKETPLACE" : "NOT_READY", results };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const dir = process.argv[2];
  if (!dir || !existsSync(dir)) { console.error("Usage: node scripts/template/gate.mjs <template-folder> [--json]"); process.exit(2); }
  const r = gate(dir);
  if (process.argv.includes("--json")) console.log(JSON.stringify(r, null, 2));
  else {
    for (const x of r.results) console.log(`${x.status.padEnd(8)} ${x.name}${x.detail ? "  (" + x.detail + ")" : ""}`);
    console.log("\n" + r.status + (r.status === "READY_FOR_MARKETPLACE" ? " (automated checks only; a human still reviews the design)" : ""));
  }
  process.exitCode = r.status === "READY_FOR_MARKETPLACE" ? 0 : 1;
}
