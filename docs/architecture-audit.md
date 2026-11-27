# Architecture audit (task A-01)

Audit of the WEBCraft repository at commit `ac9be3c`, made on 2026-11-27 before any enhancement work. It records what exists today. The capability matrix is in [capability-matrix.md](capability-matrix.md) and the measured baseline in [baseline.md](baseline.md).

## 1. What WEBCraft is, structurally

WEBCraft is an **instruction system**, not a program. Its product is one long Markdown prompt that turns an AI coding tool into a website design and engineering agent, plus supporting references, examples, and three small tools. There is no application code to build, no package manifest, no test suite, and no CI.

```
agent/WEBCRAFT_MASTER_PROMPT.md   single source of truth (~60 KB, 14 sections, 13 workflow phases)
   ├─ scripts/build-agent.mjs ──► .claude/agents/webcraft.md   (generated copy + subagent frontmatter)
   ├─ CLAUDE.md, GEMINI.md          short preamble, then @-import of the master prompt
   ├─ AGENTS.md, .cursor/rules/webcraft.mdc, .github/copilot-instructions.md
   │                                pointers that tell the tool to read the master prompt
   └─ agent/WEBCRAFT_LITE.md        hand-maintained condensed version (< 8,000 chars) for chat tools
```

## 2. Entry points by tool

| Tool | File read automatically | How it reaches the master prompt |
|---|---|---|
| Claude Code / desktop | `CLAUDE.md` | `@agent/WEBCRAFT_MASTER_PROMPT.md` import (inlined) |
| Claude Code, any project | `~/.claude/agents/webcraft.md` (user copies it) | Generated file contains the full prompt |
| Gemini CLI | `GEMINI.md` | `@` import; file is byte-identical to `CLAUDE.md` |
| Codex, Windsurf, other AGENTS.md tools | `AGENTS.md` | Instruction to read the file |
| Cursor | `.cursor/rules/webcraft.mdc` (`alwaysApply: false`, description-triggered) | Instruction to read the file |
| GitHub Copilot | `.github/copilot-instructions.md` | Instruction to read the file |
| ChatGPT, Gemini app, Claude.ai | none; user pastes `agent/WEBCRAFT_LITE.md` | Lite prompt; master prompt optionally uploaded as knowledge |

Installation contract (`docs/INSTALL.md`): Route A (Claude Code), Route B (file-reading tools), Route C (chat-only). This contract must not change without owner approval.

## 3. The master prompt, section map

| Section | Content |
|---|---|
| Quick Path | 6-step short route for small or vague briefs |
| 1–2 | Role (11 specialist hats) and quality standard |
| 3 | Design guardrails: colour (no default purple), anti-AI-aesthetic list, intention test, **3.4 owner's banned patterns** (no eyebrows, no decorative numbering, no small-print clutter) |
| 4 | 13-phase workflow: brief → creative direction → design system → typography → assets → copy → UX/IA → spec → immersive design → motion → frontend → responsive → visual QA |
| 5 | 18 implementation rules |
| 6 | When to decide vs ask |
| 7 | 9 required outputs (interpretation … QA report) |
| 8 | Final quality-gate checklist |
| 9 | Response style |
| 11 | Reference library: sample prompts, bundled MotionSites skill (11.1), real media and QA lessons (11.2), scroll-journey pattern (11.3) |
| 12 | Stack selection: precedence, classification axes, Tiers 0–4, animation table, hosting, hygiene, Spell UI (12.8) |
| 13 | Beginner mode: plain language, ≤ 5 questions, no fabrication, environment handling |
| 14 | Tool-agnostic operation: file/terminal, browser, chat-only, no-browser modes |

There is no Section 10 heading collision: "10. THE WEBCraft STANDARD" is a closing statement, while "PHASE 10" sits inside Section 4.

## 4. Supporting material

