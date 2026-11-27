# Visual QA report

Browser tool: · Served from: (http://localhost:…, never file://) · Screenshots in: (path, or "inspected in browser pane, not saved")

## Viewports
From `scripts/qa/viewports.json`. Run `scripts/qa/page-audit.js` at each.

| Viewport | Inspected | page-audit blocking | page-audit warnings | Evidence |
|---|---|---|---|---|
| 360×640 narrow mobile | PASS / FAIL / NOT RUN | | | |
| 390×844 mobile | | | | |
| 768×1024 tablet | | | | |
| 1366×700 short laptop (scroll scenes) | | | | |
| 1440×900 desktop | | | | |
| 1920×1080 wide | | | | |

## Checked at each viewport
Horizontal overflow · clipped or overlapping content · text wrapping and readability · navigation and mobile menu · image crop and focal point · section spacing · type hierarchy · buttons and forms · motion timing and reduced-motion behaviour · footer and final CTA · sticky and fixed elements · loading and error states.

## Defects
| # | Viewport | Defect (precise) | Likely source | Fix (smallest local change) | Re-checked at (this + adjacent viewports) | Status |
|---|---|---|---|---|---|---|

## Not run and limitations
What could not be checked and why (no Safari, no real device, no screen reader, …).

## Owner decisions still open
