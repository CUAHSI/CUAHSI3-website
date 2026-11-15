# Critical Zone legacy sites: inventory (epic ticket T1)

Date: 28 October 2026. Branch `task/cz-legacy-inventory`. Read-only crawl; no site code or content changed.
Tool: `scripts/legacy-crawl.mjs`. It waits 3 seconds before every request. On 28 October I fetched both sites' robots.txt and
each says only `Crawl-delay: 3`, no Disallow. The script does not read robots.txt itself.
Output: `agent/reports/261028_cz-legacy-inventory.csv` is one row per URL found, 10,671 rows (the 13,017 found minus the 2,346 image and
document rows). The raw crawl is in `.agent/crawl*/` (gitignored). The CSV was merged and filtered from the three runs by a one-off
command, not by the script. In that one-off step I also relabelled the 798 pass-1 dataset rows from `list`/`archive-page` to `detail`/`archive-dataset`, so the `type` column now gives all 919 datasets; the raw `.agent/crawl/pages.csv` still has the old labels.

## How the crawl ran

Three runs, because the first was flawed:

1. **Pass 1** (default seeds): stopped at its cap of 2,500 pages with 3,910 URLs queued. It had no rule for archive dataset pages and
   spent the cap on them (logged as a defect).
2. **Pass 2** (a seed list of everything pass 1 had not fetched, plus probes of CZNet's cluster pages; dataset, publication and CZNet
   news pages fetched in full): 4,956 unique pages (the script's counter said 4,986: 30 more requests than unique pages; the script did not de-duplicate its seed list, which is the likely cause, not confirmed by a run; fixed since), **ended with an empty queue**, under the 5,000 cap. 12 requests failed on the network.
3. **Pass 3**: the 12 failed requests again; all 12 returned 200.

## Headline counts (merged, three runs)

13,017 distinct URLs found. 7,456 fetched. 5,561 not fetched.

| | Found | Fetched | Not fetched |
|---|---|---|---|
| Archive site (czo-archive.criticalzone.org) | 11,565 | 6,332 | 5,233 |
| CZNet site (criticalzone.org) | 1,452 | 1,124 | 328 |

Of the 7,456 fetched: 7,347 returned 200 and 109 returned 404 (in-site links to pages that do not exist, for example
`/national/infrastructure/sensors-field-instruments-1national/`).

The 5,561 not fetched are: 2,346 image and document files (not fetched on purpose) and 3,215 archive detail pages that were
**sampled on purpose** (4 fetched per type, the rest counted from links): news stories 1,480 found, events 795, people 930, blog posts 38.
Every listing, section and other non-detail page found was fetched. So: counts of news, events, people and posts are counts of links
found on listing pages, not pages read.

| Archive detail pages | Found | Fetched |
|---|---|---|
| Publication pages (`/<czo>/publications/pub/<id>`) | 3,286 | 3,286 (3,283 returned 200) |
| Dataset pages (`/<czo>/data/dataset/<id>`) | 919 | 919 (917 returned 200) |
| News stories | 1,480 | 8 sampled |
| Events | 795 | 8 sampled |
| People | 930 | 8 sampled |
| Blog posts | 38 | 4 sampled |

CZNet news and event pages (`/news-events/<slug>`): 229 found, all fetched. CZNet people pages: about 524 fetched, plus 49 under `/people-roles/`.

Publication pages per observatory (a publication shared by observatories is counted in each): Shale Hills 559, Calhoun 522, Sierra 421,
Catalina-Jemez 384, Luquillo 348, Boulder 287, Reynolds 203, IML 201, Christina 164, National 100, Eel 96, plus 1 under the stray path
`/jemez-catalina/`. Total 3,286. By page name (last part of the URL) there are **2,864 distinct names**; that is an upper bound on distinct
publications, not a count of them, because I did not check that equal names are the same paper nor that different names are not.

Of the 3,286 publication pages, 1,334 contain a DOI-like string; of 919 dataset pages, 22 do; of CZNet's fetched pages, 44. These are pattern
matches on the HTML, not checks that a DOI resolves or is the work's own (a page can cite someone else's DOI).

