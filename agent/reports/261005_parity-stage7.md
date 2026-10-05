# Parity stage 7: dispositions (supporting detail, 5 Oct 2026)

The decision page for Jordan is `agent/reports/261005_parity-stage7-decisions.md`. This file holds the method, counts and checks behind it. Read-only on both sites; nothing under `content/`, `pages/` or `components/` changed. Script `scripts/parity/dispositions.mjs`; outputs `agent/parity/dispositions.csv` (28 rows: 25 bodies and 3 groups of URLs outside every body), `dispositions-urls.csv` (104 URL rows), `dispositions-numbers.json`. Every row has `decided_by = proposed`: the fates, targets and reasons are **my judgments (P6)**. **The redirect draft (`redirects-draft.txt`) is not generated**: the plan makes it follow Jordan's rulings, and this stage stops for them. Stage 6 (PR 61) has merged: the script reads its outputs from the repository, and a re-run on this branch reproduces the files unchanged.

## 1. Counts (with denominators)

- **25 bodies, 767 URLs:** 14 migrated (510 URLs, 14,902 clicks), 10 merged (245 URLs, 4,895 clicks; Donate is `merged` because the legacy page has an equivalent here, which the plan's `redirect` does not allow), 1 retired (the broken or empty URLs: 12 URLs, 358 clicks), 0 redirect, 0 `undecided` at body level. No body is `external`: the tool pages could be, but the tools' own addresses differ between the sites (stage 5), so I proposed `merged` and ask Jordan.
- **11 bodies are "to build"** (385 URLs, 4,005 clicks): 8 of the 14 migrated (graduate programs, policies and conduct, water data portals, grants and fellowships, the document library, guest lecturers, small pages, the data management guide) and 3 merged (faculty resources, student resources, instrumentation facilities). These become content tasks in stage 8. The other 6 migrated bodies exist here, some thinly.
- **Outside every body (174 www URLs, 1,436 clicks):** job-board URLs 83 (716 clicks) redirect to `/community/jobs`; files 66 (496 clicks) are hosted if they are reports or plans and redirect to a reports page otherwise; other pages 25 (224 clicks) redirect by path prefix (staff to `/about/team`, events, news; the home page for `/search`), except `/lets-talk-about-water`, which is `undecided` because I have not seen it (a first version marked it redirect; a reviewer caught it).
- **Rows resting on an inference: 20 of the 28** (17 bodies and the 3 outside groups). The `inferred` column says what; the decision page marks them with a dagger. The 8 rows without one are the home and landing pages, job board, staff, workshops, About/governance/membership/contact, Donate, Water Science Exchange and the broken URLs, which rest on stage 4 matches and the built site.
- **dispositions-urls.csv (104 rows):** every row names its rule; matches use stage 4's exact and probable matches only; the tier A URLs with most clicks or in the navigation, every cited URL (47), and every outside-body URL with 20 or more clicks. Fates: 53 migrated, 29 merged, 12 redirect, 1 retired, 9 undecided (the 8 cited URLs not in the snapshot, whose entries here need a look at the live site, and `/lets-talk-about-water`).
- **Targets checked against the built site:** of the 104 URL rows, **69 have a target route that exists in `.output/public`**, **35 have an empty target** (the page is still to be built, the URL is undecided, or the fate is retired). No row has a target that is missing from the built site.

## 2. What the proposals assume

- A URL with an exact or probable stage 4 match goes to that match (rule `matched in stage 4`), not to the body default. Weak matches are not used for redirects.
- This site's own links to the legacy host (32 pages and 14 files, stage 5) matter here: if the new site takes over www.cuahsi.org, every one of those links lands on this site and needs a target. That is one more reason the legacy URLs should have a fate.
- Hosting report PDFs here means files under `public/` that outside pages link to: that is a rule 8 change and needs Jordan's approval.
- Fates are for the URLs as they were in the 5 Oct 2026 snapshot. The legacy job archive and similar pages that are not in it are treated by prefix rule.

- The `/learn-train/programs` index page does not exist (only the four program pages), so the programs body's default target is `/learn-train` (a reviewer caught my first version saying otherwise).

## 3. Six-item check (P5)

Present or resolved, read in `dispositions-urls.csv` and checked in the built site: `/about/about-membership` → `/about/membership` (route exists), `/about/contact-us` → `/contact` (exists), `/donate` → `/support` (exists). Missing or open, read the same way: `/about/policies-and-conduct` (fate migrated, target empty: to build), `/job-board/research-scientist` (outside every body, redirect to `/community/jobs`, route exists, not fetched), `/lets-talk-about-water` (undecided, I have not seen it).

## 4. Not examined

- No legacy page was opened for this stage; proposals use titles, sizes, traffic and the earlier stages' reading. The `inferred` column lists each exception.
- The document library is described by title only; no document was opened.
- Whether the Search Console export covers twelve months (not in the file), and the clicks outside the top 1,000 pages.
- Whether this site can show past events or expired jobs on its list pages.
- Legal or contractual reasons to keep a body (a conduct policy, minutes) that I cannot see.

## 5. Personal data (P8)

No email addresses or phone numbers. The guest lecturer proposal omits contact details deliberately; the legacy page hides emails with a script and I did not decode it.
