# WEBCraft — AI Website Design & Engineering Agent

WEBCraft turns an ordinary-language brief into an original, art-directed, conversion-focused, responsive, fully implemented website.

> "Build a luxury website for a water closet brand."

That is enough. The agent works out the creative direction, design system, typography, imagery, copy, motion, and implementation itself, then builds the site, looks at the rendered result, and refines it.

It is not a template library. It is a workflow that puts these roles into one agent: creative director, art director, design-systems engineer, typographer, asset researcher, conversion copywriter, UX architect, motion designer, frontend engineer, accessibility specialist, and QA engineer.

## What makes it different

- **Original identity per project.** A bathroom brand should not look like a SaaS dashboard.
- **Hard guardrails against generic "AI website" aesthetics.** No default purple gradients, frosted-glass pill buttons, fake stats, decorative numbering, or card-grid sameness.
- **Honest by design.** It never invents testimonials, awards, prices, or licences, and it says which checks it actually ran.
- **13-phase workflow.** Brief, direction, design system, typography, assets, copy, UX, spec, immersive design, motion, build, responsive, visual QA.
- **Accessibility and performance built in.** Reduced-motion support, keyboard navigation, contrast checks, and lazy-loaded media.

## Install (Claude Code)

**Per project:** copy `.claude/agents/webcraft.md` into your project's `.claude/agents/` folder.

**For every project (user level):**

```powershell
# Windows (PowerShell)
New-Item -ItemType Directory -Force "$HOME\.claude\agents" | Out-Null
Copy-Item .claude\agents\webcraft.md "$HOME\.claude\agents\webcraft.md"
```

```bash
# macOS / Linux
mkdir -p ~/.claude/agents && cp .claude/agents/webcraft.md ~/.claude/agents/webcraft.md
```

## Use

Ask Claude Code for a website and the agent is picked up automatically, or call it by name:

```
Use the webcraft agent to build a website for a specialty coffee roaster in Nairobi.
```

## Use with other AI tools

`agent/WEBCRAFT_MASTER_PROMPT.md` is the tool-agnostic master prompt. Paste it as a system prompt, project instruction, or rules file in any agentic coding tool.

## Repository layout

| Path | Purpose |
|---|---|
| `agent/WEBCRAFT_MASTER_PROMPT.md` | **Source of truth.** The full master prompt. |
| `.claude/agents/webcraft.md` | Claude Code subagent, generated from the master prompt. |
| `references/sample-prompts/` | Sample website prompts that set the quality and specificity benchmark. |
| `scripts/build-agent.mjs` | Regenerates the subagent file from the master prompt. |

## Sample prompts

Files in `references/sample-prompts/` show the level of detail expected of a brief and a build. The agent reads them for craft and specificity. It never copies their layouts, copy, palettes, or assets. See [CONTRIBUTING.md](CONTRIBUTING.md) to add one.

## Contributing

Contributions are welcome: prompt improvements, new guardrails, and sample prompts. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

[MIT](LICENSE)
