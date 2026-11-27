// Repository consistency checks. No dependencies. Run before every commit:
//   node scripts/check.mjs
// Exits 1 if any check fails. Also runs the unit tests in tests/ with node --test.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { renderAgent, agentPath, root } from "./build-agent.mjs";

const results = [];
const check = (name, fn) => {
  try {
    const detail = fn();
    results.push({ name, ok: true, detail });
  } catch (e) {
    results.push({ name, ok: false, detail: e.message });
  }
};
const read = (p) => readFileSync(join(root, p), "utf8").replace(/\r\n/g, "\n");
const SKIP_DIRS = new Set([".git", "node_modules", "__pycache__"]);
function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const files = walk(root);
const rel = (p) => relative(root, p).replace(/\\/g, "/");

check("Generated agent file matches the master prompt", () => {
  if (read(rel(agentPath)) !== renderAgent()) throw new Error("Out of date. Run: node scripts/build-agent.mjs");
  return ".claude/agents/webcraft.md is in sync";
});

check("Lite prompt fits ChatGPT's 8,000-character instruction box", () => {
  const n = read("agent/WEBCRAFT_LITE.md").length;
  if (n > 8000) throw new Error(`${n} characters; trim to 8,000 or fewer`);
  return `${n} characters`;
});

check("CLAUDE.md and GEMINI.md are identical", () => {
  if (read("CLAUDE.md") !== read("GEMINI.md")) throw new Error("They differ. Edit one, copy it over the other.");
  return "identical";
});

check("Every tool entry file points to the master prompt", () => {
  const entries = ["CLAUDE.md", "GEMINI.md", "AGENTS.md", ".cursor/rules/webcraft.mdc", ".github/copilot-instructions.md"];
  const missing = entries.filter((f) => !read(f).includes("agent/WEBCRAFT_MASTER_PROMPT.md"));
  if (missing.length) throw new Error("No reference in: " + missing.join(", "));
  return `${entries.length} files`;
});

check("Files the master prompt names exist", () => {
  const mp = read("agent/WEBCRAFT_MASTER_PROMPT.md");
  const named = new Set();
  for (const m of mp.matchAll(/`((?:docs|scripts|examples|references|templates|benchmarks|schemas|showcase)\/[^`\s]*)`/g)) named.add(m[1].replace(/\/$/, ""));
  // Section 11.1 names files relative to the bundled skill folder, so accept either location.
  const skill = join(root, ".claude", "skills", "motionsites-web-builder");
  const missing = [...named].filter((p) => !existsSync(join(root, p)) && !existsSync(join(skill, p)));
  if (missing.length) throw new Error("Missing: " + missing.join(", "));
  return `${named.size} paths`;
});

check("Relative Markdown links resolve", () => {
  let n = 0;
  const broken = [];
  for (const f of files.filter((f) => f.endsWith(".md"))) {
    const text = readFileSync(f, "utf8");
    for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = m[1].split("#")[0];
      if (!target || /^(https?:|mailto:)/.test(m[1])) continue;
      n++;
      if (!existsSync(resolve(dirname(f), target))) broken.push(`${rel(f)} -> ${m[1]}`);
    }
  }
  if (broken.length) throw new Error(broken.join("; "));
  return `${n} links`;
});

check("JSON files parse", () => {
  const json = files.filter((f) => f.endsWith(".json"));
  for (const f of json) {
    try { JSON.parse(readFileSync(f, "utf8")); } catch (e) { throw new Error(`${rel(f)}: ${e.message}`); }
  }
  return `${json.length} files`;
});

check("JavaScript files have valid syntax", () => {
  const js = files.filter((f) => /\.(m?js)$/.test(f) && !rel(f).startsWith("references/"));
  for (const f of js) {
    const r = spawnSync(process.execPath, ["--check", f], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`${rel(f)}: ${r.stderr.split("\n").slice(0, 4).join(" ")}`);
  }
  return `${js.length} files`;
});

check("No secrets or local env files are tracked", () => {
  const bad = files.filter((f) => /(^|[\\/])\.env(\.(?!example$)[^\\/]*)?$/.test(f));
  if (bad.length) throw new Error(bad.map(rel).join(", "));
  return "none";
});

check("Unit tests pass", () => {
  if (!existsSync(join(root, "tests")) || !statSync(join(root, "tests")).isDirectory()) return "no tests/ folder";
  const testFiles = readdirSync(join(root, "tests")).filter((f) => f.endsWith(".test.mjs")).map((f) => join(root, "tests", f));
  if (!testFiles.length) return "no test files";
  const r = spawnSync(process.execPath, ["--test", ...testFiles], { encoding: "utf8", cwd: root });
  const summary = (r.stdout.match(/^# (pass|fail) \d+$/gm) || []).join(", ");
  if (r.status !== 0) throw new Error(summary + "\n" + r.stdout.split("\n").filter((l) => /not ok|Error|expected|actual/.test(l)).slice(0, 12).join("\n"));
  return summary.replace(/# /g, "");
});

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  (" + r.detail + ")" : ""}`);
}
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
