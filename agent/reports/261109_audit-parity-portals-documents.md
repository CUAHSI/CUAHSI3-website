# Audit A3e: water data portals and the document library, legacy site against this site (9 November 2026)

Org issue 106, part of the site audit (epic 99). Read-only on both sites; nothing is fixed here. The legacy side is the snapshot of 6 November 2026 (`raw/legacy-site/261106/pages`: 49 portal pages, 81 library pages, 761 saved pages in all) and `agent/parity/legacy-files.csv` (size and HTTP status of each legacy file, 6 November). This side is `content/data-portals/portals.json` and `content/documents/documents.json`, the 65 PDFs in `public/documents/`, and the pages `/data-platforms/portals` and `/about/documents`. Script: `scripts/parity/a3e-portals-documents.mjs`; data files `agent/audit/a3e-*-261106.csv` and `a3e-numbers-261106.json`.

## The answer in one paragraph

**The portal catalog came across whole in what it names and links, and thin in what it says about each portal; the document library came across whole for the organisation's own records and not at all for the reports.** All 44 legacy portal pages have a row here (**43 exact, 1 probable**, 0 weak, 0 none), and no row here lacks a legacy page. For all 44 the website, owner and scope are the same. What the legacy page adds and this page does not: a one-line description (44 of 44 pages), the data link type, API and export formats (38 pages each), a "Restrictions" line on 14 pages and a contact on 35 pages. In the library, **59 of the 77 legacy file entries are hosted here**, and every one of the 61 hosted files opens, with the same page count as the October copy (58 of 58 compared), the same size in bytes as the legacy file now (55 of 59; the other 4 were made smaller on purpose in October) and, where the title carries a date, that date on the first page (57 of 57). **18 file entries are not hosted** (9 Summer Institute reports, 8 early technical reports, 1 statement; 104 MB). October ruled only on the 9 Summer Institute reports (publish later as HydroShare resources); the other 9 were not ruled. Two things need a decision: **the legacy address of 3 policy pages and of 20 library pages ends in a 404 after cut-over** (2 of those 20 are for documents that are hosted here), and **this site still links to the legacy host for 16 distinct files, 5 links of which are to files that have a hosted copy**. One small discrepancy between the sides: the legacy list calls the 2018 membership minutes "December 5, 2018"; the legacy file and the hosted copy both say December 4.

## 1. What was compared, and how matches were decided

- **Legacy portals:** 44 detail pages (`/community/water-data-portals/<name>`), listed by a menu of 44 names on the list page and on 4 further list pages (`p2` to `p5`); the menu and the 44 pages agree (0 without the other). Each page has labelled fields (site owner, website, link to data, geographical scope, API, data export formats, restrictions), an accession date, a one-line description and a hidden contact address.
- **Legacy documents:** the 5 list pages (annual reports 6, plans 2, reports and publications 10 + 8, board and membership minutes 50) give **76 file entries**; I added the bylaws (linked from `/about/policies-and-conduct`) and the two policy pages that hold their text (`/travel-policy`, `/authorship-agreement-water-prediction-innovators-summer-institute`): **79 entries, 77 of them with a file**. The 76 item pages (`/about/library/<name>`) each belong to one list entry (0 item pages outside a list). October's counts (87 URLs, 76 files) fit: A2's 87 library addresses are the 81 saved pages under `/about/library` (76 item pages, 5 list pages), the landing page `/about/library` and the 5 short `/library/*` pages; the extra 3 entries here are the two policy pages and the bylaws.
- **This side:** 44 portal rows; 61 document rows (50 minutes, 6 annual reports, 2 plans, 1 bylaws, 2 policies), every one with a hosted file (`file`), none with an outside link (`url`).
- **Levels** are October's scale (`agent/reports/261005_parity-stage4.md`, section 1) and never raised: *exact* the title is the same once case, accents, punctuation and a leading "the" are ignored; *probable* the title words overlap by 0.6 or more; *weak* 0.4 or more; *none*. Each legacy entry is paired with at most one row here, best pairs first. For a document with a date (a meeting's month, a report's year, a plan's years) only rows of the same kind and the same date are candidates; this chooses between candidates and **never changes the level**. "Matched" means exact or probable.
- **Facts compared, portals:** name, owner, scope and website address (the address compared after lower-casing and dropping `www.`, a trailing slash, the scheme and any `#fragment`; the scheme compared separately, the fragment not compared; owner and scope compared after case and punctuation are ignored, so "same" means same in that sense); which labelled fields the legacy page has and this page does not. **Documents:** title, kind, date key; for each hosted file: it opens, size in bytes, page count (`pdfinfo`), the date or year in the title against the first page's text (`pdftotext`), the legacy file's size and HTTP status now, and whether the redirect rule in `public/_redirects` sends the legacy file to the row I paired it with.
- **E-mail addresses** on the legacy site are hidden behind a script and are counted, never decoded. No address or telephone number is in any committed file here.

