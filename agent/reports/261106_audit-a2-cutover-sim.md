# A2: Cut-over simulation. Where does each legacy URL land on the new site?

Site audit task A2 (org issue 101, epic 99), 6 November 2026. Read-only. Built from this branch (the fork's main at 91b9226). The rule file `public/_redirects` is identical to the organisation's main (checked with `git diff` on 6 November: no difference); the pages may differ slightly, because the fork is ahead of the organisation by PRs 201 to 206. 322 rules: 322 lines in `public/_redirects` plus one in `netlify.toml`, less one line that is the percent-encoded copy of another. Outputs: `agent/audit/cutover-261106-urls.csv` (927 rows), `-numbers.json` and `-control.txt`. Scripts: `scripts/parity/cutover-sim.mjs` (the simulation, no network) and `cutover-control.mjs` (the control against the deployed prototype).

## The answer in one paragraph

**As the site stands today, most legacy addresses would not land anywhere.** Of the **761** legacy pages that answer 200 now, **496 (65%) would answer 404** on the new site; 253 (33%) would be redirected to one of three pages (graduate programs, the portals catalog, the documents page); 7 would go to a hub page; 5 exist at the same path. Measured in Google search clicks (Search Console, last 12 months, from the export's `www.cuahsi.org` rows), **9,460 of the 14,775 clicks (64%) on those 761 pages** go to pages that would 404, and across all 569 `www` paths in the export **10,499 of 15,918 (66%)** do. That includes the second, third and fourth most visited pages in the export (`/job-board`, `/summer-institute`, `/data-services/matlab`). The export covers search visits only, and only the 1,000 rows that fit its limit (finding 6): direct, bookmarked and linked visits are not in it. The reason is not a bug: redirects exist for the three bodies of work Jordan ruled on and built in October (253 of their 273 pages), for 7 faculty and student pages (to `/learn-train`), for 22 hosted documents and for `/archive`; the other bodies of work have none, because their fate is still a proposal or their page is not built. This is the number to bring down before cut-over.

## What was run

- **Rules:** every line of `public/_redirects` (322: 321 exact-path 301s and one external rewrite) and the one rule in `netlify.toml` (`/archive` to the newsletter page). No wildcard or placeholder rules exist. How the host matches them was checked on the deployed prototype (control B): a trailing slash does not matter, the match is case-sensitive, and a query string reaches the target.
- **Built site:** `npm run build:search` of this branch; a final path counts as a page when `.output/public` has the file, `<path>.html` or `<path>/index.html`, matched in the exact case on any file system. One path matches only when case is ignored (`/About`; `case_variant` in the CSV): the host serves it after a 301 to the page's own spelling (observed on the prototype: `/About` goes to `/about/`).
- **URL list, 927 paths:** the 782 from the 6 November crawl (A1), the 47 cited in this site's newsletters and content (the October list), and 569 from the Search Console export (the `www.cuahsi.org` rows, with http, https and trailing-slash variants of one path added together; query strings are dropped for matching, and 1 row has one). Each row keeps flags for which lists it came from. "Last 12 months" and "Web (text-based)" are from `Filters.csv` in the export's zip; the script reads only `Pages.csv`.
- **Classes** (first that applies): external, stub, dead (a rule to a missing page), 404, chain (more than one redirect), generic (one redirect to a hub page), many-to-one (one redirect to a page 10 or more of the listed URLs land on; that count depends on the list, so a re-run with more URLs can move a page into it), redirect, same-path.

## Results

| | the 761 legacy pages answering 200 | clicks on those 761 pages (14,775) | clicks on all 569 `www` paths in the export (15,918) |
|---|---|---|---|
| **404** (no rule, no page) | 496 | 9,460 | 10,499 |
| many-to-one (graduate programs, portals, documents) | 253 | 2,091 | 2,091 |
| generic (to `/learn-train`) | 7 | 88 | 88 |
| redirect (one rule to a page; hosted PDFs) | 0 | 0 | 97 |
| same-path | 5 | 3,136 | 3,143 |
| chain, dead, external, stub | 0 | 0 | 0 |

The same-path clicks are mostly the home page (3,017). The 142 export paths that are not in the crawl are in finding 3.

**By body of work, over the 761 pages (October's bodies; the fates are proposals unless noted):**

| body | pages | would 404 | clicks on those | clicks on all its pages | fate (status) |
|---|---|---|---|---|---|
| Job board | 9 | 9 | 1,643 | 1,643 | migrated (proposed) |
| Data services and software (tools) | 7 | 7 | 1,477 | 1,477 | merged (proposed) |
| Programs and research projects | 6 | 6 | 1,459 | 1,459 | migrated (proposed) |
| Staff directory and profiles | 23 | 23 | 1,070 | 1,070 | migrated (proposed) |
| Workshops and short courses | 24 | 24 | 944 | 944 | merged (proposed) |
| Events (upcoming and past) | 118 | 118 | 811 | 811 | merged (proposed) |
| Cyberseminar archive | 89 | 89 | 421 | 421 | migrated (proposed) |
| News posts | 56 | 54 | 410 | 449 | merged (proposed) |
| About, governance, membership and contact | 5 | 4 | 306 | 367 | migrated (proposed) |
| Grant and fellowship opportunities | 1 | 1 | 247 | 247 | migrated (proposed) |
| Water Science Exchange | 1 | 1 | 152 | 152 | merged (proposed) |
| e-Newsletters and guest spotlights | 19 | 19 | 129 | 129 | merged (proposed) |
| Other small pages | 6 | 6 | 107 | 107 | migrated (proposed) |
| Guest lecturer database | 81 | 81 | 102 | 102 | migrated (proposed) |
| no October body (added since: 10 job postings, 3 events, 2 news items, 1 workshop) | 16 | 16 | 69 | 69 | none |
| Document library | 87 | 20 | 29 | 117 | migrated (ruled and built) |
| Research data management guide and FAQ | 2 | 2 | 29 | 29 | migrated (proposed) |
| Instrumentation facilities | 11 | 11 | 27 | 27 | merged (proposed) |
| Policies and conduct | 4 | 4 | 22 | 22 | migrated (proposed) |
| Donate | 1 | 1 | 6 | 6 | merged (proposed) |
| Graduate programs directory | 137 | 0 | 0 | 1,771 | migrated (ruled and built) |
| Water data portals catalog | 49 | 0 | 0 | 232 | migrated (ruled and built) |
| Faculty resources | 4 | 0 | 0 | 72 | merged (proposed) |
| Student resources | 3 | 0 | 0 | 16 | merged (proposed) |
| Home page and section landing pages | 2 | 0 | 0 | 3,036 | migrated (proposed) |
| **all (25 rows)** | **761** | **496** | **9,460** | **14,775** | |

**The ten pages with most clicks that would 404:** `/job-board` 1,442; `/summer-institute` 1,045; `/data-services/matlab` 1,001; `/about/our-team` 345; `/workshops/snow-measurement-field-school-2026` 301; `/workshops/hydrolearn-ciroh-may-june-2026-workshop-and-hackathon` 289; `/virtual-university` 281; `/data-services/hydroshare` 260; `/grant-opportunities` 247; and a staff profile page, 224.

**Fate status of the 761 pages:** 472 are in bodies whose fate is still a proposal, 273 are in the three bodies ruled and built in October, 16 belong to no October body (the pages added since). Clicks by fate status are over all 569 export paths, not the 761: proposed 12,759, ruled and built 2,120, no body 1,039 (that includes the 22 hosted documents, `/About` and the 16 added pages). The ten October decisions are treated as unchanged, as decided on 6 November, so "fate proposed" is reported and not judged.

## Findings

1. **The three finished bodies are covered, with 20 gaps.** 253 of the 273 legacy URLs in them have a redirect that lands on a page: graduate programs 137 of 137, portals 49 of 49, document library 67 of 87. The 20 without are the Summer Institute and technical reports and early documents that the 6 October status page said were not built yet (29 clicks in all).
2. **46 of the 47 URLs this site's own content cites would 404, but only 27 of them are known to be live today.** The 47 are legacy addresses linked from newsletters, events and news items in `content/` (the October "cited" list). Of the 28 that answer 200 on the legacy site now, 27 would 404 after cut-over (the one that survives is the home page). The other 19 are not pages the crawl fetched: 17 have no crawl status (files such as the hosted PDFs), one answers 302 and one already answers 404. After cut-over, those links in published newsletters break unless a redirect or a corrected link exists.
3. **142 export paths are not in the crawl** (old addresses with search traffic; 970 clicks): 119 would 404 (866 clicks), 22 are hosted documents that redirect (97 clicks), 1 exists (`/About`). These need a decision per body in A3, because the crawl does not know them.
4. **No chains, no dead redirects, no stubs:** every redirect rule goes to a page that exists in one hop. The 25 redirect targets in the control also end in 200 on the prototype.
5. **Case.** A rule is case-sensitive (`/UPLOADS/...` of a redirected path answers 404), while the host serves a page whatever the case (`/About` goes to `/about/`). One path in the list is a case variant (`/About`, 7 clicks). How many case variants of legacy addresses are linked from outside is not known.
6. **The Search Console export is cut at its limit and covers more than www.cuahsi.org.** The file has **exactly 1,000 rows** (I wrote 1,003 earlier on issues 99 and 101, a count of lines; corrected there). It is a Domain property, so 572 rows are `www.cuahsi.org` (15,918 of the file's 17,515 clicks, 91%) and 428 rows are on 13 other hosts: `hydroshare.cuahsi.org` 300 rows (431 clicks), `hiscentral.cuahsi.org` 42 (426), `his.cuahsi.org` 33 (408), `help.cuahsi.org` 28 (113), `data.cuahsi.org` 3 (96), `subset.cuahsi.org` 6 (52), `hydroserver.cuahsi.org` 5 (37), `jupyterhub.cuahsi.org` 1 (20), and smaller ones; together 1,597 clicks (9%). The `www` rows therefore stop at the 1,000-row cut and the long tail is not here. The other hosts are outside this audit's scope (`www` only); whether their addresses need a plan at cut-over is a question for A7 and for Jordan.

## Controls (committed output: `agent/audit/cutover-261106-control.txt`)

- **A. The simulation against the deployed prototype:** 50 legacy paths (12 many-to-one, 6 redirect, 7 generic, 5 same-path, 20 of the 404 class: the 10 with most clicks and 10 spread evenly) were requested on `cuahsi3-website.netlify.app`, one second apart. **50 of 50 agree** (the status, and for redirects the target). **For the 25 sampled redirects the target was requested too: 25 of 25 end in 200.** A page that exists is often served after a 301 that only adds a slash (`/about` to `/about/`), which lands on the page and is counted as agreeing; four of the 50 did. The prototype is built from the organisation's main (same rule file, pages possibly a little behind the fork).
- **B. How rules match:** three redirected paths each requested with a trailing slash, in upper case and with a query string: **9 of 9** as expected (301, 404, and 301 with `?x=1` kept on the target).
- **C. The three finished bodies:** 253 of 273 with a redirect (finding 1); the 20 without are the ones the status page named.
- **D. The script against the raw export:** the total clicks for the `www` rows in the script's output (15,918) equals the sum of the file's 572 `www` rows computed separately. (The first run gave 11,461: rows for one path overwrote each other; fixed, see the log.)

**The sample read by hand (rule 12):** would 404, checked on the prototype: `/job-board`, `/summer-institute`, `/data-services/matlab` (each answers 404; CSV rows opened for all three); would redirect: `/community/water-data-portals/eurostat-water-statistics` to `/data-platforms/portals`, `/uploads/library/doc/2021-02_Minutes.pdf` to the hosted minutes PDF, and a graduate-programs page to `/learn-train/graduate-programs` (each 301, target 200); exists: `/` and `/community` (200 or a slash redirect). "Lands" means a page exists at the target. Whether it is the right page for that visitor is not what this task measured.

## Not examined

- **Whether a redirect's target is the right page,** only that it exists. The three many-to-one targets fold hundreds of pages into one by design.
- **The long tail of Search Console** beyond the 1,000-row cut, and any other address that people have bookmarked or other sites link to (no backlink data). Direct and referred visits are not in the export.
- **URLs with query strings:** 1 `www` row has one and is summed into its base path; the legacy pager (`?page=N`) was not mapped.
- **The other 13 hosts** (428 rows, 1,597 clicks): out of scope.
- **Meta-refresh stubs under `/highlights/`:** they are addresses on the new site, not legacy ones.
- **Case variants** of legacy addresses linked from outside: not known (one in the list).
- The 16 pages with no October body are classified but have no fate to compare with.
- **A case-sensitive file system:** the script was run on macOS only; the exact-case lookup is meant to give the same answer on Linux, and was not run there.

## What this means for the next steps

- Cut-over cannot happen with 496 of 761 legacy pages answering 404. Which bodies get a redirect, a page or a retirement is the decision list of October's stage 7, now with traffic attached (sort the CSV by `clicks` to rank).
- A3 (per type) decides for each page whether it is migrated, merged or retired, and A7 turns the answers into one redirect list and a rehearsal. A2 should be re-run after each batch of redirects and on the day before cut-over (`cutover-sim.mjs` takes the new crawl's CSV).
