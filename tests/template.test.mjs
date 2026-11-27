import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, writeFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest } from "../scripts/template/validate-manifest.mjs";
import { gate } from "../scripts/template/gate.mjs";
import { exportTemplate } from "../scripts/template/export.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ok = join(here, "fixtures", "template-ok");
const bad = join(here, "fixtures", "template-bad");
const scratch = () => mkdtempSync(join(tmpdir(), "webcraft-test-"));
const failed = (r) => r.results.filter((x) => x.status !== "PASS").map((x) => x.name);

test("a complete manifest validates", () => {
  assert.deepEqual(loadManifest(ok).errors, []);
});

test("an invalid manifest reports each problem", () => {
  const e = loadManifest(bad).errors.join("\n");
  for (const s of ["schemaVersion must be", "templateId", "version", "framework must be one of", "pages needs at least 1", "extra is not an allowed property", "validation is required"]) assert.match(e, new RegExp(s));
});

test("the complete fixture passes the quality gate", () => {
  const r = gate(ok);
  assert.deepEqual(failed(r), []);
  assert.equal(r.status, "READY_FOR_MARKETPLACE");
});

test("the flawed fixture is NOT_READY for the right reasons", () => {
  const f = failed(gate(bad));
  for (const name of ["Manifest matches schema 1.0", "README with setup instructions", "Every media file has known usage rights", "Routes, links and assets resolve; no placeholder links", "No private emails or credentials"]) assert.ok(f.includes(name), name);
});

test("a .env file or a live key blocks the gate", () => {
  const d = scratch();
  try {
    cpSync(ok, d, { recursive: true });
    writeFileSync(join(d, ".env"), "API_KEY=real\n");
    assert.ok(failed(gate(d)).includes("No .env files with real values"));
    rmSync(join(d, ".env"));
    writeFileSync(join(d, "config.js"), 'const key = "sk_live_abcdefghijklmnop";\n');
    assert.ok(failed(gate(d)).includes("No private emails or credentials"));
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test("a missing required environment variable example blocks the gate", () => {
  const d = scratch();
  try {
    cpSync(ok, d, { recursive: true });
    const m = JSON.parse(readFileSync(join(d, "webcraft-template.json"), "utf8"));
    m.requiresEnvironmentVariables = ["FORM_ENDPOINT"];
    writeFileSync(join(d, "webcraft-template.json"), JSON.stringify(m));
    assert.ok(failed(gate(d)).includes(".env.example lists every required variable"));
    writeFileSync(join(d, ".env.example"), "FORM_ENDPOINT=\n");
    assert.ok(!failed(gate(d)).includes(".env.example lists every required variable"));
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test("export leaves out secrets, private records and unlicensed media, and the result still passes the gate", () => {
  const src = scratch(), out = scratch();
  try {
    cpSync(ok, src, { recursive: true });
    writeFileSync(join(src, ".env"), "SECRET=1\n");
    writeFileSync(join(src, "assets", "stock.jpg"), "x");
    writeFileSync(join(src, "debug.log"), "x");
    const r = exportTemplate(src, out, { force: true });
    const skipped = Object.fromEntries(r.skipped.map((s) => [s.path, s.reason]));
    assert.match(skipped[".env"], /environment/);
    assert.match(skipped[".webcraft/project-brief.md"], /client details/);
    assert.match(skipped["assets/stock.jpg"], /licence/);
    assert.match(skipped["debug.log"], /log/);
    assert.ok(existsSync(join(out, ".webcraft", "validation-report.md")));
    assert.ok(existsSync(join(out, "EXPORT.json")));
    assert.equal(gate(out).status, "READY_FOR_MARKETPLACE");
  } finally { rmSync(src, { recursive: true, force: true }); rmSync(out, { recursive: true, force: true }); }
});

test("export refuses an invalid manifest and a non-empty target without --force", () => {
  const out = scratch();
  try {
    assert.throws(() => exportTemplate(bad, out), /Manifest invalid/);
    writeFileSync(join(out, "keep.txt"), "x");
    assert.throws(() => exportTemplate(ok, out), /not empty/);
  } finally { rmSync(out, { recursive: true, force: true }); }
});
