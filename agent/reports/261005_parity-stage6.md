# Parity stage 6: importance of each body of work (5 Oct 2026)

Read-only on both sites; nothing under `content/`, `pages/` or `components/` changed. Per the reworked plan (PR 59) the unit is the body of work from stage 5. Inputs are shown separately, then a tier. **The cost of absence and the tier rules are my judgments (P6)**; the thresholds are stated in section 2 so Jordan can move them. Outputs in `agent/parity/`: `importance.csv` (one row per body), `tier-a-urls.csv` (the URLs inside tier A bodies that matter most), `cited-urls.csv` (every legacy URL cited in `content/`), `export-unmatched.csv` (traffic to www URLs not in the snapshot), `importance-numbers.json`. Script: `scripts/parity/importance.mjs`. The Search Console export is `raw/search-console/261005_pages_all.csv` (not committed).

## 1. The Search Console export, and what it can and cannot say

- **1,000 rows** (the export stops at 1,000 pages), **23,741 clicks** in all. **603 rows (21,591 clicks, 1,180,476 impressions) are www.cuahsi.org**, which is the legacy site; the other 397 rows (2,150 clicks) are other CUAHSI properties (HydroShare, HIS Central, the help centre and others) and are out of scope.
- **The period is not in the file.** The plan assumed twelve months; I cannot confirm that. A recent page (for example a September 2026 job) would have few clicks whatever its worth.
- **Rows past the top 1,000 are not here**, so the long tail is under-counted; clicks are a lower bound.
- Of the 21,591 www clicks, **20,155 fall on URLs in the snapshot** (and so in a body) and **1,436 on 174 www URLs that are not in the snapshot** (section 4).
- Clicks measure what search sends people to, not what a funder or a member would miss. That is why the cost of absence is a separate input.

## 2. How the tiers were set (thresholds)

- **Cost of absence** (mine, one line per body in `importance.csv`): *High* = a visitor, member or funder would notice at once, or it carries an obligation or a revenue path; *Medium* = worth having, a defined audience would miss it; *Low* = long tail.
- **Tier A:** cost High, **or** at least 5% of www clicks. **Tier B:** not A, and cost Medium, **or** at least 1% of www clicks. **Tier C:** the rest. A body in the navigation, or with internal links, is shown but does not move a tier by itself.
- **Every cited URL gets its own row** regardless of tier (section 5), as the plan says.

## 3. The bodies, ranked

Tiers: A 10 bodies (227 URLs, 16,197 clicks, 75% of www clicks), B 8 bodies (501 URLs, 3,209 clicks), C 6 bodies (27 URLs, 391 clicks), 1 body not content. Status is stage 5's; note that **Job board and Donate are "present" although their stage 5b spot checks came out partial** (the `spot_checks` column of `importance.csv` carries the verdicts); stage 7 should treat them as present in function and thinner in substance. Within a tier, by clicks. "Cited" = cited URLs that return 200 in the snapshot and sit in the body.

| tier | body of work | www clicks (share) | impressions | links in | in nav | cited | cost | status here |
|---|---|---|---|---|---|---|---|---|
| A | Home page and section landing pages | 4315 (20.0%) | 55,153 | 6 | 2 | 1 | High | partial |
| A | Graduate programs directory | 2646 (12.3%) | 150,212 | 666 | 0 | 0 | High | absent |
| A | Job board | 2310 (10.7%) | 43,679 | 25 | 1 | 2 | High | present |
| A | Programs and research projects | 1922 (8.9%) | 76,681 | 25 | 1 | 2 | High | partial |
| A | Data services and software (tools) | 1804 (8.4%) | 201,660 | 32 | 2 | 0 | High | partial |
| A | Staff directory and profiles | 1422 (6.6%) | 37,307 | 24 | 1 | 0 | Medium | partial |
| A | Workshops and short courses | 1201 (5.6%) | 23,051 | 56 | 0 | 1 | Medium | different |
| A | About, governance, membership and contact | 530 (2.5%) | 38,523 | 25 | 5 | 1 | High | partial |
| A | Policies and conduct | 34 (0.2%) | 6,383 | 5 | 1 | 0 | High | absent |
| A | Donate | 13 (0.1%) | 620 | 0 | 1 | 0 | High | present |
| B | Events (upcoming and past) | 998 (4.6%) | 42,923 | 141 | 1 | 4 | Medium | partial |
| B | Cyberseminar archive | 553 (2.6%) | 37,247 | 227 | 1 | 5 | Medium | partial |
| B | News posts | 542 (2.5%) | 40,376 | 147 | 1 | 5 | Medium | partial |
| B | Water data portals catalog | 380 (1.8%) | 80,793 | 98 | 1 | 0 | Medium | absent |
| B | Grant and fellowship opportunities | 304 (1.4%) | 4,892 | 1 | 0 | 0 | Medium | absent |
| B | Document library | 159 (0.7%) | 5,592 | 88 | 1 | 0 | Medium | absent |
| B | e-Newsletters and guest spotlights | 138 (0.6%) | 11,467 | 30 | 0 | 5 | Medium | partial |
| B | Guest lecturer database | 135 (0.6%) | 7,278 | 242 | 0 | 0 | Medium | absent |
| C | Other small pages | 146 (0.7%) | 6,165 | 8 | 1 | 2 | Low | absent |
| C | Faculty resources | 90 (0.4%) | 7,554 | 5 | 1 | 0 | Low | absent |
| C | Research data management guide and FAQ | 46 (0.2%) | 5,383 | 0 | 2 | 0 | Low | absent |
| C | Water Science Exchange | 44 (0.2%) | 130 | 3 | 1 | 1 | Low | partial |
| C | Instrumentation facilities | 34 (0.2%) | 10,411 | 22 | 1 | 0 | Low | absent |
| C | Student resources | 31 (0.1%) | 5,815 | 3 | 1 | 0 | Low | absent |
| - | Broken or empty legacy URLs | 358 (1.7%) | 8,173 | 25 | 1 | 0 | n/a | n/a |

