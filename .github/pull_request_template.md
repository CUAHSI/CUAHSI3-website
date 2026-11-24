<!-- Content only (content/, agent/, public/ files of a content item): keep the first form, delete the second.
     Anything else: keep the second, and the first too if the PR also changes content. -->

## Content

What changed, for whom: <!-- one or two sentences; the request: Closes #N -->

Requested by: <!-- AGENTS.md, top -->


- Sources, and who supplied the facts, when (C2):
- To verify: what I could not confirm or left empty (C3):
- Calls that are mine, for you to change (C7):
- Duplicate check (C4): what matched
- `public/` files, and the item each belongs to:
- Look at on the deploy preview:
- Questions for a website owner, and what an owner already approved (unpublishing, redirect, has_profile):
- verify.sh warnings, if any:
- Corrections during the work:
- Noticed, not done (with the full cost):

## Code

What changed and why: <!-- two or three sentences; the request or roadmap task -->

Requested by: <!-- AGENTS.md, top -->

Questions for a website owner: <!-- rule 8, schema, scope, redirects. "None" if none -->

- [ ] `./scripts/verify.sh --build`: N FAIL, N WARN; each warning and what I did:
- [ ] Routes fetched from the built site, with status; internal links in changed markup that resolve: N of N
- [ ] `npm run visual:compare`: N of 60 the same; each page that changed, and why:
- [ ] Rendered HTML compared against `main` (refactors only). Differences:

Reviewer's findings, unchanged, and what I did about each:

What I could not check. Please look (phone = 390px, desktop = 1280px):

| Route | Width | Look at / click | Expected |
|---|---|---|---|
| | | | |

Corrections during the work (from the log):

Noticed, not done (with the full cost):
