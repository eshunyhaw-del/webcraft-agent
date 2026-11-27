# Generation pipeline

How WEBCraft moves a brief to a delivered website, one verifiable stage at a time. The master prompt's 13 phases are the craft; this document is the order, the gates, and the record. States and transitions are also in machine-readable form in [`schemas/pipeline.json`](../schemas/pipeline.json).

## Principles

1. A stage starts only when its required inputs exist.
2. A stage ends by writing its artifact. A stage is complete when its completion criteria are met, not when the agent says so.
3. Validation and QA stages are complete only with **tool evidence**: command output, audit output, or screenshots. A check with no tool is **NOT RUN**, never PASS.
4. A failed check sends the work back to the stage that caused it.
5. Work can resume from the last verified stage.
6. Chat-only tools run a reduced pipeline and say so (see below).

## States

```text
RECEIVED
  -> DISCOVERY
  -> REQUIREMENTS_READY
  -> CREATIVE_DIRECTION
  -> UX_ARCHITECTURE
  -> DESIGN_SYSTEM
  -> PAGE_SPECIFICATION
  -> IMPLEMENTATION
  -> LOCAL_VALIDATION
  -> VISUAL_QA
  -> REFINEMENT   (loops back to LOCAL_VALIDATION or VISUAL_QA)
  -> DELIVERY
```

Interruptions, and where each one returns:

| State | When | Returns to |
|---|---|---|
| NEEDS_CLARIFICATION | A missing fact would change the architecture, content, direction, or features (master prompt §6) | DISCOVERY |
| BLOCKED_BY_MISSING_INPUT | A required input cannot be inferred or replaced with a marked placeholder (credentials, a provider choice, legally required text) | DISCOVERY or IMPLEMENTATION |
| TOOL_UNAVAILABLE | A validation tool is missing (`node scripts/qa/detect-tools.mjs`) | The next stage, with that check recorded as NOT RUN |
| VALIDATION_FAILED | A blocking check failed | IMPLEMENTATION for code defects; DESIGN_SYSTEM, PAGE_SPECIFICATION, or UX_ARCHITECTURE for design or structure defects |
| OWNER_REVIEW_REQUIRED | A decision that belongs to the owner: spending money, connecting payments or accounts, publishing, licences with conditions, a direction the owner rejected | The stage that asked |

## The project record: `.webcraft/`

Artifacts live in a `.webcraft/` folder at the root of the generated project. Tell the user it exists, what it is for (resuming and reviewing the work), and that it is safe to delete. Never put secrets in it. Templates for every artifact are in [`agent/templates/`](../agent/templates/).

| Size of job | Record |
|---|---|
| Full (multi-page, shop, app, immersive, or the user wants documentation) | One file per artifact, as listed below, plus `state.json` |
| Compact (Quick Path: a small or single-page site) | One `.webcraft/project.md` with the brief, direction, site map, design system and architecture as short sections, one `.webcraft/qa-report.md` combining validation, visual QA and delivery, plus `state.json` |
| Chat only (no files) | No folder. The same headings appear, short, in the chat reply |

`state.json` (template: [`agent/templates/state.json`](../agent/templates/state.json)) holds the mode, current state, each completed stage with its artifact and evidence, open blockers, and placeholders still to fill.

## Stage contracts

