// Generates .claude/agents/webcraft.md from agent/WEBCRAFT_MASTER_PROMPT.md.
// Edit the master prompt, then run: node scripts/build-agent.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const body = readFileSync(join(root, "agent", "WEBCRAFT_MASTER_PROMPT.md"), "utf8").replace(/\r\n/g, "\n");

const frontmatter = `---
name: webcraft
description: Autonomous website design and engineering agent. Use PROACTIVELY whenever the user asks to design, build, redesign, or prototype a website, landing page, or web experience. It runs the full workflow, from brief interpretation, creative direction and design system through assets, copy, motion and responsive build to visual QA, and produces an original, art-directed, conversion-focused site.
model: inherit
---

`;

const out = join(root, ".claude", "agents", "webcraft.md");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, frontmatter + body);
console.log("Wrote", out);
