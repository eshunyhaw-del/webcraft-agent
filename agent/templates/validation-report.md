# Validation report

Date: · Environment: (OS, browser tool) · Tools: paste the output of `node scripts/qa/detect-tools.mjs`

Status per step is PASS, FAIL, or NOT RUN. NOT RUN always has a reason. Never mark a step PASS without the command or tool that proves it.

| # | Step | Command or tool | Status | Evidence or reason |
|---|---|---|---|---|
| 1 | Dependencies and configuration | `npm install` / none for static | | |
| 2 | Static analysis and types | | | |
| 3 | Unit and component tests | | | |
| 4 | Production build | | | |
| 5 | Routes and links | `node scripts/qa/check-links.mjs <out>` | | |
| 6 | Browser smoke test | local HTTP server + browser | | |
| 7 | Responsive inspection | see visual-qa-report.md | | |
| 8 | Accessibility inspection | page-audit + keyboard pass | | |
| 9 | Performance inspection | Lighthouse or build sizes | | |
| 10 | Final regression pass | steps 4–7 again | | |

## Blocking failures and how they were fixed
