# A1: Re-crawl of www.cuahsi.org and diff against the 5 October snapshot

Site audit task A1 (org issue 100, epic 99), 6 November 2026. Read-only on the legacy site. Snapshot: `raw/legacy-site/261106/` (gitignored). Outputs: `agent/audit/recrawl-261106-urls.csv` (one row per URL, 784 rows) and `recrawl-261106-numbers.json`. Scripts: `scripts/parity/recrawl-diff.mjs` (the diff) and `scripts/parity/recrawl-control.mjs` (the live controls); the crawler is the October one, `scripts/parity/fetch.mjs`, unchanged.

## What was done

- **Crawl:** 894 requests (776 page URLs and 118 HEADs for linked files), one at a time, spacing 1.5 s fixed by the script (measured 1.9 s per request), User-Agent naming CUAHSI and a contact address. No robots.txt exists on the site (404), so there was no delay to honour. No failures, no stop marker.
- **A slip, caught by self-check:** I started the crawl without saving the sitemap into the snapshot folder (October's "stage 0" step). The first pass (657 requests) therefore followed links only and found 536 pages; the diff showed 234 pages "removed", which was an artefact. I saved the sitemap I had fetched earlier that day (687 URLs) and ran the crawler again; it resumes from its own log and fetched the missing pages. The numbers below are from the completed snapshot.
- **Diff:** both snapshots read from their saved logs and pages, never the live site. The text of each page's `<main>` is hashed (scripts, styles and SVGs removed, whitespace collapsed).

## Counts (denominators in each line)

| | 5 Oct | 6 Nov |
|---|---|---|
| URLs requested | 767 | 776 |
| answered 200 | 755 | 761 |
| answered 302 | 8 | 8 |
| answered 404 | 4 | 7 |
| URLs in the sitemap | 681 | 687 |
| sitemap URLs that answered 200 | 678 | 684 (the other 3 answered 302) |

**The diff, 784 URLs in either snapshot:** 693 same, 5 empty, 47 changed, 16 added, 10 removed, 13 other. The 13 "other" are the 8 pages that answer 302 in both snapshots, the 4 that answer 404 in both, and one URL that exists only in the new snapshot and answers 404 (the careers link below). The 5 "empty" are legacy pages whose `<main>` holds no text in either snapshot (`/library/annual-report`, `/library/board-meeting-minutes`, `/library/membership-meeting-minutes`, `/library/strategic-plan`, `/library/technical-report`): they have the same hash whatever they hold, so they were **not compared**.

- **Added 16** (all 200 now): 10 job postings, 3 events, 2 news items (the October 2026 e-newsletter and an anniversary reflection), 1 workshop. All 16 are in the sitemap.
- **Removed 10:** 9 job postings and 1 event (`/events/virtual-open-house`). Each of the 10 was requested by `recrawl-control.mjs` and answers **404** (10 of 10; the output is in `agent/audit/recrawl-261106-control.txt`). They are expired postings and a past event the site took down. Two were still linked from one page each and answered 404 in the crawl; the other 8 are in no page's links and not in the sitemap (none of the 10 is in the sitemap).
- **Changed 47:** workshops 22, 9 under `/community` (including news listing pages), job board 5, cyberseminars 3, about 2, events 2, home 1, and one each for three other pages. Of the 22 changed workshop pages, 20 differ by 3 words or fewer; the other 2 are the past-workshops listing pages (38 and 53 words) and are not explained. In three of the 20 read by hand (`advanced-short-course-integrated-simulation-of-wat…`, `diy-water-monitoring-data-portals-and-watershed-mo…` and `hands-on-hydrogeodesy-combining-gps-and-hydrologic…`, as their file names start), the page now prints a full date ("October 3, 2019") where October's text held only the day ("3"). That looks like a template change across the 20, but I read 3 of the 20. The largest changes are `/events/2026-american-geophysical-union-annual-meeting` (276 to 565 words) and the listing pages.
- **404 now (7):** three links written as bare email addresses on one news page (`/community/news/floodsavvy`; addresses not recorded here, P8) and `/events/agu-meet-greet-national-water-center-innovators-program-summer-institute`, which were 404 in October too; two postings that were removed (above); and `/job-board/www.mccormick.northwestern.edu/civil-environmental/careers.html`, a link written without `https://` on a job posting (`/job-board/assistant-or-associate-professor`, one of the 16 added), so it resolves as a path on the legacy site.
- **302 now (8):** `/about`, `/community/job-board`, `/data-models/discovery-and-analysis`, `/data-services`, three `/grant-opportunities/*` pages and one event: the same 8 as in October.
- **Files:** 118 linked files against 116 in October; 2 added (a 2026 board candidates bios PDF and an "about" flyer), none removed. Their sizes were not compared here (A4).

## Findings that matter for the other tasks

1. **218 of the 684 sitemap pages that answer 200 are linked from no other fetched page** (215 in October), and 77 pages answer 200 that are in no sitemap (79 in October). A crawl by links alone found 536 of the 761 pages. The sitemap and the links each miss pages the other has, so every later task must start from both.
2. **The legacy site is being edited:** 16 pages added, 10 removed and 47 changed in 32 days; most movement is job postings, events, news and workshops. A2's URL list should be made from this snapshot, and re-made on the day of cut-over.
3. **One job posting links its employer's site without `https://`,** so the link points inside the legacy site (404). Whether the new site's job entries carry the same fault is for A4.

## Controls (script run against the live site on 6 November)

1. **The diff against itself:** October against October gives 755 "same" and 12 "other", 767 URLs, 681 sitemap URLs, 883 requests: the figures of `agent/parity/stage1-numbers.json`.
2. **Stability of the hash:** 10 pages the diff calls unchanged, taken evenly across the list, were fetched again a few hours after the crawl; **10 of 10** have the same hash as the snapshot. The 5 pages most likely to move (home, `/events`, `/community/news`, `/job-board`, `/cyberseminars`) were fetched again too: **5 of 5** have the hash they had in the snapshot. That is 15 of 15 stable over a few hours. It does not show that no page changes between a crawl and a later one, and it did not test a changed page.
3. **Existence:** all 16 added URLs answer 200 (16 of 16) and all 10 removed answer 404 (10 of 10), requested by the control script.

**The sample read by hand (rule 12):** unchanged `/about/contact-us`, `/community/news/cuahsi-engagement-offerings` and `/events/navigating-the-nsf-hydrologic-sciences-program` (same hash on refetch); added `/community/news/cuahsi-e-newsletter-october-2026`, `/events/2026-annual-membership-meeting` and `/job-board/postdoctoral-researcher` (200); removed `/events/virtual-open-house`, `/job-board/survey-hydrogeologist` and `/job-board/assistant-professor-in-climate-science` (404); changed, the three workshop pages above; "other", the careers link page `/job-board/assistant-or-associate-professor` (read to find the broken link). "Read" for the removed ones means their status, not their former content.

## Not examined

- Page contents beyond the `<main>` text: navigation, footer and images are not in the hash, so a change only there is not counted. Counts: not measured.
- Embedded content, forms and JavaScript-built pages: the crawler reads HTML only.
- Whether each changed page changed in a way that matters: that is A3's job, type by type. Only 3 of the 20 small workshop changes were read, and 2 job pages whose hash changed with the same word count (57 to 57 words) were not explained.
- The 5 pages with an empty `<main>` (above): not compared.
- The 118 linked files were sized with HEAD requests and not opened.
- Pages behind a login, none were found.
- The two sitemap URLs with non-ASCII letters were compared after decoding the percent signs; the sitemap's own spelling was not changed.

## Proposed next steps (for Jordan)

- A2 (cut-over simulation) can start from `recrawl-261106-urls.csv`.
- Keep the snapshot; re-run `fetch.mjs --date <new>` (with the sitemap saved first) and `recrawl-diff.mjs` on the day before cut-over.
