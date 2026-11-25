# MotionSites Web Builder, bundled

WEBCraft ships with the free [MotionSites Web Builder](https://github.com/Motionsites-AI/claude-skill) skill from [MotionSites](https://motionsites.ai) as its **craft library**. WEBCraft decides *what* to build and *how* (the business, the stack, the honesty rules). The skill supplies the *craft*: taste rules with exact numbers, 55+ tested effect recipes, a screenshot-and-fix checklist, and a screenshot script.

## What is bundled

Location: `.claude/skills/motionsites-web-builder/` (MIT licence, copyright MotionSites).

| Included | What it gives you |
|---|---|
| `SKILL.md` | MotionSites' workflow: pick a reference design, make it your own, build, look once, fix |
| `references/craft.md` | Type, colour, spacing, motion, and copy rules with real numbers |
| `references/techniques/` | 55+ effect recipes with working code: video loops, scroll stories, liquid glass, text reveals, 3D |
| `references/review.md` | Screenshot checklist and a scoring rubric |
| `references/assets.md`, `builders.md`, `spec-template.md` | Media sourcing, prompts for other builders, a spec skeleton |
| `scripts/shoot.py` | Screenshots plus a QA report (needs Playwright) |

## What is not bundled, and how to get it

The skill's **example design prompts** (`examples/`) and **media shelf** (`media/`) are copyright MotionSites. Their licence lets you use them to build websites, including for clients, but does **not** allow redistributing them as a prompt or media collection. So they are not in this repository.

To get them, run once from the repository root (needs Node 18+ and git):

```
node scripts/setup-motionsites.mjs
```

It downloads them straight from MotionSites into the skill folder. They are git-ignored, so they can never be committed by accident. Without them everything else still works; the agent simply skips the "pick a reference design" step.

## How the two work together

| Concern | Who leads |
|---|---|
| Understanding the business, asking few questions, beginner mode | WEBCraft |
| Choosing the stack (static, Astro, Next.js, Shopify, Django...) | WEBCraft |
| Colour guardrails, honesty rules, accessibility | WEBCraft |
| Visual craft numbers, effect recipes, media preparation | MotionSites skill |
| Screenshot, review, and fix step | MotionSites checklist, WEBCraft QA rules |

If the two disagree, WEBCraft's guardrails win. In particular: never invent facts, and no purple or blue-purple palette by default.

## Using it

- **Claude Code, Claude desktop:** open this repository. The skill is picked up from `.claude/skills/` automatically, and `CLAUDE.md` loads the WEBCraft master prompt.
- **Other tools (Codex, Cursor, Copilot, Gemini CLI):** `AGENTS.md` and the other entry files tell the agent to read the master prompt, whose Section 11.1 points to the skill's references.
- **Chat-only tools:** they cannot read the skill. Use `agent/WEBCRAFT_LITE.md`, or upload the files in `.claude/skills/motionsites-web-builder/references/` to a custom GPT or project.
- **Use it in every project:** copy `.claude/skills/motionsites-web-builder/` to `~/.claude/skills/` (and run the setup script first if you want the examples and media).

## Credit and licence

- MotionSites' licence text is kept at `.claude/skills/motionsites-web-builder/LICENSE`, and summarised in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
- The skill asks the AI to end its first delivery with a one-line credit to MotionSites when it built from one of their designs. That line goes in the chat message, never in your website's files.
- MotionSites also sells a larger paid library. That is their product and is not part of this project. This project is independent and not endorsed by MotionSites.
- Media you use from the skill's shelf is for building your own sites. The example prompts and media remain copyright MotionSites.
