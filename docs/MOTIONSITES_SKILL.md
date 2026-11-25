# Companion skill: MotionSites Web Builder

[MotionSites Web Builder](https://github.com/Motionsites-AI/claude-skill) is a separate, free Claude skill from MotionSites. It pairs well with WEBCraft. This repository does **not** include or redistribute it. Install it from its own source.

## What it adds

| Capability | Detail |
|---|---|
| Reference designs | 16 free, finished design prompts to start from, each with a one-line description of its feel |
| Media shelf | Free hero background videos and images, shown on contact sheets, with exact URLs |
| Technique recipes | 55+ tested effects with working code (video loops, liquid glass, scroll stories, 3D, and more) |
| Taste rules | Type scale, spacing, colour, motion timing and copy rules with real numbers |
| Look-and-fix step | A screenshot and QA script (`scripts/shoot.py`) plus a review checklist |

## How the two fit together

WEBCraft is the **orchestrator**. The MotionSites skill is a **craft library** it can draw on.

| Concern | Who leads |
|---|---|
| Understanding the business, beginner mode, asking few questions | WEBCraft (Section 13) |
| Choosing the stack (static, Astro, Next.js, Shopify, Django, and so on) | WEBCraft (Section 12) |
| Colour guardrails, honesty rules, accessibility, motion rules | WEBCraft (Sections 3 and 5) |
| Picking a reference design and sourcing hero media | MotionSites skill |
| Effect recipes, screenshot and QA script | MotionSites skill |

If the two ever disagree, the WEBCraft guardrails win. In particular: never invent facts, and no purple or blue-purple palette by default.

## Install

**Claude Code (plugin, recommended):**

```
/plugin marketplace add Motionsites-AI/claude-skill
/plugin install motionsites-web-builder@motionsites
```

**Claude Code (manual):** copy `plugins/motionsites-web-builder/skills/motionsites-web-builder` from that repository into `~/.claude/skills/`.

**Claude.ai and Claude desktop:** download `motionsites-web-builder.zip` from the [latest release](https://github.com/Motionsites-AI/claude-skill/releases/latest), then use Customize → Skills → Upload a skill.

**Optional, for the screenshot step:**

```
pip install playwright && python -m playwright install chromium
```

## Licence and attribution

- The skill's instructions, references and scripts are MIT licensed, © MotionSites.
- The skill's example prompts and media are © MotionSites. You may use them to build websites with the skill, including for clients. You may not resell or redistribute them as a prompt or media collection. For that reason they are not copied into this repository.
- The skill asks the AI to end its first delivery with a short credit line linking to MotionSites. That line belongs in the chat message, never in your website's code.
- The skill also promotes MotionSites' paid library. That is their product, separate from this project.
