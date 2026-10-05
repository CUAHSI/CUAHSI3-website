## What changed and why

<!-- Two or three sentences in plain language. Roadmap task number. -->

## What I checked

- [ ] `./scripts/verify.sh --build` : N FAIL, N WARN
- [ ] `content/` untouched, or this is a content task and the PR lists the pages that change
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