### Archive: URL patterns (11 sub-sites, one per observatory plus `national`)

`/<czo>/` where `<czo>` is one of `national`, `boulder`, `calhoun`, `catalina-jemez`, `christina`, `eel`, `iml`, `luquillo`,
`reynolds`, `shale-hills`, `sierra`. Under each: `/about/`, `/research/`, `/data/`, `/publications/`, `/people/`, `/news/`, `/events/`,
`/infrastructure/`, `/education-outreach/`. Detail patterns: `publications/pub/<name>/`, `data/dataset/<id>/`, `news/story/<id>/`,
`events/event/<id>/`, `people/person/<id>/`. Listing patterns: `publications/year/<yyyy>/`, `events/year/<yyyy>/`,
`research/discipline-tags/<tag>/`, `about/partner/<id>/`. The crawler adds a trailing slash to every archive path; whether the site also
answers without one was not checked. The archive pages have no `<title>` my pattern found (2,462 of the 2,468 archive pages pass 1 fetched came back
empty; pass 1 fetched 2,500 in all, 32 of them CZNet), so the CSV `title` column is useless on both sites.

### CZNet: structure found

Plain server-rendered HTML; every page's `<title>` is "CZNet". Home; `/news-events`, `/about`, `/contact`, `/opportunities`, `/data`,
`/publications`, `/other-publications`, `/education_outreach`, `/people`, `/people-roles/*`, `/terms-and-conditions`; the coordinating hub
`/hub`; nine cluster sites `/bedrock`, `/bigdata`, `/cinet`, `/coastal`, `/drylands`, `/dust2`, `/dynamic_water`, `/geomicrobiology`,
`/urban`. Fetched pages by area: `/people` 524, `/news-events` 222, bedrock 54, `/people-roles` 49, hub 32, dust2 32, bigdata 22,
dynamic_water 20, and 17 to 19 each for cinet, drylands, coastal, urban, geomicrobiology.

I probed `/<cluster>/{about,publications,data,people,news-events,education_outreach}` for the hub and nine clusters (60 URLs). The two I read
(`/urban/publications`, `/bedrock/data`) show: a cluster publications page is **a free-text list of citations**
(authors, year, title, some with DOIs), not a structured list; a cluster data page tells the reader to use the Data Discovery Portal and
filter by cluster, then lists site names. `/nsfczo` and a made-up path return 404, so the 200s on the probes are real pages. I did not read
the other 58 probe pages. The cluster publication lists are therefore **fetched but not parsed**; extracting them is T6 work.

## Discover (discover.criticalzone.org)

Discover is a JavaScript app over a public JSON API, `https://contribute.criticalzone.org/api/discovery`
(`/search?pageSize=100&pageNumber=N`, `/typeahead`, `/clusters`). Records are schema.org `Dataset`. I harvested **761 records** (pages 0 to 8,
saved in `.agent/discover/`), which matches the footprint analysis's count. The harvest was run by hand, not by a script on this branch,
with no recorded delay, so it cannot be reproduced from the branch; the only completeness check is that 761 equals that outside count.
`contribute.criticalzone.org/robots.txt` returns the app's HTML page, not a robots file.

## Outbound links

