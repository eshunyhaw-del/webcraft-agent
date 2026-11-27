import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSite } from "../scripts/qa/check-links.mjs";
import { auditTokens } from "../scripts/qa/token-audit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fx = (p) => join(here, "fixtures", p);

test("check-links passes a site whose links, fragments and assets all resolve", () => {
  const r = checkSite(fx("site-ok"));
  assert.equal(r.pages, 2);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.external, ["https://example.com/"]);
});

test("check-links reports placeholder links, missing files and missing fragments", () => {
  const r = checkSite(fx("site-bad"));
  const text = r.errors.join("\n");
  assert.match(text, /placeholder link href="#"/);
  assert.match(text, /placeholder link href="javascript:void\(0\)"/);
  assert.match(text, /missing\.html" points to a missing file/);
  assert.match(text, /missing #nowhere/);
  assert.match(text, /img\/nope\.jpg" points to a missing file/);
  assert.equal(r.errors.length, 5);
});

test("check-links CLI exits 1 on errors and 0 when clean", () => {
  const cli = join(here, "..", "scripts", "qa", "check-links.mjs");
  assert.equal(spawnSync(process.execPath, [cli, fx("site-bad")]).status, 1);
  assert.equal(spawnSync(process.execPath, [cli, fx("site-ok")]).status, 0);
});

test("token-audit separates token definitions from raw colours", () => {
  const ok = auditTokens(fx("site-ok"));
  assert.equal(ok.colorTokens, 2);
  assert.equal(ok.rawColors.length, 0);
  const bad = auditTokens(fx("site-bad"));
  assert.deepEqual(bad.rawColors.map((c) => c.value).sort(), ["#333", "#ff0000", "#fff"]);
  assert.deepEqual(bad.rawSpacing.map((s) => s.value).sort(), ["11px", "13px", "7px"]);
  assert.deepEqual(bad.radii.map((s) => s.value), ["9px"]);
});

test("token-audit --max-raw-colors fails when the limit is exceeded", () => {
  const cli = join(here, "..", "scripts", "qa", "token-audit.mjs");
  assert.equal(spawnSync(process.execPath, [cli, fx("site-bad"), "--max-raw-colors", "2"]).status, 1);
  assert.equal(spawnSync(process.execPath, [cli, fx("site-bad"), "--max-raw-colors", "3"]).status, 0);
});

test("detect-tools reports node as AVAILABLE in JSON mode", () => {
  const cli = join(here, "..", "scripts", "qa", "detect-tools.mjs");
  const r = spawnSync(process.execPath, [cli, "--json"], { encoding: "utf8" });
  assert.equal(r.status, 0);
  const out = JSON.parse(r.stdout);
  assert.equal(out.tools.find((t) => t.tool === "node").status, "AVAILABLE");
  for (const t of out.tools) assert.ok(["AVAILABLE", "MISSING"].includes(t.status));
});

test("viewports.json lists the canonical QA sizes", () => {
  const v = JSON.parse(readFileSync(join(here, "..", "scripts", "qa", "viewports.json"), "utf8")).viewports;
  const sizes = v.map((x) => `${x.width}x${x.height}`);
  for (const s of ["360x640", "390x844", "768x1024", "1366x700", "1440x900", "1920x1080"]) assert.ok(sizes.includes(s), s);
});

test("check-links warns about a menu that only jumps to sections, and own-page links that open a new tab", () => {
  const r = checkSite(fx("site-onepage"));
  assert.deepEqual(r.errors, []);
  const w = r.warnings.join("\n");
  assert.match(w, /menu only jumps to sections of this page \(#about, #menu, #contact\)/);
  assert.match(w, /own page "menu\.html" opens a new tab/);
  assert.doesNotMatch(w, /example\.com/);
  assert.equal(r.warnings.length, 2);
  assert.deepEqual(checkSite(fx("site-ok")).warnings, []);
});

test("check-links --strict fails on navigation warnings", () => {
  const cli = join(here, "..", "scripts", "qa", "check-links.mjs");
  assert.equal(spawnSync(process.execPath, [cli, fx("site-onepage")]).status, 0);
  assert.equal(spawnSync(process.execPath, [cli, fx("site-onepage"), "--strict"]).status, 1);
});
