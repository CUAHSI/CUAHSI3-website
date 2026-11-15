# Audit A3f: jobs and workshops, legacy site against this site (9 November 2026)

Org issue 107, part of the site audit (epic 99). Read-only on both sites; nothing is fixed here. The legacy side is the snapshot of 6 November 2026 (`raw/legacy-site/261106/pages`: 14 job pages and 4 job listing pages, 21 workshop pages) plus the addresses A2's file knows (`agent/audit/cutover-261106-urls.csv`). This side is `content/jobs/` (149 files), `content/events/`, `content/research/`, `content/news/` and `content/programs/`. The live web was read on 9 November 2026 with plain GET requests (`scripts/parity/a3f-live-check.mjs`). Script: `scripts/parity/a3f-jobs-workshops.mjs`; data files `agent/audit/a3f-*-261106.csv` and `a3f-numbers-261106.json`.

## The answer in one paragraph

**The new site does not carry the legacy job board, and carries few of the legacy workshops; at cut-over (A2's simulation) every legacy address for both ends in a 404.** Of 86 legacy job addresses (14 pages the legacy board shows now, 9 earlier ones it has taken down, 63 known only from search clicks), **9 match a job here exactly, 13 weakly and 64 not at all**. Of the 14 the legacy board lists today, 2 are here exactly (the UC Irvine postdoctoral scholar and the CW3E hydrologist), 9 have nothing here, and 3 have only a weak pairing (by my reading two of those are right, both Northwestern jobs with abbreviated titles, and one is wrong, a SUNY job paired with a Stanford job): so 9 to 10 of the 14 are not here. Of the 149 job files here, 9 match a legacy address exactly (6 of them because they point at the legacy site), 13 weakly and 127 not at all; 105 of the 149 come from `joshswaterjobs`. Of 21 legacy workshop pages, **5 have a counterpart here (2 exact, 3 probable) and 16 have none**: 4 of the 16 are older years of the Snow Measurement Field School, for which a program page of the series exists here; 12 (2019 to 2023) are not on this site. **Posting links:** of 149 job files, 8 link to a posting that answers 404, **all 8 unpublished** (6 of them point at the legacy site's own dead addresses); none of the 72 published jobs has a dead link (71 live, 1 moved to another domain). **The eight cited addresses each answer 404 on the live legacy site.** Two are still written in this site's files: the WaterSoftHack program file's `apply_url` (no page shows it) and the registration link of a past event (hidden for past events). The legacy `/job-board` (1,442 search clicks) and `/workshops` pages (974) have no redirect.

## 1. What was compared, and how matches were decided

