# Critical Zone legacy sites: retirement checklist and the part of the dry run that can be done now (T16)

31 October 2026. Epic CUAHSI/CUAHSI3-website#62, ticket T16. A checklist and a partial dry run; **nothing is redirected, changed or configured**. Build: `main` at `d231e2f`. Facts about the hosts are in `261031_cz-golive-approvals.md` (section A); the redirect map is `261031_cz-redirect-map.md`. The steps that need an account or your approval are marked **[you]**.

## Dry run: what I could check without access

| Check | Result | How |
|---|---|---|
| Every section-level target in the redirect map exists in the build | 10 of 10 observatory pages, the front page, about, datasets, papers and network pages: all present | file exists in `.output/public/critical-zone-science/...` |
| Every `#cluster-...` anchor the map relies on exists on the network page | 10 of 10 (`hub`, `bedrock`, `dust2`, `bigdata`, `dynamic-water`, `cinet`, `drylands`, `coastal`, `urban`, `geomicrobiology`) | the `id` attribute is in the built HTML |
| The legacy path groups in the map still answer | archive: 11 of 12 paths answer 200 (`shale-hills`, `sierra`, `calhoun`, `luquillo`, `catalina-jemez`, `boulder`, `christina`, `iml`, `reynolds`, `eel`, `national`); `/jemez-catalina` answers 404. CZNet: 15 of 17 answer 200 (the ten clusters, `publications`, `data`, `about`, `people`, `news-events`); `/people-roles` and `/nsfczo` answer 404 | `curl`, following redirects, 31 October 2026 |
| The home pages hold no path group that the map lacks | none on either site (archive: only `/assets`, `/stylesheets`, `/favicon.ico`; CZNet: nothing outside the 25 groups of the inventory) | links on each home page against the T1 inventory |

The three paths that answer 404 are `/jemez-catalina` (the map calls it a stray path), `/nsfczo` (the map notes that its page answered 404 in T1) and `/people-roles` (not noted before). The map sends all three somewhere in the section; a redirect from a dead path is harmless.

What this does **not** show: that a redirect works (none exists), that Netlify keeps a `#fragment` through a redirect (to test, not assume), and anything about Discover's paths (not requested).

Two facts for the cutover, from the live hosts: the archive's own `sitemap.xml` answers with a Google Cloud Storage `NoSuchKey` error, so the archive is a static bucket with no sitemap; `criticalzone.org` has none either (a "Page not found"). So the inventory (T1, 10,671 URLs) is the only list of what exists.

## The checklist

Before anything is switched off, in this order.

1. **Snapshot refresh [you decide, I run]** (T16 item 1, and decision 9 in the approvals report). Re-crawl both sites and Discover, deposit the archive with a DOI, link it from the finding aid. Discover is a JavaScript app, so it needs a browser crawl; this is the riskiest step to leave late. Done when: the crawl is compared with T1 (counts by section) and the deposit has a DOI.
   - **The files the pages link to, not only the pages** (added 16 November 2026 at Jordan's request). The crawls saved HTML only. The archive hosts PDFs under `/images/national/associated-files/`: the observatories' NSF annual and interim reports (80 of the 81 report records link one), and theses, proceedings and other grey literature (170 papers with no DOI, out of the 492 whose only link is their archive page, have an archive page that links such a PDF; counted from `.agent/crawl*/html` on 16 November). The fork branch content/cz-paper-journals removes from the papers list the records that will have nothing to point to once the archive goes, the reports among them (Jordan's rule of 16 November; 248 records with nothing to point to, plus 17 duplicates and preprints, all listed in `agent/reports/261116_cz-paper-journals-proposal.md`); their files must be kept for later retrieval and possible inclusion. Download every `associated-files` PDF (and any other file the archive hosts) into the deposit, with a list mapping each file to its archive page and title. Done when: the list's count equals the count of PDF links in the final crawl, and the deposit holding them has a DOI.
2. **Final re-crawl for new pages.** Compare against T1 and add any new path group to the map. The home-page check above found none today; repeat it at the time.
3. **Decisions 1 to 4 confirmed [you]** (redirect targets for `national`, `/people*`, `/news-events`, Discover).
4. **Site address set, sitemap and canonical links** (T7b, rule 8 **[you]**), so the new pages can be found when the old ones go.
5. **Redirect tooling** (code PR, rule 8 **[you]**): host-aware rules in the generator and the checker, tested with the existing redirect check. Done when: the checker passes with host rules, and a test lists each map row and its target.
6. **Name the DNS owner [you]:** the GoDaddy account for `criticalzone.org`, and the administrator of the Google Cloud project behind the archive and Discover (approvals report, section A).
7. **Cutover order.** (a) `criticalzone.org`, already on Netlify, first: add it as a domain alias of this site and publish the host rules. (b) Archive. (c) Discover and its API host `contribute.criticalzone.org`: **do not redirect the API host before checking what still calls it** (I did not look into what calls it). Test each step before the next.
8. **After each step:** request every row of the redirect map from the live host and compare with the target; 200 on the target, one redirect hop, no loop. Done when: 0 of N failing, with N stated.
9. **Keep the redirects.** Retirement is of the old sites, not of their addresses; do not let the domains lapse.
10. **T17 (after go-live):** page-level redirects for the most-visited pages (publication pages to their DOIs), chosen from real traffic.

## Not checked

Discover's own paths. Whether any other service calls `contribute.criticalzone.org`. Who runs the Google Cloud project. Whether the three legacy hosts have traffic worth planning around (no analytics access). Redirect behaviour with query strings and trailing slashes.