## 2. Counts

**Portals** (44 legacy pages)

| Legacy (44) | exact | probable | weak | none |
|---|---|---|---|---|
| matched to a row here | **43** | **1** | 0 | 0 |

- The one probable: *International Centre for Water Resourses and Global Change* (legacy spelling) against *International Centre for Water Resources and Global Change*. **Both locations carry a name that does not fit the portal:** the legacy page's description and website (`gtn-h.info`) are those of the Global Terrestrial Network for Hydrology (GTN-H), with no owner given, and the row here has the same website and no owner under the ICWRGC name. The two sides agree with each other; which name is right is Jordan's call.
- Rows here with no legacy page: **0 of 44**. Rows matched by two legacy pages: 0.

| Fact, 44 pairs | Same | Differs |
|---|---|---|
| website address (and scheme) | 44 | 0 |
| owner | 44 (3 empty on both sides) | 0 |
| geographical scope | 44 (1 empty on both sides) | 0 |

| Field on the legacy page | Pages that have it (of 44) | Here |
|---|---|---|
| name, website | 44 | yes |
| owner / scope | 41 / 43 | yes |
| one-line description | 44 | no |
| accession date | 34 | no (a review date instead, on 2 of 44 rows) |
| link to data (direct, indirect, or an address) | 38 | no |
| API | 38 (31 say "NA", 7 name an API) | no |
| data export formats | 38 (31 give a format) | no |
| restrictions | 14 | no |
| contact (hidden address) | 35 pages, 57 placeholders | no |

The page's own comment says "short columns only: name, owner, scope, link"; October's ruling (`agent/reports/261005_parity-stage7-decisions.md`) chose "one catalog table" and does not say which fields.

**Documents** (79 legacy entries, 77 with a file)

| Kind (legacy entries) | exact | probable | weak | none |
|---|---|---|---|---|
| annual reports (6) | 6 | 0 | 0 | 0 |
| strategic plans (2) | 0 | 2 | 0 | 0 |
| meeting minutes (50) | 0 | 41 | 8 | 1 |
| bylaws (1) | 0 | 0 | 1 | 0 |
| policy pages (2) | 1 | 0 | 1 | 0 |
| reports and publications (18) | 0 | 0 | 0 | 18 |
| **all 79** | **7** | **43** | **10** | **19** |

