## What changed and why

<!-- Two or three sentences in plain language. Roadmap task number. -->

Requested by: <!-- the requester who directed the session (AGENTS.md, top) -->

<!-- Questions for a website owner (rule 8, schema, scope, redirects, editorial calls), when the requester
     is not one. "None" if there are none. -->

## What I checked

- [ ] `./scripts/verify.sh --build` : N FAIL, N WARN
- [ ] `content/` untouched (a `task/` branch), or this is a `content/` branch and the section below is filled in
- [ ] The PR base is `main`
- [ ] Routes fetched from the built site, with status:
- [ ] Internal links in changed markup resolve to a built file: N of N
- [ ] Rendered HTML compared against `main` (refactors only). Differences:
- [ ] `npm run visual:compare` (code PRs only): N of 60; each failure's diff, and each image retaken and why:

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

<!-- Every time the requester or a website owner corrected or redirected the work. Copy the lines from
     your agent/log/ file. "None" is a valid answer only if it is true. -->

## Content PRs only (a `content/short-name` branch)

<!-- Delete this section on a code PR. -->

- Validator exit code (must be 0, C1), with the counts it reports:
- Sources, one line per item added or changed (C2). If the requester or other staff supplied the facts, who and when:
- To verify: facts I could not confirm, and fields left empty (C3):
- Agent's judgment calls, each labelled as mine (C7):
- Pages whose visible content changes, and what changes on each:
- `visual/baseline/` images changed: none (a content PR does not retake them; `visual/README.md`, "Which pull requests run it"; if verify.sh warns, say why)
- `public/` files added or changed, and the content item each belongs to (or "none"):
- Duplicate check run (C4), and what matched:
