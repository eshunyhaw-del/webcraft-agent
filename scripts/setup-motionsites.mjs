// Fetches the MotionSites example prompts and media shelf straight from MotionSites' own repository
// into .claude/skills/motionsites-web-builder/{examples,media}.
//
// Why a script and not committed files: those two folders are (c) MotionSites. Their licence lets you USE them
// to build websites with the skill, but forbids redistributing them as a prompt or media collection.
// This repo therefore never contains them. Each person downloads them directly from the source.
//
// Usage:   node scripts/setup-motionsites.mjs
// Needs:   Node 18+ and git.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM = "https://github.com/Motionsites-AI/claude-skill.git";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skill = join(root, ".claude", "skills", "motionsites-web-builder");

if (!existsSync(skill)) {
  console.error("Could not find " + skill + ". Run this script from a checkout of the WEBCraft repository.");
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), "motionsites-"));
try {
  console.log("Downloading from " + UPSTREAM + " ...");
  execFileSync("git", ["clone", "--depth", "1", "--quiet", UPSTREAM, tmp], { stdio: "inherit" });
  const upstreamSkill = join(tmp, "plugins", "motionsites-web-builder", "skills", "motionsites-web-builder");
  for (const dir of ["examples", "media"]) {
    const from = join(upstreamSkill, dir);
    if (!existsSync(from)) throw new Error("Upstream layout changed: missing " + from);
    cpSync(from, join(skill, dir), { recursive: true });
    console.log("  installed " + dir + "/ (" + readdirSync(from).length + " items)");
  }
  console.log("\nDone. The MotionSites example designs and media shelf are now available to the skill.");
  console.log("These files are (c) MotionSites. You may use them to build websites, including for clients.");
  console.log("You may not resell or redistribute them as a prompt or media collection. They are git-ignored here.");
} catch (e) {
  console.error("\nSetup failed: " + e.message);
  console.error("Is git installed and are you online? You can also clone the repository manually and copy its");
  console.error("examples/ and media/ folders into " + skill);
  process.exitCode = 1;
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
