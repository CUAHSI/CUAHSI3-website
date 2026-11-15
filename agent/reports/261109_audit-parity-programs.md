# Audit A3d: programs and graduate programs, legacy site against this site (9 November 2026)

Org issue 105, part of the site audit (epic 99). Read-only on both sites; nothing is fixed here. The legacy side is the snapshot of 6 November 2026 (`raw/legacy-site/261106/pages`: 6 program pages, the graduate programs list in 11 pages, 19 category pages and 107 institution pages, 761 saved pages in all). This side is `content/graduate-programs/programs.json`, `content/programs/*.md` and the build of `origin/main` f750285 (after PR 216). Script: `scripts/parity/a3d-programs.mjs`. Data files: `agent/audit/a3d-*-261106.csv`, `a3d-numbers-261106.json`.

## The answer in one paragraph

**The graduate programs directory came across whole by name and incompletely by link.** All 102 institutions here match a legacy institution by name (**102 exact**, 0 probable, 0 weak), and no row here lacks a legacy counterpart; the **5 merged duplicates are confirmed** (107 list blocks, 102 names). What the reader acts on differs in three places: **42 of the 143 web addresses on the legacy list are not here** (one website per row survives; 5 institutions had two departments with two websites, 36 department links were in the list text of 11 institutions, and one institution, Universitat Politècnica de Catalunya, has lost its only website); the **University of Kansas** row went from 864 words to 52; and **review dates** do not exist on the legacy side (0 of 107) and exist for 1 of 102 rows here. **The program pages are the weak half:** of 6 legacy program pages, **2 are matched** (Summer Institute, Virtual University) and **4 have no counterpart** (CyberWater, Next-Generation Modeling CI, Ongoing Research Projects, All Programs & Services). Both matched pages here say less than the legacy page on things a reader acts on (the Summer Institute's call for Research Theme Leaders with its 1 December 2026 review date; the Virtual University's Fall 2026 module catalogue). **At cut-over all 6 program addresses answer 404 (1,459 clicks, a floor), including `/summer-institute` (1,045)**; the 137 graduate-directory addresses all redirect to one page.

## 1. What was compared, and how matches were decided