- **Why 8 minutes are only weak:** the meeting ran over two or more days (the title here reads "January 11–13, 2021"), so the words overlap by 0.57; each has exactly one row here with the same month and year (the second June 2024 meeting is told from the first by pairing best pairs first). **December 5, 2018** is *none* by title (the legacy list label is just a date); the row here with the same month and year is "Membership meeting minutes, December 4, 2018", and the legacy file's redirect rule goes to it. Bylaws and the travel policy are weak because the titles differ ("CUAHSI Bylaws" and "Bylaws"; "CUAHSI Travel Reimbursement Policy" and "Travel Policy").
- **Hosted:** 59 of the 77 file entries (58 by title and date, plus December 2018), and the 2 policy pages as PDF copies of the pages. **Not hosted: 18 of 77**, all in "reports and publications": 9 Summer Institute reports (2016 to 2019, 2022 to 2026), 8 early technical reports (TR1 to TR8, one of them the 2005 community survey), 1 statement (Statement on Holistic Evaluation of Research in Hydrologic Sciences). 104 MB of legacy files. Rows here with no legacy entry by title: **1 of 61** (the December 2018 minutes, which pair by date and by the legacy file's redirect rule; 0 of 61 by date).
- **Redirect rules for legacy files:** 59 of 77 file addresses have a rule to a hosted copy, and in **58 of 59 the rule goes to the row I paired by title and date** (the 59th is December 2018, whose title gave no pairing); 0 rules disagree. 18 have no rule.
- **Duplicates and strays in `public/documents/`:** 65 files on disk; 61 are in `documents.json`, 0 are listed twice, 0 listed files are missing. The other 4 are not library documents (a data management guide and 3 news attachments).

**Hosted files** (61 of 61)

| Check | Result |
|---|---|
| opens as a PDF | 61 of 61 |
| page count against the October copy of the legacy file | 58 of 58 the same (3 have no copy to compare: the 2021 annual report, which is a compressed copy of a 27.7 MB original, and the two policy pages) |
| size in bytes against the legacy file now (HTTP size, 6 November) | 55 of 59 the same; 4 smaller on purpose (2020 and 2023 annual reports, the 2018 to 2023 plan, and the 2021 report, at 0.2 to 0.35 of the original: resampled to 120 dpi in October, `agent/parity/documents-build.py`, which names Jordan's choice only for the 2021 report; I did not check the other three) |
| the legacy file changed since October | 0 of 58 (size now equals the size of the October download) |
| the date in the title found on the first page | 57 of 57; 3 titles carry no date (bylaws, the two policies); 1 PDF has no text on page 1 (the 2022 annual report: I rendered page 1 and read it: "2022 Annual Members Report") |

**Cut-over** (from A2's file, `agent/audit/cutover-261106-urls.csv`; clicks are floors, the export keeps 1,000 rows)

| Legacy addresses | Count | Outcome |
|---|---|---|
| portal pages (1 list, 4 list pages, 44 portals) | 49 (232 clicks) | all 301 to `/data-platforms/portals` (200) |
| library pages | 87 (117 clicks) | 67 to `/about/documents` (200); **20 end in 404** (29 clicks) |
| library pages that end in 404 for a document that **is** hosted | 2 | `2018-membership-meeting-test`, `a-message-from-cuahsis-executive-director` (this is the 2018 to 2023 plan's page) |
| file addresses of the 59 hosted files | 22 of 59 in A2's file (97 clicks) | all 301 to the hosted copy (200) |
| file addresses of the 18 unhosted files | 12 of 18 in A2's file (113 clicks) | all 404 |
| `/travel-policy`, `/authorship-agreement-...`, `/about/policies-and-conduct` | 3 (28 clicks) | all 404 |

## 3. Control (written before the script was run)

`agent/audit/a3e-hand-match-261109.csv`: 10 documents and 10 portals matched by hand from the list pages and the two data files, before the script existed (the file was written first; that rests on my word). 8 documents called matched (2 annual reports, 2 plans, 4 minutes including the December 2018 one), 2 called none. The script agreed on all 20 (`a3e-control-261106.csv`). For documents "matched" in the control means a pairing at weak or above, or a single row with the same date key; that is looser than the report's "matched = exact or probable" (3 of the 8 hand-matched documents are weak by title and 1 is none by title). **The December 2018 case is written into the script** (the legacy label "December 5, 2018" is given the date key 2018-december), so that control row passes because the same reading produced the rule and the answer; the "59 hosted" figure (58 + December 2018) also rests on it. It is a weak control: the 10 portals are all names that are the same or nearly (this site's list was built from the legacy one, so there was no "none" to find and the control holds none); the minutes depend on the date key, which I wrote from the same reading; and by title alone the 8 matched documents are 2 exact, 2 probable, 3 weak and 1 none (December 2018).

## 4. Six items read by hand

**Called matched (3)** (item 3 is weak by title; see the note on the control in section 3):

1. **GEMStat (portal).** Legacy page and row: name, owner (International Centre for Water Resources and Global Change, ICWRGC), scope (global) and website (`waterandchange.org/en/#gemstat`) are the same, exact. The legacy page also has an accession date (June 23, 2017), a one-line description, link to data (indirect), API and export formats (both "NA") and a "Restrictions" line (written request to apply for data, with a contact); none of those is on this site.
2. **2024 Annual Report.** Legacy list and item page: one title and a download. Hosted file `/documents/annual-reports/annual-report-2024.pdf`: 11 pages, 3,332,249 bytes; the legacy file now is 3,332,249 bytes and the October copy has 11 pages; the redirect rule from the legacy file goes to this file. Exact.
3. **January 2022 minutes (the legacy item page's address ends in `-2`).** Legacy title "2022 January Meeting Minutes"; here "Board meeting minutes, January 6–7, 2022" (weak by title, one candidate with the same month and year). The hosted file's first page reads "Jan. 6-7, 2022"; it is the same size in bytes as the legacy `2022-01_Minutes.pdf` (205,641) and the legacy file's rule goes to it.

**Called missing (3):**

4. **Statement on Holistic Evaluation of Research in Hydrologic Sciences.** Legacy item page: a one-paragraph description (about COVID-19 and how research is valued) and one download. Not in `documents.json`, not named anywhere in `content/` or `pages/`. Its page ends in 404 at cut-over (0 clicks recorded) and its file has no rule.
5. **Water Prediction Innovators Summer Institute Report 2025.** Not in `documents.json`. This site's only trace is a link to the legacy host's copy (`250728_SI_Final_Report.pdf`) on the Summer Institute program page (`content/programs/summer-institute.md:60`). Its legacy page, the most-visited of the 18 pages of unhosted documents, answers 404 after cut-over (14 clicks recorded).
6. **The CUAHSI Hydrological Measurement Facility Community Survey 2005 (technical report 8).** Legacy item page: title, three authors (named there), a download. Not in `documents.json`, no mention in `content/` or `pages/`; page and file address both 404 at cut-over (file: 4 clicks).

## 5. Findings

1. **Portal descriptions and restrictions are not carried.** 14 of 44 legacy pages state a restriction on getting the data; a reader of the new table is not told which. The one-line descriptions (44 of 44), the data link type and the formats (38 each) are not carried either. Whether to carry them is a content and layout question for Jordan (section 8).
2. **The "CUAHSI Data Services" portal row links to the legacy host** (`https://www.cuahsi.org/data-services/solutions`), which answers 404 after cut-over (16 clicks recorded). It is the only portal URL on the legacy host (1 of 44).
3. **The hosted files agree with the legacy files on every check made.** 61 of 61 open; pages and sizes agree as in section 2; for minutes only the first day of the title's date was looked for on page 1. The 4 smaller files (resampled or compressed in October, per the build script) were not compared on content; section 6 lists what was not checked.
4. **December 2018 minutes: the legacy list says December 5; the legacy file and this site say December 4.** The item page is titled "2018 Membership Meeting - test". Both locations: `/about/library/board-and-membership-minutes` (label), `2018_Membership_Minutes.pdf` (first page). Which date is right is Jordan's call; the title here follows the file.
5. **20 legacy library pages end in 404 and 2 of them are for hosted documents.** The 18 for unhosted documents are held on purpose in `scripts/parity/redirects.mjs` (rulings of 6 October left open). The 2 for hosted documents (`2018-membership-meeting-test` and `a-message-from-cuahsis-executive-director`) sit in the same held list; I read that as an oversight rather than a ruling, because their documents are hosted (the second is the 2018 to 2023 plan's page).
6. **Three policy pages end in 404 after cut-over** though the text of the first two is here as PDFs (the third page is the policies index; only its bylaws file is hosted): `/travel-policy` (9 clicks), `/authorship-agreement-water-prediction-innovators-summer-institute` (17), `/about/policies-and-conduct` (2). The authorship agreement has the most clicks of any policy page.
7. **This site links to the legacy host for files in 19 places, 16 distinct files** (the whole-site count is A4's task; here are the ones about the library): 5 links are to files that have a hosted copy (`pages/about/governance.vue:66` three links: bylaws, 2023 to 2028 plan, 2025 annual report; `pages/about/index.vue:26` the 2025 annual report; `content/newsletter/260301-march.md:56` the 2025 annual report). Their legacy addresses have redirect rules to the hosted copies, so they will work after cut-over, but only while the rules stay. The Summer Institute page has 8 links to the legacy host for reports: 7 are library entries that are not hosted, and the 8th (`161020_2016-Summer-Institute-Final-Report.pdf`) is a file that is not a library entry (the library's 2016 report is another file). All 8 file addresses end in 404 after cut-over (the 12 of the 18 unhosted file addresses that A2's file holds: 113 clicks; the 2016 final report: 10 more).
8. **Nothing in the library is listed twice here, and the hosted PDFs are not cut up:** 0 duplicates in `documents.json`, 0 missing files.
9. **A first run of the date check was wrong.** It reported 11 meetings whose title date was not on the first page; the pages abbreviate months ("Jan. 9-10, 2025", "Sept. 11, 2024"). The check now allows three-letter month stems; the 11 are found. Logged as a defect.

## 6. Not examined

- **Whether the 44 portal websites still open** and still say what the legacy page said (A4). Not fetched.
- **The text of the 44 descriptions and of the 14 restrictions** (the restrictions text sits in the same element as a hidden contact script; I counted that the field exists, I did not read the 14).
- **Contact on the portal pages**: counted (35 pages, 57 placeholders), never decoded.
- **The 61 hosted PDFs beyond page 1 and page count**: no page-by-page text comparison with the legacy file. The legacy file was not downloaded again; sizes are from the re-crawl of 6 November and the comparison copy is the October download (scratch, not in the repository), so the page-count comparison cannot be re-run from a clean clone.
- **The 18 unhosted legacy files**: not opened (no October copy; not downloaded for this audit). Titles and addresses come from the list pages and `legacy-files.csv`.
- **The three PDFs with no October copy** (2021 annual report, travel policy, authorship agreement): sizes and titles only. For the two policies the hosted file is a copy of a web page, so there is no legacy file to compare.
- **The rendered pages `/data-platforms/portals` and `/about/documents`**: not looked at by me; no code changed here.
- **The legacy library landing page's other sections** (newsletter archive, mailing list): newsletters are A3b.
- **October's click figure for portals (380) against A2's (232)**: different exports; I did not reconcile them.

## 7. Limits of the method

- Matching is by title, never by body text or file content. The date key chooses among rows of the same kind and never changes a level; for minutes it rests on the month and year in the legacy label, so two meetings in one month would be told apart only by pairing best pairs first (it worked for June 2024, checked by hand).
- "Not hosted" means no row here was paired and no row of the same kind has the same date key. A document hosted under a different title and date would be missed (the 18 were also looked for by name in `content/` and `pages/`: found only as links to the legacy host).
- The control is weak (section 3); the portal comparison is expected to look perfect because October's list was built from the legacy list, and it does.
- Sizes are the HTTP sizes of A1's re-crawl; same size is evidence, not proof, of the same bytes.
- Clicks are floors (A2's file keeps 1,000 rows). Every "404 after cut-over" is the outcome in A2's simulation file, not something observed on a live cut-over.
- Some claims rest on a hand search and have no data file behind them: that the statement and technical report 8 are named nowhere in `content/` or `pages/` (a grep by title words), that the restrictions line says "written request" on GEMStat (read by hand from the saved page), that 761 pages are saved (the A1 count), the 16 clicks on the Data Services address (A2's file), and that A2's 87 library addresses are 81 saved pages + the landing page + 5 short addresses (only the sum was checked).
- Page counts, first-page text and the page-1 image of the 2022 report are from `pdfinfo`, `pdftotext` and `pdftoppm` on the Mac that ran this; they are not project dependencies.

## 8. Proposed fixes (for Jordan; none made here)

1. **Portals: which legacy fields to carry.** Option: a short "How to get the data" note per row (link type, API, formats, and the restriction on the 14 pages that have one), as a new optional field in the schema (a code PR first, then a content PR). Or leave the table as it is and say so on the page. Contact stays out (C11).
2. **The Data Services portal row** points to the legacy host. Options: point it to `/data-platforms` (the nearest page here), drop the row, or leave it; a one-row content PR whichever you choose.
3. **Redirects, rule 8 (you approve):** the 3 policy pages (to `/about/documents`, or to `/about/governance` for the policies page; your choice), and the 2 library pages whose documents are hosted (to `/about/documents`). A change to `scripts/parity/redirects.mjs` and the generated file.
4. **The 18 unhosted documents:** October ruled "publish the Summer Institute reports later as cited HydroShare resources". The 10 "other" documents of October (8 early papers, the statement and a test page) were not ruled; the held list in `redirects.mjs` also holds the page of the 2018 to 2023 plan. Options: host them here as the other documents; link out to HydroShare where they exist; leave to 404. Until then the Summer Institute program page links 8 reports on the legacy host (7 library entries and the 2016 final report, a file that is not a library entry); none of the 8 will open after cut-over.
5. **Links to the legacy host for hosted files**: change the 4 in `pages/about/governance.vue` and `pages/about/index.vue` to the hosted paths (a small code PR); the newsletter issue is an input and stays (C9). Low priority while the redirect rules stand.
6. **December 2018 minutes:** nothing to change here; tell me if the legacy label was right and the file is wrong.
7. **Review dates on the portal table:** 2 of 44 rows have one; the page says each entry is reviewed yearly. Same question as A3d (who reviews the rest).