- **Legacy jobs, 86 addresses:** 14 job pages in the snapshot (the legacy listing shows 10 + 4 = 14), the 13 pages October typed `job` (4 still on the site, 9 gone: A1's "9 job postings removed"), and 63 `/job-board/<name>` addresses that appear in A2's file (search clicks or citations) and have no page. For the 63 the only text is the address words (`title_from` in the data says which). Year pages (`/job-board/2023`, `2025`, `2026`), the three category pages and the listing are not jobs and are counted separately.
- **This side:** 149 job files, 72 published, 77 not (`published: false`); `source` is `joshswaterjobs` 105, `usajobs` 27, `agu` 5, `newsletter` 6, none 6.
- **Legacy workshops, 21 pages** under `/workshops/`: the 20 October typed `workshop` and one added since (the Skills Certificate Pilot). The workshops listing, `past-workshops` and `propose-a-workshop` are not workshops. The issue says 20; I count 21 and say so.
- **Candidates here for a workshop:** every file in `content/events/`, `content/research/` and `content/news/`; `content/programs/` is used only as a series page (the program title is inside the legacy title).
- **Levels** are October's scale (`agent/reports/261005_parity-stage4.md`, section 1) and never raised to improve a number; I added three rules, listed below, that lower a level or add a weak match (never a probable or exact one). *exact* the title is the same once case, accents and punctuation are ignored; for a job also when its apply link equals the posting link here or when the posting link here is the legacy address itself. *probable* the title words overlap by 0.6 or more and the two dates are within 30 days; **the legacy side must have a date, so an address known only by words stays weak** (the first run gave two probables from address words; they are weak now). *weak* 0.4 or more, or **an addition of mine**, an employer-and-title rule (title overlap 0.3 and the employer names share half their words, ignoring words such as "university" and "institute"; 1 of the 13 weak jobs comes from it). *none*. "Matched" means exact or probable. Each legacy item is paired with at most one item here, best pairs first (the employer breaks ties). **A demotion, also mine:** a title-only probable becomes weak when both employers are known and share no word (the first run paired a SUNY Plattsburgh job with a Stanford job). **For workshops** the rule is the same except that a missing legacy date would not stop a probable; all 21 workshop pages have a start date, so it made no difference.
- **Facts compared for a matched job:** employer, posted date, deadline, apply link, whether the posting link here answers, and whether the job is published here. Legacy pages carry no location. **For a workshop:** start and end date, location.
- **Contact details:** on 12 of the 14 job pages the legacy page has a hidden address (counted, never decoded); the new job files have no contact field. No address or telephone number is in any committed file.
- **Live checks (9 November 2026):** the posting link of each of the 149 job files, the apply link of the 12 legacy job pages that have one, and the eight cited addresses. Verdicts: live (a 2xx page), moved (ends on another address), dead (404, 410 or a DNS failure), blocked (401, 403, 429), error. A "live" link says the address answers, not that the job is still open.

## 2. Counts

**Jobs** (86 legacy addresses)

| Legacy addresses | exact | probable | weak | none |
|---|---|---|---|---|
| in the snapshot now (14) | 2 | 0 | 3 | 9 |
| not in the snapshot: taken down, or known only from clicks (72) | 7 | 0 | 10 | 55 |
| **all 86** | **9** | **0** | **13** | **64** |

- **The 9 exact:** 6 because the posting link here is the legacy address itself (all 6 unpublished, all dead: section 5), 2 because the apply link on the legacy page equals the posting link here (UC Irvine and CW3E), 1 because the title is the same (the Research Director of the National Alliance for Water Innovation, posted 14 August there and 23 October here, 70 days apart: it may be a re-post).
- **The 13 weak** are title overlaps of 0.4 to 1.0 (the two at 0.67 and 1.0 are address-word matches capped at weak because the legacy side has no date, and one at 0.67 was demoted for a different employer) or, for one, an employer-and-title match. Of the 3 weak among the 14 current pages, by hand reading 2 are right (the two Northwestern professorships) and 1 is wrong (a SUNY job paired with a Stanford job): weak is not evidence, and I leave all three as weak. Among the 63 addresses known only by words: 6 exact, 10 weak, 47 none; among the 9 earlier pages taken down: 1 exact, 8 none.
- Job files here: **9 of 149 match a legacy address exactly** and 13 weakly (together 22: 9 published, 13 not); **127 have no legacy counterpart at all**.
- For the 9 exact pairs: employer the same or overlapping where the legacy page names one (2 of 2); apply link the same (2 of 2 with a link); deadline the same (1 of 1 where the legacy page has one); posted date 7, 8 and 70 days apart (the 3 that have a date on both sides).
- **Legacy jobs by address that were not job pages** (not counted above): 3 year pages (`/job-board/2023`, `2025`, `2026`; 71 clicks), 3 category pages and the listing: nothing here corresponds to them.

**Workshops** (21 legacy pages)

| Legacy workshops | exact | probable | weak | none |
|---|---|---|---|---|
| all 21 | **2** | **3** | 0 | **16** |

- The 5 matched: Snow Measurement Field School 2026 and 2027 (exact; events here), the Skills Certificate Pilot and the HydroLearn-CIROH workshop (probable; events here), the Stakeholder-informed spatial modeling workshop (probable; an impact story here). Start date the same for 4 of the 5 matched (the spatial modeling story is dated one day after the legacy page); end date the same for 3 of the 4 that have an end date on both sides (HydroLearn: June 8 in the legacy date line and June 11 in its text, June 11 here).
- The 16 none, by year: 2019 6, 2021 2, 2022 4, 2023 2, 2024 1, 2025 1. **4 are Snow Measurement Field School years (2022, 2023, 2024, 2025)** for which `content/programs/snow-field-school.md` is the series page here; the other **12 have nothing on this site**.
- Events here of type `workshop`: 13; **4 match a legacy page, 9 do not** (new since the legacy pages, or recurring: WaterSoftHack, HydroLearn, the near-surface geophysics workshop and others).

**Posting links of the jobs here (149)**

| Verdict | Published (72) | Not published (77) |
|---|---|---|
| live | 71 | 68 |
| moved | 1 | 0 |
| blocked (a bot-check page) | 0 | 1 |
| dead | **0** | **8** |

The 8 dead: the 6 legacy-host addresses (section 5), one Alabama postdoctoral fellowship and the CW3E hydrologist. The 1 moved: Sonoma County (a published job; the same path on another domain, `sonomacounty.gov`). The 1 blocked: a Minnesota job whose site answers with a bot-check page (unchecked).

**Legacy listing: the apply links of the 12 job pages that have one** (the other 2 have none): 7 live, 2 moved, 1 blocked, 1 dead (CW3E, which the legacy board still shows, with no deadline), 1 error (the Northwestern assistant or associate professor page has an address the check could not read).

**The eight cited addresses** (`/job-board/field-ecohydrologist`, `planner-project-manager`, `river-spill-response-fellow`, `stormwater-management-research-postdoctoral-scholar`, `water-resources-fellow`, `water-resources-planning-intern`, `/apply/watersofthack`, `/register/open-house`): **8 of 8 answer 404** on the live legacy site on 9 November 2026; a 404 page gives no title to read.

**Cut-over** (A2's simulation; clicks are floors, the export keeps 1,000 rows)

| Legacy addresses | Count | Clicks | Outcome |
|---|---|---|---|
| the job board family (`/job-board`, jobs, year pages, `/community/job-board`) | 95 | 2,251 | all 95 end in 404 |
| of which `/job-board` | 1 | 1,442 | 404 |
| of which the 14 job pages the legacy board shows now | 14 | 44 | 404 |
| `/workshops/...` | 28 | 974 | all 28 end in 404 |
| of which the 21 workshop pages | 21 | 893 | 404 |

## 3. Control (written before the script was run)

`agent/audit/a3f-hand-match-261109.csv`: 15 items matched by hand before the script existed (the file was written first; that rests on my word): 7 jobs (4 called matched, 3 none) and 8 workshops (5 matched, 3 none). The script agreed on **13 of 15**. The two differences are the Northwestern jobs: "Assoc/Full Prof in Environmental Science" (here "Assoc/Full Professor in Environmental Sciences") and "Assistant or Associate Professor" (here "Tenure-Track Assistant or Associate Professor in Water Data Science"). By title words they overlap 0.5 and 0.4, so the scale calls them weak, and I called them matched from the employer and the subject. The control therefore found that the scale undercounts abbreviated titles, and (in the first run) that a probable can be a different employer's job. It is a weak control: it holds only 2 hard jobs, it was written by the same reader who wrote the rules, and the one hard case it found was a pairing the first run got wrong (SUNY and Stanford). The two differences it shows are the scale's: abbreviated titles overlap too little to be probable, and the employer only adds a weak match.

## 4. Six items read by hand

**Called matched (3):**

1. **Postdoctoral Scholar in Terrestrial Hydrology and Remote Sensing (UC Irvine).** Legacy page: posted 1 October 2026, deadline 31 December 2026, apply link a UC Irvine recruitment address, a hidden contact. Here: `261008-uci-earth-system-science-postdoc.md`, published, posted 8 October, deadline 31 December, the same address, and the address answers. Exact; employer written as "Department of Earth System Science, University of California, Irvine" here.
2. **Snow Measurement Field School 2026.** Legacy page: 5 to 9 January 2026, Granby, CO; it says the application period has closed. Here: `events/260101-snow-field-school.md`, the same dates, "Granby, CO, in-person". Exact. The legacy page lists seven instructors by name; I did not compare them (section 6).
3. **HydroLearn-CIROH May/June 2026 Workshop and Hackathon.** Legacy: the page's date line reads 27 May to 8 June 2026, but its own "Event Dates" paragraph says the in-person workshop is May 27 to 29 and the virtual hackathon June 2 to 5 and June 8 to 11. Here "HydroLearn-CIROH 2026 Workshop and Hackathon", 27 May to 11 June, hybrid in Salt Lake City. Probable (title overlap 0.75, same start). **The end dates differ, and the legacy page disagrees with itself (June 8 in its date line, June 11 in its text); this site agrees with the text.** Both locations are given; which is right is for Jordan.

**Called missing (3):**

4. **Postdoctoral Associate in Machine Learning and Remote Sensing for Global Infrastructure Mapping (Cornell).** Legacy page posted 5 November 2026, no deadline; its apply link (a project site) answers. No Cornell job and no job with that title here; it was posted after the newest job file here (30 October), so the weekly harvest may simply not have reached it.
5. **Assistant Professor, Hydrology (SUNY Plattsburgh).** Posted 20 October, deadline 8 November; the apply link answers. Nothing here with that title or employer, though the dates fall inside the range the job files cover (April to October). This one was not caught.
6. **Surface Water Field School (2022).** Legacy page: 1 to 5 August 2022, University of Oregon, with named instructors. Nothing of that name or topic anywhere in `content/`. The address ends in 404 at cut-over.

## 5. Findings

1. **9 to 10 of the 14 jobs the legacy board shows now are not on this site (9 have no pairing, one more is only paired wrongly), and the board's address goes nowhere.** `/job-board` has 1,442 recorded clicks and ends in a 404; so do the 94 other job-board addresses (809 clicks). There is no redirect (`public/_redirects` holds no rule for `/job-board` or `/workshops`).
2. **The new board was not built from the legacy board.** 105 of 149 job files are from `joshswaterjobs`, 27 from USAJOBS; 9 match a legacy address exactly, and 6 of those 9 are jobs that point *at* the legacy site. Whether the legacy board's own postings should come across is a decision (section 8).
3. **Six job files here link to the legacy site's job-board addresses, all unpublished, all dead.** `260401-icprb-spill-fellow.md`, `260401-icprb-water-resources-fellow.md`, `260401-minnehaha-planner.md`, `260501-kgs-field-ecohydrologist.md`, `260501-seattle-water-intern.md`, `260501-uvm-stormwater-postdoc.md`. They show nowhere because they are unpublished.
4. **No published job has a dead posting link** (0 of 72; 71 live, 1 moved to another domain). The 8 dead links are all in unpublished files, which suggests unpublished means closed; I did not check that.
5. **The legacy board still lists a job whose posting is gone.** CW3E's Research and Operations Hydrologist is on the legacy listing; its apply link answers 404; here it is unpublished (deadline 12 October). The two sides do not say the same: the legacy board lists it with no deadline and no closing note, and this site hides it; the dead apply link says it is closed.
6. **The eight cited addresses are all dead, and two are still used here.** The six job ones are findings 3. `/apply/watersofthack` is the `apply_url` of `content/programs/watersofthack.md`, a field no page reads (I searched `pages/`, `components/` and `composables/`), so a reader never sees it. `/register/open-house` is the registration link of a past event (the Virtual Open House, 24 June 2026); the event page shows a registration button only for events not yet past, so it is hidden now. `scripts/parity/redirects.mjs` says these two return 404 on purpose.
7. **Workshops: 12 of 21 legacy pages have no counterpart.** Six are from 2019 (master classes, short courses and bootcamps), 2 from 2021 (the WRF-Hydro training and the sensor workshop), 3 from 2022, 1 from 2023 (the PFLOTRAN course). All 21 legacy workshop pages end in 404 at cut-over (893 clicks). The 4 Snow Field School years from 2022 to 2025 have no page of their own here; the program page is where a reader would land if redirected.

## 6. Not examined

- **Text of the job pages beyond title, employer, dates, apply link and level:** the 14 legacy job pages were not compared with the files here; the 22 pairs were not read in full.
- **63 legacy job addresses are known only by their address words** (no page, no date, no employer). Their levels, 6 exact and 10 weak, rest on those words, and the 6 exact are the jobs here that link to the legacy address.
- **Whether a "live" job posting is still open** (139 of 149 answered): only the status was read.
- **Workshop details:** instructors, schedule, fees, application status and the registration pages of the 21 pages; locations were compared only for the 4 pairs that have one.
- **Probable duplicates of a different kind:** Texas State University has one job here ("Fully Funded PhD Position in Hydrology", 30 October) and one on the legacy board ("PhD/MS Assistantship in Spatial Hydrology or Riverscape Health", 16 October). Same employer, different title; I did not read the texts to say whether they are one job.
- **Legacy year pages and category pages** of the job board (3 + 3) and the listing.
- **Whether the legacy site's apply links** (12) point at jobs that are open.

## 7. Limits of the method

- Matching is by title words, an employer rule and dates; it never reads descriptions. For abbreviated or rewritten titles (as the control showed) it undercounts.
- "Weak" jobs are not evidence (13 of them; at least 1 of the 3 current ones is known wrong). I report them as weak and do not count them as matched.
- One legacy item is paired with at most one item here, best pairs first, so a second legacy item with the same title elsewhere would not be seen.
- The live checks are one moment (9 November 2026) with GET requests, one at a time per site; a blocked or erroring site is "unchecked", not "dead".
- A2's "404 after cut-over" outcomes are from its simulation, not observed.
- The control is weak (section 3).
- Hand searches and readings with no data file behind them: that `public/_redirects` holds no rule for `/job-board` or `/workshops`; that the event page shows a registration button only for events not yet past (a reading of `pages/community/events/[slug].vue`); that `scripts/parity/redirects.mjs` says the two non-job addresses return 404 on purpose; that the newest job file here is dated 30 October; the Texas State comparison; that `apply_url` is read by no page, that no Cornell, SUNY, Harvard, South Dakota, Texas A&M, Huazhong, UT Austin or Institute for Water and Health job is here (a grep of the `organization:` lines), and that the Surface Water Field School appears nowhere in `content/`.

## 8. Proposed fixes (for Jordan; none made here)

1. **The legacy board's current jobs.** Options: bring the 9 unmatched current listings across as job files (a content task: each from its legacy page and apply link; the legacy board is a source I would name per C2), or let the harvest find them, or accept that the legacy board ends. The decision decides how many of the 1,442 `/job-board` visitors find something.
2. **Redirects (rule 8, you approve):** `/job-board` and its jobs to `/community/jobs`; `/workshops` and its pages to the events pages or to Learn & Train; the Snow Field School years to `/learn-train/programs/snow-field-school`. A change to `scripts/parity/redirects.mjs` and the generated file.
3. **The six job files that point at the legacy site:** leave them unpublished, or retire them; their `url` is required by the schema, and 404.
4. **`apply_url` of the WaterSoftHack program:** point it at a real application page, or remove it (a content change; no page reads it today). **The Virtual Open House registration link:** it is hidden now; the event is past.
5. **The 12 older workshops (2019 to 2023):** bring across as past events (a content task with the legacy page as the source), list them on one archive page, or leave them out. Same question for the 4 Snow Field School years.
6. **HydroLearn end date:** the legacy date line (June 8) and its text (June 11) disagree; this site has June 11. Nothing to change here unless you say the line is right.
7. **The Northwestern and other abbreviated titles** are a method limit, not a content fix.
8. **Texas State:** read both texts and say whether the two are one job.