| Path | Kind | Notes |
|---|---|---|
| `references/sample-prompts/` | Craft benchmark | **One** sample (`education-video-hero-shiny-text.md`) plus README |
| `references/react/spell-ui/` | Third-party reference (MIT) | Catalog of 33 components + read-only source copies; used when stack is React |
| `.claude/skills/motionsites-web-builder/` | Third-party skill (MIT parts) | `SKILL.md`, craft rules, 55+ technique recipes, spec template, review rubric, `scripts/shoot.py`. `examples/` and `media/` are deliberately absent and git-ignored |
| `docs/recipes/scroll-journey.md` | Recipe | Architecture, numbers, mobile rules, QA for the scroll-journey pattern |
| `examples/scroll-journey-starter/` | Runnable starter | Subject-neutral engine (~80 lines JS), 3 chapters |
| `examples/cosmos-journey/` | Reference build | "Farfield"; NASA media included (~14 MB); `media-plan.json` rebuilds it |
| `showcase/fathom-ocean/` | Real build | Built by an agent from a fresh clone; Wikimedia Commons media |
| `showcase/farfield-first-build/` | Real build | Single `index.html`; hotlinks one MotionSites CDN video |
| `docs/INSTALL.md`, `docs/MOTIONSITES_SKILL.md`, `CONTRIBUTING.md`, `THIRD_PARTY_NOTICES.md` | Docs | Install routes, skill relationship, contribution and sync procedure, licences |

## 5. Scripts and integrations

| Script | Language / needs | What it does | Self-checking? |
|---|---|---|---|
| `scripts/build-agent.mjs` | Node | Regenerates `.claude/agents/webcraft.md` from the master prompt | Manual; no check that it was run |
| `scripts/setup-motionsites.mjs` | Node 18+, git, network | Clones MotionSites upstream and copies `examples/` and `media/` into the skill folder | Fails clearly if upstream layout changes |
| `scripts/media/webcraft_media.py` | Python 3.9+, ffmpeg/ffprobe, Pillow, network | `search` (NASA, Commons), `scan` (brightness + frame sheet), `cut` (trim, strip audio, boomerang, crop), `build` (plan → assets + manifest with licences) | Exits non-zero on missing file |
| `scripts/qa/beat-fit.js` | Browser console | Forces every scroll-journey beat visible and reports fit between fixed UI and horizontal overflow | Report only |
| `.claude/skills/.../scripts/shoot.py` | Python + Playwright (or Chrome) | Desktop 1440×900 and mobile 390×844 screenshots + JSON QA report (console errors, failed requests, broken images, overflow, fonts) | Detects missing Playwright and says so |

External network dependencies: NASA Image and Video Library API, Wikimedia Commons API, Google Fonts (examples), MotionSites GitHub (setup), a MotionSites CloudFront video (farfield-first-build). No API keys are required anywhere.

## 6. Licensing and third-party obligations

- Repository: MIT (`LICENSE`).
- MotionSites skill: MIT for bundled files; `examples/` and `media/` are copyright MotionSites, non-redistributable, git-ignored, fetched per user by script. The skill's credit line must stay in chat, never in user files (enforced by master prompt 11.1).
- Spell UI: MIT; licence kept in `references/react/spell-ui/LICENSE`.
- Media in examples/showcase: NASA (no endorsement implied; one ESA-credited clip) and Wikimedia Commons under per-file licences including CC BY-SA 4.0. Recorded in each `assets/manifest.json` and site footers.

## 7. Structural observations

1. **No automated tests or CI.** `.github/` holds only Copilot instructions. Nothing fails when the generated agent file, the Lite prompt, or the two identical entry files drift.
2. **Three hand-maintained copies of shared rules.** The Lite prompt, `AGENTS.md` hard-rules summary, Cursor and Copilot files each restate a subset of guardrails. Only `.claude/agents/webcraft.md` is generated. `CONTRIBUTING.md` documents the sync procedure, but it is manual.
3. **Workflow is prose, not a state machine.** Phases list deliverables, but there are no defined artifact files, completion gates, failure states, or resume points.
4. **QA viewport sets differ by file.** Phase 12 names five classes; 11.2 uses 360×640, 390×844, 1366×700; `shoot.py` uses 1440×900 and 390×844; the Lite prompt says desktop, tablet, mobile.
5. **The MotionSites skill's defaults conflict with WEBCraft** (hero-only scope, single-file output, micro-labels, credit line). The master prompt resolves each conflict explicitly in 11.1, so this is managed, not broken.
6. **Only one sample prompt** exists, so the "benchmark" library is thin. Showcase builds are the stronger evidence of output quality, but they are not set up as repeatable fixtures.
7. `.gitignore` does not ignore `__pycache__/`; running the Python tools leaves untracked folders.
