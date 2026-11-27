import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const pipeline = JSON.parse(read("schemas/pipeline.json"));
const allStates = [...pipeline.stages.map((s) => s.state), ...pipeline.interruptions.map((s) => s.state)];

test("every pipeline transition targets a known state", () => {
  for (const s of pipeline.stages) for (const n of s.next) assert.ok(allStates.includes(n), `${s.state} -> ${n}`);
  for (const s of pipeline.interruptions) for (const n of s.returnsTo) assert.ok(allStates.includes(n), `${s.state} -> ${n}`);
});

test("every main stage is reachable from RECEIVED", () => {
  const seen = new Set(["RECEIVED"]);
  const queue = ["RECEIVED"];
  const edges = Object.fromEntries([...pipeline.stages.map((s) => [s.state, s.next]), ...pipeline.interruptions.map((s) => [s.state, s.returnsTo])]);
  while (queue.length) for (const n of edges[queue.shift()] || []) if (!seen.has(n)) { seen.add(n); queue.push(n); }
  for (const s of allStates) if (s !== "RECEIVED" && !pipeline.interruptions.some((i) => i.state === s)) assert.ok(seen.has(s), s);
  assert.ok(seen.has("DELIVERY"));
});

test("the pipeline document names every state", () => {
  const doc = read("docs/generation-pipeline.md");
  for (const s of allStates) assert.ok(doc.includes(s), `docs/generation-pipeline.md does not mention ${s}`);
});

test("every stage artifact has a template", () => {
  const map = { "page-specs/": "page-spec.md" };
  for (const s of pipeline.stages) {
    if (!s.artifact) continue;
    const t = map[s.artifact] || s.artifact;
    assert.ok(existsSync(join(root, "agent", "templates", t)), `missing agent/templates/${t}`);
  }
});

test("the state template uses valid values", () => {
  const st = JSON.parse(read("agent/templates/state.json"));
  assert.ok(allStates.includes(st.state));
  assert.ok(pipeline.modes.includes(st.mode));
  for (const c of st.completed) assert.ok(allStates.includes(c.state));
});

test("templates use only the defined vocabularies", () => {
  const ledger = read("agent/templates/content.md");
  for (const p of pipeline.provenance) assert.ok(ledger.includes(p), `content.md lacks ${p}`);
  assert.ok(!pipeline.provenance.includes("PLACEHOLDER"), "placeholders are no longer a provenance (master prompt Section 3.5)");
  const dir = read("agent/templates/creative-direction.md");
  for (const m of pipeline.motionClass) assert.ok(dir.includes(m), `creative-direction.md lacks ${m}`);
  const val = read("agent/templates/validation-report.md");
  for (const c of pipeline.checkStatus) assert.ok(val.includes(c), `validation-report.md lacks ${c}`);
});
