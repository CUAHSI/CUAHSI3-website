## What changed and why

<!-- Two or three sentences in plain language. Roadmap task number. -->

## What I checked

- [ ] `./scripts/verify.sh --build` : N FAIL, N WARN
- [ ] `content/` untouched (a `task/` branch), or this is a `content/` branch and the section below is filled in
- [ ] The PR base is `main`
- [ ] Routes fetched from the built site, with status:
- [ ] Internal links in changed markup resolve to a built file: N of N
- [ ] Rendered HTML compared against `main` (refactors only). Differences:

Warnings from verify.sh, and what I did about each:

## Reviewer subagent findings

<!-- Paste the reviewer's report unchanged. Then, under each finding, what was done. -->

## What I could not check. Please look.

<!-- Required for any change to layout, markup or links. Open the Netlify deploy
     preview. Phone = 390px wide, desktop = 1280px. Keep this list short. -->

| Route | Width | Look at / click | Expected |
|---|---|---|---|
| | | | |

## Interventions during this task

<!-- Every time Jordan corrected or redirected the work. Copy the lines from
     agent/eval-log.md. "None" is a valid answer only if it is true. -->

## Content PRs only (a `content/short-name` branch)

<!-- Delete this section on a code PR. -->

- Validator before and after, with denominators:
- Known-failures lines removed (only removals are allowed):
- Sources, one line per item added or changed (C2). If Jordan or staff supplied the facts, who and when:
- To verify: facts I could not confirm, and fields left empty (C3):
- Agent's judgment calls, each labelled as mine (C7):
- Pages whose visible content changes, and what changes on each:
- `visual/baseline/` images changed, and why (or "none"):
- `public/` files added or changed, and the content item each belongs to (or "none"):
- Duplicate check run (C4), and what matched:
