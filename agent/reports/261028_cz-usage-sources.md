# Critical Zone usage data: where the numbers come from (epic ticket T2)

Date: 28 October 2026. Read-only research; two HydroShare resource pages and one paper DOI were looked at, so every statement rests on two or three examples. Nothing is harvested yet.
Question (T2): can "key" datasets and papers be ranked by usage per year since publication, from public sources, without server logs?

## Answer in short

| Item | Source | What it gives | Year-by-year history? |
|---|---|---|---|
| HydroShare resource: views, downloads | The resource's landing page, `https://www.hydroshare.org/resource/<id>/`, in the HTML itself (two table rows, "Views:" and "Downloads:") | One total each | **None found**: a total only, on the two pages I read |
| HydroShare resource: dates | The same landing page: its embedded JSON-LD has `dateCreated` and `dateModified`, and the page shows "Last updated" | Dates | n/a |
| Paper: citations | OpenAlex `GET https://api.openalex.org/works/doi:<doi>` (`cited_by_count`, `counts_by_year`) | Total and per-year | **Yes** (one DOI tested) |
| Paper: citations (second source) | Crossref `GET https://api.crossref.org/works/<doi>` (`is-referenced-by-count`) | Total only | No |

So the user's expectation is right for views and downloads: they are public, on the page, and need no logs. But they are **totals since
the resource was created**, not a history. "Usage per year since publication" can only be computed as total divided by years elapsed,
which is the rate the epic defined as "key" (usage relative to time since publication). It cannot show a trend.

## HydroShare's robots.txt, and a mistake of mine

I read `https://www.hydroshare.org/robots.txt` after the probes below. It says: `Crawl-delay: 5`; `Disallow: /hsapi`, `/django_irods/download/`, `/o/`, `/accounts/login/`, `/sign-up/`, `/tracking/applaunch/`; and allows `/search/`. Resource landing pages (`/resource/<id>/`) are not disallowed. **My probes of `/hsapi/resource/<id>/sysmeta/` (2 requests) and `/hsapi/resource/?full_text_search=...` (1 request) went to a disallowed path**, and my landing-page fetches had no 5-second spacing (3 requests over about a minute, then a browser visit). Logged as a defect on this branch. A harvest must therefore use only landing pages, wait at least 5 seconds, and not call `/hsapi`. On the landing pages I saw views, downloads and created date on both pages read. On a *published* resource (`064e5da7690048849e31bf36c524ba7f`, one request) I also saw its DOI (`10.4211/hs.<id>`) and a `datePublished` (2025-01-30; created 2024-09-23; views 3915; downloads 132). The first resource was unpublished and has no DOI. That is two pages in all, so "nothing is lost" is a hope, not a finding.

## What I checked

One HydroShare resource, `9db9d7aa0a194667b0e9ca5e996d5c96` (a Chester County stream chemistry dataset from the Christina River Basin
observatory, linked from archive dataset page `/national/data/dataset/2514/`):

- Fetched its landing page with curl (an ordinary GET with a User-Agent naming the project and `help@cuahsi.org`). The HTML contains
  `<th>Views: </th><td>5124</td>` and `<th>Downloads: </th><td>134</td>`. Opening the same page in a browser a little later showed
  Views 5125 and Downloads 134. The difference of one is **not shown to be caused by my visits**: another visitor or a bot could have added it to a resource with about 5,000 views. If page reads do count, a harvest would add about one view per resource; that is a guess from one observation. The harvest should record each count with its date and not reread resources.
- Asked the API (a disallowed path, see above) for the same resource: `/hsapi/resource/<id>/sysmeta/` returns title, authors, `doi` (null
  here), `published` (false), `date_created` (2019-11-18), `date_last_updated`, and `bag_last_downloaded`, and **no view or download count**.
  The list endpoint (`/hsapi/resource/?full_text_search=...`) returns the same fields per resource and also none. The landing page has the
  dates too (JSON-LD `dateCreated`), so the API is not needed. The "no counts in the API" finding came from those disallowed requests, so it is not independent of the mistake.
