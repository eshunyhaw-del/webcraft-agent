# Benchmark rubric

Score each dimension from 1 to 5 and write the evidence (a screenshot, a measurement, a file and line, or a quote of the copy). A score without evidence is not recorded. The total is a summary, never a substitute for the critical defect check below: **any critical defect fails the run, whatever the scores.**

## Critical defects (any one fails the run)

- A placeholder on the site ("Add your ...", empty or "coming soon" sections, grey image boxes, lorem ipsum).
- A false statement about the real world, or invented payment details, registration numbers, awards from real bodies, or real people or organisations as staff, clients, reviewers or partners.
- Invented business content missing from `.webcraft/content.md`.
- A claim that something was tested, sent, stored, paid or published when it was not.
- The site does not start, or the production build fails.
- A blocking `page-audit.js` item at any required viewport (overflow, broken media, unlabelled form field, link with no destination).
- A broken route or `href="#"` link (`check-links.mjs`).
- A secret or credential in client code or the repository.
- A breach of the owner's banned patterns (master prompt Section 3.4) or a default purple or blue-purple palette without a brand reason.

## Dimensions

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| Brief adherence | Ignores key parts of the brief | Covers the brief with gaps | Every stated need met; assumptions recorded and sensible |
| Visual distinctiveness | Generic template look | Some identity, familiar layout | Unmistakably this business; would not fit another category |
| Typography and hierarchy | Default-looking, flat hierarchy | Clear but unremarkable | Confident scale, measured line lengths, clean wrapping at every viewport |
| Layout and composition | Repetitive card grids, cramped | Orderly but predictable | Varied, deliberate composition with purposeful whitespace |
| UX clarity | Visitor cannot tell where to go | Navigable with effort | Obvious path through every page; orientation never lost |
| Conversion clarity | No clear primary action | Action exists but competes | One clear primary action per page, objections answered with real content |
| Functional completeness | Dead controls or fake features | Works with gaps, labelled | Every control works or is honestly labelled a prototype |
| Responsive quality | Breaks on phones | Usable, shrunk desktop | Recomposed per viewport, no overflow at any canonical size |
| Accessibility | Keyboard or contrast failures | Basics in place | page-audit clean, keyboard pass done, reduced motion designed |
| Performance | Heavy media, layout shift | Acceptable weights | Measured weights within budget, no shift, lazy loading right |
| Code maintainability | Monolithic, raw values everywhere | Organised, some duplication | Tokens used throughout (`token-audit.mjs`), small components, README complete |
| Content completeness and integrity | Placeholders or false facts (also critical defects) | Complete but generic, or ledger incomplete | Complete, specific content on every page; real-world facts sourced; every sample item in `content.md` |

Record scores with `node scripts/bench/new-run.mjs` and compare runs with `node scripts/bench/report.mjs`. Human review remains necessary for the subjective dimensions; screenshot comparison is only meaningful when the rendering conditions (viewport, fonts, media) are identical.
