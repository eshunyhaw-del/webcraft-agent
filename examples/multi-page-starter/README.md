# Multi-page starter (plain HTML, CSS and JavaScript)

The starting point for any multi-page static site (master prompt Section 11.4). Copy the folder, then replace the tokens, copy and media with the project's own; never ship it unchanged.

| File | What it is |
|---|---|
| `_partials/header.html`, `_partials/footer.html` | Shared header and footer. Write them once. `{{root}}` becomes the path to the site root; `data-nav` marks the active menu item. |
| `index.html`, `about/index.html` | Pages with `<!-- include:header -->` and `<!-- include:footer -->` regions. One folder per page. |
| `styles.css` | Neutral design tokens plus every pattern in `docs/recipes/section-patterns.md`. Replace the token values per project. |
| `motion.js`, `motion.css` | The motion kit: scroll reveals, staggered children, word-by-word headlines, count-up numbers, gentle parallax, page-to-page fades. All off for reduced motion. |
| `favicon.svg`, `og-image.svg`, `site.webmanifest` | Finishing files. Replace with the brand mark and a real sharing image (1200 × 630). |
| `robots.txt`, `sitemap.xml` | Written by the build. |

## Build

```
node scripts/site/build.mjs examples/multi-page-starter --url https://www.example.org
```

It copies the partials into every page, writes `sitemap.xml` and `robots.txt`, and lists any missing favicon, manifest, sharing image, title or description. Run it after every header or footer change.

## Motion attributes

| Attribute | Effect |
|---|---|
| `data-animate="fade-up"` (also `fade`, `zoom`, `mask`, `slide-left`, `slide-right`) | Reveals once when scrolled into view |
| `data-stagger="fade-up"` | Children reveal one after another |
| `data-split` | Headline rises in word by word |
| `data-count` | A number like `82%` or `2,400` counts up from zero |
| `data-parallax="0.12"` | Image drifts gently while scrolling (wide screens only) |
| `data-delay="300"` | Extra delay in milliseconds |

Classify each use in the motion budget (ESSENTIAL, ENHANCEMENT, DECORATIVE). Do not animate every element: a page with everything moving feels cheap.

## Images

Run `python scripts/media/webcraft_media.py variants assets/img` to create 480, 960 and 1600 px copies plus WebP, then use `<picture>` with `srcset` so phones download small files and large screens get sharp ones.