- Asked OpenAlex and Crossref for one DOI (`10.1029/2004EO280001`): OpenAlex returned `cited_by_count` 94 and a `counts_by_year` list
  (2026: 1, 2025: 4, 2024: 5, ...); Crossref returned 80 for the same paper. The two sources disagree, as expected.

## Consequences for the design

1. **Datasets: rate, not trend.** Views and downloads are totals. Rank by (views + downloads) per year since `date_created`, and say so on
   the page. Two cautions: (a) `date_created` is when the HydroShare resource was made, which for CZO data is often years after the data
   were collected (this resource: data 2007 to 2015, resource created 2019), so the rate is "since it went on HydroShare"; (b) views
   include bots and crawlers, which HydroShare may or may not filter (not checked).
2. **Papers: real history is available** from OpenAlex for any paper with a DOI. 1,334 of 3,286 archive publication pages contain a
   DOI-like string (T1), so about 40 percent can be ranked on citations by this route; the others need a DOI found by title match (OpenAlex
   can search by title) or stay unranked. I did not test title matching.
3. **Publication date for datasets** is not on the landing page either; only the created date. The footprint analysis had the "published" dates for some;
   not re-checked here.
4. **Harvest cost:** one request per dataset landing page, at least 5 seconds apart (HydroShare's `Crawl-delay`), for up to about 1,200
   resources (761 Discover records plus the 919 archive dataset pages, which overlap; the distinct HydroShare resources are not yet counted),
   so up to about 100 minutes. OpenAlex lets you batch DOIs (up to 50 in one filter), so the citations side is a few dozen requests.
5. **Dated data file:** record the harvest date with every count, since all of these change.

## Evidence saved

`.agent/hs_landing.html` (unpublished resource page), `.agent/evidence/hs_published.html` (published resource page), `.agent/evidence/hydroshare-robots.txt`, `.agent/evidence/openalex.json`, `.agent/evidence/crossref.json` (first 3,000 characters). All gitignored. robots.txt and the OpenAlex and Crossref responses were fetched a second time to save them. The sysmeta and list responses were not saved and are reported from my reading of them, and the browser reading of 5125 is not saved.

## Not checked

- HydroShare's terms of use (only robots.txt was read).
- Whether view counts exclude bots.
- Whether any HydroShare endpoint gives per-year views (I found none in the API responses I read; the HydroShare source code was not read).
- That OpenAlex accepts up to 50 DOIs in one request (stated from memory, not tested).
- Title-based DOI matching, and OpenAlex coverage for the CZ papers beyond one DOI.
- Usage for resources outside HydroShare (IEDA, EDI, NCEI and other repositories named on archive pages).

## Next

Harvest views, downloads and `date_created` for the HydroShare resources named on the 919 archive dataset pages and the 761 Discover
records (T6 builds the list; this report is the method). Decide with Jordan: is "rate since the resource was created" an acceptable
meaning of "key" for datasets, given there is no history?

## Addendum, 2 November 2026: what happened to the open points

Ticket T2 asked for DataCite coverage and a recommendation that considered asking the HydroShare team. This report, written on 28 October, covered neither. Later work answers part of both; nothing here changes the findings above.

- **Recommendation, as it turned out.** The harvest of 30 October took usage from public pages and OpenAlex, not from the HydroShare team: `agent/reports/261030_cz-usage-harvest.json` holds OpenAlex totals for 1,097 DOIs and HydroShare landing-page views and downloads for 486 resources. Asking the HydroShare team to expose counts (and per-year history) was never raised with them. It stays an option if the rate since creation proves too crude.
- **OpenAlex coverage for the papers in the list** (from `agent/reports/261031_cz-highlights-selection.md`, which I have not re-run): of 1,770 papers, 1,276 have a DOI and 1,265 of those were matched by OpenAlex; 494 have no DOI and 11 DOIs were not matched. Title matching to find a DOI was not tried.
- **DataCite coverage** (from `agent/reports/261031_cz-links.md`, not re-run): asked for 1,276 papers with a DOI, 162 were named by at least one DataCite dataset or software record. This is DataCite as a source of paper-to-dataset links, not of citation counts; DataCite was not tested as a citation source.
- **Still not checked:** HydroShare's terms of use, whether view counts exclude bots, and usage for data held outside HydroShare.
