# Design system

Tokens are defined once (CSS custom properties, a Tailwind theme, or the stack's equivalent) and used everywhere. Do not add a colour, spacing value, radius, or component variant without a reason written here. Values below are examples of the shape only; choose project-specific values from the creative direction.

## Tokens
| Group | Token | Value | Use |
|---|---|---|---|
| Colour | `--color-page` | | Page background |
| Colour | `--color-text-primary` | | Body text |
| Colour | `--color-accent` | | One accent, used with intent |
| Type | `--font-display`, `--font-body` | | |
| Type scale | `--step-0` … `--step-5` | `clamp(...)` | |
| Spacing | `--space-1` … `--space-8`, `--space-section` | | |
| Content width | `--content-narrow`, `--content-wide` | | |
| Breakpoints | sm, md, lg, xl | | Media queries |
| Radius | `--radius-sm`, `--radius-lg` | | Not one radius on everything |
| Elevation | `--shadow-1` | | |
| Motion | `--dur-fast`, `--dur-slow`, `--ease-out` | | |
| Layers | `--z-nav`, `--z-overlay`, `--z-modal` | | |

## Contrast pairs checked
| Foreground | Background | Ratio | Passes (4.5:1 body, 3:1 large text and UI) |
|---|---|---|---|

## Components
Make a component when the pattern repeats or must stay consistent (header, footer, buttons and links, form controls, section container, media frame). Do not componentise one-off layouts. Testimonial, logo, rating and pricing components exist only when real, supplied content fills them.

| Component | Variants (and why each exists) | States designed (hover, focus, active, disabled, error) | Used on |
|---|---|---|---|

## Consistency check
Run `node scripts/qa/token-audit.mjs <src>` and record the raw colour, spacing and radius counts. Explain or remove values outside the tokens.
