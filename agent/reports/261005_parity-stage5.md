# Parity stage 5: bodies of work, and spot checks (5 Oct 2026)

Read-only on both sites; nothing under `content/`, `pages/` or `components/` changed. This is the rework Jordan asked for (plan PR 59): the question is which large bodies of work on the legacy site are missing here, not whether single items agree. Outputs in `agent/parity/`: `bodies.csv` (one row per body), `url-bodies.csv` (every legacy URL and its body), `bodies-numbers.json`, `spot-checks.csv`. Script: `scripts/parity/bodies.mjs`. The grouping rules, each body's audience, the "here" status and the `known_to_jordan` flag are **my judgments (P6)**; each body's `notes` says why. Snapshot: the crawl of 5 Oct 2026.

## 1. Result in one table

All 767 legacy URLs belong to exactly one of **25 bodies of work; 0 URLs were unassigned** (checked by script). **Status caveat:** the 2 "present" bodies, Job board and Donate, both have a `partial` spot-check verdict. I kept them present because the function and the substance exist (the job lists hold different postings by design; the Donate differences are small facts), and I say so here instead of hiding it; "present" always means "I judge it present". Of the 25 bodies: **11 absent, 10 partial, 2 present, 1 different** (done another way), and 1 not applicable (broken, redirecting or empty URLs). Counted in legacy URLs: 385 of 767 are in absent bodies, 327 in partial ones, 24 in a "different" one, 19 in present ones, 12 not applicable. By size, the absent bodies are dominated by three catalogs (graduate programs 137 URLs, document library 87, guest lecturers 81) plus water data portals (49).

Sorted by legacy words (size of the body). `status`: absent = nothing here; partial = some of it, or a page that covers it in outline; present; different = done another way.

| body of work | legacy URLs | legacy words | status here | what covers it here | Jordan knows |
|---|---|---|---|---|---|
| News posts | 56 | 37,004 | partial | /community/news (12 items) |  |
| Cyberseminar archive | 89 | 22,785 | partial | /learn-train/cyberseminars (15 seminar files, 11 published) | yes |
| Events (upcoming and past) | 119 | 18,101 | partial | /community/events (40 events) |  |
| e-Newsletters and guest spotlights | 19 | 17,261 | partial | /community/newsletter (9 issues from January 2026) |  |
| Graduate programs directory | 137 | 13,792 | absent | none |  |
| Workshops and short courses | 24 | 12,493 | different | /learn-train/archive and 11 workshop events (/community/events) |  |
| Water data portals catalog | 49 | 7,376 | absent | none |  |
| Guest lecturer database | 81 | 7,013 | absent | none |  |
| Job board | 18 | 6,427 | present | /community/jobs (29 jobs) |  |
| Policies and conduct | 4 | 6,121 | absent | none |  |
| Staff directory and profiles | 23 | 4,862 | partial | /about/team (22 people listed, 6 with a profile page) |  |
| Research data management guide and FAQ | 2 | 4,585 | absent | none |  |
| Other small pages | 6 | 3,729 | absent | none |  |
| Programs and research projects | 6 | 3,398 | partial | /learn-train/programs (4 programs: Summer Institute, Virtual University, Snow Field School, WaterSoftHack) |  |
| About, governance, membership and contact | 5 | 2,997 | partial | /about, /about/governance, /about/membership, /contact |  |
| Document library | 87 | 2,549 | absent | none |  |
| Data services and software (tools) | 7 | 2,306 | partial | /data-platforms (one page) |  |
| Home page and section landing pages | 2 | 1,843 | partial | /, /about, /community, /learn-train, /data-platforms, /hire-cuahsi |  |
| Faculty resources | 4 | 1,338 | absent | none |  |
| Student resources | 3 | 1,031 | absent | none |  |
| Instrumentation facilities | 11 | 791 | absent | none |  |
| Water Science Exchange | 1 | 582 | partial | events only (3 Water Science Exchange events) |  |
| Grant and fellowship opportunities | 1 | 363 | absent | none |  |
| Donate | 1 | 209 | present | /support |  |
| Broken or empty legacy URLs | 12 | 0 | n/a | none |  |

The cyberseminar archive is recorded as **known, deferred** (Jordan, 5 Oct 2026). It is sized in the table, not counted as a finding.

## 2. The large gaps (absent bodies, largest first)

