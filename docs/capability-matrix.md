# Capability matrix (task A-02)

Each capability proposed in the *WEBCraft Engineering Enhancement Specification* is mapped to the repository at commit `ac9be3c`. Nothing here has been implemented yet.

Status: **EXISTS** implemented and usable · **PARTIAL** present but incomplete or inconsistent · **MISSING** not present · **CONFLICTS** overlaps or contradicts an existing rule.

"MP" means `agent/WEBCRAFT_MASTER_PROMPT.md`.

## Phase B: generation pipeline

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| B1 | Workflow state machine with failure/resume states | PARTIAL | MP §4 Phases 1–13 in fixed order; Quick Path; §14 reduced chat-only mode | No named states, no transition rules, no failure states, no resume-from-last-verified-stage | P0 | A-03 |
| B2 | Stage contracts (inputs, outputs, gates) | PARTIAL | Each phase ends with a "Deliverable"; MP §7 lists 9 outputs; §8 quality gate | Deliverables are not files; no required inputs, completion criteria or failure conditions per stage | P0 | B1 |
| B3 | Clarification policy (≤ 5 questions, record assumptions) | EXISTS | MP §6, §13.2, Quick Path step 1, Phase 1 "facts supplied vs assumptions" | Assumptions are disclosed in chat, not recorded in a brief file (covered by B2) | — | — |

## Phase C: creative direction and experience

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| C1 | Explicit creative direction before build | PARTIAL | MP Phase 2 lists concept, personality, references, composition, media direction | Not a required artifact; no rule against vague labels ("modern", "premium") | P1 | B2 |
| C2 | Experience-selection decision rules | PARTIAL | MP §9.1 (when immersion fits), §9.2 patterns, §9.3 per-scene map, §11.3 when to use scroll journey | No per-pattern record of objective, justifying content, mobile/reduced-motion fallback, performance cost | P1 | C1 |
| C3 | Motion budget (ESSENTIAL / ENHANCEMENT / DECORATIVE) and fallbacks | PARTIAL | Fallbacks EXIST: MP Phase 10 quality list, §9.4–9.6 (no hijacking, reduced motion, no hover-only info, transform/opacity) | Three-tier motion classification is MISSING | P1 | C2 |
| C4 | Visual originality across projects | EXISTS | MP §2, §3.2, §5 rules 2 and 17, §11 "learn craft not content" | No measurement across runs (see K) | — | — |

## Phase D: design system

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| D1 | Semantic design tokens before styling | EXISTS | MP Phase 3 (colour, type, layout, radius, shadow, motion tokens as CSS custom properties) | Breakpoints and z-index not named as token groups; no machine-readable token file | P1 (small) | B2 |
| D2 | Component reuse rules | PARTIAL | MP Phase 3 "components the project actually needs", Phase 11 "reusable components where they provide real value", §12.8 Spell UI | No rule against over-componentising; no conditional components (testimonials/pricing only with real data) stated as reuse rules, though §6 copy rules imply it | P1 | D1 |
| D3 | Design-system consistency QA check | MISSING | §8 checklist says tokens "consistently applied", but nothing checks it | No checklist item or script for stray colours/spacing values or variant sprawl | P1 | D1, H1 |

## Phase E: information architecture

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| E1 | Sitemap and page inventory | PARTIAL | MP Phase 7 (pages, navigation, conversion path, internal links) | No per-page record (route, intent, CTA, SEO title/description) | P1 | B2 |
| E2 | Route and navigation integrity | PARTIAL | MP §5 rule 12, Phase 11 "links actually work", §8 "no dead controls"; `shoot.py` reports failed requests | No link/route checker for generated multi-page sites; `href="#"` not explicitly banned; no 404 rule | P1 | E1, H1 |
| E3 | Shared layout without flattened page identity | EXISTS | MP §3.2 "repeated section layouts", Phase 7 "each page serve a clear role" | — | — | — |

## Phase F: content and conversion

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| F1 | Content provenance labels | PARTIAL | MP Phase 1 (facts vs assumptions), Phase 6 never-fabricate list, §13.3 marked slots listed at end | No labels (USER_PROVIDED, AGENT_DRAFT, PLACEHOLDER, …); no rule to keep provenance in project files | P1 | B2 |
| F2 | Conversion logic per page | EXISTS | MP Phase 6 (visitor, problem, proof, objections, next action; hero four questions; banned filler) | Per-page, not per-site, is implied rather than stated | — | — |
| F3 | CTA validation | PARTIAL | MP §5 rule 12, Phase 7 focus states, Phase 11 no fake functionality, §12.6 real form destinations | No explicit per-CTA checklist (destination, keyboard, focus, success/error) | P1 | E2 |

## Phase G: implementation

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| G1 | Stack selection | EXISTS | MP §12 (precedence, 7 axes, Tiers 0–4, animation table, hosting) | — | — | — |
| G2 | Recorded project architecture (framework, versions, env vars, deploy) | PARTIAL | MP §12.7 tells the user in 1–2 sentences; §12.6 README with run/build/deploy | No written stack decision record in the project | P1 | B2 |
| G3 | Maintainable implementation rules | EXISTS | MP Phase 11, §12.6 (semantic HTML, minimal deps, env vars, `.env.example`, no secrets) | Loading/empty/error states only in Phase 7; fine | — | — |
| G4 | Functional completeness / prototype labelling | EXISTS | MP Phase 11 "do not claim a form sends email…", §12.3 Tier 3 sample data, §12.6 | Explicit "label as prototype" wording could be added to H5 report | — | — |

