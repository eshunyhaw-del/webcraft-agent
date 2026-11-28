import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const mp = read("agent/WEBCRAFT_MASTER_PROMPT.md");

test("the master prompt carries the owner's complete-content, real-media and layout rules", () => {
  for (const h of ["## 3.5 Complete content, no placeholders", "## 3.6 Real photography and video on every site", "## 3.7 Rich, varied layouts"]) assert.ok(mp.includes(h), h);
  assert.doesNotMatch(mp, /Leave clearly marked slots/);
  assert.doesNotMatch(mp, /mark a content slot for the user/);
  assert.doesNotMatch(mp, /use a clearly identified placeholder/);
});

test("the harm guardrails stay in the complete-content rule", () => {
  const rule = mp.slice(mp.indexOf("## 3.5"), mp.indexOf("## 3.6"));
  for (const s of ["payment details", "registration", "real, named bodies", "real people", "Facts about the real world must be true"]) assert.ok(rule.includes(s), s);
});

test("every tool entry point repeats the new rules", () => {
  for (const f of ["AGENTS.md", "CLAUDE.md", ".cursor/rules/webcraft.mdc", ".github/copilot-instructions.md", "agent/WEBCRAFT_LITE.md"]) {
    const t = read(f);
    assert.doesNotMatch(t, /Never invent testimonials/i, f);
    assert.match(t, /placeholder/i, f);
  }
});

test("accent-stripe borders are a banned pattern everywhere the rules appear", () => {
  const rules = mp.slice(mp.indexOf("## 3.4"), mp.indexOf("## 3.5"));
  assert.match(rules, /No accent-stripe borders/);
  for (const f of ["CLAUDE.md", "GEMINI.md", "AGENTS.md", "agent/WEBCRAFT_LITE.md"]) assert.match(read(f), /accent-stripe borders/i, f);
  assert.match(read("scripts/qa/page-audit.js"), /Accent-stripe borders/);
});

test("tilde shorthand for 'approximately' is a banned pattern everywhere the rules appear", () => {
  const rules = mp.slice(mp.indexOf("## 3.4"), mp.indexOf("## 3.5"));
  assert.match(rules, /No tilde shorthand/);
  for (const f of ["CLAUDE.md", "GEMINI.md", "AGENTS.md", "agent/WEBCRAFT_LITE.md"]) assert.match(read(f), /"~" for "approximately"/, f);
  assert.match(read("scripts/qa/page-audit.js"), /No tilde shorthand/);
});

test("the section-pattern library exists and states the rhythm rules", () => {
  const t = read("docs/recipes/section-patterns.md");
  assert.match(t, /Never place two sections with the same pattern next to each other/);
  assert.match(t, /at least seven sections/);
});

const py = process.platform === "win32" ? "python" : "python3";
const media = join(root, "scripts", "media", "webcraft_media.py");
const run = (args, env = {}) => spawnSync(py, ["-B", media, ...args], { encoding: "utf8", env: { ...process.env, ...env } });

test("media tool explains a missing stock-library key instead of failing silently", (t) => {
  const r = run(["search", "baobab", "--source", "pexels", "--type", "video", "--n", "2"], { PEXELS_API_KEY: "" });
  if (r.error) return t.skip("python not available");
  assert.equal(r.status, 1);
  assert.match(r.stderr + r.stdout, /PEXELS_API_KEY/);
});

test("media tool refuses video from image-only sources with a pointer to video sources", (t) => {
  const r = run(["search", "x", "--source", "openverse", "--type", "video"]);
  if (r.error) return t.skip("python not available");
  assert.equal(r.status, 1);
  assert.match(r.stderr + r.stdout, /pexels, pixabay or commons/);
});

test("specific requests win over the standing rules, everywhere the rules appear", () => {
  assert.match(mp, /## 6\.0 Specific requests win/);
  assert.match(mp, /Use the user's text verbatim/);
  assert.match(mp, /Sites about a real person/);
  assert.match(mp, /\*\*Justified text\*\*/);
  for (const f of ["CLAUDE.md", "GEMINI.md", "AGENTS.md", "agent/WEBCRAFT_LITE.md"]) assert.match(read(f), /Specific requests win/, f);
});
