# Parity stage 7: status update and remaining decisions (6 Oct 2026)

Written for PR 62. It supersedes the "Needs your ruling" list at the end of `261005_parity-stage7-decisions.md` where the two differ. `dispositions.csv` still holds the 5 October proposals (`decided_by = proposed`); this page records what has since been ruled and built. Counts below were taken from the files on `main` on 6 October.

## What has been ruled and built since 5 October

| body of work (stage 7 row) | your ruling | built, and where | PR |
|---|---|---|---|
| Graduate programs (137 legacy URLs, 2,646 clicks) | option A: one table, under Learn & Train | `/learn-train/graduate-programs`: 102 institutions (the 30 list pages, 5 institutions listed twice merged); only Boise State carries a review date | 64, 65, 69 |
| Water data portals (49 URLs, 380 clicks) | option A: one table, under Data & Computing | `/data-platforms/portals`: 44 portals, sorted global, USA, then other scopes; DataStream and Aquastat marked reviewed | 64, 65, 66, 68 |
| Document library (87 URLs, 159 clicks) | option A, with **meeting minutes public**, on the About page | `/about/documents`: 59 documents hosted (50 minutes, bylaws, 2 strategic plans, 6 annual reports); the 2020, 2021, 2023 reports and 2018 to 2023 plan were compressed | 64, 67 |
| Tab rows (About, Learn & Train, Data & Computing) | yes | `SectionNav` on nine existing pages and the three new ones | 64 |
| e-Newsletters (19 URLs, 138 clicks) | already proposed as merged | issues from January 2026 are on the site (nine files, January to September 2026) | 63 and earlier |

Not built yet from the document library: the **9 Summer Institute and technical reports** (you ruled: publish later as cited HydroShare resources and link out), the **10 "other" documents** (early white papers, a 2005 survey, a statement, a test page) and the **11 category and empty pages**. The 50 minutes hosted compare with 49 titled in the legacy library: one membership meeting (December 2018) and one winter Board meeting (January 2023) are counted.

## What this changes in the stage 7 numbers

Three of the four "absences by design" now exist (graduate programs, portals, the library's core). Of the 25 bodies, 3 are now built with data and 1 (e-Newsletters) was already; 21 bodies are still as proposed. **No redirect file has been generated for any body**: every legacy URL of the finished bodies (137 + 49 + 87 = 273 URLs) still points at the old host or nowhere on this site, because redirects change URLs and need your approval first (rule 8).

## What remains for you to decide

Numbered by what unblocks the most. My recommendation follows each.

1. **Approve generating redirects for the three finished bodies first.** That is 273 legacy URLs (graduate programs 137, portals 49, library 87) with an exact target each, as one small code PR, so the traffic on them (about 3,200 search clicks) stops landing on the old host. *Recommend: yes, as the next code PR, separate from the rest of the redirect list.*
2. **The remaining 21 bodies: yes, or change.** The table in the decisions page is unchanged. *Recommend: rule on the tier A rows first (Home and landing pages, Job board, Programs and projects, Data tools, Staff directory, Workshops, About and governance, Policies and conduct, Donate), then the tier B and C rows by exception.*
3. **Guest lecturers (81 URLs, 135 clicks):** one table, or drop. It needs a staff check that the list is current. *Recommend: ask staff; if nobody can confirm it this week, drop it (option C) and redirect to the programs page.*
4. **The 10 "other" library documents:** host them under the Historical papers section (the page already draws it), redirect them to the documents page, or drop them. *Recommend: look at the ten files first; host the ones with a clear author and date, drop the test page.*
5. **Where the Summer Institute report URLs go until the HydroShare versions exist.** *Recommend: the Summer Institute program page.*
6. **Eight cited URLs not in the snapshot** (6 old job postings this site's job entries link to; `/apply/watersofthack`; `/register/open-house`). They need a look at the live site: the job entries should link to the real posting or be retired. *This is yours or a staff member's check; I cannot see the live site as a visitor.*
7. **`/lets-talk-about-water`** (31 clicks): not seen. *Recommend: look at it, then redirect or migrate.*
8. **Tool addresses:** JupyterHub is `jupyter.cuahsi.org` here and `jupyterhub.cuahsi.org` on the legacy site; which is right?
9. **Policies and conduct (4 URLs, 34 clicks) and Travel Policy:** an obligation with no page here. Needs staff to supply the text or to say it has changed. *Recommend: a content task once a staff member provides the current text.*
10. **Whether the decision page should be cut to a true single page** (it is about 1,400 words of tables).

## Follow-ups that you have already ruled, queued as code work

- **Governance page:** "Adopted by member vote, September 8, 2024" in place of "last updated July 2024", and its links to the bylaws, strategic plan and annual report switched from the legacy copies to the hosted ones. (The about overview page links the same legacy copies.)
- **Visual baselines:** nine existing pages changed by the tab rows; their screenshot baselines need refreshing in their own PR.
- **A link audit sweep** (external and page links, 404s), in the roadmap's Noticed list.

## What I did not check

I did not re-fetch the legacy site for this update, so the legacy numbers (URLs, clicks, titles) are the 5 October counts. The 3,200-click figure in item 1 is the sum of the clicks in the stage 7 table for the three bodies (2,646 + 380 + 159), not a new measurement, and search clicks are for a period the export does not state.