**Share of all www clicks (21,591; the other CUAHSI properties are excluded):** tier A bodies cover **75.0%** (16,197), tier A plus B **89.9%** (19,406), and **6.7%** (1,436 clicks) fall on www URLs outside every body (not in the snapshot: section 4). The rest is tier C 1.8% (391) and the broken or redirecting body 1.7% (358); the four add to 100%.

**What to look at first (mine):**
1. **Graduate programs directory: tier A, absent, 12.3% of www clicks.** 2,646 clicks and 150,000 impressions on 67 URLs, making it the **largest absent body by clicks** (among the bodies in the snapshot). Partial bodies are thinner here but not absent: data tools (1,804 clicks) and programs (1,922) draw similar traffic; and 716 clicks on job-board URLs and 496 on files sit outside every body (section 4). The 23 listing pages carry 2,467 of the clicks (the single listing page, `/students/graduate-programs-in-water-science`, 1,359); the 44 `-dev` stubs Jordan noted at stage 1 carry 179.
2. **Policies and conduct: tier A, absent, 0.2% of clicks.** Tier A on cost, not traffic: a code of conduct and a way to report a concern.
3. **Partial and thin, tier A:** the home page and landing pages, programs (the Summer Institute and Virtual University pages), data tools, About/governance/membership/contact, workshops, staff. Each draws real traffic and each is thinner here (stage 5).
4. **Tier B, absent:** water data portals (380 clicks, 80,800 impressions), grants and fellowships (304 clicks on one page), the document library, guest lecturers. Tier B partial: events, the cyberseminar archive (known, deferred), news, e-newsletters.
5. **Tier C, all absent:** small pages, faculty and student resources, the research data management guide, instrumentation facilities, the Water Science Exchange page.

## 4. Traffic to legacy URLs that are not in the snapshot

174 www URLs with clicks are not in the snapshot: **108 pages (940 clicks) and 66 files (496 clicks)**. By section the pages are mainly **/job-board: 83 URLs, 716 clicks**, which look like the legacy site's expired postings and year archives (`/job-board/2025`, `/job-board/2023` and old posting pages; an inference from the URLs and clicks, since I did not fetch them (P2)): the legacy job board appears to keep an archive of past postings and year pages that the snapshot does not hold: none of them is in the legacy sitemap, and the crawler followed only `/pN` pagers, not the "filter by date" links (for example `/job-board/2026`, seen on the job board page in stage 5). The snapshot therefore holds the current board only, and stage 4's "0 of 13 legacy jobs match" compared this site with the current board, not the archive. Others: 4 staff-profile URLs (89 clicks; I infer these are former staff, which I have not verified), 7 event URLs (35), one page, `/lets-talk-about-water` (31 clicks, a page I have not seen), and 4 news-section URLs (29 clicks: two year archives, a 2026 e-newsletter page and a test post). The URL normaliser is case-sensitive: one case variant of `/about` (10 clicks) is counted as unmatched. The files (66) include annual reports, Summer Institute reports and a folder URL (`/uploads/pages/img`). **For stage 7:** these URLs get traffic and will need a redirect target (the archive of past jobs; former staff; annual reports); they are listed in `export-unmatched.csv`. I did not fetch any of them (P2).

## 5. URLs cited in `content/` (the externally-cited list I build, since Jordan has none)

Built by scanning `content/` for www.cuahsi.org URLs (a first version of the script cut two PDF URLs containing parentheses; fixed, and the count is unchanged) (newsletters, news, events, programs, jobs): **47 distinct URLs, 38 pages and 9 files**. Of the pages: **29 return 200 in the snapshot, 1 redirects, 8 are not in the snapshot** (6 job-board pages and two short links, `/apply/watersofthack` and `/register/open-house`; stage 1 found the same 8). The cited pages cluster in the Events, Cyberseminar, News and e-Newsletter bodies. These are the URLs a reader of this site's own content may follow to the legacy site; each gets a URL-level row in stage 7 (`cited-urls.csv`). The count matches stage 0's 47. This list covers only `content/`; NSF reports and other external documents were not available.

## 6. Six-item check (P5)

Matched to a body, recomputed from the export by hand: **Donate** (the `/donate` row: 13 clicks, 620 impressions, as in `importance.csv`), **Virtual University** (`/virtual-university`: 428 clicks, in the programs body), **Water data portals** (`/community/water-data-portals`: 124 clicks, in the portals body; the body total of 380 comes from 38 URLs). Not in the snapshot (searched for in the legacy inventory, 0 matches each): `/job-board/research-scientist` (26 clicks in the export), `/lets-talk-about-water` (31 clicks), `/job-board/2023` (21 clicks).

## 7. Not examined

- The export's period and the 1,000-row cut (section 1): clicks are a lower bound of unknown length.
- Search traffic for other CUAHSI properties (2,150 clicks on 397 rows) and any links from those sites into www.cuahsi.org.
- The pages in section 4 (not fetched); whether the legacy job archive and former-staff pages still resolve.
- External documents citing legacy URLs (NSF reports and others): not available; only `content/` was scanned.
- The cost of absence is my judgment; I have not consulted anyone about who relies on which body.
- Impressions are shown but do not enter a tier.

## 8. Personal data (P8)

No email addresses or phone numbers. Names appear only as public URL slugs (kept at stage 1): 4 staff-profile URLs and 1 guest-lecturer URL in `export-unmatched.csv`. That file also names two PDF files of member-representative lists (file names only, not opened). No email addresses or phone numbers.
