# Install and use WEBCraft in your AI tool

WEBCraft is plain text instructions plus a folder of benchmark prompts. Any capable AI tool can use it. Pick your tool below.

You do not need to know anything about web development. After setup, just say what you want, for example:

> I want a website for my bakery in Accra.

## Which route should I use?

| Your tool | Best route |
|---|---|
| Claude Code, Claude desktop (Code tab) | [Route A](#route-a-claude-code) |
| OpenAI Codex, Cursor, Windsurf, GitHub Copilot, Gemini CLI | [Route B](#route-b-tools-that-read-repository-files) |
| ChatGPT, Gemini app, Claude.ai chat, or any chat window | [Route C](#route-c-chat-only-tools-no-file-access) |

## Route A: Claude Code

1. Clone this repository (or download it as a ZIP and unzip it).
2. Open the folder in Claude Code. `CLAUDE.md` loads the full master prompt automatically.
3. Optional, to make the agent available in **every** project, copy `.claude/agents/webcraft.md` into `~/.claude/agents/`:

   ```powershell
   New-Item -ItemType Directory -Force "$HOME\.claude\agents" | Out-Null
   Copy-Item .claude\agents\webcraft.md "$HOME\.claude\agents\webcraft.md"
   ```

   ```bash
   mkdir -p ~/.claude/agents && cp .claude/agents/webcraft.md ~/.claude/agents/webcraft.md
   ```

4. Ask for a website. Or say: "Use the webcraft agent to build a website for …".

The user-level copy has the master prompt but cannot read the sample prompts unless you work inside this repository or a project that contains `references/sample-prompts/`.

## Route B: Tools that read repository files

Works with Codex, Cursor, Windsurf, GitHub Copilot, Gemini CLI, and others.

1. Clone this repository and open it as your workspace. These files are picked up automatically:

   | File | Read by |
   |---|---|
   | `AGENTS.md` | Codex, Cursor, Windsurf, Copilot, and other `AGENTS.md`-aware agents |
   | `.cursor/rules/webcraft.mdc` | Cursor |
   | `.github/copilot-instructions.md` | GitHub Copilot |
   | `GEMINI.md` | Gemini CLI |

2. Ask for a website. The tool reads `agent/WEBCRAFT_MASTER_PROMPT.md` and the sample prompts, then builds.

To use WEBCraft inside an **existing** project instead, copy the `agent/` and `references/` folders plus the instruction file for your tool into that project's root. Copy `scripts/qa/` and `docs/` too if you want the QA tools and the pipeline documents available there.

## Route C: Chat-only tools (no file access)

Works with ChatGPT, Gemini, Claude.ai, and similar.

**ChatGPT, custom GPT (recommended):**
1. Create a new GPT.
2. Paste the contents of `agent/WEBCRAFT_LITE.md` into **Instructions**. It is under the 8,000-character limit.
3. Under **Knowledge**, upload `agent/WEBCRAFT_MASTER_PROMPT.md` and the files in `references/sample-prompts/`.
4. Save, then describe the website you want.

**ChatGPT Projects, Claude Projects, Gemini Gems:** paste `agent/WEBCRAFT_LITE.md` into the project or Gem instructions, and add the master prompt and samples as project files where supported.

**Any other chat:** paste `agent/WEBCRAFT_LITE.md` as your first message, then describe your website.

In chat-only mode the AI produces complete files for you to save (for example `index.html`) and tells you how to open them. It chooses a simple single-file site, because that is the only kind you can run without installing tools.

## Optional: unlock MotionSites' example designs and media

The craft library (taste rules, effect recipes, review checklist) is already bundled. MotionSites' *example designs* and *media shelf* cannot be redistributed, so download them directly from the source once (needs Node 18+ and git):

```
node scripts/setup-motionsites.mjs
```

See [MOTIONSITES_SKILL.md](MOTIONSITES_SKILL.md) for details.

## Optional: the media tool and the immersive example

For real photographs and video, the agent uses `scripts/media/webcraft_media.py`. It needs Python 3.9+, [ffmpeg](https://ffmpeg.org) on your PATH, and Pillow (`pip install pillow`). To see finished sites built with this repository, open the [showcase](../showcase/):

```
python -m http.server 8000      # from the repository root, then visit http://localhost:8000/showcase/
```

Details: [examples/cosmos-journey/README.md](../examples/cosmos-journey/README.md) and [docs/recipes/scroll-journey.md](recipes/scroll-journey.md).

## What happens next

1. The AI may ask up to five short questions. Answer briefly or say "you decide".
2. It chooses the design and the technology for you, and tells you in plain words what it chose and why.
3. It builds the site, checks it, and tells you how to open it, edit it, and put it online.
4. It lists anything it could not do for you (a domain, payments, real photos, your phone number) and what it needs from you.

## Notes

- WEBCraft never invents testimonials, prices, awards, or contact details. Expect clearly marked slots for you to fill.
- Complex requests (online shops, logins, bookings) need a backend or a commerce platform. The AI will say which and explain the setup.
- Results depend on the AI tool's capabilities. Tools that can run a browser and take screenshots can check their own work. Chat-only tools cannot, and will say so.
