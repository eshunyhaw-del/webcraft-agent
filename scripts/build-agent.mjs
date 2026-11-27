// Generates .claude/agents/webcraft.md from agent/WEBCRAFT_MASTER_PROMPT.md.
// Edit the master prompt, then run: node scripts/build-agent.mjs
// scripts/check.mjs imports renderAgent() to verify the committed file is in sync.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const agentPath = join(root, ".claude", "agents", "webcraft.md");

const frontmatter = `---
name: webcraft
description: Autonomous website design and engineering agent. Use PROACTIVELY whenever the user asks to design, build, redesign, or prototype a website, landing page, or web experience. It runs the full workflow, from brief interpretation, creative direction and design system through assets, copy, motion and responsive build to visual QA, and produces an original, art-directed, conversion-focused site.
model: inherit
---

`;

export function renderAgent() {
  const body = readFileSync(join(root, "agent", "WEBCRAFT_MASTER_PROMPT.md"), "utf8").replace(/\r\n/g, "\n");
  return frontmatter + body;
}

if (resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  mkdirSync(dirname(agentPath), { recursive: true });
  writeFileSync(agentPath, renderAgent());
  console.log("Wrote", agentPath);
}
