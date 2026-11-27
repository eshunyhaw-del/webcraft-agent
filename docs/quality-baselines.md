# Quality baselines: accessibility, performance, SEO, security

Checklists for step 8 and 9 of the [validation sequence](generation-pipeline.md#validation-sequence-local_validation-then-visual_qa). Apply the parts that fit the project. Report each item as PASS, FAIL, or NOT RUN, and say which tool or method produced the result. These are baselines, not certifications: never claim WCAG conformance, a performance score, or a security audit that a suitable tool did not produce.

## Accessibility (target: WCAG 2.2 AA where practical)

| Check | How | Tool in this repo |
|---|---|---|
| Landmarks (`header`, `nav`, `main`, `footer`) and one `h1`, no skipped heading levels | Read the DOM | `page-audit.js` |
| Keyboard: every control reachable and operable in a sensible order; no keyboard trap | Tab through the page | Manual |
| Visible focus on every interactive element, on every background | Tab through the page | `page-audit.js` flags removed outlines |
| Accessible names for links, buttons and icon controls | DOM | `page-audit.js` |
| Labels on every form field; errors announced (`aria-live` or focus moved to the error) | DOM + submit an invalid form | `page-audit.js` (labels); manual (errors) |
| Text contrast: 4.5:1 body, 3:1 large text and UI components | Computed colours, including text over images and video | Manual or browser devtools |
| Alt text: meaningful for content images, `alt=""` for decorative | DOM | `page-audit.js` |
| Dialogs and menus: focus moves in, is contained, returns on close; Escape closes | Keyboard | Manual |
| Reduced motion honoured with a meaningful alternative | Emulate `prefers-reduced-motion: reduce` | `page-audit.js` (rule present); manual |
| Touch targets at least 24×24 px (aim for 44 px) | Measure | `page-audit.js` |
| No information conveyed by colour alone | Review states, charts, errors | Manual |

A full automated audit (axe, Lighthouse accessibility) is a separate, optional tool. If it is not available, mark it NOT RUN.

## Performance

| Check | Budget guide (adjust per project) | How |
|---|---|---|
| Images sized to their display size, compressed, modern formats where supported | Hero under ~300 KB; others under ~200 KB | Build output, devtools network |
| Responsive images (`srcset`/`sizes`) for large images | — | DOM |
| Lazy loading below the fold; never on the first-viewport image | — | DOM |
| Video: compressed (≈1280 px, H.264, no audio track for loops), poster image, `preload="metadata"` or none | Under ~3 MB per loop | `scripts/media/webcraft_media.py cut` |
| Fonts: only the weights used, `font-display: swap`, preconnect | ≤ 2 families, ≤ 4 files | Network panel |
| JavaScript: no unused libraries; one animation system per element | Static sites under ~100 KB JS gzipped unless the experience needs more | Build output |
| No layout shift from fonts, media or late animation | CLS ≈ 0 | Lighthouse or visual check |
| Animations use transform and opacity | — | Code review |
| Third-party scripts justified | — | Code review |

Record measured numbers (file sizes, request counts, Lighthouse scores if run), not estimates.

## SEO

| Check | How |
|---|---|
| Unique `<title>` and meta description per page | `page-audit.js` per page, or grep the build |
| One `h1` and a logical heading outline | `page-audit.js` |
| Crawlable internal links (real `<a href>`), no `href="#"` | `check-links.mjs` |
| Descriptive alt text | `page-audit.js` |
| Open Graph title, description, image | `page-audit.js` (title); DOM |
| Canonical URL when the same content is reachable at several URLs | DOM |
| `sitemap.xml` and `robots.txt` for multi-page sites | File exists in the build |
| Structured data only for facts the owner supplied (business name, address, hours) | Never invent ratings, prices, or reviews in schema |
| `lang` attribute on `<html>` | `page-audit.js` |

## Security (forms, APIs, accounts, payments, databases)

| Check | How |
|---|---|
| No secrets in client code or the repository; `.env` ignored; `.env.example` present | Grep the build output for keys; `git status` |
| Input validated on the server, not only in the browser | Code review |
| Output encoded; no raw HTML from users (`innerHTML`, `dangerouslySetInnerHTML`) without sanitising | Code review |
| Authentication and authorisation checked on every protected route and API, not only hidden in the UI | Code review; request a protected resource while signed out |
| No direct object access by guessable IDs without an ownership check | Code review |
| CORS limited to known origins; security headers where the host allows (CSP, HSTS, X-Content-Type-Options, Referrer-Policy) | Response headers |
| Dependency vulnerabilities | `npm audit` or equivalent, if available |
| Rate limiting or spam protection on forms and auth endpoints | Code review / provider settings |
| Payments only through the provider's hosted checkout or SDK; no card data touches the site | Code review |

Basic checks are not a security audit. Say so in the delivery report when the project handles accounts, payments, or personal data.
