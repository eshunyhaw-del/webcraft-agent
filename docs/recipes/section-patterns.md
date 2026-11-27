# Section patterns: building rich, varied pages

A complete website tells its story in enough sections, and each one looks different from its neighbours (master prompt Section 3.7). Use this library to plan each page before writing it. Pick the patterns the content needs, then check the rhythm rules at the end.

Every pattern still follows the owner's rules: no eyebrow labels, no decorative numbering, no small-print clutter, real photography, complete content.

## The patterns

| Pattern | Use it for | Layout | Media |
|---|---|---|---|
| **Full-bleed hero** | The first impression of the home page | Image or muted looping video covering the viewport (or 80–90vh), scrim for legibility, headline, one sentence, one or two buttons | Hero photo or video plus poster |
| **Split hero** | Inner pages, or a calmer home page | Headline and text on one side, a large photo on the other; stacks on phones | One strong photo |
| **Split feature** | Explaining one idea with a picture | Photo and text side by side; alternate sides down the page | Photo per section |
| **Fact band** | Real, sourced figures about the world or the owner's results | Three or four large numbers with short labels on a contrasting background | Optional background photo with heavy scrim |
| **Image mosaic** | Showing breadth: places, products, people at work | Asymmetric grid of 4–6 photos of different sizes, captions only if they carry information | Several photos |
| **Feature cards with photos** | Programmes, services, products | Three or four cards, each with a photo, title, two lines, and a link | Photo per card |
| **Process or timeline** | How something happens, or the organisation's story | Steps along a line (vertical on phones), each with a short title and sentence | Optional small photos |
| **Quote with portrait** | A single strong testimonial or voice | Large quote, name and role, portrait photo; one per section, not a grid of many | Portrait |
| **Testimonial carousel or row** | Several voices | Two or three quotes side by side, or a scrollable row with buttons | Portraits |
| **Team grid** | People behind the work | Photo, name, role, one sentence each | Portraits |
| **Impact story** | One concrete story: a project, a place, a customer | Wide photo, headline, two or three paragraphs, a link to read more | Wide photo |
| **Map or locations** | Where the work happens or where to find the business | A static map image or embedded map with a list of places | Map |
| **Gallery** | Visual proof: work, events, products | Grid or masonry with a lightbox | Many photos |
| **FAQ accordion** | Answering objections and practical questions | Questions as buttons that expand their answers (`<details>` or ARIA) | None |
| **News or updates** | Freshness and activity | Three latest items with photo, date, and title | Photo per item |
| **Newsletter sign-up** | Staying in touch | One field and a button, short promise of what they will get | Optional background photo |
| **Partner or supporter strip** | Credibility, only with partners the owner names | Row of logos | Logos the owner supplies (never real organisations invented as partners) |
| **Call-to-action band** | Ending a page with one clear next step | Full-width colour or photo band, headline, one or two buttons | Optional background photo or video |

## Recommended page plans

**Home (at least seven sections):** full-bleed hero, split feature (who we are), fact band (real figures), feature cards with photos (what we do), impact story or image mosaic, quote with portrait, news or updates, newsletter sign-up or call-to-action band.

**Services, programmes, or products:** split hero, intro split feature, one split feature per item alternating sides or a set of feature cards, process, FAQ, call-to-action band.

**About:** split hero, story as a timeline, values as cards, team grid, locations or map, call-to-action band.

**Get involved or pricing:** split hero, ways or plans as cards with photos, quote with portrait, FAQ, call-to-action band.

**Contact:** split hero or short header with photo, contact details and form side by side, map or locations, FAQ.

## Rhythm rules

1. Never place two sections with the same pattern next to each other.
2. Use one pattern at most twice on a page (split features that alternate sides count as one pattern used intentionally; break them up with another pattern after two or three).
3. Alternate width and weight: full-bleed then contained, dark then light, image-led then text-led.
4. Every page except Contact has at least three real photographs; the home page has a hero photo or video.
5. Give the eye a rest: after two dense sections, use a band, a quote, or a large image.
6. End every page with a clear next step.

## Checking

`scripts/qa/page-audit.js` warns when a page has fewer than four sections (seven on the home page), no images or video, or two neighbouring sections with the same structure. Read the warnings, then look at the page: the audit counts structure, it cannot judge taste.
