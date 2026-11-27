import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyPartials, writeSeoFiles, checkFinishing } from "../scripts/site/build.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const starter = join(root, "examples", "multi-page-starter");
const scratch = () => mkdtempSync(join(tmpdir(), "webcraft-site-"));

test("partials are filled into every page with the right root path and active menu item", () => {
  const d = scratch();
  try {
    cpSync(starter, d, { recursive: true });
    writeFileSync(join(d, "_partials", "header.html"), '<nav><a href="{{root}}about/" data-nav="about/">About</a><a href="{{root}}./" data-nav="">Home</a></nav>');
    const r = applyPartials(d);
    assert.equal(r.updated, 2);
    const about = readFileSync(join(d, "about", "index.html"), "utf8");
    assert.match(about, /href="\.\.\/about\/" data-nav="about\/" aria-current="page"/);
    assert.doesNotMatch(about, /data-nav="" aria-current/);
    const home = readFileSync(join(d, "index.html"), "utf8");
    assert.match(home, /href="\.\/" data-nav="" aria-current="page"/);
    assert.equal(applyPartials(d).updated, 0, "a second build changes nothing");
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test("sitemap and robots are written, and missing finishing files are reported", () => {
  const d = scratch();
  try {
    mkdirSync(join(d, "about"));
    writeFileSync(join(d, "index.html"), "<title>Home</title>");
    writeFileSync(join(d, "about", "index.html"), "<title>About</title>");
    writeFileSync(join(d, "404.html"), "<title>Lost</title>");
    const s = writeSeoFiles(d, "https://www.example.org/");
    assert.deepEqual(s.written, ["sitemap.xml", "robots.txt"]);
    const sitemap = readFileSync(join(d, "sitemap.xml"), "utf8");
    assert.match(sitemap, /<loc>https:\/\/www\.example\.org\/<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/www\.example\.org\/about\/<\/loc>/);
    assert.doesNotMatch(sitemap, /404/);
    assert.match(readFileSync(join(d, "robots.txt"), "utf8"), /Sitemap: https:\/\/www\.example\.org\/sitemap\.xml/);
    const missing = checkFinishing(d).join("\n");
    assert.match(missing, /favicon/);
    assert.match(missing, /manifest/);
    assert.match(missing, /og:image/);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test("check-links skips _partials templates and the starter's links resolve", async () => {
  const { checkSite } = await import("../scripts/qa/check-links.mjs");
  assert.deepEqual(checkSite(starter).errors, []);
});

test("motion kit never lets slide-ins widen the page", () => {
  const css = readFileSync(join(starter, "motion.css"), "utf8");
  assert.match(css, /\.motion-on body \{ overflow-x: clip; \}/);
});

test("the starter passes its own finishing check", () => {
  assert.deepEqual(checkFinishing(starter), []);
  for (const f of ["motion.js", "motion.css", "favicon.svg", "site.webmanifest", "_partials/header.html", "_partials/footer.html"]) assert.ok(existsSync(join(starter, f)), f);
});

test("motion kit keeps content visible for reduced motion and without JavaScript", () => {
  const css = readFileSync(join(starter, "motion.css"), "utf8");
  assert.match(css, /\.motion-on \[data-animate\] \{\s*opacity: 0/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  const js = readFileSync(join(starter, "motion.js"), "utf8");
  assert.match(js, /prefers-reduced-motion: reduce/);
  assert.match(js, /motion-off/);
});

test("media tool writes responsive sizes and WebP copies", (t) => {
  const py = process.platform === "win32" ? "python" : "python3";
  const d = scratch();
  try {
    const mk = spawnSync(py, ["-c", `from PIL import Image; Image.new("RGB", (1200, 800), (40, 90, 60)).save(r"${join(d, "photo.jpg")}")`]);
    if (mk.error || mk.status !== 0) return t.skip("python with Pillow not available");
    const r = spawnSync(py, ["-B", join(root, "scripts", "media", "webcraft_media.py"), "variants", d], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    for (const f of ["photo-480.jpg", "photo-480.webp", "photo-960.jpg", "photo-960.webp", "photo.webp"]) assert.ok(existsSync(join(d, f)), f);
    assert.ok(!existsSync(join(d, "photo-1600.jpg")), "no upscaling beyond the original width");
  } finally { rmSync(d, { recursive: true, force: true }); }
});
