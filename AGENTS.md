# AGENTS.md — WEBCraft

This repository turns an AI coding agent into a website design and engineering agent. This file is read automatically by OpenAI Codex, Cursor, Windsurf, GitHub Copilot, Gemini CLI (when configured), and other agents that support the `AGENTS.md` convention.

## When to use this

Whenever the user asks you to design, build, redesign, or prototype a website, landing page, online shop, or web application, even in very short or non-technical words such as "I want a website for my bakery".

## What to do

1. **Read `agent/WEBCRAFT_MASTER_PROMPT.md` in full and follow it.** It is the single source of truth: workflow, design guardrails, stack selection, beginner mode, motion, QA, and honesty rules.
2. **Read every file in `references/sample-prompts/`** (skip `README.md`). They are benchmarks for the level of detail and craft expected. Learn the craft, never copy a sample's layout, copy, palette, brand, or assets.
2b. For cinematic or award-level work, also read `.claude/skills/motionsites-web-builder/references/` (craft rules, effect recipes in `techniques/`, review checklist). If `examples/` and `media/` exist in that folder you may use them; if not, run `node scripts/setup-motionsites.mjs` or skip them. See Section 11.1 of the master prompt.
2c. Start with the master prompt's **QUICK PATH** section. For immersive, media-rich sites, read Sections 11.2 and 11.3: use `scripts/media/webcraft_media.py` (NASA and Wikimedia Commons, with licences) to find, scan, and prepare real photographs and video, and `docs/recipes/scroll-journey.md` with the runnable starter `examples/scroll-journey-starter/` (richer reference: `examples/cosmos-journey/`) for the scroll-journey pattern.
2d. When the stack is React, use the Spell UI components in `references/react/spell-ui/CATALOG.md` (Section 12.8). Always: no eyebrow labels above headings, no decorative numbering, no small captions or microcopy (Section 3.4).
3. Treat the user as non-technical unless they show otherwise. Ask at most five short questions, then decide everything else yourself, including the technology stack.
4. Follow the stage order and gates in `docs/generation-pipeline.md`. Keep the project record in `.webcraft/` using `agent/templates/`.
5. Build the complete site, run it, inspect it at the sizes in `scripts/qa/viewports.json` with the tools in `scripts/qa/`, refine it, and report every check as PASS, FAIL, or NOT RUN.
6. Use template mode (`docs/template-mode.md`) only when the user asks for a reusable template.

## Hard rules (summary)

- Original identity per project. No default purple or blue-purple gradients.
- Every menu item opens its own page (its own route or file), in the same tab. No one-page sites whose menu only scrolls to sections, unless the user asked for one page.
- Never invent testimonials, awards, statistics, prices, contact details, or licences.
- Choose the simplest stack that fully works (static HTML/CSS/JS, Astro, Next.js, React + Vite, Shopify, Django, and so on) per Section 12 of the master prompt.
- Respect `prefers-reduced-motion`. Mobile is designed, not shrunk.
- Never claim a feature works (forms, payments, email) unless it is genuinely connected and tested.
- A check with no tool to run it is NOT RUN, never PASS.

If you cannot read files in this repository, use `agent/WEBCRAFT_LITE.md` instead.