1. **Graduate programs directory** (137 URLs, 13,800 words): 30 listing pages and 107 `-dev` stubs, for prospective graduate students. Nothing here.
2. **Water data portals catalog** (49 URLs, 7,400 words) and **Guest lecturer database** (81 URLs, 7,000 words): catalogs of 44 portals and 69 lecturers. Nothing here, except that `/community` here links to the legacy portals page.
3. **Policies and conduct** (4 URLs, 6,100 words): code of conduct, a conduct concern report form and an investigation and consequences policy. Nothing here: "code of conduct" appears on 0 of the 136 built pages. Small in URLs, but it is the one that looks like an organisational obligation **(mine)**.
4. **Research data management guide and FAQ** (2 URLs, 4,600 words): not here.
5. **Document library** (87 URLs, 2,500 words but 105 PDFs linked from the legacy site): annual reports, minutes, strategic plans, technical reports. Here 4 PDFs, all 4 hosted on the legacy domain.
6. **Other small pages** (6: Community Awards, Travel Policy, Logos, Acknowledging CUAHSI, News & Opportunities, the Summer Institute authorship agreement), **Faculty resources** (4), **Student resources** (3), **Instrumentation facilities** (11), **Grant and fellowship opportunities** (1 page, 3 redirects): none here. Faculty and Student also have no entry point (stage 3).

## 3. Present in outline, thin in substance (spot checks)

The spot checks (section 4) show that the bodies that exist here are often thinner than the legacy ones in ways a visitor would notice:
- **Governance:** the Board of Directors roster (15 directors, 4 officers) and all three advisory committees' member lists are absent from `/about/governance`; only the committees are named.
- **Membership:** how to join (the four membership categories, fees and dues, the application form), the member representatives information and two PDFs are absent; the benefits (20% off, 4.2% off) are new here.
- **Contact:** the office and mailing address is absent.
- **Home page and /community:** the news carousel, education cards, Community Awards and Water Science Exchange sections are absent.
- **Programs and research projects:** CyberWater, CIROH and Next-Generation Modeling CI have no page; the Summer Institute page lacks "How to Apply" and the 2026 report.
- **Data tools:** one multi-product page; the HydroClient, subsetter, data storage and Jupyter documentation sections are absent.
- **Staff:** the same 22 people, but 6 profile pages here against a biography per person on the legacy page.

## 4. The spot checks (5b)

