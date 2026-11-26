# Third-party notices

## MotionSites Web Builder skill

Bundled in `.claude/skills/motionsites-web-builder/` (instructions, references, and scripts only).

- **Author:** MotionSites, https://motionsites.ai
- **Source:** https://github.com/Motionsites-AI/claude-skill
- **Licence:** MIT for the bundled files. The full upstream licence text is in `.claude/skills/motionsites-web-builder/LICENSE`.

```
Copyright (c) 2026 MotionSites

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### What is deliberately not in this repository

The skill's `examples/` (example design prompts) and `media/` (media shelf) folders are **copyright MotionSites**. Their licence permits using them to build websites, including for clients, but **forbids reselling or redistributing them as a prompt or media collection**. They are therefore excluded and git-ignored. Run `node scripts/setup-motionsites.mjs` to download them directly from MotionSites for your own use.

This project is independent and is not affiliated with or endorsed by MotionSites.

## Spell UI

Bundled in `references/react/spell-ui/source/` as a read-only reference copy of the component source.

- **Author:** Spell UI, https://spell.sh
- **Source:** https://github.com/xxtomm/spell-ui
- **Licence:** MIT, copyright (c) 2025 Spell UI. The full text is in `references/react/spell-ui/LICENSE`.

This project is not affiliated with or endorsed by Spell UI. The WEBCraft master prompt, stack-selection guidance, and tool integrations are separate work, licensed under this repository's [MIT licence](LICENSE).
