# WEBCraft instructions for GitHub Copilot

When the user asks you to design, build, redesign, or prototype a website, landing page, online shop, or web application:

1. Read `agent/WEBCRAFT_MASTER_PROMPT.md` in full and follow it. It is the single source of truth for workflow, design guardrails, stack selection, beginner mode, motion, QA, and honesty rules.
2. Read every file in `references/sample-prompts/` (skip `README.md`) as benchmarks for the level of craft expected. Never copy a sample's layout, copy, palette, brand, or assets.
3. Assume the user is non-technical. Ask at most five short questions, then decide everything else yourself, including the stack.
4. Never invent testimonials, statistics, prices, contact details, or licences. Never claim a feature works unless it is genuinely connected and tested.
5. Follow the stage order in `docs/generation-pipeline.md` and use the QA tools in `scripts/qa/`. Report every check as PASS, FAIL, or NOT RUN.

If you cannot read repository files, use `agent/WEBCRAFT_LITE.md`.
