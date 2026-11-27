# Benchmarks

A fixed set of briefs to run WEBCraft against after changing the master prompt, so quality changes are measured instead of guessed.

| Path | What it is |
|---|---|
| [`briefs/`](briefs/) | Ten fictional briefs across industries. Each states the user's words, the facts supplied, what a good result needs, and the traps (placeholders, thin layouts, false facts). No real client information. |
| [`rubric.md`](rubric.md) | Critical defects that fail a run outright, and twelve dimensions scored 1 to 5 with evidence. |
| `runs/` | One JSON record per run (schema: [`schemas/benchmark-run.schema.json`](../schemas/benchmark-run.schema.json)). |
| `RESULTS.md` | Generated summary of the latest run per brief and any regressions. |

## Running a benchmark

1. Start a fresh session of the AI tool in a fresh clone (or a clean folder with WEBCraft installed), so nothing from earlier work leaks in.
2. Paste the brief's **User's words** exactly. Answer any clarifying questions with "you decide", unless the brief supplies the fact.
3. Let the agent build, validate and deliver.
4. Create a record, then fill it in:
   ```
   node scripts/bench/new-run.mjs restaurant-local --model "model name" --tool "Claude Code desktop"
   ```
   The record captures the master prompt's version (its git blob hash) and the commit automatically. Fill in the stack, build and QA status with evidence, screenshot paths, the twelve scores with evidence for each (see the rubric), critical defects, other defects, and notes.
5. Compare with earlier runs:
   ```
   node scripts/bench/report.mjs --write
   ```
   It exits 1 when a record is invalid or a brief regressed: a new critical defect, build or QA going from PASS to FAIL, or any score dropping by one point or more.

## Notes

- Keep screenshots of each run outside the repository, or in `benchmarks/runs/<runId>/` if they are small. Compare screenshots only when the viewport, fonts and media are identical; design quality still needs a human reviewer.
- Model outputs vary between runs. Treat a single drop as a signal to re-run, and a repeated drop as a regression.
- No benchmark runs have been recorded yet.
