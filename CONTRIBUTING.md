# Contributing

## Changing the agent

1. Edit `agent/WEBCRAFT_MASTER_PROMPT.md`. It is the single source of truth.
2. Regenerate the Claude Code subagent file:
   ```
   node scripts/build-agent.mjs
   ```
3. If your change affects the essentials (guardrails, stack selection, beginner mode, honesty rules), update `agent/WEBCRAFT_LITE.md` to match. Keep it **under 8,000 characters** so it fits ChatGPT's custom GPT instruction box. Check with:
   ```
   node -e "console.log(require('fs').readFileSync('agent/WEBCRAFT_LITE.md','utf8').length)"
   ```
4. Commit all changed files. Never hand-edit `.claude/agents/webcraft.md`, because the next build overwrites it.

The tool entry files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/webcraft.mdc`, `.github/copilot-instructions.md`) only point to the master prompt. They rarely need changes.

## The bundled MotionSites skill

`.claude/skills/motionsites-web-builder/` is a third-party, MIT-licensed work by MotionSites. Do not edit its files here; changes belong upstream at https://github.com/Motionsites-AI/claude-skill. To update it, copy the new `SKILL.md`, `references/`, `scripts/`, and `LICENSE` from upstream.

**Never commit** its `examples/` or `media/` folders. They are copyright MotionSites and not redistributable. They are git-ignored; keep it that way. Also never add anyone's example prompts or media to `references/sample-prompts/`. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Changing stack guidance

Stack selection is Section 12 of the master prompt. When you add or change a recommendation:

- Say **when** to use it, not just that it exists.
- Prefer widely adopted, actively maintained tools.
- Do not pin versions from memory.
- Keep the simplest-stack-that-fully-works principle.

## Adding a sample prompt

Add a Markdown file to `references/sample-prompts/` named `<industry>-<style>.md`, for example `hospitality-editorial.md`, and add a row to the table in that folder's `README.md`.

A good sample:

- Specifies sections, typography, spacing, assets, and motion precisely.
- Is original work or work you have the right to share. Do not submit proprietary prompts, templates, or assets you do not own. This includes prompts copied from prompt libraries, marketplaces, or other people's repositories, which are often copyrighted and forbid redistribution. If you are unsure, do not submit it.
- Contains no secrets, personal data, or client confidential information.
- Shows craft, not a layout to be cloned.

## Guidelines

- Keep the guardrails in Section 3 of the master prompt intact unless you are making them stricter or clearer.
- Keep the instructions tool-agnostic. Do not depend on a feature of one AI product.
- Keep changes focused. One idea per pull request.