- **Legacy directory:** 107 blocks on the 11 list pages (`/students/graduate-programs-in-water-science`, `p2` to `p11`), one per institution page (`-dev/<slug>`), 107 saved; 102 distinct names. Degrees come from the "Degrees" links in each block and are cross-checked against the four category lists (Master's 9 pages, Ph.D. 8, Other/professional 1, Undergraduate 1: 19 pages). The legacy website of each block comes from its institution page ("Website:" line). Together with the 11 list pages these are the 137 addresses A2 counted (107 + 11 + 19).
- **This side:** 102 rows in `programs.json`; the page `/learn-train/graduate-programs` renders them as one table (103 `role="row"` elements in the built page: 102 and the header). 5 program files in `content/programs/`, each at `/learn-train/programs/<slug>` (5 of 5 built).
- **Legacy programs:** the issue says 5 pages in October. The snapshot has **6** in the "Programs and research projects" body of A2's file: `/summer-institute`, `/virtual-university`, `/cyberwater`, `/next-generation-modeling-ci`, `/ongoing-research-projects` and the index `/all-programs-services`. I count 6 and say so; the difference is the index page.
- **Levels** are October's scale (`agent/reports/261005_parity-stage4.md`, section 1) and never raised: *exact* the name is the same once case, accents, punctuation and a leading "the" are ignored; *probable* the name words overlap by 0.6 or more; *weak* 0.4 or more; *none*. Program pages match when the address word and the program are the same. "Matched" means exact or probable.
- **Facts compared:** degrees; website; the program text (words of the legacy text found in the text here, web addresses ignored); every web address the legacy block gives; review date; contact (present or absent only). For program pages: dates, years, numbers, headings, links, then both texts read by hand (section 4).
- **E-mail addresses** on the legacy site are hidden behind a script and are counted, never decoded. No address or telephone number is in any committed file here.

## 2. Counts

**Graduate directory**

| Legacy (102 names) | exact | probable | weak | none |
|---|---|---|---|---|
| matched to a row here | **102** | 0 | 0 | 0 |

- Rows here with no legacy name: **0 of 102**. Rows matched by two legacy names: 0.
- **Names listed twice: 5** (107 blocks − 102): Colorado State University, Michigan State University, The Ohio State University, University at Buffalo, University of Wisconsin - Madison. In all 5, the two blocks have different institution pages and different websites (`a3d-duplicates-261106.csv`; the second Michigan State block is a "Water Science Network" page, not obviously a department), and this site has one row each. In 2 of the 5 (Colorado State, Ohio State) the first block carries no text. Confirmed: 5 of 5 merged, none dropped as a name; the second website is not kept in any of the 5, and Buffalo's two blocks (24 and 9 words) are one row of 21 words.

| Fact, 102 pairs | Same | Differs |
|---|---|---|
| Degrees | 100 | **2** (Brigham Young University, Universitat Politècnica de Catalunya: no degree on the legacy list, filled in here from the program text in October) |
| Website | 101 | **1** (Universitat Politècnica de Catalunya: legacy has one, here has none) |
| Review date | n/a | legacy names none (0 of 107 blocks and 0 of 107 institution pages contain the word "reviewed" or "updated"; a bare date would not be caught); here **1 of 102** (Boise State University, 6 October 2026) |
| Contact | n/a | a script-hidden address on **2 of 102** institution pages (Northeastern University, University of Hawaii at Manoa); here there is no contact field |
| Program text: every word of the legacy list text is found here (a one-way check, see below) | 97 | **5** below 100% (4 below 90%): Kansas 32%, Syracuse 57%, Iowa State 64%, University at Buffalo 67%, Missouri University of Science and Technology 90% |

- Institutions by degree, legacy against here: Master's 81 / 83, Ph.D. 74 / 75, Undergraduate 3 / 3, Other/professional 4 / 4. The differences (+2 and +1) are the two rows above. Rows saying "Degrees not listed" here: 16 of 102 (legacy: 18 with none on any list). No institution is on a category page without being marked on the main list.
- **Program text is a one-way check:** it asks whether the words of the legacy *list* text are in the row here, so it cannot see added words, and a block with no list text scores 100%. In 16 of 102 pairs the row here has more words than the legacy list text (9 legacy blocks have no list text, so their text, if any, is on the institution page, which this check did not compare). "97 same" therefore means "no legacy list word is missing", not "97 identical texts".
- **Web addresses:** 143 addresses (counted per institution, so an address shared by two institutions counts twice) on the legacy side (107 institution websites and 36 more written in list text, across 11 institutions). **101 are here; 42 are not**: 5 second websites of the merged names, 1 lost website, and the 36 in list text. 15 of 102 institutions give more than one address.

**Programs**

| Legacy (6); "exact" here means the address word is equal, not a name match | exact | none |
|---|---|---|
| program pages | **2** (`/summer-institute`, `/virtual-university`) | **4** (`/cyberwater`, `/next-generation-modeling-ci`, `/ongoing-research-projects`, `/all-programs-services`) |

**Program files here with no legacy page of the same address: 3 of 5** (`snow-field-school`, `watersofthack`, `skills-certificate-pilot`). Each is described elsewhere on the legacy site (the word search is on page text, so it is a pointer, not a match): the Snow Measurement Field School on 20 legacy pages (6 are `/workshops/snow-measurement-field-school-<year>` pages), WatersOfHack on 14 (events, news and e-newsletter posts), the Skills Certificate pilot on 3 (one workshop page, the October e-newsletter, the past-workshops list). These are workshop and event material, which A3f covers.

**At cut-over** (A2's simulation, `agent/audit/cutover-261106-urls.csv`)

| Group | Addresses | Where they end | Clicks (floor) |
|---|---|---|---|
| Graduate directory | 137 (107 institution pages, 11 list pages, 19 category pages) | all 137 → `/learn-train/graduate-programs` (301, then 200) | 1,771 |
| Program pages | 6 | **all 6 → 404** (no rule in `public/_redirects`) | **1,459**: `/summer-institute` 1,045; `/virtual-university` 281; `/cyberwater` 122; `/ongoing-research-projects` 8; `/next-generation-modeling-ci` 2; `/all-programs-services` 1 |

Search Console keeps 1,000 rows, so the click counts are floors.

## 3. Control (written before the script was run)

15 institution blocks were matched by hand before the matching ran (`agent/audit/a3d-hand-match-261109.csv`, committed with the data; the commit does not show the order, so this rests on my word): names with commas, hyphens and an accent (University of California, Merced; University of Texas, San Antonio; Universitat Politècnica de Catalunya; Wisconsin-Milwaukee), a name that is not the institution's own heading (Marquette's block, whose address slug is the department's), an institution listed under another name (University of Alabama's block, whose slug is a research group), a very long block (University of Kansas: its first heading is the name; the department headings follow it in the same block), and one block of four of the five duplicated names (Colorado State, Ohio State, Buffalo, Wisconsin–Madison; not Michigan State). **Result: 15 of 15 the same** (`a3d-control-261106.csv`). **The control is weak:** this site's list was built from the legacy list by a script in October, so a match was expected for every one, and it holds no "none" (no legacy name is missing here). It shows the matching reads names the way a person does; it does not test whether a real absence would be found. The program pages had no control (6 pages, all read in part by hand, section 4).

## 4. Six items read by hand

**Called matched**

1. **Summer Institute** (`/summer-institute` and `/learn-train/programs/summer-institute`). I read both texts in full. Same: seven weeks, 250+ students since 2015, funding award, the timeline (application November–January; notice March; webinars April–May; June–July), eligibility, the four application requirements, the themes (five on both sides), dormitory lodging, the authorship agreement. **Differs:** (a) the legacy page opens with a **Call for Research Theme Leaders for 2027, application review beginning on a rolling basis 1 December 2026, with a "Learn more and apply here" link** to a legacy event page (`/events/call-for-2027-water-prediction-innovators-summer-institute-theme-leaders`, which is not an event here). Here the program page says "Applications for Research Theme Leaders and Student Fellows will open in Fall 2026" with no date and no link, and the news item of 8 October 2026 (`content/news/261008-wpi-2027-theme-leaders-call.md`) says the call "opens soon" and has no December date either. So this site is behind the legacy page as of 6 November: the call is open there, "opening soon" here. (b) The legacy "Learn More" block (an overview webinar with the National Water Center, the 2021 informational webinar, a talk on the National Water Model) is not here. (c) Here, not on the legacy page: CIROH and the National Water Center named as partners and the Office of Water Prediction as sponsor (the legacy page names only CUAHSI and the University of Alabama, and CIROH as funder). I do not know where those words came from. (d) 8 of the 9 technical-report links here point to `www.cuahsi.org/uploads/…`, the legacy site; only 2026 points to HydroShare (A4's area). (e) The contact is a named person with a script-hidden address on the legacy page and a mail link here.
2. **Virtual University** (`/virtual-university` and `/learn-train/programs/virtual-university`). I read both texts in full. Same: September to early December, up to three modules, four-week modules, grade assigned at the home university, participating universities only, the four welcome topics, the faculty requirements. **Differs:** (a) the legacy "Information on Upcoming Term" gives the **Fall 2026 Modules Catalog** (a PDF on the legacy site); there is no catalogue link here. (b) The legacy "How to Apply" says **the application window has closed**; here the text says faculty applications are "typically due in mid-March", a date that is not on the legacy page. (c) The legacy page says faculty are **not compensated** by CUAHSI and lists five expectations; neither is here. (d) The legacy page tells faculty outside U.S. universities whom to contact; here only "Faculty at U.S. universities". (e) Here, not on the legacy page: "founded in 2017, 430+ students from 25 institutions" and a paragraph on the nine Fall 2025 modules. I did not check these numbers. (f) The legacy page says the CVU ends in "early December" in one section and "November" in another; here it is early December throughout.
3. **University of Kansas** (graduate directory). Legacy block read in full (864 words): four entities support membership; per-department paragraphs (Geology: M.S. and Ph.D. with a hydrogeology emphasis, a named professor as contact for CUAHSI, an NSF project; a professional master's in Environmental Geology; and the other departments); 11 web addresses. Here: 52 words (the first two sentences), degrees master's, Ph.D. and professional, one website. The cut is deliberate and written in the October build script. What a reader loses: which department offers which degree, who the contact is, the other 10 web addresses.

**Called missing (none)**

4. **CyberWater** (`/cyberwater`, 1,249 words, 21 external links: the project's software site, 7 papers or posters, 12 YouTube recordings and the newsletter sign-up). I read the first part and the headings and searched `content/`, `pages/` and `components/` for the name: it occurs in 5 cyberseminar files (2026), one event (`260921-cyberwater2-training.md`) and the August newsletter. No page describes the project. Called none; correct.
5. **Next-Generation Modeling CI** (`/next-generation-modeling-ci`, 646 words, 7 links: CoMSES.Net, CSDMS, a GitHub classroom and the newsletter sign-up). Read the first part and the headings; searched for it: the name occurs once, in the NSF award sentence in `content/awards/awards.json` (line 42). No page. Called none; correct.
6. **Ongoing Research Projects** (`/ongoing-research-projects`, 304 words, lists CyberWater, CIROH, Next-Generation Modeling CI and CZNet, with links to CIROH, the Critical Zone network and the sign-up). Read in full. No page here; `pages/community/index.vue` line 335 **links to this legacy address**, which answers 404 at cut-over (A4 and A6 will meet it too). Called none; correct.

Also read: the institution blocks for Colorado State, Iowa State, Syracuse, University at Buffalo, Missouri S&T, Northeastern and Michigan State (7 more blocks, beyond Kansas), and the rows here.

## 5. Findings

1. **Five institutions lost their second department's website.** In each merged pair the second block has its own website, and the row here keeps one: Colorado State (kept `engr.colostate.edu/ce/graduate/hydrologic-science-and-engineering`; `warnercnr.colostate.edu/ess-home` is gone, though the text kept the program lines listed under it), Michigan State (kept `msu.edu`; `canr.msu.edu/iwr` is gone), Ohio State, University at Buffalo, Wisconsin–Madison (kept `nelson.wisc.edu/graduate/water-resources-management`; `limnology.wisc.edu` is gone).
2. **One institution lost its only website.** Universitat Politècnica de Catalunya: the legacy page gives a master's page at the university. The row here has no `url`. The institution's page was saved under a percent-encoded file name, and October's extraction did not find it (my reading of why; the October script is not run here).
3. **36 department links in list text across 11 institutions are not carried.** Example: Iowa State's block gives a link for each of six units; the row keeps the six names and one university home page (the link on the institution's page). The script that built the data removes web addresses from the text by design (header of `agent/parity/grad-programs-build.mjs`).
4. **The University of Kansas row is 52 of 864 words** (by design, section 4, item 3).
5. **A word is fused in one row:** Missouri S&T reads "Geophysicsprograms" (the legacy block has a space). Found because its coverage was 90%; there may be others that the check cannot see.
6. **Review dates:** the legacy side has none; here 1 of 102 rows has one and the page tells the reader "we review each row every year; rows without a date have not been reviewed yet". So the page's promise rests on 101 rows still to review.
7. **Contact:** 2 of 102 institution pages had a hidden address on the legacy side. The directory has no contact field. Unknown whether the 2 addresses were the institutions' or CUAHSI's (not decoded).
8. **Program pages: the matched two are behind the legacy page on the live call and the live catalogue** (section 4, items 1 and 2: the Theme Leaders call is open on the legacy page and "opens soon" here; the Fall 2026 catalogue has no link here) and gained statements with no source on the legacy page (partners, "mid-March", "430+ students from 25 institutions"). Which side is right is Jordan's call.
9. **Four legacy program pages have no place here**, and 3 of the 5 program files here have no legacy page of the same address (section 2). The CyberWater page's 12 recordings, 7 papers or posters and the link to the project's software site do not appear on any page here as a set (5 of the recordings are cyberseminar files; I did not check the other 7).
10. **At cut-over, the 6 program addresses answer 404 and carry 1,459 clicks** (`/summer-institute` alone 1,045). The graduate-directory addresses are covered (301 to the directory), but each lands on the whole directory, not on the institution's row: this site has no per-institution address.
11. **Two things the issue asked for that I could not list:** "review dates" differ only as above; "program names" differ in no pair beyond the text cuts (the 102 names are identical).

## 6. Not examined

- **The text of 94 of 102 institutions** was compared by word count and coverage only; I read 8 blocks (Kansas, Iowa State, Syracuse, Buffalo, Missouri S&T, Colorado State, Northeastern, Michigan State) and the 15 control names (names only, not text).
- **Whether the 143 legacy and 101 current web addresses work or are current** (A4).
- **Whether any program fact is current.** Neither side dates the directory rows (1 of 102 here, 0 of 107 there). I only compared the two.
- **The three program files here with no legacy page** against their legacy sources: located only (20, 14 and 3 pages). A3f.
- **`/all-programs-services`** (61 words, an index of 17 entries) entry by entry: other audits cover each entry.
- **Images, diagrams and videos** on the legacy program pages (CyberWater has two diagrams).
- **The two hidden contact addresses**: not decoded, by design.
- **The 12 CyberWater recordings** against this site's cyberseminars: not compared (A3g).
- **The rendered look** of the directory and of the five program pages: not looked at. I read the built HTML's structure (103 rows), not the screen.

## 7. Limits of the method

- Names only. A moved or renamed institution is not detected; none looked likely among the 102.
- Program pages are matched by equal address word, so a legacy page whose content sits in a differently named file here would be called none (checked for the four by searching the site for their names, section 4).
- The control is weak (section 3).
- **"Coverage" counts words**, so a changed number or a changed date inside a kept sentence is not seen. I found the program-page differences by reading, for 2 pages only.
- The word search for "where the program lives on the legacy site" reads the main text of 761 pages and is a pointer: a program called by a different name would be missed (my first search for the Snow Measurement Field School used a wrong title and found nothing; fixed after I saw the file's title).
- A 6 November snapshot is not the live site; later changes are not seen.
- Click counts are floors (1,000-row export).

## 8. Proposed fixes (for Jordan; none made here)

Each is a decision for you.

1. **Restore the lost websites.** One content PR: add the Universitat Politècnica de Catalunya website to its row (the address is in `a3d-legacy-grad-261106.csv`, row 53). It is a single field and no schema change.
2. **Second websites and department links (5 + 36).** The row has one `url`. To keep more, the data needs a list of links (a schema change: a separate code PR, then a content PR for 16 institutions). Or accept one link per institution. Your call.
3. **University of Kansas.** Keep the short version, or restore department-level lines and the contact (content PR, text from the legacy block, C8).
4. **Fix "Geophysicsprograms"** (content, one word).
5. **Summer Institute:** bring the Research Theme Leaders call up to the legacy page (open, rolling review from 1 December 2026, with its link; the 8 October news item says "opens soon"), and decide on the "Learn More" block. **Virtual University:** add the Fall 2026 catalogue link (host the PDF here per C14 rather than link to the legacy site) and say the application window is closed. Both are content changes from the legacy page as source. Staff should confirm the partner and sponsor wording, "mid-March" and "430+ students from 25 institutions" (C3: these have no source on the legacy page).
6. **The four legacy program pages without a place.** Options per page: a program page (CyberWater is the strongest case: 122 clicks, 12 recordings), a link from the Learn & Train or Community page to the project's own site, or let it go with a redirect to `/learn-train`. Next-Generation Modeling CI and Ongoing Research Projects (2 and 8 clicks) look like candidates for the redirect only.
7. **Redirects for the six program addresses** (rule 8: changing URLs needs your approval): `/summer-institute` → `/learn-train/programs/summer-institute`, `/virtual-university` → `/learn-train/programs/virtual-university`, the other four per item 6. The redirect file is generated from the parity data (`scripts/parity/redirects.mjs`); the rules would be a code PR.
8. **`pages/community/index.vue` line 335** links to the legacy `/ongoing-research-projects`. A code PR once item 6 is decided (A4 will list it among the links to the legacy host).
9. **Reviewing the directory.** 101 of 102 rows carry no review date although the page says every row is reviewed each year. Decide who reviews, or reword the page.
10. **Per-institution addresses.** The 107 institution addresses all land on the same page. If you want an institution's old link to land on its row, the page needs anchors (code) and the redirect rules need them (rule 8).