15 pairs, chosen as the largest matched bodies and the pages a visitor lands on first. Pilot: 5 pairs (membership, governance, contact, donate, Summer Institute) were done by me and then by the `page-comparer` subagent. **4 of 5 verdicts agreed; the one difference was Donate** (I said `equivalent`, the subagent `partial` because a goals chart and a headcount were missing; final `partial`). The gate in the plan (stop if more than one differs) did not trip, so the other 10 went to the subagent. Word counts are my own measure of the main content (the subagent's are estimates and differ by 10 to 30%). The full per-pair findings (missing substance and factual differences) are in `agent/parity/spot-checks.csv`.

| pair | legacy → here | words legacy / here | verdict |
|---|---|---|---|
| 1 | /about/about-membership → /about/membership | 1331 / 701 | partial |
| 2 | /about/governance → /about/governance | 469 / 110 | partial |
| 3 | /about/contact-us → /contact | 120 / 168 | partial |
| 4 | /donate → /support | 227 / 212 | partial |
| 5 | /summer-institute → /learn-train/programs/summer-institute | 676 / 490 | partial |
| 6 | /virtual-university → /learn-train/programs/virtual-university | 743 / 445 | partial |
| 7 | / → / | 794 / 444 | partial |
| 8 | /community → /community | 1096 / 664 | partial |
| 9 | /about/our-team → /about/team | 2512 / 168 | partial |
| 10 | /job-board → /community/jobs | 697 / 836 | partial |
| 11 | /data-services/solutions → /data-platforms | 766 / 302 | partial |
| 12 | /data-services/jupyterhub → /data-platforms | 490 / 302 | partial |
| 13 | /about/who-we-are-2 → /about | 928 / 542 | partial |
| 14 | /ongoing-research-projects → /about/impact | 298 / 564 | mismatch |
| 15 | /workshops → /learn-train/archive | 195 / 195 | partial |

Verdicts: 14 `partial`, 1 `mismatch` (the legacy "ongoing research projects" page and the impact list here are not the same thing; matched as the nearest page only). None `equivalent`, `summary` or `stub`.

**Factual differences a reader would act on** (the ten that matter most **(mine)**; both values and locations are in the CSV; contact details are flagged, never repeated):
1. Member count "more than 100" (legacy membership page) against "101" (here); roster date "August 2026" against "July 2026"; 6 institutions only here and 1 only on the legacy list.
2. The cyberseminar archive: "over 150 recorded" (legacy home page) against "350+" (this site's home and Learn & Train pages) and "150+" (this site's `/community`): inconsistent within this site, and the archive here holds 15 files.
3. Virtual University: "the application window has closed" (legacy) against "applications typically due in mid-March" (here); term end "November" against "early December".
4. One staff member's role differs between the two team pages (the title identifies the person, so it is not repeated here: compare the pages; pair 9).
5. The JupyterHub address: `jupyterhub.cuahsi.org` (legacy) against `jupyter.cuahsi.org` (here); MATLAB "partnered with MathWorks" against "free for member institutions"; a Water Services deprecation notice only here.
6. The Summer Institute page header summary paragraph renders empty here (a possible data gap).
7. The donor testimonial is reworded here; the "18 full-time employees" figure became "full-time staff"; "100% of your gift goes directly to our programs" is a claim only here.
8. "25,000+ HydroShare users" (here, About) against "25K+ HydroShare resources" (here, home and Data): an inconsistency inside this site.
9. The Snow School dates "Jan 4 to 7, 2027" (legacy) against "Jan 4, 2027" (here), and the application deadline appears only on the legacy page.
10. The job lists share no postings (stage 4); the legacy page has a date filter, a pager and category pages with no equivalent.

## 5. This site depends on the legacy site (found while reading the built HTML)

The built site links to **32 distinct pages on www.cuahsi.org** (29 are in the legacy snapshot, 1 redirects, 2 are not in the inventory) and **14 distinct files hosted there** (all 14 are in the legacy file list). Among them: `/matlab` is linked from **122 of 136 built pages** (it is not in the legacy inventory, so whether it resolves was not examined); the water data portals page, the instrumentation facilities page, the ongoing research projects page, the workshops, Summer Institute, Virtual University, Community Awards and Water Science Exchange pages and `/job-board` are linked on the legacy host as the way to reach those bodies; by kind, the 32 pages are 10 news pages, 5 cyberseminar pages, 3 event pages, 3 job-board pages and 11 others; the 14 files are PDFs (the Summer Institute reports, bylaws, strategic plan, annual report, flyer, donor information). I did not check whether each is also available elsewhere here. Consequence for stage 7: any body retired or moved on the legacy host breaks these links; each needs a fate and a local replacement or a kept URL. A count I can make from the built site only; I did not check any link live.

## 6. Six-item check (P5)

Present or partial, read on both sides: the **membership**, **governance** and **Summer Institute** pages (section 4). Absent, confirmed by searching the built site (136 index pages) and `content/`: **Policies and conduct** (the phrase "code of conduct" is on 0 built pages and is in 4 content files, all seminar transcripts), **Guest lecturer database** ("guest lecturer" is on 0 built pages and in no content file), **Graduate programs directory** ("graduate program" appears on 1 built page only in passing (a Virtual University description); no directory). One stronger finding the check exposed: Water data portals is not entirely absent, `/community` has a tile for it that links to the legacy page (section 5).

## 7. Not examined

- 5b compares 15 pairs, not every matched page; the verdict `partial` across all 14 is a fact about these 15 only. The pairs were chosen as the largest and first-seen pages.
- Legacy email addresses are script-hidden and were not decoded, so contact differences are flagged as "differ" or "unknown", never compared.
- Images, layout and the legacy pages' modal text (the legacy pages hide detail in modals; the subagent read the HTML source of them).
- Profile pages here (bios on the 6 staff profiles were not read) and any other page where a missing subject might live; the subagent read only the two files per pair.
- Links on the built site were not checked live; the dependency counts in section 5 come from the HTML.
- Body groupings and statuses are judgments; a reader may split or merge bodies differently. The size columns are exact; the status column is mine.

## 8. Personal data (P8)

No email address, phone number or street address appears in these outputs. A staff role difference is reported without the name or title (a title identifies one person); the roster of board members is described by count only. Wording differences are not recorded in the spot checks (a reviewer finding removed five such items).
