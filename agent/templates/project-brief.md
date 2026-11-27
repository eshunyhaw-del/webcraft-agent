# Project brief

Status: DISCOVERY | REQUIREMENTS_READY · Mode: WEBSITE | TEMPLATE

## The request
The user's words, quoted or closely paraphrased.

## Business
| Item | Value | Provenance |
|---|---|---|
| Business and offer | | USER_PROVIDED / AGENT_DRAFT / … |
| Category and model | | |
| Market position | | |
| Location or market | | |
| Primary audience and their context | | |
| Visitor intent on arrival | | |
| Primary conversion action | | |
| Secondary action (only if useful) | | |
| Pages and features requested | | |
| Trust needs and likely objections | | |

## Questions asked (at most five)
Each question, why it changes the result, and the answer (or "delegated: decided by agent").

## Assumptions
Decisions made without confirmation. Each must be conservative and reversible.

## Content ledger
Every factual item that may appear on the site. Never publish PLACEHOLDER or REQUIRES_CONFIRMATION content as fact; render placeholders visibly and mark them with `data-placeholder="what is needed"` so `scripts/qa/page-audit.js` can count them.

| Item | Value | Provenance | Source or note |
|---|---|---|---|
| Phone | | PLACEHOLDER | "Add your phone number" |
| | | USER_PROVIDED / SOURCE_VERIFIED / AGENT_DRAFT / PLACEHOLDER / REQUIRES_CONFIRMATION | |

Provenance labels: **USER_PROVIDED** (from the user), **SOURCE_VERIFIED** (checked against a named source), **AGENT_DRAFT** (copy written by the agent from supplied facts), **PLACEHOLDER** (missing, shown as a slot), **REQUIRES_CONFIRMATION** (plausible but unverified; the owner must confirm before launch).
