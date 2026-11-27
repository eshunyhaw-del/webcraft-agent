// Detects which validation tools exist in this environment, so the agent promises only checks it can run.
// Usage: node scripts/qa/detect-tools.mjs [--json]
// Any check whose tool is MISSING must be reported as NOT RUN, never as passed.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

function run(cmd, args, shell = false) {
  try {
    const r = spawnSync(cmd, args, { encoding: "utf8", timeout: 20000, shell, windowsHide: true });
    if (r.error || r.status !== 0) return null;
    return (r.stdout || r.stderr || "").trim().split("\n")[0];
  } catch {
    return null;
  }
}
const firstOf = (cands) => {
  for (const [cmd, args] of cands) {
    const v = run(cmd, args);
    if (v) return { cmd, version: v };
  }
  return null;
};

const python = firstOf([["python3", ["--version"]], ["python", ["--version"]], ["py", ["--version"]]]);
const pyMod = (mod, expr) => (python ? run(python.cmd, ["-c", `import ${mod}; print(${expr})`]) : null);

const chromePaths = {
  win32: [
    `${process.env["PROGRAMFILES"]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env["LOCALAPPDATA"]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env["PROGRAMFILES(X86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
  ],
  darwin: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"],
  linux: ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"],
}[process.platform] || [];

const tools = [
  { tool: "node", purpose: "build tools, repository checks, link and token audits", version: process.version },
  { tool: "npm", purpose: "install dependencies, run project scripts", version: process.platform === "win32" ? run("npm --version", [], true) : run("npm", ["--version"]) },
  { tool: "git", purpose: "version control", version: run("git", ["--version"]) },
  { tool: "python", purpose: "media tool, local web server", version: python && `${python.version} (${python.cmd})` },
  { tool: "ffmpeg", purpose: "video scan and cut", version: run("ffmpeg", ["-version"]) },
  { tool: "ffprobe", purpose: "video duration and brightness", version: run("ffprobe", ["-version"]) },
  { tool: "pillow", purpose: "image preparation, frame sheets", version: pyMod("PIL", "PIL.__version__") },
  { tool: "playwright (python)", purpose: "automated screenshots (shoot.py)", version: pyMod("playwright", "'installed'") },
  { tool: "chrome/edge", purpose: "headless screenshots without Playwright", version: chromePaths.find((p) => p && existsSync(p)) || null },
];
for (const t of tools) t.status = t.version ? "AVAILABLE" : "MISSING";

const note =
  "A browser pane or screenshot tool inside your AI tool also counts for visual QA. If neither Playwright, Chrome, nor a browser tool is available, report visual checks as NOT RUN.";

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ platform: process.platform, tools, note }, null, 2));
} else {
  for (const t of tools) console.log(`${t.status.padEnd(9)} ${t.tool.padEnd(20)} ${t.version || "-"}   (${t.purpose})`);
  console.log("\n" + note);
}