## Phase H: validation and visual QA

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| H1 | Capability-aware validation (detect tools, report NOT RUN) | PARTIAL | MP §14 per-environment modes, Phase 13 "do not say tested if not", §13.4 check installed tools; `shoot.py` detects missing Playwright | No tool-detection step or script; no NOT RUN vocabulary | P0 | A-03 |
| H2 | Ordered validation sequence | MISSING | Phase 13 lists items to review but no order (deps → static → tests → build → links → smoke → visual → a11y → perf) | Whole sequence | P1 | H1 |
| H3 | Standard QA viewports | CONFLICTS | Phase 12: 5 named classes; §11.2: 360×640, 390×844, 1366×700; `shoot.py`: 1440×900, 390×844; Lite: desktop/tablet/mobile | Four inconsistent sets; spec proposes 360/390/768/1440/1920. One canonical list must be chosen, and `shoot.py` is third-party (not to be edited here) | P1 | H1 |
| H4 | Iterative fix loop | EXISTS | MP Phase 13 build→render→inspect→refine loop; skill `review.md` blocking list + "two weakest" fix loop | "Smallest local fix, re-check adjacent breakpoints" is not stated | — | — |
| H5 | Truthful QA report format | PARTIAL | MP §7 item 9, §9 completion, Lite final message item 6, showcase README "Honest notes" | No template with tool availability, commands, viewports, evidence paths, passed/failed/NOT RUN | P1 | H1, H2 |

## Phase I: accessibility, performance, SEO, security

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| I1 | Accessibility baseline | PARTIAL | MP Phase 7, §9.6, Phase 10, §8 (keyboard, focus, labels, contrast, reduced motion, touch targets) | No runnable check (e.g. axe); no "don't claim WCAG conformance" rule; dialog focus and colour-only communication not listed | P1 | H1 |
| I2 | Performance baseline | PARTIAL | MP Phase 11, §9.5 (lazy load, posters, fonts, GPU props); media tool compresses video | No budgets, no measurement step (Lighthouse or equivalent) | P2 | H1 |
| I3 | SEO baseline | PARTIAL | MP Phase 11 titles, social metadata, structured data only when accurate | Canonical, sitemap/robots, unique-per-page titles not listed | P2 | E1 |
| I4 | Security baseline | PARTIAL | MP Phase 11 no secrets in frontend; §12.3 never build payments, hosted checkout; §12.6 env vars | No checklist for input validation, authz, CORS/headers, dependency audit, rate limits | P2 | G2 |

## Phase J: template mode

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| J1 | WEBSITE vs TEMPLATE mode | MISSING | Nothing. Note tension: MP §2 and §3 demand an identity specific to one business; a template must be generic | Mode must be explicit and must not weaken the per-project rules | P2 | B1, B2 |
| J2–J5 | Template requirements, manifest schema, export, marketplace gate | MISSING | `assets/manifest.json` in examples is a media manifest, not a template manifest | Everything | P2 | J1, H2 |

## Phase K: benchmarks and regression

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| K1 | Stable benchmark brief fixtures | PARTIAL | `references/sample-prompts/` (1 craft sample, not a brief); `showcase/README.md` records 3 real one-line briefs | No fixture set of input briefs (spec suggests 10 industries) | P2 | A-03 |
| K2 | Scoring rubric | PARTIAL | Skill `review.md`: 10 dimensions scored 1–10 plus blocking list | Different dimensions and scale from spec (12 dimensions, 1–5); lacks factual integrity, functional completeness, maintainability | P2 | K1 |
| K3 | Regression tracking across versions | MISSING | — | No run log, no per-run record of prompt version, model, stack, scores | P2 | K1, K2 |

## Phase L: documentation and drift

| ID | Capability | Status | Evidence | Gap | Priority | Depends on |
|---|---|---|---|---|---|---|
| L1 | Install and supported environments docs | EXISTS | `docs/INSTALL.md` Routes A–C, `README.md` table | — | — | — |
| L2 | Sync procedure for duplicated instructions | PARTIAL | `CONTRIBUTING.md` steps; `build-agent.mjs` generator | Generator is manual; Lite, AGENTS.md summary, Cursor and Copilot files are hand-synced | P1 | — |
| L3 | Test that detects drift | MISSING | No tests, no CI | Check that `.claude/agents/webcraft.md` equals generated output, Lite ≤ 8,000 chars, CLAUDE.md == GEMINI.md, markdown links resolve | P0 | — |

## Summary of gaps, in recommended order

| Order | Item | Why first |
|---|---|---|
| 1 | **L3 drift check script** (`node scripts/check.mjs`) | Zero-risk, gives every later task a regression test; nothing exists today |
| 2 | **H1 capability-aware validation** + NOT RUN vocabulary | P0 honesty foundation; small MP edit |
| 3 | **H3 canonical viewports** (resolve the conflict) | Needed by H2/H5; one-line decisions across MP and Lite |
| 4 | **B1/B2 pipeline and stage contracts** as `docs/generation-pipeline.md`, referenced from MP | P0, but larger; must not bloat the Quick Path |
| 5 | H5 QA report template, then H2 sequence | Builds on 2–3 |
| 6 | C1–C3, D2–D3, E1–E2, F1, F3, G2 | P1 prompt refinements, one per task |
| 7 | I-series, K-series, J-series | P2 extensions |