588 distinct outside hosts, summed over the three runs. Top by link count, counting repeats (most of the big numbers are the site-wide header
and footer repeated on each page, not distinct targets): twitter.com 12,978; youtube.com 8,919; nsf.gov 6,429; czen.org 6,313; Mailchimp archive
6,307; eepurl.com 6,277; facebook.com 4,971; instagram.com 3,125; **dx.doi.org 2,717**; **hydroshare.org 1,991** (`www.` 1,988 plus the bare host 3); datacite.org 1,927;
cuahsi.org 1,104; czo.psu.edu 896; ars.usda.gov 782; data.imlczo.org 760; sndl.ucmerced.edu 689; sas.upenn.edu 639; czo.arizona.edu 630;
info.reynoldscreekczo.org 387 (font and script hosts such as fonts.googleapis.com, 4,376, left out). Several observatory sites also appear as
outside hosts (`czo.psu.edu`, `czo.arizona.edu`, `data.imlczo.org`, `info.reynoldscreekczo.org`); whether they are live, redirected or gone
was **not checked** (a retirement-planning question for T16).

## Findings that matter to the next tickets

1. **Dataset pages are the bridge to HydroShare.** 797 of the 2,463 HTML files pass 1 saved (2,500 requests; the rest were not HTML or failed) contain `hydroshare.org/resource` (grep count); that
   fits the 798 dataset pages fetched in pass 1, but I did not check it is the same pages or one resource each. The two I read
   (`/national/data/dataset/2514/`, `/boulder/data/dataset/2821/`) each carry one. All 919 dataset pages are now saved, so T6 can parse
   them without another crawl.
2. **All 3,286 publication pages are saved**, and 1,334 carry a DOI-like string, so T6 can build the publications list with DOIs from them
   without another crawl. Distinct publications are at most 2,864.
3. **CZNet cluster publication and data pages are free text** with some DOIs and point to the Discover portal for data. They need parsing or a
   hand-built list.
4. The archive has stale links: 109 404s among 7,456 fetched pages.

## Limits (what this report does not establish)

- News, events, people and blog posts are counted from links on listing pages; only 4 per type (8 for the three largest) were fetched.
- The archive site has no sitemap, so a page nothing links to is missed. The pass-2 seed list came from pass 1's own links, so it adds nothing for such pages.
- Page content was parsed only for status, size, a title pattern that mostly came back empty, and a DOI-like pattern. No usage counts were
  collected (that is T2). Nothing was parsed into publications or datasets (that is T6).
- Image and document URLs were recorded, not fetched or checked.
- `viz.criticalzone.org` and `search.criticalzone.org` are separate hosts and were not crawled.
- Finding 1's HydroShare grep is from pass 1 only; I did not repeat it on the final set.
- The script's new `--seeds-file`, `--skip-fetched` and `--all-types` options were run in passes 2 and 3; that is the only test of them.

## Sample check (rule 12)

I read the saved HTML of these, not every line. Affected (fetched in the later passes or by the dataset rule): the dataset pages
`/national/data/dataset/2514/` and `/boulder/data/dataset/2821/`, and the CZNet cluster pages `/urban/publications` and `/bedrock/data`.
Unaffected (fetched in pass 1 or sampled): CZNet `/`, CZNet `/publications` and `/news-events/critical-zone-science-and-the-path-ahead`.
I did not open the other 7,000 or so fetched pages.

## Addendum, 2 November 2026: education-outreach pages (the count the ticket asked for)

Ticket T1 asked for URL counts by section including education resources; this report did not give that count. From the CSV above (10,671 rows), counting rows whose `section` is an education-outreach section:

| | Rows | Of which |
|---|---|---|
| Archive (`czo-archive.criticalzone.org`) | 125 | 65 under `national/education-outreach`, and 6 under each of the 10 observatories |
| CZNet (`criticalzone.org`) | 22 | 2 under each of 11 `education_outreach` sections (the network's own and the Hub plus 9 clusters) |
| **Total** | **147** | all fetched (147 of 147) |

What this is and is not: the rows are pages (listing and section pages), not individual education resources. I did not count the resources listed on those pages. Why each CZNet section has two rows was not checked. A further 14 rows have `education-outreach` in the address but sit in other sections (for example `events/cat/education-outreach/`, an events category); they are not in the 147. The count was made by reading the CSV with a small script on 2 November 2026; the CSV was not changed.
