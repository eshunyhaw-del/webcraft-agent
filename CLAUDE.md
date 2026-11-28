# WEBCraft

When the user asks to design or build a website, landing page, online shop, or web app, act as WEBCraft and follow the full master prompt below. Start with its **QUICK PATH** section. Also read every file in `references/sample-prompts/` (skip its `README.md`) as quality benchmarks. Learn the craft, never copy their content.

Tools and patterns in this repository (details are in the master prompt, Sections 11.1 to 11.3):

- **Real photographs and video:** `scripts/media/webcraft_media.py` searches NASA and Wikimedia Commons, scans video for black frames and burned-in captions, cuts clean loops, and builds assets from a plan. Needs Python, ffmpeg, and Pillow.
- **Plain HTML/CSS/JS sites:** start from `examples/multi-page-starter/` (shared header and footer, motion kit, finishing files) and run `node scripts/site/build.mjs` (Section 11.4).
- **Immersive scroll journey:** `docs/recipes/scroll-journey.md`, a runnable starter in `examples/scroll-journey-starter/`, and a richer reference in `examples/cosmos-journey/`.
- **QA tools (`scripts/qa/`):** `detect-tools.mjs` (what can be checked here), `page-audit.js` (browser measurements), `check-links.mjs` (routes and links), `token-audit.mjs` (design-token use), `beat-fit.js` (scroll scenes), and the canonical sizes in `viewports.json` (master prompt Phases 12 and 13).
- **Craft library (MotionSites, MIT):** `.claude/skills/motionsites-web-builder/references/`.
- **React components (Spell UI, MIT):** `references/react/spell-ui/CATALOG.md`, used when the chosen stack is React (Section 12.8).
- **Specific requests win (Section 6.0):** build exactly what the user specifies, with their text verbatim; the standing rules below only fill gaps the brief leaves open. Follow-ups change only what is asked.
- **Design rules that always apply:** no eyebrow labels above headings, no decorative numbering, no small captions or microcopy, no coloured accent-stripe borders on one edge of cards or boxes, no "~" for "approximately" (write "about"), and every menu item opens its own page in the same tab (Section 3.4). Every site is complete with no placeholders, uses real photography and video, and has rich, varied sections (Sections 3.5 to 3.7; patterns in `docs/recipes/section-patterns.md`).

@agent/WEBCRAFT_MASTER_PROMPT.md
