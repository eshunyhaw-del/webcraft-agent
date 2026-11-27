# Template mode

WEBCraft normally builds a website for one business (`MODE = WEBSITE`). Template mode (`MODE = TEMPLATE`) builds a reusable, configurable starting point that many buyers can adapt, for example for a template marketplace. Use it only when the user asks for a template. Never turn an ordinary website project into a template.

## What changes in template mode

The [generation pipeline](generation-pipeline.md) is the same, with these differences:

| Stage | Website | Template |
|---|---|---|
| DISCOVERY | One business, its real facts | An industry or use case and its typical buyer; no real business facts |
| CREATIVE_DIRECTION | Identity specific to the business | A distinct, original identity for the use case, with colours, type and imagery that a buyer can swap through tokens |
| Content | Complete copy; realistic sample content where facts are missing, listed in `content.md` | Realistic sample content for every business fact, documented as customisation points; no placeholders |
| DESIGN_SYSTEM | Tokens | Tokens centralised in one file named in the manifest, so re-branding is a token change |
| DELIVERY | Delivery report to the owner | Manifest, README with customisation guide, export, quality gate |

The design guardrails (master prompt Section 3) still apply. A template must not look like a generic AI template either.

## Template requirements

- Industry or use-case classification (`category`, `useCase`).
- A reusable page structure that works without the sample content.
- Design tokens in one file (`designTokens`).
- Editable content and media, with every customisation point documented (`customizationPoints`).
- No owner credentials, client data, real contact details, or private information. Use `@example.com` addresses.
- No testimonials, ratings, logos, awards, prices or statistics presented as real. Sample content is labelled as sample.
- Responsive behaviour, working navigation and working interactions (or features clearly labelled as needing an integration).
- Setup instructions in `README.md`.
- Dependency and licence information (`licenseNotes`, and `assets` for every media file).
- Preview screenshots in `.webcraft/screenshots/` when browser rendering is available.

## The manifest

`webcraft-template.json` at the template root, validated against [`schemas/template-manifest.schema.json`](../schemas/template-manifest.schema.json) (schema version `1.0`). Bump the schema version when a change would break existing manifests.

```
node scripts/template/validate-manifest.mjs <template-folder>
```

Key fields: `templateId`, `name`, `version`, `category`, `useCase`, `framework`, `pages` (route and purpose), `features`, `customization` (what a buyer can change), `customizationPoints` (where), `designTokens`, `requiresEnvironmentVariables`, `commands`, `buildOutput`, `assets` (path, source, licence for every media file), `licenseNotes`, and `validation` (install, build, routes, responsive, optionally accessibility and performance, each with a status and evidence). A working example is [`tests/fixtures/template-ok/webcraft-template.json`](../tests/fixtures/template-ok/webcraft-template.json).

## Export

```
node scripts/template/export.mjs <template-folder> <output-folder>
```

Copies source, public assets, the manifest, README, `.env.example`, licence notes and the QA reports in `.webcraft/` (`validation-report.md`, `visual-qa-report.md`, `screenshots/`). Leaves out `node_modules`, build caches, `.env` files, the rest of `.webcraft/` (it can contain client details), OS and log files, and any media file without a licence in `assets`. Writes `EXPORT.json` listing what was left out and why. Zip the output folder with your operating system. The export must install and run from its own README.

## Quality gate

```
node scripts/template/gate.mjs <template-folder-or-export>
```

Prints `READY_FOR_MARKETPLACE` only when all of these pass, otherwise `NOT_READY` with the failures:

- The manifest validates.
- `README.md` exists.
- No `.env` files; `.env.example` lists every required variable.
- The design tokens file and every customisation point exist.
- Every media file is listed in `assets` with a known licence.
- Links, routes and assets resolve in the build output, with no placeholder links, and every manifest page exists. Build the template first; without a build output this is NOT RUN, which blocks the gate.
- The recorded install, build and routes checks are PASS (static templates may record install and build as NOT APPLICABLE).
- Responsive checks are PASS, or NOT RUN with a stated reason.
- No private email addresses or credential-like strings.

The gate checks what can be checked automatically. A human still reviews the design quality, the sample content and the licences before publishing.