| Stage | Master prompt | Required inputs | Artifact | Complete when | Fails when | Hands on |
|---|---|---|---|---|---|---|
| DISCOVERY | Phase 1, §6, §13.2 | The brief; repository or existing site if any | `project-brief.md` | Business, audience, primary action, pages and features are stated; every fact has a provenance label; assumptions are listed apart from confirmed facts | A critical fact is missing and cannot be a marked placeholder | Brief, assumptions, content ledger |
| REQUIREMENTS_READY | §6 | Brief; answers to at most five questions, or "you decide" | `project-brief.md` (status line updated) | No open question blocks direction or architecture | — | Same |
| CREATIVE_DIRECTION | Phases 2, 4, 5, 9, 10 | Brief | `creative-direction.md` | Concept, type and media direction are specific (no bare "modern"/"premium"); every experience pattern has its 8-field justification; motion budget classifies every motion | Direction contradicts the guardrails (§3) or the brief | Direction, patterns, motion budget |
| UX_ARCHITECTURE | Phases 6, 7 | Brief, direction | `site-map.md` | Every page has route, intent, primary CTA, sections, data, SEO title and description, internal links; user flows for each conversion | A required page or flow has no route | Site map |
| DESIGN_SYSTEM | Phase 3 | Direction, site map | `design-system.md` (and the tokens file in code) | Tokens for colour roles, type scale, spacing, widths, breakpoints, radii, shadows, motion, z-index; component inventory with reasons; contrast pairs checked | Contrast fails or tokens are missing a group the pages need | Tokens, components |
| PAGE_SPECIFICATION | Phase 8, 10 | Site map, design system | `page-specs/<page>.md` | Each section has purpose, layout, type, media, copy source, responsive change, motion class and reduced-motion behaviour | — | Specs |
| IMPLEMENTATION | Phase 11, 12, Section 12 | Specs, tokens | Working source project and `architecture.md` | The site runs locally (or files are complete in chat-only mode); stack decision recorded; every interactive feature has defined loading, empty, success and error behaviour or is labelled a prototype | Build does not start; secrets in client code | Running project |
| LOCAL_VALIDATION | Phase 13 | Running project, tool list | `validation-report.md` | Every step of the validation sequence (below) is PASS or NOT RUN with a reason, and no blocking FAIL remains | Any blocking FAIL | Report |
| VISUAL_QA | Phase 13, 12 | Validated project, browser tool | `visual-qa-report.md` + screenshots | Every canonical viewport inspected with evidence, or NOT RUN with a reason | A blocking defect at any viewport | Defect list |
| REFINEMENT | Phase 13 loop | Defect list | Updated `visual-qa-report.md` | Each fixed defect re-checked at its viewport and the adjacent ones | A fix causes a regression | Updated project |
| DELIVERY | §9, §13.4, §13.5 | All of the above | `delivery-report.md` | The user knows how to open, edit and publish; every placeholder, unverified fact, unconnected integration and NOT RUN check is listed | — | — |

## Validation sequence (LOCAL_VALIDATION, then VISUAL_QA)

Run in this order and stop to fix any blocking failure before moving on. Skip a step only when it does not apply to the stack, and say so.

1. **Dependencies and configuration.** Install succeeds; required environment variables are in `.env.example`; no secrets in source.
2. **Static analysis and type checking.** The project's linter and `tsc --noEmit` (or equivalent) if configured.
3. **Unit and component tests**, if the project has them.
4. **Production build** (`npm run build` or equivalent). Static sites: none needed.
5. **Routes and links.** `node scripts/qa/check-links.mjs <build-output>`.
6. **Browser smoke test.** Serve over HTTP (not `file://`); load every page; no console errors; media loads.
7. **Responsive visual inspection** at every viewport in [`scripts/qa/viewports.json`](../scripts/qa/viewports.json), with `scripts/qa/page-audit.js` run at each.
8. **Accessibility inspection.** The page-audit items, keyboard-only pass through navigation, forms and dialogs, reduced-motion on. A full WCAG 2.2 AA audit only if a suitable tool exists; never claim conformance without one.
9. **Performance inspection.** Lighthouse or equivalent if available; otherwise record image weights, total JS size, and font requests from the build output, and mark the audit NOT RUN.
10. **Final regression pass.** Re-run steps 4 to 7 after the last fix.

## Fixing defects (REFINEMENT)

For each defect: record the viewport and screenshot or measurement, describe it precisely, find the responsible component or rule, make the smallest local fix, re-check that viewport, then re-check the adjacent viewports. Never change a global rule to fix one local defect.

## Resuming

Read `.webcraft/state.json`. Confirm the artifact of the last completed stage exists and still matches the project (for validation stages, re-run the cheapest check). Continue from the next stage. If the record is missing or stale, restart at the earliest stage whose artifact is missing.

## Chat-only mode

Without files or a terminal, run DISCOVERY to IMPLEMENTATION as short headed sections in the reply, deliver complete files (one fenced block per file with its path), then set LOCAL_VALIDATION and VISUAL_QA to NOT RUN (TOOL_UNAVAILABLE) and say so plainly. Read-through checks (contrast values, heading order, links between the files you wrote) may be reported as "checked by reading the code".

## Modes

`WEBSITE` (default) builds for one business. Every stage above applies to it.
