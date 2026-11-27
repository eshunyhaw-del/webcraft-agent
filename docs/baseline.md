# Baseline (task A-03)

What was actually run against the repository at commit `ac9be3c` on 2026-11-27, and what was not. Every result below comes from a command or browser check that ran in this session. Anything not executed is marked **NOT RUN** with the reason.

## Environment

Windows 11, Git Bash and PowerShell, Claude Code desktop app with its built-in browser pane.

| Tool | Found | Version |
|---|---|---|
| git | yes | 2.56.1 |
| Node / npm | yes | 26.13.1 / 11.20.0 |
| Python (`python`) | yes | 3.12.10 (`python3` is not on PATH; `py` is 3.15.2) |
| ffmpeg / ffprobe | yes | 9.1 |
| Pillow | yes | 13.0.0 |
| Playwright (Python or npm) | **no** | — |
| Browser for visual checks | yes | Claude desktop built-in browser (Chromium) |

## Installation

| Workflow | Result | Evidence |
|---|---|---|
| Route A: clone and open in Claude Code | PASS | `git clone` succeeded; `CLAUDE.md` loaded the master prompt in this session |
| Route A optional: copy agent to `~/.claude/agents/` | NOT RUN | Changes the user's global configuration; not needed for the audit |
| Route B: Codex, Cursor, Windsurf, Copilot, Gemini CLI | NOT RUN | Those tools are not available in this environment |
| Route C: paste Lite prompt into a chat tool | NOT RUN | No chat tool available; Lite length verified instead (below) |
| `node scripts/setup-motionsites.mjs` | NOT RUN | Downloads copyright MotionSites content into the working tree; an owner decision, not needed for the audit |

## Repository scripts

| Check | Command | Result |
|---|---|---|
| Generated agent file is in sync | `node scripts/build-agent.mjs` then `git status` | PASS: no diff, so `.claude/agents/webcraft.md` matches the master prompt |
| Lite prompt fits ChatGPT box | character count of `agent/WEBCRAFT_LITE.md` | PASS: 6,298 (limit 8,000) |
| `CLAUDE.md` and `GEMINI.md` identical | `cmp` | PASS: byte-identical |
| JavaScript syntax | `node --check` on all example, showcase and script `.js`/`.mjs` | PASS: 6 files |
| Python syntax | `py_compile` on `webcraft_media.py`, `shoot.py` | PASS |
| Relative Markdown links | Node script over every `.md` file | PASS: 22 links, 0 broken |
| Local asset references in examples/showcase | Node script over `src`/`href`/`poster`/`url()` | PASS: all resolve (3 reported misses were SVG `#fragment` and `%23` data-URI references, not files) |
| Media tool help | `python scripts/media/webcraft_media.py --help` | PASS |
| Media `search` (Commons) | `search "coral reef" --source commons --type image --n 2` | PASS: 2 results with licence and creator |
| Media `search` (NASA) | `search "saturn" --source nasa --type image --n 2` | PASS: 2 results |
| Media `scan` | `scan examples/cosmos-journey/assets/video/earth.mp4 --sheet <temp>` | PASS: 13.4 s, brightness per block, sheet written (to a temp folder) |
| Media `scan`, missing file | `scan nope.mp4` | PASS: "File not found", exit 1 |
| Media `cut` with boomerang | `cut earth.mp4 <temp>/wc_cut.mp4 --start 1 --dur 3 --boomerang` | PASS: 6.0 s loop, 0.6 MB |
| Media `build` from a plan | — | NOT RUN: downloads about 135 MB of source video |
| `shoot.py` screenshots | `python .../shoot.py examples/cosmos-journey/index.html <temp>` | **FAIL (tool unavailable)**: "No Playwright and no Chrome found". The script detected this and said so, as designed |
| Automated test suite / CI | — | NOT RUN: none exists in the repository |

Side effect noticed: running the Python tools creates `__pycache__/` folders that `.gitignore` does not cover. They were deleted after the checks.

## Browser smoke test of shipped sites

Served with `python -m http.server` from the repository root and opened at `http://localhost:8765` in the built-in browser. Checks were measured with JavaScript in the page, not judged by eye: horizontal overflow, broken images, video errors, `h1` count, `href="#"` count, console errors.

| Site | Viewport | Overflow | Broken images | Video errors | Console errors | `h1` | `href="#"` |
|---|---|---|---|---|---|---|---|
| `examples/scroll-journey-starter/` | 1440×900 | no | 0 | none (no video) | 0 | **0** | 0 |
| `examples/scroll-journey-starter/` | 390×844 | no | — | — | 0 | — | — |
| `examples/cosmos-journey/` | 1440×900 | no | 0 | 0 of 4 | 0 | 1 | 0 |
| `showcase/fathom-ocean/` | 1440×900 | no | 0 | 0 of 5 | 0 | 1 | 0 |
| `showcase/farfield-first-build/` | 1440×900 | no | 0 | 0 of 1 (remote CDN, loaded) | 0 | 1 | 0 |

Scroll-journey fit check, `scripts/qa/beat-fit.js` run in the page on `examples/cosmos-journey/` at 360×640: **13 of 13 beats OK**, no horizontal overflow.

Observations:

- The starter has no `h1`: every chapter heading is an `h2`. It is a starter, but a site built by copying it would inherit a missing top-level heading.
- The starter's reduced-motion fallback is applied by JavaScript (`matchMedia` adds `html.calm`), not by a CSS media query. That works when JavaScript runs; the no-JS path is the separate stacked layout the starter already documents.
- First screenshot of `farfield-first-build` caught the hero mid-entrance (heading not yet visible). A second capture three seconds later showed it fully rendered. This matches the master prompt's own warning in §11.2 to take a second capture before judging.
- `farfield-first-build` depends on a third-party CDN video; it will break if that URL is withdrawn.

## Not covered

| Item | Status | Reason |
|---|---|---|
| End-to-end generation from a brief (brief → built site) | NOT RUN | Requires a full agent build session; out of scope for A-03. Showcase records earlier runs, which were not re-verified |
| Generated project structure | NOT RUN | Same reason |
| Tablet (768) and wide (1920) viewports | NOT RUN | Not in any current repo QA set; to be decided in H3 |
| Accessibility audit (axe or screen reader) | NOT RUN | No tool in the repository; not available here |
| Performance audit (Lighthouse) | NOT RUN | No tool in the repository |
| Safari, Firefox, real phones | NOT RUN | Not available |
| Fathom at phone sizes, beat-fit on Fathom | NOT RUN | Time-boxed; cosmos-journey covered the scroll-journey pattern |

## QA claims in the repository versus evidence found

| Claim | Where | Matches evidence? |
|---|---|---|
| Examples run as they are | `examples/cosmos-journey/README.md` | Yes: loaded, no errors, videos ready |
| Tested at 1366×700 and phone sizes; not on Safari/Firefox/real phones | `showcase/README.md` | Consistent: phone-size fit verified for cosmos-journey here; the not-tested list is honest |
| `shoot.py` produces screenshots and a QA report | skill `SKILL.md`, MP §11.1 | Only with Playwright or Chrome installed; MP §11.1 already says to use another browser tool when it is missing |
| Agent file is generated, never hand-edited | `CONTRIBUTING.md` | Yes: regenerating produced no diff |
