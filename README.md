# WEBCraft — AI Website Design & Engineering Agent

Say what you want. Get a professionally designed, working website.

> "I want a website for my bakery in Accra."
> "Build a luxury website for a water closet brand."
> "I need an online shop for handmade candles."

WEBCraft turns a plain-language brief, from someone who may know nothing about web development, into an original, art-directed, conversion-focused, responsive website. It decides the design, the copy, the motion, **and the technology stack**, builds it, checks the result, and explains in plain words how to open, edit, and publish it.

It is not a template library. It is one agent workflow that combines creative director, art director, typographer, copywriter, UX architect, motion designer, frontend engineer, accessibility specialist, and QA engineer.

## Works with any capable AI tool

| Tool | How |
|---|---|
| Claude Code / Claude desktop | `CLAUDE.md` and a ready-made subagent in `.claude/agents/` |
| OpenAI Codex, Cursor, Windsurf, Copilot, Gemini CLI | `AGENTS.md` plus per-tool files |
| ChatGPT, Gemini, Claude.ai and other chat tools | `agent/WEBCRAFT_LITE.md`, sized for ChatGPT's 8,000-character instruction box |

Step-by-step setup for each: **[docs/INSTALL.md](docs/INSTALL.md)**.

## It picks the right stack for the job

The agent chooses the simplest technology that fully delivers what you asked for, including how animated it is. The full decision framework is Section 12 of the master prompt.

| You ask for | It typically builds with |
|---|---|
| Landing page, portfolio, brochure site, even a heavily animated scroll story | Plain HTML + CSS + JavaScript, with GSAP where needed |
| Content-rich site, blog, many pages | Astro (or Next.js), optionally with a headless CMS |
| Interactive tool, configurator, animation-heavy app | React + Vite + TypeScript + Tailwind, with Motion or GSAP |
| Online shop | Shopify by default, or Medusa, Saleor, Django, or WooCommerce depending on needs. Payments always through a proven provider |
| Logins, bookings, dashboards, member areas | Next.js + PostgreSQL, or Django, or Supabase. Angular when requested |
| Interactive 3D | Three.js or React Three Fiber, only when 3D is central |

An explicit request ("use Angular") or an existing codebase always overrides the defaults.

## What makes it different

- **Original identity per project.** A bathroom brand does not look like a SaaS dashboard.
- **Hard guardrails against generic "AI website" looks.** No default purple gradients, frosted-glass pill buttons, fake stats, decorative numbering, or card-grid sameness.
- **Honest by design.** It never invents testimonials, awards, prices, or contact details, and it says which checks it really ran.
- **Beginner mode.** At most five short questions, plain language, and clear next steps.
- **Benchmark prompts.** Engineered sample prompts in `references/sample-prompts/` calibrate the level of detail and craft. Add your own original ones.
- **Accessibility and performance built in.** Reduced-motion support, keyboard navigation, contrast checks, and lazy-loaded media.

## Repository layout

| Path | Purpose |
|---|---|
| `agent/WEBCRAFT_MASTER_PROMPT.md` | **Source of truth.** The full master prompt (workflow, guardrails, stack selection, beginner mode). |
| `agent/WEBCRAFT_LITE.md` | Condensed version for chat tools with no file access. |
| `.claude/agents/webcraft.md` | Claude Code subagent, generated from the master prompt. |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`, `.github/copilot-instructions.md` | Entry points that tell each tool to load the master prompt. |
| `references/sample-prompts/` | Benchmark prompts for craft and specificity. |
| `docs/INSTALL.md` | Setup for every supported tool. |
| `docs/MOTIONSITES_SKILL.md` | Optional companion skill (reference designs, media shelf, effect recipes). Installed from its own source, not bundled here. |
| `scripts/build-agent.mjs` | Regenerates the Claude subagent file from the master prompt. |

## Contributing

Prompt improvements, new guardrails, stack guidance, and sample prompts are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

[MIT](LICENSE)
