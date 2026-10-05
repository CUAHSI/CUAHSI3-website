# Parity analysis, stage 0: setup and scope

Fetch date: **5 October 2026** (13:46 UTC). Method and rules: `agent/parity.md` (P1 to P8). Read-only: nothing under `content/`, `pages/` or `components/` was changed, and nothing was created from legacy pages. **Stop for Jordan's approval; no crawl has run.**

Requests made to www.cuahsi.org: **2** (`/robots.txt`, `/sitemap.xml`), 2 seconds apart, one at a time, with the User-Agent `CUAHSI3-parity-check/1.0 (CUAHSI website rebuild, read-only; contact jread@cuahsi.org)`. Saved under `raw/legacy-site/261005/` (gitignored locally only, see D3) with `fetch-log.txt` and the response headers.

## 1. What `robots.txt` and `sitemap.xml` say

**robots.txt: none.** `https://www.cuahsi.org/robots.txt` returns HTTP 404 (an HTML error page, 25,613 bytes, served by Apache with Craft CMS). There are no crawl rules to obey and no `Sitemap:` line. I still propose to follow P2's limits (below).

**sitemap.xml: present.** HTTP 200, 157,620 bytes, `text/xml`, one flat `urlset` (not an index, so there are no child sitemaps).
- **681 URLs**, all unique, all `https://www.cuahsi.org`; 0 with query strings, 0 with fragments, 0 with a trailing slash.
- Every entry has `priority 0.5` and `changefreq weekly`; `lastmod` runs 2022-01-20 to 2026-10-01 and **330 of 681 are 2022 dates**. That looks generated, so I propose to treat `lastmod` as a weak recency signal in stage 6 (P6: my judgment).
- By first path segment: events 119, community 114, students 112, about 110, faculty 77, cyberseminars 68, workshops 23, job-board 16, data-services 10, hydrologic-instrumentation-facilities 10, library 5, and 17 single pages (home, donate, virtual-university, summer-institute, community-awards, travel-policy, and others; 119+114+112+110+77+68+23+16+10+10+5 = 664 in the named sections, 664+17 = 681). Path depth: 1 home, 23 at depth 1, 260 at depth 2, 397 at depth 3.

**The sitemap is not complete.** Test (offline, no extra requests): our own content cites 47 distinct `cuahsi.org` URLs. 9 are `/uploads/` files (a sitemap would not list them). Of the other **38 pages, 28 are in the sitemap and 10 are not** (74% covered): 7 `job-board` pages, 1 cyberseminar series page, 1 `/apply/` page, 1 `/register/` page. Six items checked by reading the saved file (P5): present: `/events/data-publishing-program`, `/community/water-science-exchange`, `/workshops/snow-measurement-field-school-2027`; absent: `/job-board` (the index itself), `/cyberseminars/series/2026-navigating-beyond-academic-waters`, `/apply/watersofthack`. If 74% held across the whole site, the legacy site would have roughly 920 pages (681 divided by 0.74; an extrapolation from a sample of 38, not a count). Stage 1 therefore needs the navigation-and-footer crawl, as `parity.md` already says.

## 2. Proposed tooling (my proposal)

- **Fetching:** a Node script `scripts/parity/fetch.mjs` using the built-in `fetch` (Node 26 here; no dependency). One request at a time, **1.5 s between requests**, the User-Agent above, a 30 s timeout, `Retry-After` honoured. Each response is saved under `raw/legacy-site/YYMMDD/pages/` with a `fetch-log.csv` (url, status, redirect target, bytes, seconds).
- **Parsing:** `scripts/parity/parse.mjs` reads only the snapshot and writes the CSVs (so a re-run is comparable). XML (the sitemap) needs no dependency. **HTML needs a parser: I propose `cheerio` as a devDependency (rule 8: your approval).** Zero-new-dependency alternatives: `parse5` is already installed but only as a dependency of Nuxt's own packages (using it unlisted is fragile; declaring it is still a `package.json` change), and regular expressions are brittle for this job. Neither script runs in CI.
- Everything stays on `task/parity-stageN` code branches, as `parity.md` says; stage 0 is this report on `task/parity-stage0`.

## 3. Crawl size, duration, and where it stops (my estimate)

- **Size:** 681 URLs from the sitemap, plus pages found only through the navigation and footer: about **920 in total if the 74% sample holds**, and more if it does not. I have not fetched a listing page, so I do not yet know the pagination format.
- **Duration:** assuming about 0.7 s per response (the only measured pages were two requests: 0.7 s and 3.7 s) plus the 1.5 s pause, about 2.2 s per page: **681 pages about 25 minutes; about 920 about 34 minutes; the cap (1,500) about 55 minutes.** An assumption, to be replaced by the real rate after the first 50 pages.
- **Scope:** same host only (`www.cuahsi.org`). Start from the sitemap, then follow internal links found in the navigation, the footer and listing pages. **Page cap: 1,500 distinct URLs** (stop and report if exceeded). Strip `#fragments` and `utm_*` parameters; do not follow search or filter query strings. **Listings:** follow pagination links (rel=next or a numbered pager) up to 50 pages per listing and report the pattern found. **Stop rules:** pause and report after 5 consecutive 429 or 5xx responses; stop if more than 5% of requests fail.
- **Files:** `legacy-files.csv` needs a size for each PDF or download; that takes one `HEAD` request per file (no downloads). The 9 of 47 links in our own content that point to `/uploads/` suggest this could be a few hundred requests, about 10 more minutes (an estimate). See D4.

## 4. Out of scope

Other CUAHSI hosts: `www.hydroshare.org`, `jupyter.cuahsi.org`, `data.cuahsi.org`, `water-content-portal.cuahsi.io` (the hosts this repository links to; there may be others), the member portal and anything behind a login, forms (not submitted), and external sites. Links to them are recorded as `external` links, not followed.

## 5. What Jordan can supply

- The 12-month **Search Console export**, clicks and impressions per URL: the strongest importance signal for stage 6, which must say plainly if it is missing.
- **URLs cited in NSF reports.** For the newsletter and content side I can build the list myself, offline: our content already cites 47 distinct `cuahsi.org` URLs (38 pages and 9 files; `content/` only, not the code or older records).
- Whether the legacy site's server redirects can be listed (for stage 7's "no target is itself redirected" check).

## 6. Leads from the sitemap for later stages (not findings)

`/students` has 112 URLs and `/faculty` 77: the nav sections in `parity.md`'s starting observations exist in the path structure (stage 3 decides what they hold). `/cyberseminars` has 68 URLs against the homepage's "over 150 recorded cyberseminars" and the series page we cite is not in the sitemap: the sitemap may undercount cyberseminars (stage 4). The legacy `/job-board` index is not in the sitemap (relevant to the backlog item on past links to it).

## 7. Not examined (P7)

0 pages fetched beyond the two files; 681 sitemap URLs listed, not fetched; no listing, nav or footer examined; no PDFs or downloads opened or sized; no forms, embeds or JavaScript-drawn content seen; no pagination format seen; the 9 `/uploads/` links not tested. Contact details: the sitemap contains none (P8).

## Decisions needed

- **D1.** Approve the crawl parameters in section 3 (1.5 s spacing, cap 1,500, sitemap plus navigation and footer, same host only, pagination rule, stop rules).
- **D2.** Approve `cheerio` as a devDependency (rule 8), or choose another route.
- **D3.** Add `raw/legacy-site/` to `.gitignore` (P2 says gitignored; today it is excluded only by my local `.git/info/exclude`, which does not protect another checkout). One line, with stage 1.
- **D4.** `HEAD` requests for file sizes in stage 1: yes or no.
- **D5.** The User-Agent carries `jread@cuahsi.org` (P2 asks for your contact address); it is now in the legacy site's server log. Confirm, or give another address for later requests.
- **D6.** `agent/parity.md` is untracked in your working tree: commit it with the stage 1 branch, or keep it local?
