import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { newRun, DIMENSIONS } from "../scripts/bench/new-run.mjs";
import { report } from "../scripts/bench/report.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("there are ten benchmark briefs, each with the required sections", () => {
  const briefs = readdirSync(join(root, "benchmarks", "briefs")).filter((f) => f.endsWith(".md"));
  assert.equal(briefs.length, 10);
  for (const f of briefs) {
    const t = readFileSync(join(root, "benchmarks", "briefs", f), "utf8");
    for (const s of ["**User's words:**", "**Supplied facts:**", "**A good result:**", "**Traps:**"]) assert.ok(t.includes(s), `${f} lacks ${s}`);
  }
});

test("the rubric covers every scored dimension", () => {
  const rubric = readFileSync(join(root, "benchmarks", "rubric.md"), "utf8").toLowerCase();
  const names = ["brief adherence", "visual distinctiveness", "typography", "layout", "ux clarity", "conversion clarity", "functional completeness", "responsive", "accessibility", "performance", "maintainability", "content completeness and integrity"];
  assert.equal(names.length, DIMENSIONS.length);
  for (const n of names) assert.ok(rubric.includes(n), n);
});

test("new-run writes a valid record and report flags regressions", () => {
  const dir = mkdtempSync(join(tmpdir(), "webcraft-bench-"));
  try {
    const f1 = newRun("restaurant-local", { runsDir: dir, date: "2026-01-01", model: "test", tool: "test" });
    const f2 = newRun("restaurant-local", { runsDir: dir, date: "2026-01-02", model: "test", tool: "test" });
    assert.match(f1, /2026-01-01-restaurant-local-1\.json$/);
    let r = report(dir);
    assert.deepEqual(r.invalid, []);
    assert.equal(r.runs, 2);
    assert.deepEqual(r.regressions, []);

    const a = JSON.parse(readFileSync(f1, "utf8")), b = JSON.parse(readFileSync(f2, "utf8"));
    a.build.status = "PASS"; b.build.status = "FAIL";
    a.scores.typography = 4; b.scores.typography = 2;
    b.criticalDefects = ["Invented opening hours"];
    writeFileSync(f1, JSON.stringify(a)); writeFileSync(f2, JSON.stringify(b));
    r = report(dir);
    const text = r.regressions.join("\n");
    assert.match(text, /build went from PASS to FAIL/);
    assert.match(text, /typography dropped 4 → 2/);
    assert.match(text, /new critical defect/);

    b.scores.typography = 9;
    writeFileSync(f2, JSON.stringify(b));
    assert.ok(report(dir).invalid.some((e) => /typography must be one of/.test(e)));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("new-run rejects an unknown brief", () => {
  assert.throws(() => newRun("no-such-brief", { runsDir: tmpdir() }), /No brief/);
});
