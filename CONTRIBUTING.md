# Contributing

## Changing the agent

1. Edit `agent/WEBCRAFT_MASTER_PROMPT.md`. It is the single source of truth.
2. Regenerate the Claude Code subagent file:
   ```
   node scripts/build-agent.mjs
   ```
3. Commit both files. Never hand-edit `.claude/agents/webcraft.md`, because the next build overwrites it.

## Adding a sample prompt

Add a Markdown file to `references/sample-prompts/` named `<industry>-<style>.md`, for example `hospitality-editorial.md`.

A good sample:

- Specifies sections, typography, spacing, assets, and motion precisely.
- Is original work or work you have the right to share. Do not submit proprietary prompts, templates, or assets you do not own.
- Contains no secrets, personal data, or client confidential information.
- Shows craft, not a layout to be cloned.

## Guidelines

- Keep the guardrails in Section 3 of the master prompt intact unless you are making them stricter or clearer.
- Keep changes focused. One idea per pull request.
