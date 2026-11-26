# Spell UI component catalog

Spell UI (https://spell.sh, source https://github.com/xxtomm/spell-ui, MIT) is a shadcn-style library of animated React + Tailwind CSS components. WEBCraft uses it as the **component reference when the chosen stack is React** (Section 12.8 of the master prompt).

## Install a component (the recommended way)

In a React + Tailwind project that uses shadcn (it has a `components.json`), add the Spell registry once:

```json
"registries": { "@spell": "https://spell.sh/r/{name}.json" }
```

then add components by name, which also installs their dependencies:

```
npx shadcn@latest add @spell/blur-reveal
```

No `components.json` yet? Run `npx shadcn@latest init` first. Components import a `cn` helper from `@/lib/utils`, which shadcn creates.

The `source/` folder next to this file holds a read-only copy of each component (upstream commit `a6441b7`) so you can read how it works. Install through the CLI to get the current version and its dependencies; do not paste stale copies.

## Rules

- WEBCraft's guardrails win: no purple or blue-purple gradients, no eyebrow labels, no decorative numbering, no small-print clutter, no fake social proof (Sections 3 and 3.4).
- Pick **one** text-animation style per page. Respect `prefers-reduced-motion` (Motion's `useReducedMotion`, or CSS).
- Every component you add needs a reason. Fewer, stronger components beat many effects.

## Components

| Component | What it is | Good for / care | Dependencies | Install |
|---|---|---|---|---|
| `chart` | Interactive line chart with a cursor-tracked tooltip card, snap-to-point hover, and built-in X-axis labels. | Data and dashboards | none | `npx shadcn@latest add @spell/chart` |
| `blur-reveal` | Animated text reveal with blur effect. | Hero headline reveal (pick one headline treatment per page) | motion | `npx shadcn@latest add @spell/blur-reveal` |
| `perspective-book` | A 3D book component with hover animation and customizable appearance. | **Care:** For books, publishing, and reading products. | none | `npx shadcn@latest add @spell/perspective-book` |
| `badge` | A badge component with multiple color variants and sizes. | **Care:** Avoid decorative badges and labels (Sections 3.2 and 3.4). Only for real status such as 'Sold out'. | @radix-ui/react-slot, class-variance-authority | `npx shadcn@latest add @spell/badge` |
| `color-selector` | Interactive color picker component. | Product configurators | none | `npx shadcn@latest add @spell/color-selector` |
| `special-text` | Animated text with scramble effect. | **Care:** Scramble effects suit tech brands; use sparingly. | none | `npx shadcn@latest add @spell/special-text` |
| `shimmer-text` | Text with animated shimmer highlight effect. | **Care:** Shimmer on headlines reads as generic AI styling. Use at most once, never on the H1. | motion | `npx shadcn@latest add @spell/shimmer-text` |
| `highlighted-text` | Text with sliding background highlight animation using mix-blend-mode. | **Care:** Use for one key phrase only. | motion | `npx shadcn@latest add @spell/highlighted-text` |
| `rich-button` | A button component with rich styling and color variants. | Primary and secondary actions | @radix-ui/react-slot | `npx shadcn@latest add @spell/rich-button` |
| `kbd` | Display keyboard shortcuts with proper key symbols. | Docs and developer tools | react-hotkeys-hook | `npx shadcn@latest add @spell/kbd` |
| `label-input` | Input field with floating label and password visibility toggle. | Forms with clear floating labels | lucide-react | `npx shadcn@latest add @spell/label-input` |
| `spinner` | A loading spinner component with customizable size and color. | Loading states | none | `npx shadcn@latest add @spell/spinner` |
| `bars-spinner` | A loading spinner with rotating bars animation. | Loading states | none | `npx shadcn@latest add @spell/bars-spinner` |
| `flow-button` | A button with animated flowing dashed border on hover. | Secondary actions with a subtle hover | none | `npx shadcn@latest add @spell/flow-button` |
| `slide-up-text` | Text animation that slides up from bottom with stagger effect. | Short headline reveals | motion | `npx shadcn@latest add @spell/slide-up-text` |
| `copy-button` | A copy-to-clipboard button with blur transition effect. | Code, coupons, links | lucide-react | `npx shadcn@latest add @spell/copy-button` |
| `text-marquee` | Animated text marquee component with vertical scrolling. | **Care:** Only when the moving text carries real content. | none | `npx shadcn@latest add @spell/text-marquee` |
| `words-stagger` | Word-by-word text animation with blur, transform, and opacity effects. | Hero or section headline reveal | motion | `npx shadcn@latest add @spell/words-stagger` |
| `tilt-card` | Interactive 3D tilt card with perspective hover effect and spotlight. | Feature or product cards with real content | none | `npx shadcn@latest add @spell/tilt-card` |
| `marquee` | Infinite scrolling marquee component with customizable speed and direction. | **Care:** Only with real content; pause on hover and respect reduced motion. | motion | `npx shadcn@latest add @spell/marquee` |
| `signature` | Animated signature component with handwriting effect using custom fonts. | **Care:** Good for personal brands and founders' letters. | motion, opentype.js, @types/opentype.js | `npx shadcn@latest add @spell/signature` |
| `randomized-text` | Text component with randomized character reveal animation. | **Care:** Use sparingly, one place per page. | motion | `npx shadcn@latest add @spell/randomized-text` |
| `pop-button` | A playful 3D-style button with push-down animation effect. | **Care:** Playful brands only. | none | `npx shadcn@latest add @spell/pop-button` |
| `tweet` | Embed Twitter/X posts with custom styling. | **Care:** Only real posts the user wants to show. Never fabricate social proof. | react-tweet, @icons-pack/react-simple-icons | `npx shadcn@latest add @spell/tweet` |
| `spotify-card` | Display Spotify tracks with album art and blurred background. | **Care:** Only for real music content. | @icons-pack/react-simple-icons, spotify-url-info | `npx shadcn@latest add @spell/spotify-card` |
| `light-rays` | Animated light rays effect using WebGL shaders. | **Care:** WebGL (three.js), heavy. Only when it is the concept; provide a reduced-motion and mobile fallback. | three | `npx shadcn@latest add @spell/light-rays` |
| `animated-gradient` | Animated gradient background with presets and customizable swirl effects using WebGL. | **Care:** Gradient backgrounds are banned as the main visual. Only as a subtle accent, never purple or blue-purple. | none | `npx shadcn@latest add @spell/animated-gradient` |
| `animated-checkbox` | Animated checkbox with spring transitions and strike-through text effect. | Task lists and forms | motion | `npx shadcn@latest add @spell/animated-checkbox` |
| `exploding-input` | Input component that spawns particle effects when typing. | **Care:** Gimmicky for most sites. Only for playful brands. | none | `npx shadcn@latest add @spell/exploding-input` |
| `gradient-wave-text` | Apple-style animated gradient text with wave effect. | **Care:** Gradient text is rarely right. Never purple or blue-purple; prefer plain type. | none | `npx shadcn@latest add @spell/gradient-wave-text` |
| `logos-carousel` | Animated carousel component that cycles through sets of logos with staggered animations. | **Care:** Only with real client or partner logos the user supplied and may show. Never invent logos. | none | `npx shadcn@latest add @spell/logos-carousel` |
| `qr-code` | QR code generator with rounded finder patterns and dot-style data modules. | Event tickets, app download, payments pages | qrcode | `npx shadcn@latest add @spell/qr-code` |
| `fallback-avatar` | A unique gradient avatar generated from a name string. | **Care:** For users without a photo; never as fake testimonial faces. | none | `npx shadcn@latest add @spell/fallback-avatar` |

Licence: MIT, copyright (c) 2025 Spell UI. The full text is in `LICENSE` next to this file.
