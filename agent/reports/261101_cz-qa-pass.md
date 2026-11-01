# Critical Zone: quality pass on the merged pages

1 November 2026, fork `main` at 72ca62f (after PRs 198 and 199). Epic CUAHSI/CUAHSI3-website#62. Read-only: nothing in the site changed. Run on a fresh `npm run build:search` of that commit.

## What was checked, and the result

| Check | Result |
|---|---|
| `node scripts/check-links.mjs` | 186 HTML files, 8,111 internal references, 599 distinct targets, 0 unresolved |
| `node scripts/check-redirects.mjs` | 321 rules, 65 distinct targets, all resolve |
| `npm run validate:content` | 0 YAML failures, 0 schema failures, 0 cross-reference problems; 18 informational unresolved values (unchanged) |
| `npm run visual:compare` | 60 of 60 pass |
| Seven Critical Zone and related routes on the built site (`/critical-zone-science`, `/papers`, `/datasets`, `/about`, `/network`, `/observatories`, and `/about/impact/agu-community-gathering-2025`) | all 200 |
| AGU redirect | `_redirects` in the build has the rule `/about/impact/agu-community-gathering-2026 -> ...-2025 301`. The static server used here does not read `_redirects`, so the redirect itself was **not seen working**; only the rule is confirmed. |
| Keyboard focus, highlight links | Pressed Tab on `/critical-zone-science`; focus landed on a highlight link, which showed a solid 2px blue outline (offset 2px) on that one link and an underline. One link tested of 40. |
| Accessible name of a highlight link | The link holds an `aria-hidden` arrow and a screen-reader-only " (opens in a new tab)". Read from the DOM; **no screen reader was run.** |

## Every link in the products list

All 2,591 records in `content/critical-zone/products.json` carry a link, checked 1 November 2026:

- 1,505 have a DOI: each answered `responseCode` 1 at `https://doi.org/api/handles/<doi>` (1,505 of 1,505).
- 1,086 have only a URL (492 CZO archive, 582 HydroShare, 12 others): 1,085 answered 200 and 1 answered 202 (1,086 of 1,086 below 400).

The check can fail: a made-up DOI (`10.9999/not-a-real-doi`) answers `responseCode` 100, and a made-up archive path and a made-up HydroShare resource each answer 404. Samples read: the first three URL records and the first two DOI records of the result file (`i` 0, 1, 3, 11, 12). A 200 or a registered DOI says the link resolves; it does not say the page is about the title in the record. That was not checked.

The 492 archive links go to a site that retires in August 2027 (the date is decision 5 in `261031_cz-golive-approvals.md`); this check must be run again before then.

## Content lint (the whole site, not only this section)

- Jobs: 149 files, 72 published; 1 published job past its deadline (`261020-utah-department-of-environment-director-division-of-drinking-water.md`, deadline 31 October 2026); 0 published without a `source`; 0 files whose front matter does not parse. Whether the job board hides a job past its deadline was not checked in this pass.
- Events: 45 files, all published; 2 are `featured` and have ended (`260601-virtual-open-house.md`, `260701-watersofthack.md`).
- Unpublished items in news, events, jobs, research and cyberseminars: 81. Their age (the 60-day test) was not computed.
- Awards: 81 registry entries no story uses (informational, not a failure).

## Not checked

The AGU redirect on Netlify; a screen reader on any page; keyboard focus on more than one highlight link; what the 72 published jobs look like on the board; the age of the 81 unpublished items.

## Noticed while doing it

An old static server from an earlier session was still listening on port 4000 (node, pid 81157) and served an older build that still logs `CZDBG` debug lines to the browser console. My first route probe and first browser check hit it, not the fresh build, and the page appeared to lack the highlights. I found it because the served HTML disagreed with the built file, and redid the checks on a fresh server. It is local to this machine and not in the repository; it is not stopped here because I did not start it in this task.
