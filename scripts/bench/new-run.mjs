// Creates a benchmark run record in benchmarks/runs/ with the prompt version and commit filled in.
// Usage: node scripts/bench/new-run.mjs <brief-id> [--model NAME] [--tool "NAME"] [--stack "STACK"]
// Then fill in build, qa, screenshots, scores (1-5 with evidence), defects and notes by hand.
import { existsSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const git = (...args) => { try { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); } catch { return "unknown"; } };

export const DIMENSIONS = ["briefAdherence", "visualDistinctiveness", "typography", "layout", "uxClarity", "conversionClarity", "functionalCompleteness", "responsive", "accessibility", "performance", "maintainability", "factualIntegrity"];

export function newRun(brief, { model = "unknown", tool = "unknown", stack = "", date = new Date().toISOString().slice(0, 10), runsDir = join(root, "benchmarks", "runs") } = {}) {
  if (!existsSync(join(root, "benchmarks", "briefs", brief + ".md"))) throw new Error(`No brief benchmarks/briefs/${brief}.md`);
  mkdirSync(runsDir, { recursive: true });
  const prefix = `${date}-${brief}-`;
  const n = readdirSync(runsDir).filter((f) => f.startsWith(prefix)).length + 1;
  const runId = prefix + n;
  const record = {
    schemaVersion: "1.0",
    runId,
    date,
    brief,
    promptVersion: git("hash-object", "agent/WEBCRAFT_MASTER_PROMPT.md"),
    commit: git("rev-parse", "--short", "HEAD"),
    model,
    tool,
    stack,
    build: { status: "NOT RUN", evidence: "" },
    qa: { status: "NOT RUN", evidence: "" },
    screenshots: [],
    scores: Object.fromEntries(DIMENSIONS.map((d) => [d, null])),
    evidence: {},
    criticalDefects: [],
    defects: [],
    notes: "",
  };
  const file = join(runsDir, runId + ".json");
  writeFileSync(file, JSON.stringify(record, null, 2) + "\n");
  return file;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  const brief = args[0];
  if (!brief || brief.startsWith("--")) {
    console.error("Usage: node scripts/bench/new-run.mjs <brief-id> [--model NAME] [--tool NAME] [--stack STACK]");
    console.error("Briefs: " + readdirSync(join(root, "benchmarks", "briefs")).map((f) => f.replace(/\.md$/, "")).join(", "));
    process.exit(2);
  }
  try {
    console.log("Created " + newRun(brief, { model: opt("--model"), tool: opt("--tool"), stack: opt("--stack") }));
    console.log("Fill in build, qa, screenshots, scores with evidence, and defects (see benchmarks/rubric.md).");
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
