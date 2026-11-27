# Project record templates

Copy these into a generated project's `.webcraft/` folder as each stage of the [generation pipeline](../../docs/generation-pipeline.md) finishes. Fill them with short, specific entries; delete rows that do not apply. For a small site, put the first five as sections of one `.webcraft/project.md`, and the three reports as sections of one `.webcraft/qa-report.md`.

| Template | Stage |
|---|---|
| [project-brief.md](project-brief.md) | DISCOVERY, REQUIREMENTS_READY |
| [creative-direction.md](creative-direction.md) | CREATIVE_DIRECTION |
| [site-map.md](site-map.md) | UX_ARCHITECTURE |
| [design-system.md](design-system.md) | DESIGN_SYSTEM |
| [page-spec.md](page-spec.md) | PAGE_SPECIFICATION (one per page, in `page-specs/`) |
| [architecture.md](architecture.md) | IMPLEMENTATION |
| [validation-report.md](validation-report.md) | LOCAL_VALIDATION |
| [visual-qa-report.md](visual-qa-report.md) | VISUAL_QA, REFINEMENT |
| [delivery-report.md](delivery-report.md) | DELIVERY |
| [state.json](state.json) | Updated after every stage |

Vocabularies used across them (defined in [`schemas/pipeline.json`](../../schemas/pipeline.json)):

- **Check status:** PASS, FAIL, NOT RUN (always with a reason).
- **Content provenance:** USER_PROVIDED, SOURCE_VERIFIED, AGENT_DRAFT, PLACEHOLDER, REQUIRES_CONFIRMATION.
- **Motion class:** ESSENTIAL, ENHANCEMENT, DECORATIVE.
